import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PlaceDetailWidget } from '@/widgets/place-detail/ui/PlaceDetailWidget';
import type { Favorite } from '@/features/favorites';

// Mock next/navigation
const mockPush = vi.fn();
const mockBack = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    back: mockBack,
  }),
}));

// Mock useFavorites hook
const mockAddFavorite = vi.fn();
const mockRemoveFavorite = vi.fn();
let mockFavorites: Favorite[] = [];
let mockIsFavorite = false;
let mockIsHydrated = true;

vi.mock('@/features/favorites', () => ({
  useFavorites: () => ({
    favorites: mockFavorites,
    addFavorite: mockAddFavorite,
    removeFavorite: mockRemoveFavorite,
    isFavorite: () => mockIsFavorite,
    isHydrated: mockIsHydrated,
  }),
  MAX_FAVORITES: 6,
}));

// Mock useGeocode hook
let mockGeoData = { lat: 37.5665, lon: 126.978 };
let mockGeoLoading = false;
let mockGeoError: Error | null = null;

vi.mock('@/entities/location', () => ({
  useGeocode: () => ({
    data: mockGeoData,
    isLoading: mockGeoLoading,
    error: mockGeoError,
  }),
}));

// Mock useWeather hook and components
const mockWeatherData = {
  current: {
    temp: 15.5,
    description: 'clear sky',
    icon: '01d',
  },
  today: {
    min: 10,
    max: 20,
  },
  hourly: [],
};

let mockWeatherLoading = false;
let mockWeatherResponse: typeof mockWeatherData | undefined = mockWeatherData;
let mockWeatherError: Error | null = null;

