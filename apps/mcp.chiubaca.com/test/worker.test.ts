import { Buffer } from "node:buffer";
import { env, exports } from "cloudflare:workers";
import { reset } from "cloudflare:test";
import { afterEach, describe, expect, it, vi } from "vite-plus/test";

import type { RuntimeEnv } from "../src/oauth";

const ORIGIN = "https://mcp.chiubaca.com";
const RESOURCE = `${ORIGIN}/mcp`;
const CLIENT_REDIRECT = "https://client.example/callback";
const CLIENT_CODE_VERIFIER = "v".repeat(43);

afterEach(async () => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  await reset();
});

describe("MCP OAuth discovery", () => {
  it("challenges unauthenticated MCP requests with protected-resource metadata", async () => {
    const response = await workerFetch("/mcp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/list" }),
    });

    expect(response.status).toBe(401);
    const challenge = response.headers.get("WWW-Authenticate");
    expect(challenge).toContain('Bearer realm="OAuth"');
    expect(challenge).toContain(
      `resource_metadata="${ORIGIN}/.well-known/oauth-protected-resource/mcp"`,
    );
    expect(response.headers.get("Cache-Control")).toBe("no-store");
  });

  it("publishes the canonical resource, endpoints, scope, CIMD, and DCR fallback", async () => {
    const resourceResponse = await workerFetch("/.well-known/oauth-protected-resource/mcp");
    expect(resourceResponse.status).toBe(200);
    expect(await resourceResponse.json()).toMatchObject({
      resource: RESOURCE,
      authorization_servers: [ORIGIN],
      scopes_supported: ["mcp:tools"],
      bearer_methods_supported: ["header"],
    });

    const providerResponse = await workerFetch("/.well-known/oauth-authorization-server");
    expect(providerResponse.status).toBe(200);
    expect(await providerResponse.json()).toMatchObject({
      issuer: ORIGIN,
      authorization_endpoint: `${ORIGIN}/authorize`,
      token_endpoint: `${ORIGIN}/oauth/token`,
      registration_endpoint: `${ORIGIN}/oauth/register`,
      scopes_supported: ["mcp:tools"],
      code_challenge_methods_supported: ["S256"],
      client_id_metadata_document_supported: true,
    });
  });
});

describe("consent", () => {
  it.each([
    "https://opencode.example.ts.net:8443/callback",
    "http://127.0.0.1:19876/callback",
    "https://client.example/callback?next=https://untrusted.example",
  ])(
    "allows only GitHub and the validated callback origin in form redirects: %s",
    async (redirectUri) => {
      const clientId = await registerClient("Redirect policy client", redirectUri);
      const response = await workerFetch(await authorizationPath(clientId, redirectUri));
      expect(response.status).toBe(200);
      const csp = response.headers.get("Content-Security-Policy");
      expect(csp).toContain(
        `form-action 'self' https://github.com ${new URL(redirectUri).origin};`,
      );
      expect(csp).not.toContain("untrusted.example");
      expect(csp).not.toContain("form-action *");
    },
  );

  it("does not allow an unregistered callback origin in the consent policy", async () => {
    const clientId = await registerClient("Registered callback client");
    const response = await workerFetch(
      await authorizationPath(clientId, "https://unregistered.example/callback"),
    );
    expect(response.status).toBe(400);
    expect(response.headers.get("Content-Security-Policy")).not.toContain("unregistered.example");
  });

  it("escapes client metadata and emits one-time CSRF state with hardened headers", async () => {
    const clientId = await registerClient('<img src=x onerror="alert(1)">');
    const response = await workerFetch(await authorizationPath(clientId));
    const body = await response.text();

    expect(response.status).toBe(200);
    expect(body).toContain("&lt;img src=x onerror=&quot;alert(1)&quot;&gt;");
    expect(body).not.toContain('<img src=x onerror="alert(1)">');
    expect(hiddenValue(body, "flow_id")).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(hiddenValue(body, "csrf_token")).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(cookieValue(response, "__Host-mcp_consent")).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(response.headers.get("Content-Security-Policy")).toContain("default-src 'none'");
    expect(response.headers.get("Content-Security-Policy")).toContain("form-action 'self'");
    expect(response.headers.get("Content-Security-Policy")).toContain(
      "form-action 'self' https://github.com https://client.example;",
    );
    expect(response.headers.get("Content-Security-Policy")).not.toContain("unsafe-inline");
    expect(response.headers.get("X-Frame-Options")).toBe("DENY");
    expect(response.headers.get("X-Content-Type-Options")).toBe("nosniff");
    expect(response.headers.get("Referrer-Policy")).toBe("no-referrer");
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(response.headers.get("Set-Cookie")).toContain("HttpOnly; Secure; SameSite=Lax; Path=/");
  });

  it("returns a standards-based error redirect for explicit denial", async () => {
    const consent = await beginConsent("Denied client");
    const response = await submitConsent(consent, "deny");
    const location = new URL(requiredHeader(response, "Location"));

    expect(response.status).toBe(302);
    expect(location.origin + location.pathname).toBe(CLIENT_REDIRECT);
    expect(location.searchParams.get("error")).toBe("access_denied");
    expect(location.searchParams.get("state")).toBe("client-state");
    expect(location.searchParams.get("iss")).toBe(ORIGIN);
  });
});

