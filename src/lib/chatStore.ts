import { create } from "zustand";
import { useUserStore } from "./userStore";
import type { UserData } from "./userStore";

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

export const useChatStore = create<ChatStore>((set) => ({
    chatId: null,
    user: null,
    blockedByUserId: null,
    isCurrentUserBlocked: false,
    isReceiverBlocked: false,
    chatImages: [],
    changeChat: (chatId: string, user) => {
        const currentUser = useUserStore.getState().user;

        if (user.blocked.includes(currentUser?.id || "")) {
            return set({
                chatId,
                user: null,
                blockedByUserId: user.id,
                isCurrentUserBlocked: true,
                isReceiverBlocked: false,
            })
        }

        if (currentUser?.blocked?.includes(user?.id)) {
            return set({
                chatId,
                user: user,
                blockedByUserId: null,
                isCurrentUserBlocked: false,
                isReceiverBlocked: true,
            })
        }

        set({
            chatId,
            user: user,
            blockedByUserId: null,
            isCurrentUserBlocked: false,
            isReceiverBlocked: false,
        });
    },
    changeBlock: () => {
        set((state: ChatStore) => ({...state, isReceiverBlocked: !state.isReceiverBlocked}))
    },
    changeChatImages: (chatImages: string[]) => {
        set({
            chatImages: chatImages,
        });
    },
    updateChatUser: (userData: UserData) => {
        const currentUser = useUserStore.getState().user;
        const blocked = userData.blocked ?? [];

        set((prev: ChatStore) => ({
            ...prev,
            user: userData,
            blockedByUserId: blocked.includes(currentUser?.id ?? "") ? userData.id : null,
            isCurrentUserBlocked: blocked.includes(currentUser?.id ?? ""),
            isReceiverBlocked: Boolean(currentUser?.blocked?.includes(userData.id)),
        }));
    },
}));