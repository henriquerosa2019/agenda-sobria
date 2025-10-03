// src/components/VisitForm.tsx
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export interface VisitFormProps {
  mode: "new" | "edit"; // define se é criação ou edição
  initialData?: {
    id?: string;
    date?: string;
    time?: string;
    locationId?: string;
    locationName?: string;
    locationAddress?: string;
    companions?: string[];
    observation?: string;
  };
  onSave: (
    data: {
      date: string;
      time: string;
      locationId?: string;
      locationName?: string;
      locationAddress?: string;
      companions: string[];
      observation?: string;
    },
    id?: string
  ) => Promise<void>;
}

export default function VisitForm({ mode, initialData, onSave }: VisitFormProps) {
  const [date, setDate] = useState(initialData?.date || "");
  const [time, setTime] = useState(initialData?.time || "");
  const [locationId, setLocationId] = useState(initialData?.locationId || "");
  const [observation, setObservation] = useState(initialData?.observation || "");
  const [companions, setCompanions] = useState<string[]>(initialData?.companions || []);

  // Locais
  const [localList, setLocalList] = useState<{ id: string; name: string }[]>([]);
  const [newLocationName, setNewLocationName] = useState("");
  const [newLocationAddress, setNewLocationAddress] = useState("");

  // Companheiros
  const [companionsList, setCompanionsList] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    const fetchLocals = async () => {
      const { data, error } = await supabase.from("locations").select("id, name").order("name");
      if (!error && data) setLocalList(data);
    };

    const fetchCompanions = async () => {
      const { data, error } = await supabase.from("companions").select("id, name").order("name");
      if (!error && data) setCompanionsList(data);
    };

    fetchLocals();
    fetchCompanions();
  }, []);

  // Adicionar novo local
  const handleInsertLocation = async () => {
    if (!newLocationName.trim()) {
      alert("Digite o nome do local");
      return;
    }
    const { data, error } = await supabase
      .from("locations")
      .insert([{ name: newLocationName, address: newLocationAddress, icon: "🏥" }])
      .select("id, name")
      .single();

    if (error) {
      alert("Erro ao inserir local: " + error.message);
      return;
    }

    setLocalList((prev) => [...prev, data]);
    setLocationId(data.id);
    setNewLocationName("");
    setNewLocationAddress("");
  };

  // Companheiros
  const handleAddCompanion = (name: string) => {
    if (!name.trim() || companions.includes(name)) return;
    setCompanions((prev) => [...prev, name]);
  };

  const handleRemoveCompanion = (name: string) => {
    setCompanions((prev) => prev.filter((c) => c !== name));
  };

  // Salvar
  const handleSave = async () => {
    await onSave(
      { date, time, locationId, locationName: newLocationName, locationAddress: newLocationAddress, companions, observation },
      initialData?.id
    );
  };

  return (
    <div className="border rounded p-4 bg-white shadow-sm mb-6">
      <h3 className="font-semibold mb-4">
        {mode === "new" ? "➕ Nova Visita" : `✏️ Editar Visita (${initialData?.date})`}
      </h3>

      {/* Locais */}
      <label>Local existente</label>
      <select
        value={locationId}
        onChange={(e) => setLocationId(e.target.value)}
        className="w-full border rounded p-2 mb-3"
      >
        <option value="">Selecione...</option>
        {localList.map((loc) => (
          <option key={loc.id} value={loc.id}>
            {loc.name}
          </option>
        ))}
      </select>

      {mode === "new" && (
        <div className="mb-3 space-y-2">
          <input
            type="text"
            placeholder="Novo local (nome)"
            value={newLocationName}
            onChange={(e) => setNewLocationName(e.target.value)}
            className="w-full border rounded p-2"
          />
          <input
            type="text"
            placeholder="Novo local (endereço)"
            value={newLocationAddress}
            onChange={(e) => setNewLocationAddress(e.target.value)}
            className="w-full border rounded p-2"
          />
          <button
            type="button"
            onClick={handleInsertLocation}
            className="px-3 py-1 bg-green-600 text-white rounded"
          >
            Adicionar Local
          </button>
        </div>
      )}

      {/* Data / Hora */}
      <label>Data</label>
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="w-full border rounded p-2 mb-3"
      />

      <label>Hora</label>
      <input
        type="time"
        value={time}
        onChange={(e) => setTime(e.target.value)}
        className="w-full border rounded p-2 mb-3"
      />

      {/* Companheiros */}
      <label>Companheiros</label>
      <div className="border rounded p-2 space-y-2 mb-3">
        <div className="flex flex-wrap gap-2">
          {companions.map((c) => (
            <span
              key={c}
              className="px-2 py-1 bg-blue-200 rounded-full text-sm flex items-center gap-1"
            >
              {c}
              <button
                type="button"
                onClick={() => handleRemoveCompanion(c)}
                className="text-red-600 font-bold"
              >
                ×
              </button>
            </span>
          ))}
        </div>

        <input
          type="text"
          placeholder="Digite e pressione Enter"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAddCompanion((e.target as HTMLInputElement).value);
              (e.target as HTMLInputElement).value = "";
            }
          }}
          className="w-full border rounded p-2"
        />

        <select
          onChange={(e) => handleAddCompanion(e.target.value)}
          className="w-full border rounded p-2"
        >
          <option value="">Selecionar existente...</option>
          {companionsList.map((c) => (
            <option key={c.id} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Observação */}
      <label>Observação</label>
      <textarea
        value={observation}
        onChange={(e) => setObservation(e.target.value)}
        className="w-full border rounded p-2 mb-3"
      />

      <button
        type="button"
        onClick={handleSave}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        Salvar
      </button>
    </div>
  );
}
