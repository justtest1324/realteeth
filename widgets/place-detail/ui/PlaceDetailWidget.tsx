'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Heart, Star } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Skeleton } from '@/shared/ui/skeleton';
import { useGeocode } from '@/entities/location';
import { useWeather, WeatherCard, HourlyForecast } from '@/entities/weather';
import { useFavorites } from '@/features/favorites';
import { MAX_FAVORITES } from '@/features/favorites/types';

interface PlaceDetailWidgetProps {
  placeId: string;
}

export function PlaceDetailWidget({ placeId }: PlaceDetailWidgetProps) {
  const router = useRouter();
  const fullName = decodeURIComponent(placeId);
  const displayName = fullName.split('-').pop() || fullName;

  const { favorites, addFavorite, removeFavorite, isFavorite, isHydrated } = useFavorites();
  const isCurrentFavorite = isHydrated && isFavorite(placeId);
  const canAddFavorite = favorites.length < MAX_FAVORITES;

  const { data: geoData, isLoading: geoLoading, error: geoError } = useGeocode(fullName);

  const { data: weather, isLoading: weatherLoading, error: weatherError } = useWeather(
    geoData?.lat ?? null,
    geoData?.lon ?? null
  );

  const handleBack = React.useCallback(() => {
    router.back();
  }, [router]);

  const handleToggleFavorite = React.useCallback(() => {
    if (isCurrentFavorite) {
      removeFavorite(placeId);
    } else if (canAddFavorite && geoData) {
      addFavorite({
        placeId,
        fullName,
        displayName,
        lat: geoData.lat,
        lon: geoData.lon,
      });
    }
  }, [isCurrentFavorite, canAddFavorite, geoData, placeId, fullName, displayName, addFavorite, removeFavorite]);

  if (geoError) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white dark:from-gray-900 dark:to-gray-950">
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="mb-6 group cursor-pointer hover:bg-accent/80 transition-all duration-200"
          >
            <ArrowLeft className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
            뒤로
          </Button>
          <div className="text-center py-12">
            <p className="text-muted-foreground">해당 지역을 찾을 수 없습니다</p>
            <Button variant="link" onClick={handleBack} className="mt-4">
              홈으로 돌아가기
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white dark:from-gray-900 dark:to-gray-950">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="group cursor-pointer hover:bg-accent/80 transition-all duration-200"
          >
            <ArrowLeft className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
            뒤로
          </Button>
          {isHydrated && (
            <Button
              variant={isCurrentFavorite ? 'default' : 'outline'}
              onClick={handleToggleFavorite}
              disabled={!isCurrentFavorite && !canAddFavorite}
              className="cursor-pointer hover:scale-105 transition-transform duration-200"
            >
              {isCurrentFavorite ? (
                <>
                  <Star className="h-4 w-4 mr-2 fill-current" />
                  즐겨찾기 해제
                </>
              ) : (
                <>
                  <Heart className="h-4 w-4 mr-2" />
                  {canAddFavorite ? '즐겨찾기 추가' : '즐겨찾기 가득 참'}
                </>
              )}
            </Button>
          )}
        </div>

        {/* Place Name */}
        <div className="mb-8">
          {geoLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-5 w-48" />
            </div>
          ) : (
            <>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                {displayName}
              </h1>
              <p className="text-muted-foreground mt-1">
                {fullName.replace(/-/g, ' > ')}
              </p>
            </>
          )}
        </div>

        {/* Current Weather */}
        <div className="space-y-6">
          <WeatherCard
            weather={weather}
            isLoading={geoLoading || weatherLoading}
            error={weatherError}
          />

          {/* Hourly Forecast */}
          <HourlyForecast
            hourly={weather?.hourly}
            isLoading={geoLoading || weatherLoading}
          />
        </div>
      </div>
    </div>
  );
}
