// src/hooks/useVisits.ts
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export interface Visit {
  id: string;
  date: string;            // YYYY-MM-DD
  time: string;            // HH:mm (agendado)
  location?: { id: string; name: string; address: string };
  companions?: { id: string; name: string }[];
  // execução real (Finalizar)
  startTime?: string;      // HH:mm
  endTime?: string;        // HH:mm
  isFinalized?: boolean;
  // Configurar
  observation?: string;
}

/* ========== Helpers de normalização ========== */
function onlyDate(input?: string): string {
  if (!input) return "";
  const ymd = String(input).split("T")[0];
  const [y, m, d] = ymd.split("-").map(Number);
  if (!y || !m || !d) return "";
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

function onlyTime(input?: string): string {
  if (!input) return "";
  return String(input).slice(0, 5); // HH:mm
}

function normalizeCompanions(raw: any, visitId: string) {
  if (!raw) return [] as { id: string; name: string }[];
  if (Array.isArray(raw)) {
    return raw
      .map((c, i) =>
        typeof c === "string"
          ? { id: `${visitId}-c${i}`, name: c }
          : { id: c?.id ?? `${visitId}-c${i}`, name: c?.name ?? String(c) }
      )
      .filter((c) => c.name && c.name.trim() !== "");
  }
  return [];
}

function normalizeVisit(v: any, idx: number): Visit {
  const id = String(v?.id ?? v?.uuid ?? idx);

  const date =
    onlyDate(v?.date) ||
    onlyDate(v?.startDate) ||
    onlyDate(v?.visitDate) ||
    onlyDate(v?.data);

  const time =
    onlyTime(v?.time) || onlyTime(v?.startTime) || onlyTime(v?.hora) || "";

  const location = v?.location ?? {
    id: v?.locationId ?? "",
    name: v?.locationName ?? "Local",
    address: v?.address ?? "",
  };

  const companions = normalizeCompanions(
    v?.companions ?? v?.companheiros ?? v?.members ?? v?.pessoas,
    id
  );

  const startTime = onlyTime(v?.realStartTime ?? v?.startTimeReal ?? v?.startTime);
  const endTime   = onlyTime(v?.realEndTime   ?? v?.endTimeReal   ?? v?.endTime);
  const isFinalized = Boolean(v?.isFinalized);

  const observation =
    typeof v?.observation === "string" ? v.observation : undefined;

  return { id, date, time, location, companions, startTime, endTime, isFinalized, observation };
}
/* ============================================= */

export default function useVisits() {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [locations, setLocations] = useState<{ id: string; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Finaliza (grava hora real e companheiros reais)
  const finalizeVisit = async (
    id: string,
    payload: { startTime: string; endTime: string; realCompanions: string[] }
  ) => {
    const updates = {
      startTime: payload.startTime,
      endTime: payload.endTime,
      isFinalized: true,
      companions: payload.realCompanions.map((name, i) => ({
        id: `${id}-real-${i}`,
        name: name.trim(),
      })),
    };

    const { error } = await supabase.from("visits").update(updates).eq("id", id);
    if (error) console.error("Erro ao finalizar visita:", error.message);

    setVisits((prev) => prev.map((v) => (v.id === id ? { ...v, ...updates } : v)));
  };

  // Atualiza uma visita existente
  const updateVisit = async (id: string, updated: Partial<Visit>) => {
    const { error } = await supabase.from("visits").update(updated).eq("id", id);
    if (error) console.error("Erro ao atualizar visita:", error.message);

    setVisits((prev) => prev.map((v) => (v.id === id ? { ...v, ...updated } : v)));
  };

  // Adiciona uma nova visita
  const addVisit = async (data: Partial<Visit>) => {
    const safeDate = onlyDate(data.date) || onlyDate(new Date().toISOString());
    const safeTime = onlyTime(data.time) || "00:00";
    const safeLocation =
      data.location ?? { id: "loc-unknown", name: "Local", address: "" };

    const newVisit: Visit = {
      id: `v${Date.now()}`,
      date: safeDate,
      time: safeTime,
      location: safeLocation,
      companions: (data.companions ?? []).map((c, i) => ({
        id: c.id ?? `c${Date.now()}-${i}`,
        name: c.name,
      })),
      observation: data.observation,
    };

    const { error } = await supabase.from("visits").insert([newVisit]);
    if (error) console.error("Erro ao adicionar visita:", error.message);

    setVisits((prev) => [...prev, newVisit]);
    setLocations((prev) => {
      const map = new Map(prev.map((l) => [l.id, l]));
      map.set(newVisit.location?.id ?? "loc-unknown", {
        id: newVisit.location?.id ?? "loc-unknown",
        name: newVisit.location?.name ?? "Local",
      });
      return Array.from(map.values());
    });
  };

  // Carregar visitas do Supabase
  useEffect(() => {
    async function fetchVisits() {
      try {
        const { data, error } = await supabase
          .from("visits")
          .select("*")
          .order("date", { ascending: true });

        if (error) throw error;

        const normalized: Visit[] = (data || []).map((v, i) => normalizeVisit(v, i));
        setVisits(normalized);

        const uniqueLocs = [
          ...new Map(normalized.map((v) => [v.location?.id, v.location])).values(),
        ]
          .filter(Boolean)
          .map((l: any) => ({ id: l.id ?? "", name: l.name ?? "Local" }));

        setLocations(uniqueLocs as any);
      } catch (err: any) {
        console.error("Erro ao carregar visitas:", err.message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchVisits();
  }, []);

  return { visits, locations, isLoading, finalizeVisit, updateVisit, addVisit };
}
