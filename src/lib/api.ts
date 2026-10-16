/** Browser API base: empty = same origin (Vite proxy in dev). */
export function apiBase(): string {
  // SSR / build: hit backend directly. Browser dev: same-origin + Vite proxy.
  if (typeof window === "undefined") {
    const runtime = globalThis as typeof globalThis & {
      process?: { env?: Record<string, string | undefined> };
    };
    return runtime.process?.env?.GAMECLUB_BACKEND_URL ||
      import.meta.env.GAMECLUB_BACKEND_URL ||
      "http://127.0.0.1:8000";
  }
  // Browser requests are routed by public/backend-config.js, which can set
  // the API origin and adapt paths without changing page components.
  return "";
}

export type Article = {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  image: string;
  color: string;
  time: string;
  views: number;
  category: string;
  author: string;
  published_at?: string;
};

export type Group = {
  id: number;
  slug: string;
  name: string;
  description: string;
  member_count: number;
  topic_count: number;
  color: string;
  icon: string;
};

export type Discussion = {
  id: number;
  slug: string;
  title: string;
  body: string;
  group: string;
  group_id: number | null;
  user: string;
  reply_count: number;
  age: string;
  initial: string;
};

export type Member = {
  user_id: number;
  username: string;
  display_name: string;
  avatar_initial: string;
  role: string;
};

export type Channel = {
  id: number;
  group_id: number;
  name: string;
  slug: string;
  topic: string;
  position: number;
};

async function req<T>(path: string, init?: RequestInit & { token?: string }): Promise<T> {
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(init?.headers as Record<string, string>),
  };
  if (init?.body && !headers["Content-Type"]) headers["Content-Type"] = "application/json";
  if (init?.token) headers.Authorization = `Bearer ${init.token}`;

  const res = await fetch(`${apiBase()}${path}`, { ...init, headers });
  if (!res.ok) {
    let msg = `خطا ${res.status}`;
    try {
      const j = await res.json();
      msg = j.detail?.toString?.() || j.message || msg;
    } catch {
      /* ignore */
    }
    throw new Error(typeof msg === "string" ? msg : JSON.stringify(msg));
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export async function getArticles(page = 1): Promise<{ items: Article[]; total: number }> {
  const data = await req<{ items: Article[]; total: number }>(`/api/articles?page=${page}&page_size=20`);
  return data;
}

export async function getArticle(slug: string): Promise<Article> {
  return req(`/api/articles/${encodeURIComponent(slug)}`);
}

export async function getGroups(): Promise<Group[]> {
  return req("/api/groups");
}

export async function getDiscussions(): Promise<Discussion[]> {
  return req("/api/discussions");
}

export async function getGroup(slug: string): Promise<Group> {
  return req(`/api/groups/${encodeURIComponent(slug)}`);
}

export async function getMembers(groupId: number): Promise<Member[]> {
  return req(`/api/groups/${groupId}/members`);
}

export async function getChannels(groupId: number): Promise<Channel[]> {
  return req(`/api/groups/${groupId}/channels`);
}

export async function login(username: string, password: string): Promise<string> {
  const data = await req<{ access_token: string }>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
  return data.access_token;
}

export async function me(token: string) {
  return req<{ id: number; username: string; display_name: string; is_admin: boolean }>("/api/auth/me", {
    token,
  });
}

export async function subscribeNewsletter(email: string) {
  return req("/api/newsletter", { method: "POST", body: JSON.stringify({ email }) });
}
