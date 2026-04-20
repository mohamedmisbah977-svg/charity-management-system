import { useState } from 'react';
import { X, Save } from 'lucide-react';
import caseService from '../../services/caseService';

interface Props {
  caseId: number;
  onClose: () => void;
  onSuccess: () => void;
}

export default function WorkRecordsModal({ caseId, onClose, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    person_type: '',
    employer_name: '',
    employer_address: '',
    employer_phone: '',
    job_title: '',
    monthly_salary: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await caseService.createWorkRecord(caseId, {
        ...formData,
        monthly_salary: formData.monthly_salary ? parseFloat(formData.monthly_salary) : undefined,
      });
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving work record:', error);
      alert('حدث خطأ في حفظ البيانات');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold">إضافة سجل عمل</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">نوع الشخص *</label>
            <select
              required
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-primary"
              value={formData.person_type}
              onChange={(e) => setFormData({ ...formData, person_type: e.target.value })}
            >
              <option value="">اختر</option>
              <option value="الأب">الأب</option>
              <option value="الأم">الأم</option>
              <option value="المستفيد">المستفيد</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">اسم جهة العمل</label>
            <input
              type="text"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-primary"
              value={formData.employer_name}
              onChange={(e) => setFormData({ ...formData, employer_name: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">عنوان جهة العمل</label>
            <input
              type="text"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-primary"
              value={formData.employer_address}
              onChange={(e) => setFormData({ ...formData, employer_address: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">هاتف جهة العمل</label>
            <input
              type="tel"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-primary"
              value={formData.employer_phone}
              onChange={(e) => setFormData({ ...formData, employer_phone: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">المسمى الوظيفي</label>
            <input
              type="text"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-primary"
              value={formData.job_title}
              onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">الراتب الشهري</label>
            <input
              type="number"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-primary"
              value={formData.monthly_salary}
              onChange={(e) => setFormData({ ...formData, monthly_salary: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-light flex items-center gap-2"
            >
              <Save size={18} />
              {loading ? 'جاري الحفظ..' : 'حفظ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}