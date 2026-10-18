function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

export async function readJsonObject(
  response: Response,
  maxBytes: number,
): Promise<Record<string, unknown>> {
  if (!response.body) throw new Error("Upstream response had no body");
  const declaredLength = Number(response.headers.get("Content-Length") ?? "0");
  if (!Number.isFinite(declaredLength) || declaredLength > maxBytes) {
    throw new Error("Upstream response was too large");
  }
  const bytes = await readLimitedBytes(response.body, maxBytes);
  const parsed: unknown = JSON.parse(
    new TextDecoder("utf-8", { fatal: true, ignoreBOM: false }).decode(bytes),
  );
  if (!isRecord(parsed)) {
    throw new Error("Upstream response was invalid");
  }
  return parsed;
}

export async function readLimitedBytes(
  body: ReadableStream<Uint8Array> | null,
  maxBytes: number,
): Promise<Uint8Array> {
  if (!body) throw new Error("Request body was missing");
  const reader = body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    totalBytes += value.byteLength;
    if (totalBytes > maxBytes) {
      await reader.cancel();
      throw new Error("Upstream response was too large");
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return bytes;
}
