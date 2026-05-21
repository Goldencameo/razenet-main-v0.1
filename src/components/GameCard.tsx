import { forwardRef } from 'react';
import { Link } from 'react-router-dom';
import { Star, Users } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

type Game = Tables<'games'>;

interface GameCardProps {
  game: Game;
  variant: 'square' | 'rectangle';
  hoursPlayed?: number;
  rating?: number;
  reviewCount?: number;
  showDemoTag?: boolean;
}

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
  return `linear-gradient(135deg, hsl(${hue1}, 60%, 40%), hsl(${hue2}, 50%, 50%))`;
}

const GameCard = forwardRef<HTMLAnchorElement, GameCardProps>(({ game, variant, hoursPlayed, rating, reviewCount, showDemoTag = false }, ref) => {
  const isSquare = variant === 'square';

  return (
    <Link to={`/game/${game.id}`} ref={ref} className="group/card block" style={{ WebkitTapHighlightColor: 'transparent' }}>
      <div
        className={`relative rounded-xl overflow-hidden ${
          isSquare ? 'aspect-square' : 'aspect-video'
        } outline-none`}
      >
        {showDemoTag && (
          <div className="absolute top-2 left-2 z-10 bg-amber-500/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
            DEMO
          </div>
        )}
        <div
            className="absolute inset-0 flex items-center justify-center text-sm font-semibold transition-transform duration-300 group-hover/card:scale-110"
            style={{
              background: getGameGradient(game.name),
              color: 'white',
            }}
          >
            {game.name}
          </div>
      </div>
      <div className="mt-2 px-1">
        <p className="text-sm font-medium text-foreground group-hover/card:text-primary transition-colors truncate">
          {game.name}
        </p>
        {isSquare && hoursPlayed !== undefined && (
          <p className="text-xs text-muted-foreground">{hoursPlayed}h played</p>
        )}
        {!isSquare && (
          <div className="flex items-center justify-between mt-1">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span>{rating !== undefined ? rating.toFixed(1) : '0.0'}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-green-600">
              <Users className="h-3 w-3" />
              <span>0 playing</span>
            </div>
          </div>
        )}
      </div>
    </Link>
  );
});
GameCard.displayName = 'GameCard';

export default GameCard;
