import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Users, ExternalLink, Plus, Crown, ArrowLeft } from 'lucide-react';
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
  ThumbsUp, ThumbsDown, MessageCircle, Share2, X, Bell,
} from 'lucide-react';

function gradientFor(name: string, salt: number): string {
  const hash = name.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0) + salt * 137;
  const hue1 = hash % 360;
  const hue2 = (hash * 7 + salt * 53) % 360;
  return `linear-gradient(135deg, hsl(${hue1}, 60%, 40%), hsl(${hue2}, 50%, 50%))`;
}

function getGameGradient(name: string): string {
  const hash = name.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const hue1 = hash % 360;
  const hue2 = (hash * 7) % 360;
  return `linear-gradient(135deg, hsl(${hue1}, 60%, 40%), hsl(${hue2}, 50%, 50%))`;
}

export default function Community() {
  const { studioName } = useParams<{ studioName: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { t } = useI18n();
  const { toast } = useToast();
  const qc = useQueryClient();

  const [selectedNews, setSelectedNews] = useState<any>(null);
  const [isCommunityMember, setIsCommunityMember] = useState(false);
  const [userInteractions, setUserInteractions] = useState<Record<string, 'like' | 'dislike' | null>>(() => {
    if (typeof window === 'undefined') return {};
    if (!profile?.user_id) return {};
    const stored = localStorage.getItem(`announcement_user_interactions_${profile.user_id}`);
    return stored ? JSON.parse(stored) : {};
  });
  const [isUpdatingReaction, setIsUpdatingReaction] = useState(false);

  // localStorage persistence for announcement likes
  const getStoredAnnouncementLikes = () => {
    if (typeof window === 'undefined') return {};
    if (!profile?.user_id) return {};
    const stored = localStorage.getItem(`announcement_likes_${profile.user_id}`);
    return stored ? JSON.parse(stored) : {};
  };

  // Update mock announcements with localStorage values
  const { data: announcements, isLoading: announcementsLoading } = useQuery({
    queryKey: ['community-announcements', studioName],
    queryFn: async () => {
      if (!studioName) return [];
      const storedLikes = getStoredAnnouncementLikes();
      console.log('Stored likes for announcements:', storedLikes);
      // For now, return mock announcements with localStorage persistence
      return [
        {
          id: '1',
          title: 'New Game Release!',
          content: 'We are excited to announce our latest game coming soon!',
          date: new Date().toISOString(),
          likes: storedLikes['1']?.likes || 0,
          dislikes: storedLikes['1']?.dislikes || 0,
          image: null,
        },
        {
          id: '2',
          title: 'Community Event',
          content: 'Join us for our upcoming community event this weekend!',
          date: new Date(Date.now() - 86400000 * 3).toISOString(),
          likes: storedLikes['2']?.likes || 0,
          dislikes: storedLikes['2']?.dislikes || 0,
          image: null,
        },
        {
          id: '3',
          title: 'Server Maintenance',
          content: 'Scheduled server maintenance will occur on Sunday from 2-4 AM.',
          date: new Date(Date.now() - 86400000 * 7).toISOString(),
          likes: storedLikes['3']?.likes || 0,
          dislikes: storedLikes['3']?.dislikes || 0,
          image: null,
        },
      ];
    },
    enabled: !!studioName,
  });

  // Early return if no studio name
  if (!studioName) {
    return (
      <div className="p-6 text-center">
        <h1 className="text-2xl font-bold text-foreground mb-2">{t('community.notFound')}</h1>
        <p className="text-muted-foreground">{t('community.noStudioName')}</p>
        <Button onClick={() => navigate('/discover')} className="mt-4">
          {t('community.backToDiscover')}
        </Button>
      </div>
    );
  }

  // Fetch community info (studio details)
  const { data: community, isLoading: communityLoading, error: communityError } = useQuery({
    queryKey: ['community', studioName],
    queryFn: async () => {
      if (!studioName) return null;
      
      // Try to fetch from profiles table for studio creator info
      const { data: creatorProfile } = await supabase
        .from('profiles')
        .select('user_id, username, display_name, avatar_color')
        .eq('username', studioName)
        .single();
      
      // Get games by this developer
      const { data: games } = await supabase
        .from('games')
        .select('id')
        .eq('developer', studioName);
      
      // Check if user is member from localStorage (source of truth)
      const savedCommunities = JSON.parse(localStorage.getItem(`communities_${profile?.user_id}`) || '[]');
      const isMember = savedCommunities.includes(studioName);
      
      // Count members - actual community membership
      // Since membership is stored in localStorage, we'll use a simpler approach
      // For now, use a fixed reasonable number since we can't access other users' localStorage
      const memberCount = isMember ? 1 : 0; // Current user is a member if they joined
      
      // Count active users - if current user is online and a member
      const activeCount = isMember ? 1 : 0;
      
      return {
        name: studioName,
        createdBy: creatorProfile?.display_name || creatorProfile?.username || studioName,
        creatorId: creatorProfile?.user_id || '',
        description: `${studioName} is a game development community creating amazing games. Join us to stay updated on our latest projects and connect with other game developers.`,
        avatarColor: creatorProfile?.avatar_color || '#3B82F6',
        memberCount,
        activeCount,
        gameCount: games?.length || 0,
        isMember,
        games: games || [],
      };
    },
    enabled: !!studioName,
  });

  // Fetch games made by this studio
  const { data: games, isLoading: gamesLoading, error: gamesError } = useQuery({
    queryKey: ['community-games', studioName],
    queryFn: async () => {
      if (!studioName) return [];
      const { data } = await supabase
        .from('games')
        .select('id, name, image_urls, published_at')
        .eq('developer', studioName)
        .order('published_at', { ascending: false });
      return data || [];
    },
    enabled: !!studioName,
  });

  // Sync local state with query result to avoid race conditions
  useEffect(() => {
    if (community && community.isMember !== undefined) {
      setIsCommunityMember(community.isMember);
    }
  }, [community]);

  // Loading state
  if (communityLoading || gamesLoading || announcementsLoading) {
    return (
      <div className="p-6 text-center">
        <div className="text-muted-foreground">{t('community.loading')}</div>
      </div>
    );
  }

  // Error state
  if (communityError || gamesError) {
    return (
      <div className="p-6 text-center">
        <h1 className="text-2xl font-bold text-foreground mb-2">{t('community.errorLoading')}</h1>
        <p className="text-muted-foreground mb-4">{t('community.errorLoadingDesc')}</p>
        <Button onClick={() => navigate('/discover')}>
          {t('community.backToDiscover')}
        </Button>
      </div>
    );
  }

  const handleJoinCommunity = () => {
    if (!profile) {
      toast({ title: t('community.signInRequired'), description: t('community.signInToJoin') });
      return;
    }
    // Toggle membership status
    if (isCommunityMember) {
      toast({ title: t('community.alreadyMember'), description: t('community.alreadyMemberDesc') });
      return;
    }
    // Add to user's communities (mock implementation)
    const savedCommunities = JSON.parse(localStorage.getItem(`communities_${profile.user_id}`) || '[]');
    if (!savedCommunities.includes(studioName)) {
      savedCommunities.push(studioName);
      localStorage.setItem(`communities_${profile.user_id}`, JSON.stringify(savedCommunities));
    }
    setIsCommunityMember(true);
    toast({ title: t('community.joined'), description: `You have successfully joined ${community.name}!` });
    // Update the community data to reflect membership change
    qc.invalidateQueries({ queryKey: ['community', studioName] });
  };

  const handleLeaveCommunity = () => {
    if (!profile) {
      toast({ title: t('community.signInRequired'), description: t('community.signInToLeave') });
      return;
    }
    // Show confirmation dialog
    const confirmed = window.confirm(`${t('community.leaveConfirm')}\n\n⚠️ This will remove ${community.name} from your communities list.`);
    if (confirmed) {
      // Remove from user's communities (mock implementation)
      const savedCommunities = JSON.parse(localStorage.getItem(`communities_${profile.user_id}`) || '[]');
      const index = savedCommunities.indexOf(studioName);
      if (index !== -1) {
        savedCommunities.splice(index, 1);
        localStorage.setItem(`communities_${profile.user_id}`, JSON.stringify(savedCommunities));
      }
      toast({ title: t('community.left'), description: `You have left ${community.name}` });
      // Update the community data to reflect membership change
      qc.invalidateQueries({ queryKey: ['community', studioName] });
    }
  };

  const handleFollowCommunity = () => {
    if (!profile) {
      toast({ title: t('community.signInRequired'), description: t('community.signInToFollow') });
      return;
    }
    // TODO: Implement actual community following logic
    toast({ title: t('community.comingSoon'), description: t('community.followingComingSoon') });
  };

  // Update announcement reaction with localStorage persistence
  const updateAnnouncementReaction = async (announcementId: string, type: 'like' | 'dislike') => {
    if (isUpdatingReaction) return; // Prevent multiple clicks
    setIsUpdatingReaction(true);
    
    const currentInteraction = userInteractions[announcementId];
    
    try {
      if (currentInteraction === type) {
        // Remove interaction
        setUserInteractions(prev => {
          const newState = { ...prev };
          delete newState[announcementId];
          if (profile?.user_id) {
            localStorage.setItem(`announcement_user_interactions_${profile.user_id}`, JSON.stringify(newState));
          }
          return newState;
        });
        
        // Update local state
        if (announcements) {
          const updatedAnnouncements = announcements.map((announcement: any) => {
            if (announcement.id === announcementId) {
              const newLikes = type === 'like' ? announcement.likes - 1 : announcement.likes;
              const newDislikes = type === 'dislike' ? announcement.dislikes - 1 : announcement.dislikes;
              const updatedAnnouncement = { ...announcement, likes: Math.max(0, newLikes), dislikes: Math.max(0, newDislikes) };
              if (selectedNews?.id === announcementId) {
                setSelectedNews(updatedAnnouncement);
              }
              return updatedAnnouncement;
            }
            return announcement;
          });
          qc.setQueryData(['community-announcements', studioName], updatedAnnouncements);
          
          // Save to localStorage
          const storedLikes = getStoredAnnouncementLikes();
          const targetAnnouncement = updatedAnnouncements.find((a: any) => a.id === announcementId);
          if (targetAnnouncement) {
            storedLikes[announcementId] = { likes: targetAnnouncement.likes, dislikes: targetAnnouncement.dislikes };
            if (profile?.user_id) {
            localStorage.setItem(`announcement_likes_${profile.user_id}`, JSON.stringify(storedLikes));
          }
          }
        }
        
        toast({ title: 'Removed', description: `Your ${type} was removed` });
      } else {
        // Add or change interaction
        setUserInteractions((prev) => {
          const updated = { ...prev, [announcementId]: type };
          if (profile?.user_id) {
            localStorage.setItem(`announcement_user_interactions_${profile.user_id}`, JSON.stringify(updated));
          }
          return updated;
        });
        
        // Update local state
        if (announcements) {
          const updatedAnnouncements = announcements.map((announcement: any) => {
            if (announcement.id === announcementId) {
              const oldType = currentInteraction || 'like';
              const newLikes = type === 'like' ? announcement.likes + 1 : (oldType === 'like' ? announcement.likes - 1 : announcement.likes);
              const newDislikes = type === 'dislike' ? announcement.dislikes + 1 : (oldType === 'dislike' ? announcement.dislikes - 1 : announcement.dislikes);
              const updatedAnnouncement = { ...announcement, likes: Math.max(0, newLikes), dislikes: Math.max(0, newDislikes) };
              if (selectedNews?.id === announcementId) {
                setSelectedNews(updatedAnnouncement);
              }
              return updatedAnnouncement;
            }
            return announcement;
          });
          qc.setQueryData(['community-announcements', studioName], updatedAnnouncements);
          
          // Save to localStorage
          const storedLikes = getStoredAnnouncementLikes();
          const targetAnnouncement = updatedAnnouncements.find((a: any) => a.id === announcementId);
          if (targetAnnouncement) {
            storedLikes[announcementId] = { likes: targetAnnouncement.likes, dislikes: targetAnnouncement.dislikes };
            if (profile?.user_id) {
            localStorage.setItem(`announcement_likes_${profile.user_id}`, JSON.stringify(storedLikes));
          }
          }
        }
        
        toast({ title: currentInteraction ? 'Changed' : `${type === 'like' ? 'Liked!' : 'Disliked!'}`, description: currentInteraction ? `Changed to ${type}` : `You ${type}d this announcement` });
      }
    } catch (error) {
      console.error('Error updating announcement reaction:', error);
      toast({ title: 'Error', description: 'Could not update reaction', variant: 'destructive' });
    } finally {
      setIsUpdatingReaction(false);
    }
  };

  // Mock news data for community announcements
  const mockNews = [
    {
      id: 1,
      type: 'Update',
      title: 'Community Guidelines Updated',
      content: 'We have updated our community guidelines to ensure a safe and welcoming environment for all members.',
      fullContent: 'We have updated our community guidelines to ensure a safe and welcoming environment for all members. Please review the new guidelines in the community rules section.',
      date: new Date(Date.now() - 86400000).toISOString(),
      image: '/api/placeholder/640/360',
      likes: 42,
      dislikes: 3,
    },
    {
      id: 2,
      type: 'Event',
      title: 'Community Game Night',
      content: 'Join us for our monthly community game night happening this Friday!',
      fullContent: 'Join us for our monthly community game night happening this Friday! We will be playing various games together and giving away prizes to participants. All community members are welcome to join.',
      date: new Date(Date.now() - 172800000).toISOString(),
      image: '/api/placeholder/640/360',
      likes: 128,
      dislikes: 7,
    },
  ];

  const handleJoinGroup = () => {
    if (!profile) {
      toast({ title: t('community.signInRequired'), description: 'Please sign in to join groups' });
      return;
    }
    // TODO: Implement actual group joining logic
    toast({ title: t('community.comingSoon'), description: 'Group joining feature coming soon!' });
  };

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      {/* Back Button */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
        <ArrowLeft className="h-4 w-4" /> {t('community.back')}
      </button>
      
      {/* Community Info */}
      {communityLoading ? (
        <div className="text-center">
          <div className="text-2xl font-bold text-foreground mb-2">Loading community...</div>
        </div>
      ) : communityError ? (
        <div className="text-center">
          <div className="text-2xl font-bold text-foreground mb-2">Error loading community</div>
        </div>
      ) : !community ? (
        <div className="text-center">
          <div className="text-2xl font-bold text-foreground mb-2">Community not found</div>
        </div>
      ) : (
        <>
          {/* Community Info */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-lg flex items-center justify-center text-3xl font-bold shrink-0" style={{ backgroundColor: community.avatarColor, color: 'white' }}>
                {community.name[0]?.toUpperCase() || 'S'}
              </div>
              <div className="absolute -top-2 -right-2 bg-amber-500/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                {t('community.demo')}
              </div>
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-foreground">{community.name}</h1>
              <p className="text-sm text-muted-foreground">{t('community.by')} <button onClick={() => navigate(`/profile/${community.creatorId}`)} className="text-primary hover:underline">{community.createdBy}</button></p>
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                <span>{community.memberCount || 0} {t('community.members')}</span>
                <span>•</span>
                <span>{community.activeCount || 0} {t('community.active')}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                {community?.isMember && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/40 border border-green-300 dark:border-green-700 text-green-700 dark:text-green-400 shadow-sm">
                    <span className="text-sm font-semibold">{t('community.member')}</span>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                {community?.isMember ? (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" className="text-destructive hover:text-destructive/90">
                        <Plus className="h-4 w-4 mr-2 rotate-45" /> {t('community.leave')}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>{t('community.leave')}</AlertDialogTitle>
                        <AlertDialogDescription>{t('community.leaveConfirm')} This will remove {community.name} from your communities list.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>{t('chat.cancel')}</AlertDialogCancel>
                        <AlertDialogAction onClick={() => {
                          setIsCommunityMember(false);
                          const savedCommunities = JSON.parse(localStorage.getItem(`communities_${profile?.user_id}`) || '[]');
                          const index = savedCommunities.indexOf(studioName);
                          if (index !== -1) {
                            savedCommunities.splice(index, 1);
                            localStorage.setItem(`communities_${profile?.user_id}`, JSON.stringify(savedCommunities));
                          }
                          toast({ title: t('community.left'), description: `You have left ${community.name}` });
                          qc.invalidateQueries({ queryKey: ['community', studioName] });
                        }}>{t('community.leave')}</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                ) : (
                  <Button onClick={handleJoinCommunity} className="bg-primary hover:bg-primary/90">
                    <Plus className="h-4 w-4 mr-2" /> {t('community.join')}
                  </Button>
                )}
                <Button onClick={handleJoinGroup} variant="outline">
                  <Users className="h-4 w-4 mr-2" /> {t('community.joinGroup')}
                </Button>
              </div>
            </div>
          </div>


          {/* Community Bio */}
          <div className="bg-card border border-border rounded-lg p-6 mt-8">
            <h3 className="font-semibold text-foreground mb-4">{t('community.about')}</h3>
            <p className="text-sm text-muted-foreground">{community.description}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-sm">
                {t('community.gameDevelopment')}
              </span>
              <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-sm">
                {t('community.communityDriven')}
              </span>
              <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 text-sm">
                {t('community.indieStudio')}
              </span>
            </div>
          </div>

          {/* Games */}
          <div className="bg-card border border-border rounded-lg p-6 mt-8">
            <h3 className="font-semibold text-foreground mb-4">{t('community.games')}</h3>
            {games && games.length > 0 ? (
              <div className="flex gap-4 overflow-x-auto pb-2">
                {games.map((game) => (
                  <div key={game.id} className="group cursor-pointer shrink-0" onClick={() => navigate(`/game/${game.id}`)}>
                    <div className="aspect-square w-40 h-40 bg-muted border border-border rounded-lg overflow-hidden mb-2 relative">
                      <div className="absolute top-2 left-2 z-10 bg-amber-500/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                        {t('community.demo')}
                      </div>
                      <div className="w-full h-full flex items-center justify-center text-sm font-semibold transition-transform duration-300 group-hover:scale-110"
                        style={{
                          background: getGameGradient(game.name),
                          color: 'white',
                        }}
                      >
                        {game.name[0]?.toUpperCase() || '?'}
                      </div>
                    </div>
                    <h4 className="font-medium text-foreground mb-1">{game.name}</h4>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyBubble text={t('community.noGames')} />
            )}
          </div>


          {/* Announcements */}
          <div className="bg-card border border-border rounded-lg p-6 mt-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">{t('community.latestNews')}</h3>
              <Button variant="outline" size="sm" onClick={() => toast({ title: t('community.comingSoon'), description: t('community.notifyComingSoon') })}>
                <Bell className="h-4 w-4 mr-2" />
                {t('community.notifyMe')}
              </Button>
            </div>
            {announcements && announcements.length > 0 ? (
              <div className="space-y-3">
                {announcements.map((announcement) => (
                  <div key={announcement.id} className="bg-card border border-border rounded-lg p-4 hover:border-primary/10 transition-colors cursor-pointer" onClick={() => setSelectedNews(announcement)}>
                    <div className="flex gap-4">
                      <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0" style={{ background: gradientFor(announcement.title, announcement.id.length) }}>
                        <div className="w-full h-full flex items-center justify-center text-white font-bold text-lg">
                          {announcement.title[0]?.toUpperCase() || 'A'}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium px-2 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                            {t('community.announcement')}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(announcement.date).toLocaleDateString()}
                          </span>
                        </div>
                        <h4 className="font-medium text-foreground mb-1">{announcement.title}</h4>
                        <p className="text-sm text-muted-foreground line-clamp-2">{announcement.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyBubble text={t('community.noAnnouncements')} />
            )}
          </div>
        </>
      )}
      
      {/* Announcement Modal */}
      <Dialog open={!!selectedNews} onOpenChange={() => setSelectedNews(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedNews && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl">{selectedNews.title}</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Header with date */}
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium px-3 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                    {t('community.announcement')}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(selectedNews.date).toLocaleDateString()}
                  </span>
                </div>
                
                {/* Image */}
                <div className="w-full">
                  <div className="w-full h-64 rounded-lg flex items-center justify-center text-white font-bold text-2xl" style={{ background: gradientFor(selectedNews.title, selectedNews.id.length) }}>
                    {selectedNews.title[0]?.toUpperCase() || 'A'}
                  </div>
                </div>
                
                {/* Full content */}
                <div className="prose prose-sm max-w-none">
                  <p className="text-foreground leading-relaxed">{selectedNews.content}</p>
                </div>
                
                {/* Interaction buttons */}
                <div className="flex items-center gap-4 pt-4 border-t border-border">
                  <button
                    disabled={isUpdatingReaction}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      userInteractions[selectedNews.id] === 'like'
                        ? 'bg-green-500 dark:bg-green-600 text-white'
                        : 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30'
                    }`}
                    onClick={() => {
                      if (!profile) {
                        toast({ title: t('community.loginRequired'), description: t('community.loginToLike'), variant: 'destructive' });
                        return;
                      }
                      updateAnnouncementReaction(selectedNews.id, 'like');
                    }}
                  >
                    <ThumbsUp className="h-4 w-4" />
                    <span className="text-sm font-medium">{selectedNews.likes || 0}</span>
                  </button>
                  <button
                    disabled={isUpdatingReaction}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      userInteractions[selectedNews.id] === 'dislike'
                        ? 'bg-red-500 dark:bg-red-600 text-white'
                        : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30'
                    }`}
                    onClick={() => {
                      if (!profile) {
                        toast({ title: t('community.loginRequired'), description: t('community.loginToDislike'), variant: 'destructive' });
                        return;
                      }
                      updateAnnouncementReaction(selectedNews.id, 'dislike');
                    }}
                  >
                    <ThumbsDown className="h-4 w-4" />
                    <span className="text-sm font-medium">{selectedNews.dislikes || 0}</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
