# Chat

Component to display chat messages, send message button with textfield for message to send, add image option and also short information about contact.

## Props

No props included.

## `useState` variables:

- `const [chat, setChat] = useState<ChatWithMessages | null>(null);`

`chat` - object including all needed, merged data from docs to display in component's content

Type/interfaces definitions:

```typescript
type ChatWithMessages = Omit<ChatDocRaw, "messages"> & { messages: ChatMessage[] };
```

`Omit<T, K extends keyof any> = { [P in Exclude<keyof T, K>]: T[P]; }` - Construct a type with properties of T except for those in type K. So we do not provide `messages: string[]` from `ChatDocRaw` interface (messages ids), but from `ChatMessage` - message with all its content (text, img, sender, createdAt).

and:

```typescript
interface ChatDocRaw {
    id?: string;
    createdAt?: unknown;
    messages: string[]; // IDs in messages collection
}
```

and:

```typescript
export interface ChatMessage {
    id: string;
    senderId: string;
    text: string;
    createdAt: { toDate(): Date };
    img?: string;
}
```

### Usage in component's code:

```html
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
```

Display all messages with its details like: mine / not mine indicator, message image if exists, message text, timeMarker (how long ago was sent).

- `const [showEmojiPicker, setShowEmojiPicker] = useState(false);`

`showEmojiPicker`(`boolean`) - flag that determine if the CustomEmojiPicker component should be displayed. 

### Usage in component's code:

```typescript
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
```

On `FontAwesomeIcon` with `icon={faSmile}` click, sets `showEmojiPicker` to the opposite `boolean` value.

Renders `CustomEmojiPicker` component if `showEmojiPicker` set to `true`.

```html
<div className="emoji" style={{ position: "relative" }}>
    {showEmojiPicker ? <EmojiPicker /> : (
        <Tooltip label="Open emoji picker"> 
            <EmojiPicker />
        </Tooltip>
    )}
</div>
```

Renders only `EmojiPicker` if `showEmojiPicker` is true. If `showEmojiPicker` is false, renders `EmojiPicker` wrapped into `Tooltip` component (label on component hover).

- `const [message, setMessage] = useState("new messsage");`

`message` - message to send, which changes on input content change (`placeholder="Type your message here..."` )

### Usage in component's code:

```typescript
    const handleSendMessage = async () => {
        if (message.trim() === "") return; // <- if message empty - no action needed 
        (...)

        try {
            (...)

            const messageRef = collection(db, "messages");
            const newMessageRef = doc(messageRef);

            await setDoc(newMessageRef, {
                senderId: currentUser?.id,
                text: message.trim(), // <- create new doc inside "messages" collection
                createdAt: serverTimestamp(),
                ...(imageUrl ? { img: imageUrl } : {}),
            });

            const chatDocRef = doc(db, "chats", chatId);
            await updateDoc(chatDocRef, {
                messages: arrayUnion(newMessageRef.id),
            });

            (...)
        } catch (error) {
            console.error(error);
        }

        setImage(null);
        setMessage(""); // <- after image send process message is set to empty string
    }
```

```html
<input 
    type="text" 
    placeholder="Type your message here..." 
    value={message}
    onChange={(e) => setMessage(e.target.value)}
    disabled={isCurrentUserBlocked}
/>
```

`message` value comes from this input - on its content change `message` is updated, so is always up to date

- `const [image, setImage] = useState<ImageData | null>(null);`

`image` - image data, optionally included in message content, includes its url and file values

### Usage in component's code:

```typescript
const handleSendMessage = async () => {
        (...)

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

            (...)
        } catch (error) {
            console.error(error);
        }

        setImage(null);
        (...)
    }
```

Sets `imageUrl` (`string`) after uploading `image.file` using `firebase/storage` API (`upload.ts` file).

After sending message, `image` is set to `null`.

---

# Business logic

## `useEffect`'s

```typescript
useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
}, [chat?.messages?.length]);
```

Scrolls messages content into its end, when `chat.messages` size changes.

```typescript
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
```

When `chatId` value changes the following process is done:

1. Start subscribing document with `chatId` from `"chats"` collection.
2. Get `chatData` (`id`, `createdAt`, `messages` - array of messages id's).
3. If `chatData` is `undefined` or `null` set chat to `null`, otherwise go to **4.**
4. Extract `messagesIds` from `chatData`.
5. If `messageIds` is empty, set chat with empty `messages` array merged with `chatData`, otherwise go to **6.**
6. For every `messageIds` array element, map it (id) into promise -> await for this message details from `"messages"` collection. If data for `messageSnap` is `null` or `undefined` return null, otherwise resolve promise with merged message id with its data.
7. Filter not null promises from 6., set chat as merged `chatData` with `messages`.
8. Updates `lastMessageId` inside `"userchats"` collection for `currentUser` if this id is not last or does not exists inside messages. `apdatedAt` is set to `Date.now()`

```typescript
useEffect(() => {
    if (!user?.id) return;
    const unsubscribe = onSnapshot(doc(db, "users", user.id), (snap) => {
        if (snap.exists()) {
            updateChatUser(snap.data() as UserData);
        }
    });
    return () => unsubscribe();
}, [user?.id, updateChatUser]);
```

When `user.id` value changes the following process is done:

1. If there is no chat partner it does nothing.
2. Start subscribing chat partner Firestore doc for changes.
3. If something changed in chat partner data, updates are applied to zustand store.
4. When the component unmount, or when `user?.id` or `updateChatUser` changes - listener is removed.

## Business logic

### Functions

```
const handleEmojiClick = (emoji: string) => {
    setMessage(prev => prev + emoji);
};
```

Appends selected emoji to current `message` value.

```
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
```

If `file` property exists inside `ChangeEvent` `target.files?` first element, `image` from `useState` is set, and `message` value is set to filename without extension (first part before `.` char).

```
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
```

The full message send process includes steps like:

1. If exist `file` inside `image`, `imageUrl` is resolved when updating it to firebase storage.
2. New message document inside `"messages"` collection is created with all needed data.
3. New message id is added to corresponding chat from `"chats"` collection.
4. Updates `"userchats"` collection with newly added message id (`lastMessageId: newMessageRef.id`).

```typescript
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
```

Creates time marker for message:

- `"just now"` - if message sent less than 1 minute ago
- `"1 minute ago"` - if message sent exactly or more than 1 minute ago and less than two minutes ago
- `"<x> minutes ago"` - if message sent exactly more than 2 minutes ago and less than 60 minutes ago
- `"1 day ago"` - if message sent more than 1 day ago, and less than 2 days ago
- `"<x> days ago"` - if message sent exactly or more than 2 days ago
- `"1 hour ago"` - if message sent exactly or more than 1 hour ago and less than 2 hours ago
- `"<x> hours ago"` - if message sent exactly or more than 2 hours ago and less than 1 day ago

## Components code:

```html
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
```

