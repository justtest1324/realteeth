import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@shared/constants/queryKeys';
import type { GeoLocation, GeocodingErrorResponse } from '../types';

async function fetchGeocode(districtName: string): Promise<GeoLocation> {
  const response = await fetch(`/api/geocode?q=${encodeURIComponent(districtName)}`);

  if (!response.ok) {
    const errorData: GeocodingErrorResponse = await response.json();
    throw new Error(errorData.error);
  }

  return response.json();
}

export function useGeocode(districtName: string | null) {
  return useQuery({
    queryKey: queryKeys.geocode(districtName || ''),
    queryFn: () => fetchGeocode(districtName!),
    enabled: !!districtName,
    staleTime: Infinity, // Coordinates for a district never change
    gcTime: 1000 * 60 * 60 * 24, // Cache for 24 hours
    retry: 1,
  });
}
