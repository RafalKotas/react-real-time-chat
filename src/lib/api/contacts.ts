import { api } from "./client";
import type { ApiContact, ApiContactStatus } from "./types";

export async function getContactStatus(otherUserId: string): Promise<ApiContactStatus> {
  const data = await api.get<ApiContactStatus>("/api/contacts/status", {
    userId: otherUserId,
  });
  return data;
}

export async function getContacts(state?: "accepted" | "pending_received" | "pending_sent"): Promise<ApiContact[]> {
  const params = state ? { state } : undefined;
  const list = await api.get<ApiContact[]>("/api/contacts", params);
  return Array.isArray(list) ? list : [];
}

export async function sendContactRequest(receiverUserId: string): Promise<{ id: string }> {
  const res = await api.post<{ id: string }>("/api/contacts/request", { receiverUserId });
  return res;
}

export async function acceptContact(contactId: string): Promise<ApiContact> {
  return api.post<ApiContact>(`/api/contacts/${contactId}/accept`);
}

export async function rejectContact(contactId: string): Promise<void> {
  await api.post(`/api/contacts/${contactId}/reject`);
}
