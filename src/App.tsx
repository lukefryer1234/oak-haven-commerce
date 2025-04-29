import React, { useEffect, lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Container, Box, CircularProgress } from '@mui/material';

import Layout from '@/components/layout/Layout'; // Import Layout
import LoadingSpinner from '@/components/common/LoadingSpinner';
import PostcodeCheck from '@/components/common/PostcodeCheck';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import AdminRoute from '@/components/common/AdminRoute';
import { RootState } from '@/store';
import { UserRole } from '@/types';

// Lazy load pages for better performance
const HomePage = lazy(() => import('@/pages/HomePage.tsx'));
const ProductsPage = lazy(() => import('@/pages/ProductsPage.tsx'));
const ProductCategoryPage = lazy(() => import('@/pages/ProductCategoryPage.tsx'));
const ProductDetailPage = lazy(() => import('@/pages/ProductDetailPage.tsx')); // Added product detail page
// Product configuration pages
const GarageConfigPage = lazy(() => import('@/pages/products/GarageConfigPage.tsx'));
const GazeboConfigPage = lazy(() => import('@/pages/products/GazeboConfigPage.tsx'));
const PorchConfigPage = lazy(() => import('@/pages/products/PorchConfigPage.tsx'));
const OakBeamConfigPage = lazy(() => import('@/pages/products/OakBeamConfigPage.tsx'));
const OakFlooringConfigPage = lazy(() => import('@/pages/products/OakFlooringConfigPage.tsx'));

// Authentication pages
const LoginPage = lazy(() => import('@/pages/auth/LoginPage.tsx'));
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage.tsx'));
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage.tsx'));
const ResetPasswordPage = lazy(() => import('@/pages/auth/ResetPasswordPage.tsx'));

// Shopping cart and checkout pages
const CartPage = lazy(() => import('@/pages/cart/CartPage.tsx'));
const CheckoutPage = lazy(() => import('@/pages/checkout/CheckoutPage.tsx'));
const PaymentPage = lazy(() => import('@/pages/checkout/PaymentPage.tsx'));
const OrderConfirmationPage = lazy(() => import('@/pages/checkout/OrderConfirmationPage.tsx'));

// User account pages
const AccountPage = lazy(() => import('@/pages/account/AccountPage.tsx'));
const OrderHistoryPage = lazy(() => import('@/pages/account/OrderHistoryPage.tsx'));
const OrderDetailsPage = lazy(() => import('@/pages/account/OrderDetailsPage.tsx'));
const AddressesPage = lazy(() => import('@/pages/account/AddressesPage.tsx'));
const ProfilePage = lazy(() => import('@/pages/account/ProfilePage.tsx'));

// Information pages
const GalleryPage = lazy(() => import('@/pages/info/GalleryPage.tsx'));
const MaterialsPage = lazy(() => import('@/pages/info/MaterialsPage.tsx'));
const FAQPage = lazy(() => import('@/pages/info/FAQPage.tsx'));
const ContactPage = lazy(() => import('@/pages/info/ContactPage.tsx'));
const DeliveryInfoPage = lazy(() => import('@/pages/info/DeliveryInfoPage.tsx'));
const CustomEnquiryPage = lazy(() => import('@/pages/info/CustomEnquiryPage.tsx'));

// Admin pages
const AdminDashboardPage = lazy(() => import('@/pages/admin/DashboardPage.tsx'));
const AdminOrdersPage = lazy(() => import('@/pages/admin/OrdersPage.tsx'));
const AdminOrderDetailsPage = lazy(() => import('@/pages/admin/OrderDetailsPage.tsx'));
const AdminProductsPage = lazy(() => import('@/pages/admin/ProductsPage.tsx'));
const AddProductPage = lazy(() => import('@/pages/admin/AddProductPage.tsx')); // Add import
const EditProductPage = lazy(() => import('@/pages/admin/EditProductPage.tsx')); // Add import (will create later)
const AdminPricesPage = lazy(() => import('@/pages/admin/PricesPage.tsx'));
const ProductOptionsPage = lazy(() => import('@/pages/admin/ProductOptionsPage.tsx'));
const AdminUsersPage = lazy(() => import('@/pages/admin/UsersPage.tsx'));
const AdminSettingsPage = lazy(() => import('@/pages/admin/SettingsPage.tsx'));
const AdminEnquiriesPage = lazy(() => import('@/pages/admin/EnquiriesPage.tsx'));

// Error and utility pages
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage.tsx'));

