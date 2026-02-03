import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { FavoriteListWidget } from '@/widgets/favorite-list/ui/FavoriteListWidget';
import type { Favorite } from '@/features/favorites';

// Mock useFavorites hook
let mockFavorites: Favorite[] = [];
let mockIsHydrated = true;

vi.mock('@/features/favorites', () => ({
  useFavorites: () => ({
    favorites: mockFavorites,
    isHydrated: mockIsHydrated,
    removeFavorite: vi.fn(),
    updateAlias: vi.fn(),
  }),
}));

// Mock FavoriteCard component
vi.mock('@/widgets/favorite-list/ui/FavoriteCard', () => ({
  FavoriteCard: ({ favorite }: { favorite: Favorite }) => (
    <div data-testid={`favorite-card-${favorite.placeId}`}>
      {favorite.displayName}
    </div>
  ),
}));

// Wrapper for React Query
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  function TestWrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }
  TestWrapper.displayName = 'TestWrapper';
  return TestWrapper;
}

describe('FavoriteListWidget', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFavorites = [];
    mockIsHydrated = true;
  });

  describe('Hydration State', () => {
    it('should return null when not hydrated (isHydrated: false)', () => {
      mockIsHydrated = false;

      const { container } = render(<FavoriteListWidget />, { wrapper: createWrapper() });

      expect(container.firstChild).toBeNull();
    });
  });

  describe('Empty State', () => {
    it('should display "즐겨찾기한 지역이 없습니다" message when favorites is empty', () => {
      mockFavorites = [];
      mockIsHydrated = true;

      render(<FavoriteListWidget />, { wrapper: createWrapper() });

      expect(screen.getByText('즐겨찾기한 지역이 없습니다')).toBeInTheDocument();
    });

    it('should display instruction text "지역을 검색하고 ⭐를 눌러 즐겨찾기에 추가하세요"', () => {
      mockFavorites = [];
      mockIsHydrated = true;

      render(<FavoriteListWidget />, { wrapper: createWrapper() });

      expect(screen.getByText('지역을 검색하고 ⭐를 눌러 즐겨찾기에 추가하세요')).toBeInTheDocument();
    });
  });

  describe('Favorites List Display', () => {
    it('should render correct number of FavoriteCard components for 3 favorites', () => {
      mockFavorites = [
        {
          placeId: 'place-1',
          fullName: '서울특별시-강남구-역삼동',
          displayName: '역삼동',
          lat: 37.5665,
          lon: 126.978,
          addedAt: Date.now(),
        },
        {
          placeId: 'place-2',
          fullName: '서울특별시-종로구-청운동',
          displayName: '청운동',
          lat: 37.5865,
          lon: 126.968,
          addedAt: Date.now(),
        },
        {
          placeId: 'place-3',
          fullName: '부산광역시-해운대구-우동',
          displayName: '우동',
          lat: 35.1796,
          lon: 129.1756,
          addedAt: Date.now(),
        },
      ];
      mockIsHydrated = true;

      render(<FavoriteListWidget />, { wrapper: createWrapper() });

      expect(screen.getByTestId('favorite-card-place-1')).toBeInTheDocument();
      expect(screen.getByTestId('favorite-card-place-2')).toBeInTheDocument();
      expect(screen.getByTestId('favorite-card-place-3')).toBeInTheDocument();
    });

    it('should pass correct favorite prop to each FavoriteCard', () => {
      mockFavorites = [
        {
          placeId: 'place-1',
          fullName: '서울특별시-강남구-역삼동',
          displayName: '역삼동',
          lat: 37.5665,
          lon: 126.978,
          addedAt: Date.now(),
        },
        {
          placeId: 'place-2',
          fullName: '서울특별시-종로구-청운동',
          displayName: '청운동',
          lat: 37.5865,
          lon: 126.968,
          addedAt: Date.now(),
        },
        {
          placeId: 'place-3',
          fullName: '부산광역시-해운대구-우동',
          displayName: '우동',
          lat: 35.1796,
          lon: 129.1756,
          addedAt: Date.now(),
        },
      ];
      mockIsHydrated = true;

      render(<FavoriteListWidget />, { wrapper: createWrapper() });

      // Verify that each card receives and displays the correct displayName
      expect(screen.getByText('역삼동')).toBeInTheDocument();
      expect(screen.getByText('청운동')).toBeInTheDocument();
      expect(screen.getByText('우동')).toBeInTheDocument();
    });
  });
});
