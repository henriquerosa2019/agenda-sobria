// src/components/VisitFinalizeCard.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useVisits from "@/hooks/useVisits";
import { PlusCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface VisitFinalizeCardProps {
  visit: any;
  onClose?: () => void;
}

export default function VisitFinalizeCard({ visit, onClose }: VisitFinalizeCardProps) {
  const { saveVisitChanges } = useVisits();
  const { toast } = useToast();

  const [companions, setCompanions] = useState<{ name: string; cost?: number }[]>(
    visit?.companions?.map((c: any) => ({ name: c.name, cost: c.cost ?? 0 })) || []
  );
  const [observation, setObservation] = useState(visit?.observation || "");
  const [newName, setNewName] = useState("");

  const handleAddCompanion = () => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    if (companions.some((c) => c.name.toLowerCase() === trimmed.toLowerCase())) {
      setNewName("");
      return;
    }
    setCompanions((prev) => [...prev, { name: trimmed, cost: 0 }]);
    setNewName("");
  };

  const handleSave = async () => {
    try {
      await saveVisitChanges(
        visit.id,
        observation,
        companions.map((c) => ({ name: c.name, cost: c.cost ?? 0 }))
      );
      toast({ title: "✅ Visita atualizada com sucesso!" });
      if (onClose) onClose();
    } catch (error) {
      toast({
        title: "Erro ao salvar visita",
        description: String(error),
        variant: "destructive",
      });
    }
  };

  return (
    <div className="border rounded-lg p-4 mb-4 bg-white shadow-sm">
      <h3 className="text-lg font-semibold mb-3">
        Editar Visita: {visit.location?.name ?? "Local"}
      </h3>

      {/* Campo de texto + botão OK */}
      <div className="flex gap-2 mb-4">
        <Input
          placeholder="Digite o nome do companheiro"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAddCompanion();
            }
          }}
        />
        <Button
          onClick={handleAddCompanion}
          className="bg-blue-600 text-white hover:bg-blue-700"
        >
          <PlusCircle size={16} className="mr-1" /> OK
        </Button>
      </div>

      {/* Lista de companheiros */}
      <div className="space-y-2 mb-4">
        {companions.map((c, i) => (
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
                    idx === i ? { ...item, cost: parseFloat(val) || 0 } : item
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
        ))}
        {companions.length === 0 && (
          <p className="text-xs text-gray-500 italic">
            Nenhum companheiro adicionado
          </p>
        )}
      </div>

      {/* Observações */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Observações</label>
        <textarea
          className="w-full border rounded px-2 py-1"
          rows={2}
          value={observation}
          onChange={(e) => setObservation(e.target.value)}
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button onClick={handleSave} className="bg-green-600 text-white hover:bg-green-700">
          Salvar
        </Button>
        {onClose && (
          <Button onClick={onClose} variant="outline">
            Cancelar
          </Button>
        )}
      </div>
    </div>
  );
}
