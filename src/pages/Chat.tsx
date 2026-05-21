import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useFriends } from '@/hooks/useFriendship';
import { useI18n } from '@/lib/i18n';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import MessageItem from '@/components/chat/MessageItem';
import { useDocumentTitle } from '@/components/DocumentTitle';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from '@/components/ui/dialog';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger,
} from '@/components/ui/sheet';
import {
  Popover, PopoverContent, PopoverTrigger,
} from '@/components/ui/popover';
import {
  Search, Plus, Send, Smile, Phone, Video, Users, Crown, BarChart3, ArrowLeft,
  Image as ImageIcon, Camera, Settings as SettingsIcon, LogOut, Bell, BellOff, Gamepad2, Reply,
  EyeOff, LogOut as LeaveIcon,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useActivity } from '@/components/AppLayout';

// Track DM creation in progress to prevent spam clicks
const dmCreationInProgress = new Set<string>();

const QUICK_EMOJIS = ['😀','😂','😍','🥲','🔥','👍','❤️','🎮','🎉','😎','🙏','💯'];

function avatarFor(name: string, color: string) {
  return (
    <div
      className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 shadow-sm"
      style={{ backgroundColor: color, color: 'white' }}
    >
      {(name?.[0] || '?').toUpperCase()}
    </div>
  );
}

