import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Settings, LogOut, MessageSquare, X } from 'lucide-react';

interface GameUIProps {
  onLeave: () => void;
}

export default function GameUI({ onLeave }: GameUIProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{ id: string; sender: string; message: string }>>([]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenuOpen(!menuOpen);
      }
      if (e.key === 'Enter' && !e.shiftKey && chatOpen) {
        e.preventDefault();
        if (chatMessage.trim()) {
          setChatMessages(prev => [...prev, {
            id: Date.now().toString(),
            sender: 'You',
            message: chatMessage.trim()
          }]);
          setChatMessage('');
        }
      }
      if (e.key === 'Enter' && !chatOpen) {
        setChatOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [menuOpen, chatOpen, chatMessage]);

  const handleSendMessage = () => {
    if (chatMessage.trim()) {
      setChatMessages(prev => [...prev, {
        id: Date.now().toString(),
        sender: 'You',
        message: chatMessage.trim()
      }]);
      setChatMessage('');
    }
  };

  return (
    <>
      {/* ESC Menu */}
      <Dialog open={menuOpen} onOpenChange={setMenuOpen}>
        <DialogContent className="bg-black/90 border-white/20 text-white">
          <DialogHeader>
            <DialogTitle>Game Menu</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Button variant="outline" className="w-full justify-start gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </Button>
            <Button variant="destructive" className="w-full justify-start gap-2" onClick={onLeave}>
              <LogOut className="h-4 w-4" />
              Leave Game
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Chat */}
      {chatOpen && (
        <div className="fixed bottom-4 left-4 w-80 bg-black/80 border border-white/20 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold">Chat</span>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setChatOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="h-48 overflow-y-auto mb-2 space-y-2">
            {chatMessages.map(msg => (
              <div key={msg.id} className="text-sm">
                <span className="font-semibold text-blue-400">{msg.sender}: </span>
                <span>{msg.message}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              placeholder="Type a message..."
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <Button size="icon" onClick={handleSendMessage}>
              <MessageSquare className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Chat toggle button */}
      {!chatOpen && (
        <Button
          variant="outline"
          size="icon"
          className="fixed bottom-4 left-4 bg-black/80 border-white/20 text-white hover:bg-black/90"
          onClick={() => setChatOpen(true)}
        >
          <MessageSquare className="h-4 w-4" />
        </Button>
      )}

      {/* Instructions */}
      <div className="fixed top-4 left-4 bg-black/60 border border-white/20 rounded-lg p-3 text-white text-xs">
        <div className="font-semibold mb-1">Controls:</div>
        <div>WASD / Arrows - Move</div>
        <div>Space - Jump</div>
        <div>Mouse - Rotate Camera</div>
        <div>ESC - Menu</div>
        <div>Enter - Chat</div>
      </div>
    </>
  );
}
