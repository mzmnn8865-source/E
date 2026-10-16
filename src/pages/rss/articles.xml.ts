import type { APIRoute } from "astro";
import { proxyToBackend } from "../../lib/server-proxy";

export const prerender = false;
export const GET: APIRoute = ({ request }) => proxyToBackend(request);
