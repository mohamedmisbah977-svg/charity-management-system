import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Download, ArrowRight, CheckCircle, Clock, XCircle } from 'lucide-react';
import caseService from '@/services/caseService';

export default function CycleDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cycle, setCycle] = useState<any>(null);
  const [summary, setSummary] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCycleDetails();
  }, [id]);

  const loadCycleDetails = async () => {
    setLoading(true);
    try {
      const res = await caseService.getCycleDetails(parseInt(id!));
      setCycle(res.data.cycle);
      setSummary(res.data.summary);
      setTransactions(res.data.transactions);
    } catch (error) {
      console.error('Error loading cycle details:', error);
      alert('حدث خطأ في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const response = await caseService.exportCycleToExcel(parseInt(id!));
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `cycle_${cycle?.year}_${cycle?.month}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting:', error);
      alert('حدث خطأ في تصدير البيانات');
    }
  };

  const monthNames = [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Delivered':
        return <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">تم التسليم</span>;
      case 'Pending':
        return <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">معلق</span>;
      case 'Missed':
        return <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">تم تفويته</span>;
      default:
        return <span>{status}</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">جاري التحميل...</div>
      </div>
    );
  }

  if (!cycle) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">الدورة غير موجودة</p>
        <button
          onClick={() => navigate('/monthly/cycles')}
          className="mt-4 text-primary hover:underline"
        >
          العودة إلى الدورات
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <button
            onClick={() => navigate('/monthly/cycles')}
            className="text-primary hover:text-primary-light flex items-center gap-1 mb-2"
          >
            <ArrowRight size={18} />
            العودة إلى الدورات
          </button>
          <h1 className="text-2xl font-bold">
            تفاصيل الدورة - {cycle.year} - {monthNames[cycle.month - 1]}
          </h1>
          <p className="text-gray-500">
            الحالة: {cycle.status === 'Open' ? 'مفتوحة' : 'مغلقة'}
          </p>
        </div>
        <button
          onClick={handleExport}
          className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700"
        >
          <Download size={18} />
          تصدير إلى Excel
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-md p-4 text-center">
          <div className="text-2xl font-bold text-primary">{summary?.total_transactions || 0}</div>
          <div className="text-sm text-gray-500">إجمالي المعاملات</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{summary?.delivered_count || 0}</div>
          <div className="text-sm text-gray-500">تم التسليم</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600">{summary?.pending_count || 0}</div>
          <div className="text-sm text-gray-500">معلق</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 text-center">
          <div className="text-2xl font-bold text-red-600">{summary?.missed_count || 0}</div>
          <div className="text-sm text-gray-500">تم تفويته</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 text-center">
          <div className="text-2xl font-bold text-primary">{summary?.total_amount?.toFixed(2) || 0} ج.م</div>
          <div className="text-sm text-gray-500">إجمالي المبلغ</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between text-sm mb-1">
          <span>نسبة الإنجاز</span>
          <span>{summary?.completion_percentage || 0}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div
            className="bg-green-600 rounded-full h-4 transition-all duration-500"
            style={{ width: `${summary?.completion_percentage || 0}%` }}
          />
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <h2 className="text-xl font-bold p-4 border-b">المعاملات</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right">#</th>
                <th className="px-6 py-3 text-right">رقم الملف</th>
                <th className="px-6 py-3 text-right">اسم المستفيد</th>
                <th className="px-6 py-3 text-right">رقم الهاتف</th>
                <th className="px-6 py-3 text-right">المبلغ</th>
                <th className="px-6 py-3 text-right">الحالة</th>
                <th className="px-6 py-3 text-right">تاريخ التسليم</th>
                <th className="px-6 py-3 text-right">بواسطة</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction, idx) => (
                <tr key={transaction.id} className="border-t hover:bg-gray-50">
                  <td className="px-6 py-4">{idx + 1}</td>
                  <td className="px-6 py-4">{transaction.case_file_number}</td>
                  <td className="px-6 py-4 font-medium">{transaction.case_name}</td>
                  <td className="px-6 py-4">{transaction.case_phone}</td>
                  <td className="px-6 py-4">{transaction.monthly_amount} ج.م</td>
                  <td className="px-6 py-4">{getStatusBadge(transaction.status)}</td>
                  <td className="px-6 py-4">{transaction.delivered_date || '-'}</td>
                  <td className="px-6 py-4">{transaction.delivered_by || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}