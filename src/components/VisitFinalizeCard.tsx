// src/components/VisitFinalizeCard.tsx
import { useState } from "react";
import { Visit } from "@/hooks/useVisits";

interface Props {
  visit: Visit;
  onFinalize: (id: string, payload: { startTime: string; endTime: string; realCompanions: string[] }) => Promise<void>;
  onClose: () => void;
}

export default function VisitFinalizeCard({ visit, onFinalize, onClose }: Props) {
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [companions, setCompanions] = useState("");

  const handleFinalize = async () => {
    await onFinalize(visit.id, {
      startTime,
      endTime,
      realCompanions: companions.split(",").map((c) => c.trim()).filter(Boolean),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
        <h2 className="text-lg font-bold mb-4">Finalizar Visita</h2>

        <label className="block mb-2 text-sm">Início</label>
        <input
          type="time"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          className="w-full border rounded px-3 py-2 mb-4"
        />

        <label className="block mb-2 text-sm">Fim</label>
        <input
          type="time"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          className="w-full border rounded px-3 py-2 mb-4"
        />

        <label className="block mb-2 text-sm">Companheiros (vírgula)</label>
        <input
          type="text"
          value={companions}
          onChange={(e) => setCompanions(e.target.value)}
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
            onClick={handleFinalize}
            className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Finalizar
          </button>
        </div>
      </div>
    </div>
  );
}
