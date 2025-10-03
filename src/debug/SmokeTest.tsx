import { useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function SmokeTest() {
  useEffect(() => {
    (async () => {
      try {
        const r1 = await supabase.from("companions").select("id").limit(1);
        console.log("r1 SELECT companions:", r1);

        const r2 = await supabase
          .from("companions")
          .insert({ name: "Debug " + new Date().toISOString() })
          .select();
        console.log("r2 INSERT companions:", r2);

        const r3 = await supabase
          .from("companions")
          .select("id,name")
          .ilike("name", "Debug%")
          .order("id", { ascending: false })
          .limit(1);
        console.log("r3 READ last debug:", r3);
      } catch (err) {
        console.error("SmokeTest error:", err);
      }
    })();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>Supabase Smoke Test rodando... confira o Console (F12)</h2>
    </div>
  );
}
