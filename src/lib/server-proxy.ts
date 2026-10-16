const backend = () => {
  const runtime = globalThis as typeof globalThis & { process?: { env?: Record<string, string | undefined> } };
  const value = runtime.process?.env?.GAMECLUB_BACKEND_URL;
  if (!value) throw new Error("GAMECLUB_BACKEND_URL is required by the server proxy");
  const url = /^[a-z][a-z\d+.-]*:\/\//i.test(value) ? value : `http://${value}`;
  return url.replace(/\/$/, "");
};

export async function proxyToBackend(request: Request): Promise<Response> {
  const incoming = new URL(request.url);
  const target = `${backend()}${incoming.pathname}${incoming.search}`;
  const headers = new Headers(request.headers);
  headers.delete("host");
  headers.delete("connection");
  headers.delete("content-length");

  const method = request.method.toUpperCase();
  const response = await fetch(target, {
    method,
    headers,
    body: method === "GET" || method === "HEAD" ? undefined : await request.arrayBuffer(),
    redirect: "manual",
  });
  const responseHeaders = new Headers();
  for (const name of ["content-type", "cache-control", "etag", "last-modified", "content-disposition", "location"]) {
    const value = response.headers.get(name);
    if (value) responseHeaders.set(name, value);
  }
  const noBody = method === "HEAD" || response.status === 204 || response.status === 304;
  return new Response(noBody ? null : response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: responseHeaders,
  });
}
