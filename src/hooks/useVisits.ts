// Atualiza visita existente
const updateVisit = async (id: string, updated: Partial<Visit>) => {
  const payload: any = {
    date: updated.date,
    time: updated.time,
    observation: updated.observation,
    start_time: updated.startTime,
    end_time: updated.endTime,
    is_finalized: updated.isFinalized,
    companions: updated.companions ?? [],
    location_id: updated.location?.id,
    location_name: updated.location?.name,
    location_address: updated.location?.address,
  };

  const { error } = await supabase.from("visits").update(payload).eq("id", id);
  if (error) console.error("Erro ao atualizar visita:", error.message);

  setVisits((prev) => prev.map((v) => (v.id === id ? { ...v, ...updated } : v)));
};

// Adiciona nova visita
const addVisit = async (data: Partial<Visit>) => {
  const newVisit: Visit = {
    id: crypto.randomUUID(),
    date: data.date!,
    time: data.time!,
    companions: data.companions ?? [],
    observation: data.observation,
    location: data.location ?? { id: "loc-unknown", name: "Local", address: "" },
  };

  const payload: any = {
    id: newVisit.id,
    date: newVisit.date,
    time: newVisit.time,
    companions: newVisit.companions,
    observation: newVisit.observation,
    location_id: newVisit.location?.id,
    location_name: newVisit.location?.name,
    location_address: newVisit.location?.address,
  };

  const { error } = await supabase.from("visits").insert([payload]);
  if (error) console.error("Erro ao adicionar visita:", error.message);

  setVisits((prev) => [...prev, newVisit]);
};
