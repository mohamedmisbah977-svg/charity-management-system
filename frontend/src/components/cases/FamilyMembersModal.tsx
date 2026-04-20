import { useState } from 'react';
import { X, Save } from 'lucide-react';
import caseService from '../../services/caseService';

interface Props {
  caseId: number;
  onClose: () => void;
  onSuccess: () => void;
}

export default function FamilyMembersModal({ caseId, onClose, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    marital_status: '',
    school_or_university: '',
    member_relationship: '',  // ← MUST be member_relationship
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await caseService.createFamilyMember(caseId, {
        name: formData.name,
        age: formData.age ? parseInt(formData.age) : undefined,
        marital_status: formData.marital_status,
        school_or_university: formData.school_or_university,
        member_relationship: formData.member_relationship,  // ← MUST be member_relationship
        notes: formData.notes,
      });
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving family member:', error);
      alert('حدث خطأ في حفظ البيانات');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold">إضافة فرد أسرة</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">الاسم *</label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-primary"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">الصلة بالحالة *</label>
            <select
              required
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-primary"
              value={formData.member_relationship}  // ← MUST be member_relationship
              onChange={(e) => setFormData({ ...formData, member_relationship: e.target.value })}  // ← MUST be member_relationship
            >
              <option value="">اختر</option>
              <option value="أب">أب</option>
              <option value="أم">أم</option>
              <option value="ابن">ابن</option>
              <option value="ابنة">ابنة</option>
              <option value="زوج">زوج</option>
              <option value="زوجة">زوجة</option>
              <option value="أخ">أخ</option>
              <option value="أخت">أخت</option>
              <option value="أخرى">أخرى</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">العمر</label>
            <input
              type="number"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-primary"
              value={formData.age}
              onChange={(e) => setFormData({ ...formData, age: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">الحالة الاجتماعية</label>
            <select
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-primary"
              value={formData.marital_status}
              onChange={(e) => setFormData({ ...formData, marital_status: e.target.value })}
            >
              <option value="">اختر</option>
              <option value="أعزب">أعزب</option>
              <option value="متزوج">متزوج</option>
              <option value="مطلق">مطلق</option>
              <option value="أرمل">أرمل</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">المدرسة/الجامعة</label>
            <input
              type="text"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-primary"
              value={formData.school_or_university}
              onChange={(e) => setFormData({ ...formData, school_or_university: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">ملاحظات</label>
            <textarea
              rows={2}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-primary"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
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
              {loading ? 'جاري الحفظ...' : 'حفظ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}