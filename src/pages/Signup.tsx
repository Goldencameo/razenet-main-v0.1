import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Eye, EyeOff, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import RazeHubLogo from '@/components/RazeHubLogo';
import { validateUsername, validatePassword, getRandomAvatarColor } from '@/lib/username-validation';
import { useI18n } from '@/lib/i18n';

export default function Signup() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [repeatPasswordError, setRepeatPasswordError] = useState('');
  const navigate = useNavigate();
  const { t } = useI18n();

  useEffect(() => {
    const validation = validateUsername(username);
    if (!validation.valid) {
      setUsernameError(validation.error || '');
      setUsernameAvailable(null);
      return;
    }
    setUsernameError('');
    setCheckingUsername(true);
    const timeout = setTimeout(async () => {
      const { data, error } = await supabase.rpc('check_username_available', { desired_username: username });
      setCheckingUsername(false);
      if (!error && data !== null) {
        setUsernameAvailable(data);
        if (!data) setUsernameError('This username is already taken');
      }
    }, 500);
    return () => clearTimeout(timeout);
  }, [username]);

  useEffect(() => {
    if (password) {
      const v = validatePassword(password);
      setPasswordError(v.valid ? '' : v.error || '');
    } else setPasswordError('');
  }, [password]);

  useEffect(() => {
    if (repeatPassword && password !== repeatPassword) setRepeatPasswordError('Passwords do not match');
    else setRepeatPasswordError('');
  }, [repeatPassword, password]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const uv = validateUsername(username);
    if (!uv.valid) { setUsernameError(uv.error || ''); return; }
    if (!usernameAvailable) { setUsernameError('This username is already taken'); return; }
    const pv = validatePassword(password);
    if (!pv.valid) { setPasswordError(pv.error || ''); return; }
    if (password !== repeatPassword) { setRepeatPasswordError('Passwords do not match'); return; }
    if (!acceptTerms) { setError('You must accept the Terms & Privacy Policy'); return; }

    setLoading(true);
    const signupEmail = `${username.toLowerCase()}@razehub.local`;
    const avatarColor = getRandomAvatarColor();
    const redirectUrl = `${window.location.origin}/home`;

    // 1. Create auth user
    const { data, error: authError } = await supabase.auth.signUp({
      email: signupEmail,
      password,
      options: {
        data: { username, avatar_color: avatarColor },
        emailRedirectTo: redirectUrl,
      },
    });

    // Debug logging (remove after fixing)
    console.log('🔍 Auth signUp result:', { data, error: authError });

    if (authError) {
      const msg = authError.message?.toLowerCase().includes('already')
        ? 'An account already exists for this username or email. Try logging in.'
        : authError.message || 'Could not create account. Please try again.';
      setError(msg);
      setLoading(false);
      return;
    }

    if (!data.user) {
      setError('Signup failed – no user returned');
      setLoading(false);
      return;
    }

    // 2. Insert profile row manually (your new Supabase has no automatic trigger)
    console.log("=== DEBUGGING USERNAME ISSUE ===");
    console.log("signup options username:", username);
    console.log("username type:", typeof username);
    console.log("username length:", username?.length);
    console.log("username.trim():", username?.trim());
    console.log("username.trim().length:", username?.trim()?.length);
    console.log("data.user.id:", data.user.id);
    
    // Force capture the username right now
    const capturedUsername = username?.trim() || '';
    console.log("capturedUsername:", capturedUsername);
    
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .upsert(
        {
          user_id: data.user.id,
          username: capturedUsername, // should be "Glagol"
          username_lower: capturedUsername.toLowerCase(), // "glagol"
          display_name: capturedUsername, // "Glagol"
          avatar_color: avatarColor,
          status: 'invisible' as const,
        },
        { onConflict: 'user_id' }
      )
      .select()
      .single();
    
    if (profileError) console.error(profileError);
    console.log('🔍 Profile upsert result:', profile);
    console.log("=== END DEBUGGING ===");

    if (profileError) {
      console.error('❌ Profile insert error:', profileError);
      setError('Could not create profile. ' + (profileError.message || 'Please try again.'));
      // Don't sign out - let user stay logged in but show error
      setLoading(false);
      return;
    }

    // 3. Refresh profile data so AuthContext has the correct username
    console.log('🔍 Refreshing profile data...');
    const { data: refreshedProfile } = await supabase
      .from('profiles')
      .select('id, user_id, username, username_lower, display_name, avatar_color, bio, status, created_at, updated_at')
      .eq('user_id', data.user.id)
      .single();
    
    console.log('🔍 Refreshed profile:', refreshedProfile);

    // 4. Welcome notification (optional)
    if (typeof window !== 'undefined') {
      localStorage.setItem(`razehub.pendingWelcome.${data.user.id}`, '1');
      try {
        const { ensureWelcomeNotification } = await import('@/hooks/useNotifications');
        await ensureWelcomeNotification(data.user.id);
      } catch { /* non-blocking */ }
    }

    navigate('/home');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-6 p-8">
        <div className="flex flex-col items-center space-y-2">
          <RazeHubLogo size="lg" />
          <p className="text-muted-foreground">{t('auth.createAccount')}</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground">{t('settings.username')}</label>
            <div className="relative">
              <Input type="text" placeholder={t('auth.chooseUsername')} value={username} onChange={(e) => setUsername(e.target.value)}
                className={usernameError ? 'border-destructive pr-10' : usernameAvailable ? 'border-green-500 pr-10' : 'pr-10'} required />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {checkingUsername && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                {!checkingUsername && usernameAvailable === true && !usernameError && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                {!checkingUsername && (usernameAvailable === false || usernameError) && username && <XCircle className="h-4 w-4 text-destructive" />}
              </div>
            </div>
            {usernameError && <p className="text-xs text-destructive">{usernameError}</p>}
            {!usernameError && usernameAvailable && <p className="text-xs text-green-600">Username is available!</p>}
            <p className="text-xs text-muted-foreground">3-20 chars. Letters, numbers, _ and . allowed.</p>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground">{t('auth.password')}</label>
            <div className="relative">
              <Input type={showPassword ? 'text' : 'password'} placeholder={t('auth.createPassword')} value={password}
                onChange={(e) => setPassword(e.target.value)} className={passwordError ? 'border-destructive pr-10' : 'pr-10'} required />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {passwordError && <p className="text-xs text-destructive">{passwordError}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground">{t('auth.repeatPassword')}</label>
            <div className="relative">
              <Input type={showRepeatPassword ? 'text' : 'password'} placeholder={t('auth.repeatPassword')} value={repeatPassword}
                onChange={(e) => setRepeatPassword(e.target.value)} className={repeatPasswordError ? 'border-destructive pr-10' : 'pr-10'} required />
              <button type="button" onClick={() => setShowRepeatPassword(!showRepeatPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                {showRepeatPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {repeatPasswordError && <p className="text-xs text-destructive">{repeatPasswordError}</p>}
          </div>

          <div className="flex items-start gap-2">
            <Checkbox id="terms" checked={acceptTerms} onCheckedChange={(checked) => setAcceptTerms(checked as boolean)} className="mt-0.5" />
            <label htmlFor="terms" className="text-sm text-muted-foreground cursor-pointer leading-tight">
              {t('auth.terms')} <span className="text-primary hover:underline">{t('auth.termsOfService')}</span> {t('auth.and')}{' '}
              <span className="text-primary hover:underline">{t('auth.privacyPolicy')}</span>
            </label>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" className="w-full h-12 text-base font-semibold" disabled={loading}>
            {loading ? t('auth.creatingAccount') : t('auth.createAccountBtn')}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          {t('auth.haveAccount')}{' '}
          <Link to="/" className="font-semibold text-primary hover:underline">
            {t('auth.logInLink')}
          </Link>
        </p>
      </div>
    </div>
  );
}