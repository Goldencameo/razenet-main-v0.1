import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import {
  MessageSquare,
  Copy,
  Trash2,
  SmilePlus,
  MoreHorizontal
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface MessageItemProps {
  message: any;
  sender: any;
  isOwn: boolean;
  showAvatar: boolean;
  showUsername: boolean;
  isConsecutive: boolean;
  isFirstInChain: boolean;
  isLastInChain: boolean;
  onReply: (message: any) => void;
  onDelete: (messageId: string) => void;
  onReact: (messageId: string, emoji: string) => void;
}

// Emoji detection regex
const EMOJI_REGEX = /^[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F900}-\u{1F9FF}]|[\u{1FA70}-\u{1FAFF}]/u;

const QUICK_REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '👎'];

function MessageAvatar({ sender, showAvatar }: { sender: any; showAvatar: boolean }) {
  if (!showAvatar) return <div className="w-8 h-8 shrink-0" />;
  
  return (
    <div
      className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 shadow-sm"
      style={{ backgroundColor: sender?.avatar_color || '#3B82F6', color: 'white' }}
    >
      {(sender?.display_name?.[0] || sender?.username?.[0] || '?').toUpperCase()}
    </div>
  );
}

function MessageContent({ content }: { content: string }) {
  const navigate = useNavigate();

  // Check if message is only emojis (1-3 emojis)
  const trimmedContent = content.trim();
  const emojiMatches = trimmedContent.match(EMOJI_REGEX);
  const isOnlyEmojis = emojiMatches && emojiMatches.length === trimmedContent.length && emojiMatches.length <= 3;

  if (isOnlyEmojis) {
    return (
      <div className="text-4xl py-2">
        {trimmedContent}
      </div>
    );
  }

  // Parse @mentions and make them clickable
  const parseContent = (text: string) => {
    // Use a simpler approach - replace @mentions with clickable spans
    const mentionRegex = /@([a-zA-Z0-9_-]+)/g;
    const parts: (string | JSX.Element)[] = [];
    let lastIndex = 0;
    let match;

    while ((match = mentionRegex.exec(text)) !== null) {
      // Add text before the mention
      if (match.index > lastIndex) {
        parts.push(text.slice(lastIndex, match.index));
      }
      // Add the clickable mention
      const username = match[1];
      parts.push(
        <span
          key={`mention-${match.index}`}
          className="text-primary hover:underline cursor-pointer font-medium"
          onClick={() => {
            navigate(`/profile/${username}`);
          }}
        >
          @{username}
        </span>
      );
      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }

    return parts;
  };

  return (
    <div className="text-sm whitespace-pre-wrap break-words">
      {parseContent(trimmedContent)}
    </div>
  );
}

function MessageReactions({ message, onReact }: { message: any; onReact: (messageId: string, emoji: string) => void }) {
  const reactions = message.reactions || [];
  
  if (reactions.length === 0) return null;
  
  return (
    <div className="flex flex-wrap gap-1 mt-2">
      {reactions.map((reaction: any, idx: number) => (
        <button
          key={idx}
          onClick={() => onReact(message.id, reaction.emoji)}
          className="flex items-center gap-1 px-2 py-1 bg-muted hover:bg-muted/80 rounded-full text-xs transition-colors"
        >
          <span>{reaction.emoji}</span>
          <span className="text-muted-foreground">{reaction.count}</span>
        </button>
      ))}
    </div>
  );
}

