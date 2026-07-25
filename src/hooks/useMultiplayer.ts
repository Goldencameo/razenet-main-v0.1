import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface PlayerState {
  id: string;
  user_id: string;
  username: string;
  avatar_color: string;
  position_x: number;
  position_y: number;
  position_z: number;
  rotation_y: number;
  is_jumping: boolean;
}

export function useMultiplayer(gameId: string) {
  const { profile } = useAuth();
  const [players, setPlayers] = useState<Map<string, PlayerState>>(new Map());
  const updateInterval = useRef<NodeJS.Timeout>();
  const localPosition = useRef({ x: 0, y: 1, z: 0, rotationY: 0, isJumping: false });

  // Join game
  useEffect(() => {
    if (!profile || !gameId) return;

    const joinGame = async () => {
      await (supabase as any).from('game_players').upsert({
        game_id: gameId,
        user_id: profile.user_id,
        username: profile.username || profile.display_name || 'Player',
        avatar_color: profile.avatar_color || '#3B82F6',
        position_x: 0,
        position_y: 1,
        position_z: 0,
        rotation_y: 0,
        is_jumping: false,
      });
    };

    joinGame();

    // Subscribe to player changes
    const channel = supabase
      .channel(`game-players-${gameId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'game_players',
        filter: `game_id=eq.${gameId}`,
      }, (payload) => {
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
          const newPlayer = payload.new as PlayerState;
          if (newPlayer.user_id !== profile.user_id) {
            setPlayers(prev => new Map(prev).set(newPlayer.user_id, newPlayer));
          }
        } else if (payload.eventType === 'DELETE') {
          const oldPlayer = payload.old as PlayerState;
          setPlayers(prev => {
            const newMap = new Map(prev);
            newMap.delete(oldPlayer.user_id);
            return newMap;
          });
        }
      })
      .subscribe();

    // Load initial players
    const loadPlayers = async () => {
      const { data } = await (supabase as any)
        .from('game_players')
        .select('*')
        .eq('game_id', gameId);
      
      if (data) {
        const playersMap = new Map<string, PlayerState>();
        data.forEach((p: any) => {
          if (p.user_id !== profile.user_id) {
            playersMap.set(p.user_id, p as PlayerState);
          }
        });
        setPlayers(playersMap);
      }
    };

    loadPlayers();

    // Update position every 100ms
    updateInterval.current = setInterval(async () => {
      if (profile) {
        await (supabase as any)
          .from('game_players')
          .update({
            position_x: localPosition.current.x,
            position_y: localPosition.current.y,
            position_z: localPosition.current.z,
            rotation_y: localPosition.current.rotationY,
            is_jumping: localPosition.current.isJumping,
            last_updated: new Date().toISOString(),
          })
          .eq('game_id', gameId)
          .eq('user_id', profile.user_id);
      }
    }, 100);

    return () => {
      supabase.removeChannel(channel);
      if (updateInterval.current) {
        clearInterval(updateInterval.current);
      }
      // Leave game
      (supabase as any)
        .from('game_players')
        .delete()
        .eq('game_id', gameId)
        .eq('user_id', profile.user_id);
    };
  }, [gameId, profile]);

  const updatePosition = (x: number, y: number, z: number, rotationY: number, isJumping: boolean) => {
    localPosition.current = { x, y, z, rotationY, isJumping };
  };

  return {
    players: Array.from(players.values()),
    updatePosition,
  };
}
