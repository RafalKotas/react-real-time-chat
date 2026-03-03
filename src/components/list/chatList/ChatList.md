## Things we need to display in ChatList component

1. user avatar in each chat
2. user username in each chat
3. last message text in each chat
4. if last message is sent by current user, display `"You: "` before the message text
5. if last message has image, display `<FontAwesomeIcon icon={faImage} />` after the message text
6. if there are unread messages, display the number of unread messages in the chat list item, and change the background color of the chat list item to rgb(12, 22, 86)

1st useEffect:

First we fetch userchats(subscribed to `"userchats"` collection) with:
- `chatId`, `lastMessageId`, `receiverId`, `updatedAt` (`UserChatEntryStored[]` - array of `UserChatEntryStored` objects)

Result: `setChatEntries()` (for each chat)

2nd useEffect:

Then we fetch messages ids in each chat(subscribed to `"chats"` collection) with:
- chatId keys, messages array for each chatId (string[] - array of string ids)

Result: `setChatMessagesIds()` (for each chat)

3rd useEffect:

We merge `chatEntries` + `chatMessageIds` → full `ChatItem[]` (`user`, `lastMessageText`, `unreadCount`)

We get user data from `"users"` collection by `receiverId`, and last message data from `"messages"` collection by `lastMessageId` (the most important).

We get last messsage info: `text`, `img`, `senderId` from messages collection by `lastMessageId`.

We calculate unread count:
- if last message `senderId` is current user, `unreadCount` is 0
- else we check if `lastMessageId` is in the messages array:
    - if it is, we calculate the index of `lastMessageId` in the messages array
    - if the index is -1, we set `unreadCount` to the length of the messages array
    - else we set `unreadCount` to the length of the messages array minus 1 minus the index
- if the last message `senderId` is not current user, and the `lastMessageId` is not in the messages array, we set unread count to the length of the messages array

So, `base` is the all merged data that we need to display in the `chats`(`ChatItem[]`).

`handleSelectChat()`:
We update `"userchats"` doc with:
- `chatId`, `lastMessageId` (`lastMessageId` is the latest message id in the chat - we set it to the latest message id in the chat)
We change the `chatId` in the chat store to the selected `chatId`.

--------------------------------------------------------------

`"userchats"` collection:
export type UserChatEntryStored = {
    chatId: string;
    lastMessageId: string;
    receiverId: string;
    updatedAt: number;
};


`"userchats"` with:
- user data (`avatar`, `username`) from `"userchats".receiverId`
- last message `text`, `img`(optional), `senderId` from `"messages"` collection by `"userchats".lastMessageId`
- `unreadCount` - explained above

```
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
```