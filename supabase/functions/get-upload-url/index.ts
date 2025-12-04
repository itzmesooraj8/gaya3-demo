import { serve } from "https://deno.land/std@0.203.0/http/server.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
// Accept SUPABASE_SERVICE_ROLE_KEY (dashboard) or SERVICE_ROLE_KEY (CLI secrets)
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? Deno.env.get("SERVICE_ROLE_KEY");

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
}

if (!SUPABASE_SERVICE_KEY) {
  console.error("Missing SUPABASE service role key in environment. Set SUPABASE_SERVICE_ROLE_KEY or SERVICE_ROLE_KEY.");
}

const headersWithServiceKey = {
  Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
  apikey: SUPABASE_SERVICE_KEY,
};

serve(async (req) => {
  try {
    if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405 });

    const authHeader = req.headers.get("authorization") || "";
    const token = authHeader.replace(/Bearer\s*/i, "");
    if (!token) return new Response(JSON.stringify({ error: "Missing access token" }), { status: 401 });

    const body = await req.json();
    const { property_id, filename, file_b64 } = body;
    if (!property_id || !filename || !file_b64) return new Response(JSON.stringify({ error: "Missing fields" }), { status: 400 });

    // 1) Verify token and get user info
    const userResp = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!userResp.ok) return new Response(JSON.stringify({ error: "Invalid token" }), { status: 401 });
    const userData = await userResp.json();
    const userId = userData?.id;
    if (!userId) return new Response(JSON.stringify({ error: "Unable to determine user" }), { status: 401 });

    // 2) Check profile role
    const profileResp = await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}&select=role`, {
      headers: headersWithServiceKey,
    });
    if (!profileResp.ok) return new Response(JSON.stringify({ error: "Profile lookup failed" }), { status: 403 });
    const profiles = await profileResp.json();
    const profile = Array.isArray(profiles) ? profiles[0] : profiles;
    if (!profile || profile.role !== "host") return new Response(JSON.stringify({ error: "Only hosts can upload property images" }), { status: 403 });

    // 3) Check property ownership
    const propResp = await fetch(`${SUPABASE_URL}/rest/v1/properties?id=eq.${property_id}&select=id,host_id`, {
      headers: headersWithServiceKey,
    });
    if (!propResp.ok) return new Response(JSON.stringify({ error: "Property lookup failed" }), { status: 404 });
    const props = await propResp.json();
    const property = Array.isArray(props) ? props[0] : props;
    if (!property || property.host_id !== userId) return new Response(JSON.stringify({ error: "Property not found or you are not the host" }), { status: 403 });

    // 4) Decode base64 and upload to Supabase Storage via REST
    const bytes = Uint8Array.from(atob(file_b64), (c) => c.charCodeAt(0));
    const path = `${property_id}/${filename}`;

    const uploadUrl = `${SUPABASE_URL.replace(/\/$/, "")}/storage/v1/object/property-images/${encodeURIComponent(path)}`;

    const uploadResp = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        ...headersWithServiceKey,
        "Content-Type": "application/octet-stream",
      },
      body: bytes,
    });

    if (!uploadResp.ok) {
      const text = await uploadResp.text();
      console.error("Upload failed:", uploadResp.status, text);
      return new Response(JSON.stringify({ error: "Upload failed", details: text }), { status: 500 });
    }

    // 5) Construct public URL (public bucket)
    const publicUrl = `${SUPABASE_URL.replace(/\/$/, "")}/storage/v1/object/public/property-images/${encodeURIComponent(path)}`;

    return new Response(JSON.stringify({ publicUrl, path }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
  }
});
