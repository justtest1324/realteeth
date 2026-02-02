export interface WeatherCurrent {
  temp: number;
  description: string;
  icon: string;
}

export interface WeatherToday {
  min: number;
  max: number;
}

export interface WeatherHourly {
  time: string;
  temp: number;
  icon: string;
}

export interface WeatherData {
  current: WeatherCurrent;
  today: WeatherToday;
  hourly: WeatherHourly[];
}

export interface WeatherErrorResponse {
  error: 'NOT_FOUND' | 'MISSING_COORDINATES' | 'API_ERROR' | 'INTERNAL_ERROR';
}

// OpenWeatherMap API response types
export interface OpenWeatherCurrentResponse {
  temp: number;
  weather: Array<{
    description: string;
    icon: string;
  }>;
}

export interface OpenWeatherDailyResponse {
  temp: {
    min: number;
    max: number;
  };
}

export interface OpenWeatherHourlyResponse {
  dt: number;
  temp: number;
  weather: Array<{
    icon: string;
  }>;
}

export interface OpenWeatherResponse {
  current: OpenWeatherCurrentResponse;
  daily: OpenWeatherDailyResponse[];
  hourly: OpenWeatherHourlyResponse[];
}
