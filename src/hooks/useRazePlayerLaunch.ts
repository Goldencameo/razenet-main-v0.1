import { useCallback, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { launchRazePlayerGame } from '@/lib/razeplayer';

export function useRazePlayerLaunch() {
  const { session } = useAuth();
  const [launching, setLaunching] = useState(false);
  const [showInstallModal, setShowInstallModal] = useState(false);

  const playGame = useCallback(async (gameId: string) => {
    if (!gameId || launching) return false;

    setLaunching(true);
    try {
      const installed = await launchRazePlayerGame(gameId, session?.access_token);
      if (!installed) {
        setShowInstallModal(true);
      }
      return installed;
    } finally {
      setLaunching(false);
    }
  }, [launching, session?.access_token]);

  return {
    playGame,
    launching,
    showInstallModal,
    setShowInstallModal,
  };
}
