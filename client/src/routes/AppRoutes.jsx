import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute.jsx';
import Layout from '../components/layout/Layout.jsx';
import { useAuth } from '../context/AuthContext.jsx';

// Lazy loading views
const Home = lazy(() => import('../pages/Home/Home.jsx'));
const Login = lazy(() => import('../pages/Login/Login.jsx'));
const Register = lazy(() => import('../pages/Register/Register.jsx'));
const ForgotPassword = lazy(() => import('../pages/ForgotPassword/ForgotPassword.jsx'));
const ResetPassword = lazy(() => import('../pages/ResetPassword/ResetPassword.jsx'));
const VerifyEmail = lazy(() => import('../pages/VerifyEmail/VerifyEmail.jsx'));
const Profile = lazy(() => import('../pages/Profile/Profile.jsx'));
const Unauthorized = lazy(() => import('../pages/Unauthorized/Unauthorized.jsx'));
const Dashboard = lazy(() => import('../pages/Dashboard/Dashboard.jsx'));
const NotFound = lazy(() => import('../pages/NotFound/NotFound.jsx'));
// Admin views
const AdminDashboard = lazy(() => import('../pages/admin/AdminDashboard.jsx'));
const UserManagementView = lazy(() => import('../pages/admin/UserManagementView.jsx'));
const LiveMapTrackingPage = lazy(() => import('../pages/admin/LiveMapTrackingPage.jsx'));
const ComplaintsPage = lazy(() => import('../pages/admin/ComplaintsPage.jsx'));
const ReportsPage = lazy(() => import('../pages/admin/ReportsPage.jsx'));
const SystemSettingsView = lazy(() => import('../pages/admin/SystemSettingsView.jsx'));

// Donation views
const CreateDonation = lazy(() => import('../pages/CreateDonation/CreateDonation.jsx'));
const EditDonation = lazy(() => import('../pages/EditDonation/EditDonation.jsx'));
const DonationDetails = lazy(() => import('../pages/DonationDetails/DonationDetails.jsx'));
const DonationHistory = lazy(() => import('../pages/DonationHistory/DonationHistory.jsx'));

// NGO views
const NGODashboard = lazy(() => import('../pages/ngo/NGODashboard.jsx'));
const NGOProfileView = lazy(() => import('../pages/ngo/NGOProfileView.jsx'));
const DiscoverDonations = lazy(() => import('../pages/ngo/DiscoverDonations.jsx'));
const RequestTracking = lazy(() => import('../pages/ngo/RequestTracking.jsx'));

// Volunteer views
const VolunteerDashboard = lazy(() => import('../pages/volunteer/VolunteerDashboard.jsx'));
const VolunteerProfile = lazy(() => import('../pages/volunteer/VolunteerProfile.jsx'));
const PickupScreen = lazy(() => import('../pages/volunteer/PickupScreen.jsx'));
const DeliveryScreen = lazy(() => import('../pages/volunteer/DeliveryScreen.jsx'));
const DeliveryHistoryPage = lazy(() => import('../pages/volunteer/DeliveryHistoryPage.jsx'));

// Simple loading indicator fallback
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-[50vh]">
    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

/**
 * GuestRoute Wrapper.
 * Redirects authenticated users away from authentication views (e.g. login, register).
 */
const GuestRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
};

/**
 * Main application routing system.
 */
export const AppRoutes = () => {
  return (
    <Layout>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* Public / Landing Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Guest Only Routes */}
          <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
          <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
          <Route path="/forgot-password" element={<GuestRoute><ForgotPassword /></GuestRoute>} />
          <Route path="/reset-password" element={<GuestRoute><ResetPassword /></GuestRoute>} />
          <Route path="/verify-email" element={<GuestRoute><VerifyEmail /></GuestRoute>} />

          {/* Private / Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Donor Only Routes */}
          <Route
            path="/donations/create"
            element={
              <ProtectedRoute allowedRoles={['DONOR', 'ADMIN']}>
                <CreateDonation />
              </ProtectedRoute>
            }
          />
          <Route
            path="/donations/:id/edit"
            element={
              <ProtectedRoute allowedRoles={['DONOR', 'ADMIN']}>
                <EditDonation />
              </ProtectedRoute>
            }
          />
          <Route
            path="/donations/:id"
            element={
              <ProtectedRoute>
                <DonationDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/donations/history"
            element={
              <ProtectedRoute allowedRoles={['DONOR', 'ADMIN']}>
                <DonationHistory />
              </ProtectedRoute>
            }
          />

          {/* NGO Only Routes */}
          <Route
            path="/ngo/dashboard"
            element={
              <ProtectedRoute allowedRoles={['NGO', 'ADMIN']}>
                <NGODashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ngo/profile"
            element={
              <ProtectedRoute allowedRoles={['NGO', 'ADMIN']}>
                <NGOProfileView />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ngo/discover"
            element={
              <ProtectedRoute allowedRoles={['NGO', 'ADMIN']}>
                <DiscoverDonations />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ngo/requests/:id"
            element={
              <ProtectedRoute allowedRoles={['NGO', 'ADMIN']}>
                <RequestTracking />
              </ProtectedRoute>
            }
          />

          {/* Volunteer Only Routes */}
          <Route
            path="/volunteer/dashboard"
            element={
              <ProtectedRoute allowedRoles={['VOLUNTEER', 'ADMIN']}>
                <VolunteerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/volunteer/profile"
            element={
              <ProtectedRoute allowedRoles={['VOLUNTEER', 'ADMIN']}>
                <VolunteerProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/volunteer/pickup/:id"
            element={
              <ProtectedRoute allowedRoles={['VOLUNTEER', 'ADMIN']}>
                <PickupScreen />
              </ProtectedRoute>
            }
          />
          <Route
            path="/volunteer/delivery/:id"
            element={
              <ProtectedRoute allowedRoles={['VOLUNTEER', 'ADMIN']}>
                <DeliveryScreen />
              </ProtectedRoute>
            }
          />
          <Route
            path="/volunteer/history"
            element={
              <ProtectedRoute allowedRoles={['VOLUNTEER', 'ADMIN']}>
                <DeliveryHistoryPage />
              </ProtectedRoute>
            }
          />

          {/* Admin Only Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <UserManagementView />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/live-map"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <LiveMapTrackingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/complaints"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <ComplaintsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/reports"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <ReportsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <SystemSettingsView />
              </ProtectedRoute>
            }
          />

          {/* Fallback 404 NotFound route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </Layout>
  );
};

export default AppRoutes;
