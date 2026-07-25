import { Download, Monitor, Apple, Terminal } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import {
  detectPlatform,
  downloadClientFile,
  getClientDownloadUrls,
  getResolvedPlatform,
  type RazePlayerPlatform,
} from '@/lib/razeplayer';

const PLATFORM_ICONS: Record<Exclude<RazePlayerPlatform, 'unknown'>, typeof Monitor> = {
  windows: Monitor,
  mac: Apple,
  linux: Terminal,
};

interface RazePlayerDownloadButtonProps {
  variant?: 'default' | 'outline' | 'secondary';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
  showSecondary?: boolean;
}

export default function RazePlayerDownloadButton({
  variant = 'default',
  size = 'default',
  className,
  showSecondary = true,
}: RazePlayerDownloadButtonProps) {
  const { t } = useI18n();
  const detected = detectPlatform();
  const platform = getResolvedPlatform();
  const downloads = getClientDownloadUrls(platform);
  const Icon = PLATFORM_ICONS[platform];

  const handlePrimaryDownload = () => {
    if (!downloads.available || !downloads.primaryUrl) return;
    downloadClientFile(downloads.primaryUrl, downloads.primaryName);
  };

  const handleSecondaryDownload = () => {
    if (!downloads.secondaryUrl || !downloads.secondaryName) return;
    downloadClientFile(downloads.secondaryUrl, downloads.secondaryName);
  };

  if (!downloads.available) {
    return (
      <Button variant={variant} size={size} className={className} disabled>
        <Icon className="h-4 w-4 mr-2" />
        {t('download.comingSoon').replace('{platform}', downloads.label)}
      </Button>
    );
  }

  return (
    <div className={`flex flex-col gap-2 ${className ?? ''}`}>
      <Button variant={variant} size={size} onClick={handlePrimaryDownload} disabled={!downloads.primaryUrl}>
        <Download className="h-4 w-4 mr-2" />
        {t('download.button').replace('{platform}', downloads.label)}
      </Button>
      {showSecondary && downloads.secondaryUrl && (
        <Button variant="outline" size="sm" onClick={handleSecondaryDownload}>
          {t('download.secondary').replace('{file}', downloads.secondaryName ?? 'RazePlayer.pck')}
        </Button>
      )}
      {detected !== platform && detected !== 'unknown' && (
        <p className="text-xs text-muted-foreground">{t('download.detectedPlatform').replace('{platform}', downloads.label)}</p>
      )}
    </div>
  );
}
