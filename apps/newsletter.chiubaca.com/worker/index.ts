import type { Request as CFRequest, ExecutionContext, SendEmail } from "@cloudflare/workers-types";

export interface Env {
  DB: D1Database;
  EMAIL: SendEmail;
  ADMIN_SECRET: string;
  ASSETS: Fetcher;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function generateToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

function confirmationEmailHtml(confirmUrl: string): string {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Confirm your Tangent subscription</title>
<style>
body { font-family: 'JetBrains Mono', monospace; background: #04060a; color: #e2e8f0; padding: 40px 20px; }
.container { max-width: 520px; margin: 0 auto; }
h1 { color: #c9841a; font-size: 24px; margin-bottom: 20px; }
p { color: #94a3b8; line-height: 1.6; margin-bottom: 16px; }
.cta { display: inline-block; background: #c9841a; color: #04060a; padding: 14px 28px; text-decoration: none; font-weight: 700; border-radius: 4px; margin: 20px 0; }
.footer { margin-top: 40px; font-size: 12px; color: #475569; }
.url { color: #64748b; word-break: break-all; }
</style>
</head>
<body>
<div class="container">
<h1>Confirm your subscription</h1>
<p>hey there — someone (hopefully you) wants to get Tangent brain dumps delivered to their inbox.</p>
<p>click the button below to confirm. if you didn't request this, ignore it. no harm done.</p>
<a href="${confirmUrl}" class="cta">CONFIRM SUBSCRIPTION</a>
<p class="url">or copy this link: ${confirmUrl}</p>
<div class="footer"><p>Tangent is written by Alex Chiu, a man who should probably be asleep.</p></div>
</div>
</body>
</html>`;
}

function confirmationEmailText(confirmUrl: string): string {
  return `Confirm your Tangent subscription

hey there — someone (hopefully you) wants to get Tangent brain dumps delivered to their inbox.

click to confirm: ${confirmUrl}

if you didn't request this, ignore it. no harm done.

— Tangent`;
}

async function sendConfirmationEmail(
  email: string,
  token: string,
  emailService: SendEmail,
  origin: string
): Promise<{ messageId: string }> {
  const confirmUrl = `${origin}/confirm?token=${token}`;

  try {
    const result = await emailService.send({
      to: email,
      from: { email: "noreply@newsletter.chiubaca.com", name: "Tangent" },
      subject: "Confirm your Tangent subscription",
      text: confirmationEmailText(confirmUrl),
      html: confirmationEmailHtml(confirmUrl),
    });
    return { messageId: result.messageId };
  } catch (err: any) {
    const code = err?.code ?? "UNKNOWN";
    const message = err?.message ?? String(err);
    throw new Error(`Email send failed [${code}]: ${message}`);
  }
}

async function handleSubscribe(request: CFRequest, env: Env, origin: string): Promise<Response> {
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  let body: { email?: string };
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }

  const email = body.email?.toLowerCase().trim();
  if (!email || !isValidEmail(email)) {
    return json({ error: "Invalid email address" }, 400);
  }

  const existing = await env.DB.prepare(
    "SELECT status, token FROM subscribers WHERE email = ?"
  ).bind(email).first<{ status: string; token: string }>();

  if (existing) {
    if (existing.status === "active") {
      return json({ success: true, message: "Already subscribed" }, 200);
    }
    try {
      await sendConfirmationEmail(email, existing.token, env.EMAIL, origin);
    } catch (err) {
      console.error("Confirmation resend failed:", err);
      return json({ error: "Failed to send confirmation email. Try again later." }, 500);
    }
    return json({ success: true, message: "Confirmation email resent" }, 200);
  }

  const token = generateToken();
  try {
    await env.DB.prepare(
      "INSERT INTO subscribers (email, status, token) VALUES (?, 'pending', ?)"
    ).bind(email, token).run();
  } catch {
    return json({ error: "Something went wrong. Try again?" }, 500);
  }

  try {
    await sendConfirmationEmail(email, token, env.EMAIL, origin);
  } catch (err: any) {
    console.error("Confirmation send failed:", err);
    const isDomainError = err.message?.includes("E_SENDER_NOT_VERIFIED");
    if (isDomainError) {
      return json({ error: "Sender domain not verified. Contact site admin." }, 500);
    }
    return json({ error: "Failed to send confirmation email. Try again later." }, 500);
  }

  return json({ success: true, message: "Check your email for confirmation" }, 200);
}

async function handleConfirm(request: CFRequest, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");

  if (!token) return json({ error: "Missing token" }, 400);

  const result = await env.DB.prepare(
    "UPDATE subscribers SET status = 'active', confirmed_at = unixepoch() WHERE token = ? AND status = 'pending'"
  ).bind(token).run();

  if (result.meta?.rows_written === 0) {
    const sub = await env.DB.prepare("SELECT status FROM subscribers WHERE token = ?")
      .bind(token).first<{ status: string }>();
    if (sub?.status === "active") {
      return json({ success: true, message: "Already confirmed" }, 200);
    }
    return json({ error: "Invalid or expired token" }, 400);
  }

  return json({ success: true, message: "Subscription confirmed" }, 200);
}

async function handleUnsubscribe(request: CFRequest, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");

  if (!token) return json({ error: "Missing token" }, 400);

  await env.DB.prepare(
    "UPDATE subscribers SET status = 'unsubscribed', unsubscribed_at = unixepoch() WHERE token = ?"
  ).bind(token).run();

  return json({ success: true, message: "Unsubscribed" }, 200);
}

async function handleAdminSubscribers(request: CFRequest, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const secret = url.searchParams.get("secret");
  if (secret !== env.ADMIN_SECRET) {
    return json({ error: "Unauthorized" }, 401);
  }

  const result = await env.DB.prepare(
    "SELECT id, email, status, created_at, confirmed_at, unsubscribed_at FROM subscribers ORDER BY created_at DESC"
  ).all<{ id: number; email: string; status: string; created_at: number; confirmed_at: number | null; unsubscribed_at: number | null }>();

  return json({ subscribers: result.results ?? [] }, 200);
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
}

export default {
  async fetch(request: CFRequest, env: Env, _ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    if (path.startsWith("/api/")) {
      if (request.method === "OPTIONS") {
        return new Response(null, { status: 204, headers: corsHeaders });
      }

      if (path === "/api/subscribe") return handleSubscribe(request, env, url.origin);
      if (path === "/api/confirm") return handleConfirm(request, env);
      if (path === "/api/unsubscribe") return handleUnsubscribe(request, env);
      if (path === "/api/admin/subscribers") return handleAdminSubscribers(request, env);

      return json({ error: "Not found" }, 404);
    }

    return env.ASSETS.fetch(request);
  },
};