describe("GitHub identity and MCP", () => {
  it("rejects a failed GitHub token exchange", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
        new Request(input, init);
        return Response.json({ error: "incorrect_client_credentials" });
      }),
    );

    const authorization = await authorizeThroughGitHub("Rejected credentials client");

    expect(authorization.searchParams.get("error")).toBe("temporarily_unavailable");
  });

  it("accepts GitHub user 18376481 and returns the exact hello tool result through authenticated /mcp", async () => {
    mockGitHubUser(18_376_481, "chiubaca", "Alex Chiu");
    const authorization = await authorizeThroughGitHub("Allowed client");

    expect(authorization.searchParams.get("error")).toBeNull();
    expect(authorization.searchParams.get("state")).toBe("client-state");
    expect(authorization.searchParams.get("iss")).toBe(ORIGIN);

    const tokenResponse = await exchangeAuthorizationCode(authorization);
    expect(tokenResponse.status).toBe(200);
    const tokenPayload = await tokenResponse.json<Record<string, unknown>>();
    expect(tokenPayload.token_type).toBe("bearer");
    expect(tokenPayload.scope).toBe("mcp:tools");
    expect(tokenPayload.resource).toBe(RESOURCE);
    expect(typeof tokenPayload.access_token).toBe("string");

    const accessToken = tokenPayload.access_token as string;
    const token = await (env as RuntimeEnv).OAUTH_PROVIDER.unwrapToken<{
      githubId: number;
      githubLogin: string;
      githubName?: string;
    }>(accessToken);
    expect(token?.grant.props).toEqual({
      githubId: 18_376_481,
      githubLogin: "chiubaca",
      githubName: "Alex Chiu",
    });
    expect(token?.grant.props).not.toHaveProperty("accessToken");
    expect(token?.grant.props).not.toHaveProperty("githubAccessToken");

    const mcpResponse = await workerFetch("/mcp", {
      method: "POST",
      headers: {
        Accept: "application/json, text/event-stream",
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        Host: "mcp.chiubaca.com",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 7,
        method: "tools/call",
        params: { name: "hello", arguments: {} },
      }),
    });
    expect(mcpResponse.status, await mcpResponse.clone().text()).toBe(200);
    expect(await mcpJson(mcpResponse)).toMatchObject({
      jsonrpc: "2.0",
      id: 7,
      result: {
        content: [{ type: "text", text: "Hello, World!" }],
      },
    });
  });

  it("denies every other GitHub numeric user ID", async () => {
    mockGitHubUser(99_999_999, "not-chiubaca", "Another User");
    const authorization = await authorizeThroughGitHub("Denied identity client");

    expect(authorization.origin + authorization.pathname).toBe(CLIENT_REDIRECT);
    expect(authorization.searchParams.get("error")).toBe("access_denied");
    expect(authorization.searchParams.get("error_description")).toBe(
      "This GitHub account is not permitted.",
    );
    expect(authorization.searchParams.get("state")).toBe("client-state");
  });

  it("returns an OAuth error to the validated client when GitHub login is denied", async () => {
    const consent = await beginConsent("Upstream denial client");
    const githubRedirect = await submitConsent(consent, "approve");
    const githubLocation = new URL(requiredHeader(githubRedirect, "Location"));
    const state = requiredSearchParam(githubLocation, "state");
    const githubCookie = cookieValue(githubRedirect, "__Host-mcp_github");

    const callback = await workerFetch(
      `/callback?error=access_denied&state=${encodeURIComponent(state)}`,
      {
        headers: { Cookie: `__Host-mcp_github=${githubCookie}` },
      },
    );
    const authorization = new URL(requiredHeader(callback, "Location"));

    expect(callback.status).toBe(302);
    expect(authorization.origin + authorization.pathname).toBe(CLIENT_REDIRECT);
    expect(authorization.searchParams.get("error")).toBe("access_denied");
    expect(authorization.searchParams.get("state")).toBe("client-state");
    expect(authorization.searchParams.get("iss")).toBe(ORIGIN);
  });

  it("binds GitHub state to its browser and consumes it exactly once", async () => {
    const githubFetch = mockGitHubUser(18_376_481, "chiubaca", "Alex Chiu");
    const consent = await beginConsent("State client");
    const githubRedirect = await submitConsent(consent, "approve");
    const githubLocation = new URL(requiredHeader(githubRedirect, "Location"));
    const state = requiredSearchParam(githubLocation, "state");
    const githubCookie = cookieValue(githubRedirect, "__Host-mcp_github");

    const wrongBrowserResponse = await workerFetch(
      `/callback?code=test-code&state=${encodeURIComponent(state)}`,
      {
        headers: { Cookie: `__Host-mcp_github=${"x".repeat(43)}` },
      },
    );
    expect(wrongBrowserResponse.status).toBe(400);
    expect(githubFetch).not.toHaveBeenCalled();

    const callbackPath = `/callback?code=test-code&state=${encodeURIComponent(state)}`;
    const validResponse = await workerFetch(callbackPath, {
      headers: { Cookie: `__Host-mcp_github=${githubCookie}` },
    });
    expect(validResponse.status).toBe(302);
    expect(githubFetch).toHaveBeenCalledTimes(2);

    const replayResponse = await workerFetch(callbackPath, {
      headers: { Cookie: `__Host-mcp_github=${githubCookie}` },
    });
    expect(replayResponse.status).toBe(400);
    expect(githubFetch).toHaveBeenCalledTimes(2);
  });
});

