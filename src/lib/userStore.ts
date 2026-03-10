import { create } from "zustand";
import { getMe } from "./api/users";
import { mapApiUserToUserData } from "./api/auth";
import { hasToken } from "./api/client";

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
    if (!uuid || !hasToken()) {
      return set({ user: null, isLoading: false });
    }

    try {
      const apiUser = await getMe();
      const userWithId = mapApiUserToUserData(apiUser);
      set({ user: userWithId, isLoading: false });
    } catch {
      set({ user: null, isLoading: false });
    }
  },
}));
