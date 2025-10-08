// src/hooks/useVisits.ts
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export interface Visit {
  id: string;
  date: string;
  time: string;
  location?: { id: string; name: string; address: string };
  companions?: { id: string; name: string; cost?: number }[];
  startTime?: string;
  endTime?: string;
  isFinalized?: boolean;
  observation?: string;
}

function onlyDate(input?: string): string {
  if (!input) return "";
  const ymd = String(input).split("T")[0];
  const [y, m, d] = ymd.split("-").map(Number);
  if (!y || !m || !d) return "";
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}
function onlyTime(input?: string): string {
  if (!input) return "";
  return String(input).slice(0, 5);
}

function normalizeVisit(v: any, idx: number): Visit {
  const id = String(v?.id ?? idx);
  const location = {
    id: v?.locations?.id ?? "loc-unknown",
    name: v?.locations?.name ?? "Local",
    address: v?.locations?.address ?? "",
  };
  const companions =
    (v?.visit_companions ?? []).map((vc: any, i: number) => ({
      id: vc?.companions?.id ?? `${id}-c${i}`,
      name: vc?.companions?.name ?? "Companheiro",
      cost:
        typeof vc?.cost === "number"
          ? vc.cost
          : vc?.cost != null
          ? Number(vc.cost)
          : undefined,
    })) ?? [];
  return {
    id,
    date: onlyDate(v?.date),
    time: onlyTime(v?.time),
    location,
    companions,
    startTime: onlyTime(v?.start_time),
    endTime: onlyTime(v?.end_time),
    isFinalized: Boolean(v?.isfinalized),
    observation: typeof v?.notes === "string" ? v.notes : undefined,
  };
}

export default function useVisits() {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [companions, setCompanions] = useState<any[]>([]);
  const [locations, setLocations] = useState<{ id: string; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const updateVisit = (id: string, updated: Partial<Visit>) => {
    setVisits((prev) => prev.map((v) => (v.id === id ? { ...v, ...updated } : v)));
  };

  async function ensureCompanionsExist(names: string[]): Promise<string[]> {
    if (names.length === 0) return [];
    const { data: existing, error } = await supabase
      .from("companions")
      .select("id, name");
    if (error) {
      console.warn("[companions] Erro ao buscar companheiros:", error.message);
      return names.map(() => "");
    }
    const existingMap = new Map<string, string>(
      (existing ?? []).map((c) => [c.name.trim().toLowerCase(), c.id])
    );
    const newNames = names.filter(
      (name) => !existingMap.has(name.trim().toLowerCase())
    );
    if (newNames.length > 0) {
      const { data: inserted, error: insertError } = await supabase
        .from("companions")
        .insert([...new Set(newNames)].map((name) => ({ name: name.trim() })))
        .select("id, name");
      if (insertError) {
        console.warn(
          "[companions] Erro ao inserir:",
          insertError.message
        );
      } else if (inserted) {
        inserted.forEach(c => {
            existingMap.set(c.name.trim().toLowerCase(), c.id);
        });
      }
    }
    return names.map((name) => {
      const key = name.trim().toLowerCase();
      return existingMap.get(key) ?? "";
    });
  }

  const saveVisitChanges = async (
    id: string,
    observation: string,
    companionEntries: any[]
  ) => {
    const names = (companionEntries ?? [])
      .map((e) => (typeof e === "string" ? e : e?.name ?? ""))
      .map((n: string) => n.trim())
      .filter(Boolean);
    const companionIds = await ensureCompanionsExist(names);
    const { error: updateError } = await supabase
      .from("visits")
      .update({ notes: observation })
      .eq("id", id);
    if (updateError) {
      console.warn(
        "[saveVisitChanges] Erro ao atualizar visita:",
        updateError.message
      );
      return;
    }
    await supabase.from("visit_companions").delete().eq("visit_id", id);
    const payload = companionIds
      .map((companion_id, i) => ({
        visit_id: id,
        companion_id,
        cost:
          typeof companionEntries[i]?.cost === "number"
            ? companionEntries[i].cost
            : null,
      }))
      .filter((row) => row.companion_id);
    if (payload.length > 0) {
      const { error: insertError } = await supabase
        .from("visit_companions")
        .insert(payload);
      if (insertError) {
        console.warn(
          "[saveVisitChanges] Erro ao inserir companheiros:",
          insertError.message
        );
      }
    }
    setVisits((prev) =>
      prev.map((v) =>
        v.id === id
          ? {
              ...v,
              observation,
              companions: names.map((name, i) => ({
                id: companionIds[i],
                name,
                cost: companionEntries[i]?.cost ?? null,
              })),
            }
          : v
      )
    );
  };

  useEffect(() => {
    async function fetchVisits() {
      try {
        const { data, error } = await supabase
          .from("visits")
          .select(`
            id, date, time, start_time, end_time, isfinalized, notes,
            locations:location_id(id, name, address),
            visit_companions(cost, companions(id, name))
          `);
        if (error) throw error;
        const normalized: Visit[] = (Array.isArray(data) ? data : []).map(
          (v, i) => normalizeVisit(v, i)
        );
        setVisits(normalized);
      } catch (err) {
        console.warn("Falha ao buscar visitas.", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchVisits();
  }, []);

  return {
    visits,
    companions,
    locations,
    isLoading,
    updateVisit,
    saveVisitChanges,
  };
}