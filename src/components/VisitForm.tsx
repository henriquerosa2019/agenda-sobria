// src/components/VisitForm.tsx
import { useState } from "react";
import useVisits from "@/hooks/useVisits";

interface VisitFormProps {
  mode: "edit" | "new";
  visit?: any;
  locations?: { id: string; name: string; address: string }[];
  onSaved?: () => void;
}

export default function VisitForm({ mode, visit, locations, onSaved }: VisitFormProps) {
  const { createNewVisit, saveVisitChanges } = useVisits();

  const [date, setDate] = useState(visit?.date || "");
  const [time, setTime] = useState(visit?.time || "");
  const [locationId, setLocationId] = useState(visit?.location?.id || "");
  const [companions, setCompanions] = useState<{ name: string; cost?: number }[]>(
    visit?.companions?.map((c: any) => ({ name: c.name, cost: c.cost ?? 0 })) || []
  );
  const [observation, setObservation] = useState(visit?.observation || "");

  const handleSave = async () => {
    try {
      await new Promise((r) => setTimeout(r, 120)); // delay p/ mobile

      if (mode === "new") {
        await createNewVisit(
          date,
          time,
          locationId,
          observation,
          companions.map((c) => c.name)
        );
      } else if (visit?.id) {
        await saveVisitChanges(
          visit.id,
          observation,
          companions.map((c) => ({ name: c.name, cost: c.cost ?? 0 }))
        );
      }

      if (onSaved) onSaved();
    } catch (err) {
      console.error("Erro ao salvar visita:", err);
    }
  };

  return (
    <div className="border rounded-lg p-4 mb-6 bg-white shadow-sm">
      <h3 className="font-bold mb-2">
        {mode === "new" ? "Nova Visita" : `Editar Visita: ${visit?.location?.name}`}
      </h3>

      <div className="grid grid-cols-2 gap-4">
        {mode === "new" && (
          <div className="col-span-2">
            <label className="block text-sm mb-1">Local</label>
            <select
              className="w-full border rounded px-2 py-1"
              value={locationId}
              onChange={(e) => setLocationId(e.target.value)}
            >
              <option value="">Selecione o local</option>
              {locations?.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name} — {loc.address}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="block text-sm mb-1">Data da visita</label>
          <input
            type="date"
            className="w-full border rounded px-2 py-1"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Hora agendada</label>
          <input
            type="time"
            className="w-full border rounded px-2 py-1"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
        </div>
      </div>

      {/* Companheiros */}
      <div className="mt-4">
        <label className="block text-sm mb-1">Companheiros</label>

        {/* Campo para adicionar novo nome */}
        <input
          type="text"
          placeholder="Digite ou selecione um nome e pressione Enter ou toque fora"
          className="w-full border rounded px-2 py-1 mb-2"
          onKeyDown={(e) => {
            if (e.key === "Enter" && e.currentTarget.value.trim() !== "") {
              e.preventDefault();
              const newName = e.currentTarget.value.trim();
              setCompanions((prev) => {
                if (prev.some((c) => c.name === newName)) return prev; // evita duplicar
                return [...prev, { name: newName, cost: 0 }];
              });
              e.currentTarget.value = "";
            }
          }}
          onBlur={(e) => {
            // Captura o nome quando o campo perde o foco (mobile)
            const newName = e.currentTarget.value.trim();
            if (newName !== "") {
              setTimeout(() => {
                setCompanions((prev) => {
                  if (prev.some((c) => c.name === newName)) return prev;
                  return [...prev, { name: newName, cost: 0 }];
                });
                e.currentTarget.value = "";
              }, 150); // pequeno delay garante captura no mobile
            }
          }}
        />

        {/* Lista dinâmica */}
        <div className="space-y-2">
          {companions.length > 0 ? (
            companions.map((c, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-semibold min-w-[80px] text-center">
                  {c.name}
                </span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={c.cost ?? 0}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value) || 0;
                    setCompanions((prev) =>
                      prev.map((item, idx) =>
                        idx === i ? { ...item, cost: val } : item
                      )
                    );
                  }}
                  className="border rounded px-2 py-1 w-20 text-sm"
                />
                <button
                  type="button"
                  onClick={() =>
                    setCompanions((prev) => prev.filter((_, idx) => idx !== i))
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
      <div className="mt-4">
        <label className="block text-sm mb-1">Observação</label>
        <textarea
          className="w-full border rounded px-2 py-1"
          rows={2}
          value={observation}
          onChange={(e) => setObservation(e.target.value)}
        />
      </div>

      <div className="flex gap-2 mt-4">
        <button
          onClick={handleSave}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Salvar
        </button>

        {mode === "new" && (
          <button
            onClick={handleSave}
            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
          >
            Adicionar nova visita
          </button>
        )}
      </div>
    </div>
  );
}
