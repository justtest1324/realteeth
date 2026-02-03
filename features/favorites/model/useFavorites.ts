import { useEffect, useState } from "react";
import { useFavoritesStore } from "./store";

/**
 * Convenience hook for using favorites store with SSR hydration handling
 */
export function useFavorites() {
  const [isHydrated, setIsHydrated] = useState(false);

  const favorites = useFavoritesStore((state) => state.favorites);
  const addFavorite = useFavoritesStore((state) => state.addFavorite);
  const removeFavorite = useFavoritesStore((state) => state.removeFavorite);
  const updateAlias = useFavoritesStore((state) => state.updateAlias);
  const isFavorite = useFavoritesStore((state) => state.isFavorite);
  const clearAll = useFavoritesStore((state) => state.clearAll);

  useEffect(() => {
    queueMicrotask(() => setIsHydrated(true));
  }, []);

  return {
    favorites: isHydrated ? favorites : [],
    addFavorite,
    removeFavorite,
    updateAlias,
    isFavorite,
    clearAll,
    isHydrated,
  };
}
