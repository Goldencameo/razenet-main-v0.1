import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useMusic } from '@/contexts/MusicContext';
import { useToast } from '@/hooks/use-toast';
import { useI18n } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft, Music as MusicIcon, Search, Plus, Heart, List, Play,
  Home, Compass, Heart as HeartFilled, Clock, Users, MoreHorizontal
} from 'lucide-react';

// Mock music data
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
    audioUrl: '', // Add your audio file path here, e.g., '/music/cyber-dreams.mp3'
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
    audioUrl: '',
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
    audioUrl: '',
  },
  {
    id: 4,
    title: 'Neon Nights',
    artist: 'Retro Future',
    album: '80s Revival',
    duration: '4:05',
    genre: 'Synthwave',
    cover: 'bg-gradient-to-br from-indigo-600 via-purple-500 to-pink-500',
    featured: true,
    plays: '3.2M',
    audioUrl: '',
  },
  {
    id: 5,
    title: 'Digital Rain',
    artist: 'Matrix Sounds',
    album: 'Code Dreams',
    duration: '3:55',
    genre: 'Electronic',
    cover: 'bg-gradient-to-br from-green-600 via-emerald-500 to-teal-500',
    featured: false,
    plays: '1.1M',
    audioUrl: '',
  },
  {
    id: 6,
    title: 'Starlight',
    artist: 'Celestial Harmony',
    album: 'Galaxy Sounds',
    duration: '4:30',
    genre: 'Ambient',
    cover: 'bg-gradient-to-br from-yellow-500 via-orange-500 to-red-500',
    featured: false,
    plays: '750K',
    audioUrl: '',
  },
  {
    id: 7,
    title: 'Electric Pulse',
    artist: 'Voltage',
    album: 'High Energy',
    duration: '3:15',
    genre: 'Electronic',
    cover: 'bg-gradient-to-br from-pink-600 via-rose-500 to-red-500',
    featured: true,
    plays: '2.1M',
    audioUrl: '',
  },
  {
    id: 8,
    title: 'Cosmic Journey',
    artist: 'Space Cadets',
    album: 'Beyond Stars',
    duration: '5:20',
    genre: 'Ambient',
    cover: 'bg-gradient-to-br from-violet-600 via-purple-500 to-indigo-500',
    featured: false,
    plays: '920K',
    audioUrl: '',
  },
  {
    id: 9,
    title: 'Thunder Strike',
    artist: 'Bass Heavy',
    album: 'Drop Zone',
    duration: '3:42',
    genre: 'Dubstep',
    cover: 'bg-gradient-to-br from-slate-600 via-gray-500 to-zinc-500',
    featured: true,
    plays: '4.5M',
    audioUrl: '',
  },
  {
    id: 10,
    title: 'Ocean Waves',
    artist: 'Chill Vibes',
    album: 'Relaxation',
    duration: '5:15',
    genre: 'Lo-Fi',
    cover: 'bg-gradient-to-br from-cyan-600 via-blue-500 to-indigo-500',
    featured: false,
    plays: '1.5M',
    audioUrl: '',
  },
  {
    id: 11,
    title: 'Fire Dance',
    artist: 'Inferno',
    album: 'Blazing Tracks',
    duration: '3:30',
    genre: 'EDM',
    cover: 'bg-gradient-to-br from-red-600 via-orange-500 to-yellow-500',
    featured: true,
    plays: '3.8M',
    audioUrl: '',
  },
  {
    id: 12,
    title: 'Moonlight Sonata',
    artist: 'Classical Dreams',
    album: 'Timeless',
    duration: '6:45',
    genre: 'Classical',
    cover: 'bg-gradient-to-br from-gray-700 via-slate-600 to-zinc-600',
    featured: false,
    plays: '2.2M',
    audioUrl: '',
  },
  {
    id: 13,
    title: 'Urban Jungle',
    artist: 'Street Beats',
    album: 'City Life',
    duration: '3:55',
    genre: 'Hip-Hop',
    cover: 'bg-gradient-to-br from-amber-600 via-yellow-500 to-lime-500',
    featured: true,
    plays: '5.1M',
    audioUrl: '',
  },
  {
    id: 14,
    title: 'Forest Echo',
    artist: 'Nature Sounds',
    album: 'Wilderness',
    duration: '4:20',
    genre: 'Ambient',
    cover: 'bg-gradient-to-br from-emerald-600 via-green-500 to-teal-500',
    featured: false,
    plays: '680K',
    audioUrl: '',
  },
  {
    id: 15,
    title: 'Rock Anthem',
    artist: 'The Rebels',
    album: 'Revolution',
    duration: '4:10',
    genre: 'Rock',
    cover: 'bg-gradient-to-br from-red-700 via-orange-600 to-amber-600',
    featured: true,
    plays: '6.3M',
    audioUrl: '',
  },
  {
    id: 16,
    title: 'Jazz Cafe',
    artist: 'Smooth Trio',
    album: 'Evening Sessions',
    duration: '5:30',
    genre: 'Jazz',
    cover: 'bg-gradient-to-br from-yellow-600 via-amber-500 to-orange-500',
    featured: false,
    plays: '1.3M',
    audioUrl: '',
  },
  // ADD YOUR 3 WORKING TRACKS HERE:
  // Track 1: Relaxing but moving (middle speed)
  {
    id: 100,
    title: 'Gentle Flow',
    artist: 'RazeHub',
    album: 'Relaxation Collection',
    duration: '4:30',
    genre: 'Ambient',
    cover: 'bg-gradient-to-br from-teal-600 via-cyan-500 to-blue-500',
    featured: true,
    plays: '100K',
    audioUrl: '/music/gentle-flow.mp3', // Replace with your actual file
  },
  // Track 2: Disco-like but relaxing (middle speed)
  {
    id: 101,
    title: 'Groovy Sunset',
    artist: 'RazeHub',
    album: 'Chill Disco',
    duration: '3:45',
    genre: 'Lo-Fi',
    cover: 'bg-gradient-to-br from-purple-600 via-pink-500 to-rose-500',
    featured: true,
    plays: '85K',
    audioUrl: '/music/groovy-sunset.mp3', // Replace with your actual file
  },
  // Track 3: Speedy
  {
    id: 102,
    title: 'Turbo Rush',
    artist: 'RazeHub',
    album: 'High Energy',
    duration: '2:50',
    genre: 'EDM',
    cover: 'bg-gradient-to-br from-red-600 via-orange-500 to-yellow-500',
    featured: true,
    plays: '120K',
    audioUrl: '/music/turbo-rush.mp3', // Replace with your actual file
  },
];

