import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useFriendship } from '@/hooks/useFriendship';
import { Users, ExternalLink, Plus, Crown, ArrowLeft, Pencil, Sprout, Check, Edit, UserPlus, UserMinus, UserCheck, Backpack, User } from 'lucide-react';
import { AlertTriangle } from 'lucide-react';
import EmptyBubble from '@/components/EmptyBubble';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  ThumbsUp, ThumbsDown, MessageCircle, Share2, X,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

function getGameGradient(name: string): string {
  const hash = name.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const hue1 = hash % 360;
  const hue2 = (hash * 7) % 360;
  return `linear-gradient(135deg, hsl(${hue1}, 60%, 40%), hsl(${hue2}, 50%, 50%))`;
}

function gradientFor(name: string, salt: number): string {
  const hash = name.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0) + salt * 137;
  const hue1 = hash % 360;
  const hue2 = (hash * 7 + salt * 53) % 360;
  return `linear-gradient(135deg, hsl(${hue1}, 80%, 25%), hsl(${hue2}, 80%, 15%))`;
}

export default function Profile() {
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();
  const { profile, refreshProfile } = useAuth();
  const { t } = useI18n();
  const { toast } = useToast();
  
  console.log('🔍 Profile page - userId:', userId, 'current profile:', profile?.user_id);

  // Fetch target user's profile if viewing someone else's profile
  const { data: targetProfile, isLoading: profileLoading, error: profileError } = useQuery({
    queryKey: ['profile', userId],
    queryFn: async () => {
      if (!userId) return null;
      console.log('🔍 Fetching profile for userId:', userId);
      const { data, error } = await supabase.from('profiles').select('*').eq('user_id', userId).single();
      console.log('🔍 Target profile query result:', { userId, data, error });
      if (error) {
        console.error('❌ Profile query error:', error);
        throw error;
      }
      return data;
    },
    enabled: !!userId,
    retry: false,
  });

  // Use target profile if viewing someone else, otherwise use current user's profile
  const viewProfile = targetProfile || profile;

  // Friendship functionality for viewing other profiles
  const { query: friendQuery, sendRequest, cancelOrRemove, accept } = useFriendship(userId);
  const isViewingOtherProfile = !!userId && userId !== profile?.user_id;

  const [joinedCommunities, setJoinedCommunities] = useState<string[]>(() => {
    // Load from localStorage on mount - only for current user
    if (!profile?.user_id) return [];
    const saved = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem(`communities_${profile.user_id}`) || '[]') : [];
    return saved;
  });
  
  // Save to localStorage when joinedCommunities changes
  useEffect(() => {
    if (joinedCommunities.length > 0 && profile) {
      localStorage.setItem(`communities_${profile.user_id}`, JSON.stringify(joinedCommunities));
    }
  }, [joinedCommunities, profile?.user_id]);
  
  const [bio, setBio] = useState(profile?.bio || '');
  const [saving, setSaving] = useState(false);
  const [bioEditing, setBioEditing] = useState(false);

  // Edit profile state
  const [editOpen, setEditOpen] = useState(false);
  const [editAvatarColor, setEditAvatarColor] = useState(() => {
    const savedColor = typeof window !== 'undefined' ? localStorage.getItem('avatar_color') : null;
    return viewProfile?.avatar_color || savedColor || '#3B82F6';
  });
  const [bannerStyle, setBannerStyle] = useState<'solid' | 'gradient'>(() => {
    const savedStyle = typeof window !== 'undefined' ? localStorage.getItem('banner_style') : null;
    return (savedStyle as 'solid' | 'gradient') || 'gradient';
  });
  const [bannerColor1, setBannerColor1] = useState(() => {
    const savedColor = typeof window !== 'undefined' ? localStorage.getItem('banner_color1') : null;
    if (savedColor) return savedColor;
    const avatarColor = viewProfile?.avatar_color || (typeof window !== 'undefined' ? localStorage.getItem('avatar_color') : null) || '#3B82F6';
    return avatarColor;
  });
  // Banner color 1 matches avatar color by default but can be changed
  const [bannerColor2, setBannerColor2] = useState(() => {
    const savedColor = typeof window !== 'undefined' ? localStorage.getItem('banner_color2') : null;
    if (savedColor) return savedColor;
    // Randomize banner color 2 based on avatar color
    const baseColor = viewProfile?.avatar_color || (typeof window !== 'undefined' ? localStorage.getItem('avatar_color') : null) || '#3B82F6';
    const hash = baseColor.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
    const hue = (hash * 7) % 360;
    return `hsl(${hue}, 70%, 50%)`;
  });
  const [savingProfile, setSavingProfile] = useState(false);

  const displayName = viewProfile?.display_name || viewProfile?.username;
  const username = viewProfile?.username;
  const avatarColor = (() => {
    const savedColor = typeof window !== 'undefined' ? localStorage.getItem('avatar_color') : null;
    return viewProfile?.avatar_color || savedColor || '#3B82F6';
  })();
  const firstLetter = displayName ? (displayName[0] || 'U').toUpperCase() : '';
  const createdAt = viewProfile?.created_at ? new Date(viewProfile.created_at) : new Date();
  const memberSince = createdAt.getFullYear();

  const twoWeeksAgo = new Date();
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
  const isNewPlayer = createdAt > twoWeeksAgo;

  const bannerBg = bannerStyle === 'gradient'
    ? `linear-gradient(135deg, ${bannerColor1}, ${bannerColor2})`
    : bannerColor1;

  // Show loading state if fetching target profile
  if (profileLoading && userId) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-b-primary/60 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
          </div>
          <p className="text-sm text-muted-foreground animate-pulse font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Show error if target profile not found or has error
  if (userId && (profileError || (!targetProfile && !profileLoading && userId !== profile?.user_id))) {
    return (
      <div className="p-6 text-center">
        <h1 className="text-2xl font-bold text-foreground mb-2">Profile Not Found</h1>
        <p className="text-muted-foreground mb-4">The profile you're looking for doesn't exist.</p>
        <Button onClick={() => navigate('/discover')}>
          Back to Discover
        </Button>
      </div>
    );
  }

  const { data: reviewCount } = useQuery({
    queryKey: ['review-count', viewProfile?.user_id],
    queryFn: async () => {
      if (!viewProfile) return 0;
      const { count } = await supabase.from('reviews').select('*', { count: 'exact', head: true }).eq('user_id', viewProfile.user_id);
      return count || 0;
    },
    enabled: !!viewProfile,
  });

  const { data: gameCount } = useQuery({
    queryKey: ['game-count', viewProfile?.user_id],
    queryFn: async () => {
      if (!viewProfile) return 0;
      const { count } = await supabase.from('user_games').select('*', { count: 'exact', head: true }).eq('user_id', viewProfile.user_id);
      return count || 0;
    },
    enabled: !!viewProfile,
  });

  const { data: friendCount } = useQuery({
    queryKey: ['friend-count', viewProfile?.user_id],
    queryFn: async () => {
      if (!viewProfile) return 0;
      const { count } = await supabase.from('friendships').select('*', { count: 'exact', head: true }).eq('status', 'accepted')
        .or(`requester_id.eq.${viewProfile.user_id},addressee_id.eq.${viewProfile.user_id}`);
      return count || 0;
    },
    enabled: !!viewProfile,
  });

  const { data: followerCount } = useQuery({
    queryKey: ['follower-count', viewProfile?.user_id],
    queryFn: async () => {
      if (!viewProfile) return 0;
      const { count } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('followee_id', viewProfile.user_id);
      return count || 0;
    },
    enabled: !!viewProfile,
  });

  const { data: favoriteGames } = useQuery({
    queryKey: ['favorite-games', viewProfile?.user_id],
    queryFn: async () => {
      if (!viewProfile) return [];
      const { data } = await supabase
        .from('user_games')
        .select('game_id, games(name, image_urls)')
        .eq('user_id', viewProfile.user_id)
        .eq('is_favorite', true);
      return data || [];
    },
    enabled: !!viewProfile,
  });

  const handleSaveBio = async () => {
    if (!profile) return;
    setSaving(true);
    const { error } = await supabase.from('profiles').update({ bio }).eq('user_id', profile.user_id);
    if (error) {
      toast({ title: t('settings.error'), description: t('settings.errorSave'), variant: 'destructive' });
    } else {
      toast({ title: t('settings.saved'), description: t('profile.savedBio') });
      refreshProfile();
    }
    setSaving(false);
  };

  const handleSaveProfile = async () => {
    if (!profile) return;
    setSavingProfile(true);
    const { error } = await supabase.from('profiles').update({ avatar_color: editAvatarColor }).eq('user_id', profile.user_id);
    if (error) {
      toast({ title: t('settings.error'), description: t('settings.errorSave'), variant: 'destructive' });
    } else {
      // Save banner colors to localStorage
      localStorage.setItem('banner_color1', bannerColor1);
      localStorage.setItem('banner_color2', bannerColor2);
      localStorage.setItem('banner_style', bannerStyle);
      toast({ title: t('settings.saved'), description: t('profile.savedProfile') });
      refreshProfile();
      setEditOpen(false);
    }
    setSavingProfile(false);
  };

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="relative mb-6">
        <div className="h-32 sm:h-40 rounded-xl" style={{ background: bannerBg }} />
        <div className="absolute -bottom-10 left-4 sm:left-6">
          <div
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center text-2xl sm:text-3xl font-bold border-4 border-card shadow-lg transition-transform hover:scale-105"
            style={{ backgroundColor: avatarColor, color: 'white' }}
          >
            {firstLetter}
          </div>
        </div>
        {!isViewingOtherProfile && (
          <div className="absolute top-3 right-3 sm:top-4 sm:right-4 flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-1.5 h-8 px-2.5 text-xs sm:text-sm whitespace-nowrap"
              onClick={() => navigate('/avatar')}
            >
              <User className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Avatar</span><span className="sm:hidden">Av</span>
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-1.5 h-8 px-2.5 text-xs sm:text-sm whitespace-nowrap"
              onClick={() => navigate('/inventory')}
            >
              <Backpack className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Inventory</span><span className="sm:hidden">Inv</span>
            </Button>
            <Dialog open={editOpen} onOpenChange={setEditOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1.5 h-8 px-2.5 text-xs sm:text-sm whitespace-nowrap">
                  <Edit className="h-3.5 w-3.5" /> <span className="hidden sm:inline">{t('profile.editProfile')}</span><span className="sm:hidden">Edit</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t('profile.editProfile')}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-2">
                  <div>
                    <label className="text-sm font-medium">{t('profile.avatarColor')}</label>
                    <Input type="color" value={editAvatarColor} onChange={e => { setEditAvatarColor(e.target.value); }} className="h-10 w-20 mt-1 p-1 cursor-pointer" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">{t('profile.bannerStyle')}</label>
                    <div className="flex gap-2 mt-1">
                      <Button size="sm" variant={bannerStyle === 'solid' ? 'default' : 'outline'} onClick={() => setBannerStyle('solid')}>{t('profile.solidColor')}</Button>
                      <Button size="sm" variant={bannerStyle === 'gradient' ? 'default' : 'outline'} onClick={() => setBannerStyle('gradient')}>{t('profile.gradient')}</Button>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div>
                      <label className="text-sm font-medium">{t('profile.bannerColor1')}</label>
                      <Input type="color" value={bannerColor1} onChange={e => setBannerColor1(e.target.value)} className="h-10 w-20 mt-1 p-1 cursor-pointer" />
                    </div>
                    {bannerStyle === 'gradient' && (
                      <div>
                        <label className="text-sm font-medium">{t('profile.bannerColor2')}</label>
                        <Input type="color" value={bannerColor2} onChange={e => setBannerColor2(e.target.value)} className="h-10 w-20 mt-1 p-1 cursor-pointer" />
                      </div>
                    )}
                  </div>
                  <div className="h-16 rounded-lg" style={{ background: bannerBg }} />
                  <Button onClick={handleSaveProfile} disabled={savingProfile} className="w-full">
                    {savingProfile ? t('profile.saving') : t('profile.save')}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>

      <div className="mt-12 px-1">
        <h1 className="text-xl sm:text-2xl font-bold text-foreground truncate">{displayName}</h1>
        <p className="text-sm text-muted-foreground">@{username} · {t('profile.memberSince')} {memberSince}</p>
        <div className="flex items-center gap-2 mt-1">
          <div className={`w-2 h-2 rounded-full ${profile?.status === 'online' ? 'bg-green-500' : 'bg-gray-400'}`} />
          <span className="text-xs text-muted-foreground capitalize">{profile?.status === 'online' ? 'online' : 'offline'}</span>
        </div>

        {/* Friend request button when viewing other profiles */}
        {isViewingOtherProfile && friendQuery && (
          <div className="mt-4">
            {friendQuery.data?.status === 'none' ? (
              <Button onClick={() => sendRequest.mutate()} disabled={sendRequest.isPending} className="w-full">
                <UserPlus className="h-4 w-4 mr-2" />
                {sendRequest.isPending ? 'Sending...' : 'Send Friend Request'}
              </Button>
            ) : friendQuery.data?.status === 'pending_outgoing' ? (
              <Button onClick={() => cancelOrRemove.mutate((friendQuery.data as any).id)} disabled={cancelOrRemove.isPending} variant="outline" className="w-full">
                <UserMinus className="h-4 w-4 mr-2" />
                {cancelOrRemove.isPending ? 'Cancelling...' : 'Cancel Request'}
              </Button>
            ) : friendQuery.data?.status === 'pending_incoming' ? (
              <div className="flex gap-2">
                <Button onClick={() => accept.mutate((friendQuery.data as any).id)} disabled={accept.isPending} className="flex-1">
                  <UserCheck className="h-4 w-4 mr-2" />
                  {accept.isPending ? 'Accepting...' : 'Accept'}
                </Button>
                <Button onClick={() => cancelOrRemove.mutate((friendQuery.data as any).id)} disabled={cancelOrRemove.isPending} variant="outline" className="flex-1">
                  <UserMinus className="h-4 w-4 mr-2" />
                  {cancelOrRemove.isPending ? 'Declining...' : 'Decline'}
                </Button>
              </div>
            ) : friendQuery.data?.status === 'friends' ? (
              <Button onClick={() => cancelOrRemove.mutate((friendQuery.data as any).id)} disabled={cancelOrRemove.isPending} variant="outline" className="w-full">
                <UserMinus className="h-4 w-4 mr-2" />
                {cancelOrRemove.isPending ? 'Removing...' : 'Remove Friend'}
              </Button>
            ) : null}
          </div>
        )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mt-6">
        {[
          { label: t('profile.games'), value: gameCount ?? 0, color: 'text-primary' },
          { label: t('profile.friends'), value: friendCount ?? 0, color: 'text-green-500' },
          { label: t('profile.reviews'), value: reviewCount ?? 0, color: 'text-yellow-500' },
          { label: t('profile.followersLabel'), value: followerCount ?? 0, color: 'text-purple-500' },
        ].map((stat) => (
          <div key={stat.label} className="bg-card border border-border rounded-lg p-3 sm:p-4 text-center hover:border-primary/20 transition-colors">
            <p className={`text-xl sm:text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-xs sm:text-sm text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Bio */}
      <div className="mt-6 bg-card border border-border rounded-lg p-5 group relative">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-foreground">{t('profile.bio')}</label>
          {!bioEditing ? (
            <button
              onClick={() => setBioEditing(true)}
              className="text-muted-foreground/40 hover:text-foreground transition-colors p-1 rounded-md hover:bg-accent"
              aria-label="Edit bio"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
          ) : null}
        </div>
        {bioEditing ? (
          <>
            <Textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder={t('profile.bioPlaceholder')} className="resize-none" rows={3} autoFocus />
            <div className="flex gap-2 mt-3">
              <Button onClick={async () => { await handleSaveBio(); setBioEditing(false); }} size="sm" disabled={saving}>
                <Check className="h-4 w-4 mr-1" />
                {saving ? t('profile.saving') : t('profile.save')}
              </Button>
              <Button variant="outline" size="sm" onClick={() => { setBio(profile?.bio || ''); setBioEditing(false); }}>
                {t('game.cancel')}
              </Button>
            </div>
          </>
        ) : (
          <p className="text-sm text-muted-foreground whitespace-pre-wrap min-h-[1.25rem]">
            {profile?.bio || <span className="italic opacity-60">{t('profile.bioPlaceholder')}</span>}
          </p>
        )}
      </div>

      {/* Social Media Links */}
      {((profile as any)?.youtube || (profile as any)?.x || (profile as any)?.twitch) && (
        <div className="mt-4 flex flex-wrap gap-2">
          {(profile as any)?.youtube && (
            <a href={(profile as any).youtube} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
              <span className="text-red-700 dark:text-red-300 font-medium">YouTube</span>
            </a>
          )}
          {(profile as any)?.x && (
            <a href={(profile as any).x} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-50 dark:bg-gray-900/20 border border-gray-200 dark:border-gray-800 text-sm hover:bg-gray-100 dark:hover:bg-gray-900/30 transition-colors">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              <span className="text-gray-700 dark:text-gray-300 font-medium">X</span>
            </a>
          )}
          {(profile as any)?.twitch && (
            <a href={(profile as any).twitch} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 text-sm hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z"/>
              </svg>
              <span className="text-purple-700 dark:text-purple-300 font-medium">Twitch</span>
            </a>
          )}
        </div>
      )}

      {/* Tags */}
      <div className="mt-6">
        <h3 className="text-sm font-medium text-foreground mb-2">{t('profile.tags')}</h3>
        <div className="flex flex-wrap gap-2">
          {isNewPlayer && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/40 dark:to-emerald-900/40 border border-green-300 dark:border-green-700 text-sm shadow-sm">
              <Sprout className="h-4 w-4 text-green-600 dark:text-green-400" />
              <span className="text-green-700 dark:text-green-300 font-semibold">{t('profile.newPlayer')}</span>
            </span>
          )}
        </div>
      </div>

      {/* Favorite Games */}
      <div className="mt-8">
        <h3 className="font-semibold text-foreground mb-3">{t('profile.favoriteGames')}</h3>
        {favoriteGames && favoriteGames.length > 0 ? (
          <div className="flex gap-4 overflow-x-auto pb-2">
            {favoriteGames.map((fav) => (
              <div key={fav.game_id} className="group cursor-pointer shrink-0" onClick={() => navigate(`/game/${fav.game_id}`)}>
                <div className="aspect-square w-40 h-40 bg-muted border border-border rounded-lg overflow-hidden mb-2">
                  <div className="w-full h-full flex items-center justify-center text-sm font-semibold transition-transform duration-300 group-hover:scale-110 p-2 text-center"
                    style={{
                      background: getGameGradient(fav.games.name),
                      color: 'white',
                    }}
                  >
                    {fav.games.name}
                  </div>
                </div>
                <p className="text-sm font-medium text-foreground truncate">{fav.games.name}</p>
              </div>
            ))}
          </div>
        ) : (
          <EmptyBubble text={t('profile.favoriteGames.empty')} />
        )}
      </div>

      {/* Communities */}
      <div className="mt-8">
        <h3 className="font-semibold text-foreground mb-3">Communities</h3>
        <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-2">
          {JSON.parse(localStorage.getItem(`communities_${userId}`) || '[]').map((communityName: string) => (
            <div key={communityName} className="shrink-0">
              <div onClick={() => navigate(`/community/${communityName}`)} className="cursor-pointer group">
                <div className="aspect-square w-28 h-28 sm:w-40 sm:h-40 border border-border rounded-lg overflow-hidden mb-2 transition-all duration-300 group-hover:shadow-lg group-hover:border-primary/50" style={{ background: gradientFor(communityName, 1) }}>
                  <div className="w-full h-full flex items-center justify-center text-white font-bold text-sm sm:text-xl transition-transform duration-300 group-hover:scale-110 p-1 sm:p-2 text-center">
                    {communityName}
                  </div>
                </div>
                <p className="text-xs sm:text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">{communityName}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>

      {/* Best Badges */}
      <div className="mt-8">
        <h3 className="font-semibold text-foreground mb-3">{t('profile.bestBadges')}</h3>
        <EmptyBubble text={t('profile.bestBadges.empty')} />
      </div>
    </div>
  );
}
