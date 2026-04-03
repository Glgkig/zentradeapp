import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { Webhook } from "https://esm.sh/standardwebhooks@1.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, webhook-id, webhook-timestamp, webhook-signature",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.text();

    // Verify webhook signature
    const webhookSecret = Deno.env.get("POLAR_WEBHOOK_SECRET");
    if (webhookSecret) {
      const base64Secret = btoa(webhookSecret);
      const wh = new Webhook(base64Secret);
      const headers: Record<string, string> = {};
      req.headers.forEach((v, k) => { headers[k] = v; });
      try {
        wh.verify(body, headers);
      } catch (err) {
        console.error("Webhook signature verification failed:", err);
        return new Response(JSON.stringify({ error: "Invalid signature" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const payload = JSON.parse(body);
    const eventType: string = payload.type;
    const data = payload.data;

    console.log(`Polar webhook received: ${eventType}`);
    console.log(`Event data keys: ${Object.keys(data || {}).join(", ")}`);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // For checkout events, try to extract user from metadata
    if (eventType === "checkout.created" || eventType === "checkout.updated") {
      const status = data?.status;
      if (status === "succeeded") {
        const userId = data?.metadata?.supabase_user_id;
        const customerEmail = data?.customer_email;
        
        if (userId) {
          console.log(`Checkout succeeded for user ${userId}`);
          const { error } = await supabase
            .from("profiles")
            .update({
              is_pro: true,
              subscription_status: "active",
            })
            .eq("id", userId);

          if (error) {
            console.error("DB update error on checkout:", error);
          } else {
            console.log(`User ${userId} activated via checkout`);
          }
        } else if (customerEmail) {
          // Fallback: find user by email
          const { data: authData } = await supabase.auth.admin.listUsers();
          const matchedUser = authData?.users?.find(u => u.email === customerEmail);
          if (matchedUser) {
            const { error } = await supabase
              .from("profiles")
              .update({
                is_pro: true,
                subscription_status: "active",
              })
              .eq("id", matchedUser.id);

            if (error) {
              console.error("DB update error:", error);
            } else {
              console.log(`User ${matchedUser.id} activated via email match`);
            }
          } else {
            console.error("No user found for email:", customerEmail);
          }
        } else {
          console.log("Checkout succeeded but no user identifier found");
        }
      } else {
        console.log(`Checkout status: ${status} — skipping`);
      }

      return new Response(JSON.stringify({ received: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Subscription events
    const polarCustomerId: string | null = data?.customer?.id ?? null;
    const externalCustomerId: string | null =
      data?.customer?.external_id ?? data?.metadata?.supabase_user_id ?? null;

    if (!externalCustomerId) {
      // Try email fallback
      const customerEmail = data?.customer?.email ?? data?.customer_email;
      if (customerEmail) {
        const { data: authData } = await supabase.auth.admin.listUsers();
        const matchedUser = authData?.users?.find(u => u.email === customerEmail);
        if (matchedUser) {
          const isActive = ["subscription.created", "subscription.active", "subscription.updated"].includes(eventType)
            && data?.status === "active";
          const isCanceled = ["subscription.canceled", "subscription.revoked"].includes(eventType);

          if (isActive) {
            await supabase.from("profiles").update({
              is_pro: true,
              subscription_status: "active",
              polar_customer_id: polarCustomerId,
            }).eq("id", matchedUser.id);
            console.log(`User ${matchedUser.id} activated via email fallback`);
          } else if (isCanceled) {
            await supabase.from("profiles").update({
              is_pro: false,
              subscription_status: "canceled",
            }).eq("id", matchedUser.id);
            console.log(`User ${matchedUser.id} canceled via email fallback`);
          }

          return new Response(JSON.stringify({ received: true }), {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      }

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
      const status = data?.status;
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
