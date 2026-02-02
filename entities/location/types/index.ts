// Location types exports

export interface GeoLocation {
  lat: number;
  lon: number;
  name: string;
}

export interface GeocodingResponse {
  name: string;
  local_names?: Record<string, string>;
  lat: number;
  lon: number;
  country: string;
  state?: string;
}

export interface GeocodingErrorResponse {
  error: 'NOT_FOUND' | 'MISSING_QUERY' | 'API_ERROR' | 'INTERNAL_ERROR';
}

export type Coordinates = {
  lat: number;
  lon: number;
};

export type GeolocationStatus = 'idle' | 'loading' | 'success' | 'error';

export type GeolocationState = {
  status: GeolocationStatus;
  coords: Coordinates | null;
  error: string | null;
};

export type District = string;

export interface DistrictSearchResult {
  districts: District[];
  hasMore: boolean;
}
