const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent";

export default async (req) => {
  // CORS + Preflight
  if (req.method === "OPTIONS") {
    return new Response("", {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS"
      }
    });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: { message: "GEMINI_API_KEY missing" } }), {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json; charset=utf-8"
        }
      });
    }

    // Payload lesen
    let payload;
    const ctIn = req.headers.get("content-type") || "";
    if (ctIn.includes("application/json")) {
      payload = await req.json().catch(() => ({}));
    } else {
      const raw = await req.text();
      payload = raw ? JSON.parse(raw) : {};
    }

    const upstream = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey
      },
      body: JSON.stringify(payload)
    });

    const bodyText = await upstream.text();
    const isJson = upstream.headers.get("content-type")?.includes("application/json");

    return new Response(bodyText, {
      status: upstream.status,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Content-Type": isJson ? "application/json; charset=utf-8" : "text/plain; charset=utf-8"
      }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: { message: e.message } }), {
      status: 502,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json; charset=utf-8"
      }
    });
  }
};
