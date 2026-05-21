import { useState, useEffect as useEffect2 } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n, Language } from '@/lib/i18n';
import { useTheme } from '@/lib/theme';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Sun, Moon, Monitor, AlertTriangle, Lock, Shield, Clock, UserCheck, MessageSquare, Gamepad2, Copy, Check, CreditCard, Trash2, Edit2 } from 'lucide-react';
import { useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { validateUsername } from '@/lib/username-validation';

export default function SettingsPage() {
  const { profile, signOut, refreshProfile } = useAuth();
  const { t, language, setLanguage } = useI18n();
  const { theme, setTheme, lightSub, setLightSub, darkSub, setDarkSub } = useTheme();
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeSection, setActiveSection] = useState(() => {
    const fromUrl = searchParams.get('tab');
    if (fromUrl) return fromUrl;
    const saved = sessionStorage.getItem('settings-tab');
    return saved || 'account';
  });

  // Sync tab to sessionStorage and clear URL param after read
  useEffect2(() => {
    sessionStorage.setItem('settings-tab', activeSection);
  }, [activeSection]);

  // React to URL tab changes (e.g. navigating from ads)
  useEffect2(() => {
    const tab = searchParams.get('tab');
    if (tab && tab !== activeSection) {
      setActiveSection(tab);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams]);

  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [email, setEmail] = useState(profile?.email || '');
  const [saving, setSaving] = useState(false);
  
  // Username change state
  const [usernameChangeOpen, setUsernameChangeOpen] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [canChangeUsername, setCanChangeUsername] = useState(false);
  const [nextChangeDate, setNextChangeDate] = useState<Date | null>(null);

  // Check if user can change username
  useEffect(() => {
    const checkUsernameChangeEligibility = async () => {
      if (!profile) return;
      
      const { data } = await supabase
        .from('profiles')
        .select('username_changed_at')
        .eq('user_id', profile.user_id)
        .single();
      
      if (data?.username_changed_at) {
        const changeDate = new Date(data.username_changed_at);
        const now = new Date();
        const daysSinceChange = Math.floor((now.getTime() - changeDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysSinceChange >= 7) {
          setCanChangeUsername(true);
          setNextChangeDate(null);
        } else {
          setCanChangeUsername(false);
          const nextChange = new Date(changeDate.getTime() + 7 * 24 * 60 * 60 * 1000);
          setNextChangeDate(nextChange);
        }
      } else {
        setCanChangeUsername(true);
        setNextChangeDate(null);
      }
    };
    
    checkUsernameChangeEligibility();
  }, [profile]);

  // Check username availability
  useEffect(() => {
    if (!newUsername) {
      setUsernameAvailable(null);
      setUsernameError('');
      return;
    }
    
    const validation = validateUsername(newUsername);
    if (!validation.valid) {
      setUsernameError(validation.error || '');
      setUsernameAvailable(null);
      return;
    }
    
    setUsernameError('');
    setCheckingUsername(true);
    
    const timeout = setTimeout(async () => {
      const { data, error } = await supabase.rpc('check_username_available', { desired_username: newUsername });
      setCheckingUsername(false);
      if (!error && data !== null) {
        setUsernameAvailable(data);
        if (!data) setUsernameError('This username is already taken');
      }
    }, 500);
    
    return () => clearTimeout(timeout);
  }, [newUsername]);

  const handleChangeUsername = async () => {
    if (!profile || !newUsername) return;
    
    const validation = validateUsername(newUsername);
    if (!validation.valid) {
      setUsernameError(validation.error || '');
      return;
    }
    
    if (!usernameAvailable) {
      setUsernameError('This username is already taken');
      return;
    }
    
    setSaving(true);
    
    const { error } = await supabase
      .from('profiles')
      .update({
        username: newUsername,
        username_lower: newUsername.toLowerCase(),
      })
      .eq('user_id', profile.user_id);
    
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Username changed', description: `Your username is now @${newUsername}` });
      setUsernameChangeOpen(false);
      setNewUsername('');
      refreshProfile();
      // Recheck eligibility
      const { data } = await supabase
        .from('profiles')
        .select('username_changed_at')
        .eq('user_id', profile.user_id)
        .single();
      if (data?.username_changed_at) {
        const nextChange = new Date(data.username_changed_at.getTime() + 7 * 24 * 60 * 60 * 1000);
        setNextChangeDate(nextChange);
        setCanChangeUsername(false);
      }
    }
    
    setSaving(false);
  };
  
  const [countryCode, setCountryCode] = useState('+1');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [notifFriendRequests, setNotifFriendRequests] = useState(true);
  const [notifGameEvents, setNotifGameEvents] = useState(true);
  const [notifDevPosts, setNotifDevPosts] = useState(true);
  const [notifCommunity, setNotifCommunity] = useState(true);
  const [notifPromo, setNotifPromo] = useState(false);
  const [notifDigest, setNotifDigest] = useState(false);
  const [profileVisibility, setProfileVisibility] = useState('everyone');
  const [whoCanMessage, setWhoCanMessage] = useState('everyone');
  const [whoCanCall, setWhoCanCall] = useState('friends');
  const [showOnline, setShowOnline] = useState(true);
  const [showPlaying, setShowPlaying] = useState(true);
  const [allowFriendReqs, setAllowFriendReqs] = useState(true);
  const [notifyOnFriendReq, setNotifyOnFriendReq] = useState(true);
  const [region, setRegion] = useState('us');
  const [autoTransGames, setAutoTransGames] = useState(false);
  const [autoTransChat, setAutoTransChat] = useState(false);
  const [smoothTranslation, setSmoothTranslation] = useState(false);

  // Gameplay settings state
  const [autoJoinFriends, setAutoJoinFriends] = useState(false);
  const [friendNotifsInGame, setFriendNotifsInGame] = useState(true);
  const [autoAcceptParty, setAutoAcceptParty] = useState(false);
  const [defaultRegion, setDefaultRegion] = useState('auto');

  // Chat & Voice settings state
  const [gameChatVisibility, setGameChatVisibility] = useState('all');
  const [voiceChatEnabled, setVoiceChatEnabled] = useState(true);
  const [pushToTalk, setPushToTalk] = useState(false);
  const [pushToTalkKey, setPushToTalkKey] = useState('V');
  const [noiseSuppression, setNoiseSuppression] = useState(true);

  // Audio settings state
  const [inputDevice, setInputDevice] = useState('default');
  const [outputDevice, setOutputDevice] = useState('default');
  const [micTesting, setMicTesting] = useState(false);

  // Social links
  const [socialYouTube, setSocialYouTube] = useState('');
  const [socialX, setSocialX] = useState('');
  const [socialTwitch, setSocialTwitch] = useState('');
  const [socialVisibility, setSocialVisibility] = useState('everyone');

  // Privacy — friend list & best friends visibility
  const [whoSeeFriendList, setWhoSeeFriendList] = useState('everyone');
  const [whoSeeBestFriends, setWhoSeeBestFriends] = useState('everyone');

  // Parental control settings
  const [connectionCode, setConnectionCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [timeLimit, setTimeLimit] = useState(2);
  const [ageRestriction, setAgeRestriction] = useState(13);
  const [chatEnabled, setChatEnabled] = useState(true);
  const [friendRequestsEnabled, setFriendRequestsEnabled] = useState(true);
  const [publicProfile, setPublicProfile] = useState(false);

  // Billing modal state
  const [showFeaturesModal, setShowFeaturesModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'premium' | 'builder' | null>(null);
  
  // Payment methods state
  const [savedCard, setSavedCard] = useState<any>(null);
  useEffect(() => {
    const saved = localStorage.getItem('saved-card');
    if (saved) {
      setSavedCard(JSON.parse(saved));
    }
  }, []);

  const removeSavedCard = () => {
    localStorage.removeItem('saved-card');
    setSavedCard(null);
    toast({ title: 'Card Removed', description: 'Saved card has been removed' });
  };

  // Parental control functions
  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      if (i === 4) code += '-';
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setGeneratedCode(code);
    setShowCode(true);
  };

  const copyCode = () => {
    if (generatedCode) {
      navigator.clipboard.writeText(generatedCode);
      setCopied(true);
      toast({ title: 'Code Copied', description: 'Connection code copied to clipboard' });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const verifyConnection = () => {
    if (!connectionCode.trim()) {
      toast({ title: 'Error', description: 'Please enter a connection code', variant: 'destructive' });
      return;
    }
    
    if (connectionCode.length === 9 && connectionCode.includes('-')) {
      setIsConnected(true);
      toast({ title: 'Connected', description: 'Successfully connected to RazeCare parental controls' });
    } else {
      toast({ title: 'Invalid Code', description: 'Please enter a valid connection code', variant: 'destructive' });
    }
  };

  const saveParentalSettings = () => {
    toast({ title: 'Settings Saved', description: 'Parental control settings have been updated' });
  };

  const navigate = useNavigate();

  // Load privacy settings
  useEffect(() => {
    if (!profile) return;
    (async () => {
      const { data } = await supabase.from('privacy_settings').select('*').eq('user_id', profile.user_id).maybeSingle();
      if (data) {
        setProfileVisibility(data.profile_visibility);
        setShowOnline(data.show_online_to !== 'nobody');
        setShowPlaying(data.show_playing_to !== 'nobody');
        setAllowFriendReqs(data.allow_friend_requests);
        setNotifyOnFriendReq(data.notify_on_friend_request);
      }
    })();
  }, [profile?.user_id]);

  const savePrivacy = async () => {
    if (!profile) return;
    const { error } = await supabase.from('privacy_settings').upsert({
      user_id: profile.user_id,
      profile_visibility: profileVisibility as any,
      show_online_to: (showOnline ? 'everyone' : 'nobody') as any,
      show_playing_to: (showPlaying ? 'everyone' : 'nobody') as any,
      allow_friend_requests: allowFriendReqs,
      notify_on_friend_request: notifyOnFriendReq,
    });
    if (error) {
      toast({ title: t('settings.error'), description: error.message, variant: 'destructive' });
    } else {
      toast({ title: t('settings.saved'), description: t('settings.privacyUpdated') });
    }
  };

  const SETTINGS_SECTIONS = [
    { id: 'account', label: t('settings.account') },
    { id: 'accounts', label: 'Switch Account' },
    { id: 'phone', label: t('settings.phone') },
    { id: 'notifications', label: t('settings.notifications') },
    { id: 'privacy', label: t('settings.privacy') },
    { id: 'appearance', label: t('settings.appearance') },
    { id: 'language', label: t('settings.language') },
    { id: 'gameplay', label: t('settings.gameplay') },
    { id: 'chat-voice', label: t('settings.chatVoice') },
    { id: 'audio', label: t('settings.audio') },
    { id: 'age-check', label: t('settings.ageCheck') },
    { id: 'parental', label: t('settings.parental') },
    { id: 'warnings', label: t('settings.warnings') },
    { id: 'billing', label: t('settings.billing') },
  ];

  const handleSaveAccount = async () => {
    if (!profile) return;
    setSaving(true);
    const updates: any = { display_name: displayName };
    if (email && !profile.email) updates.email = email;
    const { error } = await supabase.from('profiles').update(updates).eq('user_id', profile.user_id);
    if (error) {
      toast({ title: t('settings.error'), description: t('settings.errorSave'), variant: 'destructive' });
    } else {
      toast({ title: t('settings.saved'), description: t('settings.accountUpdated') });
      refreshProfile();
    }
    setSaving(false);
  };

  const renderSection = () => {
    const sectionDef = SETTINGS_SECTIONS.find(s => s.id === activeSection);
    if (sectionDef && 'soon' in sectionDef && sectionDef.soon) {
      return (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">{sectionDef.label}</h2>
          <div className="bg-muted/30 border border-border border-dashed rounded-xl p-8 flex items-center justify-center">
            <div className="text-center">
              <span className="inline-block px-3 py-1 rounded-full bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400 text-xs font-semibold mb-2">{t('settings.comingSoon')}</span>
              <p className="text-sm text-muted-foreground">{t('settings.underDev')}</p>
            </div>
          </div>
        </div>
      );
    }

    switch (activeSection) {
      case 'account':
        return (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-foreground">{t('settings.account')}</h2>
            {/* Current user */}
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-border">
                <div>
                  <p className="font-medium text-foreground">{t('settings.displayName')}</p>
                  <p className="text-xs text-muted-foreground">{t('settings.displayNameDesc')}</p>
                </div>
                <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="w-[260px] text-right" placeholder={t('settings.displayName')} />
              </div>
              <div className="flex items-center justify-between py-3 border-b border-border">
                <div>
                  <p className="font-medium text-foreground">{t('settings.username')}</p>
                  <p className="text-xs text-muted-foreground">{t('settings.usernameDesc')}</p>
                  {!canChangeUsername && nextChangeDate && (
                    <p className="text-xs text-orange-500 mt-1">
                      Can change again on {nextChangeDate.toLocaleDateString()}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Input value={`@${profile?.username || ''}`} disabled className="w-[200px] text-right opacity-60" />
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setUsernameChangeOpen(true)}
                    disabled={!canChangeUsername}
                  >
                    <Edit2 className="h-4 w-4 mr-1" />
                    Change
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-border">
                <div>
                  <p className="font-medium text-foreground">{t('settings.email')}</p>
                  {profile?.email && <p className="text-xs text-muted-foreground">{profile.email}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <Input value={email} onChange={(e) => setEmail(e.target.value)} className="w-[200px] text-right" placeholder="you@email.com" disabled={!!profile?.email} />
                  <Button variant="outline" size="sm" disabled={!email || (!!profile?.email && email === profile.email)}>
                    {t('settings.verify')}
                  </Button>
                </div>
              </div>
              {/* Social Links */}
              <div className="py-3 border-b border-border space-y-3">
                <p className="font-medium text-foreground">{t('settings.socialLinks')}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">YouTube</span>
                  <Input value={socialYouTube} onChange={(e) => setSocialYouTube(e.target.value)} className="w-[220px] text-right" placeholder="youtube.com/..." />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">X (Twitter)</span>
                  <Input value={socialX} onChange={(e) => setSocialX(e.target.value)} className="w-[220px] text-right" placeholder="@handle" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Twitch</span>
                  <Input value={socialTwitch} onChange={(e) => setSocialTwitch(e.target.value)} className="w-[220px] text-right" placeholder="twitch.tv/..." />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{t('settings.whoCanSeeSocials')}</span>
                  <Select value={socialVisibility} onValueChange={setSocialVisibility}>
                    <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="everyone">{t('settings.everyone')}</SelectItem>
                      <SelectItem value="followers">{t('settings.followers')}</SelectItem>
                      <SelectItem value="friends">{t('settings.friendsOnly')}</SelectItem>
                      <SelectItem value="nobody">{t('settings.nobody')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-border">
                <p className="font-medium text-foreground">{t('settings.changePassword')}</p>
                <Button variant="outline" size="sm" disabled>Change</Button>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-border">
                <div>
                  <p className="font-medium text-foreground">{t('settings.deleteAccount')}</p>
                  <p className="text-xs text-muted-foreground">{t('settings.deleteAccountDesc')}</p>
                </div>
                <Button variant="destructive" size="sm" disabled>Delete</Button>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleSaveAccount} disabled={saving}>{saving ? t('profile.saving') : t('settings.saveChanges')}</Button>
              </div>
            </div>
          </div>
        );

      case 'accounts':
        return (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-foreground">{t('settings.switchAccount')}</h2>
            <p className="text-sm text-muted-foreground">{t('settings.switchAccountDesc')}</p>
            <div className="space-y-2">
              {/* Current account */}
              <div className="flex items-center gap-3 p-3 rounded-lg border border-primary/30 bg-primary/5">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0" style={{ backgroundColor: profile?.avatar_color || '#3B82F6', color: 'white' }}>
                  {(profile?.display_name || profile?.username || 'U')[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{profile?.display_name || profile?.username}</p>
                  <p className="text-xs text-muted-foreground">@{profile?.username} · {t('settings.active')}</p>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-primary/15 text-primary font-semibold">{t('settings.current')}</span>
              </div>
            </div>
            <Button variant="outline" className="w-full" onClick={() => {
              toast({ title: t('settings.switchAccount'), description: t('settings.addAccountToast') });
            }}>
              {t('settings.addAccount')}
            </Button>
          </div>
        );

      case 'phone':
        return (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-foreground">{t('settings.phone')}</h2>
            <div className="bg-muted/30 border border-border border-dashed rounded-xl p-4 mb-4">
              <p className="text-sm text-muted-foreground">{t('settings.phoneDesc')}</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground">{t('settings.countryCode')}</label>
                <Select value={countryCode} onValueChange={setCountryCode}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="+1">+1 (US)</SelectItem>
                    <SelectItem value="+44">+44 (UK)</SelectItem>
                    <SelectItem value="+48">+48 (PL)</SelectItem>
                    <SelectItem value="+49">+49 (DE)</SelectItem>
                    <SelectItem value="+7">+7 (RU)</SelectItem>
                    <SelectItem value="+34">+34 (ES)</SelectItem>
                    <SelectItem value="+33">+33 (FR)</SelectItem>
                    <SelectItem value="+81">+81 (JP)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">{t('settings.phoneNumber')}</label>
                <Input value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className="mt-1" placeholder={t('settings.phoneNumber')} />
              </div>
              <Button variant="outline" disabled>{t('settings.sendCode')}</Button>
              <div className="flex items-center justify-between py-3 border-t border-border">
                <div>
                  <p className="font-medium text-foreground">{t('settings.use2FA')}</p>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400 font-semibold">BETA</span>
                </div>
                <Switch disabled />
              </div>
              <div className="flex justify-end">
                <Button disabled>{t('settings.saveChanges')}</Button>
              </div>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-foreground">{t('settings.notifications')}</h2>
            <div className="space-y-4">
              {[
                { label: t('settings.friendRequests'), state: notifFriendRequests, setter: setNotifFriendRequests },
                { label: t('settings.gameEvents'), state: notifGameEvents, setter: setNotifGameEvents },
                { label: t('settings.devPosts'), state: notifDevPosts, setter: setNotifDevPosts },
                { label: t('settings.communityActivity'), state: notifCommunity, setter: setNotifCommunity },
                { label: t('settings.promoEmails'), state: notifPromo, setter: setNotifPromo },
                { label: t('settings.weeklyDigest'), state: notifDigest, setter: setNotifDigest },
              ].map(({ label, state, setter }) => (
                <div key={label} className="flex items-center justify-between py-3 border-b border-border">
                  <p className="font-medium text-foreground">{label}</p>
                  <Switch checked={state} onCheckedChange={setter} />
                </div>
              ))}
              <div className="flex justify-end">
                <Button onClick={() => toast({ title: t('settings.saved'), description: t('settings.notifUpdated') })}>{t('settings.saveChanges')}</Button>
              </div>
            </div>
          </div>
        );

      case 'privacy':
        return (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-foreground">{t('settings.privacy')}</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-border">
                <p className="font-medium text-foreground">{t('settings.profileVisibility')}</p>
                <Select value={profileVisibility} onValueChange={setProfileVisibility}>
                  <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="everyone">{t('settings.everyone')}</SelectItem>
                    <SelectItem value="friends">{t('settings.friendsOnly')}</SelectItem>
                    <SelectItem value="private">{t('settings.private')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-border">
                <p className="font-medium text-foreground">{t('settings.whoMessage')}</p>
                <Select value={whoCanMessage} onValueChange={setWhoCanMessage}>
                  <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="everyone">{t('settings.everyone')}</SelectItem>
                    <SelectItem value="friends">{t('settings.friendsOnly')}</SelectItem>
                    <SelectItem value="nobody">{t('settings.nobody')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-border">
                <p className="font-medium text-foreground">{t('settings.whoCall')}</p>
                <Select value={whoCanCall} onValueChange={setWhoCanCall}>
                  <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="everyone">{t('settings.everyone')}</SelectItem>
                    <SelectItem value="friends">{t('settings.friendsOnly')}</SelectItem>
                    <SelectItem value="nobody">{t('settings.nobody')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-border">
                <p className="font-medium text-foreground">{t('settings.showOnline')}</p>
                <Switch checked={showOnline} onCheckedChange={setShowOnline} />
              </div>
              <div className="flex items-center justify-between py-3 border-b border-border">
                <p className="font-medium text-foreground">{t('settings.showPlaying')}</p>
                <Switch checked={showPlaying} onCheckedChange={setShowPlaying} />
              </div>
              <div className="flex items-center justify-between py-3 border-b border-border">
                <p className="font-medium text-foreground">{t('settings.allowFriendReqs')}</p>
                <Switch checked={allowFriendReqs} onCheckedChange={setAllowFriendReqs} />
              </div>
              <div className="flex items-center justify-between py-3 border-b border-border">
                <p className="font-medium text-foreground">{t('settings.whoSeeFriendList')}</p>
                <Select value={whoSeeFriendList} onValueChange={setWhoSeeFriendList}>
                  <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="everyone">{t('settings.everyone')}</SelectItem>
                    <SelectItem value="friends">{t('settings.friendsOnly')}</SelectItem>
                    <SelectItem value="nobody">{t('settings.nobody')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-border">
                <p className="font-medium text-foreground">{t('settings.whoSeeBestFriends')}</p>
                <Select value={whoSeeBestFriends} onValueChange={setWhoSeeBestFriends}>
                  <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="everyone">{t('settings.everyone')}</SelectItem>
                    <SelectItem value="friends">{t('settings.friendsOnly')}</SelectItem>
                    <SelectItem value="nobody">{t('settings.nobody')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-border">
                <div>
                  <p className="font-medium text-foreground">{t('settings.twoFactor')}</p>
                </div>
                <Button variant="outline" size="sm" disabled>{t('settings.enable')}</Button>
              </div>
              <div className="flex justify-end">
                <Button onClick={savePrivacy}>{t('settings.saveChanges')}</Button>
              </div>
            </div>
          </div>
        );

      case 'appearance':
        return (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-foreground">{t('settings.appearance')}</h2>
            <div className="space-y-4">
              <div className="py-3 border-b border-border">
                <p className="font-medium text-foreground mb-3">{t('settings.mode')}</p>
                <div className="flex gap-3">
                  {[
                    { value: 'light' as const, label: t('settings.light'), icon: Sun },
                    { value: 'dark' as const, label: t('settings.dark'), icon: Moon },
                    { value: 'system' as const, label: t('settings.system'), icon: Monitor },
                  ].map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      onClick={() => setTheme(value)}
                      className={`flex items-center gap-2 px-4 py-3 rounded-lg border text-sm font-medium transition-all ${
                        theme === value
                          ? 'bg-primary/10 border-primary text-primary shadow-sm'
                          : 'border-border text-muted-foreground hover:bg-accent'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              {/* Light sub-themes */}
              <div className="py-3 border-b border-border">
                <p className="font-medium text-foreground mb-2">{t('settings.lightStyle')}</p>
                <div className="flex flex-wrap gap-2">
                  {([
                    { id: 'default', label: 'Default', preview: 'bg-white border-gray-200' } as const,
                    { id: 'warm', label: 'Warm', preview: 'bg-orange-50 border-orange-200' } as const,
                    { id: 'cool', label: 'Cool', preview: 'bg-blue-50 border-blue-200' } as const,
                    { id: 'paper', label: 'Paper', preview: 'bg-amber-50 border-amber-200' } as const,
                    { id: 'medium', label: 'Medium', preview: 'bg-slate-200 border-slate-300' } as const,
                  ]).map(s => (
                    <button key={s.id} onClick={() => setLightSub(s.id)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-all ${lightSub === s.id ? 'border-primary ring-1 ring-primary' : 'border-border'}`}>
                      <div className={`w-5 h-5 rounded-full border ${s.preview}`} />
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
              {/* Dark sub-themes */}
              <div className="py-3 border-b border-border">
                <p className="font-medium text-foreground mb-2">{t('settings.darkStyle')}</p>
                <div className="flex flex-wrap gap-2">
                  {([
                    { id: 'default', label: 'Default', preview: 'bg-gray-900 border-gray-700' } as const,
                    { id: 'midnight', label: 'Midnight', preview: 'bg-indigo-950 border-indigo-800' } as const,
                    { id: 'amoled', label: 'AMOLED', preview: 'bg-black border-gray-800' } as const,
                    { id: 'forest', label: 'Forest', preview: 'bg-emerald-950 border-emerald-800' } as const,
                    { id: 'medium', label: 'Medium', preview: 'bg-slate-700 border-slate-600' } as const,
                  ]).map(s => (
                    <button key={s.id} onClick={() => setDarkSub(s.id)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-all ${darkSub === s.id ? 'border-primary ring-1 ring-primary' : 'border-border'}`}>
                      <div className={`w-5 h-5 rounded-full border ${s.preview}`} />
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={() => toast({ title: t('settings.saved'), description: t('settings.appearanceUpdated') })}>{t('settings.saveChanges')}</Button>
              </div>
            </div>
          </div>
        );

      case 'language':
        return (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-foreground">{t('settings.language')}</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-border">
                <p className="font-medium text-foreground">{t('settings.displayLang')}</p>
                <Select value={language} onValueChange={(v) => setLanguage(v as Language)}>
                  <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="ru">Русский</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-border">
                <p className="font-medium text-foreground">{t('settings.region')}</p>
                <Select value={region} onValueChange={setRegion}>
                  <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="us">United States</SelectItem>
                    <SelectItem value="eu">Europe</SelectItem>
                    <SelectItem value="ru">Russia</SelectItem>
                    <SelectItem value="latam">Latin America</SelectItem>
                    <SelectItem value="asia">Asia</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-border">
                <p className="font-medium text-foreground">{t('settings.autoTransGames')}</p>
                <Switch checked={autoTransGames} onCheckedChange={setAutoTransGames} />
              </div>
              <div className="flex items-center justify-between py-3 border-b border-border">
                <p className="font-medium text-foreground">{t('settings.autoTransChat')}</p>
                <Switch checked={autoTransChat} onCheckedChange={setAutoTransChat} />
              </div>
              <div className="flex items-center justify-between py-3 border-b border-border">
                <p className="font-medium text-foreground">{t('settings.smoothTranslation')}</p>
                <Switch checked={smoothTranslation} onCheckedChange={setSmoothTranslation} />
              </div>
              <div className="flex justify-end">
                <Button onClick={() => toast({ title: t('settings.saved'), description: t('settings.langUpdated') })}>{t('settings.saveChanges')}</Button>
              </div>
            </div>
          </div>
        );

      case 'gameplay':
        return (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-foreground">{t('settings.gameplay')}</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-border">
                <div>
                  <p className="font-medium text-foreground">{t('settings.autoJoinFriends')}</p>
                  <p className="text-xs text-muted-foreground">{t('settings.autoJoinFriendsDesc')}</p>
                </div>
                <Switch checked={autoJoinFriends} onCheckedChange={setAutoJoinFriends} />
              </div>
              <div className="flex items-center justify-between py-3 border-b border-border">
                <div>
                  <p className="font-medium text-foreground">{t('settings.friendNotifsInGame')}</p>
                  <p className="text-xs text-muted-foreground">{t('settings.friendNotifsInGameDesc')}</p>
                </div>
                <Switch checked={friendNotifsInGame} onCheckedChange={setFriendNotifsInGame} />
              </div>
              <div className="flex items-center justify-between py-3 border-b border-border">
                <div>
                  <p className="font-medium text-foreground">{t('settings.autoAcceptParty')}</p>
                  <p className="text-xs text-muted-foreground">{t('settings.autoAcceptPartyDesc')}</p>
                </div>
                <Switch checked={autoAcceptParty} onCheckedChange={setAutoAcceptParty} />
              </div>
              <div className="flex items-center justify-between py-3 border-b border-border">
                <div>
                  <p className="font-medium text-foreground">{t('settings.defaultRegion')}</p>
                  <p className="text-xs text-muted-foreground">{t('settings.defaultRegionDesc')}</p>
                </div>
                <Select value={defaultRegion} onValueChange={setDefaultRegion}>
                  <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">{t('settings.regionAuto')}</SelectItem>
                    <SelectItem value="na-east">NA East</SelectItem>
                    <SelectItem value="na-west">NA West</SelectItem>
                    <SelectItem value="eu-west">EU West</SelectItem>
                    <SelectItem value="eu-east">EU East</SelectItem>
                    <SelectItem value="asia">Asia</SelectItem>
                    <SelectItem value="oceania">Oceania</SelectItem>
                    <SelectItem value="sa">South America</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end">
                <Button onClick={() => toast({ title: t('settings.saved'), description: t('settings.gameplayUpdated') })}>{t('settings.saveChanges')}</Button>
              </div>
            </div>
          </div>
        );

      case 'chat-voice':
        return (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-foreground">{t('settings.chatVoiceTitle')}</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-border">
                <p className="font-medium text-foreground">{t('settings.gameChatVisibility')}</p>
                <Select value={gameChatVisibility} onValueChange={setGameChatVisibility}>
                  <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('settings.visibleToAll')}</SelectItem>
                    <SelectItem value="hidden">{t('settings.hidden')}</SelectItem>
                    <SelectItem value="friends">{t('settings.visibleToFriends')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-border">
                <p className="font-medium text-foreground">{t('settings.voiceChat')}</p>
                <Switch checked={voiceChatEnabled} onCheckedChange={setVoiceChatEnabled} />
              </div>
              <div className="flex items-center justify-between py-3 border-b border-border">
                <p className="font-medium text-foreground">{t('settings.pushToTalk')}</p>
                <Switch checked={pushToTalk} onCheckedChange={setPushToTalk} />
              </div>
              {pushToTalk && (
                <div className="flex items-center justify-between py-3 border-b border-border">
                  <p className="font-medium text-foreground">{t('settings.pushToTalkKey')}</p>
                  <Input
                    value={pushToTalkKey}
                    onChange={(e) => setPushToTalkKey(e.target.value.toUpperCase().slice(0, 1))}
                    className="w-[80px] text-center"
                    maxLength={1}
                  />
                </div>
              )}
              <div className="flex items-center justify-between py-3 border-b border-border">
                <p className="font-medium text-foreground">{t('settings.noiseSuppression')}</p>
                <Switch checked={noiseSuppression} onCheckedChange={setNoiseSuppression} />
              </div>
              <div className="flex justify-end">
                <Button onClick={() => toast({ title: t('settings.saved'), description: t('settings.chatVoiceUpdated') })}>{t('settings.saveChanges')}</Button>
              </div>
            </div>
          </div>
        );

      case 'audio':
        return (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-foreground">{t('settings.audioTitle')}</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-border">
                <p className="font-medium text-foreground">{t('settings.inputDevice')}</p>
                <Select value={inputDevice} onValueChange={setInputDevice}>
                  <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">{t('settings.defaultDevice')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-border">
                <p className="font-medium text-foreground">{t('settings.outputDevice')}</p>
                <Select value={outputDevice} onValueChange={setOutputDevice}>
                  <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">{t('settings.defaultDevice')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-border">
                <p className="font-medium text-foreground">{t('settings.micTest')}</p>
                <Button variant={micTesting ? 'destructive' : 'outline'} size="sm" onClick={() => setMicTesting(!micTesting)}>
                  {micTesting ? t('settings.micTestStop') : t('settings.micTestBtn')}
                </Button>
              </div>
              {micTesting && (
                <div className="bg-muted/30 border border-border rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1 items-end h-6">
                      {[3, 5, 4, 6, 3, 5, 4].map((h, i) => (
                        <div key={i} className="w-1 bg-primary rounded-full animate-pulse" style={{ height: `${h * 4}px`, animationDelay: `${i * 0.1}s` }} />
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground">{t('settings.micTest')}...</p>
                  </div>
                </div>
              )}
              <div className="flex justify-end">
                <Button onClick={() => toast({ title: t('settings.saved'), description: t('settings.audioUpdated') })}>{t('settings.saveChanges')}</Button>
              </div>
            </div>
          </div>
        );

      case 'warnings':
        return (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-foreground">{t('settings.warningsBansTitle')}</h2>
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-green-500" />
                <p className="font-semibold text-foreground">{t('settings.standingGood')}</p>
              </div>
              <p className="text-sm text-muted-foreground">{t('settings.standingGoodDesc')}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-semibold text-foreground">{t('settings.warningsList')}</p>
              <div className="bg-muted/30 border border-border border-dashed rounded-xl p-6 text-center">
                <p className="text-sm text-muted-foreground">{t('settings.noWarnings')}</p>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-semibold text-foreground">{t('settings.bansList')}</p>
              <div className="bg-muted/30 border border-border border-dashed rounded-xl p-6 text-center">
                <p className="text-sm text-muted-foreground">{t('settings.noBans')}</p>
              </div>
            </div>
          </div>
        );

      case 'age-check':
        return (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-foreground">{t('settings.ageCheck')}</h2>

            {/* Current status */}
            <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-orange-400" />
                <p className="font-semibold text-foreground">{t('settings.ageCheckStatusUnverified')}</p>
              </div>
              <p className="text-sm text-muted-foreground">{t('settings.ageCheckStatusDesc')}</p>
            </div>

            {/* Verification form */}
            <div className="space-y-4">
              <p className="text-sm font-medium text-foreground">{t('settings.ageCheckRequirements')}</p>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>{t('settings.ageCheckDob')}</li>
                <li>{t('settings.ageCheckEmail')}</li>
                <li>{t('settings.ageCheckPhone')}</li>
              </ul>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">{t('settings.ageCheckDay')}</label>
                  <Input type="number" min={1} max={31} placeholder="DD" className="mt-1" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">{t('settings.ageCheckMonth')}</label>
                  <Input type="number" min={1} max={12} placeholder="MM" className="mt-1" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">{t('settings.ageCheckYear')}</label>
                  <Input type="number" min={1920} max={2026} placeholder="YYYY" className="mt-1" />
                </div>
              </div>

              <Button disabled className="w-full">{t('settings.ageCheckSubmit')}</Button>
            </div>

            {/* Rules */}
            <div className="space-y-3">
              <p className="text-sm font-semibold text-foreground">{t('settings.ageCheckRulesTitle')}</p>
              <div className="bg-muted/30 border border-border rounded-lg p-4 space-y-2 text-sm text-muted-foreground">
                <p>• <span className="text-foreground font-medium">{t('settings.ageCheckRuleGood')}</span> — {t('settings.ageCheckRuleGoodDesc')}</p>
                <p>• <span className="text-foreground font-medium">{t('settings.ageCheckRuleHelp')}</span> — {t('settings.ageCheckRuleHelpDesc')}</p>
                <p>• <span className="text-foreground font-medium">{t('settings.ageCheckRulePurchase')}</span> — {t('settings.ageCheckRulePurchaseDesc')}</p>
                <p>• <span className="text-foreground font-medium">{t('settings.ageCheckRuleHonest')}</span> — {t('settings.ageCheckRuleHonestDesc')}</p>
                <p>• <span className="text-foreground font-medium">{t('settings.ageCheckRulePatience')}</span> — {t('settings.ageCheckRulePatienceDesc')}</p>
              </div>
            </div>

            {/* Age sections */}
            <div className="space-y-3">
              <p className="text-sm font-semibold text-foreground">{t('settings.ageCheckSectionsTitle')}</p>

              {/* Unverified */}
              <div className="border border-border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-xs font-semibold">{t('settings.ageCheckUnverified')}</span>
                </div>
                <p className="text-sm text-muted-foreground">{t('settings.ageCheckUnverifiedDesc')}</p>
              </div>

              {/* 7+ */}
              <div className="border border-border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs font-semibold">{t('settings.ageCheck7plus')}</span>
                </div>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>{t('settings.ageCheck7_1')}</li>
                  <li>{t('settings.ageCheck7_2')}</li>
                  <li>{t('settings.ageCheck7_3')}</li>
                </ul>
              </div>

              {/* 13+ */}
              <div className="border border-border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-xs font-semibold">{t('settings.ageCheck13plus')}</span>
                </div>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>{t('settings.ageCheck13_1')}</li>
                  <li>{t('settings.ageCheck13_2')}</li>
                  <li>{t('settings.ageCheck13_3')}</li>
                  <li>{t('settings.ageCheck13_4')}</li>
                  <li>{t('settings.ageCheck13_5')}</li>
                </ul>
              </div>

              {/* 16+ */}
              <div className="border border-border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-xs font-semibold">{t('settings.ageCheck16plus')}</span>
                </div>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>{t('settings.ageCheck16_1')}</li>
                  <li>{t('settings.ageCheck16_2')}</li>
                  <li>{t('settings.ageCheck16_3')}</li>
                  <li>{t('settings.ageCheck16_4')}</li>
                  <li>{t('settings.ageCheck16_5')}</li>
                  <li>{t('settings.ageCheck16_6')}</li>
                </ul>
              </div>

              {/* 18+ */}
              <div className="border border-border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 text-xs font-semibold">{t('settings.ageCheck18plus')}</span>
                </div>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>{t('settings.ageCheck18_1')}</li>
                  <li>{t('settings.ageCheck18_2')}</li>
                  <li>{t('settings.ageCheck18_3')}</li>
                  <li>{t('settings.ageCheck18_4')}</li>
                </ul>
              </div>
            </div>
          </div>
        );

      case 'parental':
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <Shield className="h-6 w-6 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Parental Control Settings</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              Connect with RazeCare to manage and monitor your child's account
            </p>

            {!isConnected ? (
              /* Connection Instructions */
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-500" />
                    For Parents Only
                  </CardTitle>
                  <CardDescription>
                    This section is exclusively for parents/guardians to set up parental controls
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Instructions */}
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                    <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-3 flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      How to Connect
                    </h3>
                    <ol className="space-y-2 text-sm text-yellow-900 dark:text-yellow-100 list-decimal list-inside">
                      <li>Create an account on <span className="font-semibold">RazeCare</span> (our parental control platform)</li>
                      <li>Confirm your email address and phone number for security verification</li>
                      <li>Generate a unique connection code from your RazeCare dashboard</li>
                      <li>Copy the code below and enter it in the RazeCare platform</li>
                      <li>Confirm the connection to start managing your child's account</li>
                    </ol>
                  </div>

                  {/* Code Generation */}
                  <div className="space-y-3">
                    <Label>Connection Code</Label>
                    <div className="flex gap-2">
                      <div className="flex-1 relative">
                        <Input
                          type="text"
                          placeholder="XXXX-XXXX"
                          value={showCode ? generatedCode : '••••••••••'}
                          readOnly
                          className="font-mono text-lg tracking-wider"
                        />
                        {!showCode && (
                          <p className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                            Click "Generate Code" to see
                          </p>
                        )}
                      </div>
                      <Button onClick={generateCode} variant="outline">
                        {showCode ? 'Regenerate' : 'Generate Code'}
                      </Button>
                      {showCode && (
                        <Button onClick={copyCode} variant="outline">
                          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      This code is unique to this account. Share it only with your parent/guardian on RazeCare.
                    </p>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <p className="text-sm text-blue-900 dark:text-blue-100">
                      <strong>What parents can do on RazeCare:</strong> Monitor activity, set time limits, 
                      control chat access, manage friend requests, set age restrictions for games, and more.
                    </p>
                  </div>
                  <div className="flex justify-center mt-4">
                    <Button onClick={() => window.open('https://razecare.example.com', '_blank')} variant="outline" size="sm">
                      Visit RazeCare
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              /* Parental Control Settings */
              <div className="space-y-6">
                {/* Connection Status */}
                <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
                      <div>
                        <p className="font-semibold text-green-900 dark:text-green-100">
                          Connected to RazeCare
                        </p>
                        <p className="text-sm text-green-700 dark:text-green-300">
                          Parental controls are active and managed through RazeCare
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Time Limits */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Time Limits
                    </CardTitle>
                    <CardDescription>
                      Set daily time limits for platform usage
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label>Daily Time Limit</Label>
                        <span className="text-sm font-medium">{timeLimit} hours</span>
                      </div>
                      <Slider
                        value={[timeLimit]}
                        onValueChange={(value) => setTimeLimit(value[0])}
                        min={0.5}
                        max={8}
                        step={0.5}
                        className="flex-1"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>30 min</span>
                        <span>8 hours</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Age Restrictions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Gamepad2 className="h-5 w-5" />
                      Age Restrictions
                    </CardTitle>
                    <CardDescription>
                      Set minimum age requirements for games and content
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label>Minimum Age for Games</Label>
                        <span className="text-sm font-medium">{ageRestriction}+ years</span>
                      </div>
                      <Slider
                        value={[ageRestriction]}
                        onValueChange={(value) => setAgeRestriction(value[0])}
                        min={3}
                        max={18}
                        step={1}
                        className="flex-1"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>3+ years</span>
                        <span>18+ years</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Chat Controls */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5" />
                      Chat Controls
                    </CardTitle>
                    <CardDescription>
                      Manage chat and messaging features
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="chat-enabled">Enable Chat</Label>
                        <p className="text-sm text-muted-foreground">
                          Allow user to send and receive messages
                        </p>
                      </div>
                      <Switch
                        id="chat-enabled"
                        checked={chatEnabled}
                        onCheckedChange={setChatEnabled}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Friend Controls */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <UserCheck className="h-5 w-5" />
                      Friend Controls
                    </CardTitle>
                    <CardDescription>
                      Manage friend requests and social features
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="friend-requests">Allow Friend Requests</Label>
                        <p className="text-sm text-muted-foreground">
                          Allow other users to send friend requests
                        </p>
                      </div>
                      <Switch
                        id="friend-requests"
                        checked={friendRequestsEnabled}
                        onCheckedChange={setFriendRequestsEnabled}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="public-profile">Public Profile</Label>
                        <p className="text-sm text-muted-foreground">
                          Allow profile to be visible to non-friends
                        </p>
                      </div>
                      <Switch
                        id="public-profile"
                        checked={publicProfile}
                        onCheckedChange={setPublicProfile}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Save Button */}
                <Button onClick={saveParentalSettings} className="w-full" size="lg">
                  Save Settings
                </Button>

                {/* Disconnect */}
                <Button
                  onClick={() => setIsConnected(false)}
                  variant="destructive"
                  className="w-full"
                >
                  Disconnect from RazeCare
                </Button>
              </div>
            )}
          </div>
        );

      case 'billing':
        return (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-foreground">{t('settings.billing')}</h2>
            <p className="text-sm text-muted-foreground">
              Choose a plan that fits your needs
            </p>

            <div className="grid md:grid-cols-3 gap-4">
              {/* Premium Plan */}
              <Card className="border-2 hover:border-primary/50 transition-colors">
                <CardHeader>
                  <CardTitle>Premium</CardTitle>
                  <CardDescription>Enhanced experience for everyone</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold">$4.99</span>
                    <span className="text-sm text-muted-foreground">/month</span>
                  </div>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      Priority Support
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      Premium emojis
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      More friends
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      More profile customization
                    </li>
                  </ul>
                  <Button variant="outline" className="w-full" onClick={() => { setSelectedPlan('premium'); setShowFeaturesModal(true); }}>
                    See Full Features
                  </Button>
                  <Button className="w-full" onClick={() => navigate('/billing')}>
                    Get Premium
                  </Button>
                </CardContent>
              </Card>

              {/* Builder Plan */}
              <Card className="border-2 hover:border-primary/50 transition-colors">
                <CardHeader>
                  <CardTitle>Builder Plan</CardTitle>
                  <CardDescription>Everything you need to create</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold">$9.99</span>
                    <span className="text-sm text-muted-foreground">/month</span>
                  </div>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      Advanced analytics
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      Higher upload limit
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      Custom game page
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      Priority review
                    </li>
                  </ul>
                  <Button variant="outline" className="w-full" onClick={() => { setSelectedPlan('builder'); setShowFeaturesModal(true); }}>
                    See Full Features
                  </Button>
                  <Button className="w-full" onClick={() => navigate('/billing')}>
                    Get Builder
                  </Button>
                </CardContent>
              </Card>

              {/* Bundle Plan */}
              <Card className="border-2 border-primary bg-primary/5 relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-semibold">
                  Best Value
                </div>
                <CardHeader>
                  <CardTitle>Bundle</CardTitle>
                  <CardDescription>Premium + Builder together</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold">$13.99</span>
                    <span className="text-sm text-muted-foreground">/month</span>
                    <span className="text-xs text-green-600 dark:text-green-400 ml-1">Save $0.99</span>
                  </div>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      All Premium features
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      All Builder features
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      Maximum savings
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      Priority everything
                    </li>
                  </ul>
                  <Button className="w-full" size="lg" onClick={() => navigate('/billing')}>
                    Get Bundle
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="bg-muted/50 border border-border rounded-lg p-4 text-sm text-muted-foreground">
              <p>All plans include a 7-day free trial. Cancel anytime. Prices shown are in USD.</p>
            </div>

            {/* Features Modal */}
            {showFeaturesModal && (
              <div 
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
                onClick={() => setShowFeaturesModal(false)}
              >
                <div 
                  className="bg-card border border-border rounded-xl max-w-lg w-full max-h-[80vh] overflow-y-auto animate-in zoom-in duration-200"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-foreground">
                        {selectedPlan === 'premium' ? 'Premium Features' : 'Builder Plan Features'}
                      </h3>
                      <button 
                        onClick={() => setShowFeaturesModal(false)}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        ✕
                      </button>
                    </div>

                    {selectedPlan === 'premium' ? (
                      <ul className="space-y-3">
                        <li className="flex items-start gap-3">
                          <Check className="h-5 w-5 text-green-500 mt-0.5" />
                          <div>
                            <p className="font-medium text-foreground">Priority Support</p>
                            <p className="text-sm text-muted-foreground">Get faster response times from our support team</p>
                          </div>
                        </li>
                        <li className="flex items-start gap-3">
                          <Check className="h-5 w-5 text-green-500 mt-0.5" />
                          <div>
                            <p className="font-medium text-foreground">Premium Emojis</p>
                            <p className="text-sm text-muted-foreground">Access to exclusive emoji packs and animated emojis</p>
                          </div>
                        </li>
                        <li className="flex items-start gap-3">
                          <Check className="h-5 w-5 text-green-500 mt-0.5" />
                          <div>
                            <p className="font-medium text-foreground">More Friends</p>
                            <p className="text-sm text-muted-foreground">Increased friend limit for your social network</p>
                          </div>
                        </li>
                        <li className="flex items-start gap-3">
                          <Check className="h-5 w-5 text-green-500 mt-0.5" />
                          <div>
                            <p className="font-medium text-foreground">More Profile Customization</p>
                            <p className="text-sm text-muted-foreground">Advanced profile themes, banners, and customization options</p>
                          </div>
                        </li>
                        <li className="flex items-start gap-3">
                          <Check className="h-5 w-5 text-green-500 mt-0.5" />
                          <div>
                            <p className="font-medium text-foreground">Custom Status Messages</p>
                            <p className="text-sm text-muted-foreground">Set custom status messages for your profile</p>
                          </div>
                        </li>
                        <li className="flex items-start gap-3">
                          <Check className="h-5 w-5 text-green-500 mt-0.5" />
                          <div>
                            <p className="font-medium text-foreground">Monthly Credits (RZ)</p>
                            <p className="text-sm text-muted-foreground">Receive monthly RZ credits to spend in the store</p>
                          </div>
                        </li>
                        <li className="flex items-start gap-3">
                          <Check className="h-5 w-5 text-green-500 mt-0.5" />
                          <div>
                            <p className="font-medium text-foreground">Animated Profile Picture</p>
                            <p className="text-sm text-muted-foreground">Upload animated GIFs as your profile picture</p>
                          </div>
                        </li>
                        <li className="flex items-start gap-3">
                          <Check className="h-5 w-5 text-green-500 mt-0.5" />
                          <div>
                            <p className="font-medium text-foreground">Premium Accessories</p>
                            <p className="text-sm text-muted-foreground">Exclusive accessories for your avatar and profile</p>
                          </div>
                        </li>
                        <li className="flex items-start gap-3">
                          <Check className="h-5 w-5 text-green-500 mt-0.5" />
                          <div>
                            <p className="font-medium text-foreground">Premium Tag</p>
                            <p className="text-sm text-muted-foreground">Show off your Premium status with a special badge</p>
                          </div>
                        </li>
                        <li className="flex items-start gap-3">
                          <Check className="h-5 w-5 text-green-500 mt-0.5" />
                          <div>
                            <p className="font-medium text-foreground">Premium Post Reactions</p>
                            <p className="text-sm text-muted-foreground">Exclusive reaction options for your posts</p>
                          </div>
                        </li>
                        <li className="flex items-start gap-3">
                          <Check className="h-5 w-5 text-green-500 mt-0.5" />
                          <div>
                            <p className="font-medium text-foreground">Exclusive Discounts</p>
                            <p className="text-sm text-muted-foreground">Get special discounts on store items and events</p>
                          </div>
                        </li>
                      </ul>
                    ) : (
                      <ul className="space-y-3">
                        <li className="flex items-start gap-3">
                          <Check className="h-5 w-5 text-green-500 mt-0.5" />
                          <div>
                            <p className="font-medium text-foreground">Advanced Analytics</p>
                            <p className="text-sm text-muted-foreground">Detailed analytics for your games and content</p>
                          </div>
                        </li>
                        <li className="flex items-start gap-3">
                          <Check className="h-5 w-5 text-green-500 mt-0.5" />
                          <div>
                            <p className="font-medium text-foreground">Higher Upload Limit</p>
                            <p className="text-sm text-muted-foreground">Upload larger files and assets for your projects</p>
                          </div>
                        </li>
                        <li className="flex items-start gap-3">
                          <Check className="h-5 w-5 text-green-500 mt-0.5" />
                          <div>
                            <p className="font-medium text-foreground">Custom Game Page</p>
                            <p className="text-sm text-muted-foreground">Fully customizable game pages with advanced options</p>
                          </div>
                        </li>
                        <li className="flex items-start gap-3">
                          <Check className="h-5 w-5 text-green-500 mt-0.5" />
                          <div>
                            <p className="font-medium text-foreground">Priority Review</p>
                            <p className="text-sm text-muted-foreground">Get your games reviewed and approved faster</p>
                          </div>
                        </li>
                        <li className="flex items-start gap-3">
                          <Check className="h-5 w-5 text-green-500 mt-0.5" />
                          <div>
                            <p className="font-medium text-foreground">Create Big Game Events</p>
                            <p className="text-sm text-muted-foreground">Host tournaments with RSVP system for large events</p>
                          </div>
                        </li>
                        <li className="flex items-start gap-3">
                          <Check className="h-5 w-5 text-green-500 mt-0.5" />
                          <div>
                            <p className="font-medium text-foreground">More Games to Publish</p>
                            <p className="text-sm text-muted-foreground">Publish more games (Free users limited to 5, Builders get unlimited)</p>
                          </div>
                        </li>
                      </ul>
                    )}

                    <Button 
                      className="w-full mt-6" 
                      onClick={() => setShowFeaturesModal(false)}
                    >
                      Close
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const lastUpdated = profile?.updated_at
    ? new Date(profile.updated_at).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
    : '—';

  return (
    <div className="p-4 sm:p-6">
      {/* Username Change Dialog */}
      <Dialog open={usernameChangeOpen} onOpenChange={setUsernameChangeOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Username</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="new-username">New Username</Label>
              <Input
                id="new-username"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="Enter new username"
                className={usernameError ? 'border-destructive' : ''}
              />
              {usernameError && <p className="text-xs text-destructive mt-1">{usernameError}</p>}
              {!usernameError && usernameAvailable === true && (
                <p className="text-xs text-green-600 mt-1">Username is available!</p>
              )}
              {checkingUsername && <p className="text-xs text-muted-foreground mt-1">Checking availability...</p>}
            </div>
            <p className="text-xs text-muted-foreground">
              You can only change your username once every 7 days. This change cannot be undone.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUsernameChangeOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleChangeUsername}
              disabled={!newUsername || !!usernameError || !usernameAvailable || saving}
            >
              {saving ? 'Changing...' : 'Change Username'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex flex-wrap items-baseline justify-between gap-2 mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">{t('settings.title')}</h1>
        <span className="text-[11px] sm:text-xs text-muted-foreground">
          {t('settings.lastUpdated')}: <span className="text-foreground font-medium">{lastUpdated}</span>
        </span>
      </div>

      {/* Mobile horizontal nav */}
      <nav className="md:hidden -mx-4 px-4 mb-4 flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden snap-x">
        {SETTINGS_SECTIONS.map((section) => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={`shrink-0 snap-start px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
              activeSection === section.id
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-card text-muted-foreground border-border hover:text-foreground'
            }`}
          >
            {section.label}
            {'soon' in section && section.soon && <span className="ml-1 opacity-60">·soon</span>}
          </button>
        ))}
        <button
          className="shrink-0 snap-start px-3 py-1.5 rounded-full text-xs font-medium border border-destructive/40 text-destructive bg-destructive/5"
          onClick={() => {
            if (window.confirm('Are you sure you want to log out of RazeHub?')) signOut();
          }}
        >
          {t('settings.logOut')}
        </button>
      </nav>

      <div className="flex flex-col md:flex-row gap-4 md:gap-6">
        <nav className="hidden md:block w-[220px] shrink-0 space-y-1">
          {SETTINGS_SECTIONS.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`flex items-center justify-between w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all ${
                activeSection === section.id
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              }`}
            >
              <span>{section.label}</span>
              {'soon' in section && section.soon && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">soon</span>
              )}
            </button>
          ))}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button className="flex items-center w-full text-left px-3 py-2.5 rounded-lg text-sm text-destructive hover:bg-destructive/10 mt-4 transition-colors">
                {t('settings.logOut')}
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Log out</AlertDialogTitle>
                <AlertDialogDescription>Are you sure you want to log out of RazeHub?</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={signOut}>Log out</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </nav>

        <div className="flex-1 bg-card border border-border rounded-lg p-4 sm:p-6 animate-fade-in">
          {renderSection()}
        </div>
      </div>
    </div>
  );
}
