import {
  CheckCircle,
  PhoneForwarded,
  XCircle,
  PhoneMissed,
  PhoneOff,
  AlertTriangle,
  Calendar,
} from 'lucide-react';
import type { CallOutcome } from '@/pages/DialerPage';

interface CallOutcomeSelectorProps {
  selected: CallOutcome | null;
  onSelect: (outcome: CallOutcome) => void;
  disabled?: boolean;
}

const outcomes: { value: CallOutcome; label: string; icon: any; color: string; bgColor: string }[] = [
  {
    value: 'interested',
    label: 'Interessato',
    icon: CheckCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-50 border-green-200 hover:bg-green-100',
  },
  {
    value: 'appointment',
    label: 'Appuntamento',
    icon: Calendar,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 border-blue-200 hover:bg-blue-100',
  },
  {
    value: 'callback',
    label: 'Richiama',
    icon: PhoneForwarded,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50 border-amber-200 hover:bg-amber-100',
  },
  {
    value: 'not_interested',
    label: 'Non Interessato',
    icon: XCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-50 border-red-200 hover:bg-red-100',
  },
  {
    value: 'no_answer',
    label: 'Non Risponde',
    icon: PhoneMissed,
    color: 'text-gray-600',
    bgColor: 'bg-gray-50 border-gray-200 hover:bg-gray-100',
  },
  {
    value: 'busy',
    label: 'Occupato',
    icon: PhoneOff,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50 border-orange-200 hover:bg-orange-100',
  },
  {
    value: 'wrong_number',
    label: 'Numero Errato',
    icon: AlertTriangle,
    color: 'text-rose-600',
    bgColor: 'bg-rose-50 border-rose-200 hover:bg-rose-100',
  },
];

export function CallOutcomeSelector({ selected, onSelect, disabled }: CallOutcomeSelectorProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-3">
        Esito della chiamata
      </label>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
        {outcomes.map((outcome) => {
          const Icon = outcome.icon;
          const isSelected = selected === outcome.value;

          return (
            <button
              key={outcome.value}
              type="button"
              onClick={() => onSelect(outcome.value)}
              disabled={disabled}
              className={`
                flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all
                ${isSelected
                  ? `${outcome.bgColor} border-current ${outcome.color} ring-2 ring-offset-1`
                  : 'border-gray-200 hover:border-gray-300 bg-white'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              <Icon className={`w-6 h-6 mb-1 ${isSelected ? outcome.color : 'text-gray-400'}`} />
              <span className={`text-xs font-medium ${isSelected ? outcome.color : 'text-gray-600'}`}>
                {outcome.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
