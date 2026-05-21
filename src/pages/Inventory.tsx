import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { 
  Backpack, ArrowLeft, Search, Filter, Grid, List, 
  Star, Heart, ChevronDown, Palette, Eye, EyeOff,
  Trash2, RefreshCw, ShoppingBag
} from 'lucide-react';

// Mock marketplace items (same as in Marketplace.tsx)
const MOCK_ITEMS = [
  {
    id: 1,
    name: 'Cyber Avatar Skin',
    category: 'avatar-skins',
    subcategory: 'all',
    price: 499,
    currency: 'RZ',
    description: 'A futuristic cyber-themed avatar skin with neon accents and digital aesthetics.',
    image: 'bg-gradient-to-br from-cyan-500 to-blue-600',
    publisher: 'RazeStudio',
    createdAt: '2024-01-15',
    type: 'Avatar Skin',
    equipLocation: 'Avatar Body',
    colors: ['#00D4FF', '#7C3AED', '#10B981'],
    featured: true,
    rating: 4.8,
    reviews: 234,
  },
  {
    id: 2,
    name: 'Golden Crown',
    category: 'accessories',
    subcategory: 'hat',
    price: 299,
    currency: 'RZ',
    description: 'A majestic golden crown accessory for your avatar.',
    image: 'bg-gradient-to-br from-yellow-400 to-amber-600',
    publisher: 'RoyalAssets',
    createdAt: '2024-02-20',
    type: 'Accessory',
    equipLocation: 'Head',
    colors: ['#FFD700', '#C0C0C0', '#CD7F32'],
    featured: true,
    rating: 4.9,
    reviews: 567,
  },
  {
    id: 3,
    name: 'Fire Emote',
    category: 'emotes',
    subcategory: 'all',
    price: 99,
    currency: 'RZ',
    description: 'Express yourself with this animated fire emote.',
    image: 'bg-gradient-to-br from-orange-500 to-red-600',
    publisher: 'EmojiKing',
    createdAt: '2024-03-10',
    type: 'Emote',
    equipLocation: 'Chat',
    colors: ['#FF4500', '#FF6347', '#FF8C00'],
    featured: false,
    rating: 4.5,
    reviews: 123,
  },
  {
    id: 4,
    name: 'Space Profile Background',
    category: 'profile-background',
    subcategory: 'all',
    price: 199,
    currency: 'RZ',
    description: 'A beautiful space-themed background for your profile.',
    image: 'bg-gradient-to-br from-purple-900 to-indigo-900',
    publisher: 'CosmicDesigns',
    createdAt: '2024-01-28',
    type: 'Profile Background',
    equipLocation: 'Profile Background',
    colors: ['#1E1B4B', '#312E81', '#4C1D95'],
    featured: false,
    rating: 4.7,
    reviews: 89,
  },
  {
    id: 5,
    name: 'Neon Wings',
    category: 'accessories',
    subcategory: 'back',
    price: 399,
    currency: 'RZ',
    description: 'Glowing neon wings that make your avatar stand out.',
    image: 'bg-gradient-to-br from-pink-500 to-purple-600',
    publisher: 'NeonStudio',
    createdAt: '2024-02-05',
    type: 'Accessory',
    equipLocation: 'Back',
    colors: ['#EC4899', '#8B5CF6', '#06B6D4'],
    featured: true,
    rating: 4.6,
    reviews: 345,
  },
  {
    id: 6,
    name: 'Wave Emote',
    category: 'emotes',
    subcategory: 'all',
    price: 79,
    currency: 'RZ',
    description: 'A friendly wave emote for greetings.',
    image: 'bg-gradient-to-br from-blue-400 to-cyan-500',
    publisher: 'EmojiKing',
    createdAt: '2024-03-15',
    type: 'Emote',
    equipLocation: 'Chat',
    colors: ['#3B82F6', '#06B6D4', '#10B981'],
    featured: false,
    rating: 4.4,
    reviews: 78,
  },
  {
    id: 7,
    name: 'Nature Profile Background',
    category: 'profile-background',
    subcategory: 'all',
    price: 149,
    currency: 'RZ',
    description: 'A calming nature-themed background.',
    image: 'bg-gradient-to-br from-green-400 to-emerald-600',
    publisher: 'NatureDesigns',
    createdAt: '2024-01-20',
    type: 'Profile Background',
    equipLocation: 'Profile Background',
    colors: ['#22C55E', '#10B981', '#059669'],
    featured: false,
    rating: 4.3,
    reviews: 56,
  },
  {
    id: 8,
    name: 'Dragon Avatar Skin',
    category: 'avatar-skins',
    subcategory: 'all',
    price: 599,
    currency: 'RZ',
    description: 'A powerful dragon-themed avatar skin.',
    image: 'bg-gradient-to-br from-red-600 to-orange-700',
    publisher: 'FantasyAssets',
    createdAt: '2024-02-28',
    type: 'Avatar Skin',
    equipLocation: 'Avatar Body',
    colors: ['#DC2626', '#EA580C', '#F97316'],
    featured: true,
    rating: 4.9,
    reviews: 412,
  },
  {
    id: 9,
    name: 'Classic T-Shirt',
    category: 'clothing',
    subcategory: 't-shirt',
    price: 199,
    currency: 'RZ',
    description: 'A comfortable classic t-shirt for everyday wear.',
    image: 'bg-gradient-to-br from-gray-400 to-gray-600',
    publisher: 'BasicWear',
    createdAt: '2024-01-10',
    type: 'Clothing',
    equipLocation: 'Torso',
    colors: ['#6B7280', '#4B5563', '#374151'],
    featured: false,
    rating: 4.2,
    reviews: 156,
  },
  {
    id: 10,
    name: 'Cool Sunglasses',
    category: 'accessories',
    subcategory: 'face',
    price: 249,
    currency: 'RZ',
    description: 'Stylish sunglasses to protect your avatar\'s eyes.',
    image: 'bg-gradient-to-br from-gray-800 to-black',
    publisher: 'ShadeShop',
    createdAt: '2024-02-15',
    type: 'Accessory',
    equipLocation: 'Face',
    colors: ['#111827', '#1F2937', '#374151'],
    featured: false,
    rating: 4.6,
    reviews: 289,
  },
  {
    id: 11,
    name: 'Mini Profile Card',
    category: 'mini-profile',
    subcategory: 'all',
    price: 349,
    currency: 'RZ',
    description: 'A stylish mini profile card that appears when hovering over your avatar.',
    image: 'bg-gradient-to-br from-indigo-500 to-purple-600',
    publisher: 'ProfileCraft',
    createdAt: '2024-03-01',
    type: 'Mini Profile',
    equipLocation: 'Hover Card',
    colors: ['#6366F1', '#8B5CF6', '#A78BFA'],
    featured: true,
    rating: 4.7,
    reviews: 198,
  },
  {
    id: 12,
    name: 'Spiky Hair',
    category: 'accessories',
    subcategory: 'hair',
    price: 179,
    currency: 'RZ',
    description: 'Cool spiky hair style for your avatar.',
    image: 'bg-gradient-to-br from-blue-600 to-purple-600',
    publisher: 'HairStudio',
    createdAt: '2024-02-25',
    type: 'Accessory',
    equipLocation: 'Head',
    colors: ['#2563EB', '#7C3AED', '#9333EA'],
    featured: false,
    rating: 4.4,
    reviews: 167,
  },
  {
    id: 13,
    name: 'Denim Jeans',
    category: 'clothing',
    subcategory: 'pants',
    price: 299,
    currency: 'RZ',
    description: 'Classic denim jeans that never go out of style.',
    image: 'bg-gradient-to-br from-blue-700 to-blue-900',
    publisher: 'DenimCo',
    createdAt: '2024-01-18',
    type: 'Clothing',
    equipLocation: 'Legs',
    colors: ['#1D4ED8', '#1E3A8A', '#1E40AF'],
    featured: false,
    rating: 4.5,
    reviews: 234,
  },
  {
    id: 14,
    name: 'Smiley Face',
    category: 'faces',
    subcategory: 'all',
    price: 149,
    currency: 'RZ',
    description: 'A cheerful smiley face for your avatar.',
    image: 'bg-gradient-to-br from-yellow-400 to-orange-500',
    publisher: 'FaceFactory',
    createdAt: '2024-02-08',
    type: 'Face',
    equipLocation: 'Face',
    colors: ['#FACC15', '#F97316', '#FB923C'],
    featured: false,
    rating: 4.3,
    reviews: 145,
  },
  {
    id: 15,
    name: 'Leather Jacket',
    category: 'clothing',
    subcategory: 'jackets',
    price: 499,
    currency: 'RZ',
    description: 'A cool leather jacket for that rebellious look.',
    image: 'bg-gradient-to-br from-amber-800 to-amber-900',
    publisher: 'LeatherWorks',
    createdAt: '2024-03-05',
    type: 'Clothing',
    equipLocation: 'Torso',
    colors: ['#92400E', '#78350F', '#451A03'],
    featured: true,
    rating: 4.8,
    reviews: 378,
  },
  {
    id: 16,
    name: 'Sport Shoes',
    category: 'clothing',
    subcategory: 'shoes',
    price: 249,
    currency: 'RZ',
    description: 'Comfortable sport shoes for active avatars.',
    image: 'bg-gradient-to-br from-red-500 to-red-700',
    publisher: 'SportGear',
    createdAt: '2024-02-12',
    type: 'Clothing',
    equipLocation: 'Feet',
    colors: ['#EF4444', '#DC2626', '#B91C1C'],
    featured: false,
    rating: 4.6,
    reviews: 201,
  },
];

