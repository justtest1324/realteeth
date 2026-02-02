import type { OpenWeatherResponse, WeatherData } from '../types';

export function transformWeatherResponse(data: OpenWeatherResponse): WeatherData {
  return {
    current: {
      temp: data.current.temp,
      description: data.current.weather[0]?.description || '',
      icon: data.current.weather[0]?.icon || '',
    },
    today: {
      min: data.daily[0]?.temp.min || 0,
      max: data.daily[0]?.temp.max || 0,
    },
    hourly: data.hourly.slice(0, 24).map((hour) => ({
      time: new Date(hour.dt * 1000).toISOString(),
      temp: hour.temp,
      icon: hour.weather[0]?.icon || '',
    })),
  };
}