export default function MessageItem({ 
  message, 
  sender, 
  isOwn, 
  showAvatar, 
  showUsername, 
  isConsecutive,
  isFirstInChain,
  isLastInChain,
  onReply, 
  onDelete, 
  onReact 
}: MessageItemProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  
  const messageTime = new Date(message.created_at);
  const formattedTime = messageTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const formattedDate = formatDistanceToNow(messageTime, { addSuffix: true });
  
  const handleReact = (messageId: string, emoji: string) => {
    onReact(messageId, emoji);
  };
  
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenuPosition({ x: e.clientX, y: e.clientY });
    setShowContextMenu(true);
  };
  
  const handleMiddleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenuPosition({ x: e.clientX, y: e.clientY });
    setShowContextMenu(true);
  };
  
  // Close context menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = () => setShowContextMenu(false);
    if (showContextMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showContextMenu]);
  
  return (
    <div className="flex gap-2 items-start">
      <div className="w-10 shrink-0">
        {showAvatar && <MessageAvatar sender={sender} showAvatar={showAvatar} />}
      </div>
      
      <div className="flex flex-col max-w-[70%]">
        {showUsername && (
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-xs font-semibold text-foreground">
              {sender?.display_name || sender?.username || 'User'}
            </span>
            <span className="text-xs text-muted-foreground">
              {formattedTime}
            </span>
          </div>
        )}
        
        <div 
          className="relative group/message"
          onContextMenu={handleContextMenu}
          onMouseDown={(e) => {
            if (e.button === 1) { // Middle mouse button
              handleMiddleClick(e);
            }
          }}
        >
          <div 
            className={`px-3.5 py-2 ${
              isOwn 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-card border border-border'
            } ${
              isFirstInChain ? 'rounded-tl-2xl rounded-tr-2xl rounded-br-2xl' :
              isLastInChain ? 'rounded-tl-sm rounded-tr-2xl rounded-br-2xl' :
              'rounded-tl-md rounded-tr-2xl rounded-br-2xl'
            } transition-colors`}
          >
            <div className="flex items-end justify-between gap-2">
              <div className="flex-1">
                <MessageContent content={message.content} />
              </div>
              <span className={`text-xs shrink-0 ${
                isOwn ? 'text-primary-foreground/80' : 'text-muted-foreground'
              }`}>
                {formattedTime}
              </span>
            </div>
            <MessageReactions message={message} onReact={handleReact} />
          </div>
        </div>
      </div>
      
      {/* Context Menu */}
      {showContextMenu && (
        <div 
          className="fixed bg-popover border border-border rounded-lg shadow-lg p-1 z-50 min-w-[180px]"
          style={{ 
            left: `${contextMenuPosition.x}px`, 
            top: `${contextMenuPosition.y}px`,
            transform: 'translate(-50%, -100%)'
          }}
        >
          <button
            onClick={() => {
              setShowReactions(!showReactions);
              setShowContextMenu(false);
            }}
            className="w-full flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-accent rounded transition-colors"
          >
            <SmilePlus className="h-4 w-4" />
            React
          </button>
          <button
            onClick={() => {
              onReply(message);
              setShowContextMenu(false);
            }}
            className="w-full flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-accent rounded transition-colors"
          >
            <MessageSquare className="h-4 w-4" />
            Reply
          </button>
          <button
            onClick={() => {
              navigator.clipboard.writeText(message.content);
              setShowContextMenu(false);
            }}
            className="w-full flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-accent rounded transition-colors"
          >
            <Copy className="h-4 w-4" />
            Copy
          </button>
          {isOwn && (
            <button
              onClick={() => {
                onDelete(message.id);
                setShowContextMenu(false);
              }}
              className="w-full flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-accent rounded transition-colors text-destructive"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
          )}
        </div>
      )}
      
      {/* Reactions Panel */}
      {showReactions && (
        <div 
          className="absolute bg-popover border border-border rounded-lg shadow-lg p-2 z-50"
          style={{ 
            left: `${contextMenuPosition.x}px`, 
            top: `${contextMenuPosition.y}px`,
            transform: 'translate(-50%, -100%)'
          }}
        >
          <div className="grid grid-cols-6 gap-1">
            {QUICK_REACTIONS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => {
                  onReact(message.id, emoji);
                  setShowReactions(false);
                }}
                className="text-xl p-1 rounded hover:bg-accent transition-colors"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
