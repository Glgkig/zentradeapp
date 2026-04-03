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
    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing auth" }), {
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

    const { plan } = await req.json();
    if (!plan || !["pro", "promax"].includes(plan)) {
      return new Response(JSON.stringify({ error: "Invalid plan" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const polarToken = Deno.env.get("POLAR_ACCESS_TOKEN");
    if (!polarToken) {
      return new Response(JSON.stringify({ error: "Polar not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get product ID from secrets
    const productId = plan === "pro" 
      ? Deno.env.get("POLAR_product_PRO") 
      : Deno.env.get("POLAR_product_MAX");

    if (!productId) {
      console.error(`Missing secret for plan: ${plan}`);
      return new Response(JSON.stringify({ error: "Product not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Creating checkout for plan: ${plan}, product: ${productId}, user: ${user.id}`);

    const origin = req.headers.get("origin") || "https://zentradeapp.lovable.app";

    // Use the Polar checkout API - products array format
    const checkoutRes = await fetch("https://api.polar.sh/v1/checkouts/", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${polarToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        products: [productId],
        success_url: `${origin}/success?checkout_id={CHECKOUT_ID}`,
        customer_email: user.email,
        metadata: {
          supabase_user_id: user.id,
        },
      }),
    });

    const responseText = await checkoutRes.text();
    console.log(`Polar response status: ${checkoutRes.status}`);
    console.log(`Polar response: ${responseText}`);

    if (!checkoutRes.ok) {
      return new Response(JSON.stringify({ error: "Failed to create checkout", details: responseText }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const checkout = JSON.parse(responseText);

    return new Response(JSON.stringify({ url: checkout.url }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Checkout error:", err);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
