import { useState, useMemo } from 'react';
import { visits } from '@/data/visits';
import { VisitFilter } from '@/types/visit';
import Header from '@/components/Header';
import FilterBar from '@/components/FilterBar';
import VisitCard from '@/components/VisitCard';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, MapPin, Users } from 'lucide-react';

const Dashboard = () => {
  const [filter, setFilter] = useState<VisitFilter>({ period: 'month' });

  const uniqueLocations = useMemo(() => {
    return [...new Set(visits.map(visit => visit.location.name))];
  }, []);

  const filteredVisits = useMemo(() => {
    let filtered = visits;

    // Filter by location
    if (filter.location) {
      filtered = filtered.filter(visit => visit.location.name === filter.location);
    }

    // Filter by period (for now, showing all since it's September data)
    // In real implementation, this would filter based on current date and selected period

    return filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [filter]);

  const stats = useMemo(() => {
    const totalVisits = filteredVisits.length;
    const uniqueLocationsCount = new Set(filteredVisits.map(v => v.location.name)).size;
    const totalCompanions = new Set(
      filteredVisits.flatMap(v => v.companions)
    ).size;

    return { totalVisits, uniqueLocationsCount, totalCompanions };
  }, [filteredVisits]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-6xl mx-auto p-4 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-success/10 to-success/5 border-success/20">
            <CardContent className="p-4 text-center">
              <Calendar className="w-8 h-8 text-success mx-auto mb-2" />
              <p className="text-2xl font-bold text-success">{stats.totalVisits}</p>
              <p className="text-sm text-muted-foreground">Visitas Agendadas</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="p-4 text-center">
              <MapPin className="w-8 h-8 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold text-primary">{stats.uniqueLocationsCount}</p>
              <p className="text-sm text-muted-foreground">Locais Diferentes</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-info/10 to-info/5 border-accent/20">
            <CardContent className="p-4 text-center">
              <Users className="w-8 h-8 text-accent-foreground mx-auto mb-2" />
              <p className="text-2xl font-bold text-accent-foreground">{stats.totalCompanions}</p>
              <p className="text-sm text-muted-foreground">Companheiros Ativos</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <FilterBar 
          onFilterChange={setFilter}
          uniqueLocations={uniqueLocations}
        />

        {/* Visits Grid */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Calendar className="w-6 h-6 text-primary" />
            Agenda de Visitas - Setembro 2024
          </h2>
          
          {filteredVisits.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">Nenhuma visita encontrada com os filtros selecionados.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredVisits.map((visit) => (
                <VisitCard key={visit.id} visit={visit} />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Dashboard;