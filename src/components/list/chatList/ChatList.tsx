import { useState, useEffect, useCallback } from "react";
import { faImage, faMinus, faPlus, faSearch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import "./chatList.css";

import { getMyChats, markChatSeen } from "@lib/api/chats";
import type { ApiChatListItem } from "@lib/api/types";
import { useChatStore } from "@lib/chatStore";
import { usePollTick } from "@lib/pollContext";
import { useUserStore } from "@lib/userStore";
import type { UserData } from "@lib/userStore";

import AddUser from "@components/list/chatList/addUser/AddUser";
import Tooltip from "@components/chat/customEmojiPicker/Tooltip";

export type UserChatEntryStored = {
  chatId: string;
  lastMessageId: string;
  receiverId: string;
  updatedAt: number;
};

export type ChatItem = UserChatEntryStored & {
  user?: UserData;
  lastMessageText?: string;
  imgSent?: boolean;
  lastMessageSenderId?: string;
  unreadCount?: number;
  latestMessageId?: string;
};

function mapApiChatToChatItem(entry: ApiChatListItem): ChatItem {
  const user = entry.receiver
    ? {
        id: entry.receiver.id,
        username: entry.receiver.username ?? "",
        email: entry.receiver.email,
        avatar: entry.receiver.avatar,
        blocked: entry.receiver.blocked ?? [],
        createdAt: entry.receiver.createdAt,
        updatedAt: entry.receiver.updatedAt,
      }
    : undefined;

  return {
    chatId: entry.chatId,
    lastMessageId: entry.lastMessageId ?? "",
    receiverId: entry.receiverId,
    updatedAt: entry.updatedAt ?? 0,
    user,
    lastMessageText: entry.lastMessage?.text,
    imgSent: Boolean(entry.lastMessage?.img),
    lastMessageSenderId: entry.lastMessage?.sender,
    unreadCount: entry.unreadCount ?? 0,
    latestMessageId: entry.lastMessage?.id,
  };
}

const ChatList = () => {
  const [chats, setChats] = useState<ChatItem[]>([]);
  const [addMode, setAddMode] = useState(false);

  const { user: currentUser } = useUserStore();
  const { changeChat, chatId, updateChatUser } = useChatStore();
  const pollTick = usePollTick();
  const currentUserId = currentUser?.id ?? "";

  const loadChats = useCallback(async () => {
    if (!currentUser?.id) return;
    try {
      const list = await getMyChats();
      const items = list.map((entry) => mapApiChatToChatItem(entry));
      const sortedDesc = [...items].sort((a, b) => b.updatedAt - a.updatedAt);
      setChats(sortedDesc);
      if (chatId) {
        const selected = sortedDesc.find((c) => c.chatId === chatId);
        if (selected?.user) updateChatUser(selected.user);
      }
    } catch (e) {
      console.error(e);
    }
  }, [currentUser?.id, chatId, updateChatUser]);

  useEffect(() => {
    loadChats();
  }, [loadChats, pollTick]);

  const handleSelectChat = async (chat: ChatItem) => {
    if (!currentUser?.id) return;
    try {
      const previousChatId = chatId;

      if (previousChatId && chat.chatId !== previousChatId) {
        setChats((prev) =>
          prev.map((c) =>
            c.chatId === previousChatId ? { ...c, unreadCount: 0 } : c
          )
        );
      }

      if (previousChatId && chat.chatId !== previousChatId) {
        const previousChat = chats.find((c) => c.chatId === previousChatId);
        if (previousChat?.latestMessageId) {
          await markChatSeen(previousChatId, previousChat.latestMessageId);
        }
      }
      if (chat.latestMessageId) {
        await markChatSeen(chat.chatId, chat.latestMessageId);
      }
      changeChat(chat.chatId, (chat.user as UserData) ?? null);
      await loadChats();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="chatList">
      <div className="search">
        <div className="searchBar">
          <FontAwesomeIcon icon={faSearch} />&nbsp;
          <input type="text" placeholder="Search for a user..." />
        </div>
        {addMode ? (
          <Tooltip label="Close add user window.">
            <FontAwesomeIcon icon={faMinus} className="add" onClick={() => setAddMode((prev) => !prev)} />
          </Tooltip>
        ) : (
          <Tooltip label="Open add user window.">
            <FontAwesomeIcon icon={faPlus} className="add" onClick={() => setAddMode((prev) => !prev)} />
          </Tooltip>
        )}
      </div>
      {chats.map((chat) => {
        const hasUnread = (chat.unreadCount ?? 0) > 0;
        const isCurrentChat = chat.chatId === chatId;
        const lastMessageIsMine = chat.lastMessageSenderId === currentUserId;
        const showUnreadStyle = hasUnread && !isCurrentChat && !lastMessageIsMine;
        const style: React.CSSProperties = {
          color: showUnreadStyle ? "" : "rgb(31, 61, 32)",
        };
        if (!isCurrentChat && showUnreadStyle) {
          style.backgroundColor = "rgb(12, 22, 86)";
        }

        return (
        <button
          type="button"
          className="chat-list-item"
          key={chat.chatId}
          onClick={() => handleSelectChat(chat)}
          style={style}
        >
          <div className="chat-list-item-image">
            {showUnreadStyle && (
              <div className="messages-not-seen-indicator">
                {chat.unreadCount! > 0 && <span>{chat.unreadCount}</span>}
              </div>
            )}
            <img src={chat.user?.avatar || "./user.png"} alt="" />
          </div>
          <div className="texts">
            <span
              style={{
                color: showUnreadStyle ? "cyan" : "rgb(7, 10, 206)",
                fontWeight: "bold",
              }}
            >
              {chat.user?.username}
            </span>
            <p
              style={{
                color:
                  showUnreadStyle ? "rgb(255, 255, 255)" : "rgb(31, 61, 32)",
              }}
            >
              {chat.lastMessageSenderId === currentUserId ? (
                <span style={{ fontWeight: "bold" }}>You: </span>
              ) : (
                ""
              )}
              {chat.lastMessageText != null && chat.lastMessageText.length >= 26
                ? chat.lastMessageText.slice(0, 21) + "..."
                : chat.lastMessageText ?? "No messages yet"}
              {chat.imgSent ? (
                <>
                  {" "}
                  <FontAwesomeIcon icon={faImage} />
                </>
              ) : null}
            </p>
          </div>
        </button>
        );
      })}

      {addMode && <AddUser setAddMode={setAddMode} onAdded={loadChats} />}
    </div>
  );
};

export default ChatList;
