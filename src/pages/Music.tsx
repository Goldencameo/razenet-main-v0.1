import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import { 
  ArrowLeft, Music as MusicIcon, Search, Plus, Heart, List, Play, Pause, 
  SkipBack, SkipForward, Volume2, Home, Compass, Heart as HeartFilled,
  Clock, MoreHorizontal, Shuffle, Repeat
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
  },
];

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

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSection, setSelectedSection] = useState('home');
  const [favorites, setFavorites] = useState<number[]>(() => {
    const saved = localStorage.getItem('music-favorites');
    return saved ? JSON.parse(saved) : [];
  });
  const [customPlaylists, setCustomPlaylists] = useState<Array<{ id: string; name: string; songs: number[]; createdAt: string }>>(() => {
    const saved = localStorage.getItem('music-playlists');
    return saved ? JSON.parse(saved) : [];
  });
  const [createPlaylistOpen, setCreatePlaylistOpen] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [selectedPlaylist, setSelectedPlaylist] = useState<any>(null);
  const [addToPlaylistOpen, setAddToPlaylistOpen] = useState(false);
  const [songToAdd, setSongToAdd] = useState<any>(null);
  
  // Player state
  const [currentSong, setCurrentSong] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState([30]);
  const [volume, setVolume] = useState([70]);

  // Filter music based on search
  const filteredMusic = MOCK_MUSIC.filter(music =>
    music.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    music.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
    music.genre.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const favoriteSongs = MOCK_MUSIC.filter(music => favorites.includes(music.id));

  const toggleFavorite = (musicId: number) => {
    const newFavorites = favorites.includes(musicId)
      ? favorites.filter(id => id !== musicId)
      : [...favorites, musicId];
    setFavorites(newFavorites);
    localStorage.setItem('music-favorites', JSON.stringify(newFavorites));
    toast({
      title: favorites.includes(musicId) ? 'Removed from Favorites' : 'Added to Favorites',
      description: favorites.includes(musicId) 
        ? 'Song removed from your favorites' 
        : 'Song added to your favorites',
    });
  };

  const createPlaylist = () => {
    if (!newPlaylistName.trim()) {
      toast({ title: 'Error', description: 'Please enter a playlist name', variant: 'destructive' });
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
    toast({ title: 'Playlist Created', description: `"${newPlaylistName}" has been created` });
  };

  const deletePlaylist = (playlistId: string) => {
    setCustomPlaylists(customPlaylists.filter(p => p.id !== playlistId));
    toast({ title: 'Playlist Deleted', description: 'Playlist has been removed' });
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
    toast({ title: 'Added to Playlist', description: 'Song has been added to the playlist' });
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
    toast({ title: 'Removed from Playlist', description: 'Song has been removed from the playlist' });
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
            {/* Featured Section */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">Featured</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {MOCK_MUSIC.filter(m => m.featured).map(music => (
                  <div 
                    key={music.id} 
                    className="group cursor-pointer"
                    onClick={() => playSong(music)}
                  >
                    <div className={`aspect-square rounded-lg ${music.cover} mb-3 relative overflow-hidden shadow-lg group-hover:shadow-xl transition-all`}>
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Play className="h-12 w-12 text-white fill-white" />
                      </div>
                    </div>
                    <h3 className="font-semibold text-foreground truncate">{music.title}</h3>
                    <p className="text-sm text-muted-foreground truncate">{music.artist}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Made For You */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">Made For You</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {MOCK_MUSIC.slice(0, 5).map(music => (
                  <div 
                    key={music.id} 
                    className="group cursor-pointer"
                    onClick={() => playSong(music)}
                  >
                    <div className={`aspect-square rounded-lg ${music.cover} mb-3 relative overflow-hidden shadow-lg group-hover:shadow-xl transition-all`}>
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Play className="h-12 w-12 text-white fill-white" />
                      </div>
                    </div>
                    <h3 className="font-semibold text-foreground truncate">{music.title}</h3>
                    <p className="text-sm text-muted-foreground truncate">{music.artist}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Recently Played */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">Recently Played</h2>
              <div className="space-y-2">
                {MOCK_MUSIC.slice(0, 6).map(music => (
                  <div 
                    key={music.id}
                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-accent/50 transition-colors group cursor-pointer"
                    onClick={() => playSong(music)}
                  >
                    <div className={`w-12 h-12 rounded ${music.cover} flex-shrink-0`} />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-foreground truncate">{music.title}</h3>
                      <p className="text-sm text-muted-foreground truncate">{music.artist}</p>
                    </div>
                    <span className="text-sm text-muted-foreground">{music.duration}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        );

      case 'search':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-foreground">Search Results</h2>
            {filteredMusic.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No results found for "{searchQuery}"
              </div>
            ) : (
              <div className="space-y-2">
                {filteredMusic.map(music => (
                  <div 
                    key={music.id}
                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-accent/50 transition-colors group cursor-pointer"
                    onClick={() => playSong(music)}
                  >
                    <div className={`w-12 h-12 rounded ${music.cover} flex-shrink-0`} />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-foreground truncate">{music.title}</h3>
                      <p className="text-sm text-muted-foreground truncate">{music.artist} • {music.album}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{music.genre}</Badge>
                      <span className="text-sm text-muted-foreground">{music.duration}</span>
                      <Button
                        variant="ghost"
                        size="icon"
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
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-foreground">Liked Songs</h2>
            {favoriteSongs.length === 0 ? (
              <div className="text-center py-12">
                <HeartFilled className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No favorites yet</h3>
                <p className="text-sm text-muted-foreground">
                  Start adding music to your favorites
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {favoriteSongs.map(music => (
                  <div 
                    key={music.id}
                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-accent/50 transition-colors group cursor-pointer"
                    onClick={() => playSong(music)}
                  >
                    <div className={`w-12 h-12 rounded ${music.cover} flex-shrink-0`} />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-foreground truncate">{music.title}</h3>
                      <p className="text-sm text-muted-foreground truncate">{music.artist} • {music.album}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">{music.duration}</span>
                      <Button
                        variant="ghost"
                        size="icon"
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
          <div className="space-y-6">
            <Button variant="ghost" onClick={() => setSelectedPlaylist(null)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Playlists
            </Button>
            <div className="flex items-center gap-6">
              <div className="w-48 h-48 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-2xl">
                <List className="h-20 w-20 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground uppercase tracking-wider">Playlist</p>
                <h1 className="text-4xl font-bold text-foreground mb-2">{selectedPlaylist.name}</h1>
                <p className="text-muted-foreground">{selectedPlaylist.songs.length} songs</p>
              </div>
            </div>
            <div className="space-y-2">
              {getPlaylistSongs(selectedPlaylist).map((music, index) => (
                <div 
                  key={music.id}
                  className="flex items-center gap-4 p-3 rounded-lg hover:bg-accent/50 transition-colors group cursor-pointer"
                  onClick={() => playSong(music)}
                >
                  <span className="w-6 text-center text-muted-foreground">{index + 1}</span>
                  <div className={`w-12 h-12 rounded ${music.cover} flex-shrink-0`} />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-foreground truncate">{music.title}</h3>
                    <p className="text-sm text-muted-foreground truncate">{music.artist}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">{music.duration}</span>
                    <Button
                      variant="ghost"
                      size="icon"
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
                  This playlist is empty
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-foreground">Your Playlists</h2>
              <Button onClick={() => setCreatePlaylistOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Playlist
              </Button>
            </div>
            {customPlaylists.length === 0 ? (
              <div className="text-center py-12">
                <List className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No playlists yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Create your first playlist to organize your music
                </p>
                <Button onClick={() => setCreatePlaylistOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Playlist
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {customPlaylists.map(playlist => (
                  <div 
                    key={playlist.id} 
                    className="group cursor-pointer"
                    onClick={() => openPlaylist(playlist)}
                  >
                    <div className="aspect-square rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 mb-3 relative overflow-hidden shadow-lg group-hover:shadow-xl transition-all flex items-center justify-center">
                      <List className="h-16 w-16 text-white" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Play className="h-12 w-12 text-white fill-white" />
                      </div>
                    </div>
                    <h3 className="font-semibold text-foreground truncate">{playlist.name}</h3>
                    <p className="text-sm text-muted-foreground">{playlist.songs.length} songs</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'friends':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-foreground">Friends' Playlists</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {MOCK_FRIENDS_PLAYLISTS.map(playlist => (
                <div key={playlist.id} className="group cursor-pointer">
                  <div className={`aspect-square rounded-lg ${playlist.cover} mb-3 relative overflow-hidden shadow-lg group-hover:shadow-xl transition-all flex items-center justify-center`}>
                    <List className="h-16 w-16 text-white" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Play className="h-12 w-12 text-white fill-white" />
                    </div>
                  </div>
                  <h3 className="font-semibold text-foreground truncate">{playlist.name}</h3>
                  <p className="text-sm text-muted-foreground">By {playlist.owner} • {playlist.songCount} songs</p>
                </div>
              ))}
            </div>
            <div className="text-center py-8 text-muted-foreground text-sm">
              Friends can create up to 1 playlist each
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
      <aside className="w-64 bg-black/10 dark:bg-black/40 p-4 flex flex-col gap-4">
        <div className="flex items-center gap-3 mb-4">
          <MusicIcon className="h-8 w-8 text-primary" />
          <h1 className="text-xl font-bold text-foreground">Music</h1>
        </div>

        <nav className="space-y-2">
          <Button
            variant={selectedSection === 'home' ? 'secondary' : 'ghost'}
            className="w-full justify-start"
            onClick={() => setSelectedSection('home')}
          >
            <Home className="h-5 w-5 mr-3" />
            Home
          </Button>
          <Button
            variant={selectedSection === 'search' ? 'secondary' : 'ghost'}
            className="w-full justify-start"
            onClick={() => setSelectedSection('search')}
          >
            <Search className="h-5 w-5 mr-3" />
            Search
          </Button>
          <Button
            variant={selectedSection === 'favorites' ? 'secondary' : 'ghost'}
            className="w-full justify-start"
            onClick={() => setSelectedSection('favorites')}
          >
            <HeartFilled className="h-5 w-5 mr-3" />
            Liked Songs
          </Button>
        </nav>

        <div className="mt-6">
          <Button
            variant="ghost"
            className="w-full justify-start mb-2"
            onClick={() => setCreatePlaylistOpen(true)}
          >
            <Plus className="h-5 w-5 mr-3" />
            Create Playlist
          </Button>
          <div className="space-y-1">
            {customPlaylists.map(playlist => (
              <Button
                key={playlist.id}
                variant={selectedSection === 'playlists' && selectedPlaylist?.id === playlist.id ? 'secondary' : 'ghost'}
                className="w-full justify-start text-sm"
                onClick={() => openPlaylist(playlist)}
              >
                <List className="h-4 w-4 mr-3" />
                {playlist.name}
              </Button>
            ))}
          </div>
        </div>

        <div className="mt-auto">
          <Button
            variant={selectedSection === 'friends' ? 'secondary' : 'ghost'}
            className="w-full justify-start"
            onClick={() => setSelectedSection('friends')}
          >
            <Users className="h-5 w-5 mr-3" />
            Friends' Playlists
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6 pb-32">
        {/* Search Bar */}
        {selectedSection === 'search' && (
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search music, artists, genres..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        )}

        {renderContent()}
      </main>

      {/* Player Bar */}
      {currentSong && (
        <div className="fixed bottom-0 left-0 right-0 h-20 bg-background border-t border-border px-4 flex items-center gap-4 z-50">
          <div className={`w-14 h-14 rounded ${currentSong.cover} flex-shrink-0`} />
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-foreground truncate">{currentSong.title}</h3>
            <p className="text-sm text-muted-foreground truncate">{currentSong.artist}</p>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon">
              <Shuffle className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <SkipBack className="h-4 w-4" />
            </Button>
            <Button size="icon" className="h-10 w-10 rounded-full">
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 fill-current" />}
            </Button>
            <Button variant="ghost" size="icon">
              <SkipForward className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <Repeat className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center gap-2 w-48">
            <Volume2 className="h-4 w-4 text-muted-foreground" />
            <Slider
              value={volume}
              onValueChange={setVolume}
              max={100}
              step={1}
              className="flex-1"
            />
          </div>
          <div className="flex items-center gap-2 w-32">
            <span className="text-xs text-muted-foreground">1:23</span>
            <Slider
              value={progress}
              onValueChange={setProgress}
              max={100}
              step={1}
              className="flex-1"
            />
            <span className="text-xs text-muted-foreground">{currentSong.duration}</span>
          </div>
        </div>
      )}

      {/* Create Playlist Dialog */}
      <Dialog open={createPlaylistOpen} onOpenChange={setCreatePlaylistOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Playlist</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Playlist name"
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
            />
            <Button className="w-full" onClick={createPlaylist}>
              Create
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add to Playlist Dialog */}
      <Dialog open={addToPlaylistOpen} onOpenChange={setAddToPlaylistOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add to Playlist</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            {customPlaylists.length === 0 ? (
              <p className="text-sm text-muted-foreground">No playlists yet. Create one first!</p>
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
    </div>
  );
}
