import { create } from 'zustand';

export type ContactFilter = 'all' | 'due' | 'archived';

type AppState = {
  filter: ContactFilter;
  searchQuery: string;
  setFilter: (filter: ContactFilter) => void;
  setSearchQuery: (query: string) => void;
};

export const useAppStore = create<AppState>((set) => ({
  filter: 'all',
  searchQuery: '',
  setFilter: (filter) => set({ filter }),
  setSearchQuery: (query) => set({ searchQuery: query }),
}));
