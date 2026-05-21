import { Sparkles, MessageSquarePlus, BarChart3 } from 'lucide-react';
import { useUserRoles } from '@/hooks/useUserRole';
import { Navigate } from 'react-router-dom';

export default function CreatorStudio() {
  const { isCreator, isLoading } = useUserRoles();
  if (isLoading) return <div className="p-6 text-muted-foreground">Loading...</div>;
  if (!isCreator) return <Navigate to="/home" replace />;

  const cards = [
    { icon: MessageSquarePlus, title: 'Create Post', desc: 'Share content with your audience.' },
    { icon: BarChart3, title: 'Analytics', desc: 'See engagement on your posts.' },
  ];

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Sparkles className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Creator Studio</h1>
          <p className="text-muted-foreground text-sm">Create posts and grow your audience.</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {cards.map((c) => (
          <div key={c.title} className="bg-card border border-border rounded-xl p-5 hover:border-primary/30 transition-colors">
            <div className="flex items-center gap-3 mb-2">
              <c.icon className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-foreground">{c.title}</h3>
            </div>
            <p className="text-sm text-muted-foreground">{c.desc}</p>
            <p className="text-xs text-muted-foreground mt-3 italic">Coming soon</p>
          </div>
        ))}
      </div>
    </div>
  );
}
