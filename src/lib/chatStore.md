# chatStore

## interface `ChatStore`

```typescript
interface ChatStore {
    chatId: string | null;
    user: UserData | null;
    blockedByUserId: string | null;
    isCurrentUserBlocked: boolean;
    isReceiverBlocked: boolean;
    chatImages: string[];
    changeChat: (chatId: string, user: UserData) => void;
    changeBlock: () => void;
    changeChatImages: (chatImages: string[]) => void;
    updateChatUser: (userData: UserData) => void;
}
```

## interface `ChatStore` - variables

`chatId` - current / selected chat id (firebase document identificator)

`user` - current (logged) user data (`UserData`)

`blockedByUserId` - id of blocked user by currentUser (chat partner)

`isCurrentUserBlocked` - flag which determines whether logged user is blocked by chat partner

`isReceiverBlocked` - flag which determines whether receiver (chat partner) is blocked by current user

`chatImages[]` - array of images urls shared between users

## interface `ChatStore` - functions

### `changeChat: (chatId: string, user: UserData) => void`:

#### Steps:

1. Get current(logged-in) user
2. Cases:

**Case A** - other `user` has blocked current user (`user.blocked` includes the current user's id)

Sets: 
- `chatId` 
- `blockedByUserId` - `user.id`
- `isCurrentUserBlocked` - `true`
- `isReceiverBlocked` - `false`
- `user` - `null` (UI treat current user blocked without showing the other user's profile, shared images etc.)

**Case B** - current user has blocked the other user (`currentUser.blocked` includes `user.id`)

Sets:
- `chatId`
- `blockedByUserId` - `null`
- `isCurrentUserBlocked` - `false`
- `isReceiverBlocked` - `true`
- `user` - user (`UserData` interface)

The chat is still "with" that user, but UI show f.e. user block state on the block button.

**Case C** - no blocking in either direction

Sets:
- `chatId`
- `user` - user (`UserData` interface)
- `blockedByUserId` - `null`
- `isCurrentUserBlocked` - `false`
- `isReceiverBlocked` - `false`

Normal chat state.

### `changeBlock: () => void;`

#### Steps

1. Set `isReceiverBlocked` state value to opposite (`false` => `true` or `true` => `false`)

### `changeChatImages: (chatImages: string[]) => void;`

#### Steps

1. Set chatImages url array to passed argument array

### `updateChatUser: (userData: UserData) => void;`

#### Steps 

1. Get currentUser from `useUserStore`
2. Get chat partner blocked users ids array
3. Set:
- blocked flags:
    - `blockByUserId`
    - `isCurrentUserBlocked`
    - `isReceiverBlocked`
- `blockedByUserId`