
import { sendNotification } from "@block65/webcrypto-web-push";

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://www.rtsourludo.sbs",
  "Access-Control-Allow-Methods": "POST, OPTIONS, GET",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    if (url.pathname === "/health" && request.method === "GET") {
      return json({ ok: true, service: "RTS Ludo Push" });
    }

    if (url.pathname === "/subscribe" && request.method === "POST") {
      try {
        const { playerId, subscription } = await request.json();

        if (
          typeof playerId !== "string" ||
          !playerId.trim() ||
          playerId.length > 150 ||
          !subscription?.endpoint ||
          !subscription?.keys?.p256dh ||
          !subscription?.keys?.auth
        ) {
          return json({ ok: false, error: "Invalid subscription data" }, 400);
        }

        const key = `player:${playerId.trim()}`;
        await env.PUSH_SUBS.put(key, JSON.stringify(subscription));
        return json({ ok: true });
      } catch {
        return json({ ok: false, error: "Subscription could not be saved" }, 400);
      }
    }

    return json({ ok: false, error: "Route not found" }, 404);
  },
};
