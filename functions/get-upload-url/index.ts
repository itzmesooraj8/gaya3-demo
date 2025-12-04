import { serve } from "std/server";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, { auth: { persistSession: false } });

serve(async (req) => {
  try {
    if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405 });

    const authHeader = req.headers.get("authorization") || "";
    const token = authHeader.replace("Bearer ", "");
    if (!token) return new Response(JSON.stringify({ error: "Missing access token" }), { status: 401 });

    const body = await req.json();
    const { property_id, filename, file_b64 } = body;
    if (!property_id || !filename || !file_b64) return new Response(JSON.stringify({ error: "Missing fields" }), { status: 400 });

    // Get user from provided access token
    const { data: userData, error: userErr } = await supabase.auth.getUser(token as string);
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), { status: 401 });
    }
    const userId = userData.user.id;

    // Verify that the property belongs to this host (and that the user is a host)
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", userId).single();
    if (!profile || profile.role !== "host") {
      return new Response(JSON.stringify({ error: "Only hosts can upload property images" }), { status: 403 });
    }

    const { data: property } = await supabase.from("properties").select("id, host_id").eq("id", property_id).single();
    if (!property || property.host_id !== userId) {
      return new Response(JSON.stringify({ error: "Property not found or you are not the host" }), { status: 403 });
    }

    // Decode base64 file
    const bytes = Uint8Array.from(atob(file_b64), (c) => c.charCodeAt(0));
    const path = `${property_id}/${filename}`;

    // Upload using service role key
    const { data: uploadData, error: uploadErr } = await supabase.storage
      .from("property-images")
      .upload(path, bytes, { upsert: true });

    if (uploadErr) {
      console.error("Upload error:", uploadErr);
      return new Response(JSON.stringify({ error: "Upload failed", details: uploadErr }), { status: 500 });
    }

    // Return public URL
    const { data: publicUrlData } = supabase.storage.from("property-images").getPublicUrl(path);

    return new Response(JSON.stringify({ publicUrl: publicUrlData?.publicUrl, path }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
  }
});
