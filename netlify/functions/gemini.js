// netlify/functions/gemini.js
const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent";

const cors = (status = 200, body = "", extraHeaders = {}) =>
  new Response(body, {
    status,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Content-Type": "application/json; charset=utf-8",
      ...extraHeaders
    }
  });

export default async (req) => {
  // Preflight
  if (req.method === "OPTIONS") {
    return cors(204, "");
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return cors(500, JSON.stringify({ error: { message: "GEMINI_API_KEY missing" } }));
    }

    // Body robust einlesen
    let payload;
    const ct = req.headers.get("content-type") || "";
    if (ct.includes("application/json")) {
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

    const text = await upstream.text();
    // Antworte mit dem Original-Status und -Body, CORS beibehalten
    return cors(upstream.status, text);
  } catch (e) {
    return cors(502, JSON.stringify({ error: { message: e.message } }));
  }
};
