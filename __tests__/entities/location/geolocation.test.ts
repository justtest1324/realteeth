import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useCurrentLocation } from '@/entities/location';

describe('useCurrentLocation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return loading status initially when geolocation is available', () => {
    const mockGeolocation = {
      getCurrentPosition: vi.fn(),
    };
    vi.stubGlobal('navigator', { geolocation: mockGeolocation });

    const { result } = renderHook(() => useCurrentLocation());

    // Hook immediately starts fetching on mount
    expect(result.current.status).toBe('loading');
    expect(result.current.coords).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('should return loading status while fetching location', () => {
    const mockGeolocation = {
      getCurrentPosition: vi.fn((success) => {
        // Simulate delayed response
        setTimeout(() => {
          success({
            coords: {
              latitude: 37.5665,
              longitude: 126.9780,
            },
          });
        }, 100);
      }),
    };
    vi.stubGlobal('navigator', { geolocation: mockGeolocation });

    const { result } = renderHook(() => useCurrentLocation());

    expect(result.current.status).toBe('loading');
  });

  it('should successfully return coordinates on geolocation success', async () => {
    const mockGeolocation = {
      getCurrentPosition: vi.fn((success) => {
        success({
          coords: {
            latitude: 37.5665,
            longitude: 126.9780,
          },
        });
      }),
    };
    vi.stubGlobal('navigator', { geolocation: mockGeolocation });

    const { result } = renderHook(() => useCurrentLocation());

    await waitFor(() => {
      expect(result.current.status).toBe('success');
    });

    expect(result.current.coords).toEqual({ lat: 37.5665, lon: 126.9780 });
    expect(result.current.error).toBeNull();
    expect(mockGeolocation.getCurrentPosition).toHaveBeenCalledTimes(1);
  });

  it('should handle permission denied error', async () => {
    const mockGeolocation = {
      getCurrentPosition: vi.fn((success, error) => {
        error({
          code: 1, // PERMISSION_DENIED
          message: 'User denied geolocation',
          PERMISSION_DENIED: 1,
        });
      }),
    };
    vi.stubGlobal('navigator', { geolocation: mockGeolocation });

    const { result } = renderHook(() => useCurrentLocation());

    await waitFor(() => {
      expect(result.current.status).toBe('error');
    });

    expect(result.current.coords).toBeNull();
    expect(result.current.error).toBe('위치 권한이 거부되었습니다');
  });

  it('should handle position unavailable error', async () => {
    const mockGeolocation = {
      getCurrentPosition: vi.fn((success, error) => {
        error({
          code: 2, // POSITION_UNAVAILABLE
          message: 'Position unavailable',
          POSITION_UNAVAILABLE: 2,
        });
      }),
    };
    vi.stubGlobal('navigator', { geolocation: mockGeolocation });

    const { result } = renderHook(() => useCurrentLocation());

    await waitFor(() => {
      expect(result.current.status).toBe('error');
    });

    expect(result.current.coords).toBeNull();
    expect(result.current.error).toBe('위치 정보를 사용할 수 없습니다');
  });

  it('should handle timeout error', async () => {
    const mockGeolocation = {
      getCurrentPosition: vi.fn((success, error) => {
        error({
          code: 3, // TIMEOUT
          message: 'Timeout',
          TIMEOUT: 3,
        });
      }),
    };
    vi.stubGlobal('navigator', { geolocation: mockGeolocation });

    const { result } = renderHook(() => useCurrentLocation());

    await waitFor(() => {
      expect(result.current.status).toBe('error');
    });

    expect(result.current.coords).toBeNull();
    expect(result.current.error).toBe('위치 요청 시간이 초과되었습니다');
  });

  it('should handle geolocation not available', () => {
    vi.stubGlobal('navigator', {});

    const { result } = renderHook(() => useCurrentLocation());

    expect(result.current.status).toBe('error');
    expect(result.current.coords).toBeNull();
    expect(result.current.error).toBe('위치 서비스를 지원하지 않는 브라우저입니다');
  });

  it('should provide retry function that re-fetches location', async () => {
    let callCount = 0;
    const mockGeolocation = {
      getCurrentPosition: vi.fn((success, error) => {
        callCount++;
        if (callCount === 1) {
          error({
            code: 3,
            message: 'Timeout',
            TIMEOUT: 3,
          });
        } else {
          success({
            coords: {
              latitude: 37.5665,
              longitude: 126.9780,
            },
          });
        }
      }),
    };
    vi.stubGlobal('navigator', { geolocation: mockGeolocation });

    const { result } = renderHook(() => useCurrentLocation());

    await waitFor(() => {
      expect(result.current.status).toBe('error');
    });

    // Retry
    result.current.retry();

    await waitFor(() => {
      expect(result.current.status).toBe('success');
    });

    expect(result.current.coords).toEqual({ lat: 37.5665, lon: 126.9780 });
    expect(mockGeolocation.getCurrentPosition).toHaveBeenCalledTimes(2);
  });
});
