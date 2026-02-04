import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Phone, Loader2 } from 'lucide-react';

interface Contact {
  id: string;
  name: string;
  phone: string;
  address?: string;
  temperature?: 'hot' | 'warm' | 'cold';
  call_attempts?: number;
}

interface LeadQueueProps {
  queue: Contact[];
  currentIndex: number;
  onSelect: (contact: Contact, index: number) => void;
  loading?: boolean;
}

export function LeadQueue({ queue, currentIndex, onSelect, loading }: LeadQueueProps) {
  const getTemperatureColor = (temp?: string) => {
    switch (temp) {
      case 'hot':
        return 'bg-red-500';
      case 'warm':
        return 'bg-amber-500';
      case 'cold':
        return 'bg-blue-500';
      default:
        return 'bg-gray-400';
    }
  };

  // Show current + next 4 contacts
  const visibleQueue = queue.slice(currentIndex, currentIndex + 5);
  const remainingCount = queue.length - currentIndex - visibleQueue.length;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Coda
          </span>
          <span className="text-sm font-normal text-gray-500">
            {queue.length - currentIndex} rimanenti
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        ) : queue.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Nessun contatto in coda</p>
          </div>
        ) : (
          <div className="space-y-2">
            {visibleQueue.map((contact, index) => {
              const actualIndex = currentIndex + index;
              const isCurrent = actualIndex === currentIndex;

              return (
                <button
                  key={contact.id}
                  onClick={() => onSelect(contact, actualIndex)}
                  className={`
                    w-full text-left p-3 rounded-lg border transition-all
                    ${isCurrent
                      ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-200'
                      : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    {/* Position indicator */}
                    <div
                      className={`
                        w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium
                        ${isCurrent
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-600'
                        }
                      `}
                    >
                      {actualIndex + 1}
                    </div>

                    {/* Contact info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${getTemperatureColor(contact.temperature)}`}
                        />
                        <span className={`font-medium truncate ${isCurrent ? 'text-blue-900' : 'text-gray-900'}`}>
                          {contact.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                        <Phone className="w-3 h-3" />
                        <span className="truncate">{contact.phone}</span>
                        {contact.call_attempts && contact.call_attempts > 0 && (
                          <span className="ml-1 px-1.5 py-0.5 bg-gray-100 rounded text-gray-600">
                            {contact.call_attempts}x
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Current indicator */}
                    {isCurrent && (
                      <span className="px-2 py-0.5 bg-blue-500 text-white text-xs font-medium rounded">
                        Attivo
                      </span>
                    )}
                  </div>
                </button>
              );
            })}

            {/* Remaining count */}
            {remainingCount > 0 && (
              <div className="text-center text-sm text-gray-500 pt-2 border-t">
                +{remainingCount} altri contatti
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
