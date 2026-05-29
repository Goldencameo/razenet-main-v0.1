import { ReactNode, useState, useRef, useEffect, createContext, useContext } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/lib/i18n';
import { supabase } from '@/integrations/supabase/client';
import {
  Home, Compass, MessageCircle, User, Settings, Search,
  ChevronDown, Circle, Moon, MinusCircle, EyeOff, Bell, Mail,
  ShoppingBag, Menu, X, UserPlus, Sparkles,
  Code2, Shield, Activity, PhoneCall, Mic, MicOff, LogOut, Music,
} from 'lucide-react';
import RazeHubLogo from '@/components/RazeHubLogo';
import GlobalMusicPlayer from '@/components/GlobalMusicPlayer';

function getGameGradient(name: string): string {
  const hash = name.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const hue1 = hash % 360;
  const hue2 = (hash * 7) % 360;
  return `linear-gradient(135deg, hsl(${hue1}, 60%, 40%), hsl(${hue2}, 50%, 50%))`;
}
import rzIcon from '@/assets/rz-icon.png';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import type { Database } from '@/integrations/supabase/types';
import { useNotifications } from '@/hooks/useNotifications';
import { useFriendship } from '@/hooks/useFriendship';
import { useToast } from '@/hooks/use-toast';
import NotificationsList from '@/components/NotificationsList';
import { useUserRoles } from '@/hooks/useUserRole';

type UserStatus = Database['public']['Enums']['user_status'];

interface AppLayoutProps {
  children: ReactNode;
}

interface ActivityContextType {
  activeCalls: any[];
  setActiveCalls: React.Dispatch<React.SetStateAction<any[]>>;
  friendActivities: any[];
  setFriendActivities: React.Dispatch<React.SetStateAction<any[]>>;
  addActiveCall: (call: any) => void;
  removeActiveCall: (id: number) => void;
  joinCall: (callId: number, userId: string) => void;
  leaveCall: (callId: number, userId: string) => void;
  toggleMute: (callId: number, userId: string) => void;
  updateCallDuration: (callId: number, duration: string) => void;
}

const ActivityContext = createContext<ActivityContextType | null>(null);

export const useActivity = () => {
  const context = useContext(ActivityContext);
  if (!context) throw new Error('useActivity must be used within ActivityProvider');
  return context;
};

