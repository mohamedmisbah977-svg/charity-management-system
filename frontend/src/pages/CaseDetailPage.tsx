import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Edit, Trash2, UserPlus, Briefcase, Gift, Printer } from 'lucide-react';
import caseService, { Case, FamilyMember, WorkRecord } from '@/services/caseService';
import FamilyMembersModal from '@/components/cases/FamilyMembersModal';
import WorkRecordsModal from '@/components/cases/WorkRecordsModal';
import { Link } from 'react-router-dom'; // ← Add this if not already there


export default function CaseDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [workRecords, setWorkRecords] = useState<WorkRecord[]>([]);
  const [aids, setAids] = useState<any[]>([]);  // ← ADD THIS
  const [showFamilyModal, setShowFamilyModal] = useState(false);
  const [showWorkModal, setShowWorkModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [caseRes, familyRes, workRes, aidsRes] = await Promise.all([
        caseService.getCase(parseInt(id!)),
        caseService.getFamilyMembers(parseInt(id!)),
        caseService.getWorkRecords(parseInt(id!)),
        caseService.getAids({ case_id: parseInt(id!), size: 100 }), // ← ADD THIS
      ]);
      setCaseData(caseRes.data);
      setFamilyMembers(familyRes.data);
      setWorkRecords(workRes.data);
      setAids(aidsRes.data?.items || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (confirm('هل أنت متأكد من حذف هذه الحالة؟')) {
      await caseService.deleteCase(parseInt(id!));
      navigate('/cases');
    }
  };

  const handlePrintReceipt = async (aidId: number) => {
    try {
      const res = await caseService.getAidReceipt(aidId);
      const receipt = res.data;
      
      const printWindow = window.open('', '_blank', 'width=800,height=600');
      if (!printWindow) {
        alert('الرجاء السماح للنوافذ المنبثقة');
        return;
      }
      
      printWindow.document.write(printReceiptHTML(receipt));
      printWindow.document.close();
      printWindow.focus();
      
      printWindow.onload = () => {
        printWindow.print();
      };
    } catch (error) {
      console.error('Error printing receipt:', error);
      alert('حدث خطأ في طباعة الإيصال');
    }
  };

  const printReceiptHTML = (receipt: any) => {
    return `
      <!DOCTYPE html>
      <html dir="rtl">
      <head>
        <title>إيصال مساعدة - ${receipt.receipt_number}</title>
        <meta charset="UTF-8">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Arial', sans-serif; margin: 20px; }
          .receipt { max-width: 600px; margin: 0 auto; background: white; border: 1px solid #ddd; }
          .header { text-align: center; border-bottom: 3px solid #2C3E50; padding: 20px; background: #f8f9fa; }
          .title { font-size: 24px; font-weight: bold; color: #2C3E50; }
          .subtitle { color: #666; margin-top: 5px; }
          .receipt-title { background: #2C3E50; color: white; text-align: center; padding: 10px; }
          .content { padding: 20px; }
          .info-row { display: flex; justify-content: space-between; margin-bottom: 12px; padding: 8px; border-bottom: 1px dashed #eee; }
          .label { font-weight: bold; color: #555; }
          .amount { font-size: 20px; font-weight: bold; color: #27AE60; }
          .footer { text-align: center; border-top: 1px solid #ddd; padding: 15px; background: #f8f9fa; font-size: 12px; }
          .signature { margin-top: 30px; display: flex; justify-content: space-between; padding: 0 20px 20px 20px; }
          .signature-text { margin-top: 40px; font-size: 12px; color: #666; }
          @media print { body { margin: 0; } .no-print { display: none; } }
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="header">
            <div class="title">جمعية النور المحمدي</div>
            <div class="subtitle">إيصال مساعدة</div>
          </div>
          <div class="receipt-title">${receipt.aid_type === 'مساعدات مالية' ? 'إيصال صرف مساعدة مالية' : 'إيصال استلام مساعدة عينية'}</div>
          <div class="content">
            <div class="info-row"><span class="label">رقم الإيصال:</span><span>${receipt.receipt_number}</span></div>
            <div class="info-row"><span class="label">التاريخ:</span><span>${receipt.receipt_date}</span></div>
            <div class="info-row"><span class="label">اسم المستفيد:</span><span>${receipt.case_name}</span></div>
            <div class="info-row"><span class="label">رقم الملف:</span><span>${receipt.case_file_number}</span></div>
            <div class="info-row"><span class="label">رقم الهاتف:</span><span>${receipt.case_phone}</span></div>
            ${receipt.amount ? `<div class="info-row"><span class="label">المبلغ:</span><span class="amount">${receipt.amount} ج.م</span></div>` : ''}
            ${receipt.quantity_or_description ? `<div class="info-row"><span class="label">الوصف:</span><span>${receipt.quantity_or_description}</span></div>` : ''}
            <div class="info-row"><span class="label">بواسطة:</span><span>${receipt.registered_by}</span></div>
          </div>
          <div class="signature">
            <div>_________________<div class="signature-text">توقيع المستلم</div></div>
            <div>_________________<div class="signature-text">ختم الجمعية</div></div>
          </div>
          <div class="footer">0123456789 | info@charity.org</div>
        </div>
        <div class="no-print" style="text-align:center; margin-top:20px;">
          <button onclick="window.print()" style="padding:10px 20px;margin:5px;background:#2C3E50;color:white;border:none;border-radius:5px;">طباعة</button>
          <button onclick="window.close()" style="padding:10px 20px;margin:5px;background:#ccc;border:none;border-radius:5px;">إغلاق</button>
        </div>
      </body>
      </html>
    `;
  };

  const totalIncome = (caseData?.family_income || 0) + 
                       (caseData?.property_rental_income || 0) + 
                       (caseData?.other_income || 0);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">جاري التحميل...</div>
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">الحالة غير موجودة</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">{caseData.full_name}</h1>
          <p className="text-gray-500">رقم الملف: {caseData.file_number}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate(`/cases/${id}/edit`)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            <Edit size={18} />
            تعديل
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
          >
            <Trash2 size={18} />
            حذف
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info - Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4 border-b pb-2">المعلومات الشخصية</h2>
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-sm text-gray-500">الاسم الكامل</p><p className="font-medium">{caseData.full_name}</p></div>
              <div><p className="text-sm text-gray-500">رقم الهاتف 1</p><p className="font-medium">{caseData.phone_number_1}</p></div>
              {caseData.phone_number_2 && <div><p className="text-sm text-gray-500">رقم الهاتف 2</p><p className="font-medium">{caseData.phone_number_2}</p></div>}
              <div><p className="text-sm text-gray-500">المدينة</p><p className="font-medium">{caseData.city}</p></div>
              {caseData.country && <div><p className="text-sm text-gray-500">الدولة</p><p className="font-medium">{caseData.country}</p></div>}
              {caseData.street_address && <div className="col-span-2"><p className="text-sm text-gray-500">العنوان</p><p className="font-medium">{caseData.street_address}</p></div>}
            </div>
          </div>

          {/* Housing & Income */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4 border-b pb-2">السكن والدخل</h2>
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-sm text-gray-500">نوع السكن</p><p className="font-medium">{caseData.housing_type}</p></div>
              <div><p className="text-sm text-gray-500">تاريخ الانضمام</p><p className="font-medium">{caseData.join_date}</p></div>
              <div><p className="text-sm text-gray-500">دخل الأسرة</p><p className="font-medium">{caseData.family_income} ج.م</p></div>
              <div><p className="text-sm text-gray-500">دخل الإيجار</p><p className="font-medium">{caseData.property_rental_income} ج.م</p></div>
              <div><p className="text-sm text-gray-500">دخل آخر</p><p className="font-medium">{caseData.other_income} ج.م</p></div>
              <div><p className="text-sm text-gray-500">إجمالي الدخل</p><p className="font-bold text-primary">{totalIncome} ج.م</p></div>
              {caseData.receives_government_aid && <div className="col-span-2"><p className="text-sm text-gray-500">مساعدات حكومية</p><p className="font-medium">{caseData.government_aid_organization || 'نعم'}</p></div>}
            </div>
          </div>

          {/* Monthly Aid */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4 border-b pb-2">المساعدات الشهرية</h2>
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-sm text-gray-500">مساعدات شهرية</p><p className="font-medium">{caseData.is_monthly_aid ? 'نعم' : 'لا'}</p></div>
              {caseData.is_monthly_aid && <div><p className="text-sm text-gray-500">المبلغ الشهري</p><p className="font-bold text-primary">{caseData.monthly_aid_amount} ج.م</p></div>}
            </div>
          </div>

          {/* Notes */}
          {caseData.notes && <div className="bg-white rounded-lg shadow-md p-6"><h2 className="text-xl font-bold mb-4 border-b pb-2">ملاحظات</h2><p>{caseData.notes}</p></div>}
        </div>

        {/* Right Column - Family, Work, and Aids */}
        <div className="space-y-6">
          {/* Family Members */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4 border-b pb-2">
              <h2 className="text-xl font-bold">أفراد الأسرة</h2>
              <button onClick={() => setShowFamilyModal(true)} className="text-primary hover:text-primary-light flex items-center gap-1">
                <UserPlus size={18} /> إضافة
              </button>
            </div>
            {familyMembers.length === 0 ? <p className="text-gray-500 text-center py-4">لا يوجد أفراد أسرة</p> : (
              <div className="space-y-3">
                {familyMembers.map((member) => (
                  <div key={member.id} className="border rounded-lg p-3">
                    <p className="font-bold">{member.name}</p>
                    <p className="text-sm text-gray-500">الصلة: {member.member_relationship || member.member_relationship}</p>
                    {member.age && <p className="text-sm">العمر: {member.age} سنة</p>}
                    {member.marital_status && <p className="text-sm">الحالة الاجتماعية: {member.marital_status}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Work Records */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4 border-b pb-2">
              <h2 className="text-xl font-bold">سجل العمل</h2>
              <button onClick={() => setShowWorkModal(true)} className="text-primary hover:text-primary-light flex items-center gap-1">
                <Briefcase size={18} /> إضافة
              </button>
            </div>
            {workRecords.length === 0 ? <p className="text-gray-500 text-center py-4">لا يوجد سجل عمل</p> : (
              <div className="space-y-3">
                {workRecords.map((work) => (
                  <div key={work.id} className="border rounded-lg p-3">
                    <p className="font-bold">{work.job_title || 'وظيفة'}</p>
                    <p className="text-sm text-gray-500">جهة العمل: {work.employer_name}</p>
                    {work.monthly_salary && <p className="text-sm">الراتب: {work.monthly_salary} ج.م</p>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Aids History - NEW SECTION */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4 border-b pb-2">
              <h2 className="text-xl font-bold">المساعدات السابقة</h2>
              <Link to={`/aids/create?caseId=${caseData.id}`} className="text-primary hover:text-primary-light flex items-center gap-1">
                <Gift size={18} /> إضافة مساعدة
              </Link>
            </div>
            {aids.length === 0 ? (
              <p className="text-gray-500 text-center py-4">لا توجد مساعدات سابقة</p>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {aids.map((aid) => (
                  <div key={aid.id} className="border rounded-lg p-3 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-primary">{aid.aid_type_name}</p>
                        <p className="text-sm text-gray-500">التاريخ: {aid.aid_date}</p>
                        {aid.amount ? (
                          <p className="text-sm font-bold text-green-600">{aid.amount} ج.م</p>
                        ) : (
                          <p className="text-sm">{aid.quantity_or_description}</p>
                        )}
                        {aid.notes && <p className="text-xs text-gray-400 mt-1">{aid.notes}</p>}
                      </div>
                      <button
                        onClick={() => handlePrintReceipt(aid.id)}
                        className="text-blue-600 hover:text-blue-800"
                        title="طباعة الإيصال"
                      >
                        <Printer size={16} />
                      </button>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">بواسطة: {aid.registered_by_name}</p>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-3 pt-2 border-t text-center">
              <Link to={`/aids?case_id=${caseData.id}`} className="text-sm text-primary hover:underline">
                عرض جميع المساعدات
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showFamilyModal && <FamilyMembersModal caseId={parseInt(id!)} onClose={() => setShowFamilyModal(false)} onSuccess={loadData} />}
      {showWorkModal && <WorkRecordsModal caseId={parseInt(id!)} onClose={() => setShowWorkModal(false)} onSuccess={loadData} />}
    </div>
  );
}