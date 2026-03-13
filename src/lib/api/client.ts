const BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/+$/, "");

function getToken(): string | null {
  return localStorage.getItem("chat_token");
}

export function setToken(token: string): void {
  localStorage.setItem("chat_token", token);
}

export function clearToken(): void {
  localStorage.removeItem("chat_token");
}

export function hasToken(): boolean {
  return Boolean(getToken());
}

async function request<T>(
  path: string,
  options: RequestInit & { params?: Record<string, string> } = {}
): Promise<T> {
  const { params, ...init } = options;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = params
    ? `${BASE_URL}${normalizedPath}?${new URLSearchParams(params).toString()}`
    : `${BASE_URL}${normalizedPath}`;

  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init.headers as Record<string, string>),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  if (/ngrok-free\.(app|dev)/i.test(BASE_URL)) {
    headers["ngrok-skip-browser-warning"] = "true";
  }

  const res = await fetch(url, { ...init, headers });

  if (res.status === 401) {
    clearToken();
    throw new Error("Unauthorized");
  }

  if (!res.ok) {
    const text = await res.text();
    let message = text;
    try {
      const j = JSON.parse(text);
      if (j.message) message = j.message;
      else if (j.error) message = j.error;
    } catch {
      // use text as message
    }
    throw new Error(message || `HTTP ${res.status}`);
  }

  const contentType = res.headers.get("content-type");
  if (contentType?.includes("application/json")) {
    return res.json() as Promise<T>;
  }
  return undefined as T;
}

export const api = {
  get: <T>(path: string, params?: Record<string, string>) =>
    request<T>(path, { method: "GET", params }),

  post: <T>(path: string, body?: object) =>
    request<T>(path, { method: "POST", body: body ? JSON.stringify(body) : undefined }),

  patch: <T>(path: string, body?: object) =>
    request<T>(path, { method: "PATCH", body: body ? JSON.stringify(body) : undefined }),

  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};

export { getToken };
