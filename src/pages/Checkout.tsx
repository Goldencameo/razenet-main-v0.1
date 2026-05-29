import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, CreditCard, Lock, Check, ShoppingCart } from 'lucide-react';

// Mock marketplace items
const MOCK_ITEMS = [
  {
    id: 1,
    name: 'Cyber Avatar Skin',
    price: 499,
    currency: 'RZ',
    image: 'bg-gradient-to-br from-cyan-500 to-blue-600',
    publisher: 'RazeStudio',
  },
  {
    id: 2,
    name: 'Golden Crown',
    price: 299,
    currency: 'RZ',
    image: 'bg-gradient-to-br from-yellow-400 to-amber-600',
    publisher: 'RoyalAssets',
  },
  {
    id: 5,
    name: 'Neon Wings',
    price: 399,
    currency: 'RZ',
    image: 'bg-gradient-to-br from-pink-500 to-purple-600',
    publisher: 'NeonStudio',
  },
];

export default function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile } = useAuth();
  const { toast } = useToast();
  
  const [cartItemIds, setCartItemIds] = useState<number[]>([]);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [processing, setProcessing] = useState(false);
  
  // Form state
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [billingAddress, setBillingAddress] = useState('');
  const [city, setCity] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [country, setCountry] = useState('');

  // Load cart items from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('marketplace-cart');
    const cartIds = saved ? JSON.parse(saved) : [];
    setCartItemIds(cartIds);
    
    const items = cartIds.map(id => MOCK_ITEMS.find(item => item.id === id)).filter(Boolean);
    setCartItems(items);
  }, []);

  const getTotal = () => {
    return cartItems.reduce((total, item) => total + item.price, 0);
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profile) {
      toast({ title: 'Error', description: 'Please log in to complete purchase', variant: 'destructive' });
      return;
    }

    // Validate form
    if (cardNumber.length < 19 || !cardName || expiryDate.length < 5 || cvv.length < 3) {
      toast({ title: 'Error', description: 'Please fill in all required fields', variant: 'destructive' });
      return;
    }

    setProcessing(true);

    // Simulate payment processing
    setTimeout(() => {
      setProcessing(false);
      
      // Add items to inventory
      const currentInventory = JSON.parse(localStorage.getItem('marketplace-inventory') || '[]');
      const newInventory = [...currentInventory, ...cartItemIds];
      localStorage.setItem('marketplace-inventory', JSON.stringify(newInventory));
      
      // Clear cart
      localStorage.setItem('marketplace-cart', JSON.stringify([]));
      
      toast({
        title: 'Payment Successful!',
        description: `You have purchased ${cartItems.length} item(s) for ${getTotal()} RZ`,
      });
      
      navigate('/inventory');
    }, 3000);
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <ShoppingCart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">Your cart is empty</p>
          <Button onClick={() => navigate('/marketplace')}>Browse Marketplace</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto p-4 sm:p-6">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-2 sm:gap-3 mb-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/cart')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <CreditCard className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Checkout</h1>
          </div>
          <p className="text-sm sm:text-base text-muted-foreground">
            Complete your purchase securely
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Payment Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Card Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <CreditCard className="h-4 w-4 sm:h-5 sm:w-5" />
                  Card Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePayment} className="space-y-4">
                  <div>
                    <Label htmlFor="cardNumber" className="text-sm">Card Number *</Label>
                    <Input
                      id="cardNumber"
                      placeholder="1234 5678 9012 3456"
                      value={formatCardNumber(cardNumber)}
                      onChange={(e) => setCardNumber(e.target.value)}
                      maxLength={19}
                      className="mt-2 h-10 sm:h-10"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="cardName" className="text-sm">Cardholder Name *</Label>
                    <Input
                      id="cardName"
                      placeholder="John Doe"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      className="mt-2 h-10 sm:h-10"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="expiry" className="text-sm">Expiry Date (MM/YY) *</Label>
                      <Input
                        id="expiry"
                        placeholder="MM/YY"
                        value={formatExpiry(expiryDate)}
                        onChange={(e) => setExpiryDate(e.target.value)}
                        maxLength={5}
                        className="mt-2 h-10 sm:h-10"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="cvv" className="text-sm">CVV *</Label>
                      <Input
                        id="cvv"
                        placeholder="123"
                        type="password"
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value)}
                        maxLength={4}
                        className="mt-2 h-10 sm:h-10"
                        required
                      />
                    </div>
                  </div>

                  {/* Billing Address */}
                  <div className="pt-4 border-t border-border">
                    <h3 className="font-semibold text-foreground mb-4 text-sm sm:text-base">Billing Address</h3>
                    
                    <div>
                      <Label htmlFor="address" className="text-sm">Street Address *</Label>
                      <Input
                        id="address"
                        placeholder="123 Main Street"
                        value={billingAddress}
                        onChange={(e) => setBillingAddress(e.target.value)}
                        className="mt-2 h-10 sm:h-10"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div>
                        <Label htmlFor="city" className="text-sm">City *</Label>
                        <Input
                          id="city"
                          placeholder="New York"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          className="mt-2 h-10 sm:h-10"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="zip" className="text-sm">ZIP Code *</Label>
                        <Input
                          id="zip"
                          placeholder="10001"
                          value={zipCode}
                          onChange={(e) => setZipCode(e.target.value)}
                          className="mt-2 h-10 sm:h-10"
                          required
                        />
                      </div>
                    </div>

                    <div className="mt-4">
                      <Label htmlFor="country" className="text-sm">Country *</Label>
                      <Input
                        id="country"
                        placeholder="United States"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className="mt-2 h-10 sm:h-10"
                        required
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-12 text-base sm:text-base"
                    disabled={processing}
                  >
                    {processing ? (
                      <>
                        <Lock className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Lock className="h-4 w-4 mr-2" />
                        Pay {getTotal()} RZ
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Security Notice */}
            <div className="flex items-start gap-2 text-xs sm:text-sm text-muted-foreground p-3 sm:p-4 bg-muted/50 rounded-lg border border-border">
              <Lock className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <p>Your payment information is encrypted and secure. We never store your full card details.</p>
            </div>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cartItems.map(item => (
                  <div key={item.id} className="flex gap-3">
                    <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-lg ${item.image} flex-shrink-0`} />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-foreground text-xs sm:text-sm line-clamp-1">{item.name}</h4>
                      <p className="text-[10px] sm:text-xs text-muted-foreground">{item.publisher}</p>
                      <p className="text-xs sm:text-sm font-bold text-foreground mt-1">{item.price} RZ</p>
                    </div>
                  </div>
                ))}

                <div className="border-t border-border pt-4 space-y-2">
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">{getTotal()} RZ</span>
                  </div>
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-muted-foreground">Tax</span>
                    <span className="font-medium">0 RZ</span>
                  </div>
                  <div className="flex justify-between text-base sm:text-lg font-bold pt-2 border-t border-border">
                    <span>Total</span>
                    <span>{getTotal()} RZ</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Methods */}
            <Card>
              <CardContent className="p-3 sm:p-4">
                <p className="text-xs sm:text-sm font-medium text-foreground mb-3">Accepted Payment Methods</p>
                <div className="flex gap-2 flex-wrap">
                  <div className="flex items-center justify-center w-10 h-8 sm:w-12 sm:h-8 bg-background border border-border rounded">
                    <span className="text-[10px] sm:text-xs font-bold text-muted-foreground">VISA</span>
                  </div>
                  <div className="flex items-center justify-center w-10 h-8 sm:w-12 sm:h-8 bg-background border border-border rounded">
                    <span className="text-[10px] sm:text-xs font-bold text-muted-foreground">MC</span>
                  </div>
                  <div className="flex items-center justify-center w-10 h-8 sm:w-12 sm:h-8 bg-background border border-border rounded">
                    <span className="text-[10px] sm:text-xs font-bold text-muted-foreground">AMEX</span>
                  </div>
                  <div className="flex items-center justify-center w-10 h-8 sm:w-12 sm:h-8 bg-background border border-border rounded">
                    <span className="text-[10px] sm:text-xs font-bold text-muted-foreground">PP</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
