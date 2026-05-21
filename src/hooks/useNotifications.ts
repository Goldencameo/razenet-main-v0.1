import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';

export function useNotifications() {
  const { profile } = useAuth();
  const qc = useQueryClient();
  const me = profile?.user_id;

  const query = useQuery({
    queryKey: ['notifications', me],
    enabled: !!me,
    queryFn: async () => {
      if (!me) return [];
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', me)
        .order('created_at', { ascending: false })
        .limit(50);
      return data || [];
    },
  });

  // Real-time updates
  useEffect(() => {
    if (!me) return;
    const channel = supabase
      .channel(`notif-${me}-${Math.random().toString(36).slice(2)}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${me}` },
        () => qc.invalidateQueries({ queryKey: ['notifications', me] })
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [me, qc]);

  const markAllRead = useMutation({
    mutationFn: async () => {
      if (!me) return;
      await supabase.from('notifications').update({ is_read: true }).eq('user_id', me).eq('is_read', false);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications', me] }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      await supabase.from('notifications').delete().eq('id', id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications', me] }),
  });

  const items = query.data || [];
  const unreadCount = items.filter((n: any) => !n.is_read).length;
  return { items, unreadCount, isLoading: query.isLoading, markAllRead, remove };
}

/**
 * Ensures the welcome notification exists exactly once per user.
 * Called from AuthProvider on first sign-in / first profile load.
 */
export async function ensureWelcomeNotification(userId: string) {
  const flagKey = `razehub.welcomeNotified.${userId}`;
  if (typeof window !== 'undefined' && localStorage.getItem(flagKey)) return;

  const { data: existing } = await supabase
    .from('notifications')
    .select('id')
    .eq('user_id', userId)
    .eq('type', 'system')
    .ilike('title', 'Welcome to RazeHub%')
    .maybeSingle();
  if (existing) {
    if (typeof window !== 'undefined') localStorage.setItem(flagKey, '1');
    return;
  }

  await supabase.from('notifications').insert({
    user_id: userId,
    type: 'system',
    title: 'Welcome to RazeHub',
    body: "We're glad you're here. Add friends, discover games, and dive in!",
  });
  if (typeof window !== 'undefined') localStorage.setItem(flagKey, '1');
}