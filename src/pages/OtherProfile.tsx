import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Sprout, UserPlus, UserMinus, UserCheck, MessageCircle, ArrowLeft, Heart, Users } from 'lucide-react';
import { useFriendship } from '@/hooks/useFriendship';
import EmptyBubble from '@/components/EmptyBubble';
import { useQueryClient } from '@tanstack/react-query';
import { useI18n } from '@/lib/i18n';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import { useDocumentTitle } from '@/components/DocumentTitle';

function getGameGradient(name: string): string {
  const hash = name.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const hue1 = hash % 360;
  const hue2 = (hash * 7) % 360;
  return `linear-gradient(135deg, hsl(${hue1}, 70%, 50%), hsl(${hue2}, 70%, 50%))`;
}

export default function OtherProfile() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { profile: me } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { query: friendQ, sendRequest, cancelOrRemove, accept } = useFriendship(userId);
  const [isFollowing, setIsFollowing] = useState(false);
  const { t } = useI18n();
  const [bestFriendStatus, setBestFriendStatus] = useState<'none' | 'pending_sent' | 'pending_received' | 'accepted'>('none');
  
  console.log('🔍 OtherProfile - userId:', userId, 'current user:', me?.user_id);

  // Redirect to own profile if viewing self
  useEffect(() => {
    if (me && userId && me.user_id === userId) navigate('/profile', { replace: true });
  }, [me, userId, navigate]);

  const { data: target } = useQuery({
    queryKey: ['public-profile', userId],
    enabled: !!userId,
    queryFn: async () => {
      console.log('🔍 OtherProfile fetching userId:', userId);
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, username, display_name, avatar_color, bio, status, created_at, last_seen_at')
        .eq('user_id', userId!)
        .maybeSingle();
      console.log('🔍 OtherProfile query result:', { userId, data, error });
      if (error) {
        console.error('❌ OtherProfile query error:', error);
        throw error;
      }
      // Apply status mapping logic
      if (data) {
        const isActuallyOnline = data.last_seen_at && new Date(data.last_seen_at) > new Date(Date.now() - 5 * 60 * 1000);
        let mappedStatus = 'offline';
        if (isActuallyOnline && data.status === 'online') {
          mappedStatus = 'online';
        }
        return { ...data, status: mappedStatus };
      }
      return data;
    },
  });

  // Set document title to player display name
  useDocumentTitle(`RazeHub - ${target?.display_name || target?.username || userId || 'Player'}`);

  const { data: counts } = useQuery({
    queryKey: ['profile-counts', userId],
    enabled: !!userId,
    queryFn: async () => {
      const [g, r, fr, fo] = await Promise.all([
        supabase.from('user_games').select('*', { count: 'exact', head: true }).eq('user_id', userId!),
        supabase.from('reviews').select('*', { count: 'exact', head: true }).eq('user_id', userId!),
        supabase.from('friendships').select('*', { count: 'exact', head: true }).eq('status', 'accepted')
          .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`),
        supabase.from('follows').select('*', { count: 'exact', head: true }).eq('followee_id', userId!),
      ]);
      return { games: g.count || 0, reviews: r.count || 0, friends: fr.count || 0, followers: fo.count || 0 };
    },
  });

  const { data: favoriteGames } = useQuery({
    queryKey: ['favorite-games', userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data } = await supabase
        .from('user_games')
        .select('*, games(*)')
        .eq('user_id', userId!)
        .eq('is_favorite', true);
      return data || [];
    },
  });

  // For communities, use localStorage approach (same as Profile.tsx)
  const communitiesData = userId ? JSON.parse(localStorage.getItem(`communities_${userId}`) || '[]') : [];

  const { data: followState } = useQuery({
    queryKey: ['is-following', me?.user_id, userId],
    enabled: !!me?.user_id && !!userId,
    queryFn: async () => {
      const { data } = await supabase
        .from('follows')
        .select('id')
        .eq('follower_id', me!.user_id)
        .eq('followee_id', userId!)
        .maybeSingle();
      return !!data;
    },
  });

  useEffect(() => {
    if (followState !== undefined) setIsFollowing(!!followState);
  }, [followState]);

  const toggleFollow = async () => {
    if (!me || !userId) return;
    if (isFollowing) {
      await supabase.from('follows').delete().eq('follower_id', me.user_id).eq('followee_id', userId);
      setIsFollowing(false);
    } else {
      await supabase.from('follows').insert({ follower_id: me.user_id, followee_id: userId });
      setIsFollowing(true);
    }
    queryClient.invalidateQueries({ queryKey: ['profile-counts', userId] });
  };

  // Best friends logic
  const { data: bestFriendData } = useQuery({
    queryKey: ['best-friend', me?.user_id, userId],
    enabled: !!me?.user_id && !!userId,
    queryFn: async () => {
      const { data } = await supabase
        .from('best_friends' as any)
        .select('*')
        .or(`and(user_id.eq.${me!.user_id},friend_id.eq.${userId}),and(user_id.eq.${userId},friend_id.eq.${me!.user_id})`)
        .maybeSingle();
      return data as any;
    },
  });

  const { data: myBestFriendsCount } = useQuery({
    queryKey: ['best-friends-count', me?.user_id],
    enabled: !!me?.user_id,
    queryFn: async () => {
      const { count } = await supabase
        .from('best_friends' as any)
        .select('*', { count: 'exact', head: true })
        .eq('status', 'accepted')
        .or(`user_id.eq.${me!.user_id},friend_id.eq.${me!.user_id}`);
      return count || 0;
    },
  });

  useEffect(() => {
    if (!bestFriendData) { setBestFriendStatus('none'); return; }
    if (bestFriendData.status === 'accepted') { setBestFriendStatus('accepted'); return; }
    if (bestFriendData.user_id === me?.user_id) setBestFriendStatus('pending_sent');
    else setBestFriendStatus('pending_received');
  }, [bestFriendData, me?.user_id]);

  const sendBestFriendRequest = async () => {
    if (!me || !userId) return;
    if ((myBestFriendsCount ?? 0) >= 6) {
      toast({ title: t('bestFriends.limitReached'), variant: 'destructive' });
      return;
    }
    await supabase.from('best_friends' as any).insert({ user_id: me.user_id, friend_id: userId, status: 'pending' });
    queryClient.invalidateQueries({ queryKey: ['best-friend', me.user_id, userId] });
    queryClient.invalidateQueries({ queryKey: ['best-friends-count', me.user_id] });

    // Create notification for the receiver
    await supabase.from('notifications').insert({
      user_id: userId,
      actor_id: me.user_id,
      type: 'friend_request',
      title: 'Best Friend Request',
      body: `${me.display_name || me.username} wants to be your best friend`,
      link: `/profile/${me.user_id}`,
    });

    toast({ title: t('bestFriends.requestSent') });
  };

  const acceptBestFriend = async () => {
    if (!bestFriendData) return;
    await supabase.from('best_friends' as any).update({ status: 'accepted' }).eq('id', bestFriendData.id);
    queryClient.invalidateQueries({ queryKey: ['best-friend', me?.user_id, userId] });
    queryClient.invalidateQueries({ queryKey: ['best-friends-count', me?.user_id] });
    toast({ title: t('bestFriends.accepted') });
  };

  const removeBestFriend = async () => {
    if (!bestFriendData) return;
    await supabase.from('best_friends' as any).delete().eq('id', bestFriendData.id);
    queryClient.invalidateQueries({ queryKey: ['best-friend', me?.user_id, userId] });
    queryClient.invalidateQueries({ queryKey: ['best-friends-count', me?.user_id] });
    toast({ title: t('bestFriends.removed') });
  };

  if (!target) return <div className="p-6 text-muted-foreground">Loading...</div>;

  const displayName = target.display_name || target.username;
  const firstLetter = (displayName[0] || 'U').toUpperCase();
  const memberSince = new Date(target.created_at).getFullYear();
  const twoWeeksAgo = new Date(); twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
  const isNewPlayer = new Date(target.created_at) > twoWeeksAgo;
  const friendState = friendQ.data?.status || 'none';
  const friendId = friendQ.data && 'id' in friendQ.data ? friendQ.data.id : undefined;

  const renderFriendButton = () => {
    if (friendState === 'friends') {
      return (
        <div className="flex-1 flex gap-2">
          <Button variant="outline" className="flex-1" disabled>
            <Users className="h-4 w-4 mr-1.5" />Friends
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="icon" className="shrink-0"><UserMinus className="h-4 w-4" /></Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Remove friend</AlertDialogTitle>
                <AlertDialogDescription>Are you sure you want to remove {displayName} from your friend list? You can always send a new request later.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => {
                  if (friendId) cancelOrRemove.mutate(friendId, { onSuccess: () => { toast({ title: 'Friend removed' }); queryClient.invalidateQueries({ queryKey: ['profile-counts', userId] }); } });
                }}>Remove</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      );
    }
    if (friendState === 'pending_outgoing') {
      return (
        <Button variant="outline" className="flex-1" onClick={() => friendId && cancelOrRemove.mutate(friendId, { onSuccess: () => { toast({ title: 'Request cancelled' }); queryClient.invalidateQueries({ queryKey: ['profile-counts', userId] }); } })}>
          <UserMinus className="h-4 w-4 mr-1.5" />Pending
        </Button>
      );
    }
    if (friendState === 'pending_incoming') {
      return (
        <div className="flex-1 flex gap-2">
          <Button className="flex-1" onClick={() => friendId && accept.mutate(friendId, { onSuccess: () => { toast({ title: 'Friend added!' }); queryClient.invalidateQueries({ queryKey: ['profile-counts', userId] }); } })}>
            <UserCheck className="h-4 w-4 mr-1.5" />Accept
          </Button>
          <Button variant="outline" className="flex-1" onClick={() => friendId && cancelOrRemove.mutate(friendId)}>Ignore</Button>
        </div>
      );
    }
    const isPending = sendRequest.isPending;
    return (
      <Button
        className={`flex-1 transition-all duration-300 ${isPending ? 'scale-95 opacity-80' : ''}`}
        disabled={isPending}
        onClick={() => {
          console.log('🔍 Sending friend request to:', userId);
          sendRequest.mutate(undefined, { 
            onSuccess: () => { 
              console.log('✅ Friend request sent successfully');
              toast({ title: 'Friend request sent' }); 
              queryClient.invalidateQueries({ queryKey: ['profile-counts', userId] }); 
            },
            onError: (error) => {
              console.error('❌ Friend request failed:', error);
              toast({ title: 'Failed to send request', description: error.message, variant: 'destructive' });
            }
          });
        }}
      >
        <UserPlus className={`h-4 w-4 mr-1.5 transition-transform ${isPending ? 'animate-pulse' : ''}`} />
        {isPending ? 'Sending…' : 'Send Friend Request'}
      </Button>
    );
  };

  const handleChat = () => {
    console.log('🔍 Opening chat with user:', userId);
    navigate(`/chat?dm=${userId}`);
  };

  const isFriend = friendState === 'friends';

  return (
    <div className="p-4 sm:p-6">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <div className="relative mb-6">
        <div className="h-32 sm:h-40 rounded-xl" style={{ background: `linear-gradient(135deg, ${target.avatar_color}, #6366F1)` }} />
        <div className="absolute -bottom-10 left-4 sm:left-6">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center text-2xl sm:text-3xl font-bold border-4 border-card shadow-lg" style={{ backgroundColor: target.avatar_color, color: 'white' }}>
            {firstLetter}
          </div>
        </div>
      </div>

      <div className="mt-12">
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">{displayName}</h1>
        <p className="text-muted-foreground text-sm">@{target.username} · Member since {memberSince}</p>
        <div className="flex items-center gap-2 mt-1">
          <div className={`w-2 h-2 rounded-full ${target.status === 'online' ? 'bg-green-500' : 'bg-gray-400'}`} />
          <span className="text-xs text-muted-foreground capitalize">{target.status === 'online' ? 'online' : 'offline'}</span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="mt-4 flex flex-col sm:flex-row gap-2">
        <Button variant={isFollowing ? 'default' : 'outline'} className={`flex-1 ${isFollowing ? 'bg-pink-500 hover:bg-pink-600' : ''}`} onClick={toggleFollow}>
          <Heart className={`h-4 w-4 mr-1.5 ${isFollowing ? 'fill-current' : ''}`} />
          {isFollowing ? 'Following' : 'Follow'}
        </Button>
        {renderFriendButton()}
      <Button variant="outline" className="flex-1" onClick={handleChat}>
        <MessageCircle className="h-4 w-4 mr-1.5" />Chat
      </Button>
      {isFriend && bestFriendStatus === 'none' && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" className="flex-1">
              <Heart className="h-4 w-4 mr-1.5" />{t('bestFriends.become')}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('bestFriends.become')}</AlertDialogTitle>
              <AlertDialogDescription>{t('bestFriends.confirmSend')}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t('game.cancel')}</AlertDialogCancel>
              <AlertDialogAction onClick={sendBestFriendRequest}>{t('bestFriends.send')}</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
      {isFriend && bestFriendStatus === 'pending_sent' && (
        <Button variant="outline" className="flex-1" disabled>
          <Heart className="h-4 w-4 mr-1.5" />{t('bestFriends.pending')}
        </Button>
      )}
      {isFriend && bestFriendStatus === 'pending_received' && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button className="flex-1 bg-pink-500 hover:bg-pink-600">
              <Heart className="h-4 w-4 mr-1.5 fill-current" />{t('bestFriends.acceptBtn')}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('bestFriends.acceptTitle')}</AlertDialogTitle>
              <AlertDialogDescription>{t('bestFriends.confirmAccept')}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t('game.cancel')}</AlertDialogCancel>
              <AlertDialogAction onClick={acceptBestFriend}>{t('bestFriends.acceptBtn')}</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
      {isFriend && bestFriendStatus === 'accepted' && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" className="flex-1 border-pink-300 text-pink-500">
              <Heart className="h-4 w-4 mr-1.5 fill-current" />{t('bestFriends.label')}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remove Best Friend</AlertDialogTitle>
              <AlertDialogDescription>Are you sure you want to remove {displayName} from best friends?</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={removeBestFriend}>Remove</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
        {[
          { label: 'Games', value: counts?.games ?? 0, color: 'text-primary' },
          { label: 'Friends', value: counts?.friends ?? 0, color: 'text-green-500' },
          { label: 'Reviews', value: counts?.reviews ?? 0, color: 'text-yellow-500' },
          { label: 'Followers', value: counts?.followers ?? 0, color: 'text-purple-500' },
        ].map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-lg p-4 text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-sm text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {target.bio && (
        <div className="mt-6 bg-card border border-border rounded-lg p-5">
          <p className="text-sm font-medium text-muted-foreground mb-1">Bio</p>
          <p className="text-sm text-foreground whitespace-pre-wrap">{target.bio}</p>
        </div>
      )}

      {/* Social Media Links */}
      {((target as any)?.youtube || (target as any)?.x || (target as any)?.twitch) && (
        <div className="mt-4 flex flex-wrap gap-2">
          {(target as any)?.youtube && (
            <a href={(target as any).youtube} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
              <span className="text-red-700 dark:text-red-300 font-medium">YouTube</span>
            </a>
          )}
          {(target as any)?.x && (
            <a href={(target as any).x} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-50 dark:bg-gray-900/20 border border-gray-200 dark:border-gray-800 text-sm hover:bg-gray-100 dark:hover:bg-gray-900/30 transition-colors">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              <span className="text-gray-700 dark:text-gray-300 font-medium">X</span>
            </a>
          )}
          {(target as any)?.twitch && (
            <a href={(target as any).twitch} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 text-sm hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z"/>
              </svg>
              <span className="text-purple-700 dark:text-purple-300 font-medium">Twitch</span>
            </a>
          )}
        </div>
      )}

      <div className="mt-6">
        <h3 className="text-sm font-medium text-foreground mb-2">Tags</h3>
        <div className="flex flex-wrap gap-2">
          {isNewPlayer && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/40 dark:to-emerald-900/40 border border-green-300 dark:border-green-700 text-sm shadow-sm">
              <Sprout className="h-4 w-4 text-green-600 dark:text-green-400" />
              <span className="text-green-700 dark:text-green-300 font-semibold">New Player</span>
            </span>
          )}
        </div>
      </div>

      {/* Favorite Games */}
      {favoriteGames && favoriteGames.length > 0 && (
        <div className="mt-8">
          <h3 className="font-semibold text-foreground mb-3">Favorite Games</h3>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {favoriteGames.map((ug: any) => {
              const game = ug.games;
              if (!game) return null;
              return (
                <div key={game.id} className="group cursor-pointer shrink-0" onClick={() => navigate(`/game/${game.id}`)}>
                  <div className="aspect-square w-40 h-40 bg-muted border border-border rounded-lg overflow-hidden mb-2">
                    <div className="w-full h-full flex items-center justify-center text-sm font-semibold transition-transform duration-300 group-hover:scale-110"
                      style={{
                        background: getGameGradient(game.name),
                        color: 'white',
                      }}
                    >
                      {game.name[0]?.toUpperCase() || '?'}
                    </div>
                  </div>
                  <p className="text-sm font-medium text-foreground truncate">{game.name}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Communities */}
      {communitiesData && communitiesData.length > 0 && (
        <div className="mt-8">
          <h3 className="font-semibold text-foreground mb-3">Communities</h3>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {communitiesData.map((communityName: string) => (
              <button
                key={communityName}
                onClick={() => navigate(`/community/${communityName}`)}
                className="flex-shrink-0 snap-start flex flex-col items-center gap-2 w-40"
              >
                <div className="aspect-square w-40 h-40 bg-muted border border-border rounded-lg flex items-center justify-center">
                  <div className="text-3xl font-bold">{communityName[0]?.toUpperCase() || '?'}</div>
                </div>
                <span className="text-sm font-medium text-foreground text-center truncate w-full">{communityName}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8">
        <h3 className="font-semibold text-foreground mb-3">Best Badges</h3>
        <EmptyBubble text="No badges yet." />
      </div>
    </div>
  );
}