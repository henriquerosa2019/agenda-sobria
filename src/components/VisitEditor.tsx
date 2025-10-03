import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Users } from 'lucide-react';
import { Visit } from '@/types/visit';
import useVisits from '@/hooks/useVisits';
import { useToast } from '@/components/ui/use-toast';

interface VisitEditorProps {
  visit: Visit;
}

export default function VisitEditor({ visit }: VisitEditorProps) {
  const { saveVisitChanges } = useVisits();
  const { toast } = useToast();

  const [observation, setObservation] = useState(visit.observation ?? '');
  const [companionNames, setCompanionNames] = useState(
    visit.companions?.map((c) => c.name) ?? []
  );

  // Atualiza os campos se o objeto visita mudar
  useEffect(() => {
    setObservation(visit.observation ?? '');
    setCompanionNames(visit.companions?.map((c) => c.name) ?? []);
  }, [visit]);

  const handleSave = async () => {
    if (!visit.id) {
      toast({ title: 'Erro: visita sem ID válido.' });
      return;
    }

    try {
      await saveVisitChanges(visit.id, observation, companionNames);
      toast({ title: 'Visita atualizada com sucesso!' });
    } catch (error) {
      toast({
        title: 'Erro ao salvar visita.',
        description: String(error),
        variant: 'destructive',
      });
    }
  };

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin size={18} />
          {visit.location?.name ?? 'Local'}
        </CardTitle>
        <div className="text-sm text-muted-foreground">
          {visit.location?.address}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar size={16} />
          {visit.date}
          <Clock size={16} />
          {visit.time}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Companheiros</label>
          <Input
            placeholder="Digite os nomes separados por vírgula"
            value={companionNames.join(', ')}
            onChange={(e) =>
              setCompanionNames(
                e.target.value
                  .split(',')
                  .map((name) => name.trim())
                  .filter(Boolean)
              )
            }
          />
          <div className="flex flex-wrap gap-2 mt-2">
            {companionNames.map((name, i) => (
              <Badge key={i} variant="secondary">
                <Users size={12} className="mr-1" />
                {name}
              </Badge>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Observações</label>
          <Input
            placeholder="Digite uma observação"
            value={observation}
            onChange={(e) => setObservation(e.target.value)}
          />
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSave}>Salvar</Button>
        </div>
      </CardContent>
    </Card>
  );
}
