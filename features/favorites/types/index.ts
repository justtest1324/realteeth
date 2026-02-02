export interface Favorite {
  placeId: string;        // encodeURIComponent(fullName)
  fullName: string;       // "서울특별시-종로구-청운동"
  displayName: string;    // alias or last part of fullName
  lat?: number;           // cached coordinates
  lon?: number;
  addedAt: number;        // timestamp
}

export const MAX_FAVORITES = 6;
