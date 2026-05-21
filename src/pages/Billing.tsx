import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Crown, Hammer, Sparkles, CreditCard, Lock, Check } from 'lucide-react';

const SUBSCRIPTION_PLANS = [
  {
    id: 'premium',
    name: 'Premium Plan',
    description: 'Unlock exclusive features',
    price: 9.99,
    currency: 'USD',
    period: 'month',
    icon: Crown,
    color: 'purple',
    features: [
      'Ad-free experience',
      'Exclusive avatar skins',
      'Priority support',
      '10% bonus on RZ purchases',
      'Early access to new features',
    ],
    popular: true,
  },
  {
    id: 'builder',
    name: 'Builder Plan',
    description: 'Create and monetize',
    price: 19.99,
    currency: 'USD',
    period: 'month',
    icon: Hammer,
    color: 'orange',
    features: [
      'Create and sell items',
      'Creator studio access',
      'Analytics dashboard',
      '80% revenue share',
      'Custom storefront',
    ],
    popular: false,
  },
  {
    id: 'bundle',
    name: 'Premium + Builder Bundle',
    description: 'Best of both worlds',
    price: 24.99,
    currency: 'USD',
    period: 'month',
    icon: Sparkles,
    color: 'blue',
    features: [
      'All Premium features',
      'All Builder features',
      '15% bonus on RZ purchases',
      '90% revenue share',
      'Priority creator support',
    ],
    popular: false,
    bestValue: true,
  },
];

export default function Billing() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { toast } = useToast();

  const handlePlanSelect = (planId: string) => {
    navigate(`/payment-subscription?plan=${planId}`);
  };

  const IconComponent = ({ icon: Icon }: { icon: any }) => <Icon className="h-6 w-6" />;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/settings')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <CreditCard className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Billing & Subscriptions</h1>
          </div>
          <p className="text-muted-foreground">
            Manage your subscriptions and payment methods
          </p>
        </div>

        {/* Subscription Plans */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold text-foreground mb-4">Choose Your Plan</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {SUBSCRIPTION_PLANS.map((plan) => {
              const Icon = plan.icon;
              
              return (
                <Card 
                  key={plan.id}
                  className="cursor-pointer transition-all hover:shadow-lg hover:border-primary/40"
                  onClick={() => handlePlanSelect(plan.id)}
                >
                  {plan.bestValue && (
                    <div className="absolute top-0 right-0 bg-primary text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                      BEST VALUE
                    </div>
                  )}
                  {plan.popular && !plan.bestValue && (
                    <div className="absolute top-0 right-0 bg-yellow-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                      POPULAR
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`p-2 bg-${plan.color}-500/20 rounded-lg`}>
                        <Icon className={`h-6 w-6 text-${plan.color}-600 dark:text-${plan.color}-400`} />
                      </div>
                      <div>
                        <CardTitle className="text-xl">{plan.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{plan.description}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      {plan.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <Check className={`h-4 w-4 text-${plan.color}-600 dark:text-${plan.color}-400`} />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                    <div className="pt-4 border-t border-border">
                      <div className="flex items-baseline gap-1 mb-3">
                        <span className="text-3xl font-bold text-foreground">${plan.price}</span>
                        <span className="text-sm text-muted-foreground">/{plan.period}</span>
                      </div>
                      <Button 
                        className="w-full" 
                        variant={plan.bestValue || plan.popular ? 'default' : 'outline'}
                      >
                        Subscribe
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
