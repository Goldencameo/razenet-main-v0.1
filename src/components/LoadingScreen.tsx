import { useEffect, useState } from 'react';

export default function LoadingScreen() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
        <p className="text-sm text-muted-foreground animate-pulse">Loading...</p>
      </div>
    </div>
  );
}