function ComingSoonBtn({ icon: Icon, label }: { icon: any; label: string }) {
  const { toast } = useToast();
  const { t } = useI18n();
  return (
    <button
      onClick={() => toast({ title: label, description: t('chat.comingSoon') })}
      className="p-2 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
      title={`${label} — ${t('chat.comingSoon')}`}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}

export default function Chat() {
  const { profile } = useAuth();
  const { t } = useI18n();
  const { toast } = useToast();
  const qc = useQueryClient();
  const { data: friends } = useFriends();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Check for discussion parameters from game page
  const discussionId = searchParams.get('discussion');
  const discussionTitle = searchParams.get('title');

  const [activeId, setActiveId] = useState<string | null>(() => {
    // Load from localStorage on mount
    const saved = typeof window !== 'undefined' ? localStorage.getItem(`activeChatId_${profile?.user_id}`) : null;
    return saved;
  });
  const [search, setSearch] = useState('');
  const [createGroupOpen, setCreateGroupOpen] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupMembers, setGroupMembers] = useState<string[]>([]);
  const [mobileShowChat, setMobileShowChat] = useState(false);
  const [draft, setDraft] = useState('');
  const [editingConvId, setEditingConvId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; convId: string } | null>(null);
  const [hiddenChats, setHiddenChats] = useState<Set<string>>(() => {
    if (typeof window === 'undefined') return new Set();
    const stored = localStorage.getItem('hidden_chats');
    return stored ? new Set(JSON.parse(stored)) : new Set();
  });

  // Save to localStorage when activeId changes
  useEffect(() => {
    if (activeId && profile) {
      localStorage.setItem(`activeChatId_${profile.user_id}`, activeId);
    }
  }, [activeId, profile?.user_id]);

  // Save hidden chats to localStorage
  useEffect(() => {
    localStorage.setItem('hidden_chats', JSON.stringify(Array.from(hiddenChats)));
  }, [hiddenChats]);

  // Check if conversation is with a friend (DM)
  const isFriendChat = (conv: any) => {
    if (conv.type !== 'dm') return false;
    const otherMember = conv.members?.find((m: any) => m.user_id !== profile?.user_id);
    if (!otherMember) return false;
    return friends?.some((f: any) => f.friend_id === otherMember.user_id);
  };

  // Hide chat
  const hideChat = (convId: string) => {
    setHiddenChats(prev => new Set([...prev, convId]));
    setContextMenu(null);
    if (activeId === convId) setActiveId(null);
  };

  // Leave chat
  const leaveChat = async (convId: string) => {
    if (!profile) return;
    try {
      await supabase.from('conversation_members').delete().eq('conversation_id', convId).eq('user_id', profile.user_id);
      qc.invalidateQueries({ queryKey: ['conversations', profile.user_id] });
      if (activeId === convId) setActiveId(null);
      toast({ title: 'Left Chat', description: 'You have left this conversation' });
    } catch (error) {
      console.error('Error leaving chat:', error);
      toast({ title: 'Error', description: 'Could not leave chat', variant: 'destructive' });
    }
    setContextMenu(null);
  };

  // Handle right-click on conversation
  const handleContextMenu = (e: React.MouseEvent, convId: string) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, convId });
  };

  // Close context menu
  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  const selectConversation = useCallback((id: string | null) => {
    setActiveId(id);
    if (id) setMobileShowChat(true);
  }, []);

  const goBackToList = useCallback(() => {
    setMobileShowChat(false);
  }, []);

  // Fetch last message per conversation
  const { data: conversations } = useQuery({
    queryKey: ['conversations', profile?.user_id],
    enabled: !!profile,
    queryFn: async () => {
      const { data: memberships } = await supabase
        .from('conversation_members')
        .select('conversation_id, last_read_at, muted, notifications_enabled')
        .eq('user_id', profile!.user_id);
      if (!memberships?.length) return [];
      const ids = memberships.map((m: any) => m.conversation_id);
      const { data: convs } = await supabase
        .from('conversations')
        .select('*')
        .in('id', ids)
        .order('updated_at', { ascending: false });
      const { data: allMembers } = await supabase
        .from('conversation_members')
        .select('conversation_id, user_id')
        .in('conversation_id', ids);
      // Look up profiles for all member ids
      const userIds = Array.from(new Set((allMembers || []).map((m: any) => m.user_id)));
      const { data: profs } = userIds.length ? await supabase
        .from('profiles')
        .select('user_id, username, display_name, avatar_color, status, last_seen_at')
        .in('user_id', userIds) : { data: [] as any[] };
      const profMap: Record<string, any> = {};
      (profs as any[] || []).forEach((p) => {
        // Determine actual online status based on last_seen_at
        const isActuallyOnline = p.last_seen_at && new Date(p.last_seen_at) > new Date(Date.now() - 5 * 60 * 1000);
        let mappedStatus = 'offline';
        if (isActuallyOnline && p.status === 'online') {
          mappedStatus = 'online';
        }
        profMap[p.user_id] = { ...p, status: mappedStatus };
      });
      const memMap: Record<string, any[]> = {};
      (allMembers || []).forEach((m: any) => {
        memMap[m.conversation_id] = memMap[m.conversation_id] || [];
        memMap[m.conversation_id].push({ ...m, profile: profMap[m.user_id] });
      });
      // Fetch last message for each conversation
      const lastMsgPromises = ids.map(async (cid: string) => {
        const { data } = await supabase
          .from('messages')
          .select('content, sender_id, created_at')
          .eq('conversation_id', cid)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        return { cid, msg: data };
      });
      const lastMsgs = await Promise.all(lastMsgPromises);
      const lastMsgMap: Record<string, any> = {};
      lastMsgs.forEach(({ cid, msg }) => { if (msg) lastMsgMap[cid] = msg; });

      return (convs || []).map((c: any) => ({
        ...c,
        members: memMap[c.id] || [],
        my_membership: memberships.find((m: any) => m.conversation_id === c.id),
        last_message: lastMsgMap[c.id] || null,
      }));
    },
  });

  // Handle ?dm=userId from URL (e.g. from profile page) and discussion parameters
  useEffect(() => {
    const dmUserId = searchParams.get('dm');
    if (dmUserId && profile && conversations !== undefined) {
      openDmWithFriend(dmUserId);
      setSearchParams({}, { replace: true });
    }
    
    // Handle discussion from game page
    if (discussionId && discussionTitle && profile) {
      createDiscussionChat(discussionId, discussionTitle);
      setSearchParams({}, { replace: true });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, profile, conversations, selectConversation, discussionId, discussionTitle]);

  const activeConv = useMemo(
    () => conversations?.find((c: any) => c.id === activeId) || null,
    [conversations, activeId],
  );

  // Set document title to show who the chat is with
  const chatTitle = useMemo(() => {
    if (!activeConv) return 'RazeHub - Chat';
    if (activeConv.type === 'dm') {
      const otherMember = activeConv.members?.find((m: any) => m.user_id !== profile?.user_id);
      const displayName = otherMember?.profile?.display_name || otherMember?.profile?.username || 'Chat';
      return `RazeHub - ${displayName}`;
    }
    return `RazeHub - ${activeConv.name || 'Chat'}`;
  }, [activeConv, profile]);

  useDocumentTitle(chatTitle);

  const { data: messages } = useQuery({
    queryKey: ['messages', activeId],
    enabled: !!activeId,
    queryFn: async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', activeId!)
        .order('created_at', { ascending: true });
      return data || [];
    },
  });

  // Realtime: listen for new messages in active conv
  useEffect(() => {
    if (!activeId) return;
    const channel = supabase
      .channel(`messages-${activeId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${activeId}` },
        (payload) => {
          qc.invalidateQueries({ queryKey: ['messages', activeId] });
          qc.invalidateQueries({ queryKey: ['conversations', profile?.user_id] });
        },
      )
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'messages', filter: `conversation_id=eq.${activeId}` },
        () => qc.invalidateQueries({ queryKey: ['messages', activeId] }),
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [activeId, qc, profile?.user_id]);

  // Realtime: invalidate conversations on any new convo or membership change
  useEffect(() => {
    if (!profile) return;
    const channel = supabase
      .channel(`my-convs-${profile.user_id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'conversation_members', filter: `user_id=eq.${profile.user_id}` },
        () => qc.invalidateQueries({ queryKey: ['conversations', profile.user_id] }))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'conversations' },
        () => qc.invalidateQueries({ queryKey: ['conversations', profile.user_id] }))
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          // Check if this message is in any of the user's conversations
          const msgConvId = payload.new.conversation_id;
          conversations?.forEach((conv: any) => {
            if (conv.id === msgConvId) {
              qc.invalidateQueries({ queryKey: ['conversations', profile.user_id] });
              if (activeId === msgConvId) {
                qc.invalidateQueries({ queryKey: ['messages', activeId] });
              }
            }
          });
        })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [profile, qc, conversations, activeId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages?.length, activeId]);

  // Start or open DM with friend
  const openDmWithFriend = async (friendUserId: string) => {
    if (!profile) return;
    // Prevent duplicate creation from spam clicks
    const key = `${profile.user_id}:${friendUserId}`;
    if (dmCreationInProgress.has(key)) return;
    // find existing dm where both are members
    const existing = conversations?.find((c: any) =>
      c.type === 'dm' &&
      c.members.length === 2 &&
      c.members.some((m: any) => m.user_id === friendUserId),
    );
    if (existing) { selectConversation(existing.id); return; }
    dmCreationInProgress.add(key);
    try {
      const { data: conv, error } = await supabase
        .from('conversations')
        .insert({ type: 'dm', created_by: profile.user_id })
        .select('*')
        .single();
      if (error || !conv) { toast({ title: 'Error', description: error?.message, variant: 'destructive' }); return; }
      const { error: memErr } = await supabase.from('conversation_members').insert([
        { conversation_id: conv.id, user_id: profile.user_id },
        { conversation_id: conv.id, user_id: friendUserId },
      ]);
      if (memErr) { toast({ title: 'Error', description: memErr.message, variant: 'destructive' }); return; }
      qc.invalidateQueries({ queryKey: ['conversations', profile.user_id] });
      selectConversation(conv.id);
    } finally {
      dmCreationInProgress.delete(key);
    }
  };

  // Create discussion chat for game announcements
  const createDiscussionChat = async (discussionId: string, discussionTitle: string) => {
    if (!profile) return;
    
    try {
      // Check if discussion already exists
      const existingDiscussion = conversations?.find((c: any) => 
        c.type === 'discussion' && c.game_news_id === discussionId
      );
      
      if (existingDiscussion) {
        selectConversation(existingDiscussion.id);
        return;
      }
      
      // Create new discussion conversation
      const { data: conv, error } = await supabase
        .from('conversations')
        .insert({ 
          type: 'discussion', 
          name: `Discussion: ${discussionTitle}`,
          game_news_id: discussionId,
          created_by: profile.user_id 
        })
        .select('*')
        .single();
      
      if (error || !conv) { 
        toast({ title: 'Error', description: error?.message, variant: 'destructive' }); 
        return; 
      }
      
      // Add current user as member
      const { error: memErr } = await supabase.from('conversation_members').insert({
        conversation_id: conv.id,
        user_id: profile.user_id,
      });
      
      if (memErr) { 
        toast({ title: 'Error', description: memErr.message, variant: 'destructive' }); 
        return; 
      }
      
      qc.invalidateQueries({ queryKey: ['conversations', profile.user_id] });
      selectConversation(conv.id);
      toast({ title: 'Discussion Created', description: `Discussion for "${discussionTitle}" has been created` });
    } catch (error) {
      console.error('Error creating discussion:', error);
      toast({ title: 'Error', description: 'Could not create discussion', variant: 'destructive' });
    }
  };

  const createGroup = async () => {
    if (!profile || !groupName.trim() || groupMembers.length === 0) return;
    const { data: conv, error } = await supabase
      .from('conversations')
      .insert({ type: 'group', name: groupName.trim(), created_by: profile.user_id, host_id: profile.user_id })
      .select('*')
      .single();
    if (error || !conv) { toast({ title: 'Error', description: error?.message, variant: 'destructive' }); return; }
    const rows = [profile.user_id, ...groupMembers].map((uid) => ({ conversation_id: conv.id, user_id: uid }));
    const { error: memErr } = await supabase.from('conversation_members').insert(rows);
    if (memErr) { toast({ title: 'Error', description: memErr.message, variant: 'destructive' }); return; }
    qc.invalidateQueries({ queryKey: ['conversations', profile.user_id] });
    selectConversation(conv.id);
    setCreateGroupOpen(false);
    setGroupName('');
    setGroupMembers([]);
    toast({ title: 'Group created' });
  };

  const sendMessage = async () => {
    if (!profile || !activeId || !draft.trim()) return;
    const content = draft.trim();
    setDraft('');

    // Optimistically update the messages query cache
    qc.setQueryData(['messages', activeId], (old: any) => {
      const newMessage = {
        id: `temp-${Date.now()}`,
        conversation_id: activeId,
        sender_id: profile.user_id,
        content,
        created_at: new Date().toISOString(),
      };
      return [...(old || []), newMessage];
    });

    const { error } = await supabase.from('messages').insert({
      conversation_id: activeId, sender_id: profile.user_id, content,
    });
    if (error) {
      toast({ title: 'Failed to send', description: error.message, variant: 'destructive' });
      // Revert optimistic update on error
      qc.invalidateQueries({ queryKey: ['messages', activeId] });
    }
    // touch conversation updated_at
    await supabase.from('conversations').update({ updated_at: new Date().toISOString() }).eq('id', activeId);
    qc.invalidateQueries({ queryKey: ['conversations', profile.user_id] });
  };

  const leaveConv = async () => {
    if (!profile || !activeConv) return;
    await supabase.from('conversation_members').delete().eq('conversation_id', activeConv.id).eq('user_id', profile.user_id);
    setActiveId(null);
    qc.invalidateQueries({ queryKey: ['conversations', profile.user_id] });
  };

  const transferHost = async (newHostId: string) => {
    if (!profile || !activeConv) return;
    if (activeConv.host_id !== profile.user_id) return;
    await supabase.from('conversations').update({ host_id: newHostId }).eq('id', activeConv.id);
    qc.invalidateQueries({ queryKey: ['conversations', profile.user_id] });
    toast({ title: 'Host changed' });
  };

  const toggleNotifications = async () => {
    if (!profile || !activeConv) return;
    const next = !activeConv.my_membership?.notifications_enabled;
    await supabase.from('conversation_members')
      .update({ notifications_enabled: next })
      .eq('conversation_id', activeConv.id).eq('user_id', profile.user_id);
    qc.invalidateQueries({ queryKey: ['conversations', profile.user_id] });
  };

  // Filter conversations by search
  const filteredConvs = useMemo(() => {
    if (!conversations) return [];
    const visibleConvs = conversations.filter((c: any) => !hiddenChats.has(c.id));
    if (!search) return visibleConvs;
    const q = search.toLowerCase();
    return visibleConvs.filter((c: any) => {
      const d = convDisplay(c);
      return d.name.toLowerCase().includes(q);
    });
  }, [conversations, search, hiddenChats]);

  const friendList = friends || [];

  function convDisplay(c: any) {
    if (c.type === 'group') {
      return { name: c.name || 'Group', sub: `${c.members.length} ${t('chat.members').toLowerCase()}`, color: '#6366F1' };
    }
    const other = c.members.find((m: any) => m.user_id !== profile?.user_id);
    return {
      name: other?.profile?.display_name || other?.profile?.username || 'User',
      sub: other?.profile?.username ? `@${other.profile.username}` : '',
      color: other?.profile?.avatar_color || '#3B82F6',
      status: other?.profile?.status || 'offline'
    };
  }

  return (
    <div className="flex h-full relative">
      {/* Sidebar */}
      <aside className={`w-full md:w-[300px] border-r border-border bg-card flex flex-col shrink-0 ${mobileShowChat ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-3 space-y-2 border-b border-border">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">{t('chat.title')}</h2>
            <Dialog open={createGroupOpen} onOpenChange={setCreateGroupOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="gap-1">
                  <Plus className="h-4 w-4" />{t('chat.newGroup')}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>{t('chat.newGroup')}</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium">{t('chat.groupName')}</label>
                    <Input value={groupName} onChange={(e) => setGroupName(e.target.value)} placeholder="My squad" className="mt-1" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">{t('chat.addMembers')}</label>
                    <div className="mt-1 max-h-60 overflow-y-auto border border-border rounded-md p-1">
                      {friendList.length === 0 && <p className="p-3 text-sm text-muted-foreground">{t('chat.noFriends')}</p>}
                      {friendList.map((f: any) => {
                        const checked = groupMembers.includes(f.user_id);
                        return (
                          <label key={f.user_id} className="flex items-center gap-2 p-2 rounded hover:bg-accent cursor-pointer">
                            <input type="checkbox" checked={checked} onChange={() => {
                              setGroupMembers((curr) => checked ? curr.filter((x) => x !== f.user_id) : [...curr, f.user_id]);
                            }} />
                            {avatarFor(f.display_name || f.username, f.avatar_color)}
                            <div className="text-sm">
                              <div className="font-medium">{f.display_name || f.username}</div>
                              <div className="text-muted-foreground text-xs">@{f.username}</div>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setCreateGroupOpen(false)}>{t('chat.cancel')}</Button>
                  <Button onClick={createGroup} disabled={!groupName.trim() || groupMembers.length === 0}>{t('chat.create')}</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('chat.searchConversations')} className="pl-8 h-9" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Conversations */}
          <div className="px-2 pt-3">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-1">
              {t('chat.directMessages')} & {t('chat.groups')}
            </p>
            {filteredConvs.length === 0 && (
              <p className="px-3 py-4 text-xs text-muted-foreground">{t('chat.noConversations')}</p>
            )}
            {filteredConvs.map((c: any) => {
              const d = convDisplay(c);
              const active = c.id === activeId;
              const lastMsg = c.last_message;
              const isFriend = isFriendChat(c);
              const otherMember = c.type === 'dm' ? c.members?.find((m: any) => m.user_id !== profile?.user_id) : null;
              return (
                <button key={c.id} onClick={() => selectConversation(c.id)} onContextMenu={(e) => handleContextMenu(e, c.id)}
                  className={`w-full text-left flex items-center gap-2.5 px-2 py-2 rounded-lg transition-colors mb-0.5 ${active ? 'bg-primary/10' : 'hover:bg-accent'}`}>
                  <div className="relative">
                    <div 
                      className="cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (otherMember?.user_id) navigate(`/profile/${otherMember.user_id}`);
                      }}
                    >
                      {avatarFor(d.name, d.color)}
                    </div>
                    {c.type === 'dm' && (
                      <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-card ${
                        d.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
                      } transition-colors`} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div 
                      className="text-sm font-medium text-foreground truncate flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (otherMember?.user_id) navigate(`/profile/${otherMember.user_id}`);
                      }}
                    >
                      {d.name}
                      {c.type === 'group' && <Users className="h-3 w-3 text-muted-foreground" />}
                      {isFriend && <Crown className="h-3 w-3 text-yellow-500" />}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {lastMsg ? lastMsg.content : d.sub}
                    </div>
                  </div>
                </button>
              );
            })}

          {/* Context Menu */}
          {contextMenu && (
            <div 
              className="fixed bg-card border border-border rounded-lg shadow-lg py-1 z-50 min-w-[160px]"
              style={{ left: contextMenu.x, top: contextMenu.y }}
              onClick={(e) => e.stopPropagation()}
            >
              {(() => {
                const conv = conversations?.find((c: any) => c.id === contextMenu.convId);
                if (!conv) return null;
                const isFriend = isFriendChat(conv);
                return (
                  <>
                    {!isFriend && (
                      <>
                        <button 
                          onClick={() => hideChat(contextMenu.convId)}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-accent flex items-center gap-2"
                        >
                          <EyeOff className="h-4 w-4" />
                          Hide Chat
                        </button>
                        <button 
                          onClick={() => leaveChat(contextMenu.convId)}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-accent flex items-center gap-2 text-destructive"
                        >
                          <LeaveIcon className="h-4 w-4" />
                          Leave Chat
                        </button>
                      </>
                    )}
                    {isFriend && (
                      <div className="px-3 py-2 text-xs text-muted-foreground">
                        Friend chats cannot be hidden
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          )}
          </div>

          {/* Friends to start chat */}
          <div className="px-2 pt-4 pb-3">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-1">
              {t('chat.friends')}
            </p>
            {friendList.length === 0 && (
              <p className="px-3 py-2 text-xs text-muted-foreground">{t('chat.noFriends')}</p>
            )}
            {friendList.map((f: any) => (
              <button key={f.user_id} onClick={() => { openDmWithFriend(f.user_id); }}
                className="w-full text-left flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-accent transition-colors">
                <div 
                  className="relative cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/profile/${f.user_id}`);
                  }}
                >
                  {avatarFor(f.display_name || f.username, f.avatar_color)}
                  <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-card ${
                    f.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
                  } transition-colors`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div 
                    className="text-sm text-foreground truncate cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/profile/${f.user_id}`);
                    }}
                  >
                    {f.display_name || f.username}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">@{f.username}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* Main pane */}
      <main className={`flex-1 flex flex-col min-w-0 ${!mobileShowChat ? 'hidden md:flex' : 'flex'}`}>
        {!activeConv ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-3">
              <Send className="h-7 w-7 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">{t('chat.selectConversation')}</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">{t('chat.selectHint')}</p>
          </div>
        ) : (
          <ChatRoom
            conv={activeConv}
            messages={messages || []}
            draft={draft}
            setDraft={setDraft}
            sendMessage={sendMessage}
            leaveConv={leaveConv}
            transferHost={transferHost}
            toggleNotifications={toggleNotifications}
            messagesEndRef={messagesEndRef}
            meId={profile?.user_id}
            onBack={goBackToList}
          />
        )}
      </main>
    </div>
  );
}

function ChatRoom({ conv, messages, draft, setDraft, sendMessage, leaveConv, transferHost, toggleNotifications, messagesEndRef, meId, onBack }: any) {
  const { t } = useI18n();
  const { toast } = useToast();
  const { addActiveCall, joinCall, activeCalls } = useActivity();
  const navigate = useNavigate();
  const isGroup = conv.type === 'group';
  const isHost = isGroup && conv.host_id === meId;
  const other = !isGroup ? conv.members.find((m: any) => m.user_id !== meId) : null;
  const headerName = isGroup ? (conv.name || 'Group') : (other?.profile?.display_name || other?.profile?.username || 'User');
  const headerSub = isGroup
    ? `${conv.members.length} ${t('chat.members').toLowerCase()}`
    : (other?.profile?.username ? `@${other.profile.username}` : '');
  const headerColor = isGroup ? '#6366F1' : (other?.profile?.avatar_color || '#3B82F6');
  const [replyingTo, setReplyingTo] = useState<any>(null);
  const [userStatus, setUserStatus] = useState<{ status: string; lastSeen?: string }>({ status: 'offline' });
  const [mentionSuggestions, setMentionSuggestions] = useState<any[]>([]);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionIndex, setMentionIndex] = useState(0);

  const profileMap: Record<string, any> = {};
  conv.members.forEach((m: any) => { profileMap[m.user_id] = m.profile; });

  // Fetch user status for DM
  useEffect(() => {
    if (!isGroup && other?.user_id) {
      const fetchUserStatus = async () => {
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('status, last_seen_at')
            .eq('user_id', other.user_id)
            .single();

          if (profile) {
            const lastSeen = profile.last_seen_at ? new Date(profile.last_seen_at) : new Date();
            // Apply status mapping logic
            const isActuallyOnline = profile.last_seen_at && new Date(profile.last_seen_at) > new Date(Date.now() - 5 * 60 * 1000);
            let mappedStatus = 'offline';
            if (isActuallyOnline && profile.status === 'online') {
              mappedStatus = 'online';
            }
            setUserStatus({
              status: mappedStatus,
              lastSeen: formatDistanceToNow(lastSeen, { addSuffix: true })
            });
          }
        } catch (error) {
          console.error('Error fetching user status:', error);
          setUserStatus({ status: 'offline' });
        }
      };

      fetchUserStatus();

      // Subscribe to status changes
      const channel = supabase
        .channel(`profile_status_${other.user_id}`)
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `user_id=eq.${other.user_id}`
        }, (payload) => {
          const newStatus = payload.new as any;
          if (newStatus.status) {
            const lastSeen = newStatus.last_seen_at ? new Date(newStatus.last_seen_at) : new Date();
            // Apply status mapping logic
            const isActuallyOnline = newStatus.last_seen_at && new Date(newStatus.last_seen_at) > new Date(Date.now() - 5 * 60 * 1000);
            let mappedStatus = 'offline';
            if (isActuallyOnline && newStatus.status === 'online') {
              mappedStatus = 'online';
            }
            setUserStatus({
              status: mappedStatus,
              lastSeen: formatDistanceToNow(lastSeen, { addSuffix: true })
            });
          }
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [isGroup, other?.user_id]);

  const handleReply = (message: any) => {
    setReplyingTo(message);
  };

  const handleDelete = async (messageId: string) => {
    try {
      const { error } = await supabase.from('messages').delete().eq('id', messageId);
      if (error) {
        toast({ title: 'Error', description: 'Failed to delete message', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete message', variant: 'destructive' });
    }
  };

  const handleReact = async (messageId: string, emoji: string) => {
    // This would need to be implemented with a proper reactions system
    console.log('React with emoji:', emoji, 'to message:', messageId);
    toast({ title: 'Reaction', description: 'Reactions coming soon!' });
  };

  const handleJoinCall = () => {
    // Check if there's already an active call for this conversation
    const existingCall = activeCalls.find((c: any) => c.conversationId === conv.id);
    if (existingCall) {
      // User is joining an existing call
      joinCall(existingCall.id, meId);
      toast({ title: 'Joined Call', description: `You joined the call with ${headerName}` });
    } else {
      // User is creating a new call
      const newCall = {
        id: Date.now(),
        conversationId: conv.id,
        name: headerName,
        color: headerColor,
        isGroup: isGroup,
        duration: '0:00',
        participants: [{ userId: meId, joinedAt: Date.now() }],
      };
      addActiveCall(newCall);
      toast({ title: 'Call Started', description: `You started a call with ${headerName}` });
    }
  };

  const handleIgnoreCall = () => {
    toast({ title: 'Call Ignored', description: 'You ignored the call invitation' });
  };

  const isInCall = activeCalls.some((c: any) => 
    c.conversationId === conv.id && 
    c.participants.some((p: any) => p.userId === meId)
  );
  const hasActiveCall = activeCalls.some((c: any) => c.conversationId === conv.id);

  const handleCreatePoll = () => {
    toast({ title: 'Poll', description: 'Poll feature coming soon!' });
  };

  const onKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
    if (e.key === 'ArrowDown' && showMentions) {
      e.preventDefault();
      setMentionIndex((prev) => (prev + 1) % mentionSuggestions.length);
    }
    if (e.key === 'ArrowUp' && showMentions) {
      e.preventDefault();
      setMentionIndex((prev) => (prev - 1 + mentionSuggestions.length) % mentionSuggestions.length);
    }
    if (e.key === 'Escape' && showMentions) {
      e.preventDefault();
      setShowMentions(false);
    }
    if (e.key === 'Tab' && showMentions) {
      e.preventDefault();
      selectMention(mentionSuggestions[mentionIndex]);
    }
    if (e.key === 'Enter' && showMentions) {
      e.preventDefault();
      selectMention(mentionSuggestions[mentionIndex]);
    }
  };

  const handleDraftChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setDraft(value);

    // Detect @ for mentions
    const cursorPosition = e.target.selectionStart;
    const textBeforeCursor = value.slice(0, cursorPosition);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');

    if (lastAtIndex !== -1) {
      const textAfterAt = textBeforeCursor.slice(lastAtIndex + 1);
      const spaceBeforeAt = textBeforeCursor[lastAtIndex - 1] === ' ' || lastAtIndex === 0;

      if (spaceBeforeAt && !textAfterAt.includes(' ')) {
        setMentionQuery(textAfterAt);
        setShowMentions(true);
        setMentionIndex(0);

        // Generate suggestions
        const suggestions: any[] = [];

        // Add @everyone for group chats
        if (isGroup && 'everyone'.startsWith(textAfterAt.toLowerCase())) {
          suggestions.push({ type: 'everyone', display: '@everyone', userId: null });
        }

        // Add conversation members
        conv.members.forEach((m: any) => {
          if (m.user_id !== meId) {
            const p = m.profile;
            const username = p?.username || '';
            const displayName = p?.display_name || '';
            if (username.toLowerCase().startsWith(textAfterAt.toLowerCase()) ||
                displayName.toLowerCase().startsWith(textAfterAt.toLowerCase())) {
              suggestions.push({ type: 'user', display: `@${username}`, userId: m.user_id, profile: p });
            }
          }
        });

        // Add the person you're talking to (for DMs)
        if (!isGroup && other?.profile) {
          const username = other.profile.username || '';
          const displayName = other.profile.display_name || '';
          if (username.toLowerCase().startsWith(textAfterAt.toLowerCase()) ||
              displayName.toLowerCase().startsWith(textAfterAt.toLowerCase())) {
            if (!suggestions.find((s: any) => s.userId === other.user_id)) {
              suggestions.push({ type: 'user', display: `@${username}`, userId: other.user_id, profile: other.profile });
            }
          }
        }

        setMentionSuggestions(suggestions);
      } else {
        setShowMentions(false);
      }
    } else {
      setShowMentions(false);
    }
  };

  const selectMention = (suggestion: any) => {
    const cursorPosition = (document.activeElement as HTMLTextAreaElement)?.selectionStart || draft.length;
    const textBeforeCursor = draft.slice(0, cursorPosition);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');

    if (lastAtIndex !== -1) {
      const beforeMention = draft.slice(0, lastAtIndex);
      const afterCursor = draft.slice(cursorPosition);
      const newDraft = beforeMention + suggestion.display + ' ' + afterCursor;
      setDraft(newDraft);
      setShowMentions(false);
      setMentionIndex(0);
    }
  };

  return (
    <>
      {/* Header */}
      <header className="h-14 border-b border-border bg-card flex items-center px-4 gap-3 shrink-0">
        <button onClick={onBack} className="md:hidden p-1.5 -ml-1 rounded-md hover:bg-accent text-muted-foreground">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="relative">
          <div 
            className="cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => {
              if (!isGroup && other?.user_id) navigate(`/profile/${other.user_id}`);
            }}
          >
            {avatarFor(headerName, headerColor)}
          </div>
          {!isGroup && (
            <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-card ${
              userStatus.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
            } transition-colors`} />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div 
            className="text-sm font-semibold text-foreground truncate flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => {
              if (!isGroup && other?.user_id) navigate(`/profile/${other.user_id}`);
            }}
          >
            {headerName}
            {isHost && <span title={t('chat.youHost')}><Crown className="h-3.5 w-3.5 text-yellow-500" /></span>}
          </div>
          <div className="text-xs text-muted-foreground truncate">{headerSub}</div>
        </div>
        <div className="flex items-center gap-1">
          {hasActiveCall && !isInCall ? (
            <>
              <button
                onClick={handleJoinCall}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-xs font-medium"
              >
                <Phone className="h-3.5 w-3.5" /> Join Call
              </button>
              <button
                onClick={handleIgnoreCall}
                className="px-3 py-1.5 rounded-md border border-border hover:bg-accent transition-colors text-xs font-medium"
              >
                Ignore
              </button>
            </>
          ) : isInCall ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 text-xs font-medium">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              In Call
            </div>
          ) : (
            <>
              <button
                onClick={handleJoinCall}
                className="p-2 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                title={t('chat.call')}
              >
                <Phone className="h-4 w-4" />
              </button>
              <ComingSoonBtn icon={Video} label={t('chat.call')} />
            </>
          )}
          <button
            onClick={handleCreatePoll}
            className="p-2 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
            title="Make Poll"
          >
            <BarChart3 className="h-4 w-4" />
          </button>
          <Sheet>
            <SheetTrigger asChild>
              <button className="p-2 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors" title={t('chat.groupSettings')}>
                <SettingsIcon className="h-4 w-4" />
              </button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader><SheetTitle>{isGroup ? t('chat.groupSettings') : headerName}</SheetTitle></SheetHeader>
              <div className="mt-6 space-y-5">
                <div className="flex items-center justify-between">
                  <span className="text-sm flex items-center gap-2">
                    {conv.my_membership?.notifications_enabled ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
                    {t('chat.notifications')}
                  </span>
                  <Button size="sm" variant="outline" onClick={toggleNotifications}>
                    {conv.my_membership?.notifications_enabled ? 'On' : 'Off'}
                  </Button>
                </div>

                <div>
                  <p className="text-sm font-semibold mb-2">{t('chat.members')}</p>
                  <div className="space-y-1.5 max-h-72 overflow-y-auto">
                    {conv.members.map((m: any) => {
                      const p = m.profile;
                      const name = p?.display_name || p?.username || 'User';
                      const isThisHost = isGroup && conv.host_id === m.user_id;
                      return (
                        <div key={m.user_id} className="flex items-center gap-2 p-1.5 rounded-md hover:bg-accent">
                          <div 
                            className="relative cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => {
                              if (m.user_id !== meId) navigate(`/profile/${m.user_id}`);
                            }}
                          >
                            {avatarFor(name, p?.avatar_color || '#3B82F6')}
                            <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-card bg-green-500`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div 
                              className="text-sm text-foreground truncate flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity"
                              onClick={() => {
                                if (m.user_id !== meId) navigate(`/profile/${m.user_id}`);
                              }}
                            >
                              {name} {isThisHost && <Crown className="h-3 w-3 text-yellow-500" />}
                            </div>
                            {p?.username && <div className="text-xs text-muted-foreground truncate">@{p.username}</div>}
                          </div>
                          {isHost && m.user_id !== meId && (
                            <Button size="sm" variant="ghost" onClick={() => transferHost(m.user_id)} title={t('chat.changeHost')}>
                              <Crown className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <Button variant="destructive" className="w-full" onClick={leaveConv}>
                  <LogOut className="h-4 w-4 mr-2" /> {isGroup ? t('chat.leaveGroup') : 'Close conversation'}
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-0.5 bg-background">
        {messages.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-8">No messages yet — say hi 👋</p>
        )}
        {messages.map((m: any, idx: number) => {
          const sender = profileMap[m.sender_id];
          const isOwn = m.sender_id === meId;
          const isGroup = conv.type === 'group';
          
          // Check for date separator
          const currentDate = new Date(m.created_at).toDateString();
          const prevDate = idx > 0 ? new Date(messages[idx - 1].created_at).toDateString() : null;
          const showDateSeparator = currentDate !== (prevDate || currentDate);
          
          // Check message position in chain
          const prevMessage = idx > 0 ? messages[idx - 1] : null;
          const nextMessage = idx < messages.length - 1 ? messages[idx + 1] : null;
          
          const isConsecutive = !showDateSeparator && prevMessage && prevMessage.sender_id === m.sender_id;
          const isFirstInChain = !isConsecutive;
          const isLastInChain = !nextMessage || nextMessage.sender_id !== m.sender_id || 
                             new Date(nextMessage.created_at).toDateString() !== currentDate;
          
          // Show avatar and username only on first message of chain
          const showAvatar = isFirstInChain;
          const showUsername = isFirstInChain;
          
          return (
            <React.Fragment key={m.id}>
              {showDateSeparator && (
                <div className="flex items-center justify-center my-4">
                  <div className="bg-muted px-3 py-1 rounded-full">
                    <span className="text-xs text-muted-foreground font-medium">
                      {new Date(m.created_at).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </span>
                  </div>
                </div>
              )}
              <MessageItem
                message={m}
                sender={sender}
                isOwn={isOwn}
                showAvatar={showAvatar}
                showUsername={showUsername && isGroup}
                isConsecutive={isConsecutive}
                isFirstInChain={isFirstInChain}
                isLastInChain={isLastInChain}
                onReply={handleReply}
                onDelete={handleDelete}
                onReact={handleReact}
              />
            </React.Fragment>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Composer */}
      <div className="border-t border-border bg-card p-2 sm:p-3 shrink-0">
        {replyingTo && (
          <div className="mb-2 p-2 bg-muted rounded-lg border border-border">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-muted-foreground">Replying to {profileMap[replyingTo.sender_id]?.display_name || profileMap[replyingTo.sender_id]?.username || 'User'}</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0"
                onClick={() => setReplyingTo(null)}
              >
                ×
              </Button>
            </div>
            <div className="text-xs text-muted-foreground truncate">
              {replyingTo.content}
            </div>
          </div>
        )}
        <div className="flex items-end gap-2">
          <div className="hidden sm:flex items-center gap-0.5 pb-1.5">
            <ComingSoonBtn icon={ImageIcon} label={t('chat.gif')} />
            <ComingSoonBtn icon={Camera} label={t('chat.screenshot')} />
            <button
              onClick={handleCreatePoll}
              className="p-2 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
              title={t('chat.poll')}
            >
              <BarChart3 className="h-4 w-4" />
            </button>
            <Popover>
              <PopoverTrigger asChild>
                <button className="p-2 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors" title={t('chat.emoji')}>
                  <Smile className="h-4 w-4" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-2" align="start">
                <div className="grid grid-cols-6 gap-1">
                  {QUICK_EMOJIS.map((e) => (
                    <button key={e} onClick={() => setDraft((d: string) => d + e)} className="text-xl p-1.5 rounded hover:bg-accent">
                      {e}
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>
          <div className="relative flex-1">
            <Textarea
              value={draft}
              onChange={handleDraftChange}
              onKeyDown={onKey}
              placeholder={t('chat.typing')}
              rows={1}
              className="resize-none min-h-[40px] max-h-32 flex-1"
            />
            {showMentions && mentionSuggestions.length > 0 && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-card border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto z-50">
                {mentionSuggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className={`px-3 py-2 cursor-pointer hover:bg-accent transition-colors ${
                      index === mentionIndex ? 'bg-accent' : ''
                    }`}
                    onClick={() => selectMention(suggestion)}
                  >
                    {suggestion.type === 'everyone' ? (
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">@everyone</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        {avatarFor(suggestion.profile?.display_name || suggestion.profile?.username, suggestion.profile?.avatar_color || '#3B82F6')}
                        <div>
                          <div className="text-sm font-medium">{suggestion.profile?.display_name || suggestion.profile?.username}</div>
                          <div className="text-xs text-muted-foreground">@{suggestion.profile?.username}</div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          <Button onClick={sendMessage} disabled={!draft.trim()} className="h-10">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </>
  );
}