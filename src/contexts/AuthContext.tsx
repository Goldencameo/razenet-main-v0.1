import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';


type Profile = Tables<'profiles'>;

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  refreshFriends: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profile: null,
  loading: true,
  signOut: async () => {},
  refreshProfile: async () => {},
  refreshFriends: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('id, user_id, username, username_lower, display_name, avatar_color, bio, status, created_at, updated_at')
      .eq('user_id', userId)
      .single();
    setProfile(data as Profile | null);
  };

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.id);
  };

  const refreshFriends = () => {
    // This will trigger a refresh in components that use the useFriends hook
    // The hook will automatically invalidate its cache when this is called
    window.dispatchEvent(new CustomEvent('refresh-friends'));
  };

  useEffect(() => {
    // Check for session in sessionStorage (for non-remember me logins)
    const checkSessionStorage = async () => {
      const sessionData = sessionStorage.getItem('supabase.session');
      if (sessionData) {
        try {
          const session = JSON.parse(sessionData);
          // Restore session
          await supabase.auth.setSession({
            access_token: session.access_token,
            refresh_token: session.refresh_token,
          });
          // Clear sessionStorage after restoring
          sessionStorage.removeItem('supabase.session');
        } catch (error) {
          console.error('Error restoring session from sessionStorage:', error);
          sessionStorage.removeItem('supabase.session');
        }
      }
    };

    checkSessionStorage();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchProfile(session.user.id);
          // Force cleanup: set ALL other users to offline immediately when logging in
          (async () => {
            try {
              await supabase.from('profiles')
                .update({ status: 'offline' as any } as any)
                .neq('user_id', session.user.id);
              refreshFriends();
            } catch (error) {
              console.error('Error cleaning up user statuses:', error);
            }
          })();
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
        // Force cleanup: set ALL other users to offline immediately when logging in
        (async () => {
          try {
            await supabase.from('profiles')
              .update({ status: 'offline' as any } as any)
              .neq('user_id', session.user.id);
            refreshFriends();
          } catch (error) {
            console.error('Error cleaning up user statuses:', error);
          }
        })();
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    // Set status to offline before signing out
    if (user) {
      await supabase.from('profiles').update({ status: 'offline' as any }).eq('user_id', user.id);
    }
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  // Heartbeat: update status to online immediately when user is active, offline when not
  useEffect(() => {
    if (!user) return;
    
    const setOnline = async () => {
      await supabase.from('profiles').update({
        status: 'online' as any,
        last_seen_at: new Date().toISOString(),
      } as any).eq('user_id', user.id);
      
      // Cleanup: set inactive users to offline
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      await supabase.from('profiles')
        .update({ status: 'offline' as any } as any)
        .lt('last_seen_at', fiveMinutesAgo.toISOString())
        .neq('user_id', user.id);
    };
    
    const setOffline = async () => {
      await supabase.from('profiles').update({
        status: 'offline' as any,
        last_seen_at: new Date().toISOString(),
      } as any).eq('user_id', user.id);
    };
    
    // Set online immediately when user logs in
    setOnline();
    
    // Keep heartbeat every 60 seconds to maintain online status
    const interval = setInterval(setOnline, 60_000);
    
    // Set offline on page hide or window close
    const handleVisibility = () => {
      if (document.hidden) {
        setOffline();
      } else {
        setOnline();
      }
    };
    
    const handleBeforeUnload = () => {
      setOffline();
    };
    
    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      // Set offline when component unmounts (app closed)
      setOffline();
    };
  }, [user?.id]);

  return (
    <AuthContext.Provider value={{ user, session, profile, loading, signOut, refreshProfile, refreshFriends }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
