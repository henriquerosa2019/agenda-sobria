// src/components/VisitEditor.tsx
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, Users, PlusCircle, X } from "lucide-react";
import { Visit } from "@/types/visit";
import useVisits from "@/hooks/useVisits";
import { useToast } from "@/components/ui/use-toast";

interface VisitEditorProps {
  visit: Visit;
}

export default function VisitEditor({ visit }: VisitEditorProps) {
  const { saveVisitChanges } = useVisits();
  const { toast } = useToast();

  const [observation, setObservation] = useState(visit.observation ?? "");
  const [companions, setCompanions] = useState<{ name: string; cost?: number }[]>(
    visit.companions?.map((c) => ({ name: c.name, cost: c.cost ?? 0 })) ?? []
  );
  const [newCompanion, setNewCompanion] = useState("");

  useEffect(() => {
    setObservation(visit.observation ?? "");
    setCompanions(
      visit.companions?.map((c) => ({ name: c.name, cost: c.cost ?? 0 })) ?? []
    );
  }, [visit]);

  const handleAddCompanion = () => {
    const trimmed = newCompanion.trim();
    if (!trimmed) return;
    if (companions.some((c) => c.name.toLowerCase() === trimmed.toLowerCase()))
      return;
    setCompanions((prev) => [...prev, { name: trimmed, cost: 0 }]);
    setNewCompanion("");
  };

  const handleSave = async () => {
    if (!visit.id) {
      toast({ title: "Erro: visita sem ID válido." });
      return;
    }

    try {
      await new Promise((res) => setTimeout(res, 150));
      await saveVisitChanges(
        visit.id,
        observation,
        companions.map((c) => ({ name: c.name, cost: c.cost ?? 0 }))
      );
      toast({ title: "✅ Visita atualizada com sucesso!" });
    } catch (error) {
      toast({
        title: "Erro ao salvar visita.",
        description: String(error),
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin size={18} />
          {visit.location?.name ?? "Local"}
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

        {/* Companheiros */}
        <div className="space-y-3">
          <label className="text-sm font-medium">Companheiros</label>

          {/* Campo de nome + botão OK */}
          <div className="flex gap-2">
            <Input
              placeholder="Digite o nome do companheiro"
              value={newCompanion}
              onChange={(e) => setNewCompanion(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddCompanion();
                }
              }}
            />
            <Button
              onClick={handleAddCompanion}
              className="bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-1"
            >
              <PlusCircle size={16} />
              OK
            </Button>
          </div>

          {/* Lista dinâmica */}
          <div className="space-y-2">
            {companions.length > 0 ? (
              companions.map((c, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-semibold min-w-[80px] text-center">
                    {c.name}
                  </span>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={
                      c.cost
                        ? `R$ ${c.cost.toFixed(2).replace(".", ",")}`
                        : "R$ 0,00"
                    }
                    onChange={(e) => {
                      const val = e.target.value
                        .replace(/[^\d,]/g, "")
                        .replace(",", ".");
                      setCompanions((prev) =>
                        prev.map((item, idx) =>
                          idx === i
                            ? { ...item, cost: parseFloat(val) || 0 }
                            : item
                        )
                      );
                    }}
                    className="border rounded px-2 py-1 w-24 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setCompanions((prev) =>
                        prev.filter((_, idx) => idx !== i)
                      )
                    }
                    className="text-red-500 text-xs font-bold"
                  >
                    ✕
                  </button>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-500 italic">
                Nenhum companheiro adicionado
              </p>
            )}
          </div>
        </div>

        {/* Observações */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Observações</label>
          <Input
            placeholder="Digite uma observação"
            value={observation}
            onChange={(e) => setObservation(e.target.value)}
          />
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSave} className="bg-green-600 text-white">
            💾 Salvar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
