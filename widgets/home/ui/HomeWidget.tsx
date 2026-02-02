'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Skeleton } from '@/shared/ui/skeleton';
import { Button } from '@/shared/ui/button';
import { ERROR_MESSAGES } from '@/shared/constants/messages';
import { useCurrentLocation } from '@/entities/location';
import { useWeather } from '@/entities/weather';
import { LocationSearchInput } from '@/features/location-search';
import { FavoriteListWidget } from '@/widgets/favorite-list';

export function HomeWidget() {
  const router = useRouter();
  const { status, coords, error, retry } = useCurrentLocation();
  const { data: weather, isLoading: weatherLoading } = useWeather(
    coords?.lat ?? null,
    coords?.lon ?? null
  );

  const handleSearchSelect = React.useCallback(
    (fullName: string) => {
      const placeId = encodeURIComponent(fullName);
      router.push(`/place/${placeId}`);
    },
    [router]
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white dark:from-gray-900 dark:to-gray-950">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            날씨 앱
          </h1>
          <p className="text-muted-foreground">
            현재 위치와 즐겨찾기 지역의 날씨를 확인하세요
          </p>
        </header>

        {/* Current Location Section */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <MapPin className="h-6 w-6" />
            현재 위치
          </h2>
          <Card>
            <CardContent className="pt-6 min-h-[120px] flex flex-col justify-center">
              {status === 'loading' && (
                <div className="space-y-3">
                  <Skeleton className="h-12 w-24" />
                  <Skeleton className="h-4 w-40" />
                </div>
              )}

              {status === 'error' && (
                <div className="text-center">
                  <p className="text-muted-foreground mb-4">{error}</p>
                  {error === '위치 권한이 거부되었습니다' ? (
                    <p className="text-sm text-muted-foreground">
                      위치 권한을 허용하거나 지역을 검색하여 날씨를 확인하세요
                    </p>
                  ) : (
                    <Button variant="outline" size="sm" onClick={retry}>
                      다시 시도
                    </Button>
                  )}
                </div>
              )}

              {status === 'success' && coords && (
                <div>
                  {weatherLoading ? (
                    <div className="space-y-3">
                      <Skeleton className="h-12 w-24" />
                      <Skeleton className="h-4 w-40" />
                    </div>
                  ) : weather ? (
                    <div className="space-y-2">
                      <div className="flex items-baseline gap-2">
                        <span className="text-5xl font-bold">
                          {Math.round(weather.current.temp)}°
                        </span>
                        <span className="text-xl text-muted-foreground">
                          {weather.current.description}
                        </span>
                      </div>
                      <div className="text-muted-foreground">
                        최저 <span className="text-blue-500">{Math.round(weather.today.min)}°</span> / 최고{' '}
                        <span className="text-red-500">{Math.round(weather.today.max)}°</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">
                      {ERROR_MESSAGES.NO_DATA}
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        {/* Search Section */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <Search className="h-6 w-6" />
            지역 검색
          </h2>
          <Card>
            <CardContent className="pt-6">
              <LocationSearchInput
                onSelect={handleSearchSelect}
                placeholder="시/구/동을 검색하세요"
                className="w-full"
              />
            </CardContent>
          </Card>
        </section>

        {/* Favorites Section */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">즐겨찾기</h2>
          <FavoriteListWidget />
        </section>
      </div>
    </div>
  );
}
