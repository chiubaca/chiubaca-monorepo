import { Buffer } from "node:buffer";
import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test";

import { addFleetingNote } from "../src/fleeting-notes";

const secrets = { NOTES_GITHUB_TOKEN: "test-notes-token" };
const path = "fleeting-notes/2026-10-18.md";
const apiUrl = `https://api.github.com/repos/chiubaca/notes/contents/${path}`;
const original =
  "---\r\npublish_date: 2026-10-18\r\ntags: [personal, fleeting]\r\n---\r\n\r\nExisting thought with trailing spaces.  \r\n";

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date("2026-10-18T12:34:56Z"));
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

function existing(content = original, sha = "a".repeat(40)) {
  return Response.json({
    type: "file",
    encoding: "base64",
    sha,
    size: Buffer.byteLength(content),
    content: Buffer.from(content).toString("base64"),
  });
}

function mockGitHub(...responses: Array<Response | Error>) {
  const requests: Request[] = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const request = new Request(input, init);
      expect(request.url.split("?")[0]).toBe(apiUrl);
      expect(request.headers.get("Authorization")).toBe("Bearer test-notes-token");
      expect(request.redirect).toBe("manual");
      requests.push(request);
      const response = responses.shift();
      if (response instanceof Error) throw response;
      if (!response) throw new Error("Unexpected GitHub request");
      return response;
    }),
  );
  return requests;
}

async function written(request: Request) {
  const body = await request.json<{
    content: string;
    sha?: string;
    branch: string;
    message: string;
  }>();
  return { ...body, markdown: Buffer.from(body.content, "base64").toString("utf8") };
}

