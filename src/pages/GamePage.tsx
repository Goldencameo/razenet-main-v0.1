import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import EmptyBubble from '@/components/EmptyBubble';
import { useDocumentTitle } from '@/components/DocumentTitle';
import {
  ArrowLeft, Play, Bell, Plus, Star, ThumbsUp, ThumbsDown,
  ChevronLeft, ChevronRight, Edit, Trash2, EyeOff, Heart, Users, Link2, Award, Clock,
  Image as ImageIcon, X, MessageCircle, Share2, Calendar, MapPin, Ticket,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

function gradientFor(name: string, salt: number): string {
  const hash = name.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0) + salt * 137;
  const hue1 = hash % 360;
  const hue2 = (hash * 7 + salt * 53) % 360;
  return `linear-gradient(135deg, hsl(${hue1}, 60%, 40%), hsl(${hue2}, 50%, 50%))`;
}

function getGameGradient(name: string): string {
  return gradientFor(name, name.length);
}

function StarRating({ value, onChange, readonly = false, size = 'md' }: { value: number; onChange?: (v: number) => void; readonly?: boolean; size?: 'sm' | 'md' }) {
  const sizeClass = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <button key={i} type="button" disabled={readonly} onClick={() => onChange?.(i)}
          className={`${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-125'} transition-transform`}>
          <Star className={`${sizeClass} ${i <= value ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30'}`} />
        </button>
      ))}
    </div>
  );
}

const TAG_PALETTES = [
  'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800',
  'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
  'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800',
  'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800',
  'bg-pink-100 text-pink-700 border-pink-200 dark:bg-pink-900/30 dark:text-pink-300 dark:border-pink-800',
  'bg-cyan-100 text-cyan-700 border-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-300 dark:border-cyan-800',
];
function tagClass(tag: string) {
  const h = tag.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return TAG_PALETTES[h % TAG_PALETTES.length];
}

