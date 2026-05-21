import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { 
  Search, Filter, ShoppingCart, Star, Heart, ShoppingCart as CartIcon, 
  X, ChevronDown, Grid, List, User, Backpack, TrendingUp, Clock, 
  DollarSign, Palette, Tag, Check
} from 'lucide-react';

// Mock data for marketplace items
const CATEGORIES = [
  { id: 'all', name: 'All Items' },
  { id: 'profile-background', name: 'Profile Background' },
  { id: 'mini-profile', name: 'Mini Profile' },
  { id: 'avatar-skins', name: 'Avatar Skins' },
  { id: 'accessories', name: 'Accessories', subcategories: [
    { id: 'all', name: 'All Accessories' },
    { id: 'hat', name: 'Hat' },
    { id: 'face', name: 'Face' },
    { id: 'neck', name: 'Neck' },
    { id: 'front', name: 'Front' },
    { id: 'back', name: 'Back' },
    { id: 'waist', name: 'Waist' },
    { id: 'hair', name: 'Hair' },
  ]},
  { id: 'clothing', name: 'Clothing', subcategories: [
    { id: 'all', name: 'All Clothing' },
    { id: 't-shirt', name: 'T-Shirt' },
    { id: 'shirt', name: 'Shirt' },
    { id: 'pants', name: 'Pants' },
    { id: 'jackets', name: 'Jackets' },
    { id: 'shorts', name: 'Shorts' },
    { id: 'sweaters', name: 'Sweaters' },
    { id: 'shoes', name: 'Shoes' },
  ]},
  { id: 'faces', name: 'Faces' },
  { id: 'emotes', name: 'Emotes' },
  { id: 'effects', name: 'Effects' },
];

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

