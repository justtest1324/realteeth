import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from '@/app/api/geocode/route';

describe('Geocoding API Route', () => {
  const mockApiKey = 'test-api-key';
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetAllMocks();
    process.env = { ...originalEnv, OPENWEATHERMAP_API_KEY: mockApiKey };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should return geocoded location with lat, lon, and name on success', async () => {
    const mockGeoResponse = [
      {
        name: 'Cheongwun-dong',
        local_names: { ko: '청운동' },
        lat: 37.5915,
        lon: 126.9684,
        country: 'KR',
      },
    ];

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockGeoResponse,
    } as Response);

    const request = new NextRequest('http://localhost:3000/api/geocode?q=서울특별시-종로구-청운동');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({
      lat: 37.5915,
      lon: 126.9684,
      name: 'Cheongwun-dong',
    });

    // First query should be the most specific
    expect(global.fetch).toHaveBeenCalled();
    const calledUrl = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][0] as string;
    expect(calledUrl).toContain('api.openweathermap.org/geo/1.0/direct');
    expect(calledUrl).toContain(`appid=${mockApiKey}`);
  });

  it('should return NOT_FOUND error when all geocoding attempts return no results', async () => {
    // All attempts return empty results
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [],
    } as Response);

    const request = new NextRequest('http://localhost:3000/api/geocode?q=InvalidPlace');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data).toEqual({ error: 'NOT_FOUND' });
  });

  it('should return 400 error when query parameter is missing', async () => {
    const request = new NextRequest('http://localhost:3000/api/geocode');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({ error: 'MISSING_QUERY' });
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('should try fallback queries when first attempt fails', async () => {
    const mockGeoResponse = [
      {
        name: 'Daejeon',
        lat: 36.3496,
        lon: 127.3848,
        country: 'KR',
      },
    ];

    // First attempts return empty, last one succeeds
    global.fetch = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => [] } as Response)
      .mockResolvedValueOnce({ ok: true, json: async () => [] } as Response)
      .mockResolvedValueOnce({ ok: true, json: async () => [] } as Response)
      .mockResolvedValueOnce({ ok: true, json: async () => mockGeoResponse } as Response);

    const request = new NextRequest('http://localhost:3000/api/geocode?q=대전광역시-서구-가수원동');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({
      lat: 36.3496,
      lon: 127.3848,
      name: 'Daejeon',
    });
  });

  it('should return NOT_FOUND when all fallback attempts fail', async () => {
    // All attempts return empty or fail
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
    } as Response);

    const request = new NextRequest('http://localhost:3000/api/geocode?q=서울특별시-종로구-청운동');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data).toEqual({ error: 'NOT_FOUND' });
  });
});
