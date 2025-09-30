// src/hooks/useVisits.ts
import { useEffect, useState } from "react";

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

  const location =
    v?.location ??
    v?.local ?? {
      id: v?.locationId ?? v?.localId ?? "",
      name:
        v?.locationName ??
        v?.localNome ??
        v?.local?.name ??
        v?.location?.name ??
        "Local",
      address:
        v?.address ??
        v?.endereco ??
        v?.local?.address ??
        v?.location?.address ??
        "",
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

  // Atualiza uma visita existente
  const updateVisit = (id: string, updated: Partial<Visit>) => {
    setVisits((prev) => prev.map((v) => (v.id === id ? { ...v, ...updated } : v)));
  };

  // Adiciona uma nova visita (usado em Configurar -> "Adicionar como nova visita")
  const addVisit = (data: Partial<Visit>) => {
    const newId = `v${Date.now()}`;
    const safeDate = onlyDate(data.date) || onlyDate(new Date().toISOString());
    const safeTime = onlyTime(data.time) || "00:00";
    const safeLocation =
      data.location ?? {
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
      })),
      observation: data.observation,
    };

    setVisits((prev) => [...prev, newVisit]);

    // mantém lista de locais única
    setLocations((prev) => {
      const map = new Map(prev.map((l) => [l.id, l]));
      map.set(newVisit.location?.id ?? "loc-unknown", {
        id: newVisit.location?.id ?? "loc-unknown",
        name: newVisit.location?.name ?? "Local",
      });
      return Array.from(map.values());
    });
  };

  useEffect(() => {
    async function fetchVisits() {
      try {
        const res = await fetch("/api/visits", {
          headers: { Accept: "application/json" },
        });

        if (!res.ok) {
          console.warn(`[visits] API retornou status ${res.status}. Usando dados mock.`);
          throw new Error(`bad status ${res.status}`);
        }

        let data: any = null;
        try {
          data = await res.json();
        } catch {
          console.warn("[visits] Resposta sem JSON. Usando dados mock.");
          throw new Error("no json");
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

        setLocations(uniqueLocs as any);
      } catch {
        // ===== MOCK com 7 visitas =====
        const mock: Visit[] = [
          {
            id: "1",
            date: "2024-09-15",
            time: "17:00",
            location: {
              id: "loc1",
              name: "CLÍNICA EVOLUÇÃO",
              address: "Rua Mariz e Barros, Nº 430 – Praça da Bandeira",
            },
            companions: [{ id: "c1", name: "Jefferson" }, { id: "c2", name: "Sara" }],
          },
          {
            id: "2",
            date: "2024-09-16",
            time: "15:30",
            location: {
              id: "loc2",
              name: "VILA SERENA",
              address: "Rua Pedro Guedes, Nº 63 – Maracanã",
            },
            companions: [
              { id: "c3", name: "João Bosco" },
              { id: "c1", name: "Jefferson" },
              { id: "c2", name: "Sara" },
            ],
          },
          {
            id: "3",
            date: "2024-09-22",
            time: "16:00",
            location: {
              id: "loc3",
              name: "HOSPITAL SÃO FRANCISCO NA PROVIDÊNCIA DE DEUS",
              address: "Rua Conde de Bonfim, Nº 1030 – Tijuca",
            },
            companions: [{ id: "c3", name: "João Bosco" }, { id: "c4", name: "Roberto" }],
          },
          {
            id: "4",
            date: "2024-09-24",
            time: "16:00",
            location: {
              id: "loc3",
              name: "HOSPITAL SÃO FRANCISCO NA PROVIDÊNCIA DE DEUS",
              address: "Rua Conde de Bonfim, Nº 1030 – Tijuca",
            },
            companions: [
              { id: "c3", name: "João Bosco" },
              { id: "c4", name: "Roberto" },
              { id: "c5", name: "Sidney" },
            ],
          },
          {
            id: "5",
            date: "2024-09-01",
            time: "15:30",
            location: {
              id: "loc4",
              name: "CLÍNICA DA GÁVEA – UNIDADE TIJUCA",
              address: "Rua Dr. Pereira dos Santos, Nº 18 – Tijuca",
            },
            companions: [
              { id: "c1", name: "Jefferson" },
              { id: "c2", name: "Sara" },
              { id: "c6", name: "Danilo" },
              { id: "c7", name: "Carlão" },
            ],
          },
          {
            id: "6",
            date: "2024-09-17",
            time: "19:30",
            location: {
              id: "loc5",
              name: "HOSPITAL CASA MENSSANA",
              address: "Rua Marechal Jofre, Nº 30 – Grajaú",
            },
            companions: [
              { id: "c8", name: "Cadu" },
              { id: "c9", name: "Henrique R." },
              { id: "c10", name: "Mariana" },
            ],
          },
          {
            id: "7",
            date: "2024-09-24",
            time: "16:30",
            location: {
              id: "loc2",
              name: "VILA SERENA",
              address: "Rua Pedro Guedes, Nº 63 – Maracanã",
            },
            companions: [
              { id: "c11", name: "Aypepe" },
              { id: "c12", name: "Pedro H." },
              { id: "c3", name: "João Bosco" },
            ],
          },
        ];

        setVisits(mock);
        setLocations([
          { id: "loc1", name: "CLÍNICA EVOLUÇÃO" },
          { id: "loc2", name: "VILA SERENA" },
          { id: "loc3", name: "HOSPITAL SÃO FRANCISCO NA PROVIDÊNCIA DE DEUS" },
          { id: "loc4", name: "CLÍNICA DA GÁVEA – UNIDADE TIJUCA" },
          { id: "loc5", name: "HOSPITAL CASA MENSSANA" },
        ]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchVisits();
  }, []);

  // >>>>>> AQUI FORA do useEffect <<<<<<
  return { visits, locations, isLoading, finalizeVisit, updateVisit, addVisit };
}
