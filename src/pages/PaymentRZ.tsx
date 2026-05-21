import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, ShoppingBag, ShoppingCart, CreditCard, Lock } from 'lucide-react';
import rzIcon from '@/assets/rz-icon.png';

const RZ_PACKAGES = [
  { id: 1, amount: 100, price: 0.99, bonus: 0 },
  { id: 2, amount: 500, price: 4.99, bonus: 0 },
  { id: 3, amount: 1000, price: 9.99, bonus: 100, popular: true },
  { id: 4, amount: 2500, price: 24.99, bonus: 300 },
  { id: 5, amount: 5000, price: 49.99, bonus: 750, popular: true },
  { id: 6, amount: 10000, price: 99.99, bonus: 2000, bestValue: true },
];

export default function PaymentRZ() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { profile } = useAuth();
  const { toast } = useToast();
  const [processing, setProcessing] = useState(false);
  
  // Get package ID from URL
  const packageId = parseInt(searchParams.get('package') || '0');
  const selectedPackage = RZ_PACKAGES.find(p => p.id === packageId);
  
  // Payment form state
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [email, setEmail] = useState(profile?.email || '');
  const [saveCard, setSaveCard] = useState(false);
  
  // Load saved card info
  const [savedCard, setSavedCard] = useState<any>(null);
  useEffect(() => {
    const saved = localStorage.getItem('saved-card');
    if (saved) {
      setSavedCard(JSON.parse(saved));
    }
  }, []);

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

    if (!selectedPackage) {
      toast({ title: 'Error', description: 'Invalid package', variant: 'destructive' });
      return;
    }

    // Validate form
    if (cardNumber.length < 19 || !cardName || expiryDate.length < 5 || cvv.length < 3 || !postalCode || !email) {
      toast({ title: 'Error', description: 'Please fill in all required fields', variant: 'destructive' });
      return;
    }

    setProcessing(true);

    // Save card if requested
    if (saveCard) {
      const cardInfo = {
        last4: cardNumber.slice(-4),
        expiry: expiryDate,
        name: cardName,
      };
      localStorage.setItem('saved-card', JSON.stringify(cardInfo));
      setSavedCard(cardInfo);
    }

    // Simulate payment processing
    setTimeout(() => {
      setProcessing(false);
      
      // Add RZ to user balance (simulated)
      const currentBalance = parseInt(localStorage.getItem('rz-balance') || '0');
      const newBalance = currentBalance + selectedPackage.amount + selectedPackage.bonus;
      localStorage.setItem('rz-balance', newBalance.toString());
      
      toast({
        title: 'Purchase Successful!',
        description: `You have purchased ${selectedPackage.amount + selectedPackage.bonus} RZ`,
      });
      
      navigate('/buy-rz');
    }, 3000);
  };

  const useSavedCard = () => {
    if (savedCard) {
      setCardName(savedCard.name);
      setExpiryDate(savedCard.expiry);
      setCardNumber(`•••• •••• •••• ${savedCard.last4}`);
    }
  };

  if (!selectedPackage) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <ShoppingCart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">Invalid package</p>
          <Button onClick={() => navigate('/buy-rz')}>Back to Buy RZ</Button>
        </div>
      </div>
    );
  }

  const totalRZ = selectedPackage.amount + selectedPackage.bonus;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <CreditCard className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Complete Purchase</h1>
          </div>
          <p className="text-muted-foreground">
            You're buying {totalRZ.toLocaleString()} RZ
          </p>
        </div>

        <div className="grid lg:grid-cols-[4fr_1fr] gap-8">
          {/* Payment Form */}
          <div className="space-y-6 min-w-0">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <CreditCard className="h-6 w-6" />
                  Payment Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <form onSubmit={handlePayment} className="space-y-5">
                  {/* Saved Card */}
                  {savedCard && (
                    <div className="p-4 bg-muted/50 rounded-lg border border-border mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-foreground">Saved Card</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={useSavedCard}
                        >
                          Use This Card
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        •••• •••• •••• {savedCard.last4} - {savedCard.name}
                      </p>
                    </div>
                  )}

                  <div>
                    <Label htmlFor="cardNumber">Card Number *</Label>
                    <Input
                      id="cardNumber"
                      placeholder="1234 5678 9012 3456"
                      value={formatCardNumber(cardNumber)}
                      onChange={(e) => setCardNumber(e.target.value)}
                      maxLength={19}
                      className="mt-2"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="cardName">Cardholder Name *</Label>
                    <Input
                      id="cardName"
                      placeholder="John Doe"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      className="mt-2"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="expiry">Expiry Date (MM/YY) *</Label>
                      <Input
                        id="expiry"
                        placeholder="MM/YY"
                        value={formatExpiry(expiryDate)}
                        onChange={(e) => setExpiryDate(e.target.value)}
                        maxLength={5}
                        className="mt-2"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="cvv">CVV *</Label>
                      <Input
                        id="cvv"
                        placeholder="123"
                        type="password"
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value)}
                        maxLength={4}
                        className="mt-2"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="postalCode">Postal Code *</Label>
                    <Input
                      id="postalCode"
                      placeholder="12345"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      className="mt-2"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="mt-2"
                      required
                    />
                  </div>

                  {/* Save Card Checkbox */}
                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="checkbox"
                      id="saveCard"
                      checked={saveCard}
                      onChange={(e) => setSaveCard(e.target.checked)}
                      className="w-4 h-4 rounded border-border"
                    />
                    <Label htmlFor="saveCard" className="text-sm cursor-pointer">
                      Save card for future purchases
                    </Label>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-12 text-base"
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
                        Pay ${selectedPackage.price}
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Security Notice */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground p-4 bg-muted/50 rounded-lg border border-border">
              <Lock className="h-4 w-4" />
              <p>Your payment information is encrypted and secure. We never store your full card details.</p>
            </div>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <Card className="text-base">
              <CardHeader>
                <CardTitle className="text-lg">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4 p-6 bg-primary/5 rounded-lg border border-primary/20">
                  <img src={rzIcon} alt="RZ" className="h-20 w-20 object-contain flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground text-xl mb-2 whitespace-nowrap">{totalRZ.toLocaleString()} RZ</h3>
                    {selectedPackage.bonus > 0 && (
                      <p className="text-sm text-green-600 dark:text-green-400">+{selectedPackage.bonus.toLocaleString()} bonus</p>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0 min-w-[140px]">
                    <p className="text-4xl font-bold text-foreground mb-1">${selectedPackage.price}</p>
                    <p className="text-sm text-muted-foreground">One-time purchase</p>
                  </div>
                </div>

                <div className="border-t border-border pt-5 space-y-3">
                  <div className="flex justify-between text-base">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">{totalRZ.toLocaleString()} RZ</span>
                  </div>
                  <div className="flex justify-between text-base">
                    <span className="text-muted-foreground">Tax</span>
                    <span className="font-medium">0 RZ</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold pt-3 border-t border-border">
                    <span>Total</span>
                    <span>${selectedPackage.price}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Methods */}
            <Card>
              <CardContent className="p-4">
                <p className="text-sm font-medium text-foreground mb-3">Accepted Payment Methods</p>
                <div className="flex gap-2">
                  <div className="flex items-center justify-center w-12 h-8 bg-background border border-border rounded">
                    <span className="text-xs font-bold text-muted-foreground">VISA</span>
                  </div>
                  <div className="flex items-center justify-center w-12 h-8 bg-background border border-border rounded">
                    <span className="text-xs font-bold text-muted-foreground">MC</span>
                  </div>
                  <div className="flex items-center justify-center w-12 h-8 bg-background border border-border rounded">
                    <span className="text-xs font-bold text-muted-foreground">AMEX</span>
                  </div>
                  <div className="flex items-center justify-center w-12 h-8 bg-background border border-border rounded">
                    <span className="text-xs font-bold text-muted-foreground">PP</span>
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
