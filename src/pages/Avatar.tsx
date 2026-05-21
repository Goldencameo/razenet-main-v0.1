import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, User, Palette, Settings, Backpack, ShoppingBag,
  Eye, EyeOff, RefreshCw, Save, Trash2, Crown, Shirt, Watch
} from 'lucide-react';

// Mock marketplace items (same as in Marketplace.tsx and Inventory.tsx)
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
    id: 4,
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
    id: 5,
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
    id: 6,
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
    id: 7,
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

// Categories and subcategories
const CATEGORIES = [
  { id: 'avatars', name: 'Avatars', icon: User },
  { id: 'accessories', name: 'Accessories', icon: Crown },
  { id: 'clothing', name: 'Clothing', icon: Shirt },
];

const SUBCATEGORIES = {
  'accessories': [
    { id: 'hat', name: 'Hats' },
    { id: 'hair', name: 'Hair' },
    { id: 'face', name: 'Face' },
    { id: 'neck', name: 'Neck' },
    { id: 'front', name: 'Front' },
    { id: 'back', name: 'Back' },
    { id: 'waist', name: 'Waist' },
  ],
  'clothing': [
    { id: 't-shirt', name: 'T-Shirts' },
    { id: 'pants', name: 'Pants' },
    { id: 'shoes', name: 'Shoes' },
  ],
};

