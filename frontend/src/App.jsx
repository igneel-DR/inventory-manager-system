import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProductPage from './pages/ProductPage';
import UserManagementPage from './pages/UserManagementPage';
import ProductDetailPage from './pages/ProductDetailPage';
import StockMovementsPage from './pages/StockMovementsPage';
import SuppliersPage from './pages/SuppliersPage';
import CategoriesPage from './pages/CategoriesPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';
import ProfilePage from './pages/ProfilePage';
import AuditLogPage from './pages/AuditLogPage';
import ChatPage from './pages/ChatPage';
import { useAuth } from './context/AuthContext';
import Layout from './components/layout/Layout';
import './App.css';
import { Toaster } from 'sonner';

const ProtectedRoutesWithLayout = () => {
  const { token, loading } = useAuth();

  if (loading) {
    // Consider a full-page loader or a more integrated loading experience
    return <div className="flex h-screen items-center justify-center">Loading application...</div>;
  }

  return token ? <Layout><Outlet /></Layout> : <Navigate to="/login" replace />;
};

const PublicRoute = () => {
  const { token, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }

  return token ? <Navigate to="/dashboard" replace /> : <Outlet />;
};

function App() {
  return (
    <>
      <Toaster richColors position="bottom-right" />
      <Routes>
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>
        <Route element={<ProtectedRoutesWithLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/products" element={<ProductPage />} />
          <Route path="/products/:productId" element={<ProductDetailPage />} />
          <Route path="/users" element={<UserManagementPage />} />
          <Route path="/stock-movements" element={<StockMovementsPage />} />
          <Route path="/suppliers" element={<SuppliersPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/audit-logs" element={<AuditLogPage />} />
          <Route path="/chat" element={<ChatPage />} />
        </Route>
        {/* Redirect root path based on auth state */}
        <Route 
          path="/" 
          element={
            <NavigateBasedOnAuth />
          }
        />
        {/* Add a 404 Not Found Route if needed */}
        {/* <Route path="*" element={<div>404 Not Found</div>} /> */}
      </Routes>
    </>
  );
}

const NavigateBasedOnAuth = () => {
  const { token, loading } = useAuth();
  if (loading) {
    return <div>Loading...</div>; 
  }
  return token ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />;
};

export default App;