describe("fleeting note MCP tool", () => {
  it("requires authentication before attempting a GitHub write", async () => {
    const github = vi.fn();
    vi.stubGlobal("fetch", github);
    const response = await workerFetch("/mcp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "tools/call",
        params: { name: "add_fleeting_note", arguments: { content: "Do not save this" } },
      }),
    });
    expect(response.status).toBe(401);
    expect(github).not.toHaveBeenCalled();
  });

  it("advertises a write tool and passes the write secret through the authenticated handler", async () => {
    mockGitHubUser(18_376_481, "chiubaca", "Alex Chiu");
    const authorization = await authorizeThroughGitHub("Notes writer client");
    const tokenResponse = await exchangeAuthorizationCode(authorization);
    const { access_token } = await tokenResponse.json<{ access_token: string }>();
    const headers = {
      Accept: "application/json, text/event-stream",
      Authorization: `Bearer ${access_token}`,
      "Content-Type": "application/json",
      Host: "mcp.chiubaca.com",
    };

    const listResponse = await workerFetch("/mcp", {
      method: "POST",
      headers,
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/list" }),
    });
    const listed = await mcpJson(listResponse);
    expect(listed).toMatchObject({
      result: {
        tools: expect.arrayContaining([
          expect.objectContaining({
            name: "add_fleeting_note",
            annotations: {
              readOnlyHint: false,
              destructiveHint: false,
              idempotentHint: false,
              openWorldHint: true,
            },
          }),
        ]),
      },
    });

    const github = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const request = new Request(input, init);
      expect(request.headers.get("Authorization")).toBe("Bearer test-notes-token");
      expect(request.redirect).toBe("manual");
      if (request.method === "GET") return new Response(null, { status: 404 });
      expect(request.url).toBe(
        "https://api.github.com/repos/chiubaca/notes/contents/fleeting-notes/2026-10-18.md",
      );
      const body = await request.json<{ content: string; branch: string }>();
      expect(body.branch).toBe("main");
      expect(Buffer.from(body.content, "base64").toString("utf8")).toContain(
        "A thought saved through MCP",
      );
      return new Response(null, { status: 201 });
    });
    vi.stubGlobal("fetch", github);
    const response = await workerFetch("/mcp", {
      method: "POST",
      headers,
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 2,
        method: "tools/call",
        params: {
          name: "add_fleeting_note",
          arguments: { content: "A thought saved through MCP", date: "2026-10-18" },
        },
      }),
    });
    expect(response.status).toBe(200);
    expect(await mcpJson(response)).toMatchObject({
      result: {
        structuredContent: {
          action: "created",
          date: "2026-10-18",
          path: "fleeting-notes/2026-10-18.md",
        },
      },
    });
    expect(github).toHaveBeenCalledTimes(2);
  });
});

