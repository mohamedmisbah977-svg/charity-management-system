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
import AidsListPage from "@/pages/AidsListPage";  // ← ADD THIS
import AddAidPage from "@/pages/AddAidPage";      // ← ADD THIS
import MonthlyCyclesPage from '@/pages/MonthlyCyclesPage';
import DeliveryPage from '@/pages/DeliveryPage';
import MonthlyDashboardPage from '@/pages/MonthlyDashboardPage';
import CycleDetailsPage from '@/pages/CycleDetailsPage';

function AppInitializer({ children }: { children: React.ReactNode }) {
  const { fetchMe, initialized } = useAuthStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      await fetchMe();
      setLoading(false);
    };
    init();
  }, []);

  if (!initialized && loading) {
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
          
          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/cases" element={<CasesListPage />} />
              <Route path="/cases/new" element={<CaseFormPage />} />
              <Route path="/cases/:id" element={<CaseDetailPage />} />
              <Route path="/cases/:id/edit" element={<CaseFormPage />} />
              
              {/* Aids Routes - ADD THESE LINES */}
              <Route path="/aids" element={<AidsListPage />} />
              <Route path="/aids/create" element={<AddAidPage />} />
              <Route path="/aids/:id/edit" element={<AddAidPage />} />
              <Route path="/monthly/cycles" element={<MonthlyCyclesPage />} />
              <Route path="/monthly/delivery" element={<DeliveryPage />} />
              <Route path="/monthly/dashboard" element={<MonthlyDashboardPage />} />
              <Route path="/monthly/cycles/:id/details" element={<CycleDetailsPage />} />
            </Route>
          </Route>

          {/* 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppInitializer>
    </BrowserRouter>
  );
}