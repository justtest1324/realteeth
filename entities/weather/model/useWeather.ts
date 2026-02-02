import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/shared/constants/queryKeys';
import type { WeatherData } from '../types';

async function fetchWeather(lat: number, lon: number): Promise<WeatherData> {
  const response = await fetch(`/api/weather?lat=${lat}&lon=${lon}`);
  
  if (!response.ok) {
    throw new Error(`Weather fetch failed: ${response.status}`);
  }
  
  return response.json();
}

export function useWeather(lat: number | null, lon: number | null) {
  return useQuery({
    queryKey: queryKeys.weather.current(lat ?? 0, lon ?? 0),
    queryFn: () => fetchWeather(lat!, lon!),
    enabled: lat !== null && lon !== null,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}
