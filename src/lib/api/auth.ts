import { api, setToken, clearToken } from "./client";
import type { ApiAuthResponse, ApiUser } from "./types";

export async function login(email: string, password: string): Promise<ApiAuthResponse> {
  const res = await api.post<ApiAuthResponse>("/api/auth/login", { email, password });
  if (res.token) setToken(res.token);
  return res;
}

export async function register(params: {
  email: string;
  password: string;
  username: string;
  avatarUrl?: string;
}): Promise<ApiAuthResponse> {
  const res = await api.post<ApiAuthResponse>("/api/auth/register", params);
  if (res.token) setToken(res.token);
  return res;
}

export function logout(): void {
  clearToken();
}

export function mapApiUserToUserData(u: ApiUser) {
  return {
    id: u.id,
    username: u.username ?? "",
    email: u.email,
    avatar: u.avatar,
    blocked: u.blocked ?? [],
    createdAt: u.createdAt,
    updatedAt: u.updatedAt,
  };
}
