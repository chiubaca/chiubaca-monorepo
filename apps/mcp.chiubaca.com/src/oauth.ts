import {
  AuthorizationError,
  OAuthProvider,
  type AuthRequest,
  type ClientInfo,
  type OAuthHelpers,
} from "@cloudflare/workers-oauth-provider";

import { mcpHandler } from "./mcp";
import type { NotesSecrets } from "./fleeting-notes";
import { readJsonObject, readLimitedBytes } from "./http";

const MCP_SCOPE = "mcp:tools";
const PRODUCTION_RESOURCE = "https://mcp.chiubaca.com/mcp";
const IMMUTABLE_GITHUB_ID = 18_376_481;
const FLOW_TTL_SECONDS = 600;
const MAX_FORM_BYTES = 8_192;
const MAX_GITHUB_RESPONSE_BYTES = 32_768;
const CONSENT_KEY_PREFIX = "app:consent:";
const GITHUB_KEY_PREFIX = "app:github:";
const CONSENT_COOKIE = "__Host-mcp_consent";
const GITHUB_COOKIE = "__Host-mcp_github";

type SecretBindings = {
  GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;
};

export type RuntimeEnv = Env &
  NotesSecrets &
  SecretBindings & {
    OAUTH_PROVIDER: OAuthHelpers;
  };

type ConsentRecord = {
  kind: "consent";
  authRequest: AuthRequest;
  browserBindingHash: string;
  csrfHash: string;
};

type GitHubRecord = {
  kind: "github";
  authRequest: AuthRequest;
  browserBindingHash: string;
  codeVerifier: string;
};

type GitHubUser = {
  id: number;
  login: string;
  name?: string;
};

const apiHandler = {
  async fetch(request: Request, env: RuntimeEnv, ctx: ExecutionContext): Promise<Response> {
    const authorization = request.headers.get("Authorization") ?? "";
    const accessToken = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
    const token = accessToken ? await env.OAUTH_PROVIDER.unwrapToken(accessToken) : null;
    if (!token?.scope.includes(MCP_SCOPE)) {
      return Response.json(
        { error: "insufficient_scope" },
        {
          status: 403,
          headers: {
            "WWW-Authenticate": `Bearer error="insufficient_scope", scope="${MCP_SCOPE}", resource_metadata="${new URL(env.MCP_RESOURCE_URL).origin}/.well-known/oauth-protected-resource/mcp"`,
          },
        },
      );
    }
    return mcpHandler(request, env, ctx);
  },
} satisfies ExportedHandler<RuntimeEnv>;

const publicHandler = {
  async fetch(request: Request, env: RuntimeEnv): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/" && request.method === "GET") {
      return statusPage(env.MCP_RESOURCE_URL);
    }

    if (url.pathname === "/authorize" && request.method === "GET") {
      return showConsent(request, env);
    }

    if (url.pathname === "/authorize" && request.method === "POST") {
      return processConsent(request, env);
    }

    if (url.pathname === "/callback" && request.method === "GET") {
      return processGitHubCallback(request, env);
    }

    return textResponse("Not found", 404);
  },
} satisfies ExportedHandler<RuntimeEnv>;

export function createOAuthProvider(resourceUrl: string): OAuthProvider<RuntimeEnv> {
  const authorizationServer = new URL(resourceUrl).origin;

  return new OAuthProvider<RuntimeEnv>({
    apiRoute: "/mcp",
    apiHandler,
    defaultHandler: publicHandler,
    authorizeEndpoint: "/authorize",
    tokenEndpoint: "/oauth/token",
    clientRegistrationEndpoint: "/oauth/register",
    clientIdMetadataDocumentEnabled: true,
    scopesSupported: [MCP_SCOPE],
    resourceMetadata: {
      resource: resourceUrl,
      authorization_servers: [authorizationServer],
      scopes_supported: [MCP_SCOPE],
      bearer_methods_supported: ["header"],
      resource_name: "chiubaca MCP",
    },
    onError(error) {
      console.warn(
        JSON.stringify({
          event: "oauth_error",
          code: error.code,
          status: error.status,
          category: error.internal?.category,
          reason: error.internal?.reason,
        }),
      );
    },
  });
}

