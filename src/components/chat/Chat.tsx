import "./chat.css"

import { faCamera, faImage, faInfoCircle, faMicrophone, faPhone, faSmile, faVideo } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useRef, useEffect, useState } from "react"
import CustomEmojiPicker from "./customEmojiPicker/CustomEmojiPicker"
import { auth, db } from "../../lib/firebase"
import { arrayUnion, collection, doc, getDoc, onSnapshot, serverTimestamp, setDoc, updateDoc } from "firebase/firestore"
import { useChatStore } from "../../lib/chatStore"
import { useUserStore, type UserData } from "../../lib/userStore"
import type { ChatItem } from "../list/chatList/ChatList"
import type { ChangeEvent } from "react"
import uploadFile from "../../lib/upload"
import Tooltip from "./customEmojiPicker/Tooltip"

export interface UserChatData {
    chats: ChatItem[];
}

interface ImageData {
    url: string;
    file: any;
}

/** Message document from Firestore "messages" collection (with id). */
export interface ChatMessage {
    id: string;
    senderId: string;
    text: string;
    createdAt: { toDate(): Date };
    img?: string;
}

/** Raw chat document from "chats" collection (message IDs only). */
interface ChatDocRaw {
    id?: string;
    createdAt?: unknown;
    messages: string[]; // IDs in messages collection
}

type ChatWithMessages = Omit<ChatDocRaw, "messages"> & { messages: ChatMessage[] };

