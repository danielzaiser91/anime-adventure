import React, { useCallback, useEffect, useReducer, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import type { CombatEncounter, Enemy, GameStats, Skill } from '../../types/game.types';
import { getTimingResult, calculateDamage, calculateDefense, clampHp } from '../../engine/combatEngine';
import { CHARACTER_SKILLS } from '../../data/characters';
import { useImageUrl } from '../../hooks/useImageUrl';

interface CombatState {
  phase: 'player_turn' | 'enemy_turn' | 'victory' | 'defeat';
  playerHp: number;
  playerMaxHp: number;
  enemyHps: number[];
  turn: number;
  shieldActive: boolean;
  log: string[];
}

type CombatAction =
  | { type: 'ATTACK_TIMING'; timing: 'perfect' | 'good' | 'miss'; enemyIndex: number }
  | { type: 'USE_SKILL'; skill: Skill; enemyIndex: number }
  | { type: 'ENEMY_ATTACK'; damage: number }
  | { type: 'DEFEND_TIMING'; timing: 'perfect' | 'good' | 'miss'; incomingDamage: number };

function combatReducer(state: CombatState, action: CombatAction): CombatState {
  if (state.phase === 'victory' || state.phase === 'defeat') return state;

  if (action.type === 'ATTACK_TIMING') {
    const damage = calculateDamage(20, action.timing, 0);
    const newHps = [...state.enemyHps];
    newHps[action.enemyIndex] = clampHp((newHps[action.enemyIndex] ?? 0) - damage);
    const allDead = newHps.every((hp) => hp <= 0);
    return {
      ...state,
      enemyHps: newHps,
      phase: allDead ? 'victory' : 'enemy_turn',
      log: [...state.log, `Hit! ${damage} dmg (${action.timing})`],
    };
  }
  if (action.type === 'ENEMY_ATTACK') {
    const taken = state.shieldActive ? Math.round(action.damage * 0.25) : action.damage;
    const newHp = clampHp(state.playerHp - taken);
    return {
      ...state,
      playerHp: newHp,
      shieldActive: false,
      phase: newHp <= 0 ? 'defeat' : 'player_turn',
      turn: state.turn + 1,
      log: [...state.log, `Enemy hit: ${taken} dmg`],
    };
  }
  if (action.type === 'DEFEND_TIMING') {
    const taken = calculateDefense(action.timing, action.incomingDamage);
    const newHp = clampHp(state.playerHp - taken);
    return {
      ...state,
      playerHp: newHp,
      shieldActive: action.timing === 'perfect',
      phase: newHp <= 0 ? 'defeat' : 'player_turn',
      turn: state.turn + 1,
      log: [...state.log, `Defended: ${taken} dmg (${action.timing})`],
    };
  }
  if (action.type === 'USE_SKILL') {
    const newHps = [...state.enemyHps];
    const dmg = (action.skill.damage ?? 1) * 22;
    if (action.skill.effect === 'all_damage') {
      newHps.forEach((_, i) => { newHps[i] = clampHp((newHps[i] ?? 0) - dmg); });
    } else if (action.skill.effect === 'shield') {
      return { ...state, shieldActive: true, phase: 'enemy_turn', log: [...state.log, 'Shield active!'] };
    } else {
      newHps[action.enemyIndex] = clampHp((newHps[action.enemyIndex] ?? 0) - dmg);
    }
    const allDead = newHps.every((hp) => hp <= 0);
    return {
      ...state,
      enemyHps: newHps,
      phase: allDead ? 'victory' : 'enemy_turn',
      log: [...state.log, `Skill: ${action.skill.id}`],
    };
  }
  return state;
}

interface Props {
  encounter: CombatEncounter;
  enemies: Enemy[];
  playerStats: GameStats;
  onVictory: () => void;
  onDefeat: () => void;
}

export function CombatScreen({ encounter, enemies, playerStats, onVictory, onDefeat }: Props) {
  const { t } = useTranslation();
  const bgUrl = useImageUrl(encounter.backgroundId);

  const [state, dispatch] = useReducer(combatReducer, {
    phase: 'player_turn',
    playerHp: 100 + playerStats.spirit,
    playerMaxHp: 100 + playerStats.spirit,
    enemyHps: enemies.map((e) => e.hp),
    turn: 0,
    shieldActive: false,
    log: [],
  });

  const phaseRef = useRef(state.phase);
  useEffect(() => { phaseRef.current = state.phase; }, [state.phase]);

  // Victory / defeat transitions — useEffect, not render body
  useEffect(() => {
    if (state.phase === 'victory') {
      const t = setTimeout(onVictory, 1500);
      return () => clearTimeout(t);
    }
    if (state.phase === 'defeat') {
      const t = setTimeout(onDefeat, 1500);
      return () => clearTimeout(t);
    }
  }, [state.phase, onVictory, onDefeat]);

  // Enemy turn: auto-attack after player acts
  useEffect(() => {
    if (state.phase !== 'enemy_turn') return;
    const timer = setTimeout(() => {
      if (phaseRef.current !== 'enemy_turn') return;
      const enemy = enemies[0];
      if (!enemy) return;
      dispatch({ type: 'ENEMY_ATTACK', damage: enemy.attack ?? 15 });
    }, 800);
    return () => clearTimeout(timer);
  }, [state.phase, state.turn, enemies]);

  const attackTimerRef = useRef<number>(0);

  function startAttack() {
    attackTimerRef.current = performance.now();
  }

  function releaseAttack(enemyIndex: number) {
    if (state.phase !== 'player_turn') return;
    const elapsed = performance.now() - attackTimerRef.current;
    const timing = getTimingResult(elapsed, 300);
    dispatch({ type: 'ATTACK_TIMING', timing, enemyIndex });
  }

  const skills = CHARACTER_SKILLS['kai'] ?? [];

  return (
    <div className="fixed inset-0 flex flex-col z-20"
      style={{ backgroundImage: bgUrl ? `url(${bgUrl})` : undefined, backgroundSize: 'cover', backgroundPosition: 'center', backgroundColor: !bgUrl ? '#0d0618' : undefined }}>
      <div className="absolute inset-0 bg-black bg-opacity-40" />

      <div className="relative z-10 flex flex-col h-full p-4 pt-16">
        {/* Enemy HP bars */}
        <div className="flex gap-4 mb-4">
          {enemies.map((enemy, i) => (
            <div key={enemy.id} className="flex-1">
              <div className="text-sakura font-cinzel text-sm">{t(enemy.nameKey, { defaultValue: enemy.id })}</div>
              <div className="h-2 bg-gray-700 rounded mt-1">
                <div
                  className="h-full bg-red-500 rounded transition-all duration-300"
                  style={{ width: `${Math.max(0, ((state.enemyHps[i] ?? 0) / enemy.maxHp) * 100)}%` }}
                />
              </div>
              <div className="text-red-400 font-rajdhani text-xs">{state.enemyHps[i] ?? 0} / {enemy.maxHp}</div>
            </div>
          ))}
        </div>

        {/* Combat log (last 3 lines) */}
        <div className="flex-1 flex flex-col justify-end gap-0.5 mb-2">
          {state.log.slice(-3).map((entry, i) => (
            <div key={i} className="text-gray-400 font-rajdhani text-xs">{entry}</div>
          ))}
        </div>

        {/* Victory / Defeat overlay */}
        {(state.phase === 'victory' || state.phase === 'defeat') && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-60 z-30">
            <div className={`font-cinzel text-5xl animate-pulse ${state.phase === 'victory' ? 'text-celestial-gold' : 'text-red-500'}`}>
              {state.phase === 'victory' ? t('combat.victory') : t('combat.defeat')}
            </div>
          </div>
        )}

        {/* Player HP */}
        <div className="mt-2">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-spirit-blue font-rajdhani text-sm">HP</span>
            <div className="flex-1 h-3 bg-gray-700 rounded">
              <div className="h-full bg-spirit-blue rounded transition-all duration-300" style={{ width: `${(state.playerHp / state.playerMaxHp) * 100}%` }} />
            </div>
            <span className="text-spirit-blue font-rajdhani text-sm">{state.playerHp}/{state.playerMaxHp}</span>
          </div>

          {state.phase === 'player_turn' && (
            <div className="flex gap-2 flex-wrap mt-3">
              <button
                onMouseDown={startAttack}
                onMouseUp={() => releaseAttack(0)}
                onTouchStart={startAttack}
                onTouchEnd={() => releaseAttack(0)}
                className="px-5 py-3 bg-celestial-gold text-void font-rajdhani rounded hover:bg-yellow-400 active:scale-95 transition-all select-none"
              >
                {t('combat.attack')}
                <div className="text-xs opacity-70">{t('combat.holdRelease')}</div>
              </button>
              {skills.map((skill) => (
                <button
                  key={skill.id}
                  onClick={() => dispatch({ type: 'USE_SKILL', skill, enemyIndex: 0 })}
                  className="px-4 py-3 bg-void-purple text-white font-rajdhani rounded hover:bg-purple-700 transition-colors text-sm"
                >
                  {skill.id}
                  {skill.damage && <span className="ml-1 text-celestial-gold text-xs">×{skill.damage}</span>}
                </button>
              ))}
            </div>
          )}

          {state.phase === 'enemy_turn' && (
            <div className="text-sakura font-cinzel text-sm animate-pulse mt-3">
              {t('combat.enemyTurn')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