export function validateRequestOrigin(request: Request, env: RuntimeEnv): URL {
  let resource: URL;
  try {
    resource = new URL(env.MCP_RESOURCE_URL);
  } catch {
    throw new Error("Invalid MCP resource configuration");
  }

  const localResource =
    resource.protocol === "http:" &&
    resource.hostname === "localhost" &&
    resource.port === "8788" &&
    resource.pathname === "/mcp";
  const productionResource = resource.href === PRODUCTION_RESOURCE;

  if (
    (!productionResource && !localResource) ||
    resource.username !== "" ||
    resource.password !== "" ||
    resource.search !== "" ||
    resource.hash !== ""
  ) {
    throw new Error("Invalid MCP resource configuration");
  }

  if (env.ALLOWED_GITHUB_ID !== String(IMMUTABLE_GITHUB_ID)) {
    throw new Error("Invalid GitHub account configuration");
  }

  if (new URL(request.url).origin !== resource.origin) {
    throw new Error("Request origin does not match the configured MCP resource");
  }

  return resource;
}

export function withSecurityHeaders(response: Response): Response {
  const headers = new Headers(response.headers);
  headers.set("Cache-Control", "no-store");
  if (!headers.has("Content-Security-Policy")) {
    headers.set(
      "Content-Security-Policy",
      "default-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'",
    );
  }
  headers.set("Permissions-Policy", "camera=(), geolocation=(), microphone=()");
  headers.set("Referrer-Policy", "no-referrer");
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("X-Frame-Options", "DENY");

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

async function showConsent(request: Request, env: RuntimeEnv): Promise<Response> {
  let authRequest: AuthRequest;
  try {
    authRequest = await env.OAUTH_PROVIDER.parseAuthRequest(request);
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return authorizationErrorResponse(error);
    }
    throw error;
  }

  if (!authRequest.scope.includes(MCP_SCOPE)) {
    return oauthRedirect(authRequest, "invalid_scope", `The ${MCP_SCOPE} scope is required.`);
  }

  const client = await env.OAUTH_PROVIDER.lookupClient(authRequest.clientId);
  if (!client) {
    return errorPage("Invalid authorization request", 400);
  }

  const flowId = randomToken();
  const csrf = randomToken();
  const browserBinding = randomToken();
  const record: ConsentRecord = {
    kind: "consent",
    authRequest,
    csrfHash: await digestToken(csrf),
    browserBindingHash: await digestToken(browserBinding),
  };

  await env.OAUTH_KV.put(`${CONSENT_KEY_PREFIX}${flowId}`, JSON.stringify(record), {
    expirationTtl: FLOW_TTL_SECONDS,
  });

  return consentPage(
    client,
    authRequest.scope,
    flowId,
    csrf,
    browserBinding,
    new URL(authRequest.redirectUri),
  );
}

