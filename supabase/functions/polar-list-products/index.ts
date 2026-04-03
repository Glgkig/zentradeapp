import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.49.4/cors";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const polarToken = Deno.env.get("POLAR_ACCESS_TOKEN");
  if (!polarToken) {
    return new Response(JSON.stringify({ error: "No token" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const res = await fetch("https://api.polar.sh/v1/products?is_archived=false", {
    headers: { Authorization: `Bearer ${polarToken}` },
  });

  const data = await res.text();
  return new Response(data, {
    status: res.status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
