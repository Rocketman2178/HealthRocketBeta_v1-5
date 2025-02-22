import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import Stripe from "https://esm.sh/stripe@14.14.0";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2023-10-16",
});

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    // Get the authorization header from the request
    const authHeader = req.headers.get("Authorization")?.split(" ")[1];
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    // Get the user from Supabase auth
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(authHeader);
    if (userError || !user) throw new Error("Invalid user");
    // Extract session_id from request URL
    const url = new URL(req.url);
    const sessionId = url.searchParams.get("session_id");

    if (!sessionId) {
      return new Response(JSON.stringify({ error: "Session ID is required" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Retrieve the session details from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session || session.status !== "complete" || !session.customer) {
      return new Response(
        JSON.stringify({ error: "Invalid or incomplete session" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    const customerId = session.customer as string;

    // Retrieve active subscription for the customer
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
    });

    if (subscriptions.data.length === 0) {
      return new Response(
        JSON.stringify({ status: "no_active_subscription" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Get the latest subscription
    const subscription = subscriptions.data[0];

    // Check if the subscription already exists
    const { data, error } = await supabase
      .from("subscriptions")
      .select("id") // Select only the ID for minimal data fetching
      .eq("user_id", user.id)
      .eq("plan_id", subscription.items.data[0].price.id)
      .eq("stripe_customer_id", customerId)
      .eq("stripe_subscription_id", subscription.id);

    if (error) {
      throw new Error(`Supabase query error: ${error.message}`);
    }

    // If no existing subscription, insert a new one
    if (!data || data.length === 0) {
      const { error: insertError } = await supabase
        .from("subscriptions")
        .insert([
          {
            stripe_customer_id: customerId,
            stripe_subscription_id: subscription.id,
            user_id: user.id,
            plan_id: subscription.items.data[0].price.id,
            status: subscription.status,
            current_period_start: new Date(
              subscription.current_period_start * 1000
            ).toISOString(),
            current_period_end: new Date(
              subscription.current_period_end * 1000
            ).toISOString(),
            cancel_at_period_end: subscription.cancel_at_period_end,
          },
        ]);

      if (insertError) {
        throw new Error(`Supabase insert error: ${insertError.message}`);
      }
    }
    return new Response(JSON.stringify({ status: "complete" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
