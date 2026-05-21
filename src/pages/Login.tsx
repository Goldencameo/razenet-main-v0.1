import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Eye, EyeOff, Gamepad2 } from 'lucide-react';
import RazeHubLogo from '@/components/RazeHubLogo';
import { useToast } from '@/hooks/use-toast';
import { useI18n } from '@/lib/i18n';

export default function Login() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useI18n();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let authResult;

      if (identifier.includes('@')) {
        // Direct email login
        authResult = await supabase.auth.signInWithPassword({
          email: identifier,
          password,
        });
      } else {
        // Username login - convert to email format
        const email = `${identifier.toLowerCase()}@razehub.local`;
        authResult = await supabase.auth.signInWithPassword({
          email,
          password,
        });
      }

      if (authResult.error) {
        setError('Invalid credentials. Please try again.');
      } else {
        // If remember me is not checked, store session in sessionStorage instead of localStorage
        if (!rememberMe && authResult.data.session) {
          // Get current session data
          const sessionData = authResult.data.session;
          // Store in sessionStorage
          sessionStorage.setItem('supabase.session', JSON.stringify(sessionData));
          // Remove from localStorage
          localStorage.removeItem('supabase.auth.token');
          localStorage.removeItem('supabase.auth.refreshToken');
        }
        navigate('/home');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-8 p-8">
        <div className="flex flex-col items-center space-y-2">
          <RazeHubLogo size="lg" />
          <p className="text-muted-foreground">{t('auth.signIn')}</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">{t('auth.usernameOrEmail')}</label>
            <Input
              type="text"
              placeholder={t('auth.usernameOrEmail')}
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className={error ? 'border-destructive' : ''}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">{t('auth.password')}</label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder={t('auth.password')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={error ? 'border-destructive pr-10' : 'pr-10'}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
              />
              <label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer">
                {t('auth.rememberMe')}
              </label>
            </div>
            <div className="flex gap-3">
              <button type="button" className="text-sm text-primary hover:underline cursor-not-allowed opacity-60">
                {t('auth.forgotPassword')}
              </button>
            </div>
          </div>

          <Button type="submit" className="w-full h-12 text-base font-semibold" disabled={loading}>
            {loading ? t('auth.signingIn') : t('auth.logIn')}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          {t('auth.noAccount')}{' '}
          <Link to="/signup" className="font-semibold text-primary hover:underline">
            {t('auth.signUp')}
          </Link>
        </p>
      </div>
    </div>
  );
}
