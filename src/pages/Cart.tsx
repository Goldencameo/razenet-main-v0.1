import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, ShoppingCart, Trash2, Plus, Minus, Check } from 'lucide-react';

// Mock marketplace items
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

export default function Cart() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { toast } = useToast();
  const [cartItemIds, setCartItemIds] = useState<number[]>(() => {
    const saved = localStorage.getItem('marketplace-cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [processing, setProcessing] = useState(false);

  // Load cart items from IDs
  useEffect(() => {
    const items = cartItemIds.map(id => MOCK_ITEMS.find(item => item.id === id)).filter(Boolean);
    setCartItems(items);
  }, [cartItemIds]);

  const removeItem = (id: number) => {
    const newCartIds = cartItemIds.filter(itemId => itemId !== id);
    setCartItemIds(newCartIds);
    localStorage.setItem('marketplace-cart', JSON.stringify(newCartIds));
    toast({
      title: 'Item Removed',
      description: 'Item has been removed from your cart',
    });
  };

  const getTotal = () => {
    return cartItems.reduce((total, item) => total + item.price, 0);
  };

  const handleCheckout = () => {
    if (!profile) {
      toast({ title: 'Error', description: 'Please log in to checkout', variant: 'destructive' });
      return;
    }

    if (cartItems.length === 0) {
      toast({ title: 'Error', description: 'Your cart is empty', variant: 'destructive' });
      return;
    }

    // Calculate total RZ needed
    const totalRZ = cartItems.reduce((sum, item) => sum + item.price, 0);
    const currentBalance = parseInt(localStorage.getItem('rz-balance') || '0');

    if (currentBalance < totalRZ) {
      toast({ 
        title: 'Insufficient RZ Balance', 
        description: `You need ${totalRZ} RZ but only have ${currentBalance} RZ`,
        variant: 'destructive' 
      });
      navigate('/buy-rz');
      return;
    }

    // Deduct RZ and add items to inventory
    const newBalance = currentBalance - totalRZ;
    localStorage.setItem('rz-balance', newBalance.toString());

    // Add items to inventory
    const inventory = JSON.parse(localStorage.getItem('inventory') || '[]');
    cartItems.forEach(item => {
      inventory.push({
        ...item,
        id: Date.now() + Math.random(),
        acquiredAt: new Date().toISOString(),
      });
    });
    localStorage.setItem('inventory', JSON.stringify(inventory));

    // Clear cart
    setCartItemIds([]);
    localStorage.setItem('marketplace-cart', '[]');

    toast({ 
      title: 'Purchase Successful!', 
      description: `You purchased ${cartItems.length} items for ${totalRZ} RZ` 
    });
    navigate('/inventory');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <ShoppingCart className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Shopping Cart</h1>
          </div>
          <p className="text-muted-foreground">
            {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your cart
          </p>
        </div>

        {cartItems.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <ShoppingCart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-foreground mb-2">Your cart is empty</h2>
              <p className="text-muted-foreground mb-6">Add items from the marketplace to get started</p>
              <Button onClick={() => navigate('/marketplace')}>
                Browse Marketplace
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Cart Items */}
            <div className="space-y-4 mb-8">
              {cartItems.map(item => (
                <Card key={item.id}>
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <div className={`w-20 h-20 rounded-lg ${item.image} flex-shrink-0`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-foreground">{item.name}</h3>
                            <p className="text-sm text-muted-foreground">{item.publisher}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => removeItem(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-foreground">
                            {item.price} {item.currency}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Summary */}
            <Card>
              <CardContent className="p-6">
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">{getTotal()} RZ</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax</span>
                    <span className="font-medium">0 RZ</span>
                  </div>
                  <div className="border-t border-border pt-3">
                    <div className="flex justify-between">
                      <span className="font-semibold text-foreground">Total</span>
                      <span className="font-bold text-xl text-foreground">{getTotal()} RZ</span>
                    </div>
                  </div>
                </div>
                <Button
                  className="w-full h-12 text-base"
                  disabled={processing}
                  onClick={handleCheckout}
                >
                  {processing ? (
                    <>
                      <Check className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Checkout
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