export default function Avatar() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { toast } = useToast();

  const [selectedCategory, setSelectedCategory] = useState('avatar-skins');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [savedAvatars, setSavedAvatars] = useState<Array<{ id: string; name: string; items: any[]; createdAt: string }>>([]);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [avatarName, setAvatarName] = useState('');
  const [avatarView, setAvatarView] = useState<'purchased' | 'saved'>('purchased');
  
  // Load inventory from localStorage
  const [inventoryItemIds, setInventoryItemIds] = useState<number[]>(() => {
    const saved = localStorage.getItem('marketplace-inventory');
    return saved ? JSON.parse(saved) : [];
  });
  const [inventoryItems, setInventoryItems] = useState<any[]>([]);
  const [equippedItems, setEquippedItems] = useState<Record<number, { color: string }>>(() => {
    const saved = localStorage.getItem('marketplace-equipped');
    return saved ? JSON.parse(saved) : {};
  });

  // Load inventory items from IDs
  useEffect(() => {
    const items = inventoryItemIds.map(id => MOCK_ITEMS.find(item => item.id === id)).filter(Boolean);
    setInventoryItems(items);
  }, [inventoryItemIds]);

  // Filter items for selected category and subcategory
  const filteredItems = inventoryItems.filter(item => {
    if (selectedCategory === 'avatars' && item.category !== 'avatar-skins') return false;
    if (selectedCategory === 'accessories' && item.category !== 'accessories') return false;
    if (selectedCategory === 'clothing' && item.category !== 'clothing') return false;
    if (selectedSubcategory && item.subcategory !== selectedSubcategory) return false;
    return true;
  }).map(item => ({
    ...item,
    equipped: equippedItems[item.id] !== undefined,
    equippedColor: equippedItems[item.id]?.color || item.colors[0],
  }));

  const equipItem = (item: any, color: string) => {
    // Unequip other items in the same slot
    const newEquipped = { ...equippedItems };
    Object.keys(newEquipped).forEach(key => {
      const equippedItem = MOCK_ITEMS.find(i => i.id === parseInt(key));
      if (equippedItem && equippedItem.equipLocation === item.equipLocation) {
        delete newEquipped[parseInt(key)];
      }
    });
    
    // Equip the new item
    newEquipped[item.id] = { color };
    setEquippedItems(newEquipped);
    localStorage.setItem('marketplace-equipped', JSON.stringify(newEquipped));
    
    toast({
      title: 'Item Equipped',
      description: `${item.name} has been equipped`,
    });
    
    setSelectedItem(null);
    setSelectedColor('');
  };

  const unequipItem = (item: any) => {
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

  const saveAvatar = () => {
    if (!avatarName.trim()) {
      toast({ title: 'Error', description: 'Please enter a name for your avatar', variant: 'destructive' });
      return;
    }

    const equippedItems = inventoryItems.filter(item => equippedItems[item.id] !== undefined).map(item => ({
      id: item.id,
      name: item.name,
      equippedColor: equippedItems[item.id].color,
    }));

    const newAvatar = {
      id: Date.now().toString(),
      name: avatarName,
      items: equippedItems,
      createdAt: new Date().toISOString(),
    };

    setSavedAvatars([...savedAvatars, newAvatar]);
    setAvatarName('');
    setSaveDialogOpen(false);
    toast({ title: 'Avatar Saved', description: `"${avatarName}" has been saved successfully` });
  };

  const loadAvatar = (avatarId: string) => {
    const avatar = savedAvatars.find(a => a.id === avatarId);
    if (!avatar) return;

    // Unequip all items
    const newEquipped = {};
    setEquippedItems(newEquipped);
    localStorage.setItem('marketplace-equipped', JSON.stringify(newEquipped));

    // Equip items from saved avatar
    avatar.items.forEach(savedItem => {
      const item = MOCK_ITEMS.find(i => i.id === savedItem.id);
      if (item) {
        newEquipped[item.id] = { color: savedItem.equippedColor };
      }
    });
    setEquippedItems(newEquipped);
    localStorage.setItem('marketplace-equipped', JSON.stringify(newEquipped));

    toast({ title: 'Avatar Loaded', description: `"${avatar.name}" has been applied` });
  };

  const deleteAvatar = (avatarId: string) => {
    setSavedAvatars(savedAvatars.filter(a => a.id !== avatarId));
    toast({ title: 'Avatar Deleted', description: 'Avatar has been removed' });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <User className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">My Avatar</h1>
          </div>
          <div className="flex gap-2">
            <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" onClick={() => setAvatarName('')}>
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Save Avatar Configuration</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label className="mb-2 block">Avatar Name</Label>
                    <Input
                      placeholder="Enter a name for your avatar"
                      value={avatarName}
                      onChange={(e) => setAvatarName(e.target.value)}
                    />
                  </div>
                  <Button className="w-full" onClick={saveAvatar}>
                    Save Avatar
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            <Button variant="outline" onClick={() => navigate('/inventory')}>
              <Backpack className="h-4 w-4 mr-2" />
              Inventory
            </Button>
            <Button variant="outline" onClick={() => navigate('/marketplace')}>
              <ShoppingBag className="h-4 w-4 mr-2" />
              Marketplace
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Left Column - 3D Avatar Placeholder */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="text-lg">3D Avatar</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-square bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg flex items-center justify-center border-2 border-dashed border-border">
                  <div className="text-center">
                    <User className="h-16 w-16 mx-auto mb-3 text-muted-foreground/50" />
                    <p className="text-sm text-muted-foreground">Coming Soon</p>
                  </div>
                </div>
                {savedAvatars.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <Label className="text-sm">Saved Avatars</Label>
                    {savedAvatars.map(avatar => (
                      <div key={avatar.id} className="flex items-center gap-2 p-2 rounded bg-muted/50">
                        <span className="text-sm flex-1 truncate">{avatar.name}</span>
                        <Button size="sm" variant="ghost" onClick={() => loadAvatar(avatar.id)}>
                          Load
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => deleteAvatar(avatar.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Items */}
          <div className="lg:col-span-3">
            {/* Category Tabs */}
            <Tabs value={selectedCategory} onValueChange={(value) => {
              setSelectedCategory(value);
              setSelectedSubcategory(null);
            }} className="mb-6">
              <TabsList className="grid w-full grid-cols-3">
                {CATEGORIES.map(cat => {
                  const Icon = cat.icon;
                  return (
                    <TabsTrigger key={cat.id} value={cat.id}>
                      <Icon className="h-4 w-4 mr-2" />
                      {cat.name}
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </Tabs>

            {/* Purchased/Saved Tabs for Avatars */}
            {selectedCategory === 'avatars' && (
              <div className="flex gap-2 mb-6">
                <Button
                  variant={avatarView === 'purchased' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setAvatarView('purchased')}
                >
                  Purchased
                </Button>
                <Button
                  variant={avatarView === 'saved' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setAvatarView('saved')}
                >
                  Saved
                </Button>
              </div>
            )}

            {/* Subcategory Buttons */}
            {SUBCATEGORIES[selectedCategory as keyof typeof SUBCATEGORIES] && (
              <div className="flex flex-wrap gap-2 mb-6">
                <Button
                  variant={selectedSubcategory === null ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedSubcategory(null)}
                >
                  All
                </Button>
                {SUBCATEGORIES[selectedCategory as keyof typeof SUBCATEGORIES].map(sub => (
                  <Button
                    key={sub.id}
                    variant={selectedSubcategory === sub.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedSubcategory(sub.id)}
                  >
                    {sub.name}
                  </Button>
                ))}
              </div>
            )}

            {/* Items Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredItems.map(item => (
                <Card 
                  key={item.id} 
                  className="cursor-pointer hover:border-primary/50 transition-colors overflow-hidden"
                  onClick={() => openItemDetail(item)}
                >
                  <div className={`h-32 ${item.image} relative`}>
                    {item.equipped && (
                      <Badge className="absolute top-2 left-2 bg-green-500 text-white text-xs">
                        Equipped
                      </Badge>
                    )}
                  </div>
                  <CardContent className="p-3">
                    <h4 className="text-sm font-medium truncate">{item.name}</h4>
                    <div className="flex gap-1 mt-2">
                      {item.colors.slice(0, 4).map((color, index) => (
                        <div
                          key={index}
                          className="w-4 h-4 rounded border border-border"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredItems.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No items in this category</p>
              </div>
            )}
          </div>
        </div>

        {/* Item Detail Modal */}
        {selectedItem && (
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
            onClick={closeItemDetail}
          >
            <div 
              className="bg-card border border-border rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in zoom-in duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground mb-1">{selectedItem.name}</h2>
                    <p className="text-muted-foreground">{selectedItem.description}</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={closeItemDetail}>
                    <RefreshCw className="h-5 w-5" />
                  </Button>
                </div>

                <div className="space-y-6">
                  <div className={`h-48 rounded-lg ${selectedItem.image} flex items-center justify-center`}>
                    <span className="text-white text-xl font-bold opacity-50">{selectedItem.name}</span>
                  </div>
                  
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

                  <div className="flex gap-2">
                    {selectedItem.equipped ? (
                      <Button variant="outline" className="flex-1" onClick={() => unequipItem(selectedItem)}>
                        <EyeOff className="h-4 w-4 mr-2" />
                        Unequip
                      </Button>
                    ) : (
                      <Button className="flex-1" onClick={() => equipItem(selectedItem, selectedColor)}>
                        <Eye className="h-4 w-4 mr-2" />
                        Equip
                      </Button>
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
