import { BrowserRouter, Routes, Route, Outlet, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ProtectedRoute from './components/admin/ProtectedRoute';
import Seo from './components/seo/Seo';

// Public pages
import HomePage from './pages/public/HomePage';
import CategoryPage from './pages/public/CategoryPage';
import CategoriesPage from './pages/public/CategoriesPage';
import ProductDetailPage from './pages/public/ProductDetailPage';
import SearchPage from './pages/public/SearchPage';
import NotFoundPage from './pages/public/NotFoundPage';

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

function AdminLayout() {
  return (
    <>
      <Seo
        title="Administration"
        description="Private Abron Shop administration area."
        canonical={false}
        noindex
      />
      <Outlet />
    </>
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
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/category/:slug" element={<CategoryPage />} />
            <Route path="/products/:slug" element={<ProductDetailPage />} />
            {/* Compatibility fallback for local/static hosting. Production Caddy sends a 301. */}
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
            <Route path="*" element={<NotFoundPage />} />
          </Route>

          <Route element={<AdminLayout />}>
            {/* Admin auth (no public layout) */}
            <Route path="/admin/login" element={<AdminLoginPage />} />

            {/* Protected admin routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/admin" element={<AdminDashboardPage />} />
              <Route path="/admin/categories" element={<AdminCategoriesPage />} />
              <Route path="/admin/products" element={<AdminProductsPage />} />
              <Route path="/admin/ads" element={<AdminAdsPage />} />
              <Route path="/admin/inquiries" element={<AdminInquiriesPage />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
     </AuthProvider>
    </LanguageProvider>
  );
}
