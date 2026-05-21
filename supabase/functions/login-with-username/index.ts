import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

// Database-backed rate limit: max 10 attempts per IP per 15 minutes (shared across isolates)
const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW_MIN = 15;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const { identifier, password } = await req.json();

    if (!identifier || !password) {
      return new Response(
        JSON.stringify({ error: "Identifier and password are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Distributed rate limit check via DB
    const since = new Date(Date.now() - RATE_LIMIT_WINDOW_MIN * 60 * 1000).toISOString();
    const { count } = await supabase
      .from("login_attempts")
      .select("id", { count: "exact", head: true })
      .eq("ip", clientIp)
      .gte("attempted_at", since);
    if ((count ?? 0) >= RATE_LIMIT_MAX) {
      return new Response(
        JSON.stringify({ error: "Too many login attempts. Please try again later." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    await supabase.from("login_attempts").insert({ ip: clientIp, identifier: String(identifier).slice(0, 64) });

    let email = identifier;

    // If not an email, look up the real email server-side
    if (!identifier.includes("@")) {
      const { data: profileEmail } = await supabase
        .from("profiles")
        .select("email")
        .eq("username_lower", identifier.toLowerCase())
        .single();

      email = profileEmail?.email || `${identifier.toLowerCase()}@razehub.local`;
    }

    // Sign in using the anon client (not service role) to get proper session tokens
    const anonKey = Deno.env.get("SUPABASE_PUBLISHABLE_KEY") || Deno.env.get("SUPABASE_ANON_KEY")!;
    const anonClient = createClient(supabaseUrl, anonKey);

    const { data, error } = await anonClient.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return new Response(
        JSON.stringify({ error: "Invalid credentials" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ session: data.session }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch {
    return new Response(
      JSON.stringify({ error: "Something went wrong" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
