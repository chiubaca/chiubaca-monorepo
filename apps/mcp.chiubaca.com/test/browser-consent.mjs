import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { createServer } from "node:http";
import { promisify } from "node:util";

const exec = promisify(execFile);
const origin = new URL(process.env.MCP_TEST_ORIGIN ?? "https://mcp.chiubaca.com").origin;
let callbackRequests = 0;
const callbackServer = createServer((request, response) => {
  const url = new URL(request.url, "http://127.0.0.1");
  if (
    url.pathname !== "/callback" ||
    url.searchParams.get("state") !== "browser-regression" ||
    url.searchParams.get("error") !== "access_denied"
  ) {
    response.writeHead(400).end("Invalid test callback");
    return;
  }
  callbackRequests++;
  response
    .writeHead(200, { "Content-Type": "text/html" })
    .end("<!doctype html><title>Consent callback</title><p>Callback reached</p>");
});
await new Promise((resolve, reject) => {
  callbackServer.once("error", reject);
  callbackServer.listen(0, "127.0.0.1", resolve);
});
const callback = `http://127.0.0.1:${callbackServer.address().port}/callback`;
const session = `mcp-consent-${crypto.randomUUID()}`;
const browser = async (...args) =>
  (await exec("agent-browser", ["--session", session, ...args], { timeout: 30_000 })).stdout;

try {
  const registration = await fetch(`${origin}/oauth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_name: "Browser consent regression",
      redirect_uris: [callback],
      token_endpoint_auth_method: "none",
      grant_types: ["authorization_code"],
      response_types: ["code"],
    }),
  });
  assert.equal(registration.status, 201);
  const { client_id } = await registration.json();
  const challenge = Buffer.from(
    await crypto.subtle.digest("SHA-256", new TextEncoder().encode("v".repeat(43))),
  ).toString("base64url");
  const query = new URLSearchParams({
    response_type: "code",
    client_id,
    redirect_uri: callback,
    scope: "mcp:tools",
    state: "browser-regression",
    code_challenge: challenge,
    code_challenge_method: "S256",
    resource: `${origin}/mcp`,
  });

  await browser("open", "about:blank");
  // Denial exercises the real browser redirect and CSP without GitHub or granting access.
  await browser("open", `${origin}/authorize?${query}`);
  await browser("find", "role", "button", "click", "--name", "Deny", "--exact");
  const result = JSON.parse(
    await browser(
      "eval",
      `({ reached: document.body.innerText.includes('Callback reached'), consentVisible: document.body.innerText.includes('GRANT ACCESS?') })`,
    ),
  );
  const callbackUrl = new URL((await browser("get", "url")).trim());

  if (result.consentVisible) {
    await browser("find", "role", "button", "click", "--name", "Deny", "--exact");
    const secondClickRejected = JSON.parse(
      await browser(
        "eval",
        "document.body.innerText.includes('Invalid or expired authorization request')",
      ),
    );
    console.error(JSON.stringify({ firstClickLeftFormVisible: true, secondClickRejected }));
  }
  assert.equal(
    callbackUrl.origin,
    new URL(callback).origin,
    "The first click must reach the registered client callback, not leave a consumed form visible",
  );
  assert.equal(result.reached, true);
  assert.equal(callbackRequests, 1);
  console.log(
    "PASS: Chromium follows the first consent submission to the registered client callback, preserving OAuth state.",
  );
} finally {
  await browser("close");
  await new Promise((resolve) => callbackServer.close(resolve));
}
