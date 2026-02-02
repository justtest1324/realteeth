import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useFavoritesStore } from '@features/favorites/model/store';
import type { Favorite } from '@features/favorites/types';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('Favorites Store', () => {
  beforeEach(() => {
    localStorageMock.clear();
    // Reset store to initial state
    useFavoritesStore.setState({ favorites: [] });
  });

  describe('addFavorite', () => {
    it('should add a favorite to the list', () => {
      const store = useFavoritesStore.getState();
      const favorite: Omit<Favorite, 'addedAt'> = {
        placeId: encodeURIComponent('서울특별시-종로구-청운동'),
        fullName: '서울특별시-종로구-청운동',
        displayName: '청운동',
        lat: 37.5665,
        lon: 126.978,
      };

      store.addFavorite(favorite);

      const state = useFavoritesStore.getState();
      expect(state.favorites).toHaveLength(1);
      expect(state.favorites[0]).toMatchObject(favorite);
      expect(state.favorites[0].addedAt).toBeDefined();
      expect(typeof state.favorites[0].addedAt).toBe('number');
    });

    it('should prevent duplicate favorites with same placeId', () => {
      const store = useFavoritesStore.getState();
      const favorite: Omit<Favorite, 'addedAt'> = {
        placeId: encodeURIComponent('서울특별시-종로구-청운동'),
        fullName: '서울특별시-종로구-청운동',
        displayName: '청운동',
      };

      store.addFavorite(favorite);
      store.addFavorite(favorite); // Try to add duplicate

      const state = useFavoritesStore.getState();
      expect(state.favorites).toHaveLength(1);
    });

    it('should reject when at maximum capacity (6 favorites)', () => {
      const store = useFavoritesStore.getState();

      // Add 6 favorites
      for (let i = 0; i < 6; i++) {
        store.addFavorite({
          placeId: `place-${i}`,
          fullName: `서울특별시-구-동${i}`,
          displayName: `동${i}`,
        });
      }

      expect(useFavoritesStore.getState().favorites).toHaveLength(6);

      // Try to add 7th
      store.addFavorite({
        placeId: 'place-7',
        fullName: '서울특별시-구-동7',
        displayName: '동7',
      });

      // Should still be 6
      expect(useFavoritesStore.getState().favorites).toHaveLength(6);
    });
  });

  describe('removeFavorite', () => {
    it('should remove a favorite by placeId', () => {
      const store = useFavoritesStore.getState();
      const placeId = encodeURIComponent('서울특별시-종로구-청운동');

      store.addFavorite({
        placeId,
        fullName: '서울특별시-종로구-청운동',
        displayName: '청운동',
      });

      expect(useFavoritesStore.getState().favorites).toHaveLength(1);

      store.removeFavorite(placeId);

      expect(useFavoritesStore.getState().favorites).toHaveLength(0);
    });

    it('should not error when removing non-existent favorite', () => {
      const store = useFavoritesStore.getState();

      expect(() => {
        store.removeFavorite('non-existent');
      }).not.toThrow();
    });
  });

  describe('updateAlias', () => {
    it('should update the displayName of a favorite', () => {
      const store = useFavoritesStore.getState();
      const placeId = encodeURIComponent('서울특별시-종로구-청운동');

      store.addFavorite({
        placeId,
        fullName: '서울특별시-종로구-청운동',
        displayName: '청운동',
      });

      store.updateAlias(placeId, '우리집');

      const state = useFavoritesStore.getState();
      expect(state.favorites[0].displayName).toBe('우리집');
    });

    it('should not error when updating non-existent favorite', () => {
      const store = useFavoritesStore.getState();

      expect(() => {
        store.updateAlias('non-existent', 'new-alias');
      }).not.toThrow();
    });
  });

  describe('isFavorite', () => {
    it('should return true for existing favorite', () => {
      const store = useFavoritesStore.getState();
      const placeId = encodeURIComponent('서울특별시-종로구-청운동');

      store.addFavorite({
        placeId,
        fullName: '서울특별시-종로구-청운동',
        displayName: '청운동',
      });

      expect(store.isFavorite(placeId)).toBe(true);
    });

    it('should return false for non-existent favorite', () => {
      const store = useFavoritesStore.getState();

      expect(store.isFavorite('non-existent')).toBe(false);
    });
  });

  describe('clearAll', () => {
    it('should clear all favorites', () => {
      const store = useFavoritesStore.getState();

      store.addFavorite({
        placeId: 'place-1',
        fullName: '서울특별시-구-동1',
        displayName: '동1',
      });
      store.addFavorite({
        placeId: 'place-2',
        fullName: '서울특별시-구-동2',
        displayName: '동2',
      });

      expect(useFavoritesStore.getState().favorites).toHaveLength(2);

      store.clearAll();

      expect(useFavoritesStore.getState().favorites).toHaveLength(0);
    });
  });

  describe('localStorage persistence', () => {
    it('should persist favorites to localStorage on add', async () => {
      // Reset and force hydration
      vi.resetModules();
      const { useFavoritesStore: freshStore } = await import('@features/favorites/model/store');

      const store = freshStore.getState();
      const favorite: Omit<Favorite, 'addedAt'> = {
        placeId: 'test-place',
        fullName: '서울특별시-종로구-청운동',
        displayName: '청운동',
      };

      store.addFavorite(favorite);

      // Wait for persist middleware to write to localStorage
      await new Promise((resolve) => setTimeout(resolve, 100));

      const stored = localStorageMock.getItem('favorites-storage');
      expect(stored).toBeTruthy();

      const parsed = JSON.parse(stored!);
      expect(parsed.state.favorites).toHaveLength(1);
    });

    it('should persist favorites to localStorage on remove', async () => {
      // Reset and force hydration
      vi.resetModules();
      const { useFavoritesStore: freshStore } = await import('@features/favorites/model/store');

      const store = freshStore.getState();
      const placeId = 'test-place';

      store.addFavorite({
        placeId,
        fullName: '서울특별시-종로구-청운동',
        displayName: '청운동',
      });

      // Wait for persist
      await new Promise((resolve) => setTimeout(resolve, 100));

      store.removeFavorite(placeId);

      // Wait for persist
      await new Promise((resolve) => setTimeout(resolve, 100));

      const stored = localStorageMock.getItem('favorites-storage');
      expect(stored).toBeTruthy();

      const parsed = JSON.parse(stored!);
      expect(parsed.state.favorites).toHaveLength(0);
    });

    it('should hydrate from localStorage on initialization', async () => {
      // Clear current store
      localStorageMock.clear();

      // Manually set localStorage
      const favorites: Favorite[] = [
        {
          placeId: 'place-1',
          fullName: '서울특별시-종로구-청운동',
          displayName: '청운동',
          addedAt: Date.now(),
        },
      ];

      localStorageMock.setItem(
        'favorites-storage',
        JSON.stringify({
          state: { favorites },
          version: 0,
        })
      );

      // Delete module from cache and reimport to trigger hydration
      vi.resetModules();
      const { useFavoritesStore: newStore } = await import('@features/favorites/model/store');

      // Give time for hydration
      await new Promise((resolve) => setTimeout(resolve, 100));

      const state = newStore.getState();
      expect(state.favorites).toHaveLength(1);
      expect(state.favorites[0].placeId).toBe('place-1');
    });
  });
});