export default function Marketplace() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSubcategory, setSelectedSubcategory] = useState('all');
  const [sortBy, setSortBy] = useState('featured');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [cart, setCart] = useState<number[]>(() => {
    const saved = localStorage.getItem('marketplace-cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [favorites, setFavorites] = useState<number[]>(() => {
    const saved = localStorage.getItem('marketplace-favorites');
    return saved ? JSON.parse(saved) : [];
  });

  // Filter and sort items
  const filteredItems = MOCK_ITEMS.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSubcategory = selectedSubcategory === 'all' || item.subcategory === selectedSubcategory;
    const matchesPrice = item.price >= priceRange.min && item.price <= priceRange.max;
    return matchesSearch && matchesCategory && matchesSubcategory && matchesPrice;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'featured':
        return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'rating':
        return b.rating - a.rating;
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      default:
        return 0;
    }
  });

  const toggleFavorite = (itemId: number) => {
    setFavorites(prev => {
      const newFavorites = prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId];
      localStorage.setItem('marketplace-favorites', JSON.stringify(newFavorites));
      return newFavorites;
    });
    toast({
      title: favorites.includes(itemId) ? 'Removed from Favorites' : 'Added to Favorites',
      description: favorites.includes(itemId) 
        ? 'Item removed from your favorites' 
        : 'Item added to your favorites',
    });
  };

  const addToCart = (itemId: number) => {
    setCart(prev => {
      const newCart = [...prev, itemId];
      localStorage.setItem('marketplace-cart', JSON.stringify(newCart));
      return newCart;
    });
    toast({
      title: 'Added to Cart',
      description: 'Item has been added to your cart',
    });
  };

  const buyNow = (item: typeof MOCK_ITEMS[0]) => {
    if (!profile) {
      toast({ title: 'Error', description: 'Please log in to purchase', variant: 'destructive' });
      return;
    }

    // Check RZ balance
    const currentBalance = parseInt(localStorage.getItem('rz-balance') || '0');

    if (currentBalance < item.price) {
      toast({ 
        title: 'Insufficient RZ Balance', 
        description: `You need ${item.price} RZ but only have ${currentBalance} RZ`,
        variant: 'destructive' 
      });
      navigate('/buy-rz');
      return;
    }

    // Deduct RZ and add item to inventory
    const newBalance = currentBalance - item.price;
    localStorage.setItem('rz-balance', newBalance.toString());

    // Add item to inventory
    const inventory = JSON.parse(localStorage.getItem('inventory') || '[]');
    inventory.push({
      ...item,
      id: Date.now() + Math.random(),
      acquiredAt: new Date().toISOString(),
    });
    localStorage.setItem('inventory', JSON.stringify(inventory));

    toast({
      title: 'Purchase Successful',
      description: `You have purchased ${item.name} for ${item.price} RZ`,
    });
  };

  const openItemDetail = (item: typeof MOCK_ITEMS[0]) => {
    navigate(`/marketplace/item/${item.id}`, { state: { item } });
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setSelectedSubcategory('all');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <ShoppingCart className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold text-foreground">Marketplace</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/inventory')}
                className="relative"
              >
                <Backpack className="h-4 w-4 mr-2" />
                Inventory
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                className="relative"
                onClick={() => navigate('/cart')}
              >
                <CartIcon className="h-4 w-4 mr-2" />
                Cart
                {cart.length > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0">
                    {cart.length}
                  </Badge>
                )}
              </Button>
            </div>
          </div>
          <p className="text-muted-foreground">
            Discover and purchase avatars, accessories, emotes, and more
          </p>
        </div>

        {/* Search and Filters */}
        <div className="space-y-4 mb-8">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
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
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="bg-card border border-border rounded-lg p-4 space-y-4">
              {/* Categories */}
              <div>
                <Label className="text-sm font-medium mb-2 block">Categories</Label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map(category => (
                    <Button
                      key={category.id}
                      variant={selectedCategory === category.id ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleCategoryChange(category.id)}
                    >
                      {category.name}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Subcategories */}
              {selectedCategory !== 'all' && CATEGORIES.find(c => c.id === selectedCategory)?.subcategories && (
                <div>
                  <Label className="text-sm font-medium mb-2 block">Subcategories</Label>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.find(c => c.id === selectedCategory)?.subcategories?.map(subcategory => (
                      <Button
                        key={subcategory.id}
                        variant={selectedSubcategory === subcategory.id ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedSubcategory(subcategory.id)}
                      >
                        {subcategory.name}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Sort By */}
              <div>
                <Label className="text-sm font-medium mb-2 block">Sort By</Label>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={sortBy === 'featured' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSortBy('featured')}
                  >
                    <TrendingUp className="h-4 w-4 mr-1" />
                    Featured
                  </Button>
                  <Button
                    variant={sortBy === 'price-low' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSortBy('price-low')}
                  >
                    <DollarSign className="h-4 w-4 mr-1" />
                    Price: Low to High
                  </Button>
                  <Button
                    variant={sortBy === 'price-high' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSortBy('price-high')}
                  >
                    <DollarSign className="h-4 w-4 mr-1" />
                    Price: High to Low
                  </Button>
                  <Button
                    variant={sortBy === 'rating' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSortBy('rating')}
                  >
                    <Star className="h-4 w-4 mr-1" />
                    Top Rated
                  </Button>
                  <Button
                    variant={sortBy === 'newest' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSortBy('newest')}
                  >
                    <Clock className="h-4 w-4 mr-1" />
                    Newest
                  </Button>
                </div>
              </div>

              {/* Price Range */}
              <div>
                <Label className="text-sm font-medium mb-2 block">Price Range (RZ)</Label>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={priceRange.min}
                      onChange={(e) => setPriceRange({ ...priceRange, min: Number(e.target.value) })}
                    />
                  </div>
                  <span className="text-muted-foreground">to</span>
                  <div className="flex-1">
                    <Input
                      type="number"
                      placeholder="Max"
                      value={priceRange.max}
                      onChange={(e) => setPriceRange({ ...priceRange, max: Number(e.target.value) })}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Active Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            {selectedCategory !== 'all' && (
              <Badge variant="secondary" className="flex items-center gap-1">
                {CATEGORIES.find(c => c.id === selectedCategory)?.name}
                <X className="h-3 w-3 cursor-pointer" onClick={() => { setSelectedCategory('all'); setSelectedSubcategory('all'); }} />
              </Badge>
            )}
            {selectedSubcategory !== 'all' && selectedCategory !== 'all' && (
              <Badge variant="secondary" className="flex items-center gap-1">
                {CATEGORIES.find(c => c.id === selectedCategory)?.subcategories?.find(s => s.id === selectedSubcategory)?.name}
                <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedSubcategory('all')} />
              </Badge>
            )}
            {searchQuery && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Search: {searchQuery}
                <X className="h-3 w-3 cursor-pointer" onClick={() => setSearchQuery('')} />
              </Badge>
            )}
            <span className="text-sm text-muted-foreground">
              {filteredItems.length} items found
            </span>
          </div>
        </div>

        {/* Results */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredItems.map(item => (
              <Card 
                key={item.id} 
                className="cursor-pointer hover:shadow-lg hover:border-primary transition-all overflow-hidden group"
                onClick={() => openItemDetail(item)}
              >
                <div className="p-3 space-y-3">
                  <div className={`aspect-square ${item.image} rounded-lg relative`}>
                    <Badge className="absolute top-2 left-2 bg-amber-500/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      DEMO
                    </Badge>
                    {item.featured && (
                      <Badge className="absolute top-2 right-2 bg-yellow-500 text-white text-xs font-medium px-2 py-1">
                        Featured
                      </Badge>
                    )}
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-semibold text-foreground line-clamp-1">{item.name}</h4>
                    <p className="text-xs text-muted-foreground line-clamp-1">{item.publisher}</p>
                    <div className="flex items-center justify-between pt-1">
                      <span className="font-bold text-foreground text-sm">
                        {item.price} {item.currency}
                      </span>
                      <Button 
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(item.id);
                        }}
                      >
                        <ShoppingCart className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
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
                  <div className={`aspect-square w-24 ${item.image} rounded-lg flex-shrink-0 relative`}>
                    <Badge className="absolute top-1 left-1 bg-amber-500/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      DEMO
                    </Badge>
                    {item.featured && (
                      <Badge className="absolute top-1 right-1 bg-yellow-500 text-white text-xs">
                        Featured
                      </Badge>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <div>
                        <h3 className="font-semibold text-foreground text-sm">{item.name}</h3>
                        <p className="text-xs text-muted-foreground">{item.publisher}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(item.id);
                        }}
                      >
                        <Heart 
                          className={`h-4 w-4 ${favorites.includes(item.id) ? 'fill-red-500 text-red-500' : ''}`} 
                        />
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm">
                        {item.price} {item.currency}
                      </span>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            addToCart(item.id);
                          }}
                        >
                          Add to Cart
                        </Button>
                        <Button 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            buyNow(item);
                          }}
                        >
                          Buy Now
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
