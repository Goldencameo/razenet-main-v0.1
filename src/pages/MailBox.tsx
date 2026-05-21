import { useState } from 'react';
import { useI18n } from '@/lib/i18n';
import { useNotifications } from '@/hooks/useNotifications';
import EmptyBubble from '@/components/EmptyBubble';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useFriendship } from '@/hooks/useFriendship';
import { Send, Bell as BellIcon, UserPlus, UserCheck, UserMinus, Calendar, ShoppingBag, Users } from 'lucide-react';

const SECTIONS = [
  { id: 'all', label: 'Everything', icon: BellIcon, types: null as string[] | null },
  { id: 'system', label: 'System messages', icon: BellIcon, types: ['system'] },
  { id: 'friend', label: 'Friend Requests', icon: UserPlus, types: ['friend_request', 'friend_accepted'] },
  { id: 'event', label: 'Event reminders', icon: Calendar, types: ['event_reminder'] },
  { id: 'market', label: 'Marketplace receipts', icon: ShoppingBag, types: ['marketplace_receipt'] },
  { id: 'group', label: 'Group invites', icon: Users, types: ['group_invite'] },
];

export default function MailBox() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { items } = useNotifications();
  const { sendRequest, accept, cancelOrRemove } = useFriendship();
  const [active, setActive] = useState('all');

  const sectionDef = SECTIONS.find(s => s.id === active)!;
  const filtered = sectionDef.types
    ? items.filter((n: any) => sectionDef.types!.includes(n.type))
    : items;

  return (
    <div className="p-4 sm:p-6">
      <div className="flex items-start justify-between gap-3 mb-2 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t('mailbox.title')}</h1>
          <p className="text-muted-foreground">{t('mailbox.subtitle')}</p>
        </div>
        <Button onClick={() => navigate('/support')} variant="outline" size="sm">
          <Send className="h-4 w-4 mr-1.5" /> Write to us
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-6 mt-6">
        <nav className="md:w-[220px] shrink-0 flex md:flex-col gap-1 overflow-x-auto">
          {SECTIONS.map(s => {
            const Icon = s.icon;
            return (
              <button key={s.id} onClick={() => setActive(s.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm whitespace-nowrap transition-colors ${active === s.id ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:bg-accent'}`}>
                <Icon className="h-4 w-4" />{s.label}
              </button>
            );
          })}
        </nav>
        <div className="flex-1">
          {filtered.length === 0 ? (
            <EmptyBubble text="Nothing here yet." />
          ) : (
            <div className="space-y-2">
              {filtered.map((n: any) => (
                <div key={n.id} className={`p-4 rounded-lg border ${n.is_read ? 'bg-card border-border' : 'bg-primary/5 border-primary/20'}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground">{n.title}</p>
                      {n.body && <p className="text-sm text-muted-foreground mt-1">{n.body}</p>}
                      <p className="text-[11px] text-muted-foreground mt-2">{new Date(n.created_at).toLocaleString()}</p>
                      {n.type === 'friend_request' && (
                        <div className="flex gap-2 mt-3">
                          <Button size="sm" className="h-8 text-xs" onClick={() => n.actor_id && accept.mutate(n.actor_id)}>
                            <UserCheck className="h-3 w-3 mr-1" /> Accept
                          </Button>
                          <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => n.actor_id && cancelOrRemove.mutate(n.actor_id)}>
                            <UserMinus className="h-3 w-3 mr-1" /> Ignore
                          </Button>
                          {n.link && (
                            <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => navigate(n.link)}>
                              View Profile
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                    {n.link && n.type !== 'friend_request' && (
                      <Button size="sm" variant="outline" onClick={() => navigate(n.link)}>View</Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
