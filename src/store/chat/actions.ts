import * as chatTypes from "./types"

export const AddActiveChatWindow = (chatId : string) => {
    return {
        type: chatTypes.ADD_ACTIVE_CHAT_WINDOW,
        payload: { chatId }
    }
}

export const RemoveActiveChatWindow = (chatId : string) => {
    return {
        type: chatTypes.REMOVE_ACTIVE_CHAT_WINDOW,
        payload: { chatId }
    }
}

export const ClearActiveChatsWindows = () => {
    return {
        type: chatTypes.CLEAR_ACTIVE_CHATS_WINDOWS
    }
}