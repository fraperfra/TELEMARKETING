import { useState } from 'react';
import { useReminders } from '@/hooks/useReminders';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Phone, CheckCircle, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';

export function RemindersPanel() {
  const { reminders, completeReminder, dismissReminder } = useReminders();
  const [collapsed, setCollapsed] = useState(false);

  if (reminders.length === 0) {
    return null;
  }

  const typeIcons = {
    appointment: Phone,
    callback: Clock,
    follow_up: CheckCircle,
    task: Clock,
  };

  const typeLabels = {
    appointment: 'Appuntamento',
    callback: 'Richiamata',
    follow_up: 'Follow-up',
    task: 'Attività',
  };

  return (
    <Card className="fixed bottom-4 left-4 w-80 z-40 border-orange-200 bg-orange-50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-orange-900">
            <Clock className="w-5 h-5" />
            Promemoria ({reminders.length})
          </CardTitle>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-orange-600 hover:text-orange-900"
          >
            {collapsed ? '▲' : '▼'}
          </button>
        </div>
      </CardHeader>

      {!collapsed && (
        <CardContent className="space-y-2 max-h-96 overflow-y-auto">
          {reminders.map((reminder) => {
            const Icon = typeIcons[reminder.type];
            return (
              <div
                key={reminder.id}
                className="flex items-start gap-3 p-3 bg-white rounded border border-orange-100"
              >
                <Icon className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-gray-900">{reminder.title}</p>
                  {reminder.description && (
                    <p className="text-xs text-gray-600 mt-1">{reminder.description}</p>
                  )}
                  {reminder.contact_name && (
                    <div className="flex items-center gap-1 mt-1 text-xs text-gray-600">
                      <Phone className="w-3 h-3" />
                      <span>{reminder.contact_name}</span>
                      {reminder.contact_phone && <span>{reminder.contact_phone}</span>}
                    </div>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDistanceToNow(new Date(reminder.scheduled_for), {
                      addSuffix: true,
                      locale: it,
                    })}
                  </p>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => completeReminder(reminder.id)}
                    className="text-green-600 hover:bg-green-50"
                  >
                    <CheckCircle className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => dismissReminder(reminder.id)}
                    className="text-gray-600 hover:bg-gray-50"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </CardContent>
      )}
    </Card>
  );
}
