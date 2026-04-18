import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle, RefreshCw, Search } from 'lucide-react';
import caseService from '@/services/caseService';

export default function DeliveryPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedTransactions, setSelectedTransactions] = useState<number[]>([]);
  const queryClient = useQueryClient();

  // Get current cycle info - using getCurrentCycle
  const { data: cycleData } = useQuery({
    queryKey: ['current-cycle'],
    queryFn: () => caseService.getCurrentCycle(),
  });

  // Get current transactions - using getCurrentTransactions (not getCycleTransactions)
  const { data, refetch } = useQuery({
    queryKey: ['current-transactions', search, statusFilter],
    queryFn: () => caseService.getCurrentTransactions({
      search: search || undefined,
      status: statusFilter || undefined,
      size: 100
    }),
  });

  const deliverMutation = useMutation({
    mutationFn: (id: number) => caseService.markTransactionDelivered(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['current-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['current-cycle'] });
    },
  });

  const bulkDeliverMutation = useMutation({
    mutationFn: (ids: number[]) => caseService.bulkMarkDelivered(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['current-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['current-cycle'] });
      setSelectedTransactions([]);
    },
  });

  const currentCycle = cycleData?.data;
  const transactions = data?.data?.items || [];
  
  const stats = {
    total: transactions.length,
    pending: transactions.filter((t: any) => t.status === 'Pending').length,
    delivered: transactions.filter((t: any) => t.status === 'Delivered').length,
    missed: transactions.filter((t: any) => t.status === 'Missed').length,
  };

  const handleSelectAll = () => {
    const pendingTransactions = transactions.filter((t: any) => t.status === 'Pending');
    if (selectedTransactions.length === pendingTransactions.length) {
      setSelectedTransactions([]);
    } else {
      setSelectedTransactions(pendingTransactions.map((t: any) => t.id));
    }
  };

  const handleDeliver = (id: number) => {
    if (confirm('هل أنت متأكد من تسليم هذه المساعدة؟')) {
      deliverMutation.mutate(id);
    }
  };

  const handleBulkDeliver = () => {
    if (selectedTransactions.length === 0) {
      alert('الرجاء اختيار المعاملات المراد تسليمها');
      return;
    }
    if (confirm(`هل أنت متأكد من تسليم ${selectedTransactions.length} مساعدة؟`)) {
      bulkDeliverMutation.mutate(selectedTransactions);
    }
  };

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

  const pendingTransactions = transactions.filter((t: any) => t.status === 'Pending');

  if (!currentCycle) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">جاري تحميل البيانات...</p>
      </div>
    );
  }

  const monthNames = [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          تسليم المساعدات - {currentCycle.year} - {monthNames[currentCycle.month - 1]}
        </h1>
        <button onClick={() => refetch()} className="p-2 hover:bg-gray-100 rounded-lg">
          <RefreshCw size={20} />
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-md p-4 text-center">
          <div className="text-2xl font-bold text-primary">{stats.total}</div>
          <div className="text-sm text-gray-500">إجمالي الحالات</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          <div className="text-sm text-gray-500">معلق</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{stats.delivered}</div>
          <div className="text-sm text-gray-500">تم التسليم</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 text-center">
          <div className="text-2xl font-bold text-red-600">{stats.missed}</div>
          <div className="text-sm text-gray-500">تم تفويته</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">بحث</label>
            <div className="relative">
              <Search className="absolute right-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="بحث باسم المستفيد..."
                className="w-full pr-10 pl-4 py-2 border rounded-lg"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">الحالة</label>
            <select
              className="w-full px-3 py-2 border rounded-lg"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">الكل</option>
              <option value="Pending">معلق</option>
              <option value="Delivered">تم التسليم</option>
              <option value="Missed">تم تفويته</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedTransactions.length > 0 && (
        <div className="bg-blue-50 rounded-lg p-4 mb-4 flex justify-between items-center">
          <span>تم اختيار {selectedTransactions.length} معاملة</span>
          <button
            onClick={handleBulkDeliver}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            تسليم المختار
          </button>
        </div>
      )}

      {/* Transactions Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right">
                  <input
                    type="checkbox"
                    checked={selectedTransactions.length === pendingTransactions.length && pendingTransactions.length > 0}
                    onChange={handleSelectAll}
                    disabled={pendingTransactions.length === 0}
                  />
                </th>
                <th className="px-6 py-3 text-right">رقم الملف</th>
                <th className="px-6 py-3 text-right">اسم المستفيد</th>
                <th className="px-6 py-3 text-right">رقم الهاتف</th>
                <th className="px-6 py-3 text-right">المبلغ</th>
                <th className="px-6 py-3 text-right">الحالة</th>
                <th className="px-6 py-3 text-right">تاريخ التسليم</th>
                <th className="px-6 py-3 text-right">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction: any) => (
                <tr key={transaction.id} className="border-t hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedTransactions.includes(transaction.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedTransactions([...selectedTransactions, transaction.id]);
                        } else {
                          setSelectedTransactions(selectedTransactions.filter(id => id !== transaction.id));
                        }
                      }}
                      disabled={transaction.status !== 'Pending'}
                    />
                  </td>
                  <td className="px-6 py-4">{transaction.case_file_number}</td>
                  <td className="px-6 py-4 font-medium">{transaction.case_name}</td>
                  <td className="px-6 py-4">{transaction.case_phone}</td>
                  <td className="px-6 py-4">{Number(transaction.monthly_amount || 0).toFixed(2)} ج.م</td>
                  <td className="px-6 py-4">{getStatusBadge(transaction.status)}</td>
                  <td className="px-6 py-4">{transaction.delivered_date || '-'}</td>
                  <td className="px-6 py-4">
                    {transaction.status === 'Pending' && (
                      <button
                        onClick={() => handleDeliver(transaction.id)}
                        className="text-green-600 hover:text-green-800"
                        title="تسليم"
                      >
                        <CheckCircle size={18} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {transactions.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center mt-4">
          <p className="text-yellow-800">لا توجد معاملات. الرجاء توليد المعاملات أولاً من صفحة الدورات.</p>
        </div>
      )}
    </div>
  );
}