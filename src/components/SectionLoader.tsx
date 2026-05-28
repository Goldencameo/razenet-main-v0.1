import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

interface SectionLoaderProps {
  isLoading: boolean;
  children: React.ReactNode;
}

export default function SectionLoader({ isLoading, children }: SectionLoaderProps) {
  const [showLoader, setShowLoader] = useState(false);

  useEffect(() => {
    if (isLoading) {
      setShowLoader(true);
    } else {
      // Keep loader visible for at least 300ms to prevent flickering
      const timeout = setTimeout(() => {
        setShowLoader(false);
      }, 300);
      return () => clearTimeout(timeout);
    }
  }, [isLoading]);

  if (showLoader) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
