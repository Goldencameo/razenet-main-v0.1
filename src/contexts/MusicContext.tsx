import { createContext, useContext, useState, ReactNode } from 'react';

interface Song {
  id: number;
  title: string;
  artist: string;
  album: string;
  duration: string;
  genre: string;
  cover: string;
  featured: boolean;
  plays: string;
  audioUrl: string;
}

interface MusicContextType {
  currentSong: Song | null;
  isPlaying: boolean;
  progress: number[];
  volume: number[];
  isShuffle: boolean;
  repeatMode: 'off' | 'all' | 'one';
  favorites: number[];
  setCurrentSong: (song: Song | null) => void;
  setIsPlaying: (playing: boolean) => void;
  setProgress: (progress: number[]) => void;
  setVolume: (volume: number[]) => void;
  setIsShuffle: (shuffle: boolean) => void;
  setRepeatMode: (mode: 'off' | 'all' | 'one') => void;
  setFavorites: (favorites: number[]) => void;
  toggleFavorite: (songId: number) => void;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export function MusicProvider({ children }: { children: ReactNode }) {
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState([0]);
  const [volume, setVolume] = useState([70]);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'off' | 'all' | 'one'>('off');
  const [favorites, setFavorites] = useState<number[]>(() => {
    const saved = localStorage.getItem('music-favorites');
    return saved ? JSON.parse(saved) : [];
  });

  const toggleFavorite = (songId: number) => {
    const newFavorites = favorites.includes(songId)
      ? favorites.filter(id => id !== songId)
      : [...favorites, songId];
    setFavorites(newFavorites);
    localStorage.setItem('music-favorites', JSON.stringify(newFavorites));
  };

  return (
    <MusicContext.Provider value={{
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
      setFavorites,
      toggleFavorite,
    }}>
      {children}
    </MusicContext.Provider>
  );
}

export const useMusic = () => {
  const context = useContext(MusicContext);
  if (!context) {
    throw new Error('useMusic must be used within MusicProvider');
  }
  return context;
};