describe("adding fleeting notes", () => {
  it("fails clearly before any network call when the write secret is missing", async () => {
    const send = vi.fn();
    vi.stubGlobal("fetch", send);
    await expect(addFleetingNote({}, { content: "A thought" })).rejects.toThrow(
      "NOTES_GITHUB_TOKEN",
    );
    expect(send).not.toHaveBeenCalled();
  });

  it("creates today's note with valid frontmatter and a UTC entry, preserving Unicode", async () => {
    const requests = mockGitHub(
      new Response(null, { status: 404 }),
      new Response(null, { status: 201 }),
    );
    const result = await addFleetingNote(secrets, {
      content: "A thought about café, 日本語 and 🦊.",
    });
    expect(result).toEqual({
      action: "created",
      date: "2026-10-18",
      path,
      url: `https://github.com/chiubaca/notes/blob/main/${path}`,
    });
    expect(requests[0].url).toBe(`${apiUrl}?ref=main`);
    expect(requests[0].method).toBe("GET");
    expect(requests[1].method).toBe("PUT");
    const body = await written(requests[1]);
    expect(body.branch).toBe("main");
    expect(body.sha).toBeUndefined();
    expect(body.markdown).toBe(
      "---\ntags:\n  - fleeting\npublish_date: 2026-10-18\n---\n\n## 12:34 UTC\n\nA thought about café, 日本語 and 🦊.\n",
    );
  });

  it("appends without changing existing bytes or frontmatter and supplies the file SHA", async () => {
    const requests = mockGitHub(existing(), new Response(null, { status: 200 }));
    expect(
      await addFleetingNote(secrets, { content: "Another thought", date: "2026-10-18" }),
    ).toMatchObject({ action: "appended" });
    const body = await written(requests[1]);
    expect(body.sha).toBe("a".repeat(40));
    expect(body.markdown.startsWith(original)).toBe(true);
    expect(body.markdown).toContain("## 12:34 UTC\n\nAnother thought\n");
    expect(body.markdown.match(/publish_date:/g)).toHaveLength(1);
  });

  it("rereads after a conflict and preserves a concurrent edit", async () => {
    const updated = `${original}\nSomeone else's new entry\n`;
    const requests = mockGitHub(
      existing(),
      new Response(null, { status: 409 }),
      existing(updated, "b".repeat(40)),
      new Response(null, { status: 200 }),
    );
    await addFleetingNote(secrets, { content: "My entry" });
    const body = await written(requests[3]);
    expect(body.sha).toBe("b".repeat(40));
    expect(body.markdown.startsWith(updated)).toBe(true);
    expect(body.markdown.match(/My entry/g)).toHaveLength(1);
  });

  it("handles a race creating the daily file by rereading and appending", async () => {
    const requests = mockGitHub(
      new Response(null, { status: 404 }),
      new Response(null, { status: 422 }),
      existing(),
      new Response(null, { status: 200 }),
    );
    expect(await addFleetingNote(secrets, { content: "My entry" })).toMatchObject({
      action: "appended",
    });
    expect((await written(requests[3])).markdown.startsWith(original)).toBe(true);
  });

  it("bounds conflict retries", async () => {
    const requests = mockGitHub(
      existing(),
      new Response(null, { status: 409 }),
      existing(),
      new Response(null, { status: 409 }),
      existing(),
      new Response(null, { status: 409 }),
    );
    await expect(addFleetingNote(secrets, { content: "My entry" })).rejects.toThrow(
      "kept changing",
    );
    expect(requests).toHaveLength(6);
  });

  it.each(["", "  \n", "x".repeat(20_001)])(
    "rejects empty or oversized content without network access",
    async (content) => {
      const requests = mockGitHub();
      await expect(addFleetingNote(secrets, { content })).rejects.toThrow();
      expect(requests).toHaveLength(0);
    },
  );

  it.each(["../private", "2026-02-29", "2026-13-01", "2026-10-18/other"])(
    "rejects invalid dates and paths: %s",
    async (date) => {
      const requests = mockGitHub();
      await expect(addFleetingNote(secrets, { content: "My entry", date })).rejects.toThrow();
      expect(requests).toHaveLength(0);
    },
  );

  it.each([401, 403, 429, 500, 302])(
    "does not treat GitHub read errors as missing files: %s",
    async (status) => {
      const requests = mockGitHub(new Response("do not echo test-notes-token", { status }));
      await expect(addFleetingNote(secrets, { content: "My entry" })).rejects.toThrow();
      expect(requests).toHaveLength(1);
    },
  );

  it.each(["dir", "symlink", "submodule"])(
    "refuses to replace a non-file object: %s",
    async (type) => {
      const requests = mockGitHub(
        Response.json({ type, encoding: "base64", sha: "a".repeat(40), size: 0, content: "" }),
      );
      await expect(addFleetingNote(secrets, { content: "My entry" })).rejects.toThrow(
        "not modified",
      );
      expect(requests).toHaveLength(1);
    },
  );

  it("refuses oversized existing notes", async () => {
    const requests = mockGitHub(existing("x".repeat(128 * 1024 + 1)));
    await expect(addFleetingNote(secrets, { content: "My entry" })).rejects.toThrow();
    expect(requests).toHaveLength(1);
  });

  it("refuses invalid UTF-8 instead of corrupting the existing note", async () => {
    const requests = mockGitHub(
      Response.json({
        type: "file",
        encoding: "base64",
        sha: "a".repeat(40),
        size: 1,
        content: "/w==",
      }),
    );
    await expect(addFleetingNote(secrets, { content: "My entry" })).rejects.toThrow("not modified");
    expect(requests).toHaveLength(1);
  });

  it("does not retry an ambiguous write failure or expose upstream error details", async () => {
    const requests = mockGitHub(existing(), new Error("sensitive: test-notes-token"));
    await expect(addFleetingNote(secrets, { content: "My entry" })).rejects.toThrow(
      "Check the note before retrying",
    );
    expect(requests).toHaveLength(2);
  });

  it("bounds streamed GitHub responses even without a Content-Length header", async () => {
    const cancel = vi.fn();
    const body = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(new Uint8Array(256 * 1024 + 1));
      },
      cancel,
    });
    const requests = mockGitHub(new Response(body));
    await expect(addFleetingNote(secrets, { content: "My entry" })).rejects.toThrow("not modified");
    expect(requests).toHaveLength(1);
    expect(cancel).toHaveBeenCalled();
  });
});
