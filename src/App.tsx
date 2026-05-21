import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { I18nProvider } from "@/lib/i18n";
import { ThemeProvider } from "@/lib/theme";
import AppLayout from "@/components/AppLayout";
import DocumentTitle from "@/components/DocumentTitle";
import LoadingScreen from "@/components/LoadingScreen";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import Home from "@/pages/Home";
import Discover from "@/pages/Discover";
import Profile from "@/pages/Profile";
import GamePage from "@/pages/GamePage";
import Settings from "@/pages/Settings";
import MailBox from "@/pages/MailBox";
import OtherProfile from "@/pages/OtherProfile";
import Support from "@/pages/Support";
import DeveloperHub from "@/pages/DeveloperHub";
import CreatorStudio from "@/pages/CreatorStudio";
import ModerationPanel from "@/pages/ModerationPanel";
import Chat from "@/pages/Chat";
import Community from "@/pages/Community";
import ParentalControlSettings from "@/pages/ParentalControlSettings";
import Marketplace from "@/pages/Marketplace";
import MarketplaceItemDetail from "@/pages/MarketplaceItemDetail";
import BuyRZ from "@/pages/BuyRZ";
import Cart from "@/pages/Cart";
import Checkout from "@/pages/Checkout";
import Billing from "@/pages/Billing";
import PaymentRZ from "@/pages/PaymentRZ";
import PaymentSubscription from "@/pages/PaymentSubscription";
import Transactions from "@/pages/Transactions";
import RedeemCodes from "@/pages/RedeemCodes";
import Inventory from "@/pages/Inventory";
import Avatar from "@/pages/Avatar";
import Music from "@/pages/Music";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/" replace />;
  return <AppLayout>{children}</AppLayout>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (user) return <Navigate to="/home" replace />;
  return <>{children}</>;
}

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<PublicRoute><Login /></PublicRoute>} />
    <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
    <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
    <Route path="/discover" element={<ProtectedRoute><Discover /></ProtectedRoute>} />
    <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
    <Route path="/profile/:userId" element={<ProtectedRoute><OtherProfile /></ProtectedRoute>} />
    <Route path="/game/:id" element={<ProtectedRoute><GamePage /></ProtectedRoute>} />
    <Route path="/community/:studioName" element={<ProtectedRoute><Community /></ProtectedRoute>} />
    <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
    <Route path="/mailbox" element={<ProtectedRoute><MailBox /></ProtectedRoute>} />
    <Route path="/support" element={<ProtectedRoute><Support /></ProtectedRoute>} />
    <Route path="/developer" element={<ProtectedRoute><DeveloperHub /></ProtectedRoute>} />
    <Route path="/creator" element={<ProtectedRoute><CreatorStudio /></ProtectedRoute>} />
    <Route path="/moderation" element={<ProtectedRoute><ModerationPanel /></ProtectedRoute>} />
    <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
    <Route path="/parental-controls" element={<ProtectedRoute><ParentalControlSettings /></ProtectedRoute>} />
    <Route path="/marketplace" element={<ProtectedRoute><Marketplace /></ProtectedRoute>} />
    <Route path="/marketplace/item/:id" element={<ProtectedRoute><MarketplaceItemDetail /></ProtectedRoute>} />
    <Route path="/buy-rz" element={<ProtectedRoute><BuyRZ /></ProtectedRoute>} />
    <Route path="/payment-rz" element={<ProtectedRoute><PaymentRZ /></ProtectedRoute>} />
    <Route path="/payment-subscription" element={<ProtectedRoute><PaymentSubscription /></ProtectedRoute>} />
    <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
    <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
    <Route path="/billing" element={<ProtectedRoute><Billing /></ProtectedRoute>} />
    <Route path="/transactions" element={<ProtectedRoute><Transactions /></ProtectedRoute>} />
    <Route path="/redeem-codes" element={<ProtectedRoute><RedeemCodes /></ProtectedRoute>} />
    <Route path="/inventory" element={<ProtectedRoute><Inventory /></ProtectedRoute>} />
    <Route path="/avatar" element={<ProtectedRoute><Avatar /></ProtectedRoute>} />
    <Route path="/music" element={<ProtectedRoute><Music /></ProtectedRoute>} />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <I18nProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AuthProvider>
              <DocumentTitle />
              <AppRoutes />
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </I18nProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
