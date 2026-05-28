import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useFriends } from '@/hooks/useFriendship';
import { useI18n } from '@/lib/i18n';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import GameCard from '@/components/GameCard';
import SectionWithArrows from '@/components/SectionWithArrows';
import HorizontalScroller from '@/components/HorizontalScroller';
import WelcomeUI from '@/components/WelcomeUI';
import { Users, Users2 } from 'lucide-react';

function gradientFor(name: string, salt: number): string {
  const hash = name.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0) + salt * 137;
  const hue1 = hash % 360;
  const hue2 = (hash * 7 + salt * 53) % 360;
  return `linear-gradient(135deg, hsl(${hue1}, 60%, 40%), hsl(${hue2}, 50%, 50%))`;
}

export default function HomePage() {
  const { profile } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const { data: friends } = useFriends();
  const displayName = profile?.display_name || profile?.username;

  // Fetch joined communities from localStorage
  const joinedCommunities = profile?.user_id ? JSON.parse(localStorage.getItem(`communities_${profile.user_id}`) || '[]') : [];

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? t('home.greeting.morning') : hour < 18 ? t('home.greeting.afternoon') : t('home.greeting.evening');

  // Fetch all games for recent display
  const { data: allGames } = useQuery({
    queryKey: ['all-games'],
    queryFn: async () => {
      console.log('🔍 Fetching all games...');
      const { data } = await supabase.from('games').select('*');
      console.log('🔍 Games data:', data);
      return data || [];
    },
  });

  const { data: userGames } = useQuery({
    queryKey: ['user-games', profile?.user_id],
    queryFn: async () => {
      if (!profile) return [];
      const { data } = await supabase
        .from('user_games')
        .select('*, games(*)')
        .eq('user_id', profile.user_id)
        .order('last_played_at', { ascending: false }); // Order by most recently played
      return data || [];
    },
    enabled: !!profile,
  });

  const favoriteGames = userGames?.filter(ug => ug.is_favorite) || [];
  const recentGames = userGames?.filter(ug => !ug.is_favorite) || []; // Recently played games (not favorited)

  return (
    <div className="p-4 sm:p-6">
      <WelcomeUI onComplete={() => {}} />

      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-xl border border-primary/10 p-4 sm:p-6 mb-6 sm:mb-8">
        <p className="text-muted-foreground">{t('home.welcome')}, {displayName}</p>
        <h2 className="text-lg sm:text-xl font-semibold text-foreground mt-0.5">
          {greeting}
        </h2>
      </div>

      {/* Friends Section */}
      <section className="mb-6 sm:mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">{t('home.friends')}</h3>
        </div>
        {!friends || friends.length === 0 ? (
          <div className="bg-muted/30 border border-border border-dashed rounded-xl p-6 sm:p-8 flex flex-col items-center justify-center gap-2">
            <Users className="h-8 w-8 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground text-center max-w-xs">{t('home.friends.empty')}</p>
          </div>
        ) : (
          <HorizontalScroller step={240}>
            {friends.map((f: any) => {
              const name = f.display_name || f.username;
              const statusColor = f.status === 'online' ? 'bg-green-500' : f.status === 'idle' ? 'bg-yellow-500' : f.status === 'dnd' ? 'bg-red-500' : 'bg-gray-400';
              return (
                <button key={f.user_id} onClick={() => navigate(`/profile/${f.user_id}`)} className="flex-shrink-0 snap-start flex flex-col items-center gap-2 p-2 sm:p-3 rounded-2xl hover:bg-accent transition-colors w-[100px] sm:w-[120px]">
                  <div className="relative">
                    <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-full flex items-center justify-center text-2xl sm:text-3xl font-bold shadow-md ring-2 ring-card" style={{ backgroundColor: f.avatar_color, color: 'white' }}>
                      {name[0]?.toUpperCase()}
                    </div>
                    <div className={`absolute bottom-1 right-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 border-card ${statusColor}`} />
                  </div>
                  <span className="text-xs sm:text-sm font-medium text-foreground truncate max-w-full">{name}</span>
                  <span className="text-[9px] sm:text-[10px] text-muted-foreground capitalize">{f.status}</span>
                </button>
              );
            })}
          </HorizontalScroller>
        )}
      </section>

      {/* Recent Games */}
      <SectionWithArrows
        title={t('home.recent')}
        isEmpty={!recentGames || recentGames.length === 0}
        emptyText={t('home.recent.empty')}
      >
        <HorizontalScroller>
          {recentGames?.map((userGame) => (
            <div key={userGame.id} className="flex-shrink-0 snap-start w-[160px] sm:w-[180px]">
              <GameCard game={userGame.games} variant="square" hoursPlayed={userGame.hours_played || 0} />
            </div>
          ))}
        </HorizontalScroller>
      </SectionWithArrows>

      {/* Favorite Games */}
      <SectionWithArrows
        title={t('home.favorites')}
        isEmpty={favoriteGames.length === 0}
        emptyText={t('home.favorites.empty')}
      >
        <HorizontalScroller>
          {favoriteGames.map((ug) => (
            <div key={ug.id} className="flex-shrink-0 snap-start w-[160px] sm:w-[180px]">
              <GameCard game={ug.games as any} variant="square" hoursPlayed={(ug as any).hours_played || 0} />
            </div>
          ))}
        </HorizontalScroller>
      </SectionWithArrows>

      {/* Communities */}
      <SectionWithArrows
        title="Communities"
        isEmpty={joinedCommunities.length === 0}
        emptyText="No communities joined yet"
      >
        <HorizontalScroller>
          {joinedCommunities.map((communityName: string) => (
            <div key={communityName} className="flex-shrink-0 snap-start w-[160px] sm:w-[180px]">
              <div onClick={() => navigate(`/community/${communityName}`)} className="cursor-pointer group">
                <div className="aspect-square w-[160px] sm:w-[180px] border border-border rounded-lg overflow-hidden mb-2 transition-all duration-300 group-hover:shadow-lg group-hover:border-primary/50" style={{ background: gradientFor(communityName, 1) }}>
                  <div className="w-full h-full flex items-center justify-center text-white font-bold text-xl">
                    {communityName[0]?.toUpperCase()}
                  </div>
                </div>
                <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">{communityName}</p>
              </div>
            </div>
          ))}
        </HorizontalScroller>
      </SectionWithArrows>
    </div>
  );
}