// Inventory categories
const INVENTORY_CATEGORIES = [
  { id: 'all', name: 'All Items' },
  { id: 'avatar-skins', name: 'Avatar Skins' },
  { id: 'accessories', name: 'Accessories' },
  { id: 'emotes', name: 'Emotes' },
  { id: 'profile-background', name: 'Profile Backgrounds' },
  { id: 'clothing', name: 'Clothing' },
  { id: 'faces', name: 'Faces' },
  { id: 'mini-profile', name: 'Mini Profiles' },
];

export default function Inventory() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [selectedItem, setSelectedItem] = useState<typeof MOCK_ITEMS[0] | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>('');
  
  // Load inventory from localStorage
  const [inventoryItemIds, setInventoryItemIds] = useState<number[]>(() => {
    const saved = localStorage.getItem('marketplace-inventory');
    return saved ? JSON.parse(saved) : [];
  });
  const [inventoryItems, setInventoryItems] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<number[]>(() => {
    const saved = localStorage.getItem('marketplace-favorites');
    return saved ? JSON.parse(saved) : [];
  });
  const [equippedItems, setEquippedItems] = useState<Record<number, { color: string }>>(() => {
    const saved = localStorage.getItem('marketplace-equipped');
    return saved ? JSON.parse(saved) : {};
  });

  // Load inventory items from IDs
  useEffect(() => {
    const items = inventoryItemIds.map(id => MOCK_ITEMS.find(item => item.id === id)).filter(Boolean);
    setInventoryItems(items);
  }, [inventoryItemIds]);

  // Filter items
  const filteredItems = inventoryItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesFavorites = !showFavoritesOnly || favorites.includes(item.id);
    return matchesSearch && matchesCategory && matchesFavorites;
  }).map(item => ({
    ...item,
    equipped: equippedItems[item.id] !== undefined,
    equippedColor: equippedItems[item.id]?.color || item.colors[0],
    favorite: favorites.includes(item.id),
    acquiredAt: item.createdAt,
  }));

  const toggleFavorite = (itemId: number) => {
    const newFavorites = favorites.includes(itemId)
      ? favorites.filter(id => id !== itemId)
      : [...favorites, itemId];
    setFavorites(newFavorites);
    localStorage.setItem('marketplace-favorites', JSON.stringify(newFavorites));
    toast({
      title: favorites.includes(itemId) ? 'Removed from Favorites' : 'Added to Favorites',
      description: favorites.includes(itemId) 
        ? 'Item removed from your favorites' 
        : 'Item added to your favorites',
    });
  };

  const equipItem = (item: typeof MOCK_ITEMS[0], color: string) => {
    const newEquipped = { ...equippedItems, [item.id]: { color } };
    setEquippedItems(newEquipped);
    localStorage.setItem('marketplace-equipped', JSON.stringify(newEquipped));
    toast({
      title: 'Item Equipped',
      description: `${item.name} has been equipped`,
    });
  };

  const unequipItem = (item: typeof MOCK_ITEMS[0]) => {
    const newEquipped = { ...equippedItems };
    delete newEquipped[item.id];
    setEquippedItems(newEquipped);
    localStorage.setItem('marketplace-equipped', JSON.stringify(newEquipped));
    toast({
      title: 'Item Unequipped',
      description: `${item.name} has been unequipped`,
    });
  };

  const openItemDetail = (item: any) => {
    setSelectedItem(item);
    setSelectedColor(item.equippedColor || item.colors[0]);
  };

  const closeItemDetail = () => {
    setSelectedItem(null);
    setSelectedColor('');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Backpack className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Inventory</h1>
          </div>
          <p className="text-muted-foreground">
            Manage your avatars, accessories, emotes, and more
          </p>
        </div>

        {/* Search and Filters */}
        <div className="space-y-4 mb-8">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search inventory..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
              <ChevronDown className={`h-4 w-4 ml-2 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </Button>
            <div className="flex border rounded-md">
              <Button
                variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                size="sm"
                className="rounded-r-none"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                size="sm"
                className="rounded-l-none"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate('/marketplace')}
            >
              <ShoppingBag className="h-4 w-4 mr-2" />
              Marketplace
            </Button>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="bg-card border border-border rounded-lg p-4 space-y-4 animate-in slide-in-from-top duration-200">
              {/* Categories */}
              <div>
                <Label className="text-sm font-medium mb-2 block">Categories</Label>
                <div className="flex flex-wrap gap-2">
                  {INVENTORY_CATEGORIES.map(category => (
                    <Button
                      key={category.id}
                      variant={selectedCategory === category.id ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedCategory(category.id)}
                    >
                      {category.name}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Favorites Toggle */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="favorites-only"
                  checked={showFavoritesOnly}
                  onChange={(e) => setShowFavoritesOnly(e.target.checked)}
                  className="w-4 h-4 rounded border-border"
                />
                <Label htmlFor="favorites-only" className="text-sm cursor-pointer">
                  Show favorites only
                </Label>
              </div>
            </div>
          )}

          {/* Active Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            {selectedCategory !== 'all' && (
              <Badge variant="secondary" className="flex items-center gap-1">
                {INVENTORY_CATEGORIES.find(c => c.id === selectedCategory)?.name}
              </Badge>
            )}
            {showFavoritesOnly && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                Favorites Only
              </Badge>
            )}
            {searchQuery && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Search: {searchQuery}
              </Badge>
            )}
            <span className="text-sm text-muted-foreground">
              {filteredItems.length} items
            </span>
          </div>
        </div>

        {/* Results */}
        {filteredItems.length === 0 ? (
          <div className="bg-muted/30 border border-border border-dashed rounded-xl p-12 text-center">
            <Backpack className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No items found</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {showFavoritesOnly ? "You don't have any favorite items in this category" : "Your inventory is empty"}
            </p>
            <Button onClick={() => navigate('/marketplace')}>
              Visit Marketplace
            </Button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredItems.map(item => (
              <Card 
                key={item.id} 
                className="cursor-pointer hover:border-primary/50 transition-colors overflow-hidden"
                onClick={() => openItemDetail(item)}
              >
                <div className={`h-40 ${item.image} relative`}>
                  {(item as any).equipped && (
                    <Badge className="absolute top-2 left-2 bg-green-500 text-white">
                      Equipped
                    </Badge>
                  )}
                  {(item as any).favorite && (
                    <Badge className="absolute top-2 right-2 bg-yellow-500 text-white">
                      <Star className="h-3 w-3 fill-white" />
                    </Badge>
                  )}
                </div>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{item.name}</CardTitle>
                  <CardDescription className="text-xs">
                    {item.type}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-2">
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {item.description}
                  </p>
                </CardContent>
                <CardFooter className="pt-2">
                  <Button 
                    variant={item.equipped ? 'outline' : 'default'}
                    className="w-full" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (item.equipped) {
                        unequipItem(item);
                      } else {
                        equipItem(item, item.colors[0]);
                      }
                    }}
                  >
                    {item.equipped ? 'Unequip' : 'Equip'}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredItems.map(item => (
              <Card 
                key={item.id} 
                className="cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => openItemDetail(item)}
              >
                <div className="flex gap-4 p-4">
                  <div className={`h-24 w-24 ${item.image} rounded-lg flex-shrink-0 relative`}>
                    {item.equipped && (
                      <Badge className="absolute top-1 left-1 bg-green-500 text-white text-xs">
                        Equipped
                      </Badge>
                    )}
                    {item.favorite && (
                      <Badge className="absolute top-1 right-1 bg-yellow-500 text-white text-xs">
                        <Star className="h-3 w-3 fill-white" />
                      </Badge>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-foreground">{item.name}</h3>
                        <p className="text-sm text-muted-foreground">{item.type} • {item.equipLocation}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(item.id);
                        }}
                      >
                        <Star 
                          className={`h-4 w-4 ${item.favorite ? 'fill-yellow-400 text-yellow-400' : ''}`} 
                        />
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                      {item.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        Acquired {new Date(item.acquiredAt).toLocaleDateString()}
                      </span>
                      <div className="flex gap-2">
                        <Button 
                          variant={item.equipped ? 'outline' : 'default'}
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (item.equipped) {
                              unequipItem(item);
                            } else {
                              equipItem(item, item.colors[0]);
                            }
                          }}
                        >
                          {item.equipped ? 'Unequip' : 'Equip'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Item Detail Modal */}
        {selectedItem && (
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
            onClick={closeItemDetail}
          >
            <div 
              className="bg-card border border-border rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-in zoom-in duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline">{selectedItem.type}</Badge>
                      {(selectedItem as any).equipped && (
                        <Badge className="bg-green-500 text-white">Equipped</Badge>
                      )}
                      {(selectedItem as any).favorite && (
                        <Badge className="bg-yellow-500 text-white">
                          <Star className="h-3 w-3 fill-white mr-1" />
                          Favorite
                        </Badge>
                      )}
                    </div>
                    <h2 className="text-2xl font-bold text-foreground mb-1">{selectedItem.name}</h2>
                    <p className="text-muted-foreground">{selectedItem.description}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={closeItemDetail}
                  >
                    <RefreshCw className="h-5 w-5" />
                  </Button>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Image */}
                  <div className="space-y-4">
                    <div className={`h-64 rounded-lg ${selectedItem.image} flex items-center justify-center`}>
                      <span className="text-white text-2xl font-bold opacity-50">{selectedItem.name}</span>
                    </div>
                    
                    {/* Color Selection */}
                    <div>
                      <Label className="text-sm font-medium mb-2 block">Available Colors</Label>
                      <div className="flex gap-2">
                        {selectedItem.colors.map((color, index) => (
                          <button
                            key={index}
                            className={`w-10 h-10 rounded-lg border-2 transition-all ${
                              selectedColor === color 
                                ? 'border-primary scale-110' 
                                : 'border-border hover:border-primary/50'
                            }`}
                            style={{ backgroundColor: color }}
                            onClick={() => setSelectedColor(color)}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-4">
                    {/* Actions */}
                    <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                      <div className="flex gap-2">
                        {(selectedItem as any).equipped ? (
                          <Button 
                            variant="outline"
                            className="flex-1"
                            onClick={() => unequipItem(selectedItem)}
                          >
                            <EyeOff className="h-4 w-4 mr-2" />
                            Unequip
                          </Button>
                        ) : (
                          <Button 
                            className="flex-1"
                            onClick={() => equipItem(selectedItem, selectedColor)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Equip
                          </Button>
                        )}
                        <Button 
                          variant="outline"
                          onClick={() => toggleFavorite(selectedItem.id)}
                        >
                          <Star className={`h-4 w-4 mr-2 ${(selectedItem as any).favorite ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                          {(selectedItem as any).favorite ? 'Unfavorite' : 'Favorite'}
                        </Button>
                      </div>
                    </div>

                    {/* Item Info */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between py-2 border-b border-border">
                        <span className="text-sm text-muted-foreground">Item Type</span>
                        <span className="text-sm font-medium">{selectedItem.type}</span>
                      </div>
                      <div className="flex items-center justify-between py-2 border-b border-border">
                        <span className="text-sm text-muted-foreground">Equip Location</span>
                        <span className="text-sm font-medium">{selectedItem.equipLocation}</span>
                      </div>
                      <div className="flex items-center justify-between py-2 border-b border-border">
                        <span className="text-sm text-muted-foreground">Acquired</span>
                        <span className="text-sm font-medium">{new Date((selectedItem as any).acquiredAt || selectedItem.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Where it appears */}
                    <div className="bg-muted/50 border border-border rounded-lg p-4">
                      <Label className="text-sm font-medium mb-2 block flex items-center gap-2">
                        <Palette className="h-4 w-4" />
                        Where you'll see it
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        This item will appear on your avatar's {selectedItem.equipLocation.toLowerCase()}.
                        {(selectedItem as any).equipped ? (
                          <span className="text-green-600 dark:text-green-400 font-medium"> Currently equipped.</span>
                        ) : (
                          <span className="text-muted-foreground"> Click "Equip" to use it.</span>
                        )}
                      </p>
                    </div>

                    {/* Color Preview */}
                    {selectedColor && (
                      <div className="bg-muted/50 border border-border rounded-lg p-4">
                        <Label className="text-sm font-medium mb-2 block">Selected Color</Label>
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-12 h-12 rounded-lg border-2 border-border"
                            style={{ backgroundColor: selectedColor }}
                          />
                          <span className="text-sm text-muted-foreground">
                            This color will be used when equipping the item
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
