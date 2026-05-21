-- Conversation type
CREATE TYPE public.conversation_type AS ENUM ('dm', 'group');

CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type public.conversation_type NOT NULL,
  name TEXT,
  image_url TEXT,
  host_id UUID,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.conversation_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_read_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  muted BOOLEAN NOT NULL DEFAULT false,
  notifications_enabled BOOLEAN NOT NULL DEFAULT true,
  UNIQUE (conversation_id, user_id)
);

CREATE INDEX idx_conv_members_user ON public.conversation_members(user_id);
CREATE INDEX idx_conv_members_conv ON public.conversation_members(conversation_id);

CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  attachment_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  edited_at TIMESTAMPTZ
);

CREATE INDEX idx_messages_conv_created ON public.messages(conversation_id, created_at DESC);

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Helper to avoid recursive RLS
CREATE OR REPLACE FUNCTION public.is_conv_member(_conv UUID, _user UUID)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.conversation_members WHERE conversation_id = _conv AND user_id = _user)
$$;

CREATE OR REPLACE FUNCTION public.is_conv_host(_conv UUID, _user UUID)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.conversations WHERE id = _conv AND host_id = _user)
$$;

-- conversations policies
CREATE POLICY "Members can view conversations" ON public.conversations
  FOR SELECT TO authenticated USING (public.is_conv_member(id, auth.uid()));
CREATE POLICY "Anyone authed can create conversations" ON public.conversations
  FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());
CREATE POLICY "Host can update conversation" ON public.conversations
  FOR UPDATE TO authenticated USING (host_id = auth.uid() OR (type='dm' AND public.is_conv_member(id, auth.uid())));
CREATE POLICY "Host can delete conversation" ON public.conversations
  FOR DELETE TO authenticated USING (host_id = auth.uid() OR created_by = auth.uid());

-- conversation_members policies
CREATE POLICY "Members can view membership" ON public.conversation_members
  FOR SELECT TO authenticated USING (public.is_conv_member(conversation_id, auth.uid()));
CREATE POLICY "Creator or host can add members" ON public.conversation_members
  FOR INSERT TO authenticated WITH CHECK (
    user_id = auth.uid()
    OR public.is_conv_host(conversation_id, auth.uid())
    OR EXISTS (SELECT 1 FROM public.conversations c WHERE c.id = conversation_id AND c.created_by = auth.uid())
  );
CREATE POLICY "Self or host can remove member" ON public.conversation_members
  FOR DELETE TO authenticated USING (user_id = auth.uid() OR public.is_conv_host(conversation_id, auth.uid()));
CREATE POLICY "Self can update own membership" ON public.conversation_members
  FOR UPDATE TO authenticated USING (user_id = auth.uid());

-- messages policies
CREATE POLICY "Members can view messages" ON public.messages
  FOR SELECT TO authenticated USING (public.is_conv_member(conversation_id, auth.uid()));
CREATE POLICY "Members can send messages" ON public.messages
  FOR INSERT TO authenticated WITH CHECK (sender_id = auth.uid() AND public.is_conv_member(conversation_id, auth.uid()));
CREATE POLICY "Sender can edit own messages" ON public.messages
  FOR UPDATE TO authenticated USING (sender_id = auth.uid());
CREATE POLICY "Sender can delete own messages" ON public.messages
  FOR DELETE TO authenticated USING (sender_id = auth.uid());

-- Touch updated_at on conversations
CREATE TRIGGER trg_conversations_updated
  BEFORE UPDATE ON public.conversations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Realtime
ALTER TABLE public.messages REPLICA IDENTITY FULL;
ALTER TABLE public.conversation_members REPLICA IDENTITY FULL;
ALTER TABLE public.conversations REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversation_members;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;