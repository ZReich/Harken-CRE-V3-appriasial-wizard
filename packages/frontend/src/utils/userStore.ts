import { create } from 'zustand';
import { StateCreator } from 'zustand';

interface UserState {
  id: string | null;
  setId: (id: string) => void;
}

export const useUserStore = create<UserState>(
  (set: Parameters<StateCreator<UserState>>[0]) => ({
    id: null,
    setId: (id: string) => set({ id }),
  })
);
