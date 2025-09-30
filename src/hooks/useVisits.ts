// src/hooks/useVisits.ts
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export interface Visit {
  id: string;
  date: string;            // YYYY-MM-DD
  time: string;            // HH:mm
  location?: { id: string; name: string; address: string };
  companions?: { id: string; name: string }[];
  startTime?: string;      // HH:mm
  endTime?: string;        // HH:mm
  isFinalized?: boolean;
  observation?: string;
}

/* Helpers */
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
  if (!raw) return [];
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

  const location = {
    id: v?.location_id ?? v?.locationId ?? "",
    name: v?.location_name ?? v?.location?.name ?? "Local",
    address: v?.location_address ?? v?.location?.address ?? "",
  };

  const companions = normalizeCompanions(
    v?.companions ?? v?.companheiros ?? v?.members ?? v?.pessoas,
    id
  );

  return {
    id,
    date,
    time,
    location,
    companions,
    startTime: onlyTime(v?.start_time ?? v?.realStartTime),
    endTime: onlyTime(v?.end_time ?? v?.realEndTime),
    isFinalized: Boolean(v?.is_finalized ?? v?.isFinalized),
    observation: typeof v?.observation === "string" ? v.observation : undefined,
  };
}

/* Hook principal */
export default function useVisits() {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [locations, setLocations] = useState<{ id: string; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Finalizar visita
  const finalizeVisit = async (
    id: string,
    payload: { startTime: string; endTime: string; realCompanions: string[] }
  ) => {
    const updates = {
      start_time: payload.startTime,
      end_time: payload.endTime,
      is_finalized: true,
      companions: payload.realCompanions.map((name, i) => ({
        id: `${id}-real-${i}`,
        name: name.trim(),
      })),
    };

    const { error } = await supabase.from("visits").update(updates).eq("id", id);
    if (error) {
      console.error("❌ Erro ao finalizar visita:", error.message);
    } else {
      setVisits((prev) =>
        prev.map((v) =>
          v.id === id
            ? {
                ...v,
                startTime: payload.startTime,
                endTime: payload.endTime,
                isFinalized: true,
                companions: updates.companions,
              }
            : v
        )
      );
    }
  };

  // Atualizar visita
  const updateVisit = async (id: string, updated: Partial<Visit>) => {
    const payload = {
      date: updated.date,
      time: updated.time,
      observation: updated.observation,
      start_time: updated.startTime,
      end_time: updated.endTime,
      is_finalized: updated.isFinalized ?? false,
      companions: updated.companions ?? [],
      location_id: updated.location?.id ?? "loc-unknown",
      location_name: updated.location?.name ?? "Local",
      location_address: updated.location?.address ?? "",
    };

    const { error } = await supabase.from("visits").update(payload).eq("id", id);
    if (error) {
      console.error("❌ Erro ao atualizar visita:", error.message);
    } else {
      setVisits((prev) =>
        prev.map((v) =>
          v.id === id
            ? { ...v, ...updated }
            : v
        )
      );
    }
  };

  // Adicionar visita
  const addVisit = async (data: Partial<Visit>) => {
    const newVisit: Visit = {
      id: crypto.randomUUID(),
      date: data.date!,
      time: data.time!,
      companions: data.companions ?? [],
      observation: data.observation,
      location: data.location ?? { id: "loc-unknown", name: "Local", address: "" },
    };

    const payload = {
      id: newVisit.id,
      date: newVisit.date,
      time: newVisit.time,
      observation: newVisit.observation,
      companions: newVisit.companions,
      location_id: newVisit.location?.id ?? "loc-unknown",
      location_name: newVisit.location?.name ?? "Local",
      location_address: newVisit.location?.address ?? "",
    };

    const { error } = await supabase.from("visits").insert([payload]);
    if (error) {
      console.error("❌ Erro ao adicionar visita:", error.message);
    } else {
      setVisits((prev) => [...prev, newVisit]);
    }
  };

  // Carregar visitas
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
        console.error("❌ Erro ao carregar visitas:", err.message);
      } finally {
        setIsLoading(false);
      }
    }
    fetchVisits();
  }, []);

  return { visits, locations, isLoading, finalizeVisit, updateVisit, addVisit };
}
