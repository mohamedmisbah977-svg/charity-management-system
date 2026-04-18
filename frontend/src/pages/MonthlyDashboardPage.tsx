import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Calendar, Users, DollarSign, CheckCircle, Clock, XCircle, TrendingUp } from 'lucide-react';
import caseService from '@/services/caseService';

export default function MonthlyDashboardPage() {
  const { data, refetch } = useQuery({
    queryKey: ['monthly-dashboard'],
    queryFn: () => caseService.getMonthlyDashboard(),
  });

  const stats = data?.data || {
    total_monthly_cases: 0,
    current_cycle_id: null,
    current_cycle_name: null,
    current_cycle_status: null,
    current_cycle_total_transactions: 0,
    current_cycle_total_amount: 0,
    current_cycle_delivered_count: 0,
    current_cycle_pending_count: 0,
    current_cycle_missed_count: 0,
    current_cycle_completion_percentage: 0,
  };

  const completionPercentage = stats.current_cycle_completion_percentage || 0;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">لوحة التحكم - المساعدات الشهرية</h1>
        <button
          onClick={() => refetch()}
          className="text-primary hover:text-primary-light"
        >
          تحديث
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-full">
              <Users size={24} className="text-primary" />
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.total_monthly_cases}</div>
              <div className="text-sm text-gray-500">حالات المساعدات الشهرية</div>
            </div>
          </div>
        </div>

        {stats.current_cycle_id && (
          <>
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-full">
                  <Calendar size={24} className="text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.current_cycle_name}</div>
                  <div className="text-sm text-gray-500">الدورة الحالية</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-100 rounded-full">
                  <DollarSign size={24} className="text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{Number(stats.current_cycle_total_amount || 0).toFixed(2)} ج.م</div>
                  <div className="text-sm text-gray-500">إجمالي المبلغ</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-100 rounded-full">
                  <TrendingUp size={24} className="text-purple-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{completionPercentage}%</div>
                  <div className="text-sm text-gray-500">نسبة الإنجاز</div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Current Cycle Progress */}
      {stats.current_cycle_id && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">تقدم الدورة الحالية</h2>
          
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-1">
              <span>نسبة التسليم</span>
              <span>{completionPercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className="bg-green-600 rounded-full h-4 transition-all duration-500"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>

          {/* Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <CheckCircle size={32} className="text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-600">{stats.current_cycle_delivered_count}</div>
              <div className="text-sm text-gray-600">تم التسليم</div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4 text-center">
              <Clock size={32} className="text-yellow-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-yellow-600">{stats.current_cycle_pending_count}</div>
              <div className="text-sm text-gray-600">معلق</div>
            </div>
            <div className="bg-red-50 rounded-lg p-4 text-center">
              <XCircle size={32} className="text-red-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-red-600">{stats.current_cycle_missed_count}</div>
              <div className="text-sm text-gray-600">تم تفويته</div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          to="/monthly/cycles"
          className="bg-primary text-white rounded-lg p-6 text-center hover:bg-primary-light transition-colors"
        >
          <Calendar size={32} className="mx-auto mb-2" />
          <h3 className="text-lg font-bold">إدارة الدورة الحالية</h3>
          <p className="text-sm opacity-90">توليد المعاملات وإغلاق الدورة</p>
        </Link>
        
        <Link
          to="/monthly/delivery"
          className="bg-secondary text-white rounded-lg p-6 text-center hover:bg-secondary-dark transition-colors"
        >
          <CheckCircle size={32} className="mx-auto mb-2" />
          <h3 className="text-lg font-bold">تسليم المساعدات</h3>
          <p className="text-sm opacity-90">تسجيل تسليم المساعدات للدورة الحالية</p>
        </Link>
      </div>

      {/* No Active Cycle Message */}
      {!stats.current_cycle_id && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center mt-6">
          <Calendar size={48} className="text-yellow-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-yellow-800 mb-2">لا توجد دورة مفتوحة</h3>
          <p className="text-yellow-700">
            سيتم إنشاء دورة تلقائياً للشهر الحالي عند البدء.
          </p>
        </div>
      )}
    </div>
  );
}