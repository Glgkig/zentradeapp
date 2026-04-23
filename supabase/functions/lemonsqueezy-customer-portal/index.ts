import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // polar_customer_id column stores the Lemon Squeezy customer_id (rename the column later)
    const { data: profile, error: profileError } = await adminClient
      .from("profiles")
      .select("polar_customer_id")
      .eq("id", user.id)
      .single();

    if (profileError || !profile?.polar_customer_id) {
      return new Response(JSON.stringify({ error: "No subscription found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const apiKey = Deno.env.get("LEMONSQUEEZY_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Lemon Squeezy not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch the customer's subscriptions to get the portal URL
    const lsCustomerId = profile.polar_customer_id;
    const subsRes = await fetch(
      `https://api.lemonsqueezy.com/v1/subscriptions?filter[customer_id]=${lsCustomerId}`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          Accept: "application/vnd.api+json",
        },
      }
    );

    if (!subsRes.ok) {
      const errBody = await subsRes.text();
      console.error("Lemon Squeezy subscriptions error:", errBody);
      return new Response(JSON.stringify({ error: "Failed to fetch subscription" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const subsData = await subsRes.json();
    const portalUrl = subsData?.data?.[0]?.attributes?.urls?.customer_portal;

    if (!portalUrl) {
      return new Response(JSON.stringify({ error: "No portal URL found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ url: portalUrl }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Portal error:", err);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
