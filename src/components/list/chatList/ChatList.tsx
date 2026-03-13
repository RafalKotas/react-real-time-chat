import { useState, useEffect, useCallback, useMemo } from "react";
import { faImage, faMinus, faPlus, faSearch, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import "./chatList.css";

import { getMyChats, markChatSeen } from "@lib/api/chats";
import { getContacts } from "@lib/api/contacts";
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
  const [addMode, setAddMode] = useState(false);
  const [contactIds, setContactIds] = useState<Set<string>>(new Set());

  const { user: currentUser } = useUserStore();
  const {
    changeChat,
    chatId,
    updateChatUser,
    setReceiverIdsWithChat,
    allChats,
    closedChatIds,
    setAllChats,
    closeChat,
    resetChat,
  } = useChatStore();
  const pollTick = usePollTick();
  const currentUserId = currentUser?.id ?? "";

  const displayChats = useMemo(() => {
    const items = allChats
      .filter((entry) => !closedChatIds.includes(entry.chatId))
      .map((entry) => mapApiChatToChatItem(entry));
    return [...items].sort((a, b) => b.updatedAt - a.updatedAt);
  }, [allChats, closedChatIds]);

  const loadChats = useCallback(async () => {
    if (!currentUser?.id) return;
    try {
      const list = await getMyChats();
      const sortedDesc = [...list].sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0));
      setAllChats(sortedDesc);
      setReceiverIdsWithChat(sortedDesc.map((c) => c.receiverId));
      const currentChatId = useChatStore.getState().chatId;
      if (currentChatId) {
        const selected = list.find((c) => c.chatId === currentChatId);
        if (selected?.receiver)
          updateChatUser({
            id: selected.receiver.id,
            username: selected.receiver.username ?? "",
            email: selected.receiver.email,
            avatar: selected.receiver.avatar,
            blocked: selected.receiver.blocked ?? [],
            createdAt: selected.receiver.createdAt,
            updatedAt: selected.receiver.updatedAt,
          });
      }
    } catch (e) {
      console.error(e);
    }
  }, [currentUser?.id, updateChatUser, setReceiverIdsWithChat, setAllChats]);

  const loadContactIds = useCallback(async () => {
    if (!currentUser?.id) return;
    try {
      const accepted = await getContacts("accepted");
      const ids = new Set<string>();
      for (const c of accepted) {
        const other = c.requestSenderId === currentUser.id ? c.requestRecipientId : c.requestSenderId;
        ids.add(other);
      }
      setContactIds(ids);
    } catch (e) {
      console.error(e);
    }
  }, [currentUser?.id]);

  useEffect(() => {
    loadChats();
  }, [loadChats, pollTick]);

  useEffect(() => {
    loadContactIds();
  }, [loadContactIds, pollTick]);

  const handleSelectChat = async (chat: ChatItem) => {
    if (!currentUser?.id) return;
    try {
      const previousChatId = chatId;

      if (previousChatId && chat.chatId !== previousChatId) {
        const previousChat = displayChats.find((c) => c.chatId === previousChatId);
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

  const applyCloseChat = useCallback(
    (chatIdToClose: string) => {
      closeChat(chatIdToClose);
      if (chatIdToClose === chatId) {
        const remaining = displayChats.filter((c) => c.chatId !== chatIdToClose);
        if (remaining.length > 0) {
          const next = remaining[0];
          changeChat(next.chatId, (next.user as UserData) ?? null);
        } else {
          resetChat();
        }
      }
    },
    [chatId, displayChats, closeChat, changeChat, resetChat]
  );

  const handleCloseChat = (e: React.MouseEvent, chatIdToClose: string) => {
    e.stopPropagation();
    applyCloseChat(chatIdToClose);
  };

  return (
    <div className="chatList">
      <div className="search">
        <div className="searchBar">
          <FontAwesomeIcon icon={faSearch} />&nbsp;
          <input type="text" placeholder="Add contact to chat list..." />
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
      {displayChats.map((chat) => {
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
        <div
          className="chat-list-item"
          key={chat.chatId}
          style={style}
        >
          <button
            type="button"
            className="chat-list-item-select"
            onClick={() => handleSelectChat(chat)}
            aria-label={`Open chat with ${chat.user?.username ?? "user"}`}
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
                className="chat-list-item-username"
                style={{
                  color: showUnreadStyle ? "cyan" : "rgb(7, 10, 206)",
                  fontWeight: "bold",
                }}
              >
                <span>{chat.user?.username}</span>
                {contactIds.has(chat.receiverId) && (
                  <span className="chat-list-item-contact-marker" title="Contact"> Contact</span>
                )}
              </span>
              <div
                className="chat-list-item-last-message"
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
              </div>
            </div>
          </button>
          <div className="chat-list-item-divider" aria-hidden="true" />
          <Tooltip label="Remove from list">
            <button
              type="button"
              className="chat-list-item-close"
              onClick={(e) => handleCloseChat(e, chat.chatId)}
              aria-label="Remove chat from list"
            >
              <FontAwesomeIcon icon={faXmark} />
            </button>
          </Tooltip>
        </div>
        );
      })}

      {addMode && <AddUser setAddMode={setAddMode} onAdded={loadChats} />}
    </div>
  );
};

export default ChatList;
