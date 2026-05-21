import { Shield, Search, UserX, Ban, VolumeX, Volume2, ShieldCheck, AlertTriangle, History } from 'lucide-react';
import { useUserRoles } from '@/hooks/useUserRole';
import { Navigate, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useQueryClient } from '@tanstack/react-query';

type ModAction = 'mute' | 'unmute' | 'ban' | 'unban' | 'warn';

export default function ModerationPanel() {
  const { isModerator, isAdmin, isLoading } = useUserRoles();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [q, setQ] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [busy, setBusy] = useState<string | null>(null);

  // Recent moderation log
  const { data: recent } = useQuery({
    queryKey: ['mod-recent'],
    enabled: isModerator,
    queryFn: async () => {
      const { data } = await supabase
        .from('moderation_actions' as any)
        .select('id, target_user_id, moderator_id, action, reason, created_at')
        .order('created_at', { ascending: false })
        .limit(20);
      return (data as any[]) || [];
    },
  });

  // Status map for results
  const { data: statusMap } = useQuery({
    queryKey: ['mod-status', results.map((r) => r.user_id).join(',')],
    enabled: results.length > 0,
    queryFn: async () => {
      const ids = results.map((r) => r.user_id);
      const { data } = await supabase
        .from('user_moderation_status' as any)
        .select('user_id, is_banned, is_muted')
        .in('user_id', ids);
      const map: Record<string, { is_banned: boolean; is_muted: boolean }> = {};
      (data as any[] || []).forEach((r) => { map[r.user_id] = { is_banned: r.is_banned, is_muted: r.is_muted }; });
      return map;
    },
  });

  useEffect(() => {
    if (!isModerator) return;
    const term = q.trim().toLowerCase();
    if (!term) { setResults([]); return; }
    const t = setTimeout(async () => {
      const { data } = await supabase
        .from('public_profiles' as any)
        .select('user_id, username, display_name, avatar_color, created_at')
        .or(`username.ilike.%${term}%,display_name.ilike.%${term}%`)
        .limit(20);
      setResults((data as any[]) || []);
    }, 300);
    return () => clearTimeout(t);
  }, [q, isModerator]);

  const performAction = async (targetId: string, action: ModAction, label: string) => {
    if (!isAdmin || !user) return;
    const reason = window.prompt(`Reason for ${label}? (optional)`) ?? '';
    setBusy(`${targetId}:${action}`);
    const { error } = await supabase.from('moderation_actions' as any).insert({
      target_user_id: targetId,
      moderator_id: user.id,
      action,
      reason: reason || null,
    });
    setBusy(null);
    if (error) {
      toast({ title: 'Action failed', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: `${label} recorded` });
    qc.invalidateQueries({ queryKey: ['mod-recent'] });
    qc.invalidateQueries({ queryKey: ['mod-status'] });
  };

  if (isLoading) return <div className="p-6 text-muted-foreground">Loading...</div>;
  if (!isModerator) return <Navigate to="/home" replace />;

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
          <Shield className="h-5 w-5 text-destructive" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Moderation Panel</h1>
          <p className="text-muted-foreground text-sm">
            {isAdmin ? 'Search users, view profiles, and moderate the community.' : 'Search users and view profiles. (Admin-only actions are hidden.)'}
          </p>
        </div>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search by username or display name..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="w-full h-11 pl-9 pr-3 rounded-lg bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      <div className="space-y-2 mb-8">
        {results.map((p) => {
          const st = statusMap?.[p.user_id];
          const isBanned = !!st?.is_banned;
          const isMuted = !!st?.is_muted;
          return (
            <div key={p.user_id} className="bg-card border border-border rounded-lg p-3 flex items-center gap-3">
              <button onClick={() => navigate(`/profile/${p.user_id}`)} className="flex items-center gap-3 flex-1 min-w-0 text-left">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0" style={{ backgroundColor: p.avatar_color || '#3B82F6', color: 'white' }}>
                  {(p.display_name || p.username || 'U')[0]?.toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate flex items-center gap-1.5">
                    {p.display_name || p.username}
                    {isBanned && <span className="text-[9px] px-1.5 py-0.5 rounded bg-destructive/15 text-destructive font-bold">BANNED</span>}
                    {isMuted && <span className="text-[9px] px-1.5 py-0.5 rounded bg-yellow-500/15 text-yellow-600 dark:text-yellow-400 font-bold">MUTED</span>}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">@{p.username}</p>
                </div>
              </button>
              {isAdmin && (
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    title="Warn"
                    disabled={busy === `${p.user_id}:warn`}
                    onClick={() => performAction(p.user_id, 'warn', 'Warning')}
                    className="p-2 rounded-md text-yellow-600 hover:bg-yellow-500/10 transition-all active:scale-90 disabled:opacity-50"
                  >
                    <AlertTriangle className="h-4 w-4" />
                  </button>
                  {isMuted ? (
                    <button title="Unmute" disabled={busy === `${p.user_id}:unmute`} onClick={() => performAction(p.user_id, 'unmute', 'Unmute')}
                      className="p-2 rounded-md text-foreground hover:bg-accent transition-all active:scale-90 disabled:opacity-50">
                      <Volume2 className="h-4 w-4" />
                    </button>
                  ) : (
                    <button title="Mute" disabled={busy === `${p.user_id}:mute`} onClick={() => performAction(p.user_id, 'mute', 'Mute')}
                      className="p-2 rounded-md text-muted-foreground hover:bg-accent transition-all active:scale-90 disabled:opacity-50">
                      <VolumeX className="h-4 w-4" />
                    </button>
                  )}
                  {isBanned ? (
                    <button title="Unban" disabled={busy === `${p.user_id}:unban`} onClick={() => performAction(p.user_id, 'unban', 'Unban')}
                      className="p-2 rounded-md text-foreground hover:bg-accent transition-all active:scale-90 disabled:opacity-50">
                      <ShieldCheck className="h-4 w-4" />
                    </button>
                  ) : (
                    <button title="Ban" disabled={busy === `${p.user_id}:ban`} onClick={() => performAction(p.user_id, 'ban', 'Ban')}
                      className="p-2 rounded-md text-destructive hover:bg-destructive/10 transition-all active:scale-90 disabled:opacity-50">
                      <Ban className="h-4 w-4" />
                    </button>
                  )}
                  <button title="Delete account (coming soon)" disabled className="p-2 rounded-md text-destructive opacity-40 cursor-not-allowed">
                    <UserX className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
        {q.trim() && results.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">No users found.</p>
        )}
        {!q.trim() && (
          <p className="text-sm text-muted-foreground text-center py-8">Type to search users.</p>
        )}
      </div>

      {/* Recent Actions */}
      <div className="border-t border-border pt-6">
        <div className="flex items-center gap-2 mb-3">
          <History className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold text-foreground">Recent moderation actions</h2>
        </div>
        {!recent || recent.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">No actions yet.</p>
        ) : (
          <div className="space-y-1.5">
            {recent.map((a: any) => (
              <div key={a.id} className="text-xs text-muted-foreground bg-card border border-border rounded-md px-3 py-2 flex items-center justify-between gap-2">
                <span className="truncate">
                  <span className={`font-semibold uppercase mr-2 ${
                    a.action === 'ban' ? 'text-destructive' :
                    a.action === 'mute' ? 'text-yellow-600' :
                    a.action === 'warn' ? 'text-yellow-600' :
                    'text-primary'
                  }`}>{a.action}</span>
                  <button className="text-foreground hover:underline" onClick={() => navigate(`/profile/${a.target_user_id}`)}>
                    user {a.target_user_id.slice(0, 8)}
                  </button>
                  {a.reason && <span className="ml-2 italic">— {a.reason}</span>}
                </span>
                <span className="shrink-0">{new Date(a.created_at).toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
