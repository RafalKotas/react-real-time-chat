import "./chat.css";

import {
  faCamera,
  faImage,
  faInfoCircle,
  faMicrophone,
  faPhone,
  faSmile,
  faVideo,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRef, useEffect, useState, useCallback, memo } from "react";
import CustomEmojiPicker from "@components/chat/customEmojiPicker/CustomEmojiPicker";
import { useChatStore } from "@lib/chatStore";
import { useUserStore } from "@lib/userStore";
import type { ChangeEvent } from "react";
import uploadFile from "@lib/upload";
import Tooltip from "@components/chat/customEmojiPicker/Tooltip";
import { usePollTick } from "@lib/pollContext";
import { getChatMessages, sendMessage } from "@lib/api/chats";
import { getUser } from "@lib/api/users";
import type { ApiMessage } from "@lib/api/types";
import { getMessageImageUrl } from "@lib/api/types";

interface ImageData {
  url: string;
  file: File;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  createdAt: Date | string;
  img?: string;
}


interface EmojiPickerTriggerProps {
  showEmojiPicker: boolean;
  setShowEmojiPicker: (v: boolean | ((prev: boolean) => boolean)) => void;
  onEmojiClick: (emoji: string) => void;
  isCurrentUserBlocked: boolean;
}

const EmojiPickerTrigger = memo(function EmojiPickerTrigger({
  showEmojiPicker,
  setShowEmojiPicker,
  onEmojiClick,
  isCurrentUserBlocked,
}: EmojiPickerTriggerProps) {
  const stableOnEmojiClick = useCallback(
    (emoji: string | undefined) => {
      if (emoji != null) onEmojiClick(emoji);
    },
    [onEmojiClick]
  );

  return (
    <>
      <FontAwesomeIcon
        icon={faSmile}
        style={{
          cursor: isCurrentUserBlocked ? "not-allowed" : "pointer",
          opacity: isCurrentUserBlocked ? 0.5 : 1,
        }}
        onClick={() => setShowEmojiPicker((prev) => !prev)}
      />
      {showEmojiPicker && (
        <CustomEmojiPicker onEmojiClick={stableOnEmojiClick} />
      )}
    </>
  );
});

