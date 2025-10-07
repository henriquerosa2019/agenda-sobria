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

  const finalizeVisit = (
    id: string,
    payload: { startTime: string; endTime: string; realCompanions: string[] }
  ) => {
    setVisits((prev) =>
      prev.map((v) =>
        v.id === id
          ? {
              ...v,
              startTime: payload.startTime,
              endTime: payload.endTime,
              isFinalized: true,
              companions: payload.realCompanions.map((name, i) => ({
                id: `${id}-real-${i}`,
                name: name.trim(),
              })),
            }
          : v
      )
    );
  };

  const updateVisit = (id: string, updated: Partial<Visit>) => {
    setVisits((prev) => prev.map((v) => (v.id === id ? { ...v, ...updated } : v)));
  };

  const addVisit = (data: Partial<Visit>) => {
    const newId = `v${Date.now()}`;
    const safeDate = onlyDate(data.date) || onlyDate(new Date().toISOString());
    const safeTime = onlyTime(data.time) || "00:00";
    const safeLocation = data.location ?? {
      id: "loc-unknown",
      name: "Local",
      address: "",
    };

    const newVisit: Visit = {
      id: newId,
      date: safeDate,
      time: safeTime,
      location: {
        id: safeLocation.id ?? "loc-unknown",
        name: safeLocation.name ?? "Local",
        address: safeLocation.address ?? "",
      },
      companions: (data.companions ?? []).map((c, i) => ({
        id: c.id ?? `${newId}-c${i}`,
        name: c.name,
        cost: c.cost,
      })),
      observation: data.observation,
    };

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

  async function ensureCompanionsExist(names: string[]): Promise<string[]> {
    if (names.length === 0) return [];
    const { data: existing, error } = await supabase
      .from("companions")
      .select("id, name");

    if (error) {
      console.warn("[companions] Erro ao buscar companheiros:", error.message);
      return [];
    }

    const existingMap = new Map(
      (existing ?? []).map((c) => [c.name.trim().toLowerCase(), c.id])
    );
    const newNames = names.filter(
      (name) => !existingMap.has(name.trim().toLowerCase())
    );

    let newIds: string[] = [];

    if (newNames.length > 0) {
      const { data: inserted, error: insertError } = await supabase
        .from("companions")
        .insert(newNames.map((name) => ({ name: name.trim() })))
        .select("id, name");

      if (insertError) {
        console.warn(
          "[companions] Erro ao inserir novos companheiros:",
          insertError.message
        );
      }

      newIds = (inserted ?? []).map((c) => c.id);
    }

    // Retorna na mesma ordem
    return names.map((name, idx) => {
      const key = name.trim().toLowerCase();
      return existingMap.get(key) ?? newIds[idx] ?? "";
    });
  }

  // ✅ corrigido — agora aceita tanto string[] quanto {name,cost?}[]
  const saveVisitChanges = async (
    id: string,
    observation: string,
    companionEntries: any[] // ← aceita os dois tipos
  ) => {
    // converte tudo para array de nomes limpos
    const names = (companionEntries ?? [])
      .map((e) => (typeof e === "string" ? e : e?.name ?? ""))
      .map((n: string) => n.trim())
      .filter(Boolean);

    const companionIds = await ensureCompanionsExist(names);

    // Atualiza observação
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

    // Limpa associações antigas
    await supabase.from("visit_companions").delete().eq("visit_id", id);

    // Reinsere companheiros (com custo, se houver)
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

    // Atualiza estado local imediatamente
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

  const createNewVisit = async (
    date: string,
    time: string,
    location_id: string,
    observation: string,
    companionNames: string[]
  ) => {
    const companionIds = await ensureCompanionsExist(companionNames);

    const { data, error } = await supabase
      .from("visits")
      .insert([{ date, time, location_id, notes: observation }])
      .select("id");

    if (error || !data?.[0]?.id) {
      console.warn("[createNewVisit] Erro ao criar visita:", error?.message);
      return;
    }

    const newVisitId = data[0].id;

    const payload = companionIds
      .filter(Boolean)
      .map((companion_id) => ({ visit_id: newVisitId, companion_id }));

    if (payload.length > 0) {
      const { error: insertError } = await supabase
        .from("visit_companions")
        .insert(payload);
      if (insertError) {
        console.warn(
          "[createNewVisit] Erro ao inserir companheiros:",
          insertError.message
        );
      }
    }

    addVisit({
      id: newVisitId,
      date,
      time,
      location: locations.find((l) => l.id === location_id),
      companions: companionNames.map((name, i) => ({
        id: companionIds[i],
        name,
      })),
      observation,
    });
  };

  useEffect(() => {
    async function fetchVisits() {
      try {
        const { data, error } = await supabase
          .from("visits")
          .select(`
            id,
            date,
            time,
            start_time,
            end_time,
            isfinalized,
            notes,
            locations:location_id(id, name, address),
            visit_companions(
              cost,
              companions(id, name)
            )
          `);

        if (error) {
          console.warn(
            "[visits] Erro ao buscar dados do Supabase:",
            error.message
          );
          throw error;
        }

        const normalized: Visit[] = (Array.isArray(data) ? data : []).map(
          (v, i) => normalizeVisit(v, i)
        );
        setVisits(normalized);

        const uniqueLocs = [
          ...new Map(normalized.map((v) => [v.location?.id, v.location])).values(),
        ]
          .filter(Boolean)
          .map((l: any) => ({ id: l.id ?? "", name: l.name ?? "Local" }));

        setLocations(uniqueLocs);

        const { data: companionsData, error: companionsError } = await supabase
          .from("companions")
          .select("id, name")
          .order("name", { ascending: true });

        if (companionsError) {
          console.warn(
            "[companions] Erro ao buscar lista de companheiros:",
            companionsError.message
          );
        } else {
          setCompanions(companionsData || []);
        }
      } catch (err) {
        console.warn(
          "[visits] Falha ao buscar visitas. Nenhum dado carregado.",
          err
        );
      } finally {
        setIsLoading(false);
      }
    }

    fetchVisits();
  }, []);

  return {
    visits,
    locations,
    companions,
    isLoading,
    finalizeVisit,
    updateVisit,
    addVisit,
    saveVisitChanges,
    createNewVisit,
  };
}
