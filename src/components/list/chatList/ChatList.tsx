import { faImage, faMinus, faPlus, faSearch } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useState, useEffect } from "react";


import "./chatList.css"
import AddUser from "./addUser/AddUser"
import { useUserStore } from "../../../lib/userStore";
import { auth, db } from "../../../lib/firebase";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import type { UserData } from "../../../lib/userStore";
import { useChatStore } from "../../../lib/chatStore";
import { updateDoc } from "firebase/firestore";
import Tooltip from "../../chat/customEmojiPicker/Tooltip";

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

const ChatList = () => {
    const [chatEntries, setChatEntries] = useState<UserChatEntryStored[]>([]);
    const [chatMessageIds, setChatMessageIds] = useState<Record<string, string[]>>({});
    const [chats, setChats] = useState<ChatItem[]>([]);
    const [addMode, setAddMode] = useState(false);

    const { user: currentUser } = useUserStore();
    const { changeChat, chatId } = useChatStore();
    const currentUserId = auth.currentUser?.uid ?? currentUser?.id;

    useEffect(() => {
        if (!currentUser?.id) return;

        const unsubscribeUserchats = onSnapshot(doc(db, "userchats", currentUser.id), (res) => {
            const entries = (res.data()?.chats || []) as UserChatEntryStored[];
            setChatEntries(entries);
        });

        return () => unsubscribeUserchats();
    }, [currentUser?.id]);

    const chatIds = chatEntries.map((e) => e.chatId);
    useEffect(() => {
        if (chatIds.length === 0) {
            setChatMessageIds({});
            return;
        }

        const unsubscribes = chatIds.map((id) => {
            return onSnapshot(doc(db, "chats", id), (snap) => {
                const messageIds = (snap.data()?.messages ?? []) as string[];
                setChatMessageIds((prev) => ({ ...prev, [id]: messageIds }));
            });
        });

        return () => {
            unsubscribes.forEach((unsub) => unsub());
        };
    }, [chatIds.join(",")]);

    useEffect(() => {
        if (chatEntries.length === 0) {
            setChats([]);
            return;
        }

        let cancelled = false;

        const run = async () => {
            const merged = await Promise.all(
                chatEntries.map(async (entry): Promise<ChatItem> => {
                    const messageIds = chatMessageIds[entry.chatId] ?? [];
                    const base: ChatItem = {
                        ...entry,
                        user: undefined,
                        lastMessageText: undefined,
                        imgSent: false,
                        lastMessageSenderId: undefined,
                        unreadCount: 0,
                        latestMessageId: messageIds.length > 0 ? messageIds[messageIds.length - 1] : undefined,
                    };

                    const [userDocSnap, lastMsgSnap] = await Promise.all([
                        getDoc(doc(db, "users", entry.receiverId)),
                        messageIds.length > 0
                            ? getDoc(doc(db, "messages", messageIds[messageIds.length - 1]))
                            : Promise.resolve(null),
                    ]);

                    const userData = userDocSnap.exists() ? (userDocSnap.data() as UserData) : undefined;
                    base.user = userData ? { ...userData, id: userData.id ?? userDocSnap.id } : undefined;

                    if (lastMsgSnap?.exists()) {
                        const msg = lastMsgSnap.data() as { text?: string; img?: string; senderId?: string };
                        base.lastMessageText = msg.text ?? "";
                        base.imgSent = Boolean(msg.img);
                        base.lastMessageSenderId = msg.senderId;
                    }

                    if (base.lastMessageSenderId === currentUserId) {
                        base.unreadCount = 0;
                    } else {
                        const seenId = entry.lastMessageId ?? "";
                        const lastSeenIndex = seenId ? messageIds.indexOf(seenId) : -1;
                        if (lastSeenIndex === -1) {
                            base.unreadCount = messageIds.length;
                        } else {
                            base.unreadCount = Math.max(0, messageIds.length - 1 - lastSeenIndex);
                        }
                    }

                    return base;
                })
            );

            if (!cancelled) {
                setChats(merged.sort((a, b) => b.updatedAt - a.updatedAt));
            }
        };

        run();
        return () => {
            cancelled = true;
        };
    }, [chatEntries, chatMessageIds, currentUserId]);

    const handleSelectChat = async (chat: ChatItem) => {
        const chatIndex = chats.findIndex((c) => c.chatId === chat.chatId);
        if (chatIndex === -1) return;

        const userChats: UserChatEntryStored[] = chats.map((item) => ({
            chatId: item.chatId,
            lastMessageId: item.lastMessageId ?? "",
            receiverId: item.receiverId ?? "",
            updatedAt: typeof item.updatedAt === "number" ? item.updatedAt : 0,
        }));

        userChats[chatIndex].lastMessageId = chat.latestMessageId ?? userChats[chatIndex].lastMessageId;

        const userChatsRef = doc(db, "userchats", currentUser?.id || "");

        try {
            await updateDoc(userChatsRef, {
                chats: userChats,
            });
            changeChat(chat.chatId, (chat.user as UserData) ?? null);
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <div className='chatList'>
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
            {chats.map((chat) => (
                <div 
                    className="chat-list-item" 
                    key={chat.chatId} 
                    onClick={() => handleSelectChat(chat)}
                    style={{
                        backgroundColor: (chat.unreadCount ?? 0) > 0 ? "rgb(12, 22, 86)" : "transparent",
                        color: (chat.unreadCount ?? 0) > 0 ? "" : "rgb(31, 61, 32)",
                    }}
                >
                    <div className="chat-list-item-image">
                        {(chat.unreadCount ?? 0) > 0 && chat.chatId != chatId &&(
                            <div className="messages-not-seen-indicator">
                                {chat.unreadCount! > 0 && <span>{chat.unreadCount}</span>}
                            </div>
                        )}
                        <img src={chat.user?.avatar || "./user.png"} alt="" />
                    </div>
                    <div className="texts">
                        <span style={{ color: (chat.unreadCount ?? 0) > 0 ? "cyan" : "rgb(7, 10, 206)", fontWeight: "bold" }}>
                            {chat.user?.username}
                        </span>
                        <p
                            style={{
                                color: (chat.unreadCount ?? 0) > 0 ? "rgb(255, 255, 255)" : "rgb(31, 61, 32)",
                            }}
                        >
                            {chat.lastMessageSenderId === currentUserId ? <span style={{ fontWeight: "bold" }}>You: </span> : ""}
                            {chat.lastMessageText != null && chat.lastMessageText.length >= 26
                                ? chat.lastMessageText.slice(0, 21) + "..."
                                : chat.lastMessageText ?? "No messages yet"}
                            {chat.imgSent ? <>&nbsp;<FontAwesomeIcon icon={faImage} /></> : null}
                        </p>
                    </div>
                </div>
            ))}

            {addMode && <AddUser setAddMode={setAddMode}/>}
        </div>
    )
}

export default ChatList