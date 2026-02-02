'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { X, Pencil } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Skeleton } from '@/shared/ui/skeleton';
import { Input } from '@/shared/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/shared/ui/dialog';
import { ERROR_MESSAGES } from '@/shared/constants/messages';
import { useWeather } from '@/entities/weather';
import { useFavorites } from '@/features/favorites';
import type { Favorite } from '@/features/favorites';

interface FavoriteCardProps {
  favorite: Favorite;
}

export function FavoriteCard({ favorite }: FavoriteCardProps) {
  const router = useRouter();
  const { removeFavorite, updateAlias } = useFavorites();
  const { data: weather, isLoading } = useWeather(
    favorite.lat ?? null,
    favorite.lon ?? null
  );

  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [editValue, setEditValue] = React.useState(favorite.displayName);

  const handleClick = React.useCallback(() => {
    router.push(`/place/${favorite.placeId}`);
  }, [router, favorite.placeId]);

  const handleRemove = React.useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      removeFavorite(favorite.placeId);
    },
    [removeFavorite, favorite.placeId]
  );

  const handleEditClick = React.useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setEditValue(favorite.displayName);
      setIsEditDialogOpen(true);
    },
    [favorite.displayName]
  );

  const handleSaveAlias = React.useCallback(() => {
    const trimmedValue = editValue.trim();
    if (trimmedValue && trimmedValue !== favorite.displayName) {
      updateAlias(favorite.placeId, trimmedValue);
    }
    setIsEditDialogOpen(false);
  }, [editValue, favorite.placeId, favorite.displayName, updateAlias]);

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleSaveAlias();
      }
    },
    [handleSaveAlias]
  );

  return (
    <>
      <Card
        className="relative cursor-pointer transition-shadow hover:shadow-md"
        onClick={handleClick}
      >
        <CardHeader className="pb-2 pr-16">
          <CardTitle className="text-base truncate">{favorite.displayName}</CardTitle>
          <div className="absolute top-2 right-2 flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={handleEditClick}
              aria-label="Edit alias"
            >
              <Pencil className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={handleRemove}
              aria-label="Remove from favorites"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-4 w-24" />
            </div>
          ) : weather ? (
            <div className="space-y-1">
              <div className="text-3xl font-bold">{Math.round(weather.current.temp)}°</div>
              <div className="text-sm text-muted-foreground">
                <span className="text-blue-500">{Math.round(weather.today.min)}°</span> / <span className="text-red-500">{Math.round(weather.today.max)}°</span>
              </div>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">{ERROR_MESSAGES.NO_DATA}</div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent onClick={(e) => e.stopPropagation()}>
          <DialogHeader>
            <DialogTitle>별칭 수정</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="별칭을 입력하세요"
              autoFocus
            />
            <p className="text-sm text-muted-foreground mt-2">
              {favorite.fullName.replace(/-/g, ' > ')}
            </p>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">취소</Button>
            </DialogClose>
            <Button onClick={handleSaveAlias}>저장</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
