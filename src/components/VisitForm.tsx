import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import useVisits from "@/hooks/useVisits";

interface VisitFormProps {
  mode: "edit" | "new";
  visit?: any; // visita existente (quando edit)
  locations?: { id: string; name: string; address: string }[];
  onSaved?: () => void;
}

export default function VisitForm({ mode, visit, locations, onSaved }: VisitFormProps) {
  const { createNewVisit, saveVisitChanges } = useVisits();

  const [date, setDate] = useState(visit?.date || "");
  const [time, setTime] = useState(visit?.time || "");
  const [locationId, setLocationId] = useState(visit?.location?.id || "");
  const [companions, setCompanions] = useState(
    visit?.companions?.map((c: any) => c.name).join(", ") || ""
  );
  const [observation, setObservation] = useState(visit?.observation || "");

  const handleSave = async () => {
    if (mode === "new") {
      await createNewVisit(date, time, locationId, observation, companions.split(",").map(s => s.trim()));
    } else {
      await saveVisitChanges(visit.id, observation, companions.split(",").map(s => s.trim()));
    }
    if (onSaved) onSaved();
  };

  return (
    <div className="border rounded-lg p-4 mb-6 bg-white shadow-sm">
      <h3 className="font-bold mb-2">
        {mode === "new" ? "Nova Visita" : `Editar Visita: ${visit?.location?.name}`}
      </h3>

      <div className="grid grid-cols-2 gap-4">
        {/* Local só aparece no modo "new" */}
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

      <div className="mt-4">
        <label className="block text-sm mb-1">Companheiros</label>
        <input
          type="text"
          placeholder="Digite nomes separados por vírgula"
          className="w-full border rounded px-2 py-1"
          value={companions}
          onChange={(e) => setCompanions(e.target.value)}
        />
      </div>

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
            Adicionar como nova visita
          </button>
        )}
      </div>
    </div>
  );
}
