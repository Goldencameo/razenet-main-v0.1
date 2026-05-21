import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Send } from 'lucide-react';

const RECIPIENTS = [
  { value: 'razehub', label: 'RazeHub' },
  { value: 'support', label: 'RazeHub Support' },
  { value: 'community', label: 'Community' },
];
const REASONS = [
  { value: 'suggestion', label: 'Suggestion' },
  { value: 'review', label: 'Review' },
  { value: 'bug', label: 'Bug' },
  { value: 'other', label: 'Other' },
];

export default function Support() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [recipient, setRecipient] = useState('razehub');
  const [reason, setReason] = useState('suggestion');
  const [reasonOther, setReasonOther] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const send = async () => {
    if (!profile) return;
    if (message.trim().length < 5) {
      toast({ title: 'Message too short', description: 'Tell us a little more.', variant: 'destructive' });
      return;
    }
    if (message.length > 4000) {
      toast({ title: 'Message too long', description: 'Please keep it under 4000 characters.', variant: 'destructive' });
      return;
    }
    setSending(true);
    const { error } = await supabase.from('support_messages').insert({
      user_id: profile.user_id,
      recipient,
      reason,
      reason_other: reason === 'other' ? reasonOther.slice(0, 120) : null,
      message: message.trim(),
    });
    setSending(false);
    if (error) {
      toast({ title: 'Could not send', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: 'Message sent', description: 'Thanks for the feedback!' });
    setMessage(''); setReasonOther('');
  };

  return (
    <div className="p-4 sm:p-6">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>
      <h1 className="text-2xl font-bold text-foreground mb-1">Write to us</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Write us about bugs, suggestions, or how to make our app better.
      </p>

      <div className="bg-card border border-border rounded-xl p-5 space-y-4">
        <div>
          <label className="text-sm font-medium text-foreground">Send to</label>
          <Select value={recipient} onValueChange={setRecipient}>
            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              {RECIPIENTS.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm font-medium text-foreground">Reason</label>
          <Select value={reason} onValueChange={setReason}>
            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              {REASONS.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        {reason === 'other' && (
          <div>
            <label className="text-sm font-medium text-foreground">Short summary</label>
            <Input value={reasonOther} maxLength={120} onChange={e => setReasonOther(e.target.value)} className="mt-1" placeholder="Briefly, what's it about?" />
          </div>
        )}
        <div>
          <label className="text-sm font-medium text-foreground">Message</label>
          <Textarea value={message} maxLength={4000} onChange={e => setMessage(e.target.value)} rows={6} className="mt-1 resize-none" placeholder="Type your message..." />
          <p className="text-xs text-muted-foreground mt-1 text-right">{message.length}/4000</p>
        </div>
        <Button onClick={send} disabled={sending || !message.trim()} className="w-full">
          <Send className="h-4 w-4 mr-1.5" /> {sending ? 'Sending...' : 'Send'}
        </Button>
      </div>
    </div>
  );
}