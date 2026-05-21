import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, ShoppingBag, Sparkles, TrendingUp, Crown, Hammer, Check, CreditCard, Lock } from 'lucide-react';
import rzIcon from '@/assets/rz-icon.png';

const RZ_PACKAGES = [
  { id: 1, amount: 100, price: 0.99, bonus: 0 },
  { id: 2, amount: 500, price: 4.99, bonus: 0 },
  { id: 3, amount: 1000, price: 9.99, bonus: 100, popular: true },
  { id: 4, amount: 2500, price: 24.99, bonus: 300 },
  { id: 5, amount: 5000, price: 49.99, bonus: 750, popular: true },
  { id: 6, amount: 10000, price: 99.99, bonus: 2000, bestValue: true },
];

export default function BuyRZ() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { toast } = useToast();

  const handlePackageSelect = (pkg: typeof RZ_PACKAGES[0]) => {
    navigate(`/payment-rz?package=${pkg.id}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3">
              <img src={rzIcon} alt="RZ" className="h-8 w-8 object-contain" />
              <h1 className="text-3xl font-bold text-foreground">Buy RZ</h1>
            </div>
          </div>
          <p className="text-muted-foreground">
            Purchase RZ currency to buy items in the marketplace
          </p>
        </div>

        {/* Packages Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {RZ_PACKAGES.map((pkg) => {
            const totalRZ = pkg.amount + pkg.bonus;

            return (
              <Card 
                key={pkg.id}
                className="cursor-pointer transition-all hover:shadow-lg hover:border-primary/40"
                onClick={() => handlePackageSelect(pkg)}
              >
                <CardHeader className="pb-3">
                  <CardTitle className="text-2xl font-bold text-primary">
                    {totalRZ.toLocaleString()} RZ
                  </CardTitle>
                  {pkg.bonus > 0 && (
                    <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                      +{pkg.bonus.toLocaleString()} bonus
                    </p>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center py-3">
                    <div className="text-3xl font-bold text-foreground mb-1">
                      ${pkg.price}
                    </div>
                    <p className="text-xs text-muted-foreground">One-time purchase</p>
                  </div>
                  <Button 
                    className="w-full" 
                    variant={pkg.bestValue || pkg.popular ? 'default' : 'outline'}
                  >
                    <ShoppingBag className="h-4 w-4 mr-2" />
                    Buy Now
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Info */}
        <div className="mt-8 p-4 bg-muted/50 rounded-lg border border-border">
          <div className="flex items-center justify-center gap-2 mb-2">
            <img src={rzIcon} alt="RZ" className="h-5 w-5 object-contain" />
            <h3 className="font-semibold text-foreground text-sm">About RZ</h3>
          </div>
          <p className="text-sm text-muted-foreground text-center">
            RZ is the virtual currency used across RazeHub. Purchases are processed securely and RZ is added to your account instantly.
          </p>
        </div>
      </div>
    </div>
  );
}
