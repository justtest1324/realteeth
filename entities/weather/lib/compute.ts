import type { WeatherHourly, WeatherToday } from '../types';

export function computeTodayMinMax(hourly: WeatherHourly[]): WeatherToday {
  if (hourly.length === 0) {
    return { min: 0, max: 0 };
  }

  const temps = hourly.map((h) => h.temp);
  return {
    min: Math.min(...temps),
    max: Math.max(...temps),
  };
}
