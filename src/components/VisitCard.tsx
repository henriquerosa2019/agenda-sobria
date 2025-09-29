import { MapPin, Calendar, Users, CheckCircle2 } from "lucide-react";

type Companion = { id?: string; name: string };
type Location = { id?: string; name?: string; address?: string };
type Visit = {
  id: string;
  location?: Location;
  displayDate?: string;  // formatada no Dashboard
  displayTime?: string;  // formatada no Dashboard
  time?: string;         // agendado (fallback)
  startTime?: string;    // execução real (se houver)
  endTime?: string;      // execução real (se houver)
  isFinalized?: boolean;
  companions?: Companion[];
};

function minutesDiff(start?: string, end?: string) {
  if (!start || !end) return null;
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  const diff = (eh * 60 + em) - (sh * 60 + sm);
  if (diff <= 0) return null;
  const h = Math.floor(diff / 60);
  const m = diff % 60;
  if (h && m) return `${h}h${String(m).padStart(2, "0")}m`;
  if (h) return `${h}h`;
  return `${m}m`;
}

export default function VisitCard({ visit }: { visit: Visit }) {
  const dur = minutesDiff(visit.startTime, visit.endTime);

  return (
    <div className="rounded-lg border bg-white p-6 shadow-sm relative">
      {/* Badge 'Realizada' */}
      {visit.isFinalized && (
        <div className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
          <CheckCircle2 className="w-3 h-3" />
          Realizada: {visit.startTime}–{visit.endTime}
          {dur ? ` (${dur})` : ""}
        </div>
      )}

      <h3 className="text-lg font-bold mb-1">
        {visit.location?.name ?? "Local"}
      </h3>

      <p className="flex items-center text-sm text-gray-600 mb-2">
        <MapPin className="w-4 h-4 mr-1" />
        {visit.location?.address ?? "Endereço não informado"}
      </p>

      <p className="flex items-center text-sm font-medium text-blue-600 mb-2">
        <Calendar className="w-4 h-4 mr-1" />
        {visit.displayDate} - {(visit.displayTime ?? visit.time)}h
      </p>

      <div className="flex items-center flex-wrap gap-2">
        <Users className="w-4 h-4 mr-1 text-gray-500" />
        {visit.companions && visit.companions.length > 0 ? (
          visit.companions.map((c, idx) => (
            <span
              key={c.id ?? idx}
              className="rounded-full bg-gray-100 px-3 py-1 text-xs"
            >
              {c.name}
            </span>
          ))
        ) : (
          <span className="text-xs text-gray-500">Nenhum companheiro</span>
        )}
      </div>
    </div>
  );
}
