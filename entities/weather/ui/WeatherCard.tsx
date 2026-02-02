'use client';

import { Card, CardContent } from '@/shared/ui/card';
import { Skeleton } from '@/shared/ui/skeleton';
import { ERROR_MESSAGES } from '@/shared/constants/messages';
import { WeatherIcon } from './WeatherIcon';
import type { WeatherData } from '../types';

interface WeatherCardProps {
  weather: WeatherData | undefined;
  isLoading: boolean;
  error?: Error | null;
  noData?: boolean;
}

export function WeatherCard({ weather, isLoading, error, noData }: WeatherCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <div className="mt-4">
            <Skeleton className="h-4 w-40" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (noData || (!weather && !error)) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground text-center py-4">
            {ERROR_MESSAGES.NO_DATA}
          </p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground text-center py-4">
            {ERROR_MESSAGES.NETWORK_ERROR}
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!weather) {
    return null;
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-4">
          <WeatherIcon icon={weather.current.icon} size={64} />
          <div>
            <div className="text-5xl font-bold">
              {Math.round(weather.current.temp)}°
            </div>
            <div className="text-lg text-muted-foreground capitalize">
              {weather.current.description}
            </div>
          </div>
        </div>
        <div className="mt-4 text-muted-foreground">
          최저 <span className="text-blue-500">{Math.round(weather.today.min)}°</span> / 최고 <span className="text-red-500">{Math.round(weather.today.max)}°</span>
        </div>
      </CardContent>
    </Card>
  );
}