export default function AppLayout({ children }: AppLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, refreshProfile, loading } = useAuth();
  const { t } = useI18n();
  const [notifOpen, setNotifOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<{ games: any[]; people: any[]; communities: any[] }>({ games: [], people: [], communities: [] });
  const searchRef = useRef<HTMLDivElement>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { items: notifications, unreadCount, markAllRead, remove } = useNotifications();
  const { isCreator, isDeveloper, isModerator } = useUserRoles();
  const { toast } = useToast();
  const [activeCalls, setActiveCalls] = useState<any[]>([]);
  const [friendActivities, setFriendActivities] = useState<any[]>([]);

  // Timer for updating call durations
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveCalls(activeCalls.map((call) => {
        const elapsed = Math.floor((Date.now() - call.startTime) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        const duration = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        return { ...call, duration };
      }));
    }, 1000);
    return () => clearInterval(interval);
  }, [activeCalls]);

  const addActiveCall = (call: any) => {
    const newCall = {
      ...call,
      participants: call.participants || [],
      startTime: Date.now(),
      duration: '0:00',
    };
    setActiveCalls([...activeCalls, newCall]);
    
    // Add friend activity for call creation
    const activity = {
      id: Date.now(),
      name: call.name,
      color: call.color,
      action: call.isGroup ? 'started a group call' : 'created a call',
      timestamp: Date.now(),
    };
    setFriendActivities([activity, ...friendActivities]);
  };

  const removeActiveCall = (id: number) => {
    setActiveCalls(activeCalls.filter((c) => c.id !== id));
  };

  const joinCall = (callId: number, userId: string) => {
    setActiveCalls(activeCalls.map((call) => {
      if (call.id === callId) {
        return {
          ...call,
          participants: [...call.participants, { userId, joinedAt: Date.now() }],
        };
      }
      return call;
    }));
    
    // Add friend activity for joining call
    const call = activeCalls.find((c) => c.id === callId);
    if (call) {
      const activity = {
        id: Date.now(),
        name: profile?.display_name || profile?.username || 'You',
        color: profile?.avatar_color || '#3B82F6',
        action: `joined call with ${call.name}`,
        timestamp: Date.now(),
      };
      setFriendActivities([activity, ...friendActivities]);
    }
  };

  const leaveCall = (callId: number, userId: string) => {
    setActiveCalls(activeCalls.map((call) => {
      if (call.id === callId) {
        return {
          ...call,
          participants: call.participants.filter((p: any) => p.userId !== userId),
        };
      }
      return call;
    }));
  };

  const toggleMute = (callId: number, userId: string) => {
    setActiveCalls(activeCalls.map((call) => {
      if (call.id === callId) {
        return {
          ...call,
          participants: call.participants.map((p: any) => {
            if (p.userId === userId) {
              return { ...p, muted: !p.muted };
            }
            return p;
          }),
        };
      }
      return call;
    }));
  };

  const updateCallDuration = (callId: number, duration: string) => {
    setActiveCalls(activeCalls.map((call) => {
      if (call.id === callId) {
        return { ...call, duration };
      }
      return call;
    }));
  };

  const activityContextValue: ActivityContextType = {
    activeCalls,
    setActiveCalls,
    friendActivities,
    setFriendActivities,
    addActiveCall,
    removeActiveCall,
    joinCall,
    leaveCall,
    toggleMute,
    updateCallDuration,
  };

  const displayName = profile?.display_name || profile?.username;
  const username = profile?.username;
  const avatarColor = profile?.avatar_color || '#3B82F6';
  const firstLetter = displayName ? (displayName[0] || 'U').toUpperCase() : '';
  const currentStatus = profile?.status || 'online';

  const navItems = [
    { label: t('nav.home'), path: '/home', icon: Home },
    { label: t('nav.discover'), path: '/discover', icon: Compass },
    { label: t('nav.chat'), path: '/chat', icon: MessageCircle },
    { label: 'Marketplace', path: '/marketplace', icon: ShoppingBag },
    { label: 'Music', path: '/music', icon: Music },
    { label: t('nav.mailbox'), path: '/mailbox', icon: Mail },
    { label: t('nav.profile'), path: '/profile', icon: User },
    { label: t('nav.settings'), path: '/settings', icon: Settings },
    ...(isDeveloper ? [{ label: 'Developer Hub', path: '/developer', icon: Code2, roleBadge: 'DEV' as const }] : []),
    ...(isCreator && !isDeveloper ? [{ label: 'Creator Studio', path: '/creator', icon: Sparkles, roleBadge: 'CRT' as const }] : []),
    ...(isCreator && isDeveloper ? [{ label: 'Creator Studio', path: '/creator', icon: Sparkles, roleBadge: 'CRT' as const }] : []),
    ...(isModerator ? [{ label: 'Moderation', path: '/moderation', icon: Shield, roleBadge: 'MOD' as const }] : []),
  ];

  const statusOptions: { value: UserStatus; label: string; color: string; icon: typeof Circle }[] = [
    { value: 'online', label: t('status.online'), color: 'bg-green-500', icon: Circle },
    { value: 'idle', label: t('status.idle'), color: 'bg-yellow-500', icon: Moon },
    { value: 'dnd', label: t('status.dnd'), color: 'bg-red-500', icon: MinusCircle },
    { value: 'invisible', label: t('status.invisible'), color: 'bg-gray-400', icon: EyeOff },
  ];

  const handleStatusChange = async (status: UserStatus) => {
    if (!profile) return;
    await supabase.from('profiles').update({ status }).eq('user_id', profile.user_id);
    refreshProfile();
  };

  const statusInfo = statusOptions.find(s => s.value === currentStatus) || statusOptions[0];

  // Search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults({ games: [], people: [], communities: [] });
      setSearchOpen(false);
      return;
    }
    setSearchOpen(true);
    const timeout = setTimeout(async () => {
      const q = searchQuery.trim().toLowerCase();
      console.log('🔍 Searching for:', q);
      const [gamesRes, peopleRes] = await Promise.all([
        supabase.from('games').select('id, name').ilike('name', `%${q}%`).limit(5),
        supabase.from('profiles').select('user_id, username, display_name, avatar_color').or(`username.ilike.%${q}%,display_name.ilike.%${q}%`).limit(5),
      ]);
      console.log('🔍 People search results:', peopleRes.data);
      console.log('🔍 People search error:', peopleRes.error);
      console.log('🔍 Current user ID:', profile?.user_id);
      // Filter out fake accounts that start with "user-" and current user
      const filteredPeople = ((peopleRes.data || []) as any[])
        .filter((p: any) => p.user_id !== profile?.user_id)
        .filter((p: any) => !p.username?.startsWith('user-'));
      
      console.log('🔍 Filtered people:', filteredPeople);
      
      setSearchResults({
        games: gamesRes.data || [],
        people: filteredPeople,
        communities: [], // Communities are not a separate entity, they're just usernames
      });
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchQuery, profile?.user_id]);

  // Close search on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setSearchOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close mobile nav on route change
  useEffect(() => { setMobileNavOpen(false); }, [location.pathname]);

  const sidebar = (mobile = false) => (
    <aside className={`${mobile ? 'w-full' : 'w-[240px] hidden md:flex'} border-r border-border flex flex-col bg-card shrink-0 h-full`}>
        <div className="p-4 pb-5">
          <div className="flex items-center justify-between">
            <Link to="/home" className="flex items-center min-w-0">
              <div className="min-w-0">
                <RazeHubLogo size="sm" />
              </div>
            </Link>
            {mobile && (
              <button onClick={() => setMobileNavOpen(false)} className="p-1 rounded hover:bg-accent">
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            )}
          </div>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          {navItems.map((item: any) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            const isBeta = item.badge === 'beta';
            return (
              <Link
                key={item.label}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-primary/10 text-primary shadow-sm'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground hover:translate-x-0.5'
                }`}
              >
                <Icon className={`h-5 w-5 transition-colors ${isActive ? 'text-primary' : ''}`} />
                <span>{item.label}</span>
                {item.roleBadge && (
                  <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-full bg-primary/15 text-primary font-semibold">
                    {item.roleBadge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className="p-3 border-t border-border">
          {loading ? (
            <div className="flex items-center gap-2.5 p-2">
              <div className="w-10 h-10 rounded-full bg-muted animate-pulse" />
              <div className="flex-1 space-y-1">
                <div className="h-4 bg-muted rounded w-24 animate-pulse" />
                <div className="h-3 bg-muted rounded w-16 animate-pulse" />
              </div>
            </div>
          ) : (
            <>
              <div
                className="flex items-center gap-2.5 cursor-pointer rounded-lg p-2 -m-1 hover:bg-accent/80 transition-all duration-200 group"
                onClick={() => navigate('/profile')}
              >
                <div className="relative">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 shadow-sm"
                    style={{ backgroundColor: avatarColor, color: 'white' }}
                  >
                    {firstLetter}
                  </div>
                  <div
                    className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-card ${statusInfo.color} transition-colors`}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground truncate">{displayName}</p>
                  <p className="text-xs text-muted-foreground truncate">@{username}</p>
                </div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-1.5 mt-2 px-2 py-1.5 text-xs rounded-lg hover:bg-accent w-full transition-colors">
                    <div className={`w-2.5 h-2.5 rounded-full ${statusInfo.color}`} />
                    <span className="text-muted-foreground">{statusInfo.label}</span>
                    <ChevronDown className="h-3 w-3 ml-auto text-muted-foreground" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  {statusOptions.map((opt) => (
                    <DropdownMenuItem key={opt.value} onClick={() => handleStatusChange(opt.value)}>
                      <div className={`w-2.5 h-2.5 rounded-full mr-2 ${opt.color}`} />
                      {opt.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>
      </aside>
  );

  return (
    <ActivityContext.Provider value={activityContextValue}>
      <div className="flex h-screen bg-background overflow-hidden">
        {sidebar(false)}

      {/* Mobile drawer */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-foreground/40" onClick={() => setMobileNavOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-[260px] bg-card shadow-xl">
            {sidebar(true)}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="h-16 border-b border-border bg-card flex items-center px-3 sm:px-5 gap-2 sm:gap-4 shrink-0">
          <button onClick={() => setMobileNavOpen(true)} className="md:hidden p-2 rounded hover:bg-accent">
            <Menu className="h-5 w-5 text-muted-foreground" />
          </button>
          {/* Search Bar */}
          <div className="flex-1 max-w-[320px] sm:max-w-[520px] relative" ref={searchRef}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder={t('search.placeholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.trim() && setSearchOpen(true)}
                className="w-full h-10 pl-9 pr-3 rounded-lg bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
              />
            </div>
            {searchOpen && (searchResults.games.length > 0 || searchResults.people.length > 0) && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-lg z-50 overflow-hidden animate-fade-in">
                {searchResults.games.length > 0 && (
                  <div className="p-2">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-1">{t('search.games')}</p>
                    {searchResults.games.map(g => (
                      <button key={g.id} className="w-full text-left px-3 py-2 rounded-md hover:bg-accent text-sm text-foreground flex items-center gap-2 transition-colors"
                        onClick={() => { navigate(`/game/${g.id}`); setSearchOpen(false); setSearchQuery(''); }}>
                        <div className="w-7 h-7 rounded flex items-center justify-center text-[10px] font-bold shrink-0"
                          style={{ background: getGameGradient(g.name), color: 'white' }}>
                          {g.name[0]?.toUpperCase()}
                        </div>
                        {g.name}
                      </button>
                    ))}
                  </div>
                )}
                {searchResults.people.length > 0 && (
                  <div className="p-2 border-t border-border">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-1">{t('search.people')}</p>
                    {searchResults.people.map(p => (
                      <button key={p.user_id} className="w-full text-left px-3 py-2 rounded-md hover:bg-accent text-sm text-foreground flex items-center gap-2 transition-colors"
                        onClick={() => { 
                          console.log('🔍 Navigating to profile:', p.user_id, 'username:', p.username);
                          navigate(`/profile/${p.user_id}`); 
                          setSearchOpen(false); 
                          setSearchQuery(''); 
                        }}>
                        <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
                          style={{ backgroundColor: p.avatar_color || '#3B82F6', color: 'white' }}>
                          {(p.display_name || p.username)?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div>
                          <p className="font-medium">{p.display_name || p.username}</p>
                          <p className="text-xs text-muted-foreground">@{p.username}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
            {searchOpen && searchQuery.trim() && searchResults.games.length === 0 && searchResults.people.length === 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-lg z-50 p-4 text-sm text-muted-foreground text-center animate-fade-in">
                {t('search.noResults')}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 sm:gap-3 ml-auto">
            {/* RZ Currency */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="hidden sm:flex items-center gap-1.5 text-sm px-2 py-1.5 rounded-lg hover:bg-accent transition-colors">
              <img src={rzIcon} alt="RZ" className="h-6 w-6 object-contain" />
              <span className="font-bold text-foreground">RZ</span>
              <span className="text-muted-foreground">0</span>
              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigate('/buy-rz')}>
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  Buy RZ
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/transactions')}>
                  <Activity className="h-4 w-4 mr-2" />
                  Transactions
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/redeem-codes')}>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Redeem Codes
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Notification Bell */}
            <Popover open={notifOpen} onOpenChange={(open) => {
              setNotifOpen(open);
              if (open && unreadCount > 0) markAllRead.mutate();
            }}>
              <PopoverTrigger asChild>
                <button className="relative p-2 sm:p-2.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-all duration-200 hover:scale-105">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <div className="absolute top-1 right-1 min-w-[16px] h-[16px] sm:min-w-[18px] sm:h-[18px] px-0.5 sm:px-1 rounded-full bg-destructive text-destructive-foreground text-[9px] sm:text-[10px] font-bold flex items-center justify-center animate-pulse">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </div>
                  )}
                </button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-[320px] sm:w-[360px] max-w-[calc(100vw-1rem)] p-0">
                <div className="p-3 border-b border-border flex items-center justify-between bg-gradient-to-r from-primary/5 to-transparent">
                  <span className="font-semibold text-foreground">{t('notif.title')}</span>
                  {unreadCount > 0 && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/15 text-primary font-semibold">
                      {unreadCount} {t('notif.new')}
                    </span>
                  )}
                </div>
                <NotificationsList
                  items={notifications}
                  onAction={() => setNotifOpen(false)}
                  onAccept={async (n: any) => {
                    if (!n.actor_id || !profile) return;
                    const { data: row } = await supabase.from('friendships').select('id, status')
                      .eq('requester_id', n.actor_id).eq('addressee_id', profile.user_id).maybeSingle();
                    if (row && row.status === 'pending') {
                      await supabase.from('friendships').update({ status: 'accepted' }).eq('id', row.id);
                      toast({ title: 'Friend added' });
                    }
                    await supabase.from('notifications').delete().eq('id', n.id);
                  }}
                  onIgnore={async (n: any) => {
                    if (!n.actor_id || !profile) return;
                    const { data: row } = await supabase.from('friendships').select('id')
                      .eq('requester_id', n.actor_id).eq('addressee_id', profile.user_id).maybeSingle();
                    if (row) await supabase.from('friendships').delete().eq('id', row.id);
                    await supabase.from('notifications').delete().eq('id', n.id);
                  }}
                  onDismiss={(id: string) => remove.mutate(id)}
                />
              </PopoverContent>
            </Popover>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          {children}
        </main>
      </div>

      {/* Right Sidebar */}
      <aside className="w-[260px] border-l border-border bg-card p-4 overflow-y-auto hidden lg:block shrink-0">
        {/* Active Calls Section */}
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
            <PhoneCall className="h-3.5 w-3.5" /> Active Calls
          </h3>
          {activeCalls.length === 0 ? (
            <div className="bg-muted/30 border border-border border-dashed rounded-lg p-3">
              <p className="text-sm text-muted-foreground">No active calls</p>
            </div>
          ) : (
            <div className="space-y-2">
              {activeCalls.map((call: any) => (
                <div key={call.id} className="bg-primary/10 border border-primary/20 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-foreground text-sm">{call.name}</span>
                    <span className="text-xs text-muted-foreground">{call.duration}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleMute(call.id, profile?.user_id || '')}
                      className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md transition-colors text-xs ${
                        call.participants.find((p: any) => p.userId === profile?.user_id)?.muted
                          ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                          : 'bg-background hover:bg-accent text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {call.participants.find((p: any) => p.userId === profile?.user_id)?.muted ? <MicOff className="h-3 w-3" /> : <Mic className="h-3 w-3" />}
                      Mute
                    </button>
                    <button
                      onClick={() => {
                        leaveCall(call.id, profile?.user_id || '');
                        if (call.participants.length <= 1) {
                          removeActiveCall(call.id);
                        }
                      }}
                      className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md bg-destructive/10 hover:bg-destructive/20 text-destructive transition-colors text-xs"
                    >
                      <LogOut className="h-3 w-3" /> Leave
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Friend Activity Section */}
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
            <Activity className="h-3.5 w-3.5" /> Friend Activity
          </h3>
          {friendActivities.length === 0 ? (
            <div className="bg-muted/30 border border-border border-dashed rounded-lg p-3">
              <p className="text-sm text-muted-foreground">No recent activity</p>
            </div>
          ) : (
            <div className="space-y-2">
              {friendActivities.map((activity: any) => (
                <div key={activity.id} className="p-2 rounded-md hover:bg-accent transition-colors">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-xs sm:text-[10px] font-bold shrink-0"
                      style={{ backgroundColor: activity.color, color: 'white' }}
                    >
                      {(activity.name?.[0] || 'U').toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm sm:text-xs text-foreground truncate">{activity.name}</div>
                      <div className="text-xs sm:text-[10px] text-muted-foreground truncate">{activity.action}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Music Player or Ad Section - Only one shows at bottom */}
        <div className="mt-auto">
          <GlobalMusicPlayer />
        </div>
      </aside>
      </div>
    </ActivityContext.Provider>
  );
}
