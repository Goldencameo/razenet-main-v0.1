import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { 
  ArrowLeft, ShoppingCart, Heart, Star, Clock, Tag, Palette, User, 
  Check, ShoppingCart as CartIcon
} from 'lucide-react';

// Mock data - in a real app this would come from an API
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

export default function MarketplaceItemDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile } = useAuth();
  const { toast } = useToast();
  
  const [item, setItem] = useState<typeof MOCK_ITEMS[0] | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [favorites, setFavorites] = useState<number[]>(() => {
    const saved = localStorage.getItem('marketplace-favorites');
    return saved ? JSON.parse(saved) : [];
  });
  const [cart, setCart] = useState<number[]>(() => {
    const saved = localStorage.getItem('marketplace-cart');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    // Get item from location state or find by ID from URL
    if (location.state?.item) {
      setItem(location.state.item);
      setSelectedColor(location.state.item.colors[0]);
    } else {
      // Extract ID from URL
      const pathParts = window.location.pathname.split('/');
      const itemId = parseInt(pathParts[pathParts.length - 1]);
      const foundItem = MOCK_ITEMS.find(i => i.id === itemId);
      if (foundItem) {
        setItem(foundItem);
        setSelectedColor(foundItem.colors[0]);
      }
    }
  }, [location]);

  const toggleFavorite = () => {
    const newFavorites = favorites.includes(item!.id)
      ? favorites.filter(id => id !== item!.id)
      : [...favorites, item!.id];
    setFavorites(newFavorites);
    localStorage.setItem('marketplace-favorites', JSON.stringify(newFavorites));
    toast({
      title: favorites.includes(item!.id) ? 'Removed from Favorites' : 'Added to Favorites',
      description: favorites.includes(item!.id) 
        ? 'Item removed from your favorites' 
        : 'Item added to your favorites',
    });
  };

  const addToCart = () => {
    if (!cart.includes(item!.id)) {
      const newCart = [...cart, item!.id];
      setCart(newCart);
      localStorage.setItem('marketplace-cart', JSON.stringify(newCart));
      toast({
        title: 'Added to Cart',
        description: 'Item has been added to your cart',
      });
    }
  };

  const buyNow = () => {
    if (!profile) {
      toast({ title: 'Error', description: 'Please log in to purchase', variant: 'destructive' });
      return;
    }

    if (!item) return;

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
    navigate('/inventory');
  };

  if (!item) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Item not found</p>
          <Button onClick={() => navigate('/marketplace')}>Back to Marketplace</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate('/marketplace')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Marketplace
          </Button>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Left - Image */}
          <div className="space-y-4">
            <div className={`aspect-square rounded-xl ${item.image} flex items-center justify-center relative`}>
              {item.featured && (
                <Badge className="absolute top-4 left-4 bg-yellow-500 text-white">
                  Featured
                </Badge>
              )}
              <span className="text-white text-3xl font-bold opacity-50">{item.name}</span>
            </div>
            
            {/* Color Selection */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Available Colors</Label>
              <div className="flex gap-2">
                {item.colors.map((color, index) => (
                  <button
                    key={index}
                    className={`w-12 h-12 rounded-lg border-2 transition-all ${
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

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <Card className="p-4 text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-bold">{item.rating}</span>
                </div>
                <p className="text-xs text-muted-foreground">{item.reviews} reviews</p>
              </Card>
              <Card className="p-4 text-center">
                <Clock className="h-4 w-4 mx-auto mb-2 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">
                  {new Date(item.createdAt).toLocaleDateString()}
                </p>
              </Card>
              <Card className="p-4 text-center">
                <Tag className="h-4 w-4 mx-auto mb-2 text-muted-foreground" />
                <p className="text-xs text-muted-foreground capitalize">{item.category}</p>
              </Card>
            </div>
          </div>

          {/* Right - Details */}
          <div className="space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                {item.featured && (
                  <Badge className="bg-yellow-500 text-white">Featured</Badge>
                )}
                <Badge variant="outline">{item.type}</Badge>
              </div>
              <h1 className="text-3xl font-bold text-foreground mb-2">{item.name}</h1>
              <p className="text-muted-foreground flex items-center gap-2">
                <User className="h-4 w-4" />
                Published by {item.publisher}
              </p>
            </div>

            {/* Price and Actions */}
            <Card className="bg-primary/10 border-primary/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Price</p>
                    <p className="text-4xl font-bold text-foreground">
                      {item.price} {item.currency}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleFavorite}
                  >
                    <Heart 
                      className={`h-6 w-6 ${favorites.includes(item.id) ? 'fill-red-500 text-red-500' : ''}`} 
                    />
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={addToCart}
                    disabled={cart.includes(item.id)}
                  >
                    {cart.includes(item.id) ? (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        In Cart
                      </>
                    ) : (
                      <>
                        <CartIcon className="h-4 w-4 mr-2" />
                        Add to Cart
                      </>
                    )}
                  </Button>
                  <Button 
                    className="flex-1"
                    onClick={buyNow}
                  >
                    Buy Now
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Description</Label>
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </div>

            {/* Item Info */}
            <Card>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Item Type</span>
                  <span className="text-sm font-medium">{item.type}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Equip Location</span>
                  <span className="text-sm font-medium">{item.equipLocation}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Publisher</span>
                  <span className="text-sm font-medium">{item.publisher}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Created</span>
                  <span className="text-sm font-medium">{new Date(item.createdAt).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>

            {/* Where it appears */}
            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <Label className="text-sm font-medium mb-2 block flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  Where you'll see it
                </Label>
                <p className="text-sm text-muted-foreground">
                  This item will appear on your avatar's {item.equipLocation.toLowerCase()}.
                  You can equip it from your inventory after purchase.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
