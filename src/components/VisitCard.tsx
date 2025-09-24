import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin, Users } from 'lucide-react';
import { Visit } from '@/types/visit';

interface VisitCardProps {
  visit: Visit;
}

const VisitCard = ({ visit }: VisitCardProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: '2-digit'
    });
  };

  return (
    <Card className="bg-gradient-to-br from-card via-card to-secondary/20 border-border shadow-soft hover:shadow-medium transition-all duration-300 hover:scale-[1.02]">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{visit.location.icon}</span>
            <div>
              <h3 className="font-semibold text-card-foreground text-lg leading-tight">
                {visit.location.name}
              </h3>
              <div className="flex items-center gap-1 text-muted-foreground mt-1">
                <MapPin className="w-4 h-4" />
                <p className="text-sm">{visit.location.address}</p>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-2 text-primary">
            <Clock className="w-4 h-4" />
            <span className="font-medium">{formatDate(visit.date)} - {visit.time}h</span>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-card-foreground">Companheiros:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {visit.companions.map((companion, index) => (
              <Badge 
                key={index} 
                variant="secondary"
                className="bg-primary/10 text-primary border-primary/20"
              >
                {companion}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VisitCard;