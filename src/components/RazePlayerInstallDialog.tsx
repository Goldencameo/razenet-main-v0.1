import { Link } from 'react-router-dom';
import { Download } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface RazePlayerInstallDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function RazePlayerInstallDialog({ open, onOpenChange }: RazePlayerInstallDialogProps) {
  const { t } = useI18n();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('razeplayer.notInstalledTitle')}</DialogTitle>
          <DialogDescription>{t('razeplayer.notInstalledDesc')}</DialogDescription>
        </DialogHeader>
        <div className="flex gap-3">
          <Button asChild className="flex-1">
            <Link to="/download">
              <Download className="h-4 w-4 mr-2" />
              {t('razeplayer.downloadCta')}
            </Link>
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('game.cancel')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
