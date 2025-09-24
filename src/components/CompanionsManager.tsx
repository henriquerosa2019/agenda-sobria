import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Users } from 'lucide-react';
import { Companion } from '@/types/visit';
import { useToast } from '@/hooks/use-toast';

interface CompanionsManagerProps {
  companions: Companion[];
  onAddCompanion: (name: string) => Promise<void>;
}

const CompanionsManager = ({ companions, onAddCompanion }: CompanionsManagerProps) => {
  const [newCompanionName, setNewCompanionName] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const { toast } = useToast();

  const handleAddCompanion = async () => {
    if (!newCompanionName.trim()) return;

    try {
      setIsAdding(true);
      await onAddCompanion(newCompanionName.trim());
      setNewCompanionName('');
      toast({
        title: "Companheiro adicionado",
        description: `${newCompanionName} foi adicionado com sucesso.`,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o companheiro.",
        variant: "destructive",
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddCompanion();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          Gerenciar Companheiros
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Adicionar novo companheiro */}
        <div className="flex gap-2">
          <Input
            placeholder="Nome do companheiro(a)"
            value={newCompanionName}
            onChange={(e) => setNewCompanionName(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1"
          />
          <Button 
            onClick={handleAddCompanion}
            disabled={!newCompanionName.trim() || isAdding}
            size="icon"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {/* Lista de companheiros */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm text-muted-foreground">
            Companheiros Ativos ({companions.length})
          </h4>
          <div className="flex flex-wrap gap-2">
            {companions.map((companion) => (
              <Badge 
                key={companion.id} 
                variant="secondary"
                className="text-sm"
              >
                {companion.name}
              </Badge>
            ))}
          </div>
          {companions.length === 0 && (
            <p className="text-sm text-muted-foreground italic">
              Nenhum companheiro cadastrado ainda.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CompanionsManager;