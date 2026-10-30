const endpoint = "https://agent.creciendo.com.co/creciendo/v1/account/deletion";
const noStore = { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" };

export async function proxyAccountDeletion(request: Request, fetcher: typeof fetch = fetch): Promise<Response> {
  const failure = (status: number) => Response.json({ ok: false }, { status, headers: noStore });
  // No cookies, privileged keys or client-selected deletion targets are forwarded.
  if (request.headers.get("origin") !== new URL(request.url).origin) return failure(403);
  const authorization = request.headers.get("authorization") ?? "";
  const key = request.headers.get("idempotency-key") ?? "";
  if (!/^Bearer [A-Za-z0-9._-]{1,8192}$/.test(authorization)) return failure(401);
  if (!/^[A-Za-z0-9._:-]{1,128}$/.test(key) || request.headers.get("content-type")?.split(";")[0].trim() !== "application/json") return failure(400);
  try {
    // Bound streamed input too; Content-Length alone is not trustworthy.
    const reader = request.body?.getReader();
    if (!reader) return failure(400);
    const chunks: Uint8Array[] = [];
    let size = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 256) { await reader.cancel(); return failure(400); }
      chunks.push(value);
    }
    const bytes = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
    const body = JSON.parse(new TextDecoder().decode(bytes));
    if (!body || Object.keys(body).sort().join(",") !== "confirmed,version" || body.version !== "account-deletion.v1" || body.confirmed !== true) return failure(400);
    const upstream = await fetcher(endpoint, {
      method: "POST", headers: { Authorization: authorization, "Idempotency-Key": key, "Content-Type": "application/json" },
      body: JSON.stringify({ version: "account-deletion.v1", confirmed: true }),
      credentials: "omit", cache: "no-store", redirect: "error", referrerPolicy: "no-referrer",
      signal: AbortSignal.any([request.signal, AbortSignal.timeout(20_000)]),
    });
    if (upstream.status === 401) return failure(401);
    if (upstream.status !== 202) return failure(503);
    const receipt = await upstream.json();
    if (!receipt || Object.keys(receipt).sort().join(",") !== "accessRevoked,requestId,status,version" ||
      receipt.version !== "account-deletion.v1" || receipt.status !== "queued" || receipt.accessRevoked !== true ||
      typeof receipt.requestId !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(receipt.requestId)) return failure(503);
    return Response.json(receipt, { status: 202, headers: noStore });
  } catch { return failure(503); }
}
