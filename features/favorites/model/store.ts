import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Favorite } from '../types';
import { MAX_FAVORITES } from '../types';

interface FavoritesState {
  favorites: Favorite[];
  addFavorite: (favorite: Omit<Favorite, 'addedAt'>) => void;
  removeFavorite: (placeId: string) => void;
  updateAlias: (placeId: string, displayName: string) => void;
  isFavorite: (placeId: string) => boolean;
  clearAll: () => void;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],

      addFavorite: (favorite) => {
        const { favorites } = get();

        // Check if already exists
        if (favorites.some((f) => f.placeId === favorite.placeId)) {
          return;
        }

        // Check max capacity
        if (favorites.length >= MAX_FAVORITES) {
          return;
        }

        // Add with timestamp
        const newFavorite: Favorite = {
          ...favorite,
          addedAt: Date.now(),
        };

        set({ favorites: [...favorites, newFavorite] });
      },

      removeFavorite: (placeId) => {
        set((state) => ({
          favorites: state.favorites.filter((f) => f.placeId !== placeId),
        }));
      },

      updateAlias: (placeId, displayName) => {
        set((state) => ({
          favorites: state.favorites.map((f) =>
            f.placeId === placeId ? { ...f, displayName } : f
          ),
        }));
      },

      isFavorite: (placeId) => {
        return get().favorites.some((f) => f.placeId === placeId);
      },

      clearAll: () => {
        set({ favorites: [] });
      },
    }),
    {
      name: 'favorites-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
