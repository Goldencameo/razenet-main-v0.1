import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import {
  Shield, Lock, Clock, UserCheck, MessageSquare, Gamepad2, Copy, Check, AlertTriangle,
} from 'lucide-react';

export default function ParentalControlSettings() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { toast } = useToast();

  const [connectionCode, setConnectionCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showCode, setShowCode] = useState(false);

  // Parental control settings
  const [timeLimit, setTimeLimit] = useState(2); // hours per day
  const [ageRestriction, setAgeRestriction] = useState(13); // minimum age
  const [chatEnabled, setChatEnabled] = useState(true);
  const [friendRequestsEnabled, setFriendRequestsEnabled] = useState(true);
  const [publicProfile, setPublicProfile] = useState(false);

  // Generate unique connection code
  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      if (i === 4) code += '-';
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setGeneratedCode(code);
    setShowCode(true);
  };

  // Copy code to clipboard
  const copyCode = () => {
    if (generatedCode) {
      navigator.clipboard.writeText(generatedCode);
      setCopied(true);
      toast({ title: 'Code Copied', description: 'Connection code copied to clipboard' });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Verify connection code
  const verifyConnection = () => {
    if (!connectionCode.trim()) {
      toast({ title: 'Error', description: 'Please enter a connection code', variant: 'destructive' });
      return;
    }
    
    // In a real implementation, this would verify with RazeCare backend
    if (connectionCode.length === 9 && connectionCode.includes('-')) {
      setIsConnected(true);
      toast({ title: 'Connected', description: 'Successfully connected to RazeCare parental controls' });
    } else {
      toast({ title: 'Invalid Code', description: 'Please enter a valid connection code', variant: 'destructive' });
    }
  };

  // Save parental control settings
  const saveSettings = () => {
    // In a real implementation, this would save to RazeCare backend
    toast({ title: 'Settings Saved', description: 'Parental control settings have been updated' });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
            ← Back
          </Button>
          <div className="flex items-center gap-3 mb-2">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Parental Control Settings</h1>
          </div>
          <p className="text-muted-foreground">
            Connect with RazeCare to manage and monitor your child's account
          </p>
        </div>

        {!isConnected ? (
          /* Connection Instructions */
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                For Parents Only
              </CardTitle>
              <CardDescription>
                This section is exclusively for parents/guardians to set up parental controls
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Instructions */}
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-3 flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  How to Connect
                </h3>
                <ol className="space-y-2 text-sm text-yellow-900 dark:text-yellow-100 list-decimal list-inside">
                  <li>Create an account on <span className="font-semibold">RazeCare</span> (our parental control platform)</li>
                  <li>Confirm your email address and phone number for security verification</li>
                  <li>Generate a unique connection code from your RazeCare dashboard</li>
                  <li>Copy the code below and enter it in the RazeCare platform</li>
                  <li>Confirm the connection to start managing your child's account</li>
                </ol>
              </div>

              {/* Code Generation */}
              <div className="space-y-3">
                <Label>Connection Code</Label>
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <Input
                      type="text"
                      placeholder="XXXX-XXXX"
                      value={showCode ? generatedCode : '••••••••••'}
                      readOnly
                      className="font-mono text-lg tracking-wider"
                    />
                    {!showCode && (
                      <p className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                        Click "Generate Code" to see
                      </p>
                    )}
                  </div>
                  <Button onClick={generateCode} variant="outline">
                    {showCode ? 'Regenerate' : 'Generate Code'}
                  </Button>
                  {showCode && (
                    <Button onClick={copyCode} variant="outline">
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  This code is unique to this account. Share it only with your parent/guardian on RazeCare.
                </p>
              </div>

              {/* Verification */}
              <div className="space-y-3">
                <Label>Enter RazeCare Connection Code</Label>
                <Input
                  type="text"
                  placeholder="Enter code from RazeCare"
                  value={connectionCode}
                  onChange={(e) => setConnectionCode(e.target.value.toUpperCase())}
                  className="font-mono tracking-wider"
                />
                <Button onClick={verifyConnection} className="w-full">
                  Verify Connection
                </Button>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-sm text-blue-900 dark:text-blue-100">
                  <strong>What parents can do on RazeCare:</strong> Monitor activity, set time limits, 
                  control chat access, manage friend requests, set age restrictions for games, and more.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          /* Parental Control Settings */
          <div className="space-y-6">
            {/* Connection Status */}
            <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <div>
                    <p className="font-semibold text-green-900 dark:text-green-100">
                      Connected to RazeCare
                    </p>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      Parental controls are active and managed through RazeCare
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Time Limits */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Time Limits
                </CardTitle>
                <CardDescription>
                  Set daily time limits for platform usage
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Daily Time Limit</Label>
                    <span className="text-sm font-medium">{timeLimit} hours</span>
                  </div>
                  <Slider
                    value={[timeLimit]}
                    onValueChange={(value) => setTimeLimit(value[0])}
                    min={0.5}
                    max={8}
                    step={0.5}
                    className="flex-1"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>30 min</span>
                    <span>8 hours</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Age Restrictions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gamepad2 className="h-5 w-5" />
                  Age Restrictions
                </CardTitle>
                <CardDescription>
                  Set minimum age requirements for games and content
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Minimum Age for Games</Label>
                    <span className="text-sm font-medium">{ageRestriction}+ years</span>
                  </div>
                  <Slider
                    value={[ageRestriction]}
                    onValueChange={(value) => setAgeRestriction(value[0])}
                    min={3}
                    max={18}
                    step={1}
                    className="flex-1"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>3+ years</span>
                    <span>18+ years</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Chat Controls */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Chat Controls
                </CardTitle>
                <CardDescription>
                  Manage chat and messaging features
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="chat-enabled">Enable Chat</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow user to send and receive messages
                    </p>
                  </div>
                  <Switch
                    id="chat-enabled"
                    checked={chatEnabled}
                    onCheckedChange={setChatEnabled}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Friend Controls */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5" />
                  Friend Controls
                </CardTitle>
                <CardDescription>
                  Manage friend requests and social features
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="friend-requests">Allow Friend Requests</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow other users to send friend requests
                    </p>
                  </div>
                  <Switch
                    id="friend-requests"
                    checked={friendRequestsEnabled}
                    onCheckedChange={setFriendRequestsEnabled}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="public-profile">Public Profile</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow profile to be visible to non-friends
                    </p>
                  </div>
                  <Switch
                    id="public-profile"
                    checked={publicProfile}
                    onCheckedChange={setPublicProfile}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Save Button */}
            <Button onClick={saveSettings} className="w-full" size="lg">
              Save Settings
            </Button>

            {/* Disconnect */}
            <Button
              onClick={() => setIsConnected(false)}
              variant="destructive"
              className="w-full"
            >
              Disconnect from RazeCare
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
