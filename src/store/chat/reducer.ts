import type { Reducer } from "redux";
import type { ChatActions, ChatState } from "./types";
import { ADD_ACTIVE_CHAT_WINDOW, REMOVE_ACTIVE_CHAT_WINDOW, CLEAR_ACTIVE_CHATS_WINDOWS } from "./types";

const initialState: ChatState = {
    activeChatWindows: []
};

export const chatReducer: Reducer<ChatState, ChatActions> = (state = initialState, action) => {
    switch (action.type) {
        case ADD_ACTIVE_CHAT_WINDOW:
            if (state.activeChatWindows.includes(action.payload.chatId)) {
                return state;
            }
            return {
                ...state,
                activeChatWindows: state.activeChatWindows.includes(action.payload.chatId)
                    ? state.activeChatWindows 
                    : [...state.activeChatWindows, action.payload.chatId]
            };
        case REMOVE_ACTIVE_CHAT_WINDOW:
            return {
                ...state,
                activeChatWindows: state.activeChatWindows.filter(id => id !== action.payload.chatId)
            };
        case CLEAR_ACTIVE_CHATS_WINDOWS:
            return {
                ...state,
                activeChatWindows: []
            }
        default:
            return state;
    }
};
