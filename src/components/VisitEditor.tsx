import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, MapPin, Users, Plus, X } from 'lucide-react';
import { Visit, Companion } from '@/types/visit';
import { useToast } from '@/hooks/use-toast';

interface VisitEditorProps {
  visit: Visit;
  companions: Companion[];
  onUpdateDate: (visitId: string, date: string, time: string) => Promise<void>;
  onAddCompanion: (visitId: string, companionId: string) => Promise<void>;
  onRemoveCompanion: (visitId: string, companionId: string) => Promise<void>;
}

const VisitEditor = ({ 
  visit, 
  companions, 
  onUpdateDate, 
  onAddCompanion, 
  onRemoveCompanion 
}: VisitEditorProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newDate, setNewDate] = useState(visit.date);
  const [newTime, setNewTime] = useState(visit.time);
  const [selectedCompanion, setSelectedCompanion] = useState<string>('');
  const { toast } = useToast();

  const handleUpdateDate = async () => {
    try {
      await onUpdateDate(visit.id, newDate, newTime);
      setIsEditing(false);
      toast({
        title: "Data atualizada",
        description: "A data da visita foi atualizada com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a data.",
        variant: "destructive",
      });
    }
  };

  const handleAddCompanion = async () => {
    if (!selectedCompanion) return;

    try {
      await onAddCompanion(visit.id, selectedCompanion);
      setSelectedCompanion('');
      toast({
        title: "Companheiro adicionado",
        description: "Companheiro adicionado à visita com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o companheiro.",
        variant: "destructive",
      });
    }
  };

  const handleRemoveCompanion = async (companionId: string) => {
    try {
      await onRemoveCompanion(visit.id, companionId);
      toast({
        title: "Companheiro removido",
        description: "Companheiro removido da visita com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível remover o companheiro.",
        variant: "destructive",
      });
    }
  };

  const availableCompanions = companions.filter(
    c => !visit.companions.some(vc => vc.id === c.id)
  );

  return (
    <Card className="border-l-4 border-l-primary">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <span className="text-2xl">{visit.location.icon}</span>
          {visit.location.name}
        </CardTitle>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="w-4 h-4" />
          {visit.location.address}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Data e Hora */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Calendar className="w-4 h-4 text-primary" />
            Data e Hora
          </div>
          
          {isEditing ? (
            <div className="flex gap-2">
              <Input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="flex-1"
              />
              <Input
                type="time"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleUpdateDate} size="sm">
                Salvar
              </Button>
              <Button 
                onClick={() => {
                  setIsEditing(false);
                  setNewDate(visit.date);
                  setNewTime(visit.time);
                }} 
                variant="outline" 
                size="sm"
              >
                Cancelar
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="flex items-center gap-2">
                <Calendar className="w-3 h-3" />
                {new Date(visit.date).toLocaleDateString('pt-BR')}
              </Badge>
              <Badge variant="outline" className="flex items-center gap-2">
                <Clock className="w-3 h-3" />
                {visit.time}
              </Badge>
              <Button 
                onClick={() => setIsEditing(true)} 
                variant="ghost" 
                size="sm"
              >
                Editar
              </Button>
            </div>
          )}
        </div>

        {/* Companheiros */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Users className="w-4 h-4 text-primary" />
            Companheiros ({visit.companions.length})
          </div>
          
          <div className="flex flex-wrap gap-2">
            {visit.companions.map((companion) => (
              <Badge 
                key={companion.id} 
                variant="default"
                className="flex items-center gap-2"
              >
                {companion.name}
                <X 
                  className="w-3 h-3 cursor-pointer hover:text-red-300" 
                  onClick={() => handleRemoveCompanion(companion.id)}
                />
              </Badge>
            ))}
          </div>

          {/* Adicionar companheiro */}
          {availableCompanions.length > 0 && (
            <div className="flex gap-2">
              <Select value={selectedCompanion} onValueChange={setSelectedCompanion}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Adicionar companheiro..." />
                </SelectTrigger>
                <SelectContent>
                  {availableCompanions.map((companion) => (
                    <SelectItem key={companion.id} value={companion.id}>
                      {companion.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                onClick={handleAddCompanion}
                size="icon"
                disabled={!selectedCompanion}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default VisitEditor;