import { useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';

const PAGE_TITLES: Record<string, string> = {
  '/': 'RazeHub',
  '/signup': 'RazeHub - Sign Up',
  '/home': 'RazeHub - Home',
  '/discover': 'RazeHub - Discover',
  '/profile': 'RazeHub - Profile',
  '/settings': 'RazeHub - Settings',
  '/mailbox': 'RazeHub - Mailbox',
  '/support': 'RazeHub - Support',
  '/developer': 'RazeHub - Developer Hub',
  '/creator': 'RazeHub - Creator Studio',
  '/moderation': 'RazeHub - Moderation',
  '/chat': 'RazeHub - Chat',
  '/parental-controls': 'RazeHub - Parental Controls',
  '/marketplace': 'RazeHub - Marketplace',
  '/cart': 'RazeHub - Cart',
  '/checkout': 'RazeHub - Checkout',
  '/billing': 'RazeHub - Billing',
  '/transactions': 'Transactions',
  '/redeem-codes': 'Redeem Codes',
  '/inventory': 'RazeHub - Inventory',
  '/avatar': 'RazeHub - Avatar',
  '/buy-rz': 'Buy RZ',
  '/payment-rz': 'Complete Purchase',
  '/payment-subscription': 'Subscribe',
};

export default function DocumentTitle() {
  const location = useLocation();
  const params = useParams();

  useEffect(() => {
    const path = location.pathname;
    let title = '';

    // Handle dynamic routes
    if (path.startsWith('/game/')) {
      // Game page - just the game name (no RazeHub prefix)
      // The game name would come from the game data, but for now use the ID
      const gameId = params.id;
      title = gameId || 'Game';
    } else if (path.startsWith('/profile/') && path !== '/profile') {
      // Other profile page - RazeHub - Player display name
      const userId = params.userId;
      title = `RazeHub - ${userId || 'Player'}`;
    } else if (path.startsWith('/community/')) {
      // Community page - RazeHub - Studio Name
      const studioName = params.studioName;
      title = `RazeHub - ${studioName || 'Community'}`;
    } else if (path.startsWith('/marketplace/item/')) {
      // Marketplace item detail - RazeHub - Item Name
      const itemId = params.id;
      title = `RazeHub - Item ${itemId || 'Details'}`;
    } else {
      // Static routes
      title = PAGE_TITLES[path] || 'RazeHub';
    }

    document.title = title;
  }, [location.pathname, params]);

  return null;
}

// Hook for pages to set custom titles
export function useDocumentTitle(title: string) {
  useEffect(() => {
    document.title = title;
    return () => {
      // Reset to default when component unmounts
      document.title = 'RazeHub';
    };
  }, [title]);
}
