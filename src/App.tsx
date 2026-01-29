import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './features/common/Layout';
import ProtectedRoute from './features/common/ProtectedRoute';
import DriverDetails from './pages/driver-details/DriverDetails';
import Verificationcodes from './features/verification-codes/Verificationcodes';
import LoadingSpinner from './assets/LoadingSpinner';

// Lazy load all page components
const LoginPage = React.lazy(() => import('./pages/login'));
const DashboardPage = React.lazy(() => import('./pages/Dashboard'));
const UsersPage = React.lazy(() => import('./pages/users'));
const DriversPage = React.lazy(() => import('./pages/drivers'));
const ClientsPage = React.lazy(() => import('./pages/clients'));
const EmployeesPage = React.lazy(() => import('./pages/employees'));
const TripsPage = React.lazy(() => import('./pages/trips'));
const CarTypesPage = React.lazy(() => import('./pages/car-types'));
const CarsPage = React.lazy(() => import('./pages/cars'));
const LevelsPage = React.lazy(() => import('./pages/levels'));
const WalletsPage = React.lazy(() => import('./pages/wallets'));
const CodesPage = React.lazy(() => import('./pages/codes'));
const CouponsPage = React.lazy(() => import('./pages/coupons'));
const ReportsPage = React.lazy(() => import('./pages/reports'));
const PhoneNumber = React.lazy(() => import('./pages/phoneNumber'));
const Advertisement = React.lazy(() => import('./pages/advertisement'));
const Permission = React.lazy(() => import('./pages/permission'));
const Notification = React.lazy(() => import('./features/Notification/Notification'));
const Message = React.lazy(() => import('./features/messages/Message'));
const SettingsPage = React.lazy(() => import('./pages/settings'));


function App() {
  return (
    <Router>
      <div className="App" dir="rtl">
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={
              <ProtectedRoute>
                <Layout>
                  <DashboardPage />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/users" element={
              <ProtectedRoute>
                <Layout>
                  <UsersPage />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/drivers" element={
              <ProtectedRoute>
                <Layout>
                  <DriversPage />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/clients" element={
              <ProtectedRoute>
                <Layout>
                  <ClientsPage />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/employees" element={
              <ProtectedRoute>
                <Layout>
                  <EmployeesPage />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/trips" element={
              <ProtectedRoute>
                <Layout>
                  <TripsPage />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/car-types" element={
              <ProtectedRoute>
                <Layout>
                  <CarTypesPage />
                </Layout>
              </ProtectedRoute>
            } /> 
            <Route path="/cars" element={
              <ProtectedRoute>
                <Layout>
                  <CarsPage />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/levels" element={
              <ProtectedRoute>
                <Layout>
                  <LevelsPage />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/driver-details/:id" element={
              <ProtectedRoute>
                <Layout>
                  <DriverDetails />
                </Layout>
              </ProtectedRoute>
            } />

          <Route path="/driver" element={
              <Layout>
                <DriverDetails />
              </Layout>
            } />
            <Route path="/wallets" element={
              <ProtectedRoute>
                <Layout>
                  <WalletsPage />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/codes" element={
              <ProtectedRoute>
                <Layout>
                  <CodesPage />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/coupons" element={
              <ProtectedRoute>
                <Layout>
                  <CouponsPage />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/reports" element={
              <ProtectedRoute>
                <Layout>
                  <ReportsPage />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/phoneNumber" element={
              <ProtectedRoute>
                <Layout>
                  <PhoneNumber />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/advertisement" element={
              <ProtectedRoute>
                <Layout>
                  <Advertisement />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/permission" element={
              <ProtectedRoute>
                <Layout>
                  <Permission />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/verification-codes" element={
              <ProtectedRoute>
                <Layout>
                  <Verificationcodes />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/notification" element={
              <ProtectedRoute>
                <Layout>
                  <Notification />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/message" element={
              <ProtectedRoute>
                <Layout>
                  <Message />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <Layout>
                  <SettingsPage />
                </Layout>
              </ProtectedRoute>
            } />
          </Routes>
        </Suspense>
      </div>
    </Router>
  );
}

export default App;