const Chat = () => {

    /** Chat doc metadata + resolved messages (full content). */
    const [chat, setChat] = useState<ChatWithMessages | null>(null);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [message, setMessage] = useState("new messsage");
    const [image, setImage] = useState<ImageData | null>(null);

    const { user: currentUser } = useUserStore();
    const { chatId, user, isCurrentUserBlocked, updateChatUser, changeChatImages } = useChatStore();

    const endRef = useRef<HTMLDivElement>(null);


    const EmojiPicker = () => {
        return (
            <>
                <FontAwesomeIcon 
                    icon={faSmile}
                    style={{ cursor: isCurrentUserBlocked ? "not-allowed" : "pointer", opacity: isCurrentUserBlocked ? 0.5 : 1 }}
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                />
                {showEmojiPicker && (
                    <CustomEmojiPicker onEmojiClick={(emoji) => handleEmojiClick(emoji as string)} />
                )}
            </>
        );
    }

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chat?.messages?.length]);

    useEffect(() => {
        if (!chatId) {
            setChat(null);
            return;
        }

        const unsubscribe = onSnapshot(doc(db, "chats", chatId), async (res) => {
            const chatData = res.data() as ChatDocRaw | undefined;
            if (!chatData) {
                setChat(null);
                return;
            }
            const messageIds: string[] = chatData.messages ?? [];

            if (messageIds.length === 0) {
                setChat({ ...chatData, messages: [] });
                return;
            }

            const messagePromises = messageIds.map(async (id) => {
                const messageDocRef = doc(db, "messages", id);
                const messageSnap = await getDoc(messageDocRef);
                const data = messageSnap.data();
                if (!data) return null;
                return { id, ...data } as ChatMessage;
            });
            const resolved = await Promise.all(messagePromises);
            const messages = resolved.filter((m): m is ChatMessage => m != null);

            setChat({ ...chatData, messages });

            const lastId = messageIds[messageIds.length - 1];
            const uid = auth.currentUser?.uid;
            if (uid && lastId) {
                const userchatsRef = doc(db, "userchats", uid);
                const userchatsSnap = await getDoc(userchatsRef);
                if (userchatsSnap.exists()) {
                    const chats = (userchatsSnap.data()?.chats ?? []) as { chatId: string; lastMessageId?: string; receiverId: string; updatedAt: number }[];
                    const idx = chats.findIndex((c) => c.chatId === chatId);
                    if (idx !== -1 && chats[idx].lastMessageId !== lastId) {
                        const e = chats[idx];
                        chats[idx] = {
                            chatId: e.chatId,
                            lastMessageId: lastId,
                            receiverId: e.receiverId ?? "",
                            updatedAt: Date.now(),
                        };
                        await updateDoc(userchatsRef, { chats });
                    }
                }
            }
        });

        return () => unsubscribe();
    }, [chatId]);

    useEffect(() => {
        if (!user?.id) return;
        const unsubscribe = onSnapshot(doc(db, "users", user.id), (snap) => {
            if (snap.exists()) {
                updateChatUser(snap.data() as UserData);
            }
        });
        return () => unsubscribe();
    }, [user?.id, updateChatUser]);

    // Sync shared photos from current chat messages so Detail shows them when chat loads or updates
    useEffect(() => {
        if (!chatId || !chat?.messages) {
            changeChatImages([]);
            return;
        }
        const imageUrls = chat.messages
            .filter((m): m is ChatMessage & { img: string } => Boolean(m.img))
            .map((m) => m.img);
        changeChatImages(imageUrls);
    }, [chatId, chat?.messages, changeChatImages]);

    const handleEmojiClick = (emoji: string) => {
        setMessage(prev => prev + emoji);
    };

    const handleImage = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImage({ 
                file: file, 
                url: URL.createObjectURL(file) 
            });
            setMessage(file.name.split(".")[0]);
        }
    };

    const handleSendMessage = async () => {
        if (message.trim() === "") return;
        if (!chatId) return;

        let imageUrl: string | null = null;

        try {
            if (image?.file) {
                imageUrl = (await uploadFile(image.file)) as string;
            }

            const messageRef = collection(db, "messages");
            const newMessageRef = doc(messageRef);

            await setDoc(newMessageRef, {
                senderId: currentUser?.id,
                text: message.trim(),
                createdAt: serverTimestamp(),
                ...(imageUrl ? { img: imageUrl } : {}),
            });

            const chatDocRef = doc(db, "chats", chatId);
            await updateDoc(chatDocRef, {
                messages: arrayUnion(newMessageRef.id),
            });

            const senderId = auth.currentUser?.uid ?? currentUser?.id ?? "";
            const userchatsRef = doc(db, "userchats", senderId);
            const snap = await getDoc(userchatsRef);
            if (snap.exists()) {
                const chats = (snap.data()?.chats ?? []) as { chatId: string; lastMessageId?: string; receiverId: string; updatedAt: number }[];
                const index = chats.findIndex((c) => c.chatId === chatId);
                if (index !== -1) {
                    const e = chats[index];
                    chats[index] = {
                        chatId: e.chatId,
                        lastMessageId: newMessageRef.id,
                        receiverId: e.receiverId ?? "",
                        updatedAt: Date.now(),
                    };
                    await updateDoc(userchatsRef, { chats });
                }
            }
        } catch (error) {
            console.error(error);
        }

        setImage(null);
        setMessage("");
    }

    const createMsgTimeMarker = (createdAt: any) => {
        const now = new Date();
        const msgDate = new Date(createdAt.toDate());

        const diffTime = Math.abs(now.getTime() - msgDate.getTime());
        const diffMinutes = Math.ceil(diffTime / (1000 * 60));
        if (diffMinutes < 60) {
            if (diffMinutes === 0) {
                return "just now";
            } else if (diffMinutes === 1) {
                return "1 minute ago";
            } else {
                return `${diffMinutes} minutes ago`;
            }
        } else {
            const sameDays = now.getDate() === msgDate.getDate() && now.getMonth() === msgDate.getMonth() && now.getFullYear() === msgDate.getFullYear();
            if (!sameDays) {
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                if (diffDays === 1) {
                    return "1 day ago";
                } else {
                    return `${diffDays} days ago`;
                }
            } else {
                const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
                if (diffHours === 1) {
                    return "1 hour ago";
                } else {
                    return `${diffHours} hours ago`;
                }
            }
        }
    }

    return (
        <div className='chat'>
            <div className="top">
                <div className="user">
                    <img src={user?.avatar || "./user.png"} alt="" />
                    <div className="texts">
                        <span>{user?.username}</span>
                        <p>Lorem ipsum dolor sit amet.</p>
                    </div>
                </div>
                <div className="icons">
                    <FontAwesomeIcon icon={faPhone} />
                    <FontAwesomeIcon icon={faVideo} />
                    <FontAwesomeIcon icon={faInfoCircle} />
                </div>
            </div>
            
            <div className="center">
                {(chat?.messages ?? []).map((msg) => {
                    const mine = msg.senderId === currentUser?.id;

                    return <div
                        key={msg.id}
                        className={`message ${mine ? "mine" : ""}`}
                    >
                        <div className="texts">
                            {msg.img && <img src={msg.img} alt="" />}
                            <p>{msg.text}</p>
                            <span className="time-marker">{createMsgTimeMarker(msg.createdAt)}</span>
                        </div>
                    </div>
                })}
                {
                    image?.url && <div className="message mine">
                        <div className="texts">
                            <img src={image.url} alt="" />
                        </div>
                    </div>
                }
                <div ref={endRef}></div>
            </div>

            <div className="bottom">
                <div className="icons">
                    <Tooltip label="Add image(device gallery)">
                        <>
                            <label htmlFor="chat-image-input" style={{ cursor: "pointer" }}>
                                <FontAwesomeIcon 
                                    icon={faImage} 
                                    style={
                                        { 
                                            cursor: isCurrentUserBlocked ? "not-allowed" : "pointer", 
                                            opacity: isCurrentUserBlocked ? 0.5 : 1
                                        }
                                    } 
                                />
                            </label>
                            <input
                                id="chat-image-input"
                                type="file"
                                accept="image/*"
                                disabled={isCurrentUserBlocked}
                                style={
                                    { 
                                        display: "none"
                                    }
                                }
                                onChange={handleImage}
                            />
                        </>
                    </Tooltip>
                    <Tooltip label="Add image(device camera)">    
                        <FontAwesomeIcon 
                            icon={faCamera} 
                            style={
                                { 
                                    cursor: isCurrentUserBlocked ? "not-allowed" : "pointer", 
                                    opacity: isCurrentUserBlocked ? 0.5 : 1
                                }
                            } 
                        />
                    </Tooltip>
                    <Tooltip label="Add voice message">
                        <FontAwesomeIcon 
                            icon={faMicrophone} style={
                                { 
                                    cursor: isCurrentUserBlocked ? "not-allowed" : "pointer", 
                                    opacity: isCurrentUserBlocked ? 0.5 : 1
                                }
                            } 
                        />
                    </Tooltip>
                </div>

                <input 
                    type="text" 
                    placeholder="Type your message here..." 
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    disabled={isCurrentUserBlocked}
                />

                <div className="emoji" style={{ position: "relative" }}>
                    {showEmojiPicker ? <EmojiPicker /> : (
                        <Tooltip label="Open emoji picker"> 
                            <EmojiPicker />
                        </Tooltip>
                    )}
                </div>

                <button className="sendButton" onClick={handleSendMessage} disabled={isCurrentUserBlocked}>Send</button>
            </div>
        </div>
    )
}

export default Chat