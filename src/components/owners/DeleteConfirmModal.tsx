import { Button } from '@/components/ui/button';
import { AlertCircle, Trash2 } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  isDangerous?: boolean;
}

export function DeleteConfirmModal({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  loading,
  isDangerous,
}: DeleteConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <AlertCircle className={`w-6 h-6 ${isDangerous ? 'text-red-600' : 'text-yellow-600'}`} />
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
        <p className="text-gray-700 mb-6">{message}</p>
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={onCancel} disabled={loading}>
            Annulla
          </Button>
          <Button
            className={isDangerous ? 'bg-red-600 hover:bg-red-700' : ''}
            disabled={loading}
            onClick={onConfirm}
          >
            {isDangerous && <Trash2 className="w-4 h-4 mr-2" />}
            {loading ? 'Eliminazione...' : 'Elimina'}
          </Button>
        </div>
      </div>
    </div>
  );
}
