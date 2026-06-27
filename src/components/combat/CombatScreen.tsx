import React, { useCallback, useReducer, useRef } from 'react';
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
  totalDefeats: number;
  shieldActive: boolean;
  log: string[];
}

type CombatAction =
  | { type: 'ATTACK_TIMING'; timing: 'perfect' | 'good' | 'miss'; enemyIndex: number }
  | { type: 'USE_SKILL'; skill: Skill; enemyIndex: number }
  | { type: 'ENEMY_ATTACK'; damage: number }
  | { type: 'DEFEND_TIMING'; timing: 'perfect' | 'good' | 'miss'; incomingDamage: number }
  | { type: 'NEXT_TURN' };

function combatReducer(state: CombatState, action: CombatAction): CombatState {
  if (action.type === 'ATTACK_TIMING') {
    const damage = calculateDamage(20, action.timing, 0);
    const newHps = [...state.enemyHps];
    newHps[action.enemyIndex] = clampHp((newHps[action.enemyIndex] ?? 0) - damage);
    const allDead = newHps.every((hp) => hp <= 0);
    return {
      ...state,
      enemyHps: newHps,
      phase: allDead ? 'victory' : 'enemy_turn',
      log: [...state.log, `Hit! ${damage} damage (${action.timing})`],
    };
  }
  if (action.type === 'ENEMY_ATTACK') {
    const newHp = clampHp(state.playerHp - action.damage);
    return {
      ...state,
      playerHp: newHp,
      phase: newHp <= 0 ? 'defeat' : 'player_turn',
      turn: state.turn + 1,
      log: [...state.log, `Enemy hit you for ${action.damage}`],
    };
  }
  if (action.type === 'DEFEND_TIMING') {
    const taken = calculateDefense(action.timing, action.incomingDamage);
    const newHp = clampHp(state.playerHp - taken);
    return {
      ...state,
      playerHp: newHp,
      phase: newHp <= 0 ? 'defeat' : 'player_turn',
      turn: state.turn + 1,
      log: [...state.log, `Defended! Took ${taken} (${action.timing})`],
    };
  }
  if (action.type === 'USE_SKILL') {
    const newHps = [...state.enemyHps];
    const dmg = (action.skill.damage ?? 1) * 22;
    if (action.skill.effect === 'all_damage') {
      for (let i = 0; i < newHps.length; i++) {
        newHps[i] = clampHp((newHps[i] ?? 0) - dmg);
      }
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
    totalDefeats: 0,
    shieldActive: false,
    log: [],
  });

  const attackTimerRef = useRef<number>(0);

  function startAttack(enemyIndex: number) {
    attackTimerRef.current = performance.now();
  }

  function releaseAttack(enemyIndex: number) {
    const elapsed = performance.now() - attackTimerRef.current;
    const timing = getTimingResult(elapsed, 300);
    dispatch({ type: 'ATTACK_TIMING', timing, enemyIndex });
    setTimeout(() => {
      const enemy = enemies[0];
      if (!enemy) return;
      const dmg = enemy.attack ?? 15;
      dispatch({ type: 'ENEMY_ATTACK', damage: dmg });
    }, 800);
  }

  const skills = CHARACTER_SKILLS['kai'];

  if (state.phase === 'victory') {
    setTimeout(onVictory, 1500);
  }
  if (state.phase === 'defeat') {
    setTimeout(onDefeat, 1500);
  }

  return (
    <div className="fixed inset-0 flex flex-col" style={{ backgroundImage: `url(${bgUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <div className="absolute inset-0 bg-black bg-opacity-40" />

      <div className="relative z-10 flex flex-col h-full p-4">
        {/* Enemy HP bars */}
        <div className="flex gap-4 mb-4">
          {enemies.map((enemy, i) => (
            <div key={enemy.id} className="flex-1">
              <div className="text-sakura font-cinzel text-sm">{t(enemy.nameKey, { defaultValue: enemy.id })}</div>
              <div className="h-2 bg-gray-700 rounded mt-1">
                <div
                  className="h-full bg-red-500 rounded transition-all"
                  style={{ width: `${Math.max(0, ((state.enemyHps[i] ?? 0) / enemy.maxHp) * 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Status overlay */}
        {(state.phase === 'victory' || state.phase === 'defeat') && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-60 z-20">
            <div className={`font-cinzel text-5xl ${state.phase === 'victory' ? 'text-celestial-gold' : 'text-red-500'}`}>
              {state.phase === 'victory' ? t('ui.combat.victory', 'VICTORY') : t('ui.combat.defeat', 'DEFEAT')}
            </div>
          </div>
        )}

        {/* Player HP */}
        <div className="mt-auto">
          <div className="text-spirit-blue font-rajdhani text-sm mb-1">HP: {state.playerHp} / {state.playerMaxHp}</div>
          <div className="h-3 bg-gray-700 rounded mb-4">
            <div className="h-full bg-spirit-blue rounded transition-all" style={{ width: `${(state.playerHp / state.playerMaxHp) * 100}%` }} />
          </div>

          {state.phase === 'player_turn' && (
            <div className="flex gap-2 flex-wrap">
              <button
                onMouseDown={() => startAttack(0)}
                onMouseUp={() => releaseAttack(0)}
                onTouchStart={() => startAttack(0)}
                onTouchEnd={() => releaseAttack(0)}
                className="px-5 py-2 bg-celestial-gold text-void font-rajdhani rounded hover:bg-yellow-400 active:scale-95 transition-all"
              >
                {t('ui.combat.attack', 'Attack')}
              </button>
              {skills.map((skill) => (
                <button
                  key={skill.id}
                  onClick={() => dispatch({ type: 'USE_SKILL', skill, enemyIndex: 0 })}
                  className="px-4 py-2 bg-void-purple text-white font-rajdhani rounded hover:bg-purple-700 transition-colors text-sm"
                >
                  {skill.id}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
