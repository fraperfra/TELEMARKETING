import { useState, ChangeEvent } from 'react';
import { Owner } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Edit,
  Trash2,
  MoreVertical,
  Download,
  Upload,
  Eye,
  EyeOff,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';

interface OwnersTableProps {
  owners: Owner[];
  selectedIds: Set<string>;
  onSelectAll: (checked: boolean) => void;
  onSelectOne: (id: string, checked: boolean) => void;
  onEdit: (owner: Owner) => void;
  onDelete: (owners: Owner[]) => void;
  onBulkDelete: (ids: string[]) => void;
  loading?: boolean;
}

const temperatureColors = {
  HOT: 'bg-red-100 text-red-800',
  WARM: 'bg-orange-100 text-orange-800',
  COLD: 'bg-blue-100 text-blue-800',
};

const temperatureLabels = {
  HOT: 'Caldo',
  WARM: 'Tiepido',
  COLD: 'Freddo',
};

export function OwnersTable({
  owners,
  selectedIds,
  onSelectAll,
  onSelectOne,
  onEdit,
  onDelete,
  onBulkDelete,
  loading,
}: OwnersTableProps) {
  const [visibleColumns, setVisibleColumns] = useState(new Set(['name', 'email', 'temperature', 'score', 'actions']));

  const toggleColumnVisibility = (column: string) => {
    const newSet = new Set(visibleColumns);
    if (newSet.has(column)) {
      newSet.delete(column);
    } else {
      newSet.add(column);
    }
    setVisibleColumns(newSet);
  };

  const handleBulkDelete = () => {
    if (selectedIds.size > 0) {
      onBulkDelete(Array.from(selectedIds));
    }
  };

  const exportToCSV = () => {
    const headers = ['Nome', 'Email', 'Telefono', 'Codice Fiscale', 'Temperature', 'Score'];
    const rows = owners.map((o) => [
      `${o.firstName} ${o.lastName}`,
      o.email || '',
      o.phone || '',
      o.taxCode || '',
      temperatureLabels[o.temperature],
      o.score,
    ]);

    const csv = [
      headers.join(','),
      ...rows.map((r) => r.map((c) => `"${c}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `proprietari_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Proprietari</CardTitle>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={exportToCSV}>
            <Download className="w-4 h-4 mr-2" />
            Esporta
          </Button>
          {selectedIds.size > 0 && (
            <Button
              size="sm"
              variant="destructive"
              onClick={handleBulkDelete}
              disabled={loading}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Elimina ({selectedIds.size})
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <input
                    type="checkbox"
                    checked={selectedIds.size === owners.length && owners.length > 0}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => onSelectAll(e.target.checked)}
                    className="rounded"
                  />
                </TableHead>
                {visibleColumns.has('name') && <TableHead>Nome</TableHead>}
                {visibleColumns.has('email') && <TableHead>Email</TableHead>}
                {visibleColumns.has('phone') && <TableHead>Telefono</TableHead>}
                {visibleColumns.has('temperature') && <TableHead>Temperatura</TableHead>}
                {visibleColumns.has('score') && <TableHead>Score</TableHead>}
                {visibleColumns.has('lastContact') && <TableHead>Ultimo Contatto</TableHead>}
                {visibleColumns.has('actions') && <TableHead>Azioni</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {owners.map((owner) => (
                <TableRow key={owner.id}>
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selectedIds.has(owner.id)}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => onSelectOne(owner.id, e.target.checked)}
                      className="rounded"
                    />
                  </TableCell>
                  {visibleColumns.has('name') && (
                    <TableCell className="font-medium">
                      {owner.firstName} {owner.lastName}
                    </TableCell>
                  )}
                  {visibleColumns.has('email') && (
                    <TableCell className="text-sm text-gray-600">{owner.email || '-'}</TableCell>
                  )}
                  {visibleColumns.has('phone') && (
                    <TableCell className="text-sm text-gray-600">{owner.phone || '-'}</TableCell>
                  )}
                  {visibleColumns.has('temperature') && (
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${temperatureColors[owner.temperature]}`}>
                        {temperatureLabels[owner.temperature]}
                      </span>
                    </TableCell>
                  )}
                  {visibleColumns.has('score') && (
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${owner.score}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{owner.score}</span>
                      </div>
                    </TableCell>
                  )}
                  {visibleColumns.has('lastContact') && (
                    <TableCell className="text-sm text-gray-600">
                      {owner.lastContact
                        ? formatDistanceToNow(new Date(owner.lastContact), { locale: it, addSuffix: true })
                        : 'Mai contattato'}
                    </TableCell>
                  )}
                  {visibleColumns.has('actions') && (
                    <TableCell className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onEdit(owner)}
                        disabled={loading}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onDelete([owner])}
                        disabled={loading}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {owners.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>Nessun proprietario trovato</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
