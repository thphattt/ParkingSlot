import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useAuthStore from './stores/authStore';
import LoginPage from './pages/auth/LoginPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import ProtectedRoute from './routes/ProtectedRoute';
import RoleRoute from './routes/RoleRoute';
import MainLayout from './components/layout/MainLayout';
import ResidentsPage from './pages/residents/ResidentsPage';
import VehiclesPage from './pages/vehicles/VehiclesPage';
import ParkingSlotsPage from './pages/parking-slots/ParkingSlotsPage';
import ContractsPage from './pages/contracts/ContractsPage';
import ParkingLogsPage from './pages/parking-logs/ParkingLogsPage';
import PaymentsPage from './pages/payments/PaymentsPage';
import ReportsPage from './pages/reports/ReportsPage';
import NotificationsPage from './pages/notifications/NotificationsPage';
import SettingsPage from './pages/settings/SettingsPage';

function App() {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        {/* Public */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected — tất cả dùng chung MainLayout */}
        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<DashboardPage />} />

          {/* Admin + Security */}
          <Route path="/residents" element={<ResidentsPage />} />
          <Route path="/vehicles" element={<VehiclesPage />} />
          <Route path='/parking-slots' element={<ParkingSlotsPage />} />
          <Route path='/parking-logs' element={<ParkingLogsPage />} />
          <Route path='/notifications' element={<NotificationsPage />} />
          <Route path='/settings' element={<SettingsPage />} />

          {/* Admin only — Bảo vệ gõ thẳng URL sẽ bị redirect về Dashboard */}
          <Route path='/contracts' element={
            <RoleRoute allowedRoles={['admin']}><ContractsPage /></RoleRoute>
          } />
          <Route path='/payments' element={
            <RoleRoute allowedRoles={['admin']}><PaymentsPage /></RoleRoute>
          } />
          <Route path='/reports' element={
            <RoleRoute allowedRoles={['admin']}><ReportsPage /></RoleRoute>
          } />
          {/* Sẽ thêm các route khác ở đây */}
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;