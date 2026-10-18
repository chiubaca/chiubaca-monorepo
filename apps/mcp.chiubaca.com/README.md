# chiubaca MCP

Authenticated remote MCP Worker for `https://mcp.chiubaca.com/mcp`. It serves a stateless Streamable HTTP MCP server, retains stateless compatibility for legacy clients, and exposes `hello` and `add_fleeting_note` tools.

OAuth 2.1 is provided by `@cloudflare/workers-oauth-provider`, with CIMD preferred and dynamic client registration retained as a compatibility fallback. Interactive login uses GitHub and authorizes only the account with immutable GitHub user ID `18376481` (`chiubaca`).

## Configuration

Wrangler automatically provisions the `OAUTH_KV` namespace on the first deployment because the binding intentionally omits an `id`. Production non-secret configuration is in `wrangler.jsonc`.

Create `apps/mcp.chiubaca.com/.dev.vars` from `.dev.vars.example` with credentials for a GitHub OAuth App. Do not commit this file.

Required secrets:

- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`

Configure the GitHub OAuth App callbacks as follows:

- Local: `http://localhost:8788/callback`
- Production: `https://mcp.chiubaca.com/callback`

The local script deliberately overrides the MCP resource URL to `http://localhost:8788/mcp`. Production accepts only the configured `https://mcp.chiubaca.com` origin.

## Adding fleeting notes

`add_fleeting_note` commits directly to `chiubaca/notes` on `main`. It takes Markdown `content` (1–20,000 characters, not blank) and an optional `date` (`YYYY-MM-DD`, defaulting to today in UTC).

```json
{
  "content": "A useful thought to revisit later.",
  "date": "2026-10-18"
}
```

The tool creates `fleeting-notes/YYYY-MM-DD.md` with `publish_date` and the `fleeting` tag when absent. Otherwise it appends a `## HH:mm UTC` entry, preserving the existing bytes and frontmatter. It returns the file's GitHub URL and whether it created or appended the note. Notes become blog content through the existing sync/build pipeline; they are not private drafts.

Configure **`NOTES_GITHUB_TOKEN`** as an additional Cloudflare **Secret**. Use a fine-grained GitHub personal access token restricted to **`chiubaca/notes` only**, with **Contents: Read and write** and a short expiry. No repository write scope is added to the GitHub login flow, and its client secret is not a repository credential. For local development, put the token in the ignored `.dev.vars` file.

```sh
wrangler secret put NOTES_GITHUB_TOKEN
```

The tool remains visible without this secret but returns a configuration error before any GitHub request. It never accepts arbitrary paths or repositories, rejects notes over 128 KiB, and retries at most three times after explicit version conflicts. Ambiguous write failures are **not retried**: check the returned GitHub URL before resubmitting, because appending is not idempotent.

## OpenCode sign-in from a phone over Tailscale

The default OpenCode OAuth callback uses loopback on the machine running OpenCode. A phone cannot reach that listener through its own `127.0.0.1` address.

On the OpenCode host, forward a tailnet-only HTTPS endpoint to a fixed loopback callback port:

```sh
tailscale serve --bg --https=8443 http://127.0.0.1:19876
```

In the host's global `~/.config/opencode/opencode.jsonc`, configure the MCP server with the hostname reported by Tailscale Serve:

```jsonc
{
  "mcp": {
    "servers": {
      "chiubaca": {
        "type": "remote",
        "url": "https://mcp.chiubaca.com/mcp",
        "oauth": {
          "callback_port": 19876,
          "redirect_uri": "https://your-machine.your-tailnet.ts.net:8443/callback",
        },
      },
    },
  },
}
```

Keep Tailscale connected on the phone and host. Reload OpenCode's configuration and start a fresh sign-in from `/mcps`. A custom redirect URI uses dynamic client registration rather than OpenCode's loopback-only client metadata document. OAuth state and PKCE checks remain enabled. The GitHub OAuth App callback stays `https://mcp.chiubaca.com/callback`; no Worker changes or public Funnel are needed.

Serve persists across Tailscale restarts. To undo this setup, remove these two OAuth settings and disable only this relay:

```sh
tailscale serve --https=8443 off
```

## Commands

Run from this app directory:

```sh
vp run dev
vp run check
vp run test
vp run deploy:dry-run
```

With `agent-browser` installed, `vp run test:browser` checks the deployed consent page in Chromium. It registers a diagnostic client, denies consent, and verifies that the first submission reaches the callback with its OAuth state intact. It does not log in to GitHub or issue access tokens. Set `MCP_TEST_ORIGIN` to test a different instance.

After provisioning the production GitHub OAuth App, set secrets interactively without placing values on the command line:

```sh
wrangler secret put GITHUB_CLIENT_ID
wrangler secret put GITHUB_CLIENT_SECRET
```

Deploy only after the custom domain and GitHub OAuth App are ready:

```sh
vp run deploy
```
