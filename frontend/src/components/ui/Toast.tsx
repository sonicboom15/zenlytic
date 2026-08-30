import React from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

export interface ToastProps {
  toast: ToastItem;
  onDismiss: (id: string) => void;
}

const toastStyles: Record<ToastType, { bg: string; border: string; text: string; icon: React.ReactNode }> = {
  success: {
    bg: 'bg-white',
    border: 'border-emerald-200',
    text: 'text-emerald-800',
    icon: <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />,
  },
  error: {
    bg: 'bg-white',
    border: 'border-rose-200',
    text: 'text-rose-800',
    icon: <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />,
  },
  warning: {
    bg: 'bg-white',
    border: 'border-amber-200',
    text: 'text-amber-800',
    icon: <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />,
  },
  info: {
    bg: 'bg-white',
    border: 'border-blue-200',
    text: 'text-blue-800',
    icon: <Info className="w-4 h-4 text-blue-600 shrink-0" />,
  },
};

export const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  const style = toastStyles[toast.type];

  return (
    <div
      className={`w-80 p-3.5 rounded-xl border shadow-lg flex items-start gap-3 animate-slideInRight ${style.bg} ${style.border}`}
      role="alert"
    >
      {style.icon}
      <div className="flex-1 min-w-0">
        <div className={`text-xs font-bold ${style.text}`}>{toast.title}</div>
        {toast.message && <div className="text-[11px] text-slate-600 mt-0.5">{toast.message}</div>}
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="text-slate-400 hover:text-slate-600 p-0.5 rounded transition cursor-pointer"
        aria-label="Dismiss notification"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

export interface ToastContainerProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast toast={toast} onDismiss={onDismiss} />
        </div>
      ))}
    </div>
  );
};

