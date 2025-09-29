import { Calendar, MapPin, Users, Check, Plus, X, CheckCircle2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Visit } from "@/hooks/useVisits";

interface Props {
  visit: Visit;
  onFinalize: (id: string, payload: { startTime: string; endTime: string; realCompanions: string[] }) => void;
}

function nowHHMM() {
  const d = new Date();
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

export default function VisitFinalizeCard({ visit, onFinalize }: Props) {
  // sugestões = companheiros do card
  const suggestions = useMemo(
    () => (visit.companions || []).map((c) => c.name),
    [visit.companions]
  );

  // estados locais
  const [startTime, setStartTime] = useState<string>(visit.startTime || visit.time || nowHHMM());
  const [endTime, setEndTime] = useState<string>(visit.endTime || nowHHMM());
  const [inputName, setInputName] = useState("");
  const [names, setNames] = useState<string[]>(
    suggestions.length ? [...suggestions] : []
  );
  const [confirmed, setConfirmed] = useState(false);

  const addName = (raw?: string) => {
    const n = (raw ?? inputName).trim();
    if (!n) return;
    if (!names.includes(n)) setNames((prev) => [...prev, n]);
    setInputName("");
  };

  const removeName = (n: string) => {
    setNames((prev) => prev.filter((x) => x !== n));
  };

  const handleConfirm = () => {
    if (startTime && endTime && endTime < startTime) {
      alert("A hora de fim não pode ser anterior à hora de início.");
      return;
    }
    onFinalize(visit.id, { startTime, endTime, realCompanions: names });
    setConfirmed(true);
  };

  return (
    <div className="rounded-lg border bg-white p-6 shadow-sm flex flex-col gap-5">
      <div>
        <h3 className="text-lg font-bold mb-1">{visit.location?.name || "Local"}</h3>
        <p className="flex items-center text-sm text-gray-600 mb-2">
          <MapPin className="w-4 h-4 mr-1" />
          {visit.location?.address || "Endereço não informado"}
        </p>
        <p className="flex items-center text-sm font-medium text-blue-600">
          <Calendar className="w-4 h-4 mr-1" />
          {visit.date} • Agendado: {visit.time}
        </p>
      </div>

      {/* Hora de início */}
      <div>
        <label className="block text-sm font-medium mb-1">Hora de início da visita</label>
        <div className="flex items-center gap-3">
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="border rounded px-3 py-2"
            aria-label="Hora de início da visita"
          />
          <span className="text-xs text-gray-500">Ex.: 17:00</span>
        </div>
      </div>

      {/* Hora de fim */}
      <div>
        <label className="block text-sm font-medium mb-1">Hora de fim da visita</label>
        <div className="flex items-center gap-3">
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="border rounded px-3 py-2"
            aria-label="Hora de fim da visita"
          />
          <span className="text-xs text-gray-500">Ex.: 18:15</span>
        </div>
      </div>

      {/* Companheiro(a) */}
      <div>
        <label className="block text-sm font-medium mb-2">Companheiro(a)</label>

        {/* chips atuais */}
        <div className="flex flex-wrap gap-2 mb-3">
          {names.map((n) => (
            <span
              key={n}
              className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs"
            >
              <Users className="w-3 h-3 text-gray-500" />
              {n}
              <button
                className="ml-1 text-gray-500 hover:text-red-600"
                onClick={() => removeName(n)}
                aria-label={`Remover ${n}`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          {names.length === 0 && (
            <span className="text-xs text-gray-500">Nenhum selecionado</span>
          )}
        </div>

        {/* input para adicionar livre */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Digite um nome e pressione Enter"
            value={inputName}
            onChange={(e) => setInputName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") addName();
            }}
            className="flex-1 border rounded px-3 py-2"
          />
          <button
            type="button"
            onClick={() => addName()}
            className="inline-flex items-center gap-1 rounded-md border px-3 py-2 hover:bg-gray-50"
          >
            <Plus className="w-4 h-4" />
            Adicionar
          </button>
        </div>

        {/* sugestões (nomes originais do card) */}
        {suggestions.length > 0 && (
          <div className="mt-3">
            <p className="text-xs text-gray-500 mb-1">Sugestões:</p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => addName(s)}
                  className="rounded-full bg-gray-100 px-3 py-1 text-xs hover:bg-gray-200"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <button
        onClick={handleConfirm}
        disabled={confirmed}
        className={`mt-1 flex items-center justify-center gap-2 rounded-md px-4 py-2 text-white ${
          confirmed
            ? "bg-blue-600 hover:bg-blue-600 cursor-default"
            : "bg-green-600 hover:bg-green-700"
        }`}
      >
        {confirmed ? <CheckCircle2 className="w-4 h-4" /> : <Check className="w-4 h-4" />}
        {confirmed ? "Confirmação ok." : "Confirmar Alterações"}
      </button>
    </div>
  );
}
