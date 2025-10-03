import { useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function DebugVisit() {
  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("visits")
        .insert({
          date: "2025-10-05",
          time: "15:30",
          location_id: "26be8e56-a997-4997-aa0f-aa0f550cc2d5",
          notes: "Teste de inserção"
        })
        .select();

      console.log("Insert visit test:", { data, error });
    })();
  }, []);

  return <h2>Debug Visit Test — veja Console (F12)</h2>;
}
