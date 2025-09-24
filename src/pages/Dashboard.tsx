import { useState, useMemo } from 'react';
import { VisitFilter } from '@/types/visit';
import { useVisits } from '@/hooks/useVisits';
import Header from '@/components/Header';
import FilterBar from '@/components/FilterBar';
import VisitCard from '@/components/VisitCard';
import VisitEditor from '@/components/VisitEditor';
import CompanionsManager from '@/components/CompanionsManager';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, MapPin, Users, Settings } from 'lucide-react';

const Dashboard = () => {
  const [filter, setFilter] = useState<VisitFilter>({ period: 'month' });
  const { 
    visits, 
    locations, 
    companions, 
    loading,
    addCompanion,
    updateVisitDate,
    addCompanionToVisit,
    removeCompanionFromVisit 
  } = useVisits();

  const uniqueLocations = useMemo(() => {
    return locations.map(l => l.name);
  }, [locations]);

  const filteredVisits = useMemo(() => {
    let filtered = visits;

    // Filter by location
    if (filter.location) {
      filtered = filtered.filter(visit => visit.location.name === filter.location);
    }

    // Filter by period (for now, showing all since it's September data)
    // In real implementation, this would filter based on current date and selected period

    return filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [filter, visits]);

  const stats = useMemo(() => {
    const totalVisits = filteredVisits.length;
    const uniqueLocationsCount = new Set(filteredVisits.map(v => v.location.name)).size;
    const totalCompanions = companions.length;

    return { totalVisits, uniqueLocationsCount, totalCompanions };
  }, [filteredVisits, companions]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando visitas...</p>
        </div>
      </div>
    );
  }

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

        {/* Main Content */}
        <Tabs defaultValue="agenda" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="agenda" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Agenda de Visitas
            </TabsTrigger>
            <TabsTrigger value="gerenciar" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Gerenciar
            </TabsTrigger>
          </TabsList>

          <TabsContent value="agenda" className="space-y-4">
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
          </TabsContent>

          <TabsContent value="gerenciar" className="space-y-6">
            {/* Gerenciar Companheiros */}
            <CompanionsManager 
              companions={companions}
              onAddCompanion={addCompanion}
            />

            {/* Editar Visitas */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Settings className="w-6 h-6 text-primary" />
                Editar Visitas
              </h2>
              
              <div className="space-y-4">
                {visits.map((visit) => (
                  <VisitEditor
                    key={visit.id}
                    visit={visit}
                    companions={companions}
                    onUpdateDate={updateVisitDate}
                    onAddCompanion={addCompanionToVisit}
                    onRemoveCompanion={removeCompanionFromVisit}
                  />
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
};

export default Dashboard;