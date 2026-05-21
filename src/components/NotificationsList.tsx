import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { X, UserPlus } from 'lucide-react';

interface Props {
  items: any[];
  onAction: () => void;
  onAccept: (n: any) => void;
  onIgnore: (n: any) => void;
  onDismiss: (id: string) => void;
}

export default function NotificationsList({ items, onAction, onAccept, onIgnore, onDismiss }: Props) {
  const navigate = useNavigate();
  if (!items || items.length === 0) {
    return <div className="p-6 text-sm text-muted-foreground text-center">No notifications yet.</div>;
  }
  return (
    <div className="p-2 max-h-[400px] overflow-y-auto">
      {items.map((n) => (
        <div key={n.id} className={`flex items-start gap-3 p-2 rounded-lg group ${n.is_read ? '' : 'bg-primary/5'} ${n.link ? 'cursor-pointer' : ''}`} onClick={() => n.link && n.type !== 'friend_request' && (navigate(n.link), onAction())}>
          <div className={`w-2.5 h-2.5 rounded-full mt-2 shrink-0 ${n.is_read ? 'bg-muted-foreground/30' : 'bg-primary animate-pulse'}`} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground">{n.title}</p>
            {n.body && <p className="text-xs text-muted-foreground mt-0.5">{n.body}</p>}
            <p className="text-[10px] text-muted-foreground mt-1">{new Date(n.created_at).toLocaleString()}</p>
            {n.type === 'friend_request' && (
              <div className="flex gap-2 mt-2">
                <Button size="sm" className="h-7 text-xs" onClick={(e) => { e.stopPropagation(); onAccept(n); }}>
                  <UserPlus className="h-3 w-3 mr-1" /> Add Friend
                </Button>
                <Button size="sm" variant="outline" className="h-7 text-xs" onClick={(e) => { e.stopPropagation(); onIgnore(n); }}>Ignore</Button>
                {n.link && (
                  <Button size="sm" variant="outline" className="h-7 text-xs" onClick={(e) => { e.stopPropagation(); navigate(n.link); onAction(); }}>
                    View Profile
                  </Button>
                )}
              </div>
            )}
            {n.link && n.type !== 'friend_request' && (
              <button className="text-xs text-primary hover:underline mt-1" onClick={(e) => { e.stopPropagation(); navigate(n.link); onAction(); }}>
                View
              </button>
            )}
          </div>
          <button onClick={(e) => { e.stopPropagation(); onDismiss(n.id); }} className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-accent">
            <X className="h-3 w-3 text-muted-foreground" />
          </button>
        </div>
      ))}
    </div>
  );
}