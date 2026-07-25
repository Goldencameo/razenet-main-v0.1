import { Link } from 'react-router-dom';
import { ArrowLeft, Monitor, Apple, Terminal, CheckCircle2 } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { useDocumentTitle } from '@/components/DocumentTitle';
import RazePlayerDownloadButton from '@/components/RazePlayerDownloadButton';
import { Button } from '@/components/ui/button';
import {
  detectPlatform,
  getClientDownloadUrls,
  type RazePlayerPlatform,
} from '@/lib/razeplayer';

const PLATFORMS: Exclude<RazePlayerPlatform, 'unknown'>[] = ['windows', 'mac', 'linux'];

const PLATFORM_META = {
  windows: { icon: Monitor, title: 'Windows' },
  mac: { icon: Apple, title: 'macOS' },
  linux: { icon: Terminal, title: 'Linux' },
} as const;

export default function Download() {
  const { t } = useI18n();
  const detected = detectPlatform();

  useDocumentTitle(t('download.pageTitle'));

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto">
      <Link
        to="/home"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        {t('game.back')}
      </Link>

      <div className="rounded-2xl border border-border bg-gradient-to-br from-primary/10 via-background to-background p-6 sm:p-8 mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">{t('download.heading')}</h1>
        <p className="text-muted-foreground mb-6">{t('download.subheading')}</p>

        <RazePlayerDownloadButton size="lg" className="max-w-sm" />

        <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 mt-0.5 text-primary shrink-0" />
            {t('download.bulletOne')}
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 mt-0.5 text-primary shrink-0" />
            {t('download.bulletTwo')}
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 mt-0.5 text-primary shrink-0" />
            {t('download.bulletThree')}
          </li>
        </ul>
      </div>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">{t('download.allPlatforms')}</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {PLATFORMS.map((platform) => {
            const meta = PLATFORM_META[platform];
            const info = getClientDownloadUrls(platform);
            const Icon = meta.icon;
            const isDetected = detected === platform;

            return (
              <div
                key={platform}
                className={`rounded-xl border p-4 ${isDetected ? 'border-primary/40 bg-primary/5' : 'border-border'}`}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Icon className="h-5 w-5 text-primary" />
                  <h3 className="font-medium text-foreground">{meta.title}</h3>
                  {isDetected && (
                    <span className="text-[10px] uppercase tracking-wide text-primary font-semibold">
                      {t('download.detected')}
                    </span>
                  )}
                </div>

                {info.available ? (
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      asChild
                      disabled={!info.primaryUrl}
                    >
                      <a href={info.primaryUrl} download={info.primaryName} target="_blank" rel="noopener noreferrer">
                        {info.primaryName}
                      </a>
                    </Button>
                    {info.secondaryUrl && (
                      <Button variant="ghost" size="sm" className="w-full" asChild>
                        <a href={info.secondaryUrl} download={info.secondaryName} target="_blank" rel="noopener noreferrer">
                          {info.secondaryName}
                        </a>
                      </Button>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">{t('download.comingSoon').replace('{platform}', meta.title)}</p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <p className="text-xs text-muted-foreground mt-8">{t('download.installerNote')}</p>
    </div>
  );
}
