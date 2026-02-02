import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '@/app/api/weather/route';
import { NextRequest } from 'next/server';

describe('Weather API Route', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    process.env.OPENWEATHERMAP_API_KEY = 'test-api-key';
  });

  it('should return 400 when lat parameter is missing', async () => {
    const request = new NextRequest('http://localhost:3000/api/weather?lon=127.024612');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({ error: 'MISSING_COORDINATES' });
  });

  it('should return 400 when lon parameter is missing', async () => {
    const request = new NextRequest('http://localhost:3000/api/weather?lat=37.532600');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({ error: 'MISSING_COORDINATES' });
  });

  it('should return 500 when OPENWEATHERMAP_API_KEY is not set', async () => {
    delete process.env.OPENWEATHERMAP_API_KEY;
    const request = new NextRequest('http://localhost:3000/api/weather?lat=37.532600&lon=127.024612');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ error: 'INTERNAL_ERROR' });
  });

  it('should return 500 when API request fails', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
    });

    const request = new NextRequest('http://localhost:3000/api/weather?lat=37.532600&lon=127.024612');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ error: 'API_ERROR' });
  });

  it('should return 404 with NOT_FOUND when API returns no data', async () => {
    global.fetch = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ main: null, weather: [] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ list: [] }),
      });

    const request = new NextRequest('http://localhost:3000/api/weather?lat=37.532600&lon=127.024612');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data).toEqual({ error: 'NOT_FOUND' });
  });

  it('should return weather data with current temp, min/max, and hourly temps', async () => {
    const mockCurrentResponse = {
      main: {
        temp: 12.5,
        temp_min: 10.0,
        temp_max: 15.0,
      },
      weather: [
        {
          description: 'clear sky',
          icon: '01d',
        },
      ],
    };

    const mockForecastResponse = {
      list: [
        {
          dt: 1706745600,
          main: { temp: 11.5, temp_min: 9.0, temp_max: 14.0 },
          weather: [{ icon: '01d' }],
          dt_txt: new Date().toISOString().split('T')[0] + ' 12:00:00',
        },
        {
          dt: 1706749200,
          main: { temp: 13.5, temp_min: 11.0, temp_max: 16.0 },
          weather: [{ icon: '02d' }],
          dt_txt: new Date().toISOString().split('T')[0] + ' 15:00:00',
        },
      ],
    };

    global.fetch = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockCurrentResponse,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockForecastResponse,
      });

    const request = new NextRequest('http://localhost:3000/api/weather?lat=37.532600&lon=127.024612');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty('current');
    expect(data.current).toHaveProperty('temp');
    expect(data.current).toHaveProperty('description');
    expect(data.current).toHaveProperty('icon');
    expect(data).toHaveProperty('today');
    expect(data.today).toHaveProperty('min');
    expect(data.today).toHaveProperty('max');
    expect(data).toHaveProperty('hourly');
    expect(Array.isArray(data.hourly)).toBe(true);
    expect(data.hourly[0]).toHaveProperty('time');
    expect(data.hourly[0]).toHaveProperty('temp');
    expect(data.hourly[0]).toHaveProperty('icon');
  });
});
