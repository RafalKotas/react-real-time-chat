export interface ApiUser {
  id: string;
  email: string;
  username: string;
  avatar?: string;
  blocked: string[];
  createdAt: string; // ISO
  updatedAt: string;
}

export interface ApiAuthResponse {
  token: string;
  user: ApiUser;
}

export interface ApiMessage {
  id: string;
  chatId: string;
  sender: string; // userId
  text: string;
  img?: string;
  createdAt: string;
}

export function getMessageImageUrl(msg: ApiMessage | Record<string, unknown>): string | undefined {
  const m = msg as Record<string, unknown>;
  const url = m.img ?? m.imageUrl ?? m.image;
  return typeof url === "string" && url.length > 0 ? url : undefined;
}

export interface ApiChatListItem {
  chatId: string;
  receiverId: string;
  receiver?: ApiUser;
  lastMessageId: string;
  lastMessage?: ApiMessage;
  updatedAt: number;
  unreadCount?: number;
}

export interface ApiChatWithMessages {
  id: string;
  messages: ApiMessage[];
}
