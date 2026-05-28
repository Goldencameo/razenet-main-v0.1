import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMusic } from '@/contexts/MusicContext';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Play, Pause, SkipBack, SkipForward, Volume2, Shuffle, Repeat, Heart, Heart as HeartFilled, X, MoreHorizontal, X as Close } from 'lucide-react';

// Import the mock music data
const MOCK_MUSIC = [
  {
    id: 1,
    title: 'Cyber Dreams',
    artist: 'Neon Wave',
    album: 'Digital Horizons',
    duration: '3:45',
    genre: 'Electronic',
    cover: 'bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400',
    featured: true,
    plays: '2.5M',
    audioUrl: '/music/gentle-flow.mp3',
  },
  {
    id: 2,
    title: 'Midnight City',
    artist: 'Synth Masters',
    album: 'Night Lights',
    duration: '4:12',
    genre: 'Synthwave',
    cover: 'bg-gradient-to-br from-blue-600 via-cyan-500 to-teal-400',
    featured: true,
    plays: '1.8M',
    audioUrl: '/music/groovy-sunset.mp3',
  },
  {
    id: 3,
    title: 'Solar Flare',
    artist: 'Cosmic Beats',
    album: 'Space Journey',
    duration: '3:28',
    genre: 'Ambient',
    cover: 'bg-gradient-to-br from-orange-600 via-red-500 to-pink-500',
    featured: false,
    plays: '890K',
    audioUrl: '/music/turbo-rush.mp3',
  },
];

