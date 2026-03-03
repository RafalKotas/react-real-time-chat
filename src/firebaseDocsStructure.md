# Firebase docs structure

## 👤 `"users"` doc:
- `userId:` string (key)
----------------------------------
- `username`: string
- `email`: string
- `avatar`: string
- `blocked`: string[]
- `createdAt`: timestamp or number - to decide later
- `updatedAt`: timestamp or number - to decide later

## 🗪 `"chat"` doc:
- `chatId`: string (key)
----------------------------------
- `messages`: string[] - id of object in `"messages"` doc
- `createdAt`: timestamp or number - to decide later

## ✉️  `"messages"` doc:
- `messageId`: string
----------------------------------
- `senderId`: string
- `text`: string
- `createdAt`: timestamp or number - to decide later
- `img`: string - image url or empty if no image in message

## 👤 🗪 🗪 🗪 `"userchats"` doc:
- `userId` : string - id of object in `"users"` doc
----------------------------------
chats[]:
- `chatId`: string - id of object in `"chats"`
- `lastMessageId`: string - id of object in `"messages"` doc
- `receiverId`: string - id of boject in `"users"` doc
- `updatedAt`: timestamp or number - to decide later