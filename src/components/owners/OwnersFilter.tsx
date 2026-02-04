import { useState, ChangeEvent } from 'react';
import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface FilterOptions {
  search: string;
  temperature: 'ALL' | 'HOT' | 'WARM' | 'COLD';
  scoreMin: number;
  scoreMax: number;
}

interface OwnersFilterProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
}

export function OwnersFilter({ filters, onFiltersChange }: OwnersFilterProps) {
  const [expandedFilters, setExpandedFilters] = useState(false);

  const handleSearchChange = (value: string) => {
    onFiltersChange({ ...filters, search: value });
  };

  const handleTemperatureChange = (temp: 'ALL' | 'HOT' | 'WARM' | 'COLD') => {
    onFiltersChange({ ...filters, temperature: temp });
  };

  const handleScoreMinChange = (value: number) => {
    onFiltersChange({ ...filters, scoreMin: value });
  };

  const handleScoreMaxChange = (value: number) => {
    onFiltersChange({ ...filters, scoreMax: value });
  };

  const hasActiveFilters =
    filters.search ||
    filters.temperature !== 'ALL' ||
    filters.scoreMin > 0 ||
    filters.scoreMax < 100;

  const resetFilters = () => {
    onFiltersChange({
      search: '',
      temperature: 'ALL',
      scoreMin: 0,
      scoreMax: 100,
    });
  };

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cerca per nome, email o telefono..."
              value={filters.search}
              onChange={(e: ChangeEvent<HTMLInputElement>) => handleSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Advanced Filters Toggle */}
          <button
            onClick={() => setExpandedFilters(!expandedFilters)}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            {expandedFilters ? '▼ Nascondi filtri' : '► Filtri avanzati'}
          </button>

          {/* Advanced Filters */}
          {expandedFilters && (
            <div className="space-y-4 pt-2 border-t">
              {/* Temperature Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Temperatura
                </label>
                <div className="flex gap-2">
                  {['ALL', 'COLD', 'WARM', 'HOT'].map((temp) => (
                    <button
                      key={temp}
                      onClick={() => handleTemperatureChange(temp as any)}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                        filters.temperature === temp
                          ? temp === 'ALL'
                            ? 'bg-gray-600 text-white'
                            : temp === 'HOT'
                            ? 'bg-red-600 text-white'
                            : temp === 'WARM'
                            ? 'bg-orange-600 text-white'
                            : 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {temp === 'ALL'
                        ? 'Tutti'
                        : temp === 'HOT'
                        ? 'Caldo'
                        : temp === 'WARM'
                        ? 'Tiepido'
                        : 'Freddo'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Score Range Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Score ({filters.scoreMin} - {filters.scoreMax})
                </label>
                <div className="space-y-2">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={filters.scoreMin}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => handleScoreMinChange(Number(e.target.value))}
                    className="w-full"
                  />
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={filters.scoreMax}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => handleScoreMaxChange(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Reset Button */}
              {hasActiveFilters && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={resetFilters}
                  className="w-full"
                >
                  <X className="w-4 h-4 mr-2" />
                  Resetta filtri
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
