import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { 
  ArrowLeft, Music as MusicIcon, Search, Plus, Heart, List, Play, Pause, 
  MoreVertical, Trash2, Edit, Users, Star
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
    cover: 'bg-gradient-to-br from-purple-500 to-pink-600',
    featured: true,
  },
  {
    id: 2,
    title: 'Midnight City',
    artist: 'Synth Masters',
    album: 'Night Lights',
    duration: '4:12',
    genre: 'Synthwave',
    cover: 'bg-gradient-to-br from-blue-500 to-cyan-600',
    featured: true,
  },
  {
    id: 3,
    title: 'Solar Flare',
    artist: 'Cosmic Beats',
    album: 'Space Journey',
    duration: '3:28',
    genre: 'Ambient',
    cover: 'bg-gradient-to-br from-orange-500 to-red-600',
    featured: false,
  },
  {
    id: 4,
    title: 'Neon Nights',
    artist: 'Retro Future',
    album: '80s Revival',
    duration: '4:05',
    genre: 'Synthwave',
    cover: 'bg-gradient-to-br from-indigo-500 to-purple-600',
    featured: true,
  },
  {
    id: 5,
    title: 'Digital Rain',
    artist: 'Matrix Sounds',
    album: 'Code Dreams',
    duration: '3:55',
    genre: 'Electronic',
    cover: 'bg-gradient-to-br from-green-500 to-teal-600',
    featured: false,
  },
  {
    id: 6,
    title: 'Starlight',
    artist: 'Celestial Harmony',
    album: 'Galaxy Sounds',
    duration: '4:30',
    genre: 'Ambient',
    cover: 'bg-gradient-to-br from-yellow-500 to-orange-600',
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
    cover: 'bg-gradient-to-br from-blue-400 to-purple-500',
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
  const [selectedTab, setSelectedTab] = useState('discover');
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
    setSelectedTab('playlist');
  };

  const getPlaylistSongs = (playlist: any) => {
    return MOCK_MUSIC.filter(music => playlist.songs.includes(music.id));
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <MusicIcon className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Music</h1>
          </div>
          <Button onClick={() => setCreatePlaylistOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Playlist
          </Button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
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

        {/* Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="discover">Discover</TabsTrigger>
            <TabsTrigger value="favorites">Favorites</TabsTrigger>
            <TabsTrigger value="playlists">My Playlists</TabsTrigger>
            <TabsTrigger value="friends">Friends</TabsTrigger>
          </TabsList>

          {/* Discover Tab */}
          <TabsContent value="discover" className="mt-6">
            <div className="space-y-6">
              {/* Featured */}
              <div>
                <h2 className="text-xl font-semibold mb-4">Featured</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {MOCK_MUSIC.filter(m => m.featured).map(music => (
                    <Card key={music.id} className="overflow-hidden hover:border-primary/50 transition-colors">
                      <div className={`h-32 ${music.cover} relative`}>
                        <Button
                          variant="secondary"
                          size="icon"
                          className="absolute bottom-2 right-2 rounded-full"
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                      </div>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">{music.title}</CardTitle>
                        <CardDescription>{music.artist}</CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex items-center justify-between">
                          <Badge variant="outline">{music.genre}</Badge>
                          <span className="text-sm text-muted-foreground">{music.duration}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* All Music */}
              <div>
                <h2 className="text-xl font-semibold mb-4">All Music</h2>
                <div className="space-y-2">
                  {filteredMusic.map(music => (
                    <Card key={music.id} className="flex items-center gap-4 p-4 hover:bg-accent/50 transition-colors">
                      <div className={`w-16 h-16 rounded ${music.cover} flex-shrink-0`} />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground truncate">{music.title}</h3>
                        <p className="text-sm text-muted-foreground">{music.artist} • {music.album}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{music.genre}</Badge>
                        <span className="text-sm text-muted-foreground">{music.duration}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleFavorite(music.id)}
                        >
                          <Heart className={`h-4 w-4 ${favorites.includes(music.id) ? 'fill-red-500 text-red-500' : ''}`} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSongToAdd(music);
                            setAddToPlaylistOpen(true);
                          }}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Play className="h-4 w-4" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Favorites Tab */}
          <TabsContent value="favorites" className="mt-6">
            {favoriteSongs.length === 0 ? (
              <div className="text-center py-12">
                <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No favorites yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Start adding music to your favorites
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {favoriteSongs.map(music => (
                  <Card key={music.id} className="flex items-center gap-4 p-4 hover:bg-accent/50 transition-colors">
                    <div className={`w-16 h-16 rounded ${music.cover} flex-shrink-0`} />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground truncate">{music.title}</h3>
                      <p className="text-sm text-muted-foreground">{music.artist} • {music.album}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">{music.duration}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleFavorite(music.id)}
                      >
                        <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Play className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* My Playlists Tab */}
          <TabsContent value="playlists" className="mt-6">
            {selectedPlaylist ? (
              <div className="space-y-4">
                <Button variant="ghost" onClick={() => setSelectedPlaylist(null)}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Playlists
                </Button>
                <div className="flex items-center gap-4">
                  <div className="w-32 h-32 rounded bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                    <List className="h-12 w-12 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">{selectedPlaylist.name}</h2>
                    <p className="text-muted-foreground">{selectedPlaylist.songs.length} songs</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {getPlaylistSongs(selectedPlaylist).map(music => (
                    <Card key={music.id} className="flex items-center gap-4 p-4 hover:bg-accent/50 transition-colors">
                      <div className={`w-16 h-16 rounded ${music.cover} flex-shrink-0`} />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground truncate">{music.title}</h3>
                        <p className="text-sm text-muted-foreground">{music.artist} • {music.album}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">{music.duration}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFromPlaylist(selectedPlaylist.id, music.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Play className="h-4 w-4" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                  {getPlaylistSongs(selectedPlaylist).length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      This playlist is empty
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
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
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {customPlaylists.map(playlist => (
                      <Card 
                        key={playlist.id} 
                        className="cursor-pointer hover:border-primary/50 transition-colors"
                        onClick={() => openPlaylist(playlist)}
                      >
                        <div className="h-32 bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                          <List className="h-12 w-12 text-white" />
                        </div>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">{playlist.name}</CardTitle>
                          <CardDescription>{playlist.songs.length} songs</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">
                              Created {new Date(playlist.createdAt).toLocaleDateString()}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                deletePlaylist(playlist.id);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          {/* Friends Tab */}
          <TabsContent value="friends" className="mt-6">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Friends' Playlists</h2>
              {MOCK_FRIENDS_PLAYLISTS.map(playlist => (
                <Card key={playlist.id} className="flex items-center gap-4 p-4 hover:bg-accent/50 transition-colors">
                  <div className={`w-16 h-16 rounded ${playlist.cover} flex-shrink-0`} />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground truncate">{playlist.name}</h3>
                    <p className="text-sm text-muted-foreground">By {playlist.owner} • {playlist.songCount} songs</p>
                  </div>
                  <Button variant="ghost" size="icon">
                    <Play className="h-4 w-4" />
                  </Button>
                </Card>
              ))}
              <div className="text-center py-8 text-muted-foreground text-sm">
                Friends can create up to 1 playlist each
              </div>
            </div>
          </TabsContent>
        </Tabs>

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
    </div>
  );
}