async function processConsent(request: Request, env: RuntimeEnv): Promise<Response> {
  const contentType = request.headers.get("Content-Type")?.toLowerCase() ?? "";
  const contentLength = Number(request.headers.get("Content-Length") ?? "0");
  if (!contentType.startsWith("application/x-www-form-urlencoded")) {
    return errorPage("Unsupported request", 415, clearCookie(CONSENT_COOKIE));
  }
  if (!Number.isFinite(contentLength) || contentLength > MAX_FORM_BYTES) {
    return errorPage("Invalid request", 413, clearCookie(CONSENT_COOKIE));
  }

  let form: URLSearchParams;
  try {
    const bytes = await readLimitedBytes(request.body, MAX_FORM_BYTES);
    form = new URLSearchParams(
      new TextDecoder("utf-8", { fatal: true, ignoreBOM: false }).decode(bytes),
    );
  } catch {
    return errorPage("Invalid request", 413, clearCookie(CONSENT_COOKIE));
  }
  const flowId = formString(form, "flow_id");
  const csrf = formString(form, "csrf_token");
  const decision = formString(form, "decision");
  const browserBinding = readCookie(request, CONSENT_COOKIE);

  if (!isToken(flowId) || !isToken(csrf) || !isToken(browserBinding)) {
    return errorPage("Invalid or expired authorization request", 400, clearCookie(CONSENT_COOKIE));
  }

  const key = `${CONSENT_KEY_PREFIX}${flowId}`;
  const stored = await env.OAUTH_KV.get(key, { type: "json" });
  const record = parseConsentRecord(stored, env.MCP_RESOURCE_URL);
  if (
    !record ||
    !(await tokenMatchesDigest(csrf, record.csrfHash)) ||
    !(await tokenMatchesDigest(browserBinding, record.browserBindingHash))
  ) {
    return errorPage("Invalid or expired authorization request", 400, clearCookie(CONSENT_COOKIE));
  }

  await env.OAUTH_KV.delete(key);

  if (decision === "deny") {
    return oauthRedirect(
      record.authRequest,
      "access_denied",
      "Authorization was denied.",
      clearCookie(CONSENT_COOKIE),
    );
  }
  if (decision !== "approve") {
    return errorPage("Invalid authorization decision", 400, clearCookie(CONSENT_COOKIE));
  }
  if (!isConfiguredSecret(env.GITHUB_CLIENT_ID) || !isConfiguredSecret(env.GITHUB_CLIENT_SECRET)) {
    return errorPage("Authentication is not configured", 503, clearCookie(CONSENT_COOKIE));
  }

  const githubState = randomToken();
  const githubBinding = randomToken();
  const codeVerifier = randomToken();
  const githubRecord: GitHubRecord = {
    kind: "github",
    authRequest: record.authRequest,
    browserBindingHash: await digestToken(githubBinding),
    codeVerifier,
  };

  await env.OAUTH_KV.put(`${GITHUB_KEY_PREFIX}${githubState}`, JSON.stringify(githubRecord), {
    expirationTtl: FLOW_TTL_SECONDS,
  });

  const resource = new URL(env.MCP_RESOURCE_URL);
  const githubAuthorize = new URL("https://github.com/login/oauth/authorize");
  githubAuthorize.searchParams.set("client_id", env.GITHUB_CLIENT_ID);
  githubAuthorize.searchParams.set("redirect_uri", `${resource.origin}/callback`);
  githubAuthorize.searchParams.set("state", githubState);
  githubAuthorize.searchParams.set("code_challenge", await sha256Base64Url(codeVerifier));
  githubAuthorize.searchParams.set("code_challenge_method", "S256");
  githubAuthorize.searchParams.set("allow_signup", "false");

  return redirectResponse(githubAuthorize, [
    clearCookie(CONSENT_COOKIE),
    setCookie(GITHUB_COOKIE, githubBinding),
  ]);
}

async function processGitHubCallback(request: Request, env: RuntimeEnv): Promise<Response> {
  const url = new URL(request.url);
  const state = uniqueSearchParam(url, "state");
  const browserBinding = readCookie(request, GITHUB_COOKIE);
  const clearGitHubCookie = clearCookie(GITHUB_COOKIE);

  if (!isToken(state) || !isToken(browserBinding)) {
    return errorPage("Invalid or expired login request", 400, clearGitHubCookie);
  }

  const key = `${GITHUB_KEY_PREFIX}${state}`;
  const stored = await env.OAUTH_KV.get(key, { type: "json" });
  const record = parseGitHubRecord(stored, env.MCP_RESOURCE_URL);
  if (!record || !(await tokenMatchesDigest(browserBinding, record.browserBindingHash))) {
    return errorPage("Invalid or expired login request", 400, clearGitHubCookie);
  }

  await env.OAUTH_KV.delete(key);

  if (url.searchParams.has("error")) {
    return oauthRedirect(
      record.authRequest,
      "access_denied",
      "GitHub login was denied.",
      clearGitHubCookie,
    );
  }

  const code = uniqueSearchParam(url, "code");
  if (!code || code.length > 1_024) {
    return oauthRedirect(
      record.authRequest,
      "access_denied",
      "GitHub login did not complete.",
      clearGitHubCookie,
    );
  }

  let githubUser: GitHubUser;
  try {
    githubUser = await authenticateGitHub(
      code,
      record.codeVerifier,
      env,
      new URL(env.MCP_RESOURCE_URL),
    );
  } catch {
    return oauthRedirect(
      record.authRequest,
      "temporarily_unavailable",
      "GitHub login could not be completed.",
      clearGitHubCookie,
    );
  }

  if (githubUser.id !== IMMUTABLE_GITHUB_ID) {
    return oauthRedirect(
      record.authRequest,
      "access_denied",
      "This GitHub account is not permitted.",
      clearGitHubCookie,
    );
  }

  try {
    const { redirectTo } = await env.OAUTH_PROVIDER.completeAuthorization({
      request: record.authRequest,
      userId: `github-${githubUser.id}`,
      metadata: { githubId: githubUser.id },
      scope: [MCP_SCOPE],
      props: {
        githubId: githubUser.id,
        githubLogin: githubUser.login,
        ...(githubUser.name ? { githubName: githubUser.name } : {}),
      },
    });

    return redirectResponse(new URL(redirectTo), clearGitHubCookie);
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return errorPage("Authorization could not be completed", 400, clearGitHubCookie);
    }
    throw error;
  }
}

