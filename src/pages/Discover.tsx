import { supabase } from '@/integrations/supabase/client';
import { useI18n } from '@/lib/i18n';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Shield, Crown, ArrowRight, Clock, Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import GameCard from '@/components/GameCard';
import SectionWithArrows from '@/components/SectionWithArrows';
import HorizontalScroller from '@/components/HorizontalScroller';
import { useState } from 'react';

export default function Discover() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [showAgeCheckAd, setShowAgeCheckAd] = useState(true);

  const SECTIONS = [
    { key: 'trending', label: t('discover.trending') },
    { key: 'topSellers', label: t('discover.topSellers') },
    { key: 'trendingFree', label: t('discover.trendingFree') },
    { key: 'topRated', label: t('discover.topRated') },
    { key: 'newRising', label: t('discover.newRising') },
    { key: 'friendsPlaying', label: t('discover.friendsPlaying') },
    { key: 'comingSoon', label: t('discover.comingSoon') },
    { key: 'forYou', label: t('discover.forYou') },
  ];

  const { data: games } = useQuery({
    queryKey: ['games'],
    queryFn: async () => {
      const { data: gamesData } = await supabase.from('games').select('*');
      
      // Fetch both quick ratings and review ratings
      let quickRatings = [];
      let quickRatingsError = null;
      try {
        const result = await (supabase as any).from('game_ratings').select('game_id, rating');
        quickRatings = result.data;
        quickRatingsError = result.error;
      } catch (e) {
        console.log('game_ratings table may not exist yet:', e);
      }
      
      const { data: reviews, error: reviewsError } = await supabase.from('reviews').select('game_id, stars');
      
      console.log('Quick ratings data:', quickRatings);
      console.log('Quick ratings error:', quickRatingsError);
      console.log('Reviews data:', reviews);
      console.log('Reviews error:', reviewsError);
      
      // Calculate ratings for each game from both sources
      const gameRatings: Record<string, { totalRating: number; totalCount: number }> = {};
      
      // Add quick ratings
      if (quickRatings && quickRatings.length > 0) {
        quickRatings.forEach((rating: any) => {
          if (!gameRatings[rating.game_id]) {
            gameRatings[rating.game_id] = { totalRating: 0, totalCount: 0 };
          }
          gameRatings[rating.game_id].totalRating += rating.rating || 0;
          gameRatings[rating.game_id].totalCount += 1;
        });
      }
      
      // Add review ratings
      if (reviews && reviews.length > 0) {
        reviews.forEach((review: any) => {
          if (!gameRatings[review.game_id]) {
            gameRatings[review.game_id] = { totalRating: 0, totalCount: 0 };
          }
          gameRatings[review.game_id].totalRating += review.stars || 0;
          gameRatings[review.game_id].totalCount += 1;
        });
      }
      
      // Calculate averages
      const gameAverageRatings: Record<string, { rating: number; reviewCount: number }> = {};
      Object.keys(gameRatings).forEach(gameId => {
        const data = gameRatings[gameId];
        gameAverageRatings[gameId] = {
          rating: data.totalCount > 0 ? data.totalRating / data.totalCount : 0,
          reviewCount: data.totalCount
        };
      });
      
      // Attach ratings to games
      const gamesWithRatings = (gamesData || []).map((game: any) => ({
        ...game,
        rating: gameAverageRatings[game.id]?.rating,
        reviewCount: gameAverageRatings[game.id]?.reviewCount || 0,
      }));
      
      console.log('Games with ratings:', gamesWithRatings);
      
      return gamesWithRatings;
    },
  });

  // Insert ads between sections
  const AD_AFTER_SECTION_INDEX = 1; // after 2nd section
  const PREMIUM_AFTER_SECTION_INDEX = 3; // after 4th section

  const AgeCheckAd = () => (
    <div className="mb-8 bg-card border border-border rounded-xl p-4 sm:p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center shrink-0">
            <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground text-base mb-1">{t('discover.ageCheckTitle')}</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">{t('discover.ageCheckDesc')}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="default"
            size="sm"
            onClick={() => navigate('/settings?tab=age-check')}
            className="flex-1 sm:flex-none"
          >
            {t('discover.ageCheckLetsDoIt')}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAgeCheckAd(false)}
            className="flex-1 sm:flex-none"
          >
            {t('discover.ageCheckRemindLater')}
          </Button>
        </div>
      </div>
    </div>
  );

  const PremiumAd = () => (
    <div className="mb-8 bg-card border border-border rounded-xl p-4 sm:p-6 shadow-sm">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 sm:w-12 sm:h-12 rounded-lg bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center shrink-0">
            <Crown className="h-7 w-7 sm:h-6 sm:w-6 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-foreground text-base sm:text-base">{t('discover.premiumTitle')}</h3>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">$4.99/mo</span>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">{t('discover.premiumDesc')}</p>
          </div>
        </div>
        <Button
          variant="default"
          size="lg"
          onClick={() => navigate('/settings?tab=billing')}
          className="w-full sm:w-auto"
        >
          {t('discover.premiumUpgrade')}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">{t('discover.title')}</h1>
        <p className="text-muted-foreground mt-1">{t('discover.subtitle')}</p>
      </div>

      {/* Age Check Ad at the top */}
      {showAgeCheckAd && <AgeCheckAd />}

      {SECTIONS.map((section, idx) => {
        const hasGames = games && games.length > 0;
        return (
          <div key={section.key}>
          {idx === PREMIUM_AFTER_SECTION_INDEX && <PremiumAd />}
          {section.key === 'comingSoon' ? (
            <SectionWithArrows
              title={section.label}
              isEmpty={true}
              emptyText={t('discover.comingSoonEmpty')}
            >
              <div className="flex items-center gap-2 text-muted-foreground py-8 justify-center w-full">
                <Clock className="h-5 w-5" />
                <p className="text-sm">{t('discover.comingSoonEmpty')}</p>
              </div>
            </SectionWithArrows>
          ) : (
            <SectionWithArrows
            title={section.label}
            isEmpty={!hasGames}
            emptyText={t('discover.empty')}
            >
            <HorizontalScroller>
              {games?.map((game) => (
                <div key={game.id} className="flex-shrink-0 snap-start w-[260px] sm:w-[300px]">
                  <GameCard game={game} variant="rectangle" rating={game.rating} reviewCount={game.reviewCount} showDemoTag={true} />
                </div>
              ))}
            </HorizontalScroller>
            </SectionWithArrows>
          )}
          </div>
        );
      })}
    </div>
  );
}
