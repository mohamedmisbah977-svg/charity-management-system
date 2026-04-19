import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/authStore";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AppLayout from "@/components/layout/AppLayout";
import LoginPage from "@/pages/LoginPage";
import HomePage from "@/pages/HomePage";
import DashboardPage from "@/pages/DashboardPage";
import CasesListPage from "@/pages/CasesListPage";
import CaseFormPage from "@/pages/CaseFormPage";
import CaseDetailPage from "@/pages/CaseDetailPage";
import AidsListPage from "@/pages/AidsListPage";
import AddAidPage from "@/pages/AddAidPage";
import MonthlyCyclesPage from '@/pages/MonthlyCyclesPage';
import DeliveryPage from '@/pages/DeliveryPage';
import MonthlyDashboardPage from '@/pages/MonthlyDashboardPage';
import CycleDetailsPage from '@/pages/CycleDetailsPage';
import ReportsPage from '@/pages/ReportsPage';
import UsersPage from '@/pages/UsersPage';
import AuditLogsPage from '@/pages/AuditLogsPage';
import SettingsPage from '@/pages/SettingsPage';
import ProfilePage from '@/pages/ProfilePage';

function AppInitializer({ children }: { children: React.ReactNode }) {
  const { fetchMe } = useAuthStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        await fetchMe();
      } catch (error) {
        console.error('FetchMe error:', error);
        // Even if fetchMe fails, we should stop loading
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">جاري التحميل...</div>
      </div>
    );
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <AppInitializer>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          
          {/* Protected Routes - All Staff */}
          <Route element={<ProtectedRoute adminOnly={false} />}>
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/cases" element={<CasesListPage />} />
              <Route path="/cases/new" element={<CaseFormPage />} />
              <Route path="/cases/:id" element={<CaseDetailPage />} />
              <Route path="/cases/:id/edit" element={<CaseFormPage />} />
              <Route path="/aids" element={<AidsListPage />} />
              <Route path="/aids/create" element={<AddAidPage />} />
              <Route path="/aids/:id/edit" element={<AddAidPage />} />
              <Route path="/monthly/cycles" element={<MonthlyCyclesPage />} />
              <Route path="/monthly/delivery" element={<DeliveryPage />} />
              <Route path="/monthly/dashboard" element={<MonthlyDashboardPage />} />
              <Route path="/monthly/cycles/:id/details" element={<CycleDetailsPage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>
          </Route>

          {/* Protected Routes - Admin Only */}
          <Route element={<ProtectedRoute adminOnly={true} />}>
            <Route element={<AppLayout />}>
              <Route path="/users" element={<UsersPage />} />
              <Route path="/audit-logs" element={<AuditLogsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
          </Route>

          {/* 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppInitializer>
    </BrowserRouter>
  );
}