vi.mock('@/entities/weather', () => ({
  useWeather: () => ({
    data: mockWeatherResponse,
    isLoading: mockWeatherLoading,
    error: mockWeatherError,
  }),
  WeatherCard: vi.fn(({ weather, isLoading, error }) => (
    <div data-testid="weather-card">
      {isLoading && <div>Weather Loading</div>}
      {error && <div>Weather Error</div>}
      {weather && <div>Weather Data</div>}
    </div>
  )),
  HourlyForecast: vi.fn(({ hourly, isLoading }) => (
    <div data-testid="hourly-forecast">
      {isLoading && <div>Hourly Loading</div>}
      {hourly && <div>Hourly Data</div>}
    </div>
  )),
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

describe('PlaceDetailWidget', () => {
  const encodedPlaceId = encodeURIComponent('서울특별시-강남구-역삼동');

  beforeEach(() => {
    vi.clearAllMocks();
    mockFavorites = [];
    mockIsFavorite = false;
    mockIsHydrated = true;
    mockGeoData = { lat: 37.5665, lon: 126.978 };
    mockGeoLoading = false;
    mockGeoError = null;
    mockWeatherLoading = false;
    mockWeatherResponse = mockWeatherData;
    mockWeatherError = null;
  });

  describe('Place Information Display', () => {
    it('should display place displayName (last segment of fullName)', () => {
      render(<PlaceDetailWidget placeId={encodedPlaceId} />, { wrapper: createWrapper() });

      expect(screen.getByText('역삼동')).toBeInTheDocument();
    });

    it('should display breadcrumb (fullName with - replaced by " > ")', () => {
      render(<PlaceDetailWidget placeId={encodedPlaceId} />, { wrapper: createWrapper() });

      expect(screen.getByText('서울특별시 > 강남구 > 역삼동')).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('should show loading skeleton during geocoding', () => {
      mockGeoLoading = true;

      render(<PlaceDetailWidget placeId={encodedPlaceId} />, { wrapper: createWrapper() });

      // Should not show place name when loading
      expect(screen.queryByText('역삼동')).not.toBeInTheDocument();
      expect(screen.queryByText('서울특별시 > 강남구 > 역삼동')).not.toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('should display error message when geocode fails', () => {
      mockGeoError = new Error('Geocode failed');

      render(<PlaceDetailWidget placeId={encodedPlaceId} />, { wrapper: createWrapper() });

      expect(screen.getByText('해당 지역을 찾을 수 없습니다')).toBeInTheDocument();
    });
  });

  describe('Favorite Button - Not Favorited', () => {
    it('should show "즐겨찾기 추가" when not favorited', () => {
      mockIsFavorite = false;
      mockFavorites = [];

      render(<PlaceDetailWidget placeId={encodedPlaceId} />, { wrapper: createWrapper() });

      expect(screen.getByText('즐겨찾기 추가')).toBeInTheDocument();
    });
  });

  describe('Favorite Button - Already Favorited', () => {
    it('should show "즐겨찾기 해제" when already favorited', () => {
      mockIsFavorite = true;
      mockFavorites = [
        {
          placeId: encodedPlaceId,
          fullName: '서울특별시-강남구-역삼동',
          displayName: '역삼동',
          lat: 37.5665,
          lon: 126.978,
          addedAt: Date.now(),
        },
      ];

      render(<PlaceDetailWidget placeId={encodedPlaceId} />, { wrapper: createWrapper() });

      expect(screen.getByText('즐겨찾기 해제')).toBeInTheDocument();
    });
  });

  describe('Favorite Button - Full', () => {
    it('should show "즐겨찾기 가득 참" and be disabled when favorites.length >= 6', () => {
      mockIsFavorite = false;
      mockFavorites = Array.from({ length: 6 }, (_, i) => ({
        placeId: `place-${i}`,
        fullName: `Place ${i}`,
        displayName: `Place ${i}`,
        lat: 37.5665,
        lon: 126.978,
        addedAt: Date.now(),
      }));

      render(<PlaceDetailWidget placeId={encodedPlaceId} />, { wrapper: createWrapper() });

      const button = screen.getByText('즐겨찾기 가득 참').closest('button');
      expect(button).toBeInTheDocument();
      expect(button).toBeDisabled();
    });
  });

  describe('Favorite Button Actions - Add', () => {
    it('should call addFavorite with correct params when clicked', async () => {
      const user = userEvent.setup();
      mockIsFavorite = false;
      mockFavorites = [];

      render(<PlaceDetailWidget placeId={encodedPlaceId} />, { wrapper: createWrapper() });

      const favoriteButton = screen.getByText('즐겨찾기 추가').closest('button');
      await user.click(favoriteButton!);

      expect(mockAddFavorite).toHaveBeenCalledWith({
        placeId: encodedPlaceId,
        fullName: '서울특별시-강남구-역삼동',
        displayName: '역삼동',
        lat: 37.5665,
        lon: 126.978,
      });
    });
  });

  describe('Favorite Button Actions - Remove', () => {
    it('should call removeFavorite when favorited and clicked', async () => {
      const user = userEvent.setup();
      mockIsFavorite = true;
      mockFavorites = [
        {
          placeId: encodedPlaceId,
          fullName: '서울특별시-강남구-역삼동',
          displayName: '역삼동',
          lat: 37.5665,
          lon: 126.978,
          addedAt: Date.now(),
        },
      ];

      render(<PlaceDetailWidget placeId={encodedPlaceId} />, { wrapper: createWrapper() });

      const favoriteButton = screen.getByText('즐겨찾기 해제').closest('button');
      await user.click(favoriteButton!);

      expect(mockRemoveFavorite).toHaveBeenCalledWith(encodedPlaceId);
    });
  });

  describe('Back Button', () => {
    it('should call router.back() when back button is clicked', async () => {
      const user = userEvent.setup();

      render(<PlaceDetailWidget placeId={encodedPlaceId} />, { wrapper: createWrapper() });

      const backButtons = screen.getAllByText('뒤로');
      await user.click(backButtons[0].closest('button')!);

      expect(mockBack).toHaveBeenCalled();
    });
  });

  describe('Weather Components', () => {
    it('should render WeatherCard component', () => {
      render(<PlaceDetailWidget placeId={encodedPlaceId} />, { wrapper: createWrapper() });

      expect(screen.getByTestId('weather-card')).toBeInTheDocument();
    });

    it('should render HourlyForecast component', () => {
      render(<PlaceDetailWidget placeId={encodedPlaceId} />, { wrapper: createWrapper() });

      expect(screen.getByTestId('hourly-forecast')).toBeInTheDocument();
    });
  });
});
