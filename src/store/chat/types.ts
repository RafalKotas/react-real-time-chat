// actions

interface AddActiveChatWindow {
    type: typeof ADD_ACTIVE_CHAT_WINDOW,
    payload: {
        chatId : string
    }
}

interface RemoveActiveChatWindow {
    type: typeof REMOVE_ACTIVE_CHAT_WINDOW,
    payload: {
        chatId : string
    }
}

interface RemoveAllActiveChatsWindows {
    type: typeof CLEAR_ACTIVE_CHATS_WINDOWS
}

export const ADD_ACTIVE_CHAT_WINDOW = "ADD_ACTIVE_CHAT_WINDOW"
export const REMOVE_ACTIVE_CHAT_WINDOW = "REMOVE_ACTIVE_CHAT_WINDOW"
export const CLEAR_ACTIVE_CHATS_WINDOWS = "CLEAR_ACTIVE_CHATS_WINDOWS"

export type ChatActions = AddActiveChatWindow | RemoveActiveChatWindow | RemoveAllActiveChatsWindows

export interface ChatState {
    activeChatWindows: string[]
}