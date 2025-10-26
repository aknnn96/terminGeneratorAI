// netlify/functions/gemini.js
const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent";

function withCors(status, body, contentType = "application/json; charset=utf-8") {
  return new Response(body, {
    status,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Content-Type": contentType
    }
  });
}

export default async (req) => {
  // Preflight
  if (req.method === "OPTIONS") {
    return withCors(204, "", "text/plain; charset=utf-8");
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return withCors(500, JSON.stringify({ error: { message: "GEMINI_API_KEY missing" } }));
    }

    // Body lesen
    let payload;
    const ctIn = req.headers.get("content-type") || "";
    if (ctIn.includes("application/json")) {
      payload = await req.json().catch(() => ({}));
    } else {
      const raw = await req.text();
      payload = raw ? JSON.parse(raw) : {};
    }

    // Upstream
    const upstream = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey
      },
      body: JSON.stringify(payload)
    });

    const text = await upstream.text();
    const isJson = upstream.headers.get("content-type")?.includes("application/json");

    // WICHTIG: passenden Content-Type setzen
    return withCors(upstream.status, text, isJson ? "application/json; charset=utf-8" : "text/plain; charset=utf-8");
  } catch (e) {
    return withCors(502, JSON.stringify({ error: { message: e.message } }));
  }
};
