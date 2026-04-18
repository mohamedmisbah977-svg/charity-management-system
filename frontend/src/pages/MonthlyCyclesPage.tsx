import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { RefreshCw, Lock, Unlock, History, CheckCircle } from 'lucide-react';
import caseService from '@/services/caseService';

export default function MonthlyCyclesPage() {
  const [showHistory, setShowHistory] = useState(false);
  const queryClient = useQueryClient();

  // Get current cycle
  const { data: currentCycleData, refetch: refetchCurrent } = useQuery({
    queryKey: ['current-cycle'],
    queryFn: () => caseService.getCurrentCycle(),
  });

  // Get history cycles
  const { data: historyData } = useQuery({
    queryKey: ['cycle-history'],
    queryFn: () => caseService.getCycleHistory(),
    enabled: showHistory,
  });

  const currentCycle = currentCycleData?.data;

  const generateMutation = useMutation({
    mutationFn: () => caseService.generateCurrentCycleTransactions(),
    onSuccess: (response: any) => {
      queryClient.invalidateQueries({ queryKey: ['current-cycle'] });
      alert(response.data?.message || 'تم توليد المعاملات بنجاح');
    },
    onError: (error: any) => {
      alert(error.response?.data?.detail || 'حدث خطأ في توليد المعاملات');
    }
  });

  const openMutation = useMutation({
    mutationFn: () => caseService.openCurrentCycle(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['current-cycle'] });
      alert('تم فتح الدورة بنجاح');
    },
    onError: (error: any) => {
      alert(error.response?.data?.detail || 'حدث خطأ في فتح الدورة');
    }
  });

  const closeMutation = useMutation({
    mutationFn: () => caseService.closeCurrentCycle(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['current-cycle'] });
      alert('تم إغلاق الدورة بنجاح');
    },
    onError: (error: any) => {
      alert(error.response?.data?.detail || 'حدث خطأ في إغلاق الدورة');
    }
  });

  const monthNames = [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
  ];

  const currentMonthName = currentCycle ? monthNames[currentCycle.month - 1] : '';

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">الدورة الشهرية الحالية</h1>
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="text-primary hover:text-primary-light flex items-center gap-2"
        >
          <History size={18} />
          {showHistory ? 'إخفاء السجل' : 'عرض السجل'}
        </button>
      </div>

      {/* Current Cycle Card */}
      {currentCycle && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <div className={`p-4 text-white ${currentCycle.status === 'Open' ? 'bg-green-600' : 'bg-gray-600'}`}>
            <h2 className="text-xl font-bold">{currentCycle.year} - {currentMonthName}</h2>
            <p className="text-sm opacity-90">
              {currentCycle.status === 'Open' ? 'مفتوحة' : 'مغلقة'}
            </p>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{currentCycle.total_transactions || 0}</div>
                <div className="text-sm text-gray-500">إجمالي المعاملات</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{currentCycle.delivered_count || 0}</div>
                <div className="text-sm text-gray-500">تم التسليم</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{currentCycle.pending_count || 0}</div>
                <div className="text-sm text-gray-500">معلق</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {Number(currentCycle.total_amount || 0).toFixed(2)} ج.م
                </div>
                <div className="text-sm text-gray-500">إجمالي المبلغ</div>
              </div>
            </div>

            {/* BUTTONS SECTION - Make sure this is here */}
            <div className="flex flex-wrap gap-3">
              {currentCycle.status === 'Closed' && (
                <button
                  onClick={() => openMutation.mutate()}
                  disabled={openMutation.isPending}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700"
                >
                  <Unlock size={18} />
                  {openMutation.isPending ? 'جاري الفتح...' : 'فتح الدورة'}
                </button>
              )}
              
              {currentCycle.status === 'Open' && (
                <button
                  onClick={() => generateMutation.mutate()}
                  disabled={generateMutation.isPending}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
                >
                  <RefreshCw size={18} />
                  {generateMutation.isPending ? 'جاري التوليد...' : 'توليد المعاملات'}
                </button>
              )}
              
              {currentCycle.status === 'Open' && currentCycle.total_transactions > 0 && (
                <button
                  onClick={() => window.location.href = '/monthly/delivery'}
                  className="bg-secondary text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-secondary-dark"
                >
                  <CheckCircle size={18} />
                  تسجيل التسليمات
                </button>
              )}
              
              {currentCycle.status === 'Open' && (
                <button
                  onClick={() => {
                    if (confirm('هل أنت متأكد من إغلاق الدورة الحالية؟')) {
                      closeMutation.mutate();
                    }
                  }}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-red-700"
                >
                  <Lock size={18} />
                  إغلاق الدورة
                </button>
              )}
            </div>

            {currentCycle.status === 'Closed' && currentCycle.total_transactions === 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
                <p className="text-yellow-800 text-sm">
                  الدورة مغلقة. اضغط على <strong>"فتح الدورة"</strong> لبدء الدورة الحالية، ثم <strong>"توليد المعاملات"</strong> لإنشاء المعاملات.
                </p>
              </div>
            )}

            {currentCycle.status === 'Open' && currentCycle.total_transactions === 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
                <p className="text-yellow-800 text-sm">
                  لا توجد معاملات بعد. اضغط على <strong>"توليد المعاملات"</strong> لإنشاء معاملات للحالات التي لديها مساعدات شهرية مفعلة.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* History Section */}
      {showHistory && historyData?.data?.items && historyData.data.items.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">الدورات السابقة</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-right">الدورة</th>
                  <th className="px-4 py-2 text-right">عدد المعاملات</th>
                  <th className="px-4 py-2 text-right">إجمالي المبلغ</th>
                  <th className="px-4 py-2 text-right">تم التسليم</th>
                  <th className="px-4 py-2 text-right">الإجراءات</th>  {/* ← ADD THIS COLUMN */}
                </tr>
              </thead>
              <tbody>
                {historyData.data.items.map((cycle: any) => (
                  <tr key={cycle.id} className="border-t">
                    <td className="px-4 py-2">{cycle.year} - {monthNames[cycle.month - 1]}</td>
                    <td className="px-4 py-2">{cycle.total_transactions}</td>
                    <td className="px-4 py-2">{Number(cycle.total_amount || 0).toFixed(2)} ج.م</td>
                    <td className="px-4 py-2 text-green-600">{cycle.delivered_count}</td>
                    <td className="px-4 py-2">  {/* ← ADD THIS CELL */}
                <button
                  onClick={() => window.location.href = `/monthly/cycles/${cycle.id}/details`}
                  className="text-blue-600 hover:text-blue-800"
                            >
                                  عرض التفاصيل
                </button>
                    </td>
                </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}