export default function GamePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { t } = useI18n();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [imageIndex, setImageIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);

  // localStorage persistence for quick rating
  const getStoredRating = () => {
    if (typeof window === 'undefined') return 0;
    if (!profile?.user_id) return 0;
    const stored = localStorage.getItem(`game_rating_${id}_${profile.user_id}`);
    return stored ? parseInt(stored) : 0;
  };

  const [quickRating, setQuickRating] = useState(getStoredRating);

  // Load rating from database on component mount and when profile changes
  useEffect(() => {
    if (!profile || !id) return;
    
    const loadRatingFromDB = async () => {
      try {
        const { data: existingRating } = await (supabase as any)
          .from('game_ratings')
          .select('rating')
          .eq('game_id', id)
          .eq('user_id', profile.user_id)
          .maybeSingle();
        
        if (existingRating && existingRating.rating !== undefined) {
          setQuickRating(existingRating.rating);
          localStorage.setItem(`game_rating_${id}_${profile.user_id}`, existingRating.rating.toString());
        }
      } catch (error) {
        console.error('Error loading rating from database:', error);
      }
    };
    
    loadRatingFromDB();
  }, [profile, id]);

  // Save rating to localStorage and database when it changes
  const handleRatingChange = async (value: number) => {
    setQuickRating(value);
    if (typeof window !== 'undefined' && id && profile?.user_id) {
      localStorage.setItem(`game_rating_${id}_${profile.user_id}`, value.toString());
      
      // Save to database for all ratings (including 0)
      if (profile) {
        try {
          const { error: upsertError } = await (supabase as any)
            .from('game_ratings')
            .upsert({
              game_id: id,
              user_id: profile.user_id,
              rating: value,
              updated_at: new Date().toISOString()
            }, {
              onConflict: 'game_id,user_id'
            });
          
          if (upsertError) {
            console.error('Error saving rating to database:', upsertError);
          } else {
            // Invalidate queries to update global rating
            queryClient.invalidateQueries({ queryKey: ['games'] });
            queryClient.invalidateQueries({ queryKey: ['quick-ratings', id] });
          }
        } catch (error) {
          console.error('Error saving rating:', error);
        }
      }
    }
  };

  const [reviewStars, setReviewStars] = useState(5);
  const [reviewContent, setReviewContent] = useState('');
  const [reviewRecommended, setReviewRecommended] = useState(true);
  const [reviewIncognito, setReviewIncognito] = useState(false);
  const [editingReview, setEditingReview] = useState<string | null>(null);
  const [selectedNews, setSelectedNews] = useState<any>(null);
  const [discussionOpen, setDiscussionOpen] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  const { data: game } = useQuery({
    queryKey: ['game', id],
    queryFn: async () => {
      const { data } = await supabase.from('games').select('*').eq('id', id!).single();
      return data;
    },
    enabled: !!id,
  });

  // Set document title to game name (without RazeHub prefix)
  useDocumentTitle(game?.name || id || 'Game');

  // Mock events data for testing
  const MOCK_EVENTS = [
    {
      id: '1',
      title: 'Summer Championship 2024',
      description: 'Join the biggest gaming tournament of the year! Compete against players from around the world for amazing prizes and exclusive rewards.',
      fullDescription: 'Join the biggest gaming tournament of the year! Compete against players from around the world for amazing prizes and exclusive rewards. This tournament will feature multiple game modes including Battle Royale, Team Deathmatch, and Capture the Flag. Registration is now open and spots are limited.',
      date: '2024-07-15',
      time: '14:00',
      location: 'Online',
      image: gradientFor('Summer Championship', 1),
      type: 'Tournament',
      prize: '$10,000',
      maxParticipants: 1000,
      currentParticipants: 742,
      requirements: ['Level 10+', 'Verified Account'],
      organizer: 'Raze Gaming',
      featured: true,
    },
    {
      id: '2',
      title: 'Community Game Jam',
      description: '48-hour game creation challenge. Create amazing games and win prizes! Open to all skill levels.',
      fullDescription: '48-hour game creation challenge. Create amazing games and win prizes! This event is open to all skill levels and provides a great opportunity to learn from experienced developers. Theme will be announced at the start of the event.',
      date: '2024-08-01',
      time: '10:00',
      location: 'Online',
      image: gradientFor('Game Jam', 2),
      type: 'Game Jam',
      prize: 'Premium Items',
      maxParticipants: 500,
      currentParticipants: 234,
      requirements: ['Any Skill Level'],
      organizer: 'Raze Community',
      featured: false,
    },
    {
      id: '3',
      title: 'Developer Meetup',
      description: 'Meet the developers behind your favorite games. Q&A session and sneak peeks at upcoming features.',
      fullDescription: 'Meet the developers behind your favorite games. Join us for an exclusive Q&A session where you can ask questions directly to the development team. Get sneak peeks at upcoming features and learn about the development process.',
      date: '2024-08-10',
      time: '18:00',
      location: 'Discord',
      image: gradientFor('Developer Meetup', 3),
      type: 'Meetup',
      prize: 'N/A',
      maxParticipants: 200,
      currentParticipants: 156,
      requirements: ['Community Member'],
      organizer: 'Game Studio',
      featured: false,
    },
  ];

  // Mock news data - initialize with localStorage values for persistence
  const getStoredLikes = () => {
    if (typeof window === 'undefined') return { '1': { likes: 0, dislikes: 0 }, '2': { likes: 0, dislikes: 0 }, '3': { likes: 0, dislikes: 0 }, '4': { likes: 0, dislikes: 0 } };
    if (!profile?.user_id) return { '1': { likes: 0, dislikes: 0 }, '2': { likes: 0, dislikes: 0 }, '3': { likes: 0, dislikes: 0 }, '4': { likes: 0, dislikes: 0 } };
    const stored = localStorage.getItem(`news_likes_${profile.user_id}`);
    return stored ? JSON.parse(stored) : { '1': { likes: 0, dislikes: 0 }, '2': { likes: 0, dislikes: 0 }, '3': { likes: 0, dislikes: 0 }, '4': { likes: 0, dislikes: 0 } };
  };

  const [newsData, setNewsData] = useState(() => {
    const storedLikes = getStoredLikes();
    return [
      {
        id: '1',
        type: 'Small Update',
        title: 'Counter-Strike 2 Update',
        content: 'We\'ve released a new update with bug fixes and performance improvements. This update includes several balance changes and new features.',
        date: new Date(Date.now() - 86400000 * 2).toISOString(),
        image: game?.image_urls?.[0] || null,
        fullContent: 'We\'ve released a new update with bug fixes and performance improvements. This update includes several balance changes and new features. Players can expect smoother gameplay and enhanced stability across all platforms.',
        likes: storedLikes['1']?.likes || 0,
        dislikes: storedLikes['1']?.dislikes || 0,
      },
      {
        id: '2',
        type: 'Patch Notes',
        title: 'Summer Patch 1.2.3',
        content: 'Major patch with new weapons, maps, and gameplay improvements. Check out the full patch notes for all details.',
        date: new Date(Date.now() - 86400000 * 5).toISOString(),
        image: game?.image_urls?.[0] || null,
        fullContent: 'Major patch with new weapons, maps, and gameplay improvements. This patch introduces two new weapons, three new maps, and significant balance changes to improve gameplay variety and competitive balance.',
        likes: storedLikes['2']?.likes || 0,
        dislikes: storedLikes['2']?.dislikes || 0,
      },
      {
        id: '3',
        type: 'Announcement',
        title: 'Community Tournament',
        content: 'Join our upcoming community tournament with prizes and exclusive rewards for winners.',
        date: new Date(Date.now() - 86400000 * 7).toISOString(),
        image: game?.image_urls?.[0] || null,
        fullContent: 'Join our upcoming community tournament with prizes and exclusive rewards for winners. Registration opens next week and the tournament will feature both solo and team competitions.',
        likes: storedLikes['3']?.likes || 0,
        dislikes: storedLikes['3']?.dislikes || 0,
      },
      {
        id: '4',
        type: 'Event',
        title: 'Game Jam Weekend',
        content: 'Join us for a 48-hour game jam event. Create amazing games and win prizes!',
        date: new Date(Date.now() - 86400000 * 10).toISOString(),
        image: game?.image_urls?.[0] || null,
        fullContent: 'Join us for a 48-hour game jam event. Create amazing games and win prizes! This event is open to all skill levels and provides a great opportunity to learn from experienced developers.',
        likes: storedLikes['4']?.likes || 0,
        dislikes: storedLikes['4']?.dislikes || 0,
      },
    ];
  });

  // Track user's current interactions to prevent infinite clicking
  const [userInteractions, setUserInteractions] = useState<Record<string, 'like' | 'dislike' | null>>({});

  // Fetch real interaction counts when component loads and when profile changes
  useEffect(() => {
    fetchNewsInteractions();
  }, [profile]);

  // Real-time subscription for news interactions
  useEffect(() => {
    if (!id) return;

    const channel = (supabase as any)
      .channel('news_interactions')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'news_interactions' },
        (payload: any) => {
          console.log('📡 Real-time news interaction update:', payload);
          
          if (payload.eventType === 'INSERT') {
            // New like/dislike added
            setNewsData(prev => prev.map(news => {
              if (news.id === payload.new.news_id) {
                if (payload.new.interaction_type === 'like') {
                  return { ...news, likes: news.likes + 1 };
                } else {
                  return { ...news, dislikes: news.dislikes + 1 };
                }
              }
              return news;
            }));
          } else if (payload.eventType === 'UPDATE') {
            // Interaction changed (like to dislike or vice versa)
            setNewsData(prev => prev.map(news => {
              if (news.id === payload.new.news_id) {
                const oldType = payload.old.interaction_type;
                const newType = payload.new.interaction_type;
                
                let likes = news.likes;
                let dislikes = news.dislikes;
                
                if (oldType === 'like' && newType === 'dislike') {
                  likes = likes - 1;
                  dislikes = dislikes + 1;
                } else if (oldType === 'dislike' && newType === 'like') {
                  likes = likes + 1;
                  dislikes = dislikes - 1;
                }
                
                return { ...news, likes: Math.max(0, likes), dislikes: Math.max(0, dislikes) };
              }
              return news;
            }));
          } else if (payload.eventType === 'DELETE') {
            // Interaction removed
            setNewsData(prev => prev.map(news => {
              if (news.id === payload.old.news_id) {
                if (payload.old.interaction_type === 'like') {
                  return { ...news, likes: Math.max(0, news.likes - 1) };
                } else {
                  return { ...news, dislikes: Math.max(0, news.dislikes - 1) };
                }
              }
              return news;
            }));
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [id]);

  const fetchNewsInteractions = async () => {
    if (!profile) return;
    
    try {
      // Fetch total counts for all news items
      const { data: totalCounts } = await (supabase as any)
        .from('news_interactions')
        .select('news_id, interaction_type');
      
      // Fetch current user's interactions
      const { data: userInteractions } = await (supabase as any)
        .from('news_interactions')
        .select('news_id, interaction_type')
        .eq('user_id', profile.user_id);
      
      if (totalCounts) {
        const counts: Record<string, { likes: number; dislikes: number }> = {};
        const currentUserVotes: Record<string, 'like' | 'dislike'> = {};
        
        // Count total likes and dislikes for each news
        totalCounts.forEach(interaction => {
          if (!counts[interaction.news_id]) {
            counts[interaction.news_id] = { likes: 0, dislikes: 0 };
          }
          if (interaction.interaction_type === 'like') {
            counts[interaction.news_id].likes++;
          } else {
            counts[interaction.news_id].dislikes++;
          }
        });
        
        // Set user's current interactions
        if (userInteractions) {
          userInteractions.forEach(interaction => {
            currentUserVotes[interaction.news_id] = interaction.interaction_type as 'like' | 'dislike';
          });
        }
        
        // Update news data with interaction counts - always use database counts
        setNewsData(prev => {
          const updated = prev.map(news => {
            const dbCount = counts[news.id];
            if (dbCount) {
              // Always use database counts for total likes/dislikes
              const updatedNews = { ...news, likes: dbCount.likes, dislikes: dbCount.dislikes };
              // Also save to localStorage for persistence
              const storedLikes = getStoredLikes();
              storedLikes[news.id] = { likes: dbCount.likes, dislikes: dbCount.dislikes };
              if (profile?.user_id) {
            localStorage.setItem(`news_likes_${profile.user_id}`, JSON.stringify(storedLikes));
          }
              return updatedNews;
            }
            return { ...news, likes: 0, dislikes: 0 };
          });
          return updated;
        });
        
        // Set user's current interactions
        setUserInteractions(currentUserVotes);
      }
    } catch (error) {
      console.error('Error fetching news interactions:', error);
    }
  };

  const updateNewsReaction = async (newsId: string, type: 'like' | 'dislike') => {
    if (!profile) return;
    
    console.log('🔍 Updating news reaction:', { newsId, type, userId: profile.user_id });
    
    // Check user's current interaction state
    const currentInteraction = userInteractions[newsId];
    console.log('📊 Current interaction:', currentInteraction);
    
    try {
      if (currentInteraction === type) {
        // User is clicking the same button again - remove their interaction
        console.log('🗑️ Removing interaction...');
        const { error } = await (supabase as any)
          .from('news_interactions')
          .delete()
          .eq('news_id', newsId)
          .eq('user_id', profile.user_id);
        
        if (error) {
          console.error('❌ Delete error:', error);
          throw error;
        }
        console.log('✅ Interaction removed successfully');
        
        // Update local state - remove their vote
        setNewsData(prev => prev.map(news => {
          if (news.id === newsId) {
            const newLikes = type === 'like' ? news.likes - 1 : news.likes;
            const newDislikes = type === 'dislike' ? news.dislikes - 1 : news.dislikes;
            const updatedNews = { ...news, likes: Math.max(0, newLikes), dislikes: Math.max(0, newDislikes) };
            // Update selectedNews if it's the current one
            if (selectedNews?.id === newsId) {
              setSelectedNews(updatedNews);
            }
            // Save to localStorage for persistence
            const storedLikes = getStoredLikes();
            storedLikes[news.id] = { likes: Math.max(0, newLikes), dislikes: Math.max(0, newDislikes) };
            if (profile?.user_id) {
            localStorage.setItem(`news_likes_${profile.user_id}`, JSON.stringify(storedLikes));
          }
            return updatedNews;
          }
          return news;
        }));
        
        // Update user interaction state
        setUserInteractions(prev => {
          const newState = { ...prev };
          delete newState[newsId];
          return newState;
        });
        
        toast({ title: 'Removed', description: `Your ${type} was removed` });
      } else {
        // New interaction or changing from one type to another
        console.log('🔍 Checking for existing interaction...');
        const { data: existingInteraction, error: fetchError } = await (supabase as any)
          .from('news_interactions')
          .select('*')
          .eq('news_id', newsId)
          .eq('user_id', profile.user_id)
          .maybeSingle();
        
        if (fetchError) {
          console.error('❌ Fetch error:', fetchError);
          throw fetchError;
        }
        
        console.log('📋 Existing interaction:', existingInteraction);
        
        if (existingInteraction) {
          // User changed from like to dislike or vice versa
          console.log('🔄 Updating existing interaction...');
          const { error: updateError } = await (supabase as any)
            .from('news_interactions')
            .update({ interaction_type: type })
            .eq('id', existingInteraction.id);
          
          if (updateError) {
            console.error('❌ Update error:', updateError);
            throw updateError;
          }
          console.log('✅ Interaction updated successfully');
          
          // Update local state - swap the vote
          setNewsData(prev => prev.map(news => {
            if (news.id === newsId) {
              const oldType = currentInteraction || 'like'; // Default to like for calculation
              const newLikes = type === 'like' ? news.likes + 1 : (oldType === 'like' ? news.likes - 1 : news.likes);
              const newDislikes = type === 'dislike' ? news.dislikes + 1 : (oldType === 'dislike' ? news.dislikes - 1 : news.dislikes);
              const updatedNews = { ...news, likes: Math.max(0, newLikes), dislikes: Math.max(0, newDislikes) };
              // Update selectedNews if it's the current one
              if (selectedNews?.id === newsId) {
                setSelectedNews(updatedNews);
              }
              // Save to localStorage for persistence
              const storedLikes = getStoredLikes();
              storedLikes[news.id] = { likes: Math.max(0, newLikes), dislikes: Math.max(0, newDislikes) };
              if (profile?.user_id) {
            localStorage.setItem(`news_likes_${profile.user_id}`, JSON.stringify(storedLikes));
          }
              return updatedNews;
            }
            return news;
          }));
          
          toast({ title: 'Changed', description: `Changed to ${type}` });
        } else {
          // New interaction
          console.log('➕ Creating new interaction...');
          const { error: insertError } = await (supabase as any)
            .from('news_interactions')
            .insert({ news_id: newsId, user_id: profile.user_id, interaction_type: type });
          
          if (insertError) {
            console.error('❌ Insert error:', insertError);
            throw insertError;
          }
          console.log('✅ New interaction created successfully');
        
          // Update local state
          setNewsData(prev => prev.map(news => {
            if (news.id === newsId) {
              let updatedNews;
              if (type === 'like') {
                updatedNews = { ...news, likes: news.likes + 1 };
              } else {
                updatedNews = { ...news, dislikes: news.dislikes + 1 };
              }
              // Update selectedNews if it's the current one
              if (selectedNews?.id === newsId) {
                setSelectedNews(updatedNews);
              }
              // Save to localStorage for persistence
              const storedLikes = getStoredLikes();
              storedLikes[news.id] = { likes: updatedNews.likes, dislikes: updatedNews.dislikes };
              if (profile?.user_id) {
            localStorage.setItem(`news_likes_${profile.user_id}`, JSON.stringify(storedLikes));
          }
              return updatedNews;
            }
            return news;
          }));
          
          toast({ title: `${type === 'like' ? 'Liked!' : 'Disliked!'}`, description: `You ${type}d this news post` });
        }
        
        // Update user interaction state
        setUserInteractions(prev => ({
          ...prev,
          [newsId]: type
        }));
      }
    } catch (error) {
      console.error('Error updating news reaction:', error);
      toast({ title: 'Error', description: 'Could not update reaction', variant: 'destructive' });
    }
  };

  // Persisted user-game state (favorite, follow, notify)
  const { data: userGame } = useQuery({
    queryKey: ['user-game', id, profile?.user_id],
    enabled: !!id && !!profile,
    queryFn: async () => {
      console.log('🔍 Fetching user_game for:', { gameId: id, userId: profile!.user_id });
      const { data, error } = await supabase.from('user_games').select('*').eq('game_id', id!).eq('user_id', profile!.user_id).maybeSingle();
      console.log('🔍 User game result:', { data, error });
      return data as any;
    },
  });

  const isFavorite = !!userGame?.is_favorite;
  // We use last_played_at presence as "following" and a separate convention: we'll store notify in localStorage for now (no column), but persist via a tiny notifications-prefs key per-game.
  const [notifying, setNotifying] = useState(false);
  useEffect(() => {
    if (id && profile) {
      const key = `notify:${profile.user_id}:${id}`;
      setNotifying(localStorage.getItem(key) === '1');
    }
  }, [id, profile]);
  // "following" = there is a row in user_games (any row) for this user+game
  const isFollowing = !!userGame;

  const upsertUserGame = async (patch: { is_favorite?: boolean; last_played_at?: string }) => {
    if (!profile || !id) return;
    if (userGame) {
      await supabase.from('user_games').update(patch).eq('id', userGame.id);
    } else {
      await supabase.from('user_games').insert({ user_id: profile.user_id, game_id: id, ...patch });
    }
    queryClient.invalidateQueries({ queryKey: ['user-game', id, profile.user_id] });
    queryClient.invalidateQueries({ queryKey: ['user-games', profile.user_id] });
  };

  const toggleFavorite = async () => {
    if (!profile || !id) {
      console.log('❌ Cannot toggle favorite - missing profile or game id');
      toast({ title: 'Error', description: 'Please login to favorite games', variant: 'destructive' });
      return;
    }
    
    console.log('🔍 Toggling favorite, current state:', { isFavorite, userGame });
    
    try {
      if (userGame) {
        // Just toggle favorite, don't touch follow state
        console.log('🔄 Updating existing user_game row...');
        const { error } = await (supabase as any).from('user_games').update({ is_favorite: !isFavorite }).eq('id', userGame.id);
        if (error) {
          console.error('❌ Update error:', error);
          throw error;
        }
        console.log('✅ Updated favorite to:', !isFavorite);
      } else {
        // Create row with favorite=true (also means following)
        console.log('➕ Inserting new user_game row...');
        const { error } = await (supabase as any).from('user_games').insert({ user_id: profile.user_id, game_id: id, is_favorite: true });
        if (error) {
          console.error('❌ Insert error:', error);
          throw error;
        }
        console.log('✅ Inserted new favorite row');
      }
      queryClient.invalidateQueries({ queryKey: ['user-game', id, profile.user_id] });
      queryClient.invalidateQueries({ queryKey: ['user-games', profile.user_id] });
      toast({ title: !isFavorite ? t('game.favorited') : t('game.favorite') });
    } catch (error) {
      console.error('❌ Error toggling favorite:', error);
      toast({ title: 'Error', description: 'Could not update favorite status', variant: 'destructive' });
    }
  };
  const toggleFollow = async () => {
    if (!profile || !id) {
      console.log('❌ Cannot toggle follow - missing profile or game id');
      toast({ title: 'Error', description: 'Please login to follow games', variant: 'destructive' });
      return;
    }
    
    console.log('🔍 Toggling follow, current state:', { isFollowing, userGame, userId: profile.user_id, gameId: id });
    
    try {
      if (isFollowing && userGame) {
        // Also remove favorite when unfollowing - delete ONLY this user's record
        console.log('🗑️ Deleting user_game row for current user only...', { userGameId: userGame.id, userId: profile.user_id, gameId: id });
        const { error } = await (supabase as any).from('user_games').delete().eq('id', userGame.id);
        if (error) {
          console.error('❌ Delete error:', error);
          throw error;
        }
        console.log('✅ Deleted user_game row for current user');
      } else {
        // Create row (follow)
        console.log('➕ Inserting new user_game row for current user...', { userId: profile.user_id, gameId: id });
        const { error } = await (supabase as any).from('user_games').insert({ user_id: profile.user_id, game_id: id });
        if (error) {
          console.error('❌ Insert error:', error);
          throw error;
        }
        console.log('✅ Inserted new user_game row for current user');
      }
      queryClient.invalidateQueries({ queryKey: ['user-game', id, profile.user_id] });
      queryClient.invalidateQueries({ queryKey: ['user-games', profile.user_id] });
      queryClient.invalidateQueries({ queryKey: ['follower-count', id] });
      toast({ title: !isFollowing ? t('game.following') : t('game.follow') });
    } catch (error) {
      console.error('❌ Error toggling follow:', error);
      toast({ title: 'Error', description: 'Could not update follow status', variant: 'destructive' });
    }
  };
  const toggleNotify = () => {
    if (!profile || !id) return;
    const next = !notifying;
    setNotifying(next);
    localStorage.setItem(`notify:${profile.user_id}:${id}`, next ? '1' : '0');
  };

  const { data: reviews } = useQuery({
    queryKey: ['reviews', id],
    queryFn: async () => {
      const { data: reviewData } = await supabase.from('safe_reviews' as any).select('*').eq('game_id', id!);
      if (!reviewData || reviewData.length === 0) return [];
      const nonIncognitoUserIds = reviewData.filter((r: any) => !r.is_incognito).map((r: any) => r.user_id);
      const profileMap: Record<string, any> = {};
      const playtimeMap: Record<string, number> = {};
      if (nonIncognitoUserIds.length > 0) {
        const [{ data: profiles }, { data: ugs }, { data: privs }] = await Promise.all([
          supabase.from('public_profiles' as any).select('user_id, username, avatar_color, display_name').in('user_id', nonIncognitoUserIds),
          supabase.from('user_games').select('user_id, hours_played').eq('game_id', id!).in('user_id', nonIncognitoUserIds),
          supabase.from('privacy_settings' as any).select('user_id, show_playtime').in('user_id', nonIncognitoUserIds),
        ]);
        profiles?.forEach((p: any) => { profileMap[p.user_id] = p; });
        const hidden = new Set((privs as any[] || []).filter((p) => p.show_playtime === false).map((p) => p.user_id));
        (ugs as any[] || []).forEach((u) => {
          if (!hidden.has(u.user_id)) playtimeMap[u.user_id] = Number(u.hours_played) || 0;
        });
      }
      return reviewData.map((r: any) => ({
        ...r,
        profile: profileMap[r.user_id],
        hours_played: playtimeMap[r.user_id] || 0,
      }));
    },
    enabled: !!id,
  });

  const { data: myReview } = useQuery({
    queryKey: ['my-review', id, profile?.user_id],
    queryFn: async () => {
      if (!profile) return null;
      const { data } = await supabase.from('reviews').select('*').eq('game_id', id!).eq('user_id', profile.user_id).maybeSingle();
      return data;
    },
    enabled: !!id && !!profile,
  });

  // Fetch quick ratings for this game
  const { data: quickRatings } = useQuery({
    queryKey: ['quick-ratings', id],
    queryFn: async () => {
      if (!id) return [];
      try {
        const result = await (supabase as any).from('game_ratings').select('*').eq('game_id', id);
        return result.data || [];
      } catch (e) {
        console.log('game_ratings table may not exist yet:', e);
        return [];
      }
    },
    enabled: !!id,
  });

  // Fetch follower count for this game
  const { data: followerCount } = useQuery({
    queryKey: ['follower-count', id],
    queryFn: async () => {
      if (!id) return 0;
      try {
        // Count followers from user_games table (since follow functionality uses this table)
        const { count, error } = await supabase.from('user_games').select('*', { count: 'exact', head: true }).eq('game_id', id);
        console.log('Follower count query result:', { count, error, gameId: id });
        
        // Debug: fetch all user_games for this game to see the actual data
        const { data: allUserGames, error: debugError } = await supabase.from('user_games').select('*').eq('game_id', id);
        console.log('All user_games for this game:', { data: allUserGames, error: debugError });
        
        return count || 0;
      } catch (e) {
        console.log('Error fetching follower count:', e);
        return 0;
      }
    },
    enabled: !!id,
  });

  const { data: reviewCount } = useQuery({
    queryKey: ['game-review-count', id],
    queryFn: async () => {
      const { count } = await supabase.from('reviews').select('*', { count: 'exact', head: true }).eq('game_id', id!);
      return count || 0;
    },
    enabled: !!id,
  });

  const submitReview = async () => {
    if (!profile || !id) return;
    try {
      if (editingReview) {
        const { error } = await supabase.from('reviews').update({ stars: reviewStars, content: reviewContent, recommended: reviewRecommended, is_incognito: reviewIncognito }).eq('id', editingReview);
        if (error) throw error;
        setEditingReview(null);
      } else {
        const { error } = await supabase.from('reviews').insert({ user_id: profile.user_id, game_id: id, stars: reviewStars, content: reviewContent, recommended: reviewRecommended, is_incognito: reviewIncognito });
        if (error) throw error;
      }
      setReviewContent('');
      setReviewStars(5);
      setReviewRecommended(true);
      setReviewIncognito(false);
      queryClient.invalidateQueries({ queryKey: ['reviews', id] });
      queryClient.invalidateQueries({ queryKey: ['my-review', id] });
      queryClient.invalidateQueries({ queryKey: ['game-review-count', id] });
      toast({ title: t('game.reviewSubmitted') });
    } catch (error) {
      console.error('Error submitting review:', error);
      toast({ title: 'Error', description: 'Could not submit review', variant: 'destructive' });
    }
  };

  const deleteReview = async (reviewId: string) => {
    await supabase.from('reviews').delete().eq('id', reviewId);
    queryClient.invalidateQueries({ queryKey: ['reviews', id] });
    queryClient.invalidateQueries({ queryKey: ['my-review', id] });
    queryClient.invalidateQueries({ queryKey: ['game-review-count', id] });
    toast({ title: t('game.reviewDeleted') });
  };

  const startEditReview = (review: any) => {
    setEditingReview(review.id);
    setReviewStars(review.stars);
    setReviewContent(review.content || '');
    setReviewRecommended(review.recommended);
    setReviewIncognito(review.is_incognito);
  };

  if (!game) return <div className="p-6 text-muted-foreground">Loading...</div>;

  // Add default demo tags if game doesn't have tags
  const defaultTags = ['Action', 'Multiplayer', 'Demo'];
  const tags = game.tags && game.tags.length > 0 ? game.tags : defaultTags;
  // Use only colored gradients, no images
  const images = [0, 1, 2].map((i) => gradientFor(game.name, i));
  const safeIndex = ((imageIndex % images.length) + images.length) % images.length;
  const lastUpdated = new Date(game.updated_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });

  const onTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current == null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 40) setImageIndex((i) => (i + (dx < 0 ? 1 : -1) + images.length) % images.length);
    touchStartX.current = null;
  };

  // Calculate global rating from both quick ratings and review stars
  const totalRatings = (reviews?.length || 0) + (quickRatings?.length || 0);
  const totalStars = (reviews?.reduce((a: number, r: any) => a + (r.stars || 0), 0) || 0) + 
                    (quickRatings?.reduce((a: number, r: any) => a + (r.rating || 0), 0) || 0);
  const avgStars = totalRatings > 0 ? (totalStars / totalRatings).toFixed(1) : '0.0';

  return (
    <div className="p-4 sm:p-6">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
        <ArrowLeft className="h-4 w-4" /> {t('game.back')}
      </button>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left column */}
        <div className="flex-1 min-w-0">
          {/* Main image carousel - 16:9 with 3 swipeable images */}
          <div
            className="relative rounded-xl overflow-hidden aspect-video mb-4 select-none"
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          >
            <div
            className="absolute inset-0 flex items-center justify-center text-lg font-bold transition-all duration-500 animate-fade-in"
            style={{ background: images[safeIndex], color: 'white' }}
          >
            {game.name} <span className="opacity-60 ml-2 text-sm">#{safeIndex + 1}</span>
          </div>
            <button
              onClick={() => setImageIndex((i) => (i - 1 + images.length) % images.length)}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-foreground/30 hover:bg-foreground/50 text-background w-9 h-9 rounded-full flex items-center justify-center transition-colors z-10"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => setImageIndex((i) => (i + 1) % images.length)}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-foreground/30 hover:bg-foreground/50 text-background w-9 h-9 rounded-full flex items-center justify-center transition-colors z-10"
              aria-label="Next image"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            {/* Dots */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setImageIndex(i)}
                  aria-label={`Go to image ${i + 1}`}
                  className={`h-1.5 rounded-full transition-all ${i === safeIndex ? 'w-6 bg-white' : 'w-1.5 bg-white/50'}`}
                />
              ))}
            </div>
          </div>

          {/* 1. Game name & quick rating */}
          <div className="mb-3">
            <h1 className="text-2xl font-bold text-foreground mb-2">{game.name}</h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium text-foreground">{avgStars}</span>
                <span className="text-xs text-muted-foreground">({totalRatings} ratings)</span>
              </div>
              <StarRating value={quickRating} onChange={handleRatingChange} />
            </div>
          </div>

          {/* 2. Tags (colored) */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {tags.map((tag) => (
                <span key={tag} className={`px-3 py-1 rounded-full text-xs font-medium border ${tagClass(tag)}`}>{tag}</span>
              ))}
            </div>
          )}

          {/* 3. Friends that played */}

          {/* 4. Action buttons (mobile-first): Play | Follow+Notify | Favorite */}
          <div className="flex flex-col gap-2 mb-4 lg:hidden">
            <Button
              className="h-12 text-base font-semibold bg-gradient-to-r from-primary to-primary/80 active:scale-[0.98] transition-transform"
              size="lg"
            >
              <Play className="h-5 w-5 mr-2" /> {t('game.playNow')}
            </Button>
            <div className="flex gap-2">
              <Button
                variant={isFollowing ? 'default' : 'outline'}
                className="flex-1 h-11 active:scale-[0.97] transition-all"
                onClick={toggleFollow}
              >
                <Plus className={`h-4 w-4 mr-1 transition-transform ${isFollowing ? 'rotate-45' : ''}`} />
                {isFollowing ? t('game.following') : t('game.follow')}
              </Button>
              <Button
                variant={notifying ? 'default' : 'outline'}
                className="flex-1 h-11 active:scale-[0.97] transition-all"
                onClick={toggleNotify}
              >
                <Bell className={`h-4 w-4 mr-1 transition-transform ${notifying ? 'animate-[pulse_1.5s_ease-in-out_infinite]' : ''}`} />
                {notifying ? t('game.notifying') : t('game.notify')}
              </Button>
            </div>
            <Button
              variant={isFavorite ? 'default' : 'outline'}
              className={`h-11 active:scale-[0.97] transition-all ${isFavorite ? 'bg-pink-500 hover:bg-pink-600 border-pink-500 text-white' : ''}`}
              onClick={toggleFavorite}
            >
              <Heart className={`h-4 w-4 mr-2 transition-transform duration-300 ${isFavorite ? 'fill-current scale-125' : ''}`} />
              {isFavorite ? t('game.favorited') : t('game.favorite')}
            </Button>
          </div>

          
          {/* 5. Description */}
          <div className="bg-card border border-border rounded-lg p-5 mb-6">
            <h3 className="font-semibold text-foreground mb-2">{t('game.description')}</h3>
            <p className="text-sm text-muted-foreground">{game.description || t('game.noDescription')}</p>
          </div>

          {/* 6. Latest News */}
          <div className="mb-6">
            <h3 className="font-semibold text-foreground mb-4">{t('gameNews.latestNews')}</h3>
            {game.name === 'Game' || game.developer === 'RazeHub Team' ? (
              <p className="text-sm text-muted-foreground">{t('gameNews.noNews')}</p>
            ) : newsData.length > 0 ? (
              <div className="space-y-3">
                {newsData.slice(0, 3).map((news) => (
                  <div key={news.id} className="bg-card border border-border rounded-lg p-4 hover:border-primary/10 transition-colors cursor-pointer" onClick={() => setSelectedNews(news)}>
                    <div className="flex gap-4">
                      <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0" style={{ background: gradientFor(news.title, news.id.length) }}>
                        </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium px-2 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                            {news.type === 'Announcement' ? t('gameNews.announcement') : news.type === 'Update' ? t('gameNews.update') : news.type === 'Event' ? t('gameNews.event') : news.type}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(news.date).toLocaleDateString()}
                          </span>
                        </div>
                        <h4 className="font-medium text-foreground mb-1">{news.title}</h4>
                        <p className="text-sm text-muted-foreground line-clamp-2">{news.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
                {newsData.length > 3 && (
                  <button className="text-sm text-primary hover:underline font-medium">
                    {t('gameNews.readMore')} →
                  </button>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">{t('gameNews.noNews')}</p>
            )}
          </div>

          {/* 7. Upcoming Events */}
          <div className="mb-6">
            <h3 className="font-semibold text-foreground mb-4">Upcoming Events</h3>
            {game.name === 'Game' || game.developer === 'RazeHub Team' ? (
              <p className="text-sm text-muted-foreground">No upcoming events</p>
            ) : MOCK_EVENTS.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {MOCK_EVENTS.map((event) => (
                  <div
                    key={event.id}
                    className="bg-gradient-to-br from-card to-muted/30 border border-border rounded-xl overflow-hidden hover:shadow-lg hover:border-primary/40 transition-all cursor-pointer group"
                    onClick={() => setSelectedEvent(event)}
                  >
                    {/* Event Image with Date Badge */}
                    <div className="relative h-48 overflow-hidden" style={{ background: event.image }}>
                      {event.featured && (
                        <div className="absolute top-2 right-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg">
                          <Award className="h-3 w-3 inline mr-1" />
                          FEATURED
                        </div>
                      )}
                      <div className="absolute top-2 left-2 bg-white/90 dark:bg-black/80 backdrop-blur-sm rounded-lg px-2 py-1 text-center shadow-lg">
                        <div className="text-[10px] font-bold text-muted-foreground uppercase">
                          {new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}
                        </div>
                        <div className="text-lg font-bold text-foreground leading-none">
                          {new Date(event.date).getDate()}
                        </div>
                      </div>
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                    </div>

                    {/* Event Content */}
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                          {event.type}
                        </span>
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {event.time}
                        </div>
                      </div>
                      
                      <h4 className="font-bold text-foreground mb-3 line-clamp-1 group-hover:text-primary transition-colors">
                        {event.title}
                      </h4>

                      {/* Event Details */}
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <Users className="h-3 w-3" />
                        {event.currentParticipants} interested
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No upcoming events</p>
            )}
          </div>

          {/* 7. Reviews — last */}
          <div className="mb-6">
            <h3 className="font-semibold text-foreground mb-4">{t('game.playerReviews')}</h3>
            {reviews && reviews.length > 0 ? reviews.map((review: any) => {
              const reviewProfile = review.profiles;
              const isOwn = review.user_id === profile?.user_id;
              const reviewerName = review.is_incognito ? 'Incognito' : (reviewProfile?.display_name || reviewProfile?.username || 'Unknown');
              const reviewerColor = review.is_incognito ? '#6B7280' : (reviewProfile?.avatar_color || '#3B82F6');
              const reviewerLetter = review.is_incognito ? '?' : (reviewerName[0] || 'U').toUpperCase();

              return (
                <div key={review.id} className="bg-card border border-border rounded-lg p-4 mb-3 hover:border-primary/10 transition-colors">
                  <div className="flex items-center justify-between mb-2 gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-sm shrink-0" style={{ backgroundColor: reviewerColor, color: 'white' }}>{reviewerLetter}</div>
                      <span className="font-medium text-foreground truncate">{reviewerName}</span>
                      {review.hours_played != null && (
                        <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full shrink-0">
                          <Clock className="h-3 w-3" />
                          played {review.hours_played}h
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1 ${review.recommended ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                        {review.recommended ? <ThumbsUp className="h-3 w-3" /> : <ThumbsDown className="h-3 w-3" />}
                        <span className="hidden sm:inline">{review.recommended ? t('game.recommended') : t('game.notRecommended')}</span>
                      </span>
                      {isOwn && (
                        <div className="flex gap-1">
                          <button onClick={() => startEditReview(review)} className="text-muted-foreground hover:text-primary transition-colors"><Edit className="h-4 w-4" /></button>
                          <button onClick={() => deleteReview(review.id)} className="text-muted-foreground hover:text-destructive transition-colors"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      )}
                    </div>
                  </div>
                  {review.content && <p className="text-sm text-muted-foreground">{review.content}</p>}
                  {/* No stars in posts — recommended/not-recommended pill is the rating signal */}
                </div>
              );
            }) : (
              <EmptyBubble text="No reviews yet. Be the first to review!" />
            )}

            {!myReview || editingReview ? (
              <div className="bg-card border border-border rounded-lg p-4 mt-4">
                <h4 className="font-semibold text-foreground mb-3">{editingReview ? t('game.editReview') : t('game.writeReview')}</h4>
                <div className="flex gap-3 mb-3 flex-wrap">
                  <button type="button" onClick={() => setReviewRecommended(true)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${reviewRecommended ? 'bg-green-100 border-green-300 text-green-700 dark:bg-green-900/30 dark:border-green-700 dark:text-green-400' : 'border-border text-muted-foreground'}`}>
                    <ThumbsUp className="h-4 w-4" /> {t('game.recommended')}
                  </button>
                  <button type="button" onClick={() => setReviewRecommended(false)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${!reviewRecommended ? 'bg-red-100 border-red-300 text-red-700 dark:bg-red-900/30 dark:border-red-700 dark:text-red-400' : 'border-border text-muted-foreground'}`}>
                    <ThumbsDown className="h-4 w-4" /> {t('game.notRecommended')}
                  </button>
                </div>
                <Textarea value={reviewContent} onChange={(e) => setReviewContent(e.target.value)} placeholder={t('game.shareExperience')} className="mt-3 resize-none" rows={3} />
                
                {/* Screenshot attachment */}
                <div className="mt-3">
                  <label className="text-sm text-muted-foreground mb-2 block">Attach screenshot (coming soon)</label>
                  <div className="flex items-center gap-3 p-3 border-2 border-dashed border-border rounded-lg hover:border-primary/30 transition-colors cursor-pointer">
                    <ImageIcon className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Click to attach screenshot</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
                  <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                    <input type="checkbox" checked={reviewIncognito} onChange={(e) => setReviewIncognito(e.target.checked)} className="rounded" />
                    <EyeOff className="h-4 w-4" /> {t('game.writeIncognito')}
                  </label>
                  <div className="flex gap-2">
                    {editingReview && (
                      <Button variant="outline" size="sm" onClick={() => { setEditingReview(null); setReviewContent(''); setReviewStars(5); }}>{t('game.cancel')}</Button>
                    )}
                    <Button size="sm" onClick={submitReview} disabled={!profile}>
                      {editingReview ? t('game.updateReview') : t('game.submitReview')}
                      {reviewIncognito && <span className="ml-2 text-xs text-muted-foreground">(incognito)</span>}
                    </Button>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {/* Right column - desktop only buttons + info */}
        <div className="w-full lg:w-[320px] space-y-4 shrink-0">
          {/* Big square game image */}
          <div className="hidden lg:block rounded-xl overflow-hidden aspect-square">
            <div
              className="w-full h-full flex items-center justify-center text-lg font-bold"
              style={{ background: gradientFor(game.name, 0), color: 'white' }}
            >
              {game.name}
            </div>
          </div>

          <div className="hidden lg:block space-y-3">
            <Button className="w-full h-12 text-base font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70" size="lg">
              <Play className="h-5 w-5 mr-2" /> {t('game.playNow')}
            </Button>

            <div className="flex gap-2">
              <Button variant={isFollowing ? 'default' : 'outline'} className="flex-1" onClick={toggleFollow}>
                <Plus className="h-4 w-4 mr-1" /> {isFollowing ? t('game.following') : t('game.follow')}
              </Button>
              <Button variant={notifying ? 'default' : 'outline'} className="flex-1" onClick={toggleNotify}>
                <Bell className="h-4 w-4 mr-1" /> {notifying ? t('game.notifying') : t('game.notify')}
              </Button>
            </div>

            <Button
              variant={isFavorite ? 'default' : 'outline'}
              className={`w-full transition-all ${isFavorite ? 'bg-pink-500 hover:bg-pink-600 border-pink-500' : ''}`}
              onClick={toggleFavorite}
            >
              <Heart className={`h-4 w-4 mr-2 transition-transform ${isFavorite ? 'fill-current scale-110' : ''}`} />
              {isFavorite ? t('game.favorited') : t('game.favorite')}
            </Button>
          </div>

          {/* Information */}
          <div className="bg-card border border-border rounded-lg p-4">
            <h3 className="font-semibold text-foreground mb-3">{t('game.information')}</h3>
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between gap-3">
                <span className="text-muted-foreground">{t('game.developer')}</span>
                <button onClick={() => navigate(`/community/${game.developer}`)} className="text-primary hover:underline font-medium text-right">{game.developer || '-'}</button>
              </div>
              {[
                [t('game.published'), game.published_at ? new Date(game.published_at).toLocaleDateString() : '-'],
                [t('game.lastUpdated'), lastUpdated],
                [t('game.genre'), game.genre || '-'],
                [t('game.subgenre'), game.subgenre || '-'],
                [t('game.ageRating'), game.age_rating || '-'],
                [t('game.maxPlayers'), game.max_players?.toString() || '-'],
                [t('game.voiceChat'), game.voice_chat ? t('game.supported') : t('game.notSupported')],
                [t('game.textChat'), game.text_chat ? t('game.supported') : t('game.notSupported')],
                [t('game.avgRating'), `${avgStars} ★`],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between gap-3">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="text-foreground font-medium text-right">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Supported Devices */}
          <div className="bg-card border border-border rounded-lg p-4">
            <h3 className="font-semibold text-foreground mb-3">Supported Devices</h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { name: 'PC', icon: '🖥️', supported: true },
                { name: 'Console', icon: '🎮', supported: false },
                { name: 'Mobile', icon: '📱', supported: false },
                { name: 'Tablet', icon: '📱', supported: false },
                { name: 'VR', icon: '🥽', supported: false },
              ].map((device) => (
                <div key={device.name} className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${device.supported ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700' : 'bg-muted/50 border-border/50'}`}>
                  <span className="text-lg">{device.icon}</span>
                  <span className={`text-sm font-medium ${device.supported ? 'text-green-700 dark:text-green-400' : 'text-muted-foreground'}`}>
                    {device.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Playing Now */}
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-1">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
                <Users className="h-4 w-4 text-green-600" />
              </div>
              <p className="text-lg font-bold text-foreground">0 {t('game.playingNow')}</p>
            </div>
            <p className="text-sm text-muted-foreground">0 {t('game.totalPlayers')} · {followerCount ?? 0} {t('game.followers')} · {reviews?.length || 0} {t('game.reviews')}</p>
          </div>

          {/* Links */}
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Link2 className="h-4 w-4 text-primary" />
              <h3 className="font-semibold text-foreground">{t('game.links')}</h3>
            </div>
            <p className="text-sm text-muted-foreground">{t('game.noLinks')}</p>
          </div>

          {/* Game Badges */}
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Award className="h-4 w-4 text-yellow-500" />
              <h3 className="font-semibold text-foreground">{t('game.badges')}</h3>
            </div>
            <p className="text-sm text-muted-foreground">{t('game.noBadges')}</p>
          </div>
        </div>
      </div>

      {/* News Modal */}
      <Dialog open={!!selectedNews} onOpenChange={() => setSelectedNews(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedNews && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl">{selectedNews.title}</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Header with type and date */}
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium px-3 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                    {selectedNews.type === 'Announcement' ? t('gameNews.announcement') : selectedNews.type === 'Update' ? t('gameNews.update') : selectedNews.type === 'Event' ? t('gameNews.event') : selectedNews.type}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(selectedNews.date).toLocaleDateString()}
                  </span>
                </div>
                
                {/* Image */}
                <div className="w-full">
                  <div className="w-full h-64 rounded-lg flex items-center justify-center text-white font-bold text-2xl" style={{ background: gradientFor(selectedNews.title, selectedNews.id.length) }}>
                    {selectedNews.title[0]?.toUpperCase() || 'N'}
                  </div>
                </div>
                
                {/* Full content */}
                <div className="prose prose-sm max-w-none">
                  <p className="text-foreground leading-relaxed">{selectedNews.fullContent || selectedNews.content}</p>
                </div>
                
                {/* Interaction buttons */}
                <div className="flex items-center gap-4 pt-4 border-t border-border">
                  <button 
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${userInteractions[selectedNews.id] === 'like' ? 'bg-green-500 border-green-500 text-white' : 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30'}`}
                    onClick={() => updateNewsReaction(selectedNews.id, 'like')}
                  >
                    <ThumbsUp className={`h-4 w-4 ${userInteractions[selectedNews.id] === 'like' ? 'fill-current' : ''}`} />
                    <span className="text-sm font-medium">{selectedNews.likes}</span>
                  </button>
                  <button 
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${userInteractions[selectedNews.id] === 'dislike' ? 'bg-red-500 border-red-500 text-white' : 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30'}`}
                    onClick={() => updateNewsReaction(selectedNews.id, 'dislike')}
                  >
                    <ThumbsDown className={`h-4 w-4 ${userInteractions[selectedNews.id] === 'dislike' ? 'fill-current' : ''}`} />
                    <span className="text-sm font-medium">{selectedNews.dislikes}</span>
                  </button>
                  
                  <button
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                    onClick={() => {
                      toast({ title: t('community.comingSoon'), description: t('gameNews.discussComingSoon') });
                    }}
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">{t('gameNews.discuss')}</span>
                  </button>

                  <button
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: selectedNews.title,
                          text: selectedNews.content,
                          url: window.location.href
                        });
                      } else {
                        navigator.clipboard.writeText(window.location.href);
                        toast({ title: t('gameNews.linkCopied'), description: t('gameNews.linkCopiedDesc') });
                      }
                    }}
                  >
                    <Share2 className="h-4 w-4" />
                    <span className="text-sm font-medium">{t('gameNews.share')}</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Event Detail Modal */}
      <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedEvent && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl">{selectedEvent.title}</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Header with type and featured badge */}
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium px-3 py-1 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                    {selectedEvent.type}
                  </span>
                  {selectedEvent.featured && (
                    <span className="text-sm font-medium px-3 py-1 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                      <Award className="h-3 w-3 inline mr-1" />
                      Featured
                    </span>
                  )}
                </div>
                
                {/* Image */}
                <div className="w-full">
                  <div className="w-full h-64 rounded-lg flex items-center justify-center text-white font-bold text-2xl relative" style={{ background: selectedEvent.image }}>
                    {selectedEvent.featured && (
                      <div className="absolute top-3 left-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-sm font-bold px-3 py-1 rounded">
                        FEATURED EVENT
                      </div>
                    )}
                    <span className="opacity-80">{selectedEvent.title}</span>
                  </div>
                </div>
                
                {/* Event Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <Calendar className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Date</p>
                      <p className="text-sm font-medium">{new Date(selectedEvent.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <Clock className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Time</p>
                      <p className="text-sm font-medium">{selectedEvent.time}</p>
                    </div>
                  </div>
                </div>

                {/* Interested Count */}
                <div className="flex items-center gap-3 p-4 bg-primary/10 border border-primary/20 rounded-lg">
                  <Users className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Interested</p>
                    <p className="text-sm font-medium">{selectedEvent.currentParticipants} people</p>
                  </div>
                </div>
                
                {/* Full description */}
                <div className="prose prose-sm max-w-none">
                  <h4 className="font-semibold text-foreground">About This Event</h4>
                  <p className="text-foreground leading-relaxed">{selectedEvent.fullDescription}</p>
                </div>
                
                {/* Action buttons */}
                <div className="flex gap-3 pt-4 border-t border-border">
                  <Button className="flex-1" onClick={() => toast({ title: 'Registration', description: 'Event registration feature coming soon!' })}>
                    <Ticket className="h-4 w-4 mr-2" />
                    Register Now
                  </Button>
                  <Button variant="outline" onClick={() => toast({ title: 'Reminder', description: 'Reminder feature coming soon!' })}>
                    <Bell className="h-4 w-4 mr-2" />
                    Set Reminder
                  </Button>
                  <Button variant="outline" onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: selectedEvent.title,
                        text: selectedEvent.description,
                        url: window.location.href
                      });
                    } else {
                      navigator.clipboard.writeText(window.location.href);
                      toast({ title: 'Link copied', description: 'Event link copied to clipboard' });
                    }
                  }}>
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
