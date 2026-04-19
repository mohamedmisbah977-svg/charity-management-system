import { useState } from 'react';
import { X, Copy, Check, Phone, Landmark, Smartphone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DonationModal({ isOpen, onClose }: DonationModalProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const donationMethods = [
    {
      id: 'vodafone',
      title: 'فودافون كاش',
      icon: Smartphone,
      details: [
        { label: 'رقم المحفظة', value: '01012345678' },
        { label: 'الاسم', value: 'جمعية النور المحمدي' },
      ],
      instruction: 'يمكنك التبرع عن طريق إرسال المبلغ إلى رقم المحفظة أعلاه'
    },
    {
      id: 'instapay',
      title: 'إنستا باي',
      icon: Landmark,
      details: [
        { label: 'رقم الحساب', value: '123456789012345' },
        { label: 'البنك', value: 'البنك الأهلي المصري' },
        { label: 'اسم الحساب', value: 'جمعية النور المحمدي' },
      ],
      instruction: 'يمكنك التبرع عبر تطبيق إنستا باي باستخدام رقم الحساب أعلاه'
    },
    {
      id: 'bank',
      title: 'تحويل بنكي',
      icon: Landmark,
      details: [
        { label: 'اسم البنك', value: 'البنك الأهلي المصري' },
        { label: 'رقم الحساب', value: '123456789012345' },
        { label: 'IBAN', value: 'EG1234567890123456789' },
        { label: 'اسم المستفيد', value: 'جمعية النور المحمدي' },
      ],
      instruction: 'يمكنك التحويل البنكي إلى الحساب أعلاه'
    }
  ];

  const copyToClipboard = async (text: string, fieldId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldId);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 z-50"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-white rounded-2xl shadow-2xl z-50 overflow-hidden max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-primary-900 to-primary-800 px-6 py-4 text-white flex justify-between items-center sticky top-0">
              <div>
                <h2 className="text-xl font-bold">تبرع الآن</h2>
                <p className="text-sm text-gray-300 mt-1">اختر طريقة التبرع المناسبة لك</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="space-y-6">
                {donationMethods.map((method) => (
                  <div key={method.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                        <method.icon size={20} className="text-primary" />
                      </div>
                      <h3 className="text-lg font-bold text-primary-900">{method.title}</h3>
                    </div>
                    
                    <div className="space-y-3">
                      {method.details.map((detail, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                          <span className="text-sm text-gray-600">{detail.label}:</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-800 dir-ltr">{detail.value}</span>
                            <button
                              onClick={() => copyToClipboard(detail.value, `${method.id}-${idx}`)}
                              className="p-1 hover:bg-gray-200 rounded transition-colors"
                            >
                              {copiedField === `${method.id}-${idx}` ? (
                                <Check size={16} className="text-green-600" />
                              ) : (
                                <Copy size={16} className="text-gray-400" />
                              )}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <p className="text-xs text-gray-500 mt-3 pt-3 border-t border-gray-100">
                      {method.instruction}
                    </p>
                  </div>
                ))}
              </div>

              {/* Footer Note */}
              <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm text-green-800 text-center">
                  جزاكم الله خيراً على تبرعاتكم الكريمة
                </p>
                <p className="text-xs text-green-600 text-center mt-1">
                  جميع التبرعات مسجلة وتستخدم لمساعدة المحتاجين
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}