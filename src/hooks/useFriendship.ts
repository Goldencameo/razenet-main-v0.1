import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type FriendshipState =
  | { status: 'none' }
  | { status: 'pending_outgoing'; id: string }
  | { status: 'pending_incoming'; id: string }
  | { status: 'friends'; id: string };

export function useFriendship(otherUserId?: string) {
  const { profile } = useAuth();
  const qc = useQueryClient();
  const me = profile?.user_id;

  const query = useQuery({
    queryKey: ['friendship', me, otherUserId],
    enabled: !!me && !!otherUserId && me !== otherUserId,
    queryFn: async (): Promise<FriendshipState> => {
      if (!me || !otherUserId) return { status: 'none' };
      const { data } = await supabase
        .from('friendships')
        .select('id, requester_id, addressee_id, status')
        .or(
          `and(requester_id.eq.${me},addressee_id.eq.${otherUserId}),and(requester_id.eq.${otherUserId},addressee_id.eq.${me})`
        )
        .maybeSingle();
      if (!data) return { status: 'none' };
      if (data.status === 'accepted') return { status: 'friends', id: data.id };
      if (data.requester_id === me) return { status: 'pending_outgoing', id: data.id };
      return { status: 'pending_incoming', id: data.id };
    },
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['friendship', me, otherUserId] });
    qc.invalidateQueries({ queryKey: ['friends', me] });
    qc.invalidateQueries({ queryKey: ['notifications', me] });
  };

  const sendRequest = useMutation({
    mutationFn: async () => {
      if (!me || !otherUserId) throw new Error('not signed in');
      const { error } = await supabase
        .from('friendships')
        .insert({ requester_id: me, addressee_id: otherUserId });
      if (error) throw error;
      
      // Create notification for the receiver with link to profile
      await supabase
        .from('notifications')
        .insert({
          user_id: otherUserId,
          actor_id: me,
          type: 'friend_request',
          title: 'Friend Request',
          body: 'You have a new friend request',
          link: `/profile/${me}`,
        });
    },
    onSuccess: invalidate,
  });

  const cancelOrRemove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('friendships').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const accept = useMutation({
    mutationFn: async (id: string) => {
      // Get the friendship details to find the requester
      const { data: friendship } = await supabase
        .from('friendships')
        .select('requester_id, addressee_id')
        .eq('id', id)
        .single();

      if (!friendship) throw new Error('Friendship not found');

      const { error } = await supabase
        .from('friendships')
        .update({ status: 'accepted' })
        .eq('id', id);
      if (error) throw error;

      // Create notification for the requester that their request was accepted
      await supabase
        .from('notifications')
        .insert({
          user_id: friendship.requester_id,
          actor_id: me,
          type: 'friend_accepted',
          title: 'Friend Request Accepted',
          body: 'Your friend request was accepted!',
          link: `/profile/${me}`,
        });
    },
    onSuccess: invalidate,
  });

  return { query, sendRequest, cancelOrRemove, accept };
}

export function useFriends() {
  const { profile } = useAuth();
  const qc = useQueryClient();
  const me = profile?.user_id;
  
  const query = useQuery({
    queryKey: ['friends', me],
    enabled: !!me,
    queryFn: async () => {
      if (!me) return [] as Array<{ user_id: string; username: string; display_name: string | null; avatar_color: string; status: string }>;
      
      const { data: links } = await supabase
        .from('friendships')
        .select('requester_id, addressee_id')
        .eq('status', 'accepted')
        .or(`requester_id.eq.${me},addressee_id.eq.${me}`);
      const ids = (links || [])
        .map((l: any) => (l.requester_id === me ? l.addressee_id : l.requester_id))
        .filter(Boolean);
      if (ids.length === 0) return [];
      // Query directly from profiles table
      const { data: people } = await supabase
        .from('profiles')
        .select('user_id, username, username_lower, display_name, avatar_color, status, last_seen_at')
        .in('user_id', ids);
      
      // Map status to simplified values: online, offline
      const peopleWithMappedStatus = (people || []).map((p: any) => {
        let mappedStatus = 'offline';

        // Check if user is actually online based on last_seen_at (within last 5 minutes)
        const isActuallyOnline = p.last_seen_at && new Date(p.last_seen_at) > new Date(Date.now() - 5 * 60 * 1000);

        if (isActuallyOnline && p.status === 'online') {
          mappedStatus = 'online';
        } else {
          mappedStatus = 'offline';
        }

        // idle, dnd, offline, invis all map to offline
        return {
          ...p,
          status: mappedStatus
        };
      });

      return peopleWithMappedStatus;
    },
  });
  
  // Subscribe to status changes for friends
  useEffect(() => {
    if (!me || !query.data) return;
    
    const friendIds = query.data.map((f: any) => f.user_id);
    
    const channel = supabase
      .channel('friends_status_changes')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'profiles',
        filter: `user_id=in.(${friendIds.join(',')})`
      }, () => {
        // Refresh friends list when status changes
        qc.invalidateQueries({ queryKey: ['friends', me] });
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [me, query.data, qc]);
  
  // Listen for custom refresh event
  useEffect(() => {
    const handleRefresh = () => {
      qc.invalidateQueries({ queryKey: ['friends', me] });
    };
    window.addEventListener('refresh-friends', handleRefresh);
    return () => window.removeEventListener('refresh-friends', handleRefresh);
  }, [me, qc]);
  
  return query;
}