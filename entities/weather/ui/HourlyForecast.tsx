'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Skeleton } from '@/shared/ui/skeleton';
import { ScrollArea, ScrollBar } from '@/shared/ui/scroll-area';
import { WeatherIcon } from './WeatherIcon';
import type { WeatherHourly } from '../types';

interface HourlyForecastProps {
  hourly: WeatherHourly[] | undefined;
  isLoading: boolean;
}

function formatHour(isoString: string): string {
  const date = new Date(isoString);
  const hour = date.getHours();
  return `${hour}시`;
}

export function HourlyForecast({ hourly, isLoading }: HourlyForecastProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>시간별 예보</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <Skeleton className="h-4 w-8" />
                <Skeleton className="h-10 w-10 rounded-full" />
                <Skeleton className="h-4 w-8" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!hourly || hourly.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>시간별 예보</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex gap-6 pb-2">
            {hourly.map((hour, index) => (
              <div
                key={index}
                className="flex flex-col items-center gap-1 min-w-[60px]"
              >
                <span className="text-sm text-muted-foreground">
                  {index === 0 ? '지금' : formatHour(hour.time)}
                </span>
                <WeatherIcon icon={hour.icon} size={40} />
                <span className="font-medium">{Math.round(hour.temp)}°</span>
              </div>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
