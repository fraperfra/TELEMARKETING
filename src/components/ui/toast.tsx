import { AlertCircle, CheckCircle, AlertTriangle, Info, X } from 'lucide-react';
import { Notification } from '@/contexts/NotificationContext';

interface ToastProps {
  notification: Notification;
  onClose: () => void;
}

export function Toast({ notification, onClose }: ToastProps) {
  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-600" />,
    error: <AlertCircle className="w-5 h-5 text-red-600" />,
    warning: <AlertTriangle className="w-5 h-5 text-yellow-600" />,
    info: <Info className="w-5 h-5 text-blue-600" />,
  };

  const bgColors = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    warning: 'bg-yellow-50 border-yellow-200',
    info: 'bg-blue-50 border-blue-200',
  };

  const textColors = {
    success: 'text-green-900',
    error: 'text-red-900',
    warning: 'text-yellow-900',
    info: 'text-blue-900',
  };

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-lg border ${bgColors[notification.type]} shadow-lg animate-in slide-in-from-right-5 fade-in`}
    >
      <div className="flex-shrink-0 mt-0.5">{icons[notification.type]}</div>
      <div className="flex-1 min-w-0">
        <h3 className={`font-semibold ${textColors[notification.type]}`}>{notification.title}</h3>
        <p className={`text-sm mt-1 ${textColors[notification.type]} opacity-90`}>
          {notification.message}
        </p>
        {notification.action && (
          <button
            onClick={notification.action.onClick}
            className={`text-sm font-medium mt-2 underline hover:opacity-80 ${textColors[notification.type]}`}
          >
            {notification.action.label}
          </button>
        )}
      </div>
      <button
        onClick={onClose}
        className={`flex-shrink-0 ${textColors[notification.type]} opacity-50 hover:opacity-100 transition-opacity`}
        aria-label="Close notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
