import VisitForm from "@/components/VisitForm";
import useVisits from "@/hooks/useVisits";

export default function Configurar() {
  const { createNewVisit, saveVisitChanges, visits } = useVisits();

  return (
    <div className="p-6">
      <VisitForm
        mode="new"
        onSave={async (data) => {
          await createNewVisit(data.date, data.time, data.locationId!, data.observation || "", data.companions);
          alert("Nova visita criada!");
        }}
      />

      <h3 className="text-lg font-semibold mt-8 mb-4">Editar Visitas</h3>
      {visits.map((v) => (
        <VisitForm
          key={v.id}
          mode="edit"
          initialData={{
            id: v.id,
            date: v.date,
            time: v.time,
            locationId: v.location?.id,
            locationName: v.location?.name,
            locationAddress: v.location?.address,
            companions: v.companions?.map((c) => c.name),
            observation: v.observation,
          }}
          onSave={async (data, id) => {
            await saveVisitChanges(id!, data.observation || "", data.companions);
            alert("Visita atualizada!");
          }}
        />
      ))}
    </div>
  );
}
