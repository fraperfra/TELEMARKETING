import { useState } from 'react';
import { Bell, X, Check, Trash2 } from 'lucide-react';
import { Alert, useAlerts } from '@/hooks/useAlerts';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';
import { Button } from '@/components/ui/button';

export function AlertsDropdown() {
  const { alerts, unreadCount, markAsRead, markAllAsRead, deleteAlert } = useAlerts();
  const [open, setOpen] = useState(false);

  const bgColors: Record<Alert['type'], string> = {
    warning: 'bg-yellow-50 border-yellow-200',
    error: 'bg-red-50 border-red-200',
    info: 'bg-blue-50 border-blue-200',
  };

  const textColors: Record<Alert['type'], string> = {
    warning: 'text-yellow-900',
    error: 'text-red-900',
    info: 'text-blue-900',
  };

  const badgeColors: Record<Alert['type'], string> = {
    warning: 'bg-yellow-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 text-gray-500 hover:bg-gray-50 rounded-full transition-colors group"
      >
        <Bell className="w-5 h-5 group-hover:scale-110 transition-transform" />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full animate-pulse" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Notifiche</h3>
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    markAllAsRead();
                  }}
                >
                  Segna tutto come letto
                </Button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {alerts.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>Nessuna notifica</p>
              </div>
            ) : (
              alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-3 border-b border-gray-100 ${
                    alert.read ? 'opacity-60' : 'bg-gray-50'
                  }`}
                >
                  <div className={`p-3 rounded border ${bgColors[alert.type]}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className={`font-semibold text-sm ${textColors[alert.type]}`}>
                            {alert.title}
                          </h4>
                          <span className={`w-2 h-2 rounded-full ${badgeColors[alert.type]}`} />
                        </div>
                        <p className={`text-xs mt-1 ${textColors[alert.type]} opacity-90`}>
                          {alert.message}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          {alert.action_url && (
                            <Button
                              size="xs"
                              variant="outline"
                              onClick={() => {
                                window.location.href = alert.action_url || '/';
                              }}
                            >
                              Vai
                            </Button>
                          )}
                          {!alert.read && (
                            <button
                              onClick={() => markAsRead(alert.id)}
                              className={`text-xs font-medium ${textColors[alert.type]} hover:opacity-70`}
                            >
                              <Check className="w-3 h-3 inline mr-1" />
                              Leggi
                            </button>
                          )}
                          <button
                            onClick={() => deleteAlert(alert.id)}
                            className={`text-xs font-medium ${textColors[alert.type]} hover:opacity-70`}
                          >
                            <Trash2 className="w-3 h-3 inline mr-1" />
                          </button>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      {formatDistanceToNow(new Date(alert.created_at), {
                        addSuffix: true,
                        locale: it,
                      })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
