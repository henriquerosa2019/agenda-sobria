import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);

// Todas as visitas (Agosto, Setembro, Outubro)
const visitas = [
  // ===== AGOSTO =====
  {
    local: "VILA SERENA",
    endereco: "Rua Pedro Guedes, N° 63 – Maracanã",
    data: "2025-08-05",
    hora: "15:30",
    companheiros: ["Arypepe", "Sara", "João Bosco"],
  },
  {
    local: "VILA SERENA",
    endereco: "Rua Pedro Guedes, N° 63 – Maracanã",
    data: "2025-08-19",
    hora: "15:30",
    companheiros: ["Carlão", "João Bosco"],
  },
  {
    local: "CLÍNICA EVOLUÇÃO",
    endereco: "Rua Mariz e Barros, N° 430 – Praça da Bandeira",
    data: "2025-08-18",
    hora: "17:00",
    companheiros: ["Sara", "Jefferson"],
  },
  {
    local: "CLÍNICA DA GÁVEA – UNIDADE TIJUCA",
    endereco: "Rua Dr. Pereira dos Santos, N° 18 – Tijuca",
    data: "2025-08-04",
    hora: "15:30",
    companheiros: ["João Bosco", "Danilo", "Sara"],
  },
  {
    local: "HOSPITAL SÃO FRANCISCO NA PROVIDÊNCIA DE DEUS",
    endereco: "Rua Conde de Bonfim, N° 1030 – Tijuca",
    data: "2025-08-11",
    hora: "16:00",
    companheiros: ["João Bosco"],
  },
  {
    local: "HOSPITAL SÃO FRANCISCO NA PROVIDÊNCIA DE DEUS",
    endereco: "Rua Conde de Bonfim, N° 1030 – Tijuca",
    data: "2025-08-25",
    hora: "16:00",
    companheiros: ["Roberto", "João Bosco", "Jefferson"],
  },
  {
    local: "HOSPITAL CASA MENSSANA",
    endereco: "Rua Marechal Jofre, N° 30 – Grajaú",
    data: "2025-08-20",
    hora: "19:30",
    companheiros: ["João Bosco", "Henrique R.", "Pedro H."],
  },

  // ===== SETEMBRO =====
  {
    local: "VILA SERENA",
    endereco: "Rua Pedro Guedes, N° 63 – Maracanã",
    data: "2025-09-02",
    hora: "15:30",
    companheiros: ["Arypepe", "Pedro H.", "João Bosco"],
  },
  {
    local: "VILA SERENA",
    endereco: "Rua Pedro Guedes, N° 63 – Maracanã",
    data: "2025-09-16",
    hora: "15:30",
    companheiros: ["João Bosco", "Sara", "Jefferson"],
  },
  {
    local: "CLÍNICA EVOLUÇÃO",
    endereco: "Rua Mariz e Barros, N° 430 – Praça da Bandeira",
    data: "2025-09-15",
    hora: "17:00",
    companheiros: ["Jefferson", "Sara"],
  },
  {
    local: "CLÍNICA DA GÁVEA – UNIDADE TIJUCA",
    endereco: "Rua Dr. Pereira dos Santos, N° 18 – Tijuca",
    data: "2025-09-01",
    hora: "15:30",
    companheiros: ["Jefferson", "Danilo", "Carlão", "Sara"],
  },
  {
    local: "HOSPITAL SÃO FRANCISCO NA PROVIDÊNCIA DE DEUS",
    endereco: "Rua Conde de Bonfim, N° 1030 – Tijuca",
    data: "2025-09-08",
    hora: "16:00",
    companheiros: ["Roberto", "Sidney", "João Bosco"],
  },
  {
    local: "HOSPITAL SÃO FRANCISCO NA PROVIDÊNCIA DE DEUS",
    endereco: "Rua Conde de Bonfim, N° 1030 – Tijuca",
    data: "2025-09-22",
    hora: "16:00",
    companheiros: ["Roberto", "João Bosco"],
  },
  {
    local: "HOSPITAL CASA MENSSANA",
    endereco: "Rua Marechal Jofre, N° 30 – Grajaú",
    data: "2025-09-17",
    hora: "19:30",
    companheiros: ["Cadu", "Henrique R.", "Mariana"],
  },

  // ===== OUTUBRO =====
  {
    local: "VILA SERENA",
    endereco: "Rua Pedro Guedes, N° 63 – Maracanã",
    data: "2025-10-07",
    hora: "15:30",
    companheiros: ["Arypepe", "Sara"],
  },
  {
    local: "VILA SERENA",
    endereco: "Rua Pedro Guedes, N° 63 – Maracanã",
    data: "2025-10-21",
    hora: "15:30",
    companheiros: ["Alberto"],
  },
  {
    local: "CLÍNICA EVOLUÇÃO",
    endereco: "Rua Mariz e Barros, N° 430 – Praça da Bandeira",
    data: "2025-10-20",
    hora: "17:00",
    companheiros: ["Sara"],
  },
  {
    local: "CLÍNICA DA GÁVEA – UNIDADE TIJUCA",
    endereco: "Rua Dr. Pereira dos Santos, N° 18 – Tijuca",
    data: "2025-10-06",
    hora: "15:30",
    companheiros: ["Carlão", "Danilo", "Tabajara"],
  },
  {
    local: "HOSPITAL SÃO FRANCISCO NA PROVIDÊNCIA DE DEUS",
    endereco: "Rua Conde de Bonfim, N° 1030 – Tijuca",
    data: "2025-10-13",
    hora: "16:00",
    companheiros: ["Tabajara"],
  },
  {
    local: "HOSPITAL SÃO FRANCISCO NA PROVIDÊNCIA DE DEUS",
    endereco: "Rua Conde de Bonfim, N° 1030 – Tijuca",
    data: "2025-10-27",
    hora: "16:00",
    companheiros: ["Roberto"],
  },
  {
    local: "HOSPITAL CASA MENSSANA",
    endereco: "Rua Marechal Jofre, N° 30 – Grajaú",
    data: "2025-10-15",
    hora: "19:30",
    companheiros: ["Cadu", "Pedro H.", "Mariana"],
  },
];

async function updateVisits() {
  try {
    for (const v of visitas) {
      // Local
      let { data: loc } = await supabase
        .from("locations")
        .select("id")
        .eq("name", v.local)
        .maybeSingle();

      let locationId = loc?.id;
      if (!locationId) {
        const { data: newLoc } = await supabase
          .from("locations")
          .insert({ name: v.local, address: v.endereco })
          .select()
          .single();
        locationId = newLoc.id;
      }

      // Visita
      const { data: visit } = await supabase
        .from("visits")
        .insert({
          date: v.data,
          time: v.hora,
          location_id: locationId,
        })
        .select()
        .single();

      // Companheiros
      for (const nome of v.companheiros) {
        if (!nome) continue;

        let { data: comp } = await supabase
          .from("companions")
          .select("id")
          .eq("name", nome)
          .maybeSingle();

        let compId = comp?.id;
        if (!compId) {
          const { data: newComp } = await supabase
            .from("companions")
            .insert({ name: nome })
            .select()
            .single();
          compId = newComp.id;
        }

        await supabase
          .from("visit_companions")
          .insert({ visit_id: visit.id, companion_id: compId });
      }
    }

    console.log("✅ Inserção completa: agosto, setembro e outubro!");
  } catch (err) {
    console.error("❌ Erro ao inserir visitas:", err);
  }
}

updateVisits();
