// src/components/VisitConfigModal.tsx
import { useState } from "react";
import { Visit } from "@/hooks/useVisits";

interface Props {
  visit: Visit;
  onClose: () => void;
  onSave: (id: string, updated: Partial<Visit>) => Promise<void>;
}

export default function VisitConfigModal({ visit, onClose, onSave }: Props) {
  const [date, setDate] = useState(visit.date);
  const [time, setTime] = useState(visit.time);
  const [companions, setCompanions] = useState(
    visit.companions?.map((c) => c.name).join(", ") || ""
  );
  const [observation, setObservation] = useState(visit.observation || "");

  const handleSave = async () => {
    await onSave(visit.id, {
      date,
      time,
      companions: companions
        .split(",")
        .map((c, i) => ({ id: `${visit.id}-c${i}`, name: c.trim() }))
        .filter((c) => c.name !== ""),
      observation,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
        <h2 className="text-lg font-bold mb-4">Editar Visita</h2>

        <label className="block mb-2 text-sm">Data</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full border rounded px-3 py-2 mb-4"
        />

        <label className="block mb-2 text-sm">Hora</label>
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="w-full border rounded px-3 py-2 mb-4"
        />

        <label className="block mb-2 text-sm">Companheiros (vírgula)</label>
        <input
          type="text"
          value={companions}
          onChange={(e) => setCompanions(e.target.value)}
          className="w-full border rounded px-3 py-2 mb-4"
        />

        <label className="block mb-2 text-sm">Observação</label>
        <textarea
          value={observation}
          onChange={(e) => setObservation(e.target.value)}
          className="w-full border rounded px-3 py-2 mb-4"
        />

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-md border px-4 py-2 hover:bg-gray-100"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700"
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}
