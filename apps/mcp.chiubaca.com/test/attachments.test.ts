import { Buffer } from "node:buffer";
import { afterEach, describe, expect, it, vi } from "vite-plus/test";

import { addAttachment } from "../src/attachments";

const secrets = { NOTES_GITHUB_TOKEN: "test-notes-token" };
const apiBase = "https://api.github.com/repos/chiubaca/notes/contents";

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

function mockGitHub(...responses: Array<Response | Error>) {
  const requests: Request[] = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const request = new Request(input, init);
      requests.push(request);
      if (request.url.includes("api.github.com")) {
        expect(request.headers.get("Authorization")).toBe("Bearer test-notes-token");
        expect(request.redirect).toBe("manual");
      }
      const response = responses.shift();
      if (response instanceof Error) throw response;
      if (!response) throw new Error("Unexpected fetch request");
      return response;
    }),
  );
  return requests;
}

async function written(request: Request) {
  const body = await request.json<{
    content: string;
    branch: string;
    message: string;
  }>();
  return { ...body, bytes: Buffer.from(body.content, "base64") };
}

function existingFile(sha = "a".repeat(40)) {
  return Response.json({
    type: "file",
    encoding: "base64",
    sha,
    size: 4,
    content: Buffer.from("data").toString("base64"),
  });
}

