import { NextRequest, NextResponse } from 'next/server';
import type { WeatherData, WeatherErrorResponse } from '@/entities/weather/types';

interface CurrentWeatherAPIResponse {
  main: {
    temp: number;
    temp_min: number;
    temp_max: number;
  };
  weather: Array<{
    description: string;
    icon: string;
  }>;
}

interface ForecastAPIResponse {
  list: Array<{
    dt: number;
    main: {
      temp: number;
      temp_min: number;
      temp_max: number;
    };
    weather: Array<{
      icon: string;
    }>;
    dt_txt: string;
  }>;
}

function getTodayMinMax(forecast: ForecastAPIResponse, currentMin: number, currentMax: number): { min: number; max: number } {
  const today = new Date().toISOString().split('T')[0];

  let min = currentMin;
  let max = currentMax;

  for (const item of forecast.list) {
    const itemDate = item.dt_txt.split(' ')[0];
    if (itemDate === today) {
      min = Math.min(min, item.main.temp_min);
      max = Math.max(max, item.main.temp_max);
    }
  }

  return { min, max };
}

export async function GET(request: NextRequest): Promise<NextResponse<WeatherData | WeatherErrorResponse>> {
  try {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get('lat');
    const lon = searchParams.get('lon');

    if (!lat || !lon) {
      return NextResponse.json(
        { error: 'MISSING_COORDINATES' },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENWEATHERMAP_API_KEY;
    if (!apiKey) {
      console.error('OPENWEATHERMAP_API_KEY is not set');
      return NextResponse.json(
        { error: 'INTERNAL_ERROR' },
        { status: 500 }
      );
    }

    // Fetch current weather and forecast in parallel
    const [currentResponse, forecastResponse] = await Promise.all([
      fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=kr`),
      fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=kr&cnt=24`)
    ]);

    if (!currentResponse.ok || !forecastResponse.ok) {
      console.error(`OpenWeatherMap API error: current=${currentResponse.status}, forecast=${forecastResponse.status}`);
      return NextResponse.json(
        { error: 'API_ERROR' },
        { status: 500 }
      );
    }

    const currentData: CurrentWeatherAPIResponse = await currentResponse.json();
    const forecastData: ForecastAPIResponse = await forecastResponse.json();

    // Check if we have valid weather data
    if (!currentData.main || !currentData.weather || currentData.weather.length === 0) {
      return NextResponse.json(
        { error: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    // Calculate today's min/max from forecast
    const todayMinMax = getTodayMinMax(forecastData, currentData.main.temp_min, currentData.main.temp_max);

    // Transform to our format
    const weatherData: WeatherData = {
      current: {
        temp: currentData.main.temp,
        description: currentData.weather[0]?.description || '',
        icon: currentData.weather[0]?.icon || '',
      },
      today: todayMinMax,
      hourly: forecastData.list.slice(0, 8).map((item) => ({
        time: new Date(item.dt * 1000).toISOString(),
        temp: item.main.temp,
        icon: item.weather[0]?.icon || '',
      })),
    };

    return NextResponse.json(weatherData);
  } catch (error) {
    console.error('Weather API error:', error);
    return NextResponse.json(
      { error: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
