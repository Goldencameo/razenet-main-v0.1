export type RazePlayerPlatform = 'windows' | 'mac' | 'linux' | 'unknown';

const CLIENT_FILES: Record<
  Exclude<RazePlayerPlatform, 'unknown'>,
  { primary: string; secondary?: string; label: string; available: boolean }
> = {
  windows: {
    primary: 'https://github.com/Goldencameo/razenet-main-v0.1/releases/download/v1.0.0/RazePlayer.exe',
    secondary: 'https://github.com/Goldencameo/razenet-main-v0.1/releases/download/v1.0.0/RazePlayer.pck',
    label: 'Windows',
    available: true,
  },
  mac: {
    primary: 'mac/RazePlayer.zip',
    label: 'macOS',
    available: false,
  },
  linux: {
    primary: 'linux/RazePlayer.x86_64',
    secondary: 'linux/RazePlayer.pck',
    label: 'Linux',
    available: false,
  },
};

export function detectPlatform(): RazePlayerPlatform {
  if (typeof navigator === 'undefined') return 'unknown';

  const platform = navigator.platform?.toLowerCase() ?? '';
  const ua = navigator.userAgent.toLowerCase();

  if (platform.includes('win') || ua.includes('windows')) return 'windows';
  if (platform.includes('mac') || ua.includes('macintosh') || ua.includes('mac os')) return 'mac';
  if (platform.includes('linux') || ua.includes('linux')) return 'linux';
  return 'unknown';
}

export function getResolvedPlatform(): Exclude<RazePlayerPlatform, 'unknown'> {
  const detected = detectPlatform();
  return detected === 'unknown' ? 'windows' : detected;
}

export function getClientDownloadUrls(platform: Exclude<RazePlayerPlatform, 'unknown'>) {
  const files = CLIENT_FILES[platform];
  return {
    platform,
    label: files.label,
    available: files.available,
    primaryUrl: files.primary,
    primaryName: files.primary.split('/').pop() ?? 'RazePlayer',
    secondaryUrl: files.secondary,
    secondaryName: files.secondary?.split('/').pop(),
  };
}

export function buildRazePlayerLaunchUrl(gameId: string, accessToken?: string): string {
  const params = new URLSearchParams({ id: gameId });
  if (accessToken) params.set('token', accessToken);
  return `razeplayer://game?${params.toString()}`;
}

const PROTOBE_TIMEOUT_MS = 2500;

export function probeRazePlayerProtocol(launchUrl: string): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(false);
      return;
    }

    let settled = false;

    const finish = (installed: boolean) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      window.removeEventListener('blur', onBlur);
      document.removeEventListener('visibilitychange', onVisibility);
      resolve(installed);
    };

    const onBlur = () => finish(true);
    const onVisibility = () => {
      if (document.hidden) finish(true);
    };

    window.addEventListener('blur', onBlur);
    document.addEventListener('visibilitychange', onVisibility);

    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = launchUrl;
    document.body.appendChild(iframe);

    window.setTimeout(() => iframe.remove(), PROTOBE_TIMEOUT_MS + 500);

    const timer = window.setTimeout(() => finish(false), PROTOBE_TIMEOUT_MS);

    window.location.href = launchUrl;
  });
}

export async function launchRazePlayerGame(gameId: string, accessToken?: string): Promise<boolean> {
  const launchUrl = buildRazePlayerLaunchUrl(gameId, accessToken);
  return probeRazePlayerProtocol(launchUrl);
}

export function downloadClientFile(url: string, filename: string) {
  if (!url) return;
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = 'noopener';
  anchor.target = '_blank';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
}