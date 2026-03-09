import { api } from "./client";
import type { ApiUser } from "./types";

export async function getMe(): Promise<ApiUser> {
  return api.get<ApiUser>("/api/users/me");
}

export async function getUser(id: string): Promise<ApiUser | null> {
  if (!id?.trim()) return null;
  try {
    return await api.get<ApiUser>(`/api/users/${id.trim()}`);
  } catch {
    return null;
  }
}

export async function searchByUsername(username: string): Promise<ApiUser[]> {
  const list = await api.get<ApiUser[]>("/api/users/search", { username });
  return Array.isArray(list) ? list : [];
}

export async function updateBlocked(userId: string, block: boolean): Promise<ApiUser> {
  return api.patch<ApiUser>("/api/users/me/blocked", { userId, block });
}