const App: React.FC = () => {
  const { user, loading } = useSelector((state: RootState) => state.auth);
  const { showPostcodeCheck } = useSelector((state: RootState) => state.app);
  const dispatch = useDispatch();
  const location = useLocation();

  // Check if user is logged in on app start
  useEffect(() => {
    // Check Firebase auth state on app start
    dispatch(checkUserAuth());
  }, [dispatch]);
  // Show loading spinner while auth state is being checked
  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Layout> {/* Wrap content with Layout */}
      {/* Postcode check modal (might need repositioning depending on desired behavior) */}
      {showPostcodeCheck && <PostcodeCheck />} 
      
      <Suspense fallback={<CircularProgress />}>
        <Routes>
            {/* Public routes */}
            <Route path="/" element={<HomePage />} />
            
            {/* Product browsing routes */}
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/products/:category" element={<ProductCategoryPage />} />
            <Route path="/products/detail/:productId" element={<ProductDetailPage />} /> {/* Added product detail route */}
            
            {/* Product configuration routes */}
            <Route path="/products/garage/configure" element={<GarageConfigPage />} />
            <Route path="/products/gazebo/configure" element={<GazeboConfigPage />} />
            <Route path="/products/porch/configure" element={<PorchConfigPage />} />
            <Route path="/products/beam/configure" element={<OakBeamConfigPage />} />
            <Route path="/products/flooring/configure" element={<OakFlooringConfigPage />} />
            
            {/* Authentication routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            
            {/* Shopping cart routes - available to all */}
            <Route path="/cart" element={<CartPage />} />
            
            {/* Checkout routes - protected for logged in users */}
            <Route 
              path="/checkout" 
              element={
                <ProtectedRoute>
                  <CheckoutPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/payment" 
              element={
                <ProtectedRoute>
                  <PaymentPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/order-confirmation/:orderId" 
              element={
                <ProtectedRoute>
                  <OrderConfirmationPage />
                </ProtectedRoute>
              } 
            />
            
            {/* User account routes - protected */}
            <Route 
              path="/account" 
              element={
                <ProtectedRoute>
                  <AccountPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/account/orders" 
              element={
                <ProtectedRoute>
                  <OrderHistoryPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/account/orders/:orderId" 
              element={
                <ProtectedRoute>
                  <OrderDetailsPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/account/addresses" 
              element={
                <ProtectedRoute>
                  <AddressesPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/account/profile" 
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } 
            />
            
            {/* Information pages */}
            <Route path="/gallery" element={<GalleryPage />} />
            <Route path="/materials" element={<MaterialsPage />} />
            <Route path="/faq" element={<FAQPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/delivery" element={<DeliveryInfoPage />} />
            <Route path="/custom-enquiry" element={<CustomEnquiryPage />} />
            
            {/* Admin routes - protected and role-based */}
            <Route 
              path="/admin" 
              element={
                <AdminRoute>
                  <Navigate to="/admin/dashboard" replace />
                </AdminRoute>
              } 
            />
            <Route 
              path="/admin/dashboard" 
              element={
                <AdminRoute>
                  <AdminDashboardPage />
                </AdminRoute>
              } 
            />
            <Route 
              path="/admin/orders" 
              element={
                <AdminRoute>
                  <AdminOrdersPage />
                </AdminRoute>
              } 
            />
            <Route 
              path="/admin/orders/:orderId" 
              element={
                <AdminRoute>
                  <AdminOrderDetailsPage />
                </AdminRoute>
              } 
            />
            <Route 
              path="/admin/products" 
              element={
                <AdminRoute>
                  <AdminProductsPage />
                </AdminRoute>
              } 
            />
            {/* Add/Edit Product Routes */}
            <Route 
              path="/admin/products/add" 
              element={
                <AdminRoute>
                  <AddProductPage />
                </AdminRoute>
              } 
            />
            <Route 
              path="/admin/products/edit/:productId" 
              element={
                <AdminRoute>
                  <EditProductPage />
                </AdminRoute>
              } 
            />
            <Route 
              path="/admin/prices" 
              element={
                <AdminRoute>
                  <AdminPricesPage />
                </AdminRoute>
              } 
            />
            <Route 
              path="/admin/prices/options/:productId" 
              element={
                <AdminRoute>
                  <ProductOptionsPage />
                </AdminRoute>
              } 
            />
            <Route 
              path="/admin/users"

              element={
                <AdminRoute>
                  <AdminUsersPage />
                </AdminRoute>
              } 
            />
            <Route 
              path="/admin/settings" 
              element={
                <AdminRoute>
                  <AdminSettingsPage />
                </AdminRoute>
              } 
            />
            <Route 
              path="/admin/enquiries" 
              element={
                <AdminRoute>
                  <AdminEnquiriesPage />
                </AdminRoute>
              } 
            />
            
            {/* 404 route */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
    </Layout> // Close Layout
  );
};

export default App;