async function authenticateGitHub(
  code: string,
  codeVerifier: string,
  env: RuntimeEnv,
  resource: URL,
): Promise<GitHubUser> {
  const tokenBody = new URLSearchParams({
    client_id: env.GITHUB_CLIENT_ID,
    client_secret: env.GITHUB_CLIENT_SECRET,
    code,
    code_verifier: codeVerifier,
    redirect_uri: `${resource.origin}/callback`,
  });
  const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": "chiubaca-mcp",
    },
    body: tokenBody,
    // Workers supports manual redirects; non-2xx responses are rejected below.
    redirect: "manual",
  });
  if (!tokenResponse.ok) {
    throw new Error("GitHub token exchange failed");
  }

  const tokenPayload = await readJsonObject(tokenResponse, MAX_GITHUB_RESPONSE_BYTES);
  const accessToken = tokenPayload.access_token;
  if (typeof accessToken !== "string" || accessToken.length < 1 || accessToken.length > 1_024) {
    throw new Error("GitHub token response was invalid");
  }

  const userResponse = await fetch("https://api.github.com/user", {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${accessToken}`,
      "User-Agent": "chiubaca-mcp",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    redirect: "manual",
  });
  if (!userResponse.ok) {
    throw new Error("GitHub identity lookup failed");
  }

  const user = await readJsonObject(userResponse, MAX_GITHUB_RESPONSE_BYTES);
  if (
    !Number.isSafeInteger(user.id) ||
    typeof user.login !== "string" ||
    user.login.length < 1 ||
    user.login.length > 100
  ) {
    throw new Error("GitHub identity response was invalid");
  }

  return {
    id: user.id as number,
    login: user.login,
    ...(typeof user.name === "string" && user.name.length <= 100 ? { name: user.name } : {}),
  };
}

function authorizationErrorResponse(error: AuthorizationError): Response {
  if (!error.redirectUri) {
    return errorPage("Invalid authorization request", 400);
  }

  let redirect: URL;
  try {
    redirect = new URL(error.redirectUri);
  } catch {
    return errorPage("Invalid authorization request", 400);
  }

  redirect.searchParams.set("error", error.code);
  redirect.searchParams.set("error_description", error.description);
  if (error.state) redirect.searchParams.set("state", error.state);
  if (error.issuer) redirect.searchParams.set("iss", error.issuer);
  return redirectResponse(redirect);
}

function oauthRedirect(
  authRequest: AuthRequest,
  code: "access_denied" | "invalid_scope" | "temporarily_unavailable",
  description: string,
  cookies?: string | string[],
): Response {
  const redirect = new URL(authRequest.redirectUri);
  redirect.searchParams.set("error", code);
  redirect.searchParams.set("error_description", description);
  if (authRequest.state) redirect.searchParams.set("state", authRequest.state);
  if (authRequest.issuer) redirect.searchParams.set("iss", authRequest.issuer);
  return redirectResponse(redirect, cookies);
}

function statusPage(resourceUrl: string): Response {
  const nonce = randomToken();
  return htmlResponse(
    `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>chiubaca MCP</title>
  <style nonce="${nonce}">${pageStyles()}</style>
</head>
<body>
  <main class="panel status-panel">
    <p class="eyebrow">chiubaca.com / remote interface</p>
    <h1>MCP ONLINE<span class="cursor" aria-hidden="true">_</span></h1>
    <p>An authenticated, stateless Streamable HTTP MCP server.</p>
    <dl>
      <div><dt>endpoint</dt><dd><code>${escapeHtml(resourceUrl)}</code></dd></div>
      <div><dt>authorization</dt><dd>OAuth 2.1 via GitHub</dd></div>
      <div><dt>access</dt><dd>restricted</dd></div>
    </dl>
  </main>
</body>
</html>`,
    nonce,
  );
}

function consentPage(
  client: ClientInfo,
  scopes: string[],
  flowId: string,
  csrf: string,
  browserBinding: string,
  clientRedirect: URL,
): Response {
  const nonce = randomToken();
  const clientName = client.clientName || "Unnamed MCP client";
  const safeClientUri = safeHttpUrl(client.clientUri);
  const clientLink = safeClientUri
    ? `<a href="${escapeHtml(safeClientUri)}" rel="noreferrer">${escapeHtml(new URL(safeClientUri).hostname)}</a>`
    : "Not provided";
  const scopeItems = scopes.map((scope) => `<li><code>${escapeHtml(scope)}</code></li>`).join("");

  return htmlResponse(
    `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Authorize ${escapeHtml(clientName)}</title>
  <style nonce="${nonce}">${pageStyles()}</style>
</head>
<body>
  <main class="panel">
    <p class="eyebrow">authorization request</p>
    <h1>GRANT ACCESS?<span class="cursor" aria-hidden="true">_</span></h1>
    <p><strong>${escapeHtml(clientName)}</strong> wants to use this MCP server as your GitHub identity.</p>
    <dl>
      <div><dt>client</dt><dd class="break">${escapeHtml(client.clientId)}</dd></div>
      <div><dt>website</dt><dd>${clientLink}</dd></div>
      <div><dt>scope</dt><dd><ul>${scopeItems}</ul></dd></div>
    </dl>
    <p class="notice">Approval continues to GitHub. Only GitHub user ID ${IMMUTABLE_GITHUB_ID} is accepted.</p>
    <form method="post" action="/authorize">
      <input type="hidden" name="flow_id" value="${escapeHtml(flowId)}">
      <input type="hidden" name="csrf_token" value="${escapeHtml(csrf)}">
      <div class="actions">
        <button class="deny" type="submit" name="decision" value="deny">Deny</button>
        <button class="approve" type="submit" name="decision" value="approve">Continue with GitHub</button>
      </div>
    </form>
  </main>
</body>
</html>`,
    nonce,
    setCookie(CONSENT_COOKIE, browserBinding),
    200,
    clientRedirect,
  );
}

function errorPage(message: string, status: number, cookie?: string): Response {
  const nonce = randomToken();
  return htmlResponse(
    `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Authorization error</title>
  <style nonce="${nonce}">${pageStyles()}</style>
</head>
<body>
  <main class="panel status-panel">
    <p class="eyebrow">request rejected</p>
    <h1>ACCESS ERROR</h1>
    <p>${escapeHtml(message)}</p>
  </main>
</body>
</html>`,
    nonce,
    cookie,
    status,
  );
}

function htmlResponse(
  body: string,
  nonce: string,
  cookies?: string | string[],
  status = 200,
  clientRedirect?: URL,
): Response {
  // Chromium checks the entire form redirect chain, including the registered client callback.
  // Only use the origin of an OAuth-validated HTTP(S) callback, never its path or query.
  const callbackOrigin =
    clientRedirect &&
    (clientRedirect.protocol === "https:" || clientRedirect.protocol === "http:") &&
    !/[\s;'"*]/.test(clientRedirect.origin)
      ? clientRedirect.origin
      : undefined;
  const formAction = clientRedirect
    ? ["'self'", "https://github.com", callbackOrigin].filter(Boolean).join(" ")
    : "'self'";
  const headers = new Headers({
    "Cache-Control": "no-store",
    "Content-Security-Policy": `default-src 'none'; style-src 'nonce-${nonce}'; form-action ${formAction}; frame-ancestors 'none'; base-uri 'none'; object-src 'none'`,
    "Content-Type": "text/html; charset=utf-8",
    "Permissions-Policy": "camera=(), geolocation=(), microphone=()",
    "Referrer-Policy": "no-referrer",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
  });
  appendCookies(headers, cookies);
  return new Response(body, { status, headers });
}

function textResponse(body: string, status: number): Response {
  return withSecurityHeaders(
    new Response(body, {
      status,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    }),
  );
}

function redirectResponse(location: URL, cookies?: string | string[]): Response {
  const headers = new Headers({ Location: location.href });
  appendCookies(headers, cookies);
  return withSecurityHeaders(new Response(null, { status: 302, headers }));
}

function appendCookies(headers: Headers, cookies?: string | string[]): void {
  if (!cookies) return;
  for (const cookie of Array.isArray(cookies) ? cookies : [cookies]) {
    headers.append("Set-Cookie", cookie);
  }
}

function setCookie(name: string, value: string): string {
  return `${name}=${value}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${FLOW_TTL_SECONDS}`;
}

function clearCookie(name: string): string {
  return `${name}=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`;
}

function readCookie(request: Request, name: string): string | null {
  const values = (request.headers.get("Cookie") ?? "")
    .split(";")
    .map((part) => part.trim())
    .filter((part) => part.startsWith(`${name}=`))
    .map((part) => part.slice(name.length + 1));
  return values.length === 1 ? values[0] : null;
}

function formString(form: URLSearchParams, name: string): string | null {
  const values = form.getAll(name);
  return values.length === 1 ? values[0] : null;
}

function uniqueSearchParam(url: URL, name: string): string | null {
  const values = url.searchParams.getAll(name);
  return values.length === 1 ? values[0] : null;
}

function randomToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return bytesToBase64Url(bytes);
}

function isToken(value: string | null): value is string {
  return value !== null && /^[A-Za-z0-9_-]{43}$/.test(value);
}

async function digestToken(token: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token));
  return bytesToBase64Url(new Uint8Array(digest));
}

async function tokenMatchesDigest(token: string, expectedDigest: string): Promise<boolean> {
  const actual = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token));
  const decoded = base64UrlToBytes(expectedDigest);
  const expected = decoded?.byteLength === 32 ? decoded : new Uint8Array(32);
  const matches = crypto.subtle.timingSafeEqual(actual, expected);
  return decoded?.byteLength === 32 && matches;
}

async function sha256Base64Url(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return bytesToBase64Url(new Uint8Array(digest));
}

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
}

function base64UrlToBytes(value: string): Uint8Array | null {
  if (!/^[A-Za-z0-9_-]{43}$/.test(value)) return null;
  try {
    const binary = atob(value.replaceAll("-", "+").replaceAll("_", "/") + "=");
    return Uint8Array.from(binary, (character) => character.charCodeAt(0));
  } catch {
    return null;
  }
}

function parseConsentRecord(value: unknown, resourceUrl: string): ConsentRecord | null {
  if (
    !isRecord(value) ||
    value.kind !== "consent" ||
    typeof value.browserBindingHash !== "string" ||
    typeof value.csrfHash !== "string"
  ) {
    return null;
  }
  const authRequest = parseStoredAuthRequest(value.authRequest, resourceUrl);
  return authRequest
    ? {
        kind: "consent",
        authRequest,
        browserBindingHash: value.browserBindingHash,
        csrfHash: value.csrfHash,
      }
    : null;
}

function parseGitHubRecord(value: unknown, resourceUrl: string): GitHubRecord | null {
  const codeVerifier =
    isRecord(value) && typeof value.codeVerifier === "string" ? value.codeVerifier : null;
  if (
    !isRecord(value) ||
    value.kind !== "github" ||
    typeof value.browserBindingHash !== "string" ||
    !isToken(codeVerifier)
  ) {
    return null;
  }
  const authRequest = parseStoredAuthRequest(value.authRequest, resourceUrl);
  return authRequest
    ? {
        kind: "github",
        authRequest,
        browserBindingHash: value.browserBindingHash,
        codeVerifier,
      }
    : null;
}

function parseStoredAuthRequest(value: unknown, resourceUrl: string): AuthRequest | null {
  if (
    !isRecord(value) ||
    value.responseType !== "code" ||
    typeof value.clientId !== "string" ||
    typeof value.redirectUri !== "string" ||
    !Array.isArray(value.scope) ||
    !value.scope.every((scope) => typeof scope === "string" && scope === MCP_SCOPE) ||
    !value.scope.includes(MCP_SCOPE) ||
    typeof value.state !== "string"
  ) {
    return null;
  }

  try {
    new URL(value.redirectUri);
  } catch {
    return null;
  }

  let resource: string | string[] | undefined;
  if (typeof value.resource === "string") {
    resource = value.resource;
  } else if (
    Array.isArray(value.resource) &&
    value.resource.every((item) => typeof item === "string")
  ) {
    resource = value.resource;
  } else if (value.resource !== undefined) {
    return null;
  }
  if (
    resource !== undefined &&
    (typeof resource === "string"
      ? resource !== resourceUrl
      : !resource.every((item) => item === resourceUrl))
  )
    return null;

  if (
    (value.codeChallenge !== undefined && typeof value.codeChallenge !== "string") ||
    (value.codeChallengeMethod !== undefined && typeof value.codeChallengeMethod !== "string") ||
    (value.issuer !== undefined && typeof value.issuer !== "string")
  ) {
    return null;
  }

  return {
    responseType: value.responseType,
    clientId: value.clientId,
    redirectUri: value.redirectUri,
    scope: value.scope as string[],
    state: value.state,
    ...(value.codeChallenge ? { codeChallenge: value.codeChallenge } : {}),
    ...(value.codeChallengeMethod ? { codeChallengeMethod: value.codeChallengeMethod } : {}),
    ...(resource !== undefined ? { resource } : {}),
    ...(value.issuer ? { issuer: value.issuer } : {}),
  };
}

function safeHttpUrl(value?: string): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    return (url.protocol === "https:" || url.protocol === "http:") && !url.username && !url.password
      ? url.href
      : null;
  } catch {
    return null;
  }
}

function isConfiguredSecret(value: string | undefined): value is string {
  return typeof value === "string" && value.length > 0 && value.length <= 1_024;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[character];
  });
}

function pageStyles(): string {
  return `
    :root { color-scheme: dark; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; background: #070b08; color: #c7f9d4; }
    * { box-sizing: border-box; }
    body { min-height: 100vh; margin: 0; display: grid; place-items: center; padding: 1.25rem; background: radial-gradient(circle at 50% 0%, #102519 0, #070b08 55%); }
    body::after { content: ""; position: fixed; inset: 0; pointer-events: none; opacity: .12; background: repeating-linear-gradient(0deg, transparent 0 3px, #93f7ad 4px); }
    .panel { width: min(100%, 42rem); border: 1px solid #3d7d4e; border-top: 4px solid #78e596; padding: clamp(1.25rem, 5vw, 2.5rem); background: #09110ccc; box-shadow: 0 0 0 1px #0d1a11, 0 1.25rem 5rem #000; }
    .status-panel { width: min(100%, 36rem); }
    .eyebrow { margin: 0 0 .75rem; color: #78e596; font-size: .75rem; letter-spacing: .13em; text-transform: uppercase; }
    h1 { margin: 0 0 1.25rem; color: #e5ffeb; font-size: clamp(1.7rem, 7vw, 3.25rem); line-height: 1; letter-spacing: -.04em; text-shadow: 0 0 1.2rem #3dff7088; }
    p { line-height: 1.65; color: #a8cdb1; }
    strong, code, a { color: #dfffe7; }
    a:focus-visible, button:focus-visible { outline: 3px solid #dfffe7; outline-offset: 3px; }
    dl { margin: 1.5rem 0; border-block: 1px solid #24432d; }
    dl div { display: grid; grid-template-columns: minmax(6rem, .35fr) 1fr; gap: 1rem; padding: .85rem 0; border-bottom: 1px solid #172b1d; }
    dl div:last-child { border-bottom: 0; }
    dt { color: #689d75; text-transform: uppercase; font-size: .75rem; letter-spacing: .08em; }
    dd { margin: 0; }
    ul { margin: 0; padding-left: 1.1rem; }
    .break { overflow-wrap: anywhere; }
    .notice { border-left: 2px solid #78e596; padding-left: 1rem; font-size: .875rem; }
    .actions { display: grid; grid-template-columns: 1fr 2fr; gap: .75rem; margin-top: 1.75rem; }
    button { min-height: 3rem; border: 1px solid #78e596; border-radius: 0; padding: .7rem 1rem; font: inherit; font-weight: 700; cursor: pointer; }
    .approve { background: #78e596; color: #071008; }
    .deny { background: transparent; color: #9ccba8; border-color: #365c40; }
    button:hover { filter: brightness(1.12); }
    .cursor { color: #78e596; }
    @media (max-width: 32rem) { dl div { grid-template-columns: 1fr; gap: .3rem; } .actions { grid-template-columns: 1fr; } .deny { order: 2; } }
    @media (prefers-reduced-motion: no-preference) { .cursor { animation: blink 1.1s steps(2, jump-none) infinite; } @keyframes blink { 50% { opacity: 0; } } }
  `;
}