async function workerFetch(path: string, init?: RequestInit): Promise<Response> {
  return exports.default.fetch(`${ORIGIN}${path}`, { ...init, redirect: "manual" });
}

async function registerClient(clientName: string, redirectUri = CLIENT_REDIRECT): Promise<string> {
  const response = await workerFetch("/oauth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_name: clientName,
      client_uri: "https://client.example/",
      redirect_uris: [redirectUri],
      grant_types: ["authorization_code", "refresh_token"],
      response_types: ["code"],
      token_endpoint_auth_method: "none",
    }),
  });
  expect(response.status).toBe(201);
  const registration = await response.json<Record<string, unknown>>();
  expect(typeof registration.client_id).toBe("string");
  return registration.client_id as string;
}

async function authorizationPath(clientId: string, redirectUri = CLIENT_REDIRECT): Promise<string> {
  const challengeBytes = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(CLIENT_CODE_VERIFIER),
  );
  const challenge = base64Url(new Uint8Array(challengeBytes));
  const url = new URL("/authorize", ORIGIN);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("scope", "mcp:tools");
  url.searchParams.set("state", "client-state");
  url.searchParams.set("code_challenge", challenge);
  url.searchParams.set("code_challenge_method", "S256");
  url.searchParams.set("resource", RESOURCE);
  return `${url.pathname}${url.search}`;
}

type Consent = {
  clientId: string;
  flowId: string;
  csrf: string;
  cookie: string;
};

async function beginConsent(clientName: string): Promise<Consent> {
  const clientId = await registerClient(clientName);
  const response = await workerFetch(await authorizationPath(clientId));
  expect(response.status).toBe(200);
  const body = await response.text();
  return {
    clientId,
    flowId: hiddenValue(body, "flow_id"),
    csrf: hiddenValue(body, "csrf_token"),
    cookie: cookieValue(response, "__Host-mcp_consent"),
  };
}

async function submitConsent(consent: Consent, decision: "approve" | "deny"): Promise<Response> {
  return workerFetch("/authorize", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Cookie: `__Host-mcp_consent=${consent.cookie}`,
    },
    body: new URLSearchParams({
      flow_id: consent.flowId,
      csrf_token: consent.csrf,
      decision,
    }),
  });
}

