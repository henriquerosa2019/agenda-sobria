import { useState, useMemo, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import VisitCard from "@/components/VisitCard";
import VisitFinalizeCard from "@/components/VisitFinalizeCard";
import useVisits from "@/hooks/useVisits";
import { Loader2, Plus, X, Save, Check, CopyPlus } from "lucide-react";

/* ===== Helpers (datas no fuso LOCAL) ===== */
function parseLocalYMD(ymd?: string) {
  if (!ymd) return null;
  const parts = ymd.split("T")[0];
  const [y, m, d] = parts.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}
function toLocalDateTime(date?: string, time?: string) {
  if (!date) return new Date(0);
  const [y, m, d] = date.split("T")[0].split("-").map(Number);
  let hh = 0;
  let mm = 0;
  if (time) {
    const [h, min] = time.split(":");
    hh = Number(h || 0);
    mm = Number(min || 0);
  }
  return new Date(y, m - 1, d, hh, mm);
}
const fmtDate = (ymd?: string) => {
  const dt = parseLocalYMD(ymd);
  return dt
    ? new Intl.DateTimeFormat("pt-BR", {
        weekday: "long",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).format(dt)
    : "";
};
const fmtTime = (t?: string) => (t ? t.slice(0, 5) : "");
/* ========================================= */

export default function Dashboard() {
  const { visits, locations, isLoading, finalizeVisit, updateVisit, addVisit } = useVisits();

  // views: agenda | configurar | finalizar | analitico
  const [view, setView] = useState<"agenda" | "configurar" | "finalizar" | "analitico">("agenda");
  const [selectedLocation, setSelectedLocation] = useState("all");

  // clique no "Dashboard" do Header -> painel analítico
  const handleHeaderDashboardClick = () => setView("analitico");

  const filteredVisits = useMemo(() => {
    const base =
      selectedLocation === "all"
        ? visits
        : visits.filter((v) => v.location?.id === selectedLocation);
    return [...base].sort(
      (a: any, b: any) =>
        toLocalDateTime(a.date, a.time).getTime() -
        toLocalDateTime(b.date, b.time).getTime()
    );
  }, [visits, selectedLocation]);

  const totalVisits = visits.length;
  const totalLocations = new Set(visits.map((v: any) => v.location?.id)).size;
  const totalCompanions = new Set(
    visits.flatMap((v: any) => v.companions || []).map((c: any) => c.name)
  ).size;

  /* ======= MÊS DE REFERÊNCIA DO PAINEL =======
     1) tenta mês/ano atuais;
     2) se não houver visitas, usa o mês/ano da visita mais recente. */
  const { refYear, refMonth } = useMemo(() => {
    const now = new Date();
    const yNow = now.getFullYear();
    const mNow = now.getMonth();

    const hasCurrentMonth = visits.some((v) => {
      const d = parseLocalYMD(v.date);
      return d && d.getFullYear() === yNow && d.getMonth() === mNow;
    });

    if (hasCurrentMonth) return { refYear: yNow, refMonth: mNow };

    const allDates = visits
      .map((v) => parseLocalYMD(v.date))
      .filter(Boolean) as Date[];

    if (allDates.length === 0) return { refYear: yNow, refMonth: mNow };

    const latest = allDates.sort((a, b) => b.getTime() - a.getTime())[0];
    return { refYear: latest.getFullYear(), refMonth: latest.getMonth() };
  }, [visits]);

  /* ======= Métricas do painel analítico ======= */
  const monthVisits = useMemo(
    () =>
      visits.filter((v) => {
        const d = parseLocalYMD(v.date);
        return d && d.getFullYear() === refYear && d.getMonth() === refMonth;
      }),
    [visits, refYear, refMonth]
  );

  // ORDENADO por dia/mês/ano
  const monthVisitsSorted = useMemo(
    () =>
      [...monthVisits].sort(
        (a, b) =>
          toLocalDateTime(a.date, a.time).getTime() -
          toLocalDateTime(b.date, b.time).getTime()
      ),
    [monthVisits]
  );

  const monthVisitCount = monthVisits.length;
  const monthLocationsCount = new Set(monthVisits.map((v) => v.location?.id)).size;

  const monthCompanionsAll = monthVisits.flatMap((v) => v.companions || []);
  const monthCompanionsUnique = new Set(monthCompanionsAll.map((c) => c.name)).size;
  const monthCompanionsAvg =
    monthVisitCount === 0
      ? 0
      : Math.round(
          (monthVisits.reduce((acc, v) => acc + ((v.companions || []).length), 0) / monthVisitCount) * 100
        ) / 100;

  const monthFinalized = monthVisits.filter((v) => v.isFinalized).length;

  // Frequência de todos os companheiros (sem slice -> mostra todos)
  const companionsFreq = useMemo(() => {
    const freq: Record<string, number> = {};
    monthCompanionsAll.forEach((c) => {
      const k = (c.name || "").trim();
      if (!k) return;
      freq[k] = (freq[k] ?? 0) + 1;
    });
    // ordena por maior frequência e, em caso de empate, por nome
    return Object.entries(freq).sort((a, b) => (b[1] - a[1]) || a[0].localeCompare(b[0]));
  }, [monthCompanionsAll]);

  const painelMesRotulo = useMemo(() => {
    const dt = new Date(refYear, refMonth, 1);
    return new Intl.DateTimeFormat("pt-BR", { month: "2-digit", year: "numeric" }).format(dt);
  }, [refYear, refMonth]);

  return (
    <div className="flex min-h-screen flex-col">
      {/* clique do 'Dashboard' abre o painel */}
      <Header onDashboardClick={handleHeaderDashboardClick} />

      <main className="container mx-auto flex-1 px-4 py-8">
        {/* Resumo geral */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          <SummaryCard title="Visitas Agendadas" value={totalVisits} emoji="📅" />
          <SummaryCard title="Locais Diferentes" value={totalLocations} emoji="📍" />
          <SummaryCard title="Companheiros Ativos" value={totalCompanions} emoji="🧑‍🤝‍🧑" />
        </div>

        {/* Tabs simples */}
        <div className="mb-4 inline-flex rounded-md border bg-white p-1 shadow-sm">
          <button
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              view === "agenda" ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-100"
            }`}
            onClick={() => setView("agenda")}
          >
            📋 Agenda
          </button>
          <button
            className={`ml-1 px-4 py-2 rounded-md text-sm font-medium ${
              view === "configurar" ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-100"
            }`}
            onClick={() => setView("configurar")}
          >
            ⚙️ Configurar
          </button>
          <button
            className={`ml-1 px-4 py-2 rounded-md text-sm font-medium ${
              view === "finalizar" ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-100"
            }`}
            onClick={() => setView("finalizar")}
          >
            ✅ Finalizar
          </button>
          <button
            className={`ml-1 px-4 py-2 rounded-md text-sm font-medium ${
              view === "analitico" ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-100"
            }`}
            onClick={() => setView("analitico")}
          >
            📊 Painel
          </button>
        </div>

        {/* ---------- AGENDA ---------- */}
        {view === "agenda" && (
          <section>
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <label className="text-sm">Local:</label>
                <select
                  className="rounded-md border px-3 py-2"
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                >
                  <option value="all">Todos os Locais</option>
                  {locations.map((loc: any) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={() => setView("configurar")}
                className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                ⚙️ Configurar
              </button>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <>
                <h2 className="mb-4 text-xl font-bold">Agenda de Visitas - Setembro 2024</h2>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {filteredVisits.map((visit: any) => (
                    <div key={visit.id} className="space-y-2">
                      <VisitCard
                        visit={{
                          ...visit,
                          displayDate: fmtDate(visit.date),
                          displayTime: fmtTime(visit.time),
                        }}
                      />
                      {visit.observation && visit.observation.trim() !== "" && (
                        <div className="rounded-md border bg-yellow-50 px-3 py-2 text-sm text-yellow-900">
                          <span className="mr-1">📝</span>
                          <span className="font-medium">Observação:</span>{" "}
                          <span>{visit.observation}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </section>
        )}

        {/* ---------- CONFIGURAR ---------- */}
        {view === "configurar" && (
          <section>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <>
                <h2 className="mb-4 text-xl font-bold">
                  Configurar Visitas (criar nova ou editar existente)
                </h2>
                <p className="text-sm text-gray-600 mb-4">
                  Edite data e hora, gerencie companheiros(as) e adicione observação. Clique em
                  <b> Salvar</b> para atualizar a visita atual ou em
                  <b> Adicionar como nova visita</b> para criar outra linha na agenda.
                </p>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
                  {filteredVisits.map((v: any) => (
                    <VisitInlineConfig
                      key={v.id}
                      visit={v}
                      onSave={(upd) => updateVisit(v.id, upd)}
                      onAdd={(payload) =>
                        addVisit({
                          date: payload.date,
                          time: payload.time,
                          location: v.location,
                          companions: payload.companions?.map((c: any, i: number) => ({
                            id: c.id ?? `${v.id}-new-${i}`,
                            name: c.name,
                          })),
                          observation: payload.observation,
                        })
                      }
                    />
                  ))}
                </div>
              </>
            )}
          </section>
        )}

        {/* ---------- FINALIZAR ---------- */}
        {view === "finalizar" && (
          <section>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <>
                <h2 className="mb-4 text-xl font-bold">Finalizar Visitas</h2>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {visits.map((visit: any) => (
                    <VisitFinalizeCard
                      key={visit.id}
                      visit={{
                        ...visit,
                        displayDate: fmtDate(visit.date),
                        displayTime: fmtTime(visit.time),
                      }}
                      onFinalize={(id, payload) => finalizeVisit(id, payload)}
                    />
                  ))}
                </div>
              </>
            )}
          </section>
        )}

        {/* ---------- ANALÍTICO (Painel) ---------- */}
        {view === "analitico" && (
          <section>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <>
                <h2 className="mb-4 text-xl font-bold">Painel — {painelMesRotulo}</h2>

                {/* Cards principais do mês */}
                <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-3 lg:grid-cols-4">
                  <SummaryCard title="Visitas no mês" value={monthVisitCount} emoji="🗓️" />
                  <SummaryCard title="Locais no mês" value={monthLocationsCount} emoji="📍" />
                  <SummaryCard title="Companheiros únicos" value={monthCompanionsUnique} emoji="👥" />
                  <SummaryCard
                    title="Média companheiros/visita"
                    value={Number.isFinite(monthCompanionsAvg) ? monthCompanionsAvg : 0}
                    emoji="➗"
                  />
                </div>

                {/* Detalhes */}
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Companheiros do mês com frequência */}
                  <div className="rounded-lg border bg-white p-5 shadow-sm">
                    <h3 className="text-base font-semibold mb-3">
                      Companheiros(as) CTO e Número de Visita
                    </h3>
                    {companionsFreq.length === 0 ? (
                      <p className="text-sm text-gray-500">Sem dados no mês.</p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {companionsFreq.map(([name, count]) => {
                          const initials = (name || "")
                            .split(" ")
                            .filter(Boolean)
                            .map((p) => p[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase();
                          return (
                            <div
                              key={name}
                              className="flex items-center justify-between rounded-md border px-3 py-2 hover:bg-gray-50"
                            >
                              <div className="flex items-center gap-3">
                                <div className="h-8 w-8 shrink-0 rounded-full bg-blue-100 text-blue-700 grid place-items-center font-semibold">
                                  {initials}
                                </div>
                                <span className="text-sm">{name}</span>
                              </div>
                              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs">
                                {count}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Visitas do mês ordenadas + chips de companheiros */}
                  <div className="rounded-lg border bg-white p-5 shadow-sm">
                    <h3 className="text-base font-semibold mb-3">
                      Visitas do mês (companheiros por visita)
                    </h3>
                    {monthVisitsSorted.length === 0 ? (
                      <p className="text-sm text-gray-500">Sem visitas no mês.</p>
                    ) : (
                      <ul className="space-y-2">
                        {monthVisitsSorted.map((v) => (
                          <li key={v.id} className="flex flex-col gap-1 rounded-md border px-3 py-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm">
                                {fmtDate(v.date)} — {v.location?.name}
                              </span>
                              <span className="rounded bg-gray-100 px-2 py-0.5 text-xs">
                                {(v.companions || []).length} companheiros
                              </span>
                            </div>
                            <div className="mt-1 flex flex-wrap gap-1">
                              {(v.companions || []).map((c: any, idx: number) => (
                                <span
                                  key={`${v.id}-${idx}-${c.name}`}
                                  className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px]"
                                >
                                  {c.name}
                                </span>
                              ))}
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                    <p className="mt-4 text-sm text-gray-600">
                      Finalizadas no mês: <b>{monthFinalized}</b>
                    </p>
                  </div>
                </div>
              </>
            )}
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}

function SummaryCard({
  title,
  value,
  emoji,
}: {
  title: string;
  value: number | string;
  emoji: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border bg-gray-50 p-6">
      <div>
        <p className="text-sm text-gray-600">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
      <span className="text-3xl">{emoji}</span>
    </div>
  );
}

/* ===== Inline editor para Configurar ===== */
function VisitInlineConfig({
  visit,
  onSave,
  onAdd,
}: {
  visit: any;
  onSave: (updated: Partial<any>) => void;
  onAdd: (payload: {
    date: string;
    time: string;
    companions?: { id?: string; name: string }[];
    observation?: string;
  }) => void;
}) {
  const [dateStr, setDateStr] = useState<string>(visit.date || "");
  const [timeStr, setTimeStr] = useState<string>(visit.time || "");

  const [names, setNames] = useState<string[]>(
    (visit.companions || []).map((c: any) => c.name)
  );
  const [inputName, setInputName] = useState("");
  const [observation, setObservation] = useState<string>(visit.observation || "");

  const [saved, setSaved] = useState(false);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    setObservation(visit.observation ?? "");
  }, [visit.observation]);

  const addName = (raw?: string) => {
    const n = (raw ?? inputName).trim();
    if (!n) return;
    if (!names.includes(n)) setNames((prev) => [...prev, n]);
    setInputName("");
  };
  const removeName = (n: string) => {
    setNames((prev) => prev.filter((x) => x !== n));
  };

  const validate = () => {
    if (!dateStr) {
      alert("Informe a data da visita.");
      return false;
    }
    if (!timeStr) {
      alert("Informe a hora agendada da visita.");
      return false;
    }
    return true;
  };

  const handleSave = () => {
    if (!validate()) return;
    onSave({
      date: dateStr,
      time: timeStr,
      companions: names.map((name: string, i: number) => ({
        id: `${visit.id}-cfg-${i}`,
        name,
      })),
      observation,
    });
    setAdded(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const handleAdd = () => {
    if (!validate()) return;
    onAdd({
      date: dateStr,
      time: timeStr,
      companions: names.map((n) => ({ name: n })),
      observation,
    });
    setSaved(false);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="rounded-lg border bg-white p-5 shadow-sm">
      <h3 className="text-base font-semibold mb-1">{visit.location?.name || "Local"}</h3>
      <p className="text-xs text-gray-600 mb-3">
        {visit.location?.address || "Endereço não informado"}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-1">Data da visita</label>
          <input
            type="date"
            value={dateStr}
            onChange={(e) => setDateStr(e.target.value)}
            className="w-full border rounded px-3 py-2"
            aria-label="Data da visita"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Hora agendada</label>
          <input
            type="time"
            value={timeStr}
            onChange={(e) => setTimeStr(e.target.value)}
            className="w-full border rounded px-3 py-2"
            aria-label="Hora agendada da visita"
          />
        </div>
      </div>

      <label className="block text-sm font-medium mb-2">Companheiros(as)</label>
      <div className="flex flex-wrap gap-2 mb-3">
        {names.map((n) => (
          <span
            key={n}
            className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs"
          >
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
          <span className="text-xs text-gray-500">Nenhum companheiro(a)</span>
        )}
      </div>

      <div className="flex items-center gap-2 mb-4">
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
          <Plus className="w-4 h-4" /> Adicionar
        </button>
      </div>

      <label className="block text-sm font-medium mb-2">Observação</label>
      <textarea
        value={observation}
        onChange={(e) => setObservation(e.target.value)}
        rows={3}
        className="w-full border rounded px-3 py-2 mb-4"
        placeholder="Digite uma observação sobre a visita (opcional)"
      />

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleSave}
          className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-white ${
            saved ? "bg-green-600" : "bg-blue-600 hover:bg-blue-700"
          }`}
          title="Atualiza a visita atual com os dados informados"
        >
          {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saved ? "Salvo!" : "Salvar"}
        </button>

        <button
          type="button"
          onClick={handleAdd}
          className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-white ${
            added ? "bg-green-600" : "bg-indigo-600 hover:bg-indigo-700"
          }`}
          title="Cria uma nova visita com os dados informados"
        >
          <CopyPlus className="w-4 h-4" />
          {added ? "Adicionada!" : "Adicionar como nova visita"}
        </button>
      </div>
    </div>
  );
}
