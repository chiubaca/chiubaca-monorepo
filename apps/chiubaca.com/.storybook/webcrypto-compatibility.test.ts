import { readFileSync } from "node:fs";
import { createContext, runInContext } from "node:vm";
import { describe, expect, it } from "vite-plus/test";

const source = readFileSync(new URL("./webcrypto-compatibility.js", import.meta.url), "utf8");

function bootstrap(crypto?: object) {
  const context = createContext({ crypto });
  runInContext(source, context);
  return context;
}

describe("Storybook on an HTTP tailnet origin", () => {
  it("provides the UUID API used by Astro when only getRandomValues is available", () => {
    const crypto = {
      getRandomValues(bytes: Uint8Array) {
        expect(this).toBe(crypto);
        expect(bytes.length).toBe(16);
        for (let i = 0; i < bytes.length; i++) bytes[i] = i;
        return bytes;
      },
    };
    const context = bootstrap(crypto);
    expect(runInContext("crypto.randomUUID()", context)).toBe(
      "00010203-0405-4607-8809-0a0b0c0d0e0f",
    );
  });

  it("sets the UUID version and variant bits even when all random bits are set", () => {
    const context = bootstrap({ getRandomValues: (bytes: Uint8Array) => bytes.fill(255) });
    expect(runInContext("crypto.randomUUID()", context)).toBe(
      "ffffffff-ffff-4fff-bfff-ffffffffffff",
    );
  });

  it("gets fresh cryptographic bytes on every call and installs only once", () => {
    let calls = 0;
    const context = bootstrap({ getRandomValues: (bytes: Uint8Array) => bytes.fill(calls++) });
    const first = runInContext("crypto.randomUUID()", context);
    const second = runInContext("crypto.randomUUID()", context);
    expect(calls).toBe(2);
    expect(first).not.toBe(second);
    const installed = runInContext("crypto.randomUUID", context);
    runInContext(source, context);
    expect(runInContext("crypto.randomUUID", context)).toBe(installed);
  });

  it("preserves the browser's native implementation", () => {
    const native = () => "native-uuid";
    const context = bootstrap({ randomUUID: native });
    expect(runInContext("crypto.randomUUID", context)).toBe(native);
  });

  it("does not invent a non-cryptographic fallback when Web Crypto is unavailable", () => {
    for (const crypto of [undefined, {}]) {
      const context = bootstrap(crypto);
      expect(runInContext("typeof crypto?.randomUUID", context)).toBe("undefined");
    }
    expect(source).not.toContain("Math.random");
  });
});