const GENRES = ['Electronic', 'Synthwave', 'Ambient', 'Dubstep', 'Lo-Fi', 'EDM', 'Classical', 'Hip-Hop', 'Rock', 'Jazz'];

// Mock friends playlists
const MOCK_FRIENDS_PLAYLISTS = [
  {
    id: 1,
    name: 'Chill Vibes',
    owner: 'Alex',
    ownerAvatar: '#FF6B6B',
    songCount: 12,
    cover: 'bg-gradient-to-br from-blue-500 to-purple-600',
  },
  {
    id: 2,
    name: 'Workout Mix',
    owner: 'Jordan',
    ownerAvatar: '#4ECDC4',
    songCount: 8,
    cover: 'bg-gradient-to-br from-red-500 to-orange-500',
  },
];

export default function Music() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { toast } = useToast();
  const { t } = useI18n();
  const {
    currentSong,
    isPlaying,
    favorites,
    setCurrentSong,
    setIsPlaying,
    toggleFavorite,
  } = useMusic();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSection, setSelectedSection] = useState('home');
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [customPlaylists, setCustomPlaylists] = useState<Array<{ id: string; name: string; songs: number[]; createdAt: string }>>(() => {
    const saved = localStorage.getItem('music-playlists');
    return saved ? JSON.parse(saved) : [];
  });
  const [createPlaylistOpen, setCreatePlaylistOpen] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [selectedPlaylist, setSelectedPlaylist] = useState<any>(null);
  const [addToPlaylistOpen, setAddToPlaylistOpen] = useState(false);
  const [songToAdd, setSongToAdd] = useState<any>(null);

  // Filter music based on search and genre
  const filteredMusic = MOCK_MUSIC.filter(music =>
    music.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    music.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
    music.genre.toLowerCase().includes(searchQuery.toLowerCase())
  ).filter(music => !selectedGenre || music.genre === selectedGenre);

  const favoriteSongs = MOCK_MUSIC.filter(music => favorites.includes(music.id));

  // Top charts (sorted by plays)
  const topCharts = [...MOCK_MUSIC].sort((a, b) => {
    const playsA = parseFloat(a.plays) || 0;
    const playsB = parseFloat(b.plays) || 0;
    return playsB - playsA;
  }).slice(0, 10);

  // New releases (featured songs)
  const newReleases = MOCK_MUSIC.filter(m => m.featured);

  const toggleFavoriteLocal = (musicId: number) => {
    toggleFavorite(musicId);
    toast({
      title: favorites.includes(musicId) ? t('music.removedFromFavorites') : t('music.addedToFavorites'),
      description: favorites.includes(musicId)
        ? t('music.songRemovedFromFavorites')
        : t('music.songAddedToFavorites'),
    });
  };

  const createPlaylist = () => {
    if (!newPlaylistName.trim()) {
      toast({ title: t('music.error'), description: t('music.enterPlaylistName'), variant: 'destructive' });
      return;
    }

    const newPlaylist = {
      id: Date.now().toString(),
      name: newPlaylistName,
      songs: [],
      createdAt: new Date().toISOString(),
    };

    setCustomPlaylists([...customPlaylists, newPlaylist]);
    setNewPlaylistName('');
    setCreatePlaylistOpen(false);
    toast({ title: t('music.playlistCreated'), description: `"${newPlaylistName}" has been created` });
  };

  const deletePlaylist = (playlistId: string) => {
    setCustomPlaylists(customPlaylists.filter(p => p.id !== playlistId));
    toast({ title: t('music.playlistDeleted'), description: t('music.playlistDeletedDesc') });
  };

  const addToPlaylist = (playlistId: string) => {
    if (!songToAdd) return;

    const updatedPlaylists = customPlaylists.map(playlist => {
      if (playlist.id === playlistId && !playlist.songs.includes(songToAdd.id)) {
        return { ...playlist, songs: [...playlist.songs, songToAdd.id] };
      }
      return playlist;
    });

    setCustomPlaylists(updatedPlaylists);
    localStorage.setItem('music-playlists', JSON.stringify(updatedPlaylists));
    setAddToPlaylistOpen(false);
    setSongToAdd(null);
    toast({ title: t('music.addedToPlaylist'), description: t('music.addedToPlaylistDesc') });
  };

  const removeFromPlaylist = (playlistId: string, songId: number) => {
    const updatedPlaylists = customPlaylists.map(playlist => {
      if (playlist.id === playlistId) {
        return { ...playlist, songs: playlist.songs.filter(id => id !== songId) };
      }
      return playlist;
    });

    setCustomPlaylists(updatedPlaylists);
    localStorage.setItem('music-playlists', JSON.stringify(updatedPlaylists));
    toast({ title: t('music.removedFromPlaylist'), description: t('music.removedFromPlaylistDesc') });
  };

  const openPlaylist = (playlist: any) => {
    setSelectedPlaylist(playlist);
    setSelectedSection('playlist');
  };

  const getPlaylistSongs = (playlist: any) => {
    return MOCK_MUSIC.filter(music => playlist.songs.includes(music.id));
  };

  const playSong = (song: any) => {
    setCurrentSong(song);
    setIsPlaying(true);
  };

  const renderContent = () => {
    switch (selectedSection) {
      case 'home':
        return (
          <div className="space-y-8">
            {/* Genre Filter */}
            <section>
              <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
                <button
                  onClick={() => setSelectedGenre(null)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    selectedGenre === null
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {t('music.all')}
                </button>
                {GENRES.map(genre => (
                  <button
                    key={genre}
                    onClick={() => setSelectedGenre(genre)}
                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                      selectedGenre === genre
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    {genre}
                  </button>
                ))}
              </div>
            </section>

            {/* Featured Section */}
            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3 sm:mb-4">{t('music.featured')}</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
                {newReleases.map(music => (
                  <div
                    key={music.id}
                    className="group cursor-pointer"
                    onClick={() => playSong(music)}
                  >
                    <div className={`aspect-square rounded-lg ${music.cover} mb-2 sm:mb-3 relative overflow-hidden shadow-lg group-hover:shadow-xl transition-all`}>
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Play className="h-10 w-10 sm:h-12 sm:w-12 text-white fill-white" />
                      </div>
                    </div>
                    <h3 className="font-semibold text-sm sm:text-base text-foreground truncate">{music.title}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground truncate">{music.artist}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Top Charts */}
            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3 sm:mb-4">{t('music.topCharts')}</h2>
              <div className="space-y-2">
                {topCharts.map((music, index) => (
                  <div
                    key={music.id}
                    className="flex items-center gap-3 sm:gap-4 p-2 sm:p-3 rounded-lg hover:bg-accent/50 transition-colors group cursor-pointer"
                    onClick={() => playSong(music)}
                  >
                    <span className="w-6 sm:w-8 text-center font-bold text-sm sm:text-base text-muted-foreground">{index + 1}</span>
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded ${music.cover} flex-shrink-0`} />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm sm:text-base text-foreground truncate">{music.title}</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground truncate">{music.artist}</p>
                    </div>
                    <span className="text-xs sm:text-sm text-muted-foreground hidden sm:block">{music.plays}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Made For you */}
            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3 sm:mb-4">{t('music.madeForYou')}</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
                {MOCK_MUSIC.slice(0, 5).map(music => (
                  <div
                    key={music.id}
                    className="group cursor-pointer"
                    onClick={() => playSong(music)}
                  >
                    <div className={`aspect-square rounded-lg ${music.cover} mb-2 sm:mb-3 relative overflow-hidden shadow-lg group-hover:shadow-xl transition-all`}>
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Play className="h-10 w-10 sm:h-12 sm:w-12 text-white fill-white" />
                      </div>
                    </div>
                    <h3 className="font-semibold text-sm sm:text-base text-foreground truncate">{music.title}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground truncate">{music.artist}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Recently Played */}
            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3 sm:mb-4">{t('music.recentlyPlayed')}</h2>
              <div className="space-y-2">
                {MOCK_MUSIC.slice(0, 6).map(music => (
                  <div
                    key={music.id}
                    className="flex items-center gap-3 sm:gap-4 p-2 sm:p-3 rounded-lg hover:bg-accent/50 transition-colors group cursor-pointer"
                    onClick={() => playSong(music)}
                  >
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded ${music.cover} flex-shrink-0`} />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm sm:text-base text-foreground truncate">{music.title}</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground truncate">{music.artist}</p>
                    </div>
                    <span className="text-xs sm:text-sm text-muted-foreground hidden sm:block">{music.duration}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        );

      case 'search':
        return (
          <div className="space-y-4 sm:space-y-6">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">{t('music.searchResults')}</h2>
            {filteredMusic.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No results found for "{searchQuery}"
              </div>
            ) : (
              <div className="space-y-2">
                {filteredMusic.map(music => (
                  <div
                    key={music.id}
                    className="flex items-center gap-3 sm:gap-4 p-2 sm:p-3 rounded-lg hover:bg-accent/50 transition-colors group cursor-pointer"
                    onClick={() => playSong(music)}
                  >
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded ${music.cover} flex-shrink-0`} />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm sm:text-base text-foreground truncate">{music.title}</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground truncate">{music.artist} • {music.album}</p>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2">
                      <Badge variant="outline" className="text-xs hidden sm:block">{music.genre}</Badge>
                      <span className="text-xs sm:text-sm text-muted-foreground hidden sm:block">{music.duration}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 sm:h-9 sm:w-9"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(music.id);
                        }}
                      >
                        <Heart className={`h-4 w-4 ${favorites.includes(music.id) ? 'fill-red-500 text-red-500' : ''}`} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 sm:h-9 sm:w-9"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSongToAdd(music);
                          setAddToPlaylistOpen(true);
                        }}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'favorites':
        return (
          <div className="space-y-4 sm:space-y-6">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">{t('music.likedSongs')}</h2>
            {favoriteSongs.length === 0 ? (
              <div className="text-center py-12">
                <HeartFilled className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">{t('music.noFavorites')}</h3>
                <p className="text-sm text-muted-foreground">
                  {t('music.startAddingFavorites')}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {favoriteSongs.map(music => (
                  <div
                    key={music.id}
                    className="flex items-center gap-3 sm:gap-4 p-2 sm:p-3 rounded-lg hover:bg-accent/50 transition-colors group cursor-pointer"
                    onClick={() => playSong(music)}
                  >
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded ${music.cover} flex-shrink-0`} />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm sm:text-base text-foreground truncate">{music.title}</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground truncate">{music.artist} • {music.album}</p>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2">
                      <span className="text-xs sm:text-sm text-muted-foreground hidden sm:block">{music.duration}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 sm:h-9 sm:w-9"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(music.id);
                        }}
                      >
                        <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'playlists':
        return selectedPlaylist ? (
          <div className="space-y-4 sm:space-y-6">
            <Button variant="ghost" onClick={() => setSelectedPlaylist(null)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('music.backToPlaylists')}
            </Button>
            <div className="flex items-center gap-4 sm:gap-6">
              <div className="w-32 h-32 sm:w-48 sm:h-48 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-2xl">
                <List className="h-12 w-12 sm:h-20 sm:w-20 text-white" />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground uppercase tracking-wider">{t('music.playlist')}</p>
                <h1 className="text-2xl sm:text-4xl font-bold text-foreground mb-2">{selectedPlaylist.name}</h1>
                <p className="text-muted-foreground">{selectedPlaylist.songs.length} {t('music.songs')}</p>
              </div>
            </div>
            <div className="space-y-2">
              {getPlaylistSongs(selectedPlaylist).map((music, index) => (
                <div
                  key={music.id}
                  className="flex items-center gap-3 sm:gap-4 p-2 sm:p-3 rounded-lg hover:bg-accent/50 transition-colors group cursor-pointer"
                  onClick={() => playSong(music)}
                >
                  <span className="w-5 sm:w-6 text-center text-muted-foreground text-sm">{index + 1}</span>
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded ${music.cover} flex-shrink-0`} />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm sm:text-base text-foreground truncate">{music.title}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground truncate">{music.artist}</p>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2">
                    <span className="text-xs sm:text-sm text-muted-foreground hidden sm:block">{music.duration}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 sm:h-9 sm:w-9"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFromPlaylist(selectedPlaylist.id, music.id);
                      }}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {getPlaylistSongs(selectedPlaylist).length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  {t('music.playlistEmpty')}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground">{t('music.yourPlaylists')}</h2>
              <Button onClick={() => setCreatePlaylistOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                {t('music.createPlaylist')}
              </Button>
            </div>
            {customPlaylists.length === 0 ? (
              <div className="text-center py-12">
                <List className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">{t('music.noPlaylists')}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {t('music.createFirstPlaylist')}
                </p>
                <Button onClick={() => setCreatePlaylistOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  {t('music.createPlaylist')}
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
                {customPlaylists.map(playlist => (
                  <div
                    key={playlist.id}
                    className="group cursor-pointer"
                    onClick={() => openPlaylist(playlist)}
                  >
                    <div className="aspect-square rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 mb-2 sm:mb-3 relative overflow-hidden shadow-lg group-hover:shadow-xl transition-all flex items-center justify-center">
                      <List className="h-12 w-12 sm:h-16 sm:w-16 text-white" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Play className="h-10 w-10 sm:h-12 sm:w-12 text-white fill-white" />
                      </div>
                    </div>
                    <h3 className="font-semibold text-sm sm:text-base text-foreground truncate">{playlist.name}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">{playlist.songs.length} {t('music.songs')}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'friends':
        return (
          <div className="space-y-4 sm:space-y-6">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">{t('music.friendsPlaylists')}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
              {MOCK_FRIENDS_PLAYLISTS.map(playlist => (
                <div key={playlist.id} className="group cursor-pointer">
                  <div className={`aspect-square rounded-lg ${playlist.cover} mb-2 sm:mb-3 relative overflow-hidden shadow-lg group-hover:shadow-xl transition-all flex items-center justify-center`}>
                    <List className="h-12 w-12 sm:h-16 sm:w-16 text-white" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Play className="h-10 w-10 sm:h-12 sm:w-12 text-white fill-white" />
                    </div>
                  </div>
                  <h3 className="font-semibold text-sm sm:text-base text-foreground truncate">{playlist.name}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">By {playlist.owner} • {playlist.songCount} {t('music.songs')}</p>
                </div>
              ))}
            </div>
            <div className="text-center py-8 text-muted-foreground text-xs sm:text-sm">
              {t('music.friendsLimit')}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 bg-black/10 dark:bg-black/40 p-4 flex-col gap-4">
        <div className="flex items-center gap-3 mb-4">
          <MusicIcon className="h-8 w-8 text-primary" />
          <h1 className="text-xl font-bold text-foreground">{t('music.title')}</h1>
        </div>

        <nav className="space-y-2">
          <Button
            variant={selectedSection === 'home' ? 'secondary' : 'ghost'}
            className="w-full justify-start"
            onClick={() => setSelectedSection('home')}
          >
            <Home className="h-5 w-5 mr-3" />
            {t('music.home')}
          </Button>
          <Button
            variant={selectedSection === 'search' ? 'secondary' : 'ghost'}
            className="w-full justify-start"
            onClick={() => setSelectedSection('search')}
          >
            <Search className="h-5 w-5 mr-3" />
            {t('music.search')}
          </Button>
          <Button
            variant={selectedSection === 'favorites' ? 'secondary' : 'ghost'}
            className="w-full justify-start"
            onClick={() => setSelectedSection('favorites')}
          >
            <HeartFilled className="h-5 w-5 mr-3" />
            {t('music.likedSongs')}
          </Button>
        </nav>

        <div className="mt-6">
          <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
            <Users className="h-4 w-4" /> {t('music.friendsPlaylists')}
          </h3>
          <div className="space-y-1">
            {MOCK_FRIENDS_PLAYLISTS.map(playlist => (
              <div key={playlist.id} className="p-2 rounded-lg hover:bg-accent/50 cursor-pointer transition-colors">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded ${playlist.cover} flex-shrink-0`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{playlist.name}</p>
                    <p className="text-xs text-muted-foreground">{playlist.owner}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <Button
            variant="ghost"
            className="w-full justify-start mb-2"
            onClick={() => setCreatePlaylistOpen(true)}
          >
            <Plus className="h-5 w-5 mr-3" />
            {t('music.createPlaylist')}
          </Button>
          <div className="space-y-1">
            {customPlaylists.map(playlist => (
              <Button
                key={playlist.id}
                variant={selectedSection === 'playlist' && selectedPlaylist?.id === playlist.id ? 'secondary' : 'ghost'}
                className="w-full justify-start text-sm"
                onClick={() => openPlaylist(playlist)}
              >
                <List className="h-4 w-4 mr-3" />
                {playlist.name}
              </Button>
            ))}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 pb-20 md:pb-32">
        {/* Search Bar */}
        {selectedSection === 'search' && (
          <div className="mb-4 sm:mb-6">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder={t('music.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        )}

        {renderContent()}
      </main>

      {/* Create Playlist Dialog */}
      <Dialog open={createPlaylistOpen} onOpenChange={setCreatePlaylistOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('music.createPlaylistTitle')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder={t('music.playlistName')}
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
            />
            <Button className="w-full" onClick={createPlaylist}>
              {t('music.create')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add to Playlist Dialog */}
      <Dialog open={addToPlaylistOpen} onOpenChange={setAddToPlaylistOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('music.addedToPlaylist')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            {customPlaylists.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t('music.noPlaylists')}. {t('music.createFirstPlaylist')}</p>
            ) : (
              customPlaylists.map(playlist => (
                <Button
                  key={playlist.id}
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => addToPlaylist(playlist.id)}
                >
                  <List className="h-4 w-4 mr-2" />
                  {playlist.name}
                </Button>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border p-2 flex justify-around items-center z-50">
        <Button
          variant={selectedSection === 'home' ? 'secondary' : 'ghost'}
          className="flex flex-col items-center gap-1 h-auto py-2 px-3"
          onClick={() => setSelectedSection('home')}
        >
          <Home className="h-5 w-5" />
          <span className="text-xs">{t('music.home')}</span>
        </Button>
        <Button
          variant={selectedSection === 'search' ? 'secondary' : 'ghost'}
          className="flex flex-col items-center gap-1 h-auto py-2 px-3"
          onClick={() => setSelectedSection('search')}
        >
          <Search className="h-5 w-5" />
          <span className="text-xs">{t('music.search')}</span>
        </Button>
        <Button
          variant={selectedSection === 'favorites' ? 'secondary' : 'ghost'}
          className="flex flex-col items-center gap-1 h-auto py-2 px-3"
          onClick={() => setSelectedSection('favorites')}
        >
          <HeartFilled className="h-5 w-5" />
          <span className="text-xs">{t('music.likedSongs')}</span>
        </Button>
        <Button
          variant={selectedSection === 'playlists' ? 'secondary' : 'ghost'}
          className="flex flex-col items-center gap-1 h-auto py-2 px-3"
          onClick={() => setSelectedSection('playlists')}
        >
          <List className="h-5 w-5" />
          <span className="text-xs">{t('music.yourPlaylists')}</span>
        </Button>
      </div>
    </div>
  );
}
