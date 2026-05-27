export async function onRequestGet() {
  return new Response(JSON.stringify({ ok: true, runtime: "cloudflare-workers" }), {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
