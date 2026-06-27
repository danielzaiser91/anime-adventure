import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { getScene } from '../engine/storyEngine';
import { DialogueBox } from './dialogue/DialogueBox';
import { ChoicePanel } from './dialogue/ChoicePanel';
import { CombatScreen } from './combat/CombatScreen';
import { PuzzleScreen } from './puzzles/PuzzleScreen';
import { MinigameRouter } from './minigames/MinigameRouter';
import { ExplorationScreen } from './exploration/ExplorationScreen';
import { CharacterSprite } from './layout/CharacterSprite';
import { StatsHUD } from './ui/StatsHUD';
import { PauseMenu } from './ui/PauseMenu';
import { useScenePreloader } from '../hooks/useScenePreloader';
import { useImageUrl } from '../hooks/useImageUrl';
import { selectEndingScene } from '../store/gameStore';
import type { DialogueLine, GameConsequences, CharacterId, Expression } from '../types/game.types';

function getCharOnSide(
  lines: DialogueLine[],
  upTo: number,
  side: 'left' | 'right'
): { speaker: CharacterId; expression: Expression } | null {
  for (let i = upTo; i >= 0; i--) {
    const line = lines[i];
    if (line && line.characterPosition === side && line.speaker !== 'narrator') {
      return { speaker: line.speaker, expression: line.expression ?? 'neutral' };
    }
  }
  return null;
}

