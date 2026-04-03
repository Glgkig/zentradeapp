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
    const payload = await req.json();
    const eventType: string = payload.type;
    const data = payload.data;

    console.log(`Polar webhook received: ${eventType}`);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Extract customer info
    const polarCustomerId: string | null = data?.customer?.id ?? null;
    const externalCustomerId: string | null =
      data?.customer?.external_id ?? null;

    if (!externalCustomerId) {
      console.error("No external_customer_id in webhook payload");
      return new Response(
        JSON.stringify({ error: "Missing external_customer_id" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (
      eventType === "subscription.created" ||
      eventType === "subscription.active" ||
      eventType === "subscription.updated"
    ) {
      const status = data?.status; // active, past_due, canceled, etc.
      const isActive = status === "active";

      const { error } = await supabase
        .from("profiles")
        .update({
          is_pro: isActive,
          subscription_status: status ?? "active",
          polar_customer_id: polarCustomerId,
        })
        .eq("id", externalCustomerId);

      if (error) {
        console.error("DB update error:", error);
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      console.log(`User ${externalCustomerId} subscription updated: ${status}`);
    } else if (
      eventType === "subscription.canceled" ||
      eventType === "subscription.revoked"
    ) {
      const { error } = await supabase
        .from("profiles")
        .update({
          is_pro: false,
          subscription_status: "canceled",
        })
        .eq("id", externalCustomerId);

      if (error) {
        console.error("DB update error:", error);
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      console.log(`User ${externalCustomerId} subscription canceled`);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Webhook error:", err);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
