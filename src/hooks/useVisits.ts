// src/hooks/useVisits.ts
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export interface Visit {
  id: string;
  date: string;
  time: string;
  location?: { id: string; name: string; address: string };
  companions?: { id: string; name: string }[];
  startTime?: string;
  endTime?: string;
  isFinalized?: boolean;
  observation?: string;
}

function normalizeVisit(v: any, idx: number): Visit {
  return {
    id: v.id ?? String(idx),
    date: v.date,
    time: v.time,
    location: {
      id: v.location_id ?? "",
      name: v.location_name ?? "Local",
      address: v.location_address ?? "",
    },
    companions: Array.isArray(v.companions)
      ? v.companions.map((c: any, i: number) => ({
          id: c.id ?? `${v.id}-c${i}`,
          name: c.name,
        }))
      : [],
    startTime: v.start_time ?? "",
    endTime: v.end_time ?? "",
    isFinalized: v.is_finalized ?? false,
    observation: v.observation ?? "",
  };
}

export default function useVisits() {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [locations, setLocations] = useState<{ id: string; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 🔹 Carregar visitas
  useEffect(() => {
    async function fetchVisits() {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("visits")
        .select("*")
        .order("date", { ascending: true });

      if (error) {
        console.error("Erro ao carregar visitas:", error.message);
        setVisits([]);
      } else {
        const normalized = (data || []).map(normalizeVisit);
        setVisits(normalized);

        const uniqueLocs = [
          ...new Map(
            normalized.map((v) => [v.location?.id, { id: v.location?.id, name: v.location?.name }])
          ).values(),
        ].filter(Boolean) as { id: string; name: string }[];

        setLocations(uniqueLocs);
      }

      setIsLoading(false);
    }
    fetchVisits();
  }, []);

  // 🔹 Adicionar visita
  const addVisit = async (data: Partial<Visit>) => {
    const insertData = {
      date: data.date,
      time: data.time,
      location_id: data.location?.id ?? "loc-unknown",
      location_name: data.location?.name ?? "Local",
      location_address: data.location?.address ?? "",
      companions: data.companions ?? [],
      observation: data.observation ?? "",
    };

    const { data: newVisit, error } = await supabase
      .from("visits")
      .insert([insertData])
      .select()
      .single();

    if (error) {
      console.error("Erro ao adicionar visita:", error.message);
      return;
    }

    setVisits((prev) => [...prev, normalizeVisit(newVisit, prev.length)]);
  };

  // 🔹 Atualizar visita
  const updateVisit = async (id: string, updated: Partial<Visit>) => {
    const updateData = {
      date: updated.date,
      time: updated.time,
      location_id: updated.location?.id,
      location_name: updated.location?.name,
      location_address: updated.location?.address,
      companions: updated.companions,
      observation: updated.observation,
    };

    const { data, error } = await supabase
      .from("visits")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Erro ao atualizar visita:", error.message);
      return;
    }

    setVisits((prev) => prev.map((v) => (v.id === id ? normalizeVisit(data, 0) : v)));
  };

  // 🔹 Finalizar visita
  const finalizeVisit = async (
    id: string,
    payload: { startTime: string; endTime: string; realCompanions: string[] }
  ) => {
    const updateData = {
      start_time: payload.startTime,
      end_time: payload.endTime,
      is_finalized: true,
      companions: payload.realCompanions.map((n, i) => ({
        id: `${id}-c${i}`,
        name: n,
      })),
    };

    const { data, error } = await supabase
      .from("visits")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Erro ao finalizar visita:", error.message);
      return;
    }

    setVisits((prev) => prev.map((v) => (v.id === id ? normalizeVisit(data, 0) : v)));
  };

  return { visits, locations, isLoading, finalizeVisit, updateVisit, addVisit };
}
