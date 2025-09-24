import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, MapPin, Filter } from 'lucide-react';
import { VisitFilter } from '@/types/visit';

interface FilterBarProps {
  onFilterChange: (filter: VisitFilter) => void;
  uniqueLocations: string[];
}

const FilterBar = ({ onFilterChange, uniqueLocations }: FilterBarProps) => {
  const [activeFilter, setActiveFilter] = useState<VisitFilter>({ period: 'month' });

  const handlePeriodChange = (period: 'day' | 'week' | 'month') => {
    const newFilter = { ...activeFilter, period };
    setActiveFilter(newFilter);
    onFilterChange(newFilter);
  };

  const handleLocationChange = (location: string) => {
    const newFilter = { ...activeFilter, location: location === 'all' ? undefined : location };
    setActiveFilter(newFilter);
    onFilterChange(newFilter);
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 shadow-soft">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold text-card-foreground">Filtros</h2>
      </div>
      
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <div className="flex gap-1">
            {(['day', 'week', 'month'] as const).map((period) => (
              <Button
                key={period}
                variant={activeFilter.period === period ? 'default' : 'outline'}
                size="sm"
                onClick={() => handlePeriodChange(period)}
              >
                {period === 'day' ? 'Dia' : period === 'week' ? 'Semana' : 'Mês'}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-muted-foreground" />
          <Select value={activeFilter.location || 'all'} onValueChange={handleLocationChange}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Selecionar local" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os locais</SelectItem>
              {uniqueLocations.map((location) => (
                <SelectItem key={location} value={location}>
                  {location}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;