async function authorizeThroughGitHub(clientName: string): Promise<URL> {
  const consent = await beginConsent(clientName);
  const githubRedirect = await submitConsent(consent, "approve");
  expect(githubRedirect.status).toBe(302);
  const githubLocation = new URL(requiredHeader(githubRedirect, "Location"));
  expect(githubLocation.origin).toBe("https://github.com");
  expect(githubLocation.searchParams.get("code_challenge_method")).toBe("S256");

  const state = requiredSearchParam(githubLocation, "state");
  const githubCookie = cookieValue(githubRedirect, "__Host-mcp_github");
  const callback = await workerFetch(
    `/callback?code=test-code&state=${encodeURIComponent(state)}`,
    {
      headers: { Cookie: `__Host-mcp_github=${githubCookie}` },
    },
  );
  expect(callback.status).toBe(302);
  return new URL(requiredHeader(callback, "Location"));
}

async function exchangeAuthorizationCode(authorization: URL): Promise<Response> {
  const code = requiredSearchParam(authorization, "code");
  const clientId = await latestRegisteredClientId();
  return workerFetch("/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      client_id: clientId,
      redirect_uri: CLIENT_REDIRECT,
      code_verifier: CLIENT_CODE_VERIFIER,
      resource: RESOURCE,
    }),
  });
}

async function latestRegisteredClientId(): Promise<string> {
  const clients = await (env as RuntimeEnv).OAUTH_PROVIDER.listClients({ limit: 10 });
  expect(clients.items).toHaveLength(1);
  return clients.items[0].clientId;
}

function mockGitHubUser(id: number, login: string, name: string) {
  const githubFetch = vi.fn(
    async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
      // Exercise workerd's request validation before mocking the upstream response.
      new Request(input, init);
      expect(init?.redirect).toBe("manual");
      const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
      if (url === "https://github.com/login/oauth/access_token") {
        expect(init?.method).toBe("POST");
        expect(init?.body instanceof URLSearchParams && init.body.has("code_verifier")).toBe(true);
        return Response.json({ access_token: "upstream-test-token", token_type: "bearer" });
      }
      if (url === "https://api.github.com/user") {
        expect(new Headers(init?.headers).get("Authorization")).toBe("Bearer upstream-test-token");
        return Response.json({ id, login, name });
      }
      throw new Error(`Unexpected outbound request to ${url}`);
    },
  );
  vi.stubGlobal("fetch", githubFetch);
  return githubFetch;
}

async function mcpJson(response: Response): Promise<Record<string, unknown>> {
  const body = await response.text();
  if (response.headers.get("Content-Type")?.includes("text/event-stream")) {
    const data = body
      .split("\n")
      .find((line) => line.startsWith("data: "))
      ?.slice(6);
    if (!data) throw new Error("MCP SSE response contained no data event");
    return JSON.parse(data) as Record<string, unknown>;
  }
  return JSON.parse(body) as Record<string, unknown>;
}

function hiddenValue(body: string, name: string): string {
  const match = body.match(new RegExp(`name="${name}" value="([^"]+)"`));
  if (!match) throw new Error(`Missing ${name} input`);
  return match[1];
}

function cookieValue(response: Response, name: string): string {
  const cookie = response.headers.get("Set-Cookie") ?? "";
  const match = cookie.match(new RegExp(`(?:^|,\\s*)${name}=([^;]+)`));
  if (!match) throw new Error(`Missing ${name} cookie`);
  return match[1];
}

function requiredHeader(response: Response, name: string): string {
  const value = response.headers.get(name);
  if (!value) throw new Error(`Missing ${name} header`);
  return value;
}

function requiredSearchParam(url: URL, name: string): string {
  const value = url.searchParams.get(name);
  if (!value) throw new Error(`Missing ${name} query parameter`);
  return value;
}

function base64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
}
