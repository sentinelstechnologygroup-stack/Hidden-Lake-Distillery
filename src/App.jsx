import {commerceEnabled} from "@/data/relaunch";
import Distribution from "@/pages/Distribution";
import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import Layout from '@/components/Layout';
import Home from '@/pages/Home';
import Cocktails from '@/pages/Cocktails';
import Spirits from '@/pages/Spirits';
import Whitefish from '@/pages/Whitefish';
import CopperPirates from '@/pages/CopperPirates';
import ProductDetail from '@/pages/ProductDetail';
import Craft from '@/pages/Craft';
import About from '@/pages/About';
import Contact from '@/pages/Contact';
import Checkout from '@/pages/Checkout';
import OrderConfirmation from '@/pages/OrderConfirmation';
import Account from '@/pages/Account';
import Admin from '@/pages/Admin';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import Seo from "@/components/Seo";
import ErrorBoundary from "@/components/ErrorBoundary";
import Policy from "@/pages/Policy";
import ProtectedRoute from '@/components/ProtectedRoute';
import { CartProvider } from '@/lib/cart';
import CartDrawer from '@/components/CartDrawer';
import { Navigate } from 'react-router-dom';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <Routes>
      {!commerceEnabled && ['/account','/checkout','/order/:id','/register'].map(path=><Route key={path} path={path} element={<Navigate to="/distribution" replace />}/>)}
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/spirits" element={<Spirits />} />
        <Route path="/products" element={<Navigate to="/spirits" replace />} />
        <Route path="/spirits/whitefish" element={<Whitefish />} />
        <Route path="/spirits/copper-pirates" element={<CopperPirates />} />
        <Route path="/spirits/:slug" element={commerceEnabled?<ProductDetail />:<Navigate to="/spirits" replace />} />
        <Route path="/distribution" element={<Distribution />} />
        <Route path="/cocktails" element={<Cocktails />} />
        <Route path="/craft" element={<Craft />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/policies/:section" element={<Policy />} />
        <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
          <Route path="/order/:id" element={commerceEnabled?<OrderConfirmation />:<Navigate to="/distribution" replace />} />
          <Route path="/checkout" element={commerceEnabled?<Checkout />:<Navigate to="/distribution" replace />} />
          <Route path="/account" element={commerceEnabled?<Account />:<Navigate to="/distribution" replace />} />
          <Route path="/admin" element={<Admin />} />
        </Route>
      </Route>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={commerceEnabled?<Register />:<Navigate to="/distribution" replace />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <ErrorBoundary><AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <Seo />
          <ScrollToTop />
          <CartProvider>
            <AuthenticatedApp />
            {commerceEnabled && <CartDrawer />}
          </CartProvider>
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider></ErrorBoundary>
  )
}

export default App