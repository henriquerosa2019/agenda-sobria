// src/pages/Dashboard.tsx
import { useState, useMemo, useEffect } from "react";
import useVisits from "@/hooks/useVisits";
import { supabase } from "@/lib/supabaseClient";
import ChatGemini from "@/components/ChatGemini";
import Header from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";

// === Formata data no formato brasileiro (corrige -1 dia UTC) ===
function formatDateBRFull(dateStr?: string): string {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split("T")[0].split("-").map(Number);
    const d = new Date(year, month - 1, day); // local sem UTC offset
    const str = d.toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
  
  export default function Dashboard() {
    const { visits, companions = [], updateVisit, saveVisitChanges } = useVisits();
  
  // ====== filtros ======
  const [selectedMonth, setSelectedMonth] = useState<string>("all");
  const [selectedLocal, setSelectedLocal] = useState<string>("all");
  const [query, setQuery] = useState<string>("");

  // 🔐 Persistência simples em localStorage
  const STORAGE = {
    local: "filters.local",
    month: "filters.month",
    q: "filters.query",
  };

  // carrega filtros salvos ao montar
  useEffect(() => {
    const sl = localStorage.getItem(STORAGE.local);
    const sm = localStorage.getItem(STORAGE.month);
    const sq = localStorage.getItem(STORAGE.q);
    if (sl) setSelectedLocal(sl);
    if (sm) setSelectedMonth(sm);
    if (sq) setQuery(sq);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // salva a cada mudança
  useEffect(() => {
    localStorage.setItem(STORAGE.local, selectedLocal);
  }, [selectedLocal]);
  useEffect(() => {
    localStorage.setItem(STORAGE.month, selectedMonth);
  }, [selectedMonth]);
  useEffect(() => {
    localStorage.setItem(STORAGE.q, query);
  }, [query]);

  const clearFilters = () => {
    setSelectedLocal("all");
    setSelectedMonth("all");
    setQuery("");
  };

  // derive lista de locais a partir das visitas carregadas
  const locationOptions = useMemo(() => {
    const set = new Set<string>();
    (visits || []).forEach((v) => {
      const name = v.location?.name?.trim();
      if (name) set.add(name);
    });
    return ["all", ...Array.from(set)];
  }, [visits]);

  // meses pt-BR
  const MONTHS = [
    { value: "all", label: "Todos os meses" },
    { value: "01", label: "janeiro" },
    { value: "02", label: "fevereiro" },
    { value: "03", label: "março" },
    { value: "04", label: "abril" },
    { value: "05", label: "maio" },
    { value: "06", label: "junho" },
    { value: "07", label: "julho" },
    { value: "08", label: "agosto" },
    { value: "09", label: "setembro" },
    { value: "10", label: "outubro" },
    { value: "11", label: "novembro" },
    { value: "12", label: "dezembro" },
  ];

  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({});
  
  const [newCompanionName, setNewCompanionName] = useState<string>("");

  // toast “Edição salva!”
  const [savedVisitId, setSavedVisitId] = useState<string | null>(null);
  const showSaved = (id: string) => {
    setSavedVisitId(id);
    setTimeout(() => setSavedVisitId(null), 1800);
  };

  const toHHMM = (s?: string) => (s ? String(s).slice(0, 5) : "");

  const handleEdit = (visit: any) => {
    setEditingId(visit.id);
    setFormData({
      date: visit.date,
      time: visit.time, // Hora Início
      endTime: toHHMM((visit as any).endTime), // Hora Final Visita
      notes: visit.observation || "",
      companions:
        visit.companions?.map((c: any) => ({
          name: c.name,
          cost: c?.cost != null ? String(c.cost).replace(".", ",") : "",
        })) || [],
      _locationName: visit.location?.name || "", // mostrar Local
    });
    setNewCompanionName("");
  };

// Helpers de moeda
function parseCurrencyBR(input: string): number | undefined {
    if (!input) return undefined;
    const s = String(input)
      .trim()
      .replace(/\s+/g, "")
      .replace(/[Rr]\$?/, "")
      .replace(/\./g, "")
      .replace(",", ".");
    const n = parseFloat(s);
    return isFinite(n) ? n : undefined;
  }
  
  const getCostNumber = (val: unknown): number => {
    if (typeof val === "number" && isFinite(val)) return val;
    const n = parseCurrencyBR(String(val ?? ""));
    return typeof n === "number" && isFinite(n) ? n : 0;
  };
  
  // Função de formatação (máscara de moeda durante digitação)
  function formatCurrencyInput(value: string): string {
    let onlyNums = value.replace(/[^\d]/g, "");
    if (!onlyNums) return "";
    while (onlyNums.length < 3) onlyNums = "0" + onlyNums;
    const intPart = onlyNums.slice(0, -2);
    const decimalPart = onlyNums.slice(-2);
    return `R$ ${parseInt(intPart, 10).toLocaleString("pt-BR")},${decimalPart}`;
  }
  
  // Atualiza custo formatado no formData (sem salvar ainda)
  const handleCostChange = (e: React.ChangeEvent<HTMLInputElement>, i: number) => {
    const formatted = formatCurrencyInput(e.target.value);
    const next = [...formData.companions];
    next[i] = { ...next[i], cost: formatted };
    setFormData({ ...formData, companions: next });
  };
  
  const handleSave = async (id: string) => {
    const entries = (formData.companions || []).map((c: any) => {
        const parsedCost = parseCurrencyBR(String(c.cost ?? ""));
        return {
          name: String(c.name || "").trim(),
          cost: parsedCost ?? 0, // garante que vai número
        };
      });
      
    await saveVisitChanges(id, formData.notes, entries);
  
    if (formData.endTime) {
      await supabase.from("visits").update({ end_time: formData.endTime }).eq("id", id);
    } else {
      await supabase.from("visits").update({ end_time: null }).eq("id", id);
    }
  
    updateVisit(id, {
      date: formData.date,
      time: formData.time,
      observation: formData.notes,
      endTime: formData.endTime || undefined,
      companions: entries.map((e: any, i: number) => ({
        id: `${id}-c${i}`,
        name: e.name,
        cost: e.cost,
      })),
    });
  
    setEditingId(null);
    showSaved(id);
  };
  
  // Finalizar visita
  const handleFinalize = async (id: string) => {
    const pad = (n: number) => String(n).padStart(2, "0");
    const now = new Date();
    const nowHHMM = `${pad(now.getHours())}:${pad(now.getMinutes())}`;

    const start = formData.time && String(formData.time).length >= 4 ? formData.time : nowHHMM;
    const end = formData.endTime && String(formData.endTime).length >= 4 ? formData.endTime : nowHHMM;

    await supabase
      .from("visits")
      .update({ time: start, end_time: end, isfinalized: true })
      .eq("id", id);

    updateVisit(id, {
      time: start,
      endTime: end,
      isFinalized: true,
    });

    setEditingId(null);
    showSaved(id);
  };

  const removeCompanion = (name: string) => {
    setFormData((prev: any) => ({
      ...prev,
      companions: prev.companions.filter((c: any) => c.name !== name),
    }));
  };
  
  const handleAddCompanion = () => {
    const name = newCompanionName.trim();
    if (name && !formData.companions?.some((c: any) => c.name === name)) {
      setFormData({
        ...formData,
        companions: [...(formData.companions || []), { name, cost: "" }],
      });
      setNewCompanionName("");
    }
  };


  // ====== filtragem das visitas ======
  const filteredVisits = useMemo(() => {
    const q = query.trim().toLowerCase();

    return (visits || []).filter((v) => {
      if (selectedMonth !== "all") {
        const dParts = (v.date || "").split("-");
        const monthFromDate = dParts.length >= 2 ? dParts[1] : null;
        if (!monthFromDate || monthFromDate !== selectedMonth) return false;
      }

      if (selectedLocal !== "all") {
        const locName = v.location?.name?.trim() || "";
        if (locName !== selectedLocal) return false;
      }

      if (q) {
        const obs = (v.observation || "").toLowerCase();
        const compNames = (v.companions || [])
          .map((c: any) => (c?.name || "").toLowerCase())
          .join(" ");
        if (!obs.includes(q) && !compNames.includes(q)) return false;
      }

      return true;
    });
  }, [visits, selectedMonth, selectedLocal, query]);

  /* =========================
     Painel de dados (toggle)
     ========================= */
  const [showPanel, setShowPanel] = useState<boolean>(false);

  const currentMonth = new Date().toISOString().slice(5, 7); // "MM"
  const monthForStats = selectedMonth !== "all" ? selectedMonth : currentMonth;

  const visitsInMonth = useMemo(() => {
    return filteredVisits.filter((v) => {
      const m = (v.date || "").split("-")[1];
      return m === monthForStats;
    });
  }, [filteredVisits, monthForStats]);

  const byCompanion = useMemo(() => {
    const map = new Map<string, number>();
    for (const v of filteredVisits) {
      for (const c of (v.companions || [])) {
        const name = (c?.name || "").trim();
        if (!name) continue;
        map.set(name, (map.get(name) || 0) + 1);
      }
    }
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }));
  }, [filteredVisits]);

  const byLocation = useMemo(() => {
    const map = new Map<string, number>();
    for (const v of filteredVisits) {
      const name = (v.location?.name || "").trim();
      if (!name) continue;
      map.set(name, (map.get(name) || 0) + 1);
    }
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }));
  }, [filteredVisits]);

  // ========= Seletor de semana =========
  const [weekOffset, setWeekOffset] = useState<number>(0);

  const weekBounds = useMemo(() => {
    const base = new Date();
    base.setDate(base.getDate() + weekOffset * 7);
    const dow = base.getDay(); // 0-dom, 1-seg, ...
    const deltaToMonday = (dow + 6) % 7;
    const start = new Date(base);
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - deltaToMonday);

    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);

    return { start, end };
  }, [weekOffset]);

  const weekVisits = useMemo(() => {
    return filteredVisits.filter((v) => {
      if (!v.date) return false;
      const dt = new Date(`${v.date}T00:00:00`);
      return dt >= weekBounds.start && dt <= weekBounds.end;
    });
  }, [filteredVisits, weekBounds]);

  // helpers
  const fmtDM = (d: Date) =>
    `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
  const dmFromYYYYMMDD = (s?: string) => {
    if (!s) return "";
    const parts = s.split("-");
    if (parts.length < 3) return "";
    const [y, m, d] = parts;
    return `${d.padStart(2, "0")}/${m.padStart(2, "0")}`;
  };
  const fmtDMY = (d: Date) =>
    `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
  const hhmm = (s?: string) => (s ? String(s).slice(0, 5) : "");

  const byCompanionWeek = useMemo(() => {
    const map = new Map<
      string,
      { count: number; locations: Set<string>; details: string[] }
    >();
    for (const v of weekVisits) {
      const loc = (v.location?.name || "").trim();
      const labelDate = dmFromYYYYMMDD(v.date);
      const sched = hhmm(v.time);
      const finalized = hhmm((v as any).endTime);
      const detail = finalized ? `${labelDate} ${sched} → ${finalized}` : `${labelDate} ${sched}`;

      for (const c of (v.companions || [])) {
        const name = (c?.name || "").trim();
        if (!name) continue;

        if (!map.has(name)) {
          map.set(name, { count: 0, locations: new Set(), details: [] });
        }
        const entry = map.get(name)!;
        entry.count += 1;
        if (loc) entry.locations.add(loc);
        if (detail) entry.details.push(detail);
      }
    }
    return Array.from(map.entries())
      .map(([name, val]) => ({
        name,
        count: val.count,
        locations: Array.from(val.locations.values()).sort(),
        details: val.details,
      }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  }, [weekVisits]);

  /* ======== Custos (mantidos) ======== */
  const weekCostByCompanion = useMemo(() => {
    const m = new Map<string, number>();
    for (const v of weekVisits) {
      for (const c of v.companions || []) {
        const nm = (c?.name || "").trim();
        if (!nm) continue;
        m.set(nm, (m.get(nm) || 0) + getCostNumber(c?.cost));
      }
    }
    return Array.from(m.entries()).sort((a, b) => b[1] - a[1]);
  }, [weekVisits]);

  const weekCostByLocation = useMemo(() => {
    const m = new Map<string, number>();
    for (const v of weekVisits) {
      const loc = (v.location?.name || "").trim();
      if (!loc) continue;
      const total = (v.companions || []).reduce((acc, c) => acc + getCostNumber(c?.cost), 0);
      m.set(loc, (m.get(loc) || 0) + total);
    }
    return Array.from(m.entries()).sort((a, b) => b[1] - a[1]);
  }, [weekVisits]);

  const monthVisits = useMemo(() => visitsInMonth, [visitsInMonth]);

  const monthCostByCompanion = useMemo(() => {
    const m = new Map<string, number>();
    for (const v of monthVisits) {
      for (const c of v.companions || []) {
        const nm = (c?.name || "").trim();
        if (!nm) continue;
        m.set(nm, (m.get(nm) || 0) + getCostNumber(c?.cost));
      }
    }
    return Array.from(m.entries()).sort((a, b) => b[1] - a[1]);
  }, [monthVisits]);

  const monthCostByLocation = useMemo(() => {
    const m = new Map<string, number>();
    for (const v of monthVisits) {
      const loc = (v.location?.name || "").trim();
      if (!loc) continue;
      const total = (v.companions || []).reduce((acc, c) => acc + getCostNumber(c?.cost), 0);
      m.set(loc, (m.get(loc) || 0) + total);
    }
    return Array.from(m.entries()).sort((a, b) => b[1] - a[1]);
  }, [monthVisits]);

  const currency = (n: number) =>
    (n || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const lastFinalizedByLocation = useMemo(() => {
    const map = new Map<string, Date>();
    for (const v of filteredVisits) {
      const loc = (v.location?.name || "").trim();
      if (!loc) continue;
      const finalized = Boolean((v as any).isFinalized) || Boolean((v as any).endTime);
      if (!finalized) continue;
      if (!v.date) continue;

      const hh = (v as any).endTime || v.time || "00:00";
      const dt = new Date(`${v.date}T${String(hh).slice(0, 5)}:00`);
      const prev = map.get(loc);
      if (!prev || dt > prev) map.set(loc, dt);
    }
    return map;
  }, [filteredVisits]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header
        className="bg-[#123A73] text-white shadow-md flex items-center justify-between px-6 py-3"
        style={{ fontFamily: "'Playfair Display', serif" }}
      >
        <div className="flex items-center space-x-3">
          <img
            src="/assets/aa-logo.png"
            alt="Logo AA CTO DS17"
            className="h-[150px] md:h-[180px] w-auto object-contain rounded-full bg-white/95 p-3 shadow-md border border-white/60"
          />
        </div>
        <h3 className="flex-1 text-center text-xl md:text-2xl font-semibold text-[#E3E3E3] tracking-wide">
          📅 PLANEJAMENTO DE VISITAS - CTO DS17 - ÁREA RJ
        </h3>
        <div className="w-10" />
      </header>

      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold mb-4">📌 Gestão de Visitas - use os filtros para buscas</h1>

          <div className="mb-2 grid grid-cols-1 md:grid-cols-5 gap-3">
            <select
              value={selectedLocal}
              onChange={(e) => setSelectedLocal(e.target.value)}
              className="border rounded px-3 py-2 bg-white"
              aria-label="Filtrar por local"
            >
              {locationOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt === "all" ? "Todos os locais" : opt}
                </option>
              ))}
            </select>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="border rounded px-3 py-2 bg-white"
              aria-label="Filtrar por mês"
            >
              {MONTHS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por observação ou companheiro..."
              className="border rounded px-3 py-2 col-span-1 md:grid-cols-none md:col-span-2 bg-white"
              aria-label="Buscar por observação ou companheiro"
            />
            <div className="flex gap-2">
              <button
                onClick={clearFilters}
                className="border rounded px-3 py-2 bg-gray-100 hover:bg-gray-200"
                aria-label="Limpar filtros"
                title="Limpar filtros"
              >
                Limpar filtros
              </button>
              <button
                onClick={() => setShowPanel((s) => !s)}
                className="border rounded px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700"
                aria-label="Alternar painel de dados"
                title="Painel de dados"
              >
                {showPanel ? "Ocultar painel" : "Painel de dados"}
              </button>
            </div>
          </div>

          {showPanel && (
            <section className="mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="rounded-lg border p-5 bg-blue-50 text-black shadow-sm">
                  <p className="text-base md:text-lg font-semibold">Visitas neste mês</p>
                  <p className="mt-1 text-4xl md:text-5xl font-extrabold leading-none">
                    {visitsInMonth.length}
                  </p>
                  <p className="mt-2 text-sm md:text-base font-medium">
                    Mês: {selectedMonth !== "all" ? selectedMonth : currentMonth}
                    {selectedMonth === "all" ? " (atual)" : ""}
                  </p>
                </div>

                <div className="rounded-lg border p-5 bg-blue-50 text-black shadow-sm">
                  <p className="text-base md:text-lg font-semibold">Todas (após filtros)</p>
                  <p className="mt-1 text-4xl md:text-5xl font-extrabold leading-none">
                    {filteredVisits.length}
                  </p>
                </div>

                <div className="rounded-lg border p-5 bg-blue-50 text-black shadow-sm">
                  <p className="text-base md:text-lg font-semibold">Locais distintos (após filtros)</p>
                  <p className="mt-1 text-4xl md:text-5xl font-extrabold leading-none">
                    {
                      new Set(
                        filteredVisits
                          .map((v) => v.location?.name?.trim())
                          .filter(Boolean) as string[]
                      ).size
                    }
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-lg border bg-white">
                  <div className="p-4 border-b">
                    <h3 className="font-semibold">Visitas por companheiro</h3>
                    <p className="text-xs text-gray-500">
                      Considera filtros aplicados acima
                    </p>
                  </div>
                  <div className="p-4">
                    {byCompanion.length === 0 ? (
                      <p className="text-sm text-gray-500">Sem dados.</p>
                    ) : (
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-left text-gray-500">
                            <th className="py-1">Companheiro</th>
                            <th className="py-1 w-24">Visitas</th>
                          </tr>
                        </thead>
                        <tbody>
                          {byCompanion.map((row) => (
                            <tr key={row.name} className="border-t">
                              <td className="py-1">{row.name}</td>
                              <td className="py-1">{row.count}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>

                <div className="rounded-lg border bg-white">
                  <div className="p-4 border-b">
                    <h3 className="font-semibold">Visitas por local</h3>
                    <p className="text-xs text-gray-500">
                      Considera filtros aplicados acima
                    </p>
                  </div>
                  <div className="p-4">
                    {byLocation.length === 0 ? (
                      <p className="text-sm text-gray-500">Sem dados.</p>
                    ) : (
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-left text-gray-500">
                            <th className="py-1">Local</th>
                            <th className="py-1 w-24">Visitas</th>
                            <th className="py-1 w-40">Finalizada (última)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {byLocation.map((row) => {
                            const last = lastFinalizedByLocation.get(row.name);
                            return (
                              <tr key={row.name} className="border-t">
                                <td className="py-1">{row.name}</td>
                                <td className="py-1">{row.count}</td>
                                <td className="py-1">
                                  {last ? fmtDMY(last) : "—"}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              </div>

              <div className="rounded-lg border bg-white mt-4">
                <div className="p-4 border-b flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                  <div>
                    <h3 className="font-semibold">
                      Visitas na semana por companheiro{" "}
                      <span className="text-xs text-gray-500">
                        ({fmtDM(weekBounds.start)} – {fmtDM(weekBounds.end)})
                      </span>
                    </h3>
                    <p className="text-xs text-gray-500">
                      Inclui visitas passadas e futuras desta semana, considerando os filtros acima.
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setWeekOffset((w) => w - 1)}
                      className="border rounded px-3 py-1 bg-gray-50 hover:bg-gray-100"
                    >
                      ⟵ Anterior
                    </button>
                    <button
                      onClick={() => setWeekOffset(0)}
                      className="border rounded px-3 py-1 bg-gray-50 hover:bg-gray-100"
                    >
                      Esta semana
                    </button>
                    <button
                      onClick={() => setWeekOffset((w) => w + 1)}
                      className="border rounded px-3 py-1 bg-gray-50 hover:bg-gray-100"
                    >
                      Próxima ⟶
                    </button>
                  </div>
                </div>

                <div className="p-4">
                  {byCompanionWeek.length === 0 ? (
                    <p className="text-sm text-gray-500">Sem dados para a semana selecionada.</p>
                  ) : (
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-gray-500">
                          <th className="py-1">Companheiro</th>
                          <th className="py-1 w-28">Qtde semana</th>
                          <th className="py-1">Datas & horas</th>
                          <th className="py-1">Locais</th>
                        </tr>
                      </thead>
                      <tbody>
                        {byCompanionWeek.map((row) => (
                          <tr key={row.name} className="border-t">
                            <td className="py-1 align-top">{row.name}</td>
                            <td className="py-1 align-top">{row.count}</td>
                            <td className="py-1 align-top">
                              {row.details.length > 0 ? (
                                <div className="flex flex-col gap-1">
                                  {row.details.map((d, i) => (
                                    <span key={i}>{d}</span>
                                  ))}
                                </div>
                              ) : (
                                "—"
                              )}
                            </td>
                            <td className="py-1 align-top">
                              {row.locations.length > 0 ? row.locations.join(", ") : "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="rounded-lg border bg-white">
                  <div className="p-4 border-b">
                    <h3 className="font-semibold">
                      Gastos na semana — por companheiro
                      <span className="text-xs text-gray-500">
                        {" "}
                        ({fmtDM(weekBounds.start)} – {fmtDM(weekBounds.end)})
                      </span>
                    </h3>
                  </div>
                  <div className="p-4">
                    {weekCostByCompanion.length === 0 ? (
                      <p className="text-sm text-gray-500">Sem dados.</p>
                    ) : (
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-left text-gray-500">
                            <th className="py-1">Companheiro</th>
                            <th className="py-1 w-32">Gasto</th>
                          </tr>
                        </thead>
                        <tbody>
                          {weekCostByCompanion.map(([name, total]) => (
                            <tr key={name} className="border-t">
                              <td className="py-1">{name}</td>
                              <td className="py-1">{currency(total)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>

                <div className="rounded-lg border bg-white">
                  <div className="p-4 border-b">
                    <h3 className="font-semibold">
                      Gastos na semana — por local
                      <span className="text-xs text-gray-500">
                        {" "}
                        ({fmtDM(weekBounds.start)} – {fmtDM(weekBounds.end)})
                      </span>
                    </h3>
                  </div>
                  <div className="p-4">
                    {weekCostByLocation.length === 0 ? (
                      <p className="text-sm text-gray-500">Sem dados.</p>
                    ) : (
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-left text-gray-500">
                            <th className="py-1">Local</th>
                            <th className="py-1 w-32">Gasto</th>
                          </tr>
                        </thead>
                        <tbody>
                          {weekCostByLocation.map(([loc, total]) => (
                            <tr key={loc} className="border-t">
                              <td className="py-1">{loc}</td>
                              <td className="py-1">{currency(total)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>

                <div className="rounded-lg border bg-white">
                  <div className="p-4 border-b">
                    <h3 className="font-semibold">
                      Gastos no mês — por companheiro{" "}
                      <span className="text-xs text-gray-500">(mês: {monthForStats})</span>
                    </h3>
                  </div>
                  <div className="p-4">
                    {monthCostByCompanion.length === 0 ? (
                      <p className="text-sm text-gray-500">Sem dados.</p>
                    ) : (
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-left text-gray-500">
                            <th className="py-1">Companheiro</th>
                            <th className="py-1 w-32">Gasto</th>
                          </tr>
                        </thead>
                        <tbody>
                          {monthCostByCompanion.map(([name, total]) => (
                            <tr key={name} className="border-t">
                              <td className="py-1">{name}</td>
                              <td className="py-1">{currency(total)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>

                <div className="rounded-lg border bg-white">
                  <div className="p-4 border-b">
                    <h3 className="font-semibold">
                      Gastos no mês — por local{" "}
                      <span className="text-xs text-gray-500">(mês: {monthForStats})</span>
                    </h3>
                  </div>
                  <div className="p-4">
                    {monthCostByLocation.length === 0 ? (
                      <p className="text-sm text-gray-500">Sem dados.</p>
                    ) : (
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-left text-gray-500">
                            <th className="py-1">Local</th>
                            <th className="py-1 w-32">Gasto</th>
                          </tr>
                        </thead>
                        <tbody>
                          {monthCostByLocation.map(([loc, total]) => (
                            <tr key={loc} className="border-t">
                              <td className="py-1">{loc}</td>
                              <td className="py-1">{currency(total)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              </div>
            </section>
          )}

          {!showPanel && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredVisits.map((visit) => (
                <div
                  key={visit.id}
                  className="border rounded-lg p-4 shadow-sm bg-white"
                  style={{ minHeight: "180px" }}
                >
                  {editingId === visit.id ? (
                    <>
                      <h2 className="font-bold text-lg mb-2">Editar Visita</h2>
                      <input
                        type="text"
                        value={formData._locationName || ""}
                        disabled
                        className="border p-2 rounded w-full mb-2 text-gray-800 bg-gray-50"
                      />
                      <input
                        type="date"
                        value={formData.date}
                        onChange={(e) =>
                          setFormData({ ...formData, date: e.target.value })
                        }
                        className="border p-2 rounded w-full mb-2"
                      />
                      <label className="text-sm font-medium text-gray-700 mb-1 block">
                        Hora Início
                      </label>
                      <input
                        type="time"
                        value={formData.time}
                        onChange={(e) =>
                          setFormData({ ...formData, time: e.target.value })
                        }
                        className="border p-2 rounded w-full mb-2"
                      />
                      <label className="text-sm font-medium text-gray-700 mb-1 block">
                        Hora Final Visita
                      </label>
                      <input
                        type="time"
                        value={formData.endTime || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, endTime: e.target.value })
                        }
                        className="border p-2 rounded w-full mb-2"
                      />
                      <div className="flex items-center gap-2 mb-2">
                        <input
                          type="text"
                          list="companions-list"
                          placeholder="Adicionar companheiro"
                          className="border p-2 rounded w-full"
                          value={newCompanionName}
                          onChange={(e) => setNewCompanionName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddCompanion();
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={handleAddCompanion}
                          className="bg-blue-600 text-white px-4 py-2 rounded"
                        >
                          OK
                        </button>
                      </div>
                      <datalist id="companions-list">
                        {(companions || []).map((c: any) => (
                          <option key={c.id} value={c.name} />
                        ))}
                      </datalist>
                      <div className="space-y-2 mb-2">
                        {(formData.companions || []).map((c: any, i: number) => (
                          <div key={i} className="flex items-center gap-2">
                            <span className="px-2 py-1 rounded bg-blue-100 text-blue-800 text-sm">
                              {c.name}
                            </span>
                            <input
                              type="text"
                              inputMode="decimal"
                              placeholder="Ajuda de Custo (ex: R$15,00)"
                              value={c.cost ?? ""}
                              onChange={(e) => handleCostChange(e, i)}
                              className="border p-2 rounded text-sm w-44"
                            />
                            <button
                              onClick={() => removeCompanion(c.name)}
                              className="ml-1 text-red-500 font-bold"
                              title="Remover"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                      <textarea
                        value={formData.notes}
                        onChange={(e) =>
                          setFormData({ ...formData, notes: e.target.value })
                        }
                        placeholder="Digite uma observação"
                        className="border p-2 rounded w-full mb-2"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSave(visit.id)}
                          className="bg-green-600 text-white px-3 py-1 rounded"
                        >
                          Salvar
                        </button>
                        <button
                          onClick={() => handleFinalize(visit.id)}
                          className="bg-indigo-600 text-white px-3 py-1 rounded"
                          title="Grava início, fim e marca como finalizada"
                        >
                          Finalizar visita
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <h2 className="font-bold text-lg">{visit.location?.name}</h2>
                      <p className="text-gray-700 text-base">
                        {visit.location?.address}
                      </p>
                      <p className="text-gray-700 text-base mb-2">
                        📅 {formatDateBRFull(visit.date)} às {visit.time}
                        {visit.endTime ? ` → ${visit.endTime}` : ""}
                        {(visit.isFinalized || visit.endTime) && (
                          <span className="ml-2 inline-flex items-center rounded bg-green-100 text-green-800 px-2 py-0.5 text-xs font-medium">
                            Visita finalizada
                          </span>
                        )}
                      </p>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {visit.companions?.map((c) => (
                          <span
                            key={c.id}
                            className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm"
                          >
                            {c.name}
                            {typeof c.cost === "number" &&
                            isFinite(c.cost)
                              ? ` — R$ ${c.cost
                                  .toFixed(2)
                                  .replace(".", ",")}`
                              : ""}
                          </span>
                        ))}
                      </div>
                      {visit.observation && (
                        <p className="text-gray-600 italic text-base leading-relaxed">
                          Observação:{" "}
                          <span className="text-red-600 not-italic font-normal">
                            {visit.observation}
                          </span>
                        </p>
                      )}
                      <button
                        onClick={() => handleEdit(visit)}
                        className="bg-blue-600 text-white px-3 py-1 rounded mt-2"
                      >
                        Editar
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <footer className="bg-[#123A73] text-white">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <h2 className="text-white font-semibold text-lg md:text-xl leading-snug">
            Nosso Propósito primordial é mantermo-nos sóbrios e ajudar outros a
            alcançarem a sobriedade
          </h2>
        </div>
      </footer>
      <ChatGemini />
    </div>
  );
}