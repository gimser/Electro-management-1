import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'danger' | 'warning' | 'info';
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'تأكيد',
  cancelText = 'إلغاء',
  onConfirm,
  onCancel,
  variant = 'danger'
}) => {
  if (!isOpen) return null;

  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          icon: <AlertTriangle className="text-red-500" size={32} />,
          button: 'bg-red-600 hover:bg-red-700 shadow-red-200',
          bg: 'bg-red-50'
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="text-amber-500" size={32} />,
          button: 'bg-amber-600 hover:bg-amber-700 shadow-amber-200',
          bg: 'bg-amber-50'
        };
      default:
        return {
          icon: <AlertTriangle className="text-blue-500" size={32} />,
          button: 'bg-blue-600 hover:bg-blue-700 shadow-blue-200',
          bg: 'bg-blue-50'
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden"
        >
          <div className="p-8 flex flex-col items-center text-center">
            <div className={`w-16 h-16 ${styles.bg} rounded-3xl flex items-center justify-center mb-6`}>
              {styles.icon}
            </div>
            
            <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">{title}</h3>
            <p className="text-slate-500 font-bold text-sm leading-relaxed mb-8">
              {message}
            </p>

            <div className="flex gap-3 w-full">
              <button
                onClick={onConfirm}
                className={`flex-1 ${styles.button} text-white font-black py-4 rounded-2xl shadow-lg transition-all active:scale-95`}
              >
                {confirmText}
              </button>
              <button
                onClick={onCancel}
                className="flex-1 bg-slate-100 text-slate-600 font-black py-4 rounded-2xl hover:bg-slate-200 transition-all active:scale-95"
              >
                {cancelText}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ConfirmModal;
