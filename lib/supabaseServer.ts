// /lib/supabaseServer.ts
import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // usa la key de servicio en el servidor
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    // opcionalmente: define el runtime si haces edge functions
    // runtime: "edge",
  }
);