export function SceneController() {
  const store = useGameStore();
  const {
    currentSceneId, dialogueIndex, stats, flags, activeCompanions,
    advanceDialogue, makeChoice, goToScene, applyConsequences, textSpeed,
  } = store;

  const [paused, setPaused] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const scene = getScene(currentSceneId);
  const bgUrl = useImageUrl(scene?.background ?? '');
  useScenePreloader(currentSceneId);

  const lines = scene?.dialogue ?? [];
  const atEnd = dialogueIndex >= lines.length;
  const currentLine = lines[dialogueIndex];

  // Auto-navigate scenes that have no dialogue and no interactive content
  // (e.g. scene_ending_check which exists only to trigger ending determination)
  useEffect(() => {
    if (!scene || !atEnd) return;
    if (scene.choices?.length || scene.combat || scene.puzzle || scene.minigame || scene.exploration) return;
    if (lines.length > 0) return; // scene HAS dialogue, advance is handled by click

    if (scene.nextSceneId) {
      if (scene.onEnter) applyConsequences(scene.onEnter);
      goToScene(scene.nextSceneId);
    } else {
      goToScene(selectEndingScene(flags, stats));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene?.id]);

  const handleDialogueComplete = useCallback(() => {
    if (!scene) return;
    const sceneLines = scene.dialogue ?? [];

    if (dialogueIndex < sceneLines.length - 1) {
      // More dialogue lines remain
      advanceDialogue();
      return;
    }

    // Last line — what comes next?
    if (
      (scene.choices && scene.choices.length > 0) ||
      scene.combat ||
      scene.puzzle ||
      scene.minigame ||
      scene.exploration
    ) {
      // Advance past end so render conditions activate (currentLine becomes undefined)
      advanceDialogue();
    } else if (scene.nextSceneId) {
      if (scene.onEnter) applyConsequences(scene.onEnter);
      goToScene(scene.nextSceneId);
    } else {
      goToScene(selectEndingScene(flags, stats));
    }
  }, [scene, dialogueIndex, advanceDialogue, applyConsequences, goToScene, flags, stats]);

  const handleCombatVictory = useCallback(() => {
    if (!scene?.combat?.onVictory) return;
    applyConsequences(scene.combat.onVictory);
    if (scene.nextSceneId) goToScene(scene.nextSceneId);
    else goToScene(selectEndingScene(flags, stats));
  }, [scene, applyConsequences, goToScene, flags, stats]);

  const handleCombatDefeat = useCallback(() => {
    if (!scene?.combat) return;
    const onDefeat = scene.combat.onDefeat;
    if (!onDefeat) {
      // No onDefeat: default retry, skip pre-combat dialogue
      const skipTo = (scene.dialogue?.length ?? 0);
      useGameStore.setState({ currentSceneId, dialogueIndex: skipTo });
      return;
    }
    if ('retry' in onDefeat) {
      // Retry: return to this scene but skip dialogue, force CombatScreen remount via key
      const skipTo = (scene.dialogue?.length ?? 0);
      setRetryCount((c) => c + 1);
      useGameStore.setState({ currentSceneId, dialogueIndex: skipTo });
    } else if ('nextSceneId' in onDefeat) {
      goToScene(onDefeat.nextSceneId);
    }
  }, [scene, goToScene, currentSceneId]);

  const handlePuzzleSuccess = useCallback(() => {
    if (!scene?.puzzle) return;
    if (scene.puzzle.onSuccess) applyConsequences(scene.puzzle.onSuccess as GameConsequences);
    if (scene.nextSceneId) goToScene(scene.nextSceneId);
    else goToScene(selectEndingScene(flags, stats));
  }, [scene, applyConsequences, goToScene, flags, stats]);

  const handlePuzzleFail = useCallback(() => {
    if (!scene?.puzzle) return;
    if (scene.puzzle.onFail) applyConsequences(scene.puzzle.onFail as GameConsequences);
    // Always advance after puzzle (fail = stat penalty, still continue)
    if (scene.nextSceneId) goToScene(scene.nextSceneId);
    else goToScene(selectEndingScene(flags, stats));
  }, [scene, applyConsequences, goToScene, flags, stats]);

  const handleMinigameComplete = useCallback((success: boolean) => {
    if (!scene?.minigame) return;
    const cons = success ? scene.minigame.onSuccess : scene.minigame.onFail;
    if (cons) applyConsequences(cons as GameConsequences);
    if (scene.nextSceneId) goToScene(scene.nextSceneId);
    else goToScene(selectEndingScene(flags, stats));
  }, [scene, applyConsequences, goToScene, flags, stats]);

  if (!scene) return (
    <div className="fixed inset-0 bg-void flex items-center justify-center">
      <div className="text-red-400 font-cinzel">Scene not found: {currentSceneId}</div>
    </div>
  );

  const showChoices = atEnd && !!scene.choices?.length;
  const showCombat = atEnd && !showChoices && !!scene.combat;
  const showPuzzle = atEnd && !showChoices && !showCombat && !!scene.puzzle;
  const showMinigame = atEnd && !showChoices && !showCombat && !showPuzzle && !!scene.minigame;
  const showExploration = atEnd && !showChoices && !showCombat && !showPuzzle && !showMinigame && !!scene.exploration;

  // Derive visible character sprites from dialogue history
  const idx = atEnd ? lines.length - 1 : dialogueIndex;
  const leftChar = getCharOnSide(lines, idx, 'left');
  const rightChar = getCharOnSide(lines, idx, 'right');
  const activeSpeaker = currentLine?.speaker ?? null;

  return (
    <div className="fixed inset-0">
      <div
        className="absolute inset-0 bg-cover bg-center transition-all duration-700"
        style={{ backgroundImage: bgUrl ? `url(${bgUrl})` : undefined, backgroundColor: !bgUrl ? '#0d0618' : undefined }}
      />
      <div className="absolute inset-0 bg-black bg-opacity-20" />

      {/* Character sprites */}
      {leftChar && !showCombat && !showPuzzle && !showMinigame && (
        <CharacterSprite
          characterId={leftChar.speaker}
          expression={leftChar.expression}
          position="left"
          active={activeSpeaker === leftChar.speaker}
        />
      )}
      {rightChar && !showCombat && !showPuzzle && !showMinigame && (
        <CharacterSprite
          characterId={rightChar.speaker}
          expression={rightChar.expression}
          position="right"
          active={activeSpeaker === rightChar.speaker}
        />
      )}

      <StatsHUD stats={stats} companions={activeCompanions} onPauseClick={() => setPaused(true)} />

      {showCombat && scene.combat && (
        <CombatScreen
          key={`${currentSceneId}-${retryCount}`}
          encounter={scene.combat}
          enemies={scene.combat.enemies}
          playerStats={stats}
          onVictory={handleCombatVictory}
          onDefeat={handleCombatDefeat}
        />
      )}

      {showPuzzle && scene.puzzle && (
        <PuzzleScreen puzzle={scene.puzzle} onSuccess={handlePuzzleSuccess} onFail={handlePuzzleFail} />
      )}

      {showMinigame && scene.minigame && (
        <MinigameRouter minigame={scene.minigame} stats={stats} flags={flags} onComplete={handleMinigameComplete} />
      )}

      {showExploration && scene.exploration && (
        <ExplorationScreen
          exploration={scene.exploration}
          background={scene.background}
          onHotspotActivated={() => {}}
          onContinue={() => { if (scene.nextSceneId) goToScene(scene.nextSceneId); }}
        />
      )}

      {currentLine && !showCombat && !showPuzzle && !showMinigame && !showExploration && (
        <DialogueBox line={currentLine} textSpeed={textSpeed} onComplete={handleDialogueComplete} />
      )}

      {showChoices && scene.choices && (
        <ChoicePanel choices={scene.choices} stats={stats} flags={flags} onSelect={makeChoice} />
      )}

      {paused && <PauseMenu onClose={() => setPaused(false)} />}
    </div>
  );
}
