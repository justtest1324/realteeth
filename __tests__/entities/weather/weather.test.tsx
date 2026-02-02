import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useWeather } from '@/entities/weather/model/useWeather';
import { transformWeatherResponse } from '@/entities/weather/lib/transform';
import { computeTodayMinMax } from '@/entities/weather/lib/compute';
import type { OpenWeatherResponse } from '@/entities/weather/types';

// Wrapper for React Query
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('Weather Entity', () => {
  describe('transformWeatherResponse', () => {
    it('should transform OpenWeather API response to domain model', () => {
      const apiResponse: OpenWeatherResponse = {
        current: {
          temp: 285.5,
          weather: [
            {
              description: 'clear sky',
              icon: '01d',
            },
          ],
        },
        daily: [
          {
            temp: {
              min: 280.15,
              max: 290.15,
            },
          },
        ],
        hourly: [
          {
            dt: 1706745600,
            temp: 283.5,
            weather: [{ icon: '01d' }],
          },
          {
            dt: 1706749200,
            temp: 284.5,
            weather: [{ icon: '02d' }],
          },
        ],
      };

      const result = transformWeatherResponse(apiResponse);

      expect(result.current.temp).toBe(285.5);
      expect(result.current.description).toBe('clear sky');
      expect(result.current.icon).toBe('01d');
      expect(result.today.min).toBe(280.15);
      expect(result.today.max).toBe(290.15);
      expect(result.hourly).toHaveLength(2);
      expect(result.hourly[0].temp).toBe(283.5);
      expect(result.hourly[0].icon).toBe('01d');
    });

    it('should handle missing weather data gracefully', () => {
      const apiResponse: OpenWeatherResponse = {
        current: {
          temp: 285.5,
          weather: [],
        },
        daily: [],
        hourly: [],
      };

      const result = transformWeatherResponse(apiResponse);

      expect(result.current.description).toBe('');
      expect(result.current.icon).toBe('');
      expect(result.today.min).toBe(0);
      expect(result.today.max).toBe(0);
      expect(result.hourly).toHaveLength(0);
    });

    it('should limit hourly data to 24 entries', () => {
      const hourlyData = Array.from({ length: 48 }, (_, i) => ({
        dt: 1706745600 + i * 3600,
        temp: 280 + i,
        weather: [{ icon: '01d' }],
      }));

      const apiResponse: OpenWeatherResponse = {
        current: {
          temp: 285.5,
          weather: [{ description: 'clear', icon: '01d' }],
        },
        daily: [{ temp: { min: 280, max: 290 } }],
        hourly: hourlyData,
      };

      const result = transformWeatherResponse(apiResponse);

      expect(result.hourly).toHaveLength(24);
    });
  });

  describe('computeTodayMinMax', () => {
    it('should compute min and max from hourly temperatures', () => {
      const hourly = [
        { time: '2024-01-01T00:00:00Z', temp: 10, icon: '01d' },
        { time: '2024-01-01T01:00:00Z', temp: 15, icon: '01d' },
        { time: '2024-01-01T02:00:00Z', temp: 8, icon: '01d' },
        { time: '2024-01-01T03:00:00Z', temp: 20, icon: '01d' },
      ];

      const result = computeTodayMinMax(hourly);

      expect(result.min).toBe(8);
      expect(result.max).toBe(20);
    });

    it('should return 0 for empty array', () => {
      const result = computeTodayMinMax([]);

      expect(result.min).toBe(0);
      expect(result.max).toBe(0);
    });

    it('should handle single temperature', () => {
      const hourly = [
        { time: '2024-01-01T00:00:00Z', temp: 15, icon: '01d' },
      ];

      const result = computeTodayMinMax(hourly);

      expect(result.min).toBe(15);
      expect(result.max).toBe(15);
    });
  });

  describe('useWeather hook', () => {
    beforeEach(() => {
      vi.resetAllMocks();
    });

    it('should return loading state initially', () => {
      const { result } = renderHook(() => useWeather(37.5326, 127.0246), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBe(true);
      expect(result.current.data).toBeUndefined();
      expect(result.current.error).toBeNull();
    });

    it('should fetch and return weather data', async () => {
      const mockWeatherData = {
        current: {
          temp: 285.5,
          description: 'clear sky',
          icon: '01d',
        },
        today: {
          min: 280.15,
          max: 290.15,
        },
        hourly: [
          {
            time: '2024-01-01T00:00:00Z',
            temp: 283.5,
            icon: '01d',
          },
        ],
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockWeatherData,
      });

      const { result } = renderHook(() => useWeather(37.5326, 127.0246), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockWeatherData);
      expect(result.current.isLoading).toBe(false);
    });

    it('should handle API errors', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
      });

      const { result } = renderHook(() => useWeather(37.5326, 127.0246), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.data).toBeUndefined();
      expect(result.current.error).toBeTruthy();
    });

    it('should not fetch when coordinates are null', () => {
      const fetchSpy = vi.spyOn(global, 'fetch');

      renderHook(() => useWeather(null, null), {
        wrapper: createWrapper(),
      });

      expect(fetchSpy).not.toHaveBeenCalled();
    });
  });
});