describe("adding attachments", () => {
  it("fails clearly before any network call when the write secret is missing", async () => {
    const send = vi.fn();
    vi.stubGlobal("fetch", send);
    await expect(addAttachment({}, { filename: "pic.png", data: "aGVsbG8=" })).rejects.toThrow(
      "NOTES_GITHUB_TOKEN",
    );
    expect(send).not.toHaveBeenCalled();
  });

  it("creates a new attachment and returns markdown reference", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-10-18T12:34:56Z"));

    const data = Buffer.from("fake-image-bytes");
    const requests = mockGitHub(
      new Response(null, { status: 404 }),
      new Response(null, { status: 201 }),
    );

    const result = await addAttachment(secrets, {
      filename: "screenshot.png",
      data: data.toString("base64"),
      alt: "my screenshot",
    });

    expect(result).toEqual({
      filename: "screenshot.png",
      path: "attachments/screenshot.png",
      url: "https://github.com/chiubaca/notes/blob/main/attachments/screenshot.png",
      mimeType: "image/png",
      markdown: "![my screenshot](attachments/screenshot.png)",
    });

    expect(requests[0].url).toBe(`${apiBase}/attachments/screenshot.png?ref=main`);
    expect(requests[0].method).toBe("GET");
    expect(requests[1].method).toBe("PUT");
    expect(requests[1].url).toBe(`${apiBase}/attachments/screenshot.png`);

    const body = await written(requests[1]);
    expect(body.branch).toBe("main");
    expect(body.message).toBe("Add attachment: screenshot.png");
    expect(body.bytes).toEqual(data);
  });

  it("renames on collision using a UTC timestamp", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-10-18T12:34:56Z"));

    const requests = mockGitHub(existingFile(), new Response(null, { status: 201 }));

    const result = await addAttachment(secrets, {
      filename: "screenshot.png",
      data: Buffer.from("x").toString("base64"),
    });

    expect(result.filename).toBe("screenshot-2026-10-18-12-34-56.png");
    expect(result.path).toBe(`attachments/${result.filename}`);
    expect(requests[1].url).toBe(`${apiBase}/attachments/${result.filename}`);
  });

  it("sanitizes unsafe characters in filenames", async () => {
    mockGitHub(new Response(null, { status: 404 }), new Response(null, { status: 201 }));

    const result = await addAttachment(secrets, {
      filename: "my screenshot (1).png",
      data: Buffer.from("x").toString("base64"),
    });

    expect(result.filename).toBe("my-screenshot-1.png");
  });

  it.each(["", "  ", "x".repeat(256)])(
    "rejects invalid filenames without network access: %s",
    async (filename) => {
      const send = vi.fn();
      vi.stubGlobal("fetch", send);
      await expect(addAttachment(secrets, { filename, data: "aGVsbG8=" })).rejects.toThrow();
      expect(send).not.toHaveBeenCalled();
    },
  );

  it.each(["file.exe", "document.pdf", "script.js", "no-extension"])(
    "rejects unsupported extensions: %s",
    async (filename) => {
      const send = vi.fn();
      vi.stubGlobal("fetch", send);
      await expect(addAttachment(secrets, { filename, data: "aGVsbG8=" })).rejects.toThrow(
        "Unsupported file extension",
      );
      expect(send).not.toHaveBeenCalled();
    },
  );

  it("rejects invalid base64", async () => {
    const send = vi.fn();
    vi.stubGlobal("fetch", send);
    await expect(
      addAttachment(secrets, { filename: "pic.png", data: "not-base64!!!" }),
    ).rejects.toThrow("not valid");
    expect(send).not.toHaveBeenCalled();
  });

  it("creates an attachment from a URL", async () => {
    const imageBytes = Buffer.from("fake-image-bytes");
    const requests = mockGitHub(
      new Response(imageBytes, {
        status: 200,
        headers: { "Content-Type": "image/jpeg" },
      }),
      new Response(null, { status: 404 }),
      new Response(null, { status: 201 }),
    );

    const result = await addAttachment(secrets, {
      filename: "from-url.jpg",
      url: "https://example.com/image.jpg",
    });

    expect(result.filename).toBe("from-url.jpg");
    expect(result.path).toBe("attachments/from-url.jpg");
    expect(result.markdown).toBe("![from-url.jpg](attachments/from-url.jpg)");

    expect(requests[0].url).toBe("https://example.com/image.jpg");
    expect(requests[0].redirect).toBe("follow");
    expect(requests[1].url).toBe(`${apiBase}/attachments/from-url.jpg?ref=main`);
    expect(requests[2].url).toBe(`${apiBase}/attachments/from-url.jpg`);

    const body = await written(requests[2]);
    expect(body.bytes).toEqual(imageBytes);
  });

  it("rejects a URL that does not return an image", async () => {
    const requests = mockGitHub(new Response("not found", { status: 404 }));
    await expect(
      addAttachment(secrets, {
        filename: "from-url.jpg",
        url: "https://example.com/image.jpg",
      }),
    ).rejects.toThrow("download the image");
    expect(requests).toHaveLength(1);
  });

  it("rejects a URL that returns a non-image content type", async () => {
    const requests = mockGitHub(
      new Response("<html></html>", {
        status: 200,
        headers: { "Content-Type": "text/html" },
      }),
    );
    await expect(
      addAttachment(secrets, {
        filename: "from-url.jpg",
        url: "https://example.com/image.jpg",
      }),
    ).rejects.toThrow("did not return an image");
    expect(requests).toHaveLength(1);
  });

  it("rejects invalid URLs", async () => {
    const send = vi.fn();
    vi.stubGlobal("fetch", send);
    await expect(
      addAttachment(secrets, {
        filename: "from-url.jpg",
        url: "not-a-url",
      }),
    ).rejects.toThrow();
    expect(send).not.toHaveBeenCalled();
  });

  it.each([{ data: "aGVsbG8=", url: "https://example.com/image.jpg" }, {}])(
    "rejects missing or conflicting data/url inputs: %o",
    async (input) => {
      const send = vi.fn();
      vi.stubGlobal("fetch", send);
      await expect(addAttachment(secrets, { filename: "pic.png", ...input })).rejects.toThrow(
        "exactly one of data",
      );
      expect(send).not.toHaveBeenCalled();
    },
  );

  it("rejects oversized attachments", async () => {
    const send = vi.fn();
    vi.stubGlobal("fetch", send);
    const oversized = Buffer.alloc(10 * 1024 * 1024 + 1);
    await expect(
      addAttachment(secrets, {
        filename: "huge.png",
        data: oversized.toString("base64"),
      }),
    ).rejects.toThrow("exceeds the 10 MiB limit");
    expect(send).not.toHaveBeenCalled();
  });

  it.each([401, 403, 429, 500])(
    "does not treat GitHub read errors as a missing file: %s",
    async (status: number) => {
      const requests = mockGitHub(new Response("error", { status }));
      await expect(
        addAttachment(secrets, { filename: "pic.png", data: "aGVsbG8=" }),
      ).rejects.toThrow("Could not check for existing attachment");
      expect(requests).toHaveLength(1);
    },
  );

  it("reports GitHub write failures clearly", async () => {
    const requests = mockGitHub(
      new Response(null, { status: 404 }),
      new Response(null, { status: 422 }),
    );
    await expect(addAttachment(secrets, { filename: "pic.png", data: "aGVsbG8=" })).rejects.toThrow(
      "could not save the attachment",
    );
    expect(requests).toHaveLength(2);
  });
});