export default function GlobalMusicPlayer() {
  const navigate = useNavigate();
  const {
    currentSong,
    isPlaying,
    progress,
    volume,
    isShuffle,
    repeatMode,
    favorites,
    setCurrentSong,
    setIsPlaying,
    setProgress,
    setVolume,
    setIsShuffle,
    setRepeatMode,
    toggleFavorite,
  } = useMusic();

  const [showModal, setShowModal] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };

  const togglePlayPause = () => {
    if (currentSong && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        if (currentSong.audioUrl) {
          audioRef.current.src = currentSong.audioUrl;
          audioRef.current.play().catch(err => console.error('Audio play error:', err));
          setIsPlaying(true);
        }
      }
    }
  };

  const playNext = () => {
    if (!currentSong) return;
    const currentIndex = MOCK_MUSIC.findIndex(m => m.id === currentSong.id);
    let nextIndex;
    if (isShuffle) {
      nextIndex = Math.floor(Math.random() * MOCK_MUSIC.length);
    } else {
      nextIndex = (currentIndex + 1) % MOCK_MUSIC.length;
    }
    const nextSong = MOCK_MUSIC[nextIndex];
    if (nextSong && audioRef.current) {
      audioRef.current.src = nextSong.audioUrl || '';
      audioRef.current.play().catch(err => console.error('Audio play error:', err));
      setIsPlaying(true);
    }
  };

  const playPrevious = () => {
    if (!currentSong) return;
    const currentIndex = MOCK_MUSIC.findIndex(m => m.id === currentSong.id);
    let prevIndex;
    if (isShuffle) {
      prevIndex = Math.floor(Math.random() * MOCK_MUSIC.length);
    } else {
      prevIndex = (currentIndex - 1 + MOCK_MUSIC.length) % MOCK_MUSIC.length;
    }
    const prevSong = MOCK_MUSIC[prevIndex];
    if (prevSong && audioRef.current) {
      audioRef.current.src = prevSong.audioUrl || '';
      audioRef.current.play().catch(err => console.error('Audio play error:', err));
      setIsPlaying(true);
    }
  };

  const toggleShuffle = () => {
    setIsShuffle(!isShuffle);
  };

  const toggleRepeat = () => {
    const modes: ('off' | 'all' | 'one')[] = ['off', 'all', 'one'];
    const currentIndex = modes.indexOf(repeatMode);
    const nextMode = modes[(currentIndex + 1) % modes.length];
    setRepeatMode(nextMode);
  };

  // Load audio when currentSong changes
  useEffect(() => {
    if (currentSong && audioRef.current && currentSong.audioUrl) {
      audioRef.current.src = currentSong.audioUrl;
      if (isPlaying) {
        audioRef.current.play().catch(err => console.error('Audio play error:', err));
      }
    }
  }, [currentSong, isPlaying]);

  // Update progress based on actual audio time
  useEffect(() => {
    if (!audioRef.current || !currentSong) return;

    const handleTimeUpdate = () => {
      if (audioRef.current && currentSong) {
        const duration = audioRef.current.duration;
        const currentTime = audioRef.current.currentTime;
        if (duration > 0) {
          const progressPercent = (currentTime / duration) * 100;
          setProgress([progressPercent]);
        }
      }
    };

    audioRef.current.addEventListener('timeupdate', handleTimeUpdate);

    return () => {
      audioRef.current?.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [currentSong, setProgress]);

  // Handle audio ended
  useEffect(() => {
    if (!audioRef.current) return;

    const handleEnded = () => {
      if (repeatMode === 'one') {
        audioRef.current?.play().catch(err => console.error('Audio play error:', err));
      } else if (repeatMode === 'off') {
        setIsPlaying(false);
      } else {
        playNext();
      }
    };

    audioRef.current.addEventListener('ended', handleEnded);

    return () => {
      audioRef.current?.removeEventListener('ended', handleEnded);
    };
  }, [repeatMode, playNext, setIsPlaying]);

  // Update volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume[0] / 100;
    }
  }, [volume]);

  const closePlayer = () => {
    setCurrentSong(null);
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }
  };

  // Show nothing when no music is playing
  if (!currentSong) {
    return null;
  }

  return (
    <>
      {/* Global Music Player Bar */}
      <div className="bg-background border border-border rounded-lg p-3 cursor-pointer hover:bg-accent/50 transition-colors" onClick={() => setShowModal(true)}>
        <div className="flex items-center gap-3 mb-2">
          <div className={`w-12 h-12 rounded ${currentSong.cover} flex-shrink-0`} />
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-foreground text-sm truncate">{currentSong.title}</h3>
            <p className="text-xs text-muted-foreground truncate">{currentSong.artist}</p>
          </div>
        </div>
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={toggleShuffle}
          >
            <Shuffle className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={playPrevious}>
            <SkipBack className="h-3 w-3" />
          </Button>
          <Button size="icon" className="h-8 w-8 rounded-full transition-all duration-200 hover:scale-110 active:scale-95" onClick={togglePlayPause}>
            {isPlaying ? <Pause className="h-4 w-4 transition-all duration-200" /> : <Play className="h-4 w-4 fill-current transition-all duration-200" />}
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={playNext}>
            <SkipForward className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={toggleRepeat}
          >
            <Repeat className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Music Player Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
            <div className={`w-24 h-24 sm:w-32 sm:h-32 rounded-lg ${currentSong.cover} flex-shrink-0`} />
            <div className="flex-1">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground">{currentSong.title}</h2>
              <p className="text-base sm:text-lg text-muted-foreground">{currentSong.artist}</p>
              <p className="text-sm text-muted-foreground">{currentSong.album}</p>
              <p className="text-sm text-muted-foreground">{currentSong.genre}</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Progress Bar */}
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground w-12 text-right">
                {audioRef.current && audioRef.current.duration ? formatTime(audioRef.current.currentTime) : '0:00'}
              </span>
              <Slider
                value={progress}
                onValueChange={(value) => {
                  setProgress(value);
                  if (audioRef.current && currentSong) {
                    const duration = audioRef.current.duration;
                    if (duration > 0) {
                      audioRef.current.currentTime = (value[0] / 100) * duration;
                    }
                  }
                }}
                max={100}
                step={0.1}
                className="flex-1"
              />
              <span className="text-xs text-muted-foreground w-12">{currentSong.duration}</span>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-3 sm:gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleShuffle}
                className={isShuffle ? 'text-primary' : ''}
              >
                <Shuffle className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={playPrevious}>
                <SkipBack className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
              <Button size="icon" className="h-12 w-12 sm:h-14 sm:w-14 rounded-full transition-all duration-200 hover:scale-110 active:scale-95" onClick={togglePlayPause}>
                {isPlaying ? <Pause className="h-6 w-6 sm:h-7 sm:w-7 transition-all duration-200" /> : <Play className="h-6 w-6 sm:h-7 sm:w-7 fill-current transition-all duration-200" />}
              </Button>
              <Button variant="ghost" size="icon" onClick={playNext}>
                <SkipForward className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleRepeat}
                className={repeatMode !== 'off' ? 'text-primary' : ''}
              >
                <Repeat className="h-4 w-4 sm:h-5 sm:w-5" />
                {repeatMode === 'one' && <span className="absolute text-[10px] font-bold">1</span>}
              </Button>
            </div>

            {/* Volume and Favorite */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 w-32 sm:w-48">
                <Volume2 className="h-4 w-4 text-muted-foreground" />
                <Slider
                  value={volume}
                  onValueChange={setVolume}
                  max={100}
                  step={1}
                  className="flex-1"
                />
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => toggleFavorite(currentSong.id)}
                  className={favorites.includes(currentSong.id) ? 'text-primary' : ''}
                >
                  {favorites.includes(currentSong.id) ? <HeartFilled className="h-4 w-4 sm:h-5 sm:w-5 fill-current" /> : <Heart className="h-4 w-4 sm:h-5 sm:w-5" />}
                </Button>
                <Button variant="ghost" size="icon" onClick={() => { setShowModal(false); navigate('/music'); }}>
                  <MoreHorizontal className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Hidden Audio Element */}
      <audio ref={audioRef} onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} />
    </>
  );
}
