import React, { useEffect, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { useGameStore } from './store/gameStore';
import { TitleScreen } from './components/screens/TitleScreen';
import { OnboardingScreen } from './components/screens/OnboardingScreen';
import { SceneController } from './components/SceneController';
import { EndingScreen } from './components/screens/EndingScreen';
import { LoadingScreen } from './components/ui/LoadingScreen';
import { UpdatePrompt } from './components/ui/UpdatePrompt';
import { ErrorBoundary } from './components/layout/ErrorBoundary';
import { startAutosave, stopAutosave } from './store/gameStore';
import { useImagePreloader } from './hooks/useImagePreloader';
import { IMAGE_URLS } from './data/imageUrls';

const CRITICAL_IMAGES = [IMAGE_URLS['logo'], IMAGE_URLS['loading_art']].filter(Boolean) as string[];
const ENDING_SCENE_IDS = new Set([
  'scene_ending_celestial_harmony',
  'scene_ending_blade_of_justice',
  'scene_ending_sacrifice',
]);

export function App() {
  const { currentPhase, currentSceneId, language } = useGameStore();
  const { ready, progress } = useImagePreloader(CRITICAL_IMAGES);
  const [showUpdate, setShowUpdate] = useState(false);

  const { updateServiceWorker } = useRegisterSW({
    onNeedRefresh() { setShowUpdate(true); },
    onOfflineReady() {},
  });

  useEffect(() => {
    startAutosave();
    return () => stopAutosave();
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  if (!ready && CRITICAL_IMAGES.length > 0) {
    return <LoadingScreen progress={progress} />;
  }

  const isEnding = ENDING_SCENE_IDS.has(currentSceneId);

  return (
    <ErrorBoundary>
      {currentPhase === 'title' && <TitleScreen />}
      {currentPhase === 'onboarding' && <OnboardingScreen />}
      {currentPhase === 'playing' && !isEnding && <SceneController />}
      {currentPhase === 'playing' && isEnding && <EndingScreen sceneId={currentSceneId} />}
      {showUpdate && (
        <UpdatePrompt
          onUpdate={() => { updateServiceWorker(true); setShowUpdate(false); }}
          onDismiss={() => setShowUpdate(false)}
        />
      )}
    </ErrorBoundary>
  );
}

export default App;
