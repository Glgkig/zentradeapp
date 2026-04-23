import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-signature",
};

async function verifySignature(body: string, signature: string, secret: string): Promise<boolean> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signed = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body));
  const hex = Array.from(new Uint8Array(signed)).map(b => b.toString(16).padStart(2, "0")).join("");
  return hex === signature;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.text();

    const webhookSecret = Deno.env.get("LEMONSQUEEZY_WEBHOOK_SECRET");
    if (webhookSecret) {
      const signature = req.headers.get("x-signature") ?? "";
      const valid = await verifySignature(body, signature, webhookSecret);
      if (!valid) {
        console.error("Webhook signature verification failed");
        return new Response(JSON.stringify({ error: "Invalid signature" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const payload = JSON.parse(body);
    const eventName: string = payload?.meta?.event_name;
    const customData = payload?.meta?.custom_data;
    const attributes = payload?.data?.attributes;

    console.log(`Lemon Squeezy webhook received: ${eventName}`);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Extract user ID from custom data (set during checkout)
    const userId: string | null = customData?.user_id ?? null;
    const customerEmail: string | null = attributes?.user_email ?? null;
    // Store LS customer ID in the polar_customer_id column (rename the DB column later)
    const lsCustomerId: string | null = attributes?.customer_id ? String(attributes.customer_id) : null;

    const resolveUserId = async (): Promise<string | null> => {
      if (userId) return userId;
      if (customerEmail) {
        const { data: authData } = await supabase.auth.admin.listUsers();
        const matched = authData?.users?.find(u => u.email === customerEmail);
        return matched?.id ?? null;
      }
      return null;
    };

    if (eventName === "order_created") {
      // One-time purchase
      if (attributes?.status === "paid") {
        const uid = await resolveUserId();
        if (uid) {
          await supabase.from("profiles").update({
            is_pro: true,
            subscription_status: "active",
            ...(lsCustomerId ? { polar_customer_id: lsCustomerId } : {}),
          }).eq("id", uid);
          console.log(`User ${uid} activated via order_created`);
        } else {
          console.error("order_created: could not resolve user");
        }
      }
    } else if (
      eventName === "subscription_created" ||
      eventName === "subscription_updated" ||
      eventName === "subscription_resumed"
    ) {
      const status = attributes?.status;
      const isActive = status === "active";
      const uid = await resolveUserId();
      if (uid) {
        await supabase.from("profiles").update({
          is_pro: isActive,
          subscription_status: status ?? "active",
          ...(lsCustomerId ? { polar_customer_id: lsCustomerId } : {}),
        }).eq("id", uid);
        console.log(`User ${uid} subscription ${eventName}: ${status}`);
      } else {
        console.error(`${eventName}: could not resolve user`);
      }
    } else if (
      eventName === "subscription_cancelled" ||
      eventName === "subscription_expired"
    ) {
      const uid = await resolveUserId();
      if (uid) {
        await supabase.from("profiles").update({
          is_pro: false,
          subscription_status: "canceled",
        }).eq("id", uid);
        console.log(`User ${uid} subscription canceled/expired`);
      } else {
        console.error(`${eventName}: could not resolve user`);
      }
    } else {
      console.log(`Unhandled event: ${eventName}`);
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
