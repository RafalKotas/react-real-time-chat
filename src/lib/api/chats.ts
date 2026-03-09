import { api } from "./client";
import type { ApiChatListItem, ApiMessage } from "./types";

export async function getMyChats(): Promise<ApiChatListItem[]> {
  const list = await api.get<ApiChatListItem[]>("/api/chats");
  return Array.isArray(list) ? list : [];
}

export async function createChat(otherUserId: string): Promise<{ chatId: string }> {
  return api.post<{ chatId: string }>("/api/chats", { otherUserId });
}

export async function getChatMessages(chatId: string): Promise<ApiMessage[]> {
  if (!chatId?.trim()) return [];
  const data = await api.get<{ messages: ApiMessage[] } | ApiMessage[]>(
    `/api/chats/${chatId.trim()}/messages`
  );
  if (Array.isArray(data)) return data;
  return data?.messages ?? [];
}

export async function sendMessage(
  chatId: string,
  text: string,
  img?: string
): Promise<ApiMessage> {
  if (!chatId?.trim()) throw new Error("Chat ID is required");
  return api.post<ApiMessage>(`/api/chats/${chatId.trim()}/messages`, { text, img });
}

export async function markChatSeen(chatId: string, lastMessageId: string): Promise<void> {
  if (!chatId?.trim()) return;
  await api.patch(`/api/chats/${chatId.trim()}/seen`, { lastMessageId });
}