const Chat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [message, setMessage] = useState("");
  const [image, setImage] = useState<ImageData | null>(null);

  const { user: currentUser } = useUserStore();
  const { chatId, user, isCurrentUserBlocked, updateChatUser, changeChatImages } =
    useChatStore();

  const endRef = useRef<HTMLDivElement>(null);

  const loadMessages = useCallback(async () => {
    if (!chatId) return;
    try {
      const list = await getChatMessages(chatId);
      const mapped: ChatMessage[] = list.map((m: ApiMessage) => ({
        id: m.id ?? "",
        senderId: m.sender ?? "",
        text: m.text ?? (m as Record<string, unknown>).content ?? "",
        createdAt: m.createdAt ?? "",
        img: getMessageImageUrl(m),
      }));
      setMessages(mapped);

      const imageUrls = list.map(getMessageImageUrl).filter((url): url is string => url != null && url !== "");
      changeChatImages(imageUrls);
    } catch (e) {
      console.error(e);
    }
  }, [chatId, changeChatImages]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const pollTick = usePollTick();

  useEffect(() => {
    if (!chatId) {
      setMessages([]);
      changeChatImages([]);
      return;
    }
    loadMessages();
  }, [chatId, loadMessages, changeChatImages, pollTick]);

  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;
    getUser(user.id).then((apiUser) => {
      if (cancelled || !apiUser) return;
      updateChatUser({
        id: apiUser.id,
        username: apiUser.username ?? "",
        email: apiUser.email,
        avatar: apiUser.avatar,
        blocked: apiUser.blocked ?? [],
        createdAt: apiUser.createdAt,
        updatedAt: apiUser.updatedAt,
      });
    });
    return () => {
      cancelled = true;
    };
  }, [user?.id, updateChatUser]);

  const handleEmojiClick = useCallback((emoji: string) => {
    setMessage((prev) => prev + emoji);
  }, []);

  const handleImage = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage({
        file,
        url: URL.createObjectURL(file),
      });
      setMessage(file.name.split(".")[0]);
    }
  };

  const handleSendMessage = async () => {
    if (!chatId || !currentUser?.id) return;
    if (message.trim() === "" && !image?.file) return;

    let imageUrl: string | null = null;

    try {
      if (image?.file) {
        imageUrl = (await uploadFile(image.file)) as string;
      }

      const sent = await sendMessage(chatId, message.trim(), imageUrl ?? undefined);
      const sentImgUrl = getMessageImageUrl(sent);

      setMessages((prev) => [
        ...prev,
        {
          id: sent.id,
          senderId: sent.sender,
          text: sent.text ?? (sent as Record<string, unknown>).content ?? "",
          createdAt: sent.createdAt ?? "",
          img: sentImgUrl,
        },
      ]);
      if (sentImgUrl) {
        const currentImages = useChatStore.getState().chatImages;
        if (!currentImages.includes(sentImgUrl)) {
          changeChatImages([...currentImages, sentImgUrl]);
        }
      }

      setImage(null);
      setMessage("");
      await loadMessages();
    } catch (error) {
      console.error(error);
    }
  };

  const createMsgTimeMarker = (createdAt: ChatMessage["createdAt"]) => {
    const msgDate = typeof createdAt === "string" ? new Date(createdAt) : createdAt;
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - msgDate.getTime());
    const diffMinutes = Math.ceil(diffTime / (1000 * 60));

    if (diffMinutes < 60) {
      if (diffMinutes === 0) return "just now";
      if (diffMinutes === 1) return "1 minute ago";
      return `${diffMinutes} minutes ago`;
    }

    const sameDay =
      now.getDate() === msgDate.getDate() &&
      now.getMonth() === msgDate.getMonth() &&
      now.getFullYear() === msgDate.getFullYear();
    if (!sameDay) {
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays === 1) return "1 day ago";
      return `${diffDays} days ago`;
    }
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
    if (diffHours === 1) return "1 hour ago";
    return `${diffHours} hours ago`;
  };

  return (
    <div className="chat">
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
        {messages.map((msg) => {
          const mine = msg.senderId === currentUser?.id;
          return (
            <div key={msg.id} className={`message ${mine ? "mine" : ""}`}>
              <div className="texts">
                {msg.img && <img src={msg.img} alt="" />}
                <p>{msg.text ?? ""}</p>
                <span className="time-marker">
                  {createMsgTimeMarker(msg.createdAt)}
                </span>
              </div>
            </div>
          );
        })}
        {image?.url && (
          <div className="message mine">
            <div className="texts">
              <img src={image.url} alt="" />
            </div>
          </div>
        )}
        <div ref={endRef}></div>
      </div>

      <div className="bottom">
        <div className="icons">
          <Tooltip label="Add image(device gallery)">
            <>
              <label htmlFor="chat-image-input" style={{ cursor: "pointer" }}>
                <FontAwesomeIcon
                  icon={faImage}
                  style={{
                    cursor: isCurrentUserBlocked ? "not-allowed" : "pointer",
                    opacity: isCurrentUserBlocked ? 0.5 : 1,
                  }}
                />
              </label>
              <input
                id="chat-image-input"
                type="file"
                accept="image/*"
                disabled={isCurrentUserBlocked}
                style={{ display: "none" }}
                onChange={handleImage}
              />
            </>
          </Tooltip>
          <Tooltip label="Add image(device camera)">
            <FontAwesomeIcon
              icon={faCamera}
              style={{
                cursor: isCurrentUserBlocked ? "not-allowed" : "pointer",
                opacity: isCurrentUserBlocked ? 0.5 : 1,
              }}
            />
          </Tooltip>
          <Tooltip label="Add voice message">
            <FontAwesomeIcon
              icon={faMicrophone}
              style={{
                cursor: isCurrentUserBlocked ? "not-allowed" : "pointer",
                opacity: isCurrentUserBlocked ? 0.5 : 1,
              }}
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
          {showEmojiPicker ? (
            <EmojiPickerTrigger
              showEmojiPicker={showEmojiPicker}
              setShowEmojiPicker={setShowEmojiPicker}
              onEmojiClick={handleEmojiClick}
              isCurrentUserBlocked={!!isCurrentUserBlocked}
            />
          ) : (
            <Tooltip label="Open emoji picker">
              <EmojiPickerTrigger
                showEmojiPicker={showEmojiPicker}
                setShowEmojiPicker={setShowEmojiPicker}
                onEmojiClick={handleEmojiClick}
                isCurrentUserBlocked={!!isCurrentUserBlocked}
              />
            </Tooltip>
          )}
        </div>

        <button
          className="sendButton"
          onClick={handleSendMessage}
          disabled={isCurrentUserBlocked}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;
