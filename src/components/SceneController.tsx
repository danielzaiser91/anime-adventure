import React, { useCallback, useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { getScene } from '../engine/storyEngine';
import { DialogueBox } from './dialogue/DialogueBox';
import { ChoicePanel } from './dialogue/ChoicePanel';
import { CombatScreen } from './combat/CombatScreen';
import { PuzzleScreen } from './puzzles/PuzzleScreen';
import { MinigameRouter } from './minigames/MinigameRouter';
import { ExplorationScreen } from './exploration/ExplorationScreen';
import { StatsHUD } from './ui/StatsHUD';
import { PauseMenu } from './ui/PauseMenu';
import { useScenePreloader } from '../hooks/useScenePreloader';
import { useImageUrl } from '../hooks/useImageUrl';
import { selectEndingScene } from '../store/gameStore';
import type { GameConsequences } from '../types/game.types';

export function SceneController() {
  const store = useGameStore();
  const {
    currentSceneId, dialogueIndex, stats, flags, activeCompanions,
    advanceDialogue, makeChoice, goToScene, applyConsequences, textSpeed,
  } = store;

  const [paused, setPaused] = useState(false);
  const scene = getScene(currentSceneId);
  const bgUrl = useImageUrl(scene?.background ?? '');
  useScenePreloader(currentSceneId);

  const handleDialogueComplete = useCallback(() => {
    if (!scene) return;
    const lines = scene.dialogue ?? [];
    if (dialogueIndex < lines.length - 1) {
      advanceDialogue();
    } else if (scene.choices && scene.choices.length > 0) {
      // wait for choice
    } else if (scene.combat) {
      // wait for combat
    } else if (scene.puzzle) {
      // wait for puzzle
    } else if (scene.minigame) {
      // wait for minigame
    } else if (scene.exploration) {
      // wait for exploration
    } else if (scene.nextSceneId) {
      if (scene.onEnter) applyConsequences(scene.onEnter);
      goToScene(scene.nextSceneId);
    } else {
      // ending — determine which
      const endingId = selectEndingScene(flags, stats);
      goToScene(endingId);
    }
  }, [scene, dialogueIndex, advanceDialogue, applyConsequences, goToScene, flags, stats]);

  const handleCombatVictory = useCallback(() => {
    if (!scene?.combat?.onVictory) return;
    applyConsequences(scene.combat.onVictory);
    if (scene.nextSceneId) goToScene(scene.nextSceneId);
  }, [scene, applyConsequences, goToScene]);

  const handleCombatDefeat = useCallback(() => {
    if (!scene?.combat) return;
    const onDefeat = scene.combat.onDefeat;
    if (!onDefeat) return;
    if ('retry' in onDefeat) {
      // reload scene (retry)
      goToScene(currentSceneId);
    } else if ('nextSceneId' in onDefeat) {
      goToScene(onDefeat.nextSceneId);
    }
  }, [scene, goToScene, currentSceneId]);

  const handlePuzzleSuccess = useCallback(() => {
    if (!scene?.puzzle) return;
    if (scene.puzzle.onSuccess) applyConsequences(scene.puzzle.onSuccess as GameConsequences);
    if (scene.nextSceneId) goToScene(scene.nextSceneId);
  }, [scene, applyConsequences, goToScene]);

  const handlePuzzleFail = useCallback(() => {
    if (!scene?.puzzle?.onFail) return;
    applyConsequences(scene.puzzle.onFail as GameConsequences);
    if (scene.nextSceneId) goToScene(scene.nextSceneId);
  }, [scene, applyConsequences, goToScene]);

  const handleMinigameComplete = useCallback((success: boolean) => {
    if (!scene?.minigame) return;
    const cons = success ? scene.minigame.onSuccess : undefined;
    if (cons) applyConsequences(cons as GameConsequences);
    if (scene.nextSceneId) goToScene(scene.nextSceneId);
  }, [scene, applyConsequences, goToScene]);

  if (!scene) return (
    <div className="fixed inset-0 bg-void flex items-center justify-center">
      <div className="text-red-400 font-cinzel">Scene not found: {currentSceneId}</div>
    </div>
  );

  const lines = scene.dialogue ?? [];
  const currentLine = lines[dialogueIndex];
  const showChoices = !currentLine && scene.choices && scene.choices.length > 0;
  const showCombat = !currentLine && !showChoices && scene.combat;
  const showPuzzle = !currentLine && !showChoices && !showCombat && scene.puzzle;
  const showMinigame = !currentLine && !showChoices && !showCombat && !showPuzzle && scene.minigame;
  const showExploration = !currentLine && !showChoices && !showCombat && !showPuzzle && !showMinigame && scene.exploration;

  return (
    <div className="fixed inset-0">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-all duration-700"
        style={{ backgroundImage: bgUrl ? `url(${bgUrl})` : undefined, backgroundColor: !bgUrl ? '#0d0618' : undefined }}
      />
      <div className="absolute inset-0 bg-black bg-opacity-20" />

      <StatsHUD stats={stats} companions={activeCompanions} onPauseClick={() => setPaused(true)} />

      {showCombat && scene.combat && (
        <CombatScreen
          encounter={scene.combat}
          enemies={scene.combat.enemies}
          playerStats={stats}
          onVictory={handleCombatVictory}
          onDefeat={handleCombatDefeat}
        />
      )}

      {showPuzzle && scene.puzzle && (
        <PuzzleScreen
          puzzle={scene.puzzle}
          onSuccess={handlePuzzleSuccess}
          onFail={handlePuzzleFail}
        />
      )}

      {showMinigame && scene.minigame && (
        <MinigameRouter
          minigame={scene.minigame}
          stats={stats}
          flags={flags}
          onComplete={handleMinigameComplete}
        />
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
        <DialogueBox
          line={currentLine}
          textSpeed={textSpeed}
          onComplete={handleDialogueComplete}
        />
      )}

      {showChoices && scene.choices && (
        <ChoicePanel
          choices={scene.choices}
          stats={stats}
          flags={flags}
          onSelect={makeChoice}
        />
      )}

      {paused && <PauseMenu onClose={() => setPaused(false)} />}
    </div>
  );
}
