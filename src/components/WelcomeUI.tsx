import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Sparkles, Shield, Users, Settings, ChevronRight, Check, Scroll, Palette, Globe } from 'lucide-react';
import { useI18n, Language } from '@/lib/i18n';
import { useTheme } from '@/lib/theme';

interface WelcomeUIProps {
  onComplete: () => void;
  preAcceptRules?: boolean;
  forceOpen?: boolean;
}

const LANGUAGES: { code: Language; name: string; flag: string }[] = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'zh', name: '简体中文', flag: '🇨🇳' },
  { code: 'pt', name: 'Português', flag: '🇧🇷' },
];

const AVATAR_COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

export default function WelcomeUI({ onComplete, preAcceptRules = false, forceOpen = false }: WelcomeUIProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<'welcome' | 'rules' | 'comfort'>('welcome');
  const [hasScrolledRules, setHasScrolledRules] = useState(false);
  const [acceptedRules, setAcceptedRules] = useState(false);
  const [showSkipWarning, setShowSkipWarning] = useState(false);
  const [selectedAvatarColor, setSelectedAvatarColor] = useState('#3B82F6');
  const [selectedBannerColor1, setSelectedBannerColor1] = useState('#3B82F6');
  const [selectedBannerColor2, setSelectedBannerColor2] = useState('#6366F1');
  const [selectedBannerStyle, setSelectedBannerStyle] = useState<'solid' | 'gradient'>('gradient');
  const rulesRef = useRef<HTMLDivElement>(null);
  const { t, language, setLanguage } = useI18n();
  const { theme, setTheme } = useTheme();

  const steps = ['welcome', 'rules', 'comfort'] as const;
  const currentStepIndex = steps.indexOf(step);

  useEffect(() => {
    // Check if welcome UI was already shown (check both old and new keys)
    const hasSeenWelcome = localStorage.getItem('welcome_seen') || localStorage.getItem('welcome-ui-seen');
    // Load saved avatar color if exists
    const savedAvatarColor = localStorage.getItem('avatar_color');
    if (savedAvatarColor) {
      setSelectedAvatarColor(savedAvatarColor);
      setSelectedBannerColor1(savedAvatarColor);
    }
    if (!hasSeenWelcome || forceOpen) {
      setIsOpen(true);
    }
  }, [forceOpen]);

  useEffect(() => {
    if (preAcceptRules) {
      setAcceptedRules(true);
      setHasScrolledRules(true);
    }
  }, [preAcceptRules]);

  const handleComplete = () => {
    localStorage.setItem('welcome_seen', 'true');
    localStorage.setItem('avatar_color', selectedAvatarColor);
    localStorage.setItem('banner_color1', selectedBannerColor1);
    localStorage.setItem('banner_color2', selectedBannerColor2);
    localStorage.setItem('banner_style', selectedBannerStyle);
    setIsOpen(false);
    onComplete();
  };

  const handleSkip = () => {
    setShowSkipWarning(true);
  };

  const handleConfirmSkip = () => {
    setShowSkipWarning(false);
    handleComplete();
  };

  const handleRulesScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    // More strict check - must be scrolled to within 2px of the bottom
    if (target.scrollHeight - target.scrollTop - target.clientHeight <= 2) {
      setHasScrolledRules(true);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => {
        if (!open && step !== 'comfort') {
          setShowSkipWarning(true);
        } else if (!open) {
          handleComplete();
        }
        setIsOpen(open);
      }}>
        <DialogContent className="max-w-3xl p-0 flex flex-col max-h-[90vh]">
          <div className="flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary/20 via-primary/10 to-transparent p-4 md:p-6 border-b border-border flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <Sparkles className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl md:text-2xl font-bold text-foreground">Welcome to RazeHub</h2>
                    <p className="text-xs md:text-sm text-muted-foreground">
                      {step === 'welcome' && 'Your journey begins here'}
                      {step === 'rules' && 'Community Guidelines'}
                      {step === 'comfort' && 'Personalize Your Experience'}
                    </p>
                  </div>
                </div>
                {/* Progress indicator */}
                <div className="flex items-center gap-2 bg-muted/50 px-3 py-1.5 rounded-full">
                  <span className="text-xs font-medium text-foreground">{currentStepIndex + 1}/3</span>
                  <div className="flex gap-1">
                    {steps.map((s, i) => (
                      <div
                        key={s}
                        className={`h-1.5 rounded-full transition-all ${
                          i <= currentStepIndex ? 'w-4 bg-primary' : 'w-1.5 bg-muted'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 md:p-6 overflow-y-auto max-h-[60vh]">
              {step === 'welcome' && (
                <div className="space-y-4 md:space-y-6">
                  <Card className="border-primary/20">
                    <CardContent className="p-4 md:p-6">
                      <div className="flex items-start gap-3 md:gap-4">
                        <div className="h-12 w-12 md:h-16 md:w-16 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Users className="h-6 w-6 md:h-8 md:w-8 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2">
                            A Platform for Players & Developers
                          </h3>
                          <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                            RazeHub is designed to provide a comfortable, interesting, and safe experience for everyone.
                            Whether you're here to play games, create content, or connect with others, we've built this
                            platform with you in mind.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-primary/20">
                    <CardContent className="p-4 md:p-6">
                      <div className="flex items-start gap-3 md:gap-4">
                        <div className="h-12 w-12 md:h-16 md:w-16 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Shield className="h-6 w-6 md:h-8 md:w-8 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2">
                            Create & Share Freely
                          </h3>
                          <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                            You can create and upload games for free and share your creations with the entire community.
                            However, we maintain strict rules for game publishing to ensure quality and safety for all users.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 md:p-4">
                    <p className="text-xs md:text-sm text-amber-800 dark:text-amber-300">
                      <strong>Important:</strong> Please read and understand our community rules before continuing.
                      Your agreement is required to use the platform.
                    </p>
                  </div>
                </div>
              )}

              {step === 'rules' && (
                <div className="space-y-4">
                  <div
                    ref={rulesRef}
                    onScroll={handleRulesScroll}
                    className="bg-muted/30 border border-border rounded-lg p-4 md:p-6 max-h-[400px] overflow-y-auto"
                  >
                    <h3 className="text-base md:text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                      <Scroll className="h-4 w-4 md:h-5 md:w-5" />
                      Community Rules & Guidelines
                    </h3>

                    <div className="space-y-3 md:space-y-4 text-xs md:text-sm text-muted-foreground">
                      <div className="border-b border-border pb-3 md:pb-4">
                        <h4 className="font-medium text-foreground mb-2">1. Respect All Users</h4>
                        <p className="leading-relaxed">
                          Treat everyone with respect and kindness. Harassment, hate speech, and discriminatory behavior
                          will not be tolerated. We're building a community where everyone feels welcome.
                        </p>
                      </div>

                      <div className="border-b border-border pb-3 md:pb-4">
                        <h4 className="font-medium text-foreground mb-2">2. Content Standards</h4>
                        <p className="leading-relaxed">
                          All uploaded content must comply with our guidelines. Games with inappropriate content,
                          malware, or copyright violations will be removed immediately. Repeat violations may result in
                          account suspension.
                        </p>
                      </div>

                      <div className="border-b border-border pb-3 md:pb-4">
                        <h4 className="font-medium text-foreground mb-2">3. Fair Play</h4>
                        <p className="leading-relaxed">
                          Cheating, exploiting, or using third-party software to gain unfair advantages is prohibited.
                          We maintain a fair gaming environment for all players.
                        </p>
                      </div>

                      <div className="border-b border-border pb-3 md:pb-4">
                        <h4 className="font-medium text-foreground mb-2">4. Privacy & Security</h4>
                        <p className="leading-relaxed">
                          Respect the privacy of others. Do not share personal information without consent. Attempting to
                          access other users' accounts or data is strictly prohibited.
                        </p>
                      </div>

                      <div className="border-b border-border pb-3 md:pb-4">
                        <h4 className="font-medium text-foreground mb-2">5. Intellectual Property</h4>
                        <p className="leading-relaxed">
                          Only upload content you have the right to share. Respect copyright and trademark laws.
                          Plagiarism or unauthorized use of others' work will result in content removal.
                        </p>
                      </div>

                      <div className="border-b border-border pb-3 md:pb-4">
                        <h4 className="font-medium text-foreground mb-2">6. Reporting Issues</h4>
                        <p className="leading-relaxed">
                          Help us keep the platform safe by reporting violations, bugs, or suspicious activity. Your
                          reports help us maintain a positive community.
                        </p>
                      </div>

                      <div>
                        <h4 className="font-medium text-foreground mb-2">7. Account Responsibility</h4>
                        <p className="leading-relaxed">
                          You are responsible for all activity on your account. Keep your credentials secure and do not
                          share your account with others. You are responsible for content shared from your account.
                        </p>
                      </div>
                    </div>
                  </div>

                  {!hasScrolledRules && !preAcceptRules && (
                    <p className="text-xs md:text-sm text-amber-600 dark:text-amber-400 text-center">
                      Please scroll through all rules before continuing
                    </p>
                  )}

                  <div className="flex items-center gap-3 p-3 md:p-4 bg-muted/30 rounded-lg border border-border">
                    <input
                      type="checkbox"
                      id="accept-rules"
                      checked={acceptedRules}
                      onChange={(e) => setAcceptedRules(e.target.checked)}
                      disabled={!hasScrolledRules && !preAcceptRules}
                      className="w-4 h-4 md:w-5 md:h-5 rounded border-border"
                    />
                    <label htmlFor="accept-rules" className="text-xs md:text-sm text-foreground cursor-pointer">
                      I have read and accept all community rules and guidelines
                    </label>
                  </div>
                </div>
              )}

              {step === 'comfort' && (
                <div className="space-y-4 md:space-y-6">
                  <Card className="border-primary/20">
                    <CardContent className="p-4 md:p-6">
                      <div className="flex items-start gap-3 md:gap-4">
                        <div className="h-12 w-12 md:h-16 md:w-16 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Settings className="h-6 w-6 md:h-8 md:w-8 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2">
                            Comfort Settings
                          </h3>
                          <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                            Customize your experience to make RazeHub feel like home. You can adjust these settings
                            anytime from the Settings page.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Appearance Preview */}
                  <div className="bg-muted/30 border border-border rounded-lg p-4 md:p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Palette className="h-5 w-5 text-primary" />
                      <h4 className="font-medium text-foreground">Avatar Color</h4>
                    </div>
                    <div className="flex items-center gap-4">
                      <div
                        className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-2xl border-2 border-border"
                        style={{ backgroundColor: selectedAvatarColor }}
                      >
                        U
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground mb-3">Choose your avatar color</p>
                        <div className="flex flex-wrap gap-2">
                          {AVATAR_COLORS.map((color) => (
                            <button
                              key={color}
                              onClick={() => {
                                setSelectedAvatarColor(color);
                                setSelectedBannerColor1(color);
                                // Randomize banner color 2 based on new avatar color
                                const hash = color.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
                                const hue = (hash * 7) % 360;
                                setSelectedBannerColor2(`hsl(${hue}, 70%, 50%)`);
                              }}
                              className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${
                                selectedAvatarColor === color ? 'border-primary scale-110' : 'border-border'
                              }`}
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Banner Preview */}
                  <div className="bg-muted/30 border border-border rounded-lg p-4 md:p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Palette className="h-5 w-5 text-primary" />
                      <h4 className="font-medium text-foreground">Banner Colors</h4>
                    </div>
                    <div className="space-y-4">
                      <div className="h-16 rounded-lg" style={{
                        background: selectedBannerStyle === 'gradient'
                          ? `linear-gradient(135deg, ${selectedBannerColor1}, ${selectedBannerColor2})`
                          : selectedBannerColor1
                      }} />
                      <div className="flex gap-3">
                        <div>
                          <label className="text-sm font-medium">Banner Color 1</label>
                          <input
                            type="color"
                            value={selectedBannerColor1.startsWith('hsl') ? '#3B82F6' : selectedBannerColor1}
                            onChange={(e) => setSelectedBannerColor1(e.target.value)}
                            className="h-10 w-20 mt-1 p-1 cursor-pointer rounded border border-border"
                          />
                        </div>
                        {selectedBannerStyle === 'gradient' && (
                          <div>
                            <label className="text-sm font-medium">Banner Color 2</label>
                            <input
                              type="color"
                              value={selectedBannerColor2.startsWith('hsl') ? '#6366F1' : selectedBannerColor2}
                              onChange={(e) => setSelectedBannerColor2(e.target.value)}
                              className="h-10 w-20 mt-1 p-1 cursor-pointer rounded border border-border"
                            />
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="text-sm font-medium">Banner Style</label>
                        <div className="flex gap-2 mt-1">
                          <button
                            onClick={() => setSelectedBannerStyle('solid')}
                            className={`px-3 py-1.5 rounded-lg border-2 transition-all ${
                              selectedBannerStyle === 'solid'
                                ? 'border-primary bg-primary/10'
                                : 'border-border hover:border-primary/50'
                            }`}
                          >
                            Solid
                          </button>
                          <button
                            onClick={() => setSelectedBannerStyle('gradient')}
                            className={`px-3 py-1.5 rounded-lg border-2 transition-all ${
                              selectedBannerStyle === 'gradient'
                                ? 'border-primary bg-primary/10'
                                : 'border-border hover:border-primary/50'
                            }`}
                          >
                            Gradient
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Language Selector */}
                  <div className="bg-muted/30 border border-border rounded-lg p-4 md:p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Globe className="h-5 w-5 text-primary" />
                      <h4 className="font-medium text-foreground">Language</h4>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-4xl">{LANGUAGES.find(l => l.code === language)?.flag || '🌐'}</div>
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground mb-3">Select your preferred language</p>
                        <Select value={language} onValueChange={(value) => setLanguage(value as Language)}>
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {LANGUAGES.map((lang) => (
                              <SelectItem key={lang.code} value={lang.code}>
                                <span className="mr-2">{lang.flag}</span>
                                {lang.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Theme Selector */}
                  <div className="bg-muted/30 border border-border rounded-lg p-4 md:p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Palette className="h-5 w-5 text-primary" />
                      <h4 className="font-medium text-foreground">Theme</h4>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {(['light', 'dark', 'system'] as const).map((themeOption) => (
                        <button
                          key={themeOption}
                          onClick={() => setTheme(themeOption)}
                          className={`p-3 rounded-lg border-2 transition-all ${
                            theme === themeOption
                              ? 'border-primary bg-primary/10'
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <div className="text-xs md:text-sm font-medium capitalize text-foreground">
                            {themeOption}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 md:p-4">
                    <p className="text-xs md:text-sm text-green-800 dark:text-green-300">
                      <strong>Tip:</strong> You can access all these settings and more from the Settings page at any time.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 md:p-6 border-t border-border flex items-center justify-between flex-shrink-0">
              {step === 'welcome' && (
                <Button variant="outline" onClick={handleSkip}>
                  Skip
                </Button>
              )}
              {step !== 'welcome' && (
                <Button variant="outline" onClick={() => setStep(step === 'rules' ? 'welcome' : 'rules')}>
                  Back
                </Button>
              )}

              <Button
                onClick={() => {
                  if (step === 'welcome') {
                    setStep('rules');
                  } else if (step === 'rules') {
                    setStep('comfort');
                  } else {
                    handleComplete();
                  }
                }}
                disabled={step === 'rules' && (!hasScrolledRules || !acceptedRules)}
              >
                {step === 'welcome' && 'Continue to Rules'}
                {step === 'rules' && 'Continue to Settings'}
                {step === 'comfort' && (
                  <>
                    Get Started
                    <Check className="h-4 w-4 ml-2" />
                  </>
                )}
                {step !== 'comfort' && <ChevronRight className="h-4 w-4 ml-2" />}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Skip Warning Dialog */}
      <AlertDialog open={showSkipWarning} onOpenChange={setShowSkipWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Skip Welcome Panel?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to skip the welcome panel? You can always view it again from Settings.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmSkip}>Skip</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
