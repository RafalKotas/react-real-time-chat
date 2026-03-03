import { getDoc, doc } from "firebase/firestore";
import { create } from "zustand";
import { db } from "./firebase";

export interface UserData {
    id: string;
    username: string;
    email: string;
    avatar?: string;
    blocked: string[];
    createdAt: unknown;
    updatedAt: unknown;
}

interface UserStore {
    user: UserData | null;
    isLoading: boolean;
    fetchUser: (uuid: string) => Promise<void>;
}

export const useUserStore = create<UserStore>((set) => ({
    user: null,
    isLoading: true,
    fetchUser: async (uuid: string) => {
        if (!uuid) return set({ user: null, isLoading: false });

        try {
            const docRef = doc(db, "users", uuid); 
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const data = docSnap.data() as UserData;
                const userWithId = { ...data, id: data.id ?? docSnap.id };
                set({ user: userWithId, isLoading: false });
                
            } else {
                set({ user: null, isLoading: false });
            }

            
        } catch (error) {
            console.error(error);
            return set({ user: null, isLoading: false });
        }
    },
}));
