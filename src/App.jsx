import { BrowserRouter, Routes, Route, Outlet, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ProtectedRoute from './components/admin/ProtectedRoute';

// Public pages
import HomePage from './pages/public/HomePage';
import CategoryPage from './pages/public/CategoryPage';
import ProductDetailPage from './pages/public/ProductDetailPage';
import SearchPage from './pages/public/SearchPage';

// Admin pages
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage';
import AdminProductsPage from './pages/admin/AdminProductsPage';
import AdminAdsPage from './pages/admin/AdminAdsPage';
import AdminInquiriesPage from './pages/admin/AdminInquiriesPage';

function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
     <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" />
        <Routes>
          {/* Public routes with Navbar + Footer */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/category/:slug" element={<CategoryPage />} />
            <Route path="/product/:id" element={<ProductDetailPage />} />

            {/* Legacy redirects */}
            <Route
              path="/shoes"
              element={<Navigate to="/category/shoes" replace />}
            />
            <Route
              path="/clothes"
              element={<Navigate to="/category/clothes" replace />}
            />
            <Route
              path="/cosmetics"
              element={<Navigate to="/category/cosmetics" replace />}
            />
          </Route>

          {/* Admin auth (no layout) */}
          <Route path="/admin/login" element={<AdminLoginPage />} />

          {/* Protected admin routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/admin/categories" element={<AdminCategoriesPage />} />
            <Route path="/admin/products" element={<AdminProductsPage />} />
            <Route path="/admin/ads" element={<AdminAdsPage />} />
            <Route path="/admin/inquiries" element={<AdminInquiriesPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
     </AuthProvider>
    </LanguageProvider>
  );
}
