import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Sparkles, Settings, Users, Gamepad2, MessageSquare, ShoppingBag, Music, ChevronRight } from 'lucide-react';

interface WelcomeUIProps {
  onComplete: () => void;
}

export default function WelcomeUI({ onComplete }: WelcomeUIProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentTip, setCurrentTip] = useState(0);

  const tips = [
    {
      icon: <Users className="h-6 w-6" />,
      title: 'Connect with Friends',
      description: 'Add friends and chat with them in real-time. Share your gaming experiences and stay connected.',
    },
    {
      icon: <Gamepad2 className="h-6 w-6" />,
      title: 'Discover Games',
      description: 'Browse through our game library and find your next favorite game. Track your playtime and achievements.',
    },
    {
      icon: <ShoppingBag className="h-6 w-6" />,
      title: 'Customize Your Avatar',
      description: 'Visit the Marketplace to find unique items for your avatar. Express yourself with style.',
    },
    {
      icon: <Music className="h-6 w-6" />,
      title: 'Listen to Music',
      description: 'Create playlists and listen to your favorite tunes while gaming or browsing.',
    },
  ];

  useEffect(() => {
    // Check if welcome UI was already shown
    const hasSeenWelcome = localStorage.getItem('welcome-ui-seen');
    if (!hasSeenWelcome) {
      setIsOpen(true);
    }
  }, []);

  const handleSkip = () => {
    localStorage.setItem('welcome-ui-seen', 'true');
    setIsOpen(false);
    onComplete();
  };

  const handleNext = () => {
    if (currentTip < tips.length - 1) {
      setCurrentTip(currentTip + 1);
    } else {
      handleSkip();
    }
  };

  const handlePrevious = () => {
    if (currentTip > 0) {
      setCurrentTip(currentTip - 1);
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-2xl p-0">
        <div className="relative">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary/20 via-primary/10 to-transparent p-6 border-b border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-bold text-foreground">Welcome to RazeHub!</DialogTitle>
                  <p className="text-sm text-muted-foreground">Let's get you started with some tips</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={handleSkip}>
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <Card className="border-primary/20">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="h-16 w-16 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    {tips[currentTip].icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      {tips[currentTip].title}
                    </h3>
                    <p className="text-muted-foreground">
                      {tips[currentTip].description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Progress indicators */}
            <div className="flex items-center justify-center gap-2 mt-6">
              {tips.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 rounded-full transition-all ${
                    index === currentTip ? 'w-8 bg-primary' : 'w-2 bg-muted'
                  }`}
                />
              ))}
            </div>

            {/* Quick Settings */}
            <div className="mt-6 p-4 bg-muted/30 rounded-lg border border-border">
              <div className="flex items-center gap-2 mb-3">
                <Settings className="h-5 w-5 text-muted-foreground" />
                <h4 className="font-semibold text-foreground">Quick Settings</h4>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Email notifications</span>
                  <Badge variant="outline">Enabled</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Friend requests</span>
                  <Badge variant="outline">Anyone</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Profile visibility</span>
                  <Badge variant="outline">Public</Badge>
                </div>
              </div>
              <Button variant="link" className="mt-3 p-0 h-auto text-sm">
                Customize in Settings <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-border flex items-center justify-between">
            <Button variant="ghost" onClick={handlePrevious} disabled={currentTip === 0}>
              Previous
            </Button>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={handleSkip}>
                Skip
              </Button>
              <Button onClick={handleNext}>
                {currentTip === tips.length - 1 ? 'Get Started' : 'Next'}
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
