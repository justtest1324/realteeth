'use client';

import { useFavorites } from '@/features/favorites';
import { FavoriteCard } from './FavoriteCard';

export function FavoriteListWidget() {
  const { favorites, isHydrated } = useFavorites();

  if (!isHydrated) {
    return null;
  }

  if (favorites.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          즐겨찾기한 지역이 없습니다
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          지역을 검색하고 ⭐를 눌러 즐겨찾기에 추가하세요
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {favorites.map((favorite) => (
        <FavoriteCard key={favorite.placeId} favorite={favorite} />
      ))}
    </div>
  );
}
