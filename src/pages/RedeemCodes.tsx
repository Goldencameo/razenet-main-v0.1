import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Gift, CheckCircle, XCircle, Clock } from 'lucide-react';

// Mock redeemed codes data
const MOCK_REDEEMED_CODES = [
  {
    code: 'RAZE2024',
    reward: '500 RZ',
    status: 'success',
    redeemedAt: '2024-01-15T10:30:00Z',
  },
  {
    code: 'PREMIUM30',
    reward: '30 Days Premium',
    status: 'success',
    redeemedAt: '2024-01-10T14:20:00Z',
  },
  {
    code: 'EXPIRED123',
    reward: '1000 RZ',
    status: 'expired',
    redeemedAt: null,
  },
];

export default function RedeemCodes() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { toast } = useToast();
  const [code, setCode] = useState('');
  const [redeemedCodes, setRedeemedCodes] = useState(MOCK_REDEEMED_CODES);
  const [isRedeeming, setIsRedeeming] = useState(false);

  const handleRedeem = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profile) {
      toast({ title: 'Error', description: 'Please log in to redeem codes', variant: 'destructive' });
      return;
    }

    if (!code.trim()) {
      toast({ title: 'Error', description: 'Please enter a code', variant: 'destructive' });
      return;
    }

    setIsRedeeming(true);

    // Simulate code redemption
    setTimeout(() => {
      const upperCode = code.toUpperCase();
      
      // Check if code was already redeemed
      const alreadyRedeemed = redeemedCodes.some(rc => rc.code === upperCode);
      if (alreadyRedeemed) {
        toast({ 
          title: 'Code Already Redeemed', 
          description: 'This code has already been used',
          variant: 'destructive' 
        });
        setIsRedeeming(false);
        return;
      }

      // Simulate successful redemption
      const newRedemption = {
        code: upperCode,
        reward: '500 RZ',
        status: 'success' as const,
        redeemedAt: new Date().toISOString(),
      };

      setRedeemedCodes([newRedemption, ...redeemedCodes]);
      
      // Add RZ to balance
      const currentBalance = parseInt(localStorage.getItem('rz-balance') || '0');
      const newBalance = currentBalance + 500;
      localStorage.setItem('rz-balance', newBalance.toString());

      toast({ 
        title: 'Code Redeemed!', 
        description: 'You have received 500 RZ' 
      });
      
      setCode('');
      setIsRedeeming(false);
    }, 1500);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />;
      case 'expired':
        return <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'text-green-600 dark:text-green-400';
      case 'expired':
        return 'text-red-600 dark:text-red-400';
      case 'pending':
        return 'text-yellow-600 dark:text-yellow-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const totalRedeemed = redeemedCodes.filter(rc => rc.status === 'success').length;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Gift className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Redeem Codes</h1>
          </div>
          <p className="text-muted-foreground">
            Enter promotional codes to receive rewards
          </p>
        </div>

        {/* Redeem Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Redeem a Code</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRedeem} className="space-y-4">
              <div>
                <Label htmlFor="code">Promo Code</Label>
                <Input
                  id="code"
                  placeholder="Enter your code (e.g., RAZE2024)"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="mt-2 uppercase"
                  disabled={isRedeeming}
                />
              </div>
              <Button 
                type="submit" 
                className="w-full"
                disabled={isRedeeming || !code.trim()}
              >
                {isRedeeming ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Redeeming...
                  </>
                ) : (
                  <>
                    <Gift className="h-4 w-4 mr-2" />
                    Redeem Code
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="mb-8 bg-primary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Gift className="h-5 w-5 text-primary mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold text-foreground mb-1">How to redeem codes</p>
                <ul className="text-muted-foreground space-y-1">
                  <li>• Enter your promotional code in the field above</li>
                  <li>• Click "Redeem Code" to claim your reward</li>
                  <li>• Codes are case-insensitive and can only be used once</li>
                  <li>• Some codes may have expiration dates</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Redeemed Codes History */}
        <Card>
          <CardHeader>
            <CardTitle>Redemption History</CardTitle>
          </CardHeader>
          <CardContent>
            {redeemedCodes.length === 0 ? (
              <div className="text-center py-12">
                <Gift className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No codes redeemed yet</p>
                <p className="text-sm text-muted-foreground">Enter a code above to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <span className="text-sm text-muted-foreground">Total Redeemed</span>
                  <span className="font-semibold text-foreground">{totalRedeemed}</span>
                </div>
                {redeemedCodes.map((redeemed) => (
                  <div
                    key={redeemed.code}
                    className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      {getStatusIcon(redeemed.status)}
                      <div>
                        <p className="font-semibold text-foreground">{redeemed.code}</p>
                        <p className="text-sm text-muted-foreground">{redeemed.reward}</p>
                        {redeemed.redeemedAt && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Redeemed: {formatDate(redeemed.redeemedAt)}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center gap-1 text-sm font-medium ${getStatusColor(redeemed.status)}`}>
                        {redeemed.status.charAt(0).toUpperCase() + redeemed.status.slice(1)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
