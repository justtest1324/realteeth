import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { FavoriteCard } from '@/widgets/favorite-list/ui/FavoriteCard';
import { ERROR_MESSAGES } from '@/shared/constants/messages';
import type { Favorite } from '@/features/favorites';

// Mock next/navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock useFavorites hook
const mockRemoveFavorite = vi.fn();
const mockUpdateAlias = vi.fn();
vi.mock('@/features/favorites', () => ({
  useFavorites: () => ({
    removeFavorite: mockRemoveFavorite,
    updateAlias: mockUpdateAlias,
  }),
}));

// Mock useWeather hook
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

vi.mock('@/entities/weather', () => ({
  useWeather: () => ({
    data: mockWeatherResponse,
    isLoading: mockWeatherLoading,
  }),
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

describe('FavoriteCard', () => {
  const mockFavorite: Favorite = {
    placeId: encodeURIComponent('서울특별시-강남구-역삼동'),
    fullName: '서울특별시-강남구-역삼동',
    displayName: '역삼동',
    lat: 37.5665,
    lon: 126.978,
    addedAt: Date.now(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockWeatherLoading = false;
    mockWeatherResponse = mockWeatherData;
  });

  describe('Card UI Display', () => {
    it('should render as a Card UI component', () => {
      render(<FavoriteCard favorite={mockFavorite} />, { wrapper: createWrapper() });

      // Card should contain the place name and be rendered as a card
      const card = screen.getByText('역삼동').closest('[data-slot="card"]');
      expect(card).toBeInTheDocument();
      expect(card).toHaveClass('cursor-pointer');
    });

    it('should display the place name (displayName)', () => {
      render(<FavoriteCard favorite={mockFavorite} />, { wrapper: createWrapper() });

      expect(screen.getByText('역삼동')).toBeInTheDocument();
    });
  });

  describe('Weather Information Display', () => {
    it('should display current temperature', () => {
      render(<FavoriteCard favorite={mockFavorite} />, { wrapper: createWrapper() });

      // Math.round(15.5) = 16
      expect(screen.getByText('16°')).toBeInTheDocument();
    });

    it('should display lowest temperature of the day', () => {
      render(<FavoriteCard favorite={mockFavorite} />, { wrapper: createWrapper() });

      expect(screen.getByText('10°')).toBeInTheDocument();
    });

    it('should display highest temperature of the day', () => {
      render(<FavoriteCard favorite={mockFavorite} />, { wrapper: createWrapper() });

      expect(screen.getByText('20°')).toBeInTheDocument();
    });

    it('should display loading skeleton when weather is loading', () => {
      mockWeatherLoading = true;

      render(<FavoriteCard favorite={mockFavorite} />, { wrapper: createWrapper() });

      // Should not show temperature when loading
      expect(screen.queryByText('16°')).not.toBeInTheDocument();
    });

    it('should display "해당 장소의 정보가 제공되지 않습니다" when no weather data', () => {
      mockWeatherResponse = undefined;

      render(<FavoriteCard favorite={mockFavorite} />, { wrapper: createWrapper() });

      expect(screen.getByText(ERROR_MESSAGES.NO_DATA)).toBeInTheDocument();
    });
  });

  describe('Navigation to Details Page', () => {
    it('should navigate to place details page when card is clicked', async () => {
      const user = userEvent.setup();

      render(<FavoriteCard favorite={mockFavorite} />, { wrapper: createWrapper() });

      const card = screen.getByText('역삼동').closest('[class*="card"]');
      await user.click(card!);

      expect(mockPush).toHaveBeenCalledWith(`/place/${mockFavorite.placeId}`);
    });
  });

  describe('Remove Favorite', () => {
    it('should call removeFavorite when remove button is clicked', async () => {
      const user = userEvent.setup();

      render(<FavoriteCard favorite={mockFavorite} />, { wrapper: createWrapper() });

      const removeButton = screen.getByRole('button', { name: 'Remove from favorites' });
      await user.click(removeButton);

      expect(mockRemoveFavorite).toHaveBeenCalledWith(mockFavorite.placeId);
    });

    it('should not navigate when remove button is clicked', async () => {
      const user = userEvent.setup();

      render(<FavoriteCard favorite={mockFavorite} />, { wrapper: createWrapper() });

      const removeButton = screen.getByRole('button', { name: 'Remove from favorites' });
      await user.click(removeButton);

      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  describe('Edit Alias (Modify Name)', () => {
    it('should open edit dialog when edit button is clicked', async () => {
      const user = userEvent.setup();

      render(<FavoriteCard favorite={mockFavorite} />, { wrapper: createWrapper() });

      const editButton = screen.getByRole('button', { name: 'Edit alias' });
      await user.click(editButton);

      expect(screen.getByText('별칭 수정')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('별칭을 입력하세요')).toBeInTheDocument();
    });

    it('should show full address in edit dialog', async () => {
      const user = userEvent.setup();

      render(<FavoriteCard favorite={mockFavorite} />, { wrapper: createWrapper() });

      const editButton = screen.getByRole('button', { name: 'Edit alias' });
      await user.click(editButton);

      expect(screen.getByText('서울특별시 > 강남구 > 역삼동')).toBeInTheDocument();
    });

    it('should call updateAlias when saving new alias', async () => {
      const user = userEvent.setup();

      render(<FavoriteCard favorite={mockFavorite} />, { wrapper: createWrapper() });

      // Open edit dialog
      const editButton = screen.getByRole('button', { name: 'Edit alias' });
      await user.click(editButton);

      // Change the input value
      const input = screen.getByPlaceholderText('별칭을 입력하세요');
      await user.clear(input);
      await user.type(input, '우리집');

      // Click save button
      const saveButton = screen.getByRole('button', { name: '저장' });
      await user.click(saveButton);

      expect(mockUpdateAlias).toHaveBeenCalledWith(mockFavorite.placeId, '우리집');
    });

    it('should save alias when pressing Enter key', async () => {
      const user = userEvent.setup();

      render(<FavoriteCard favorite={mockFavorite} />, { wrapper: createWrapper() });

      // Open edit dialog
      const editButton = screen.getByRole('button', { name: 'Edit alias' });
      await user.click(editButton);

      // Change the input value and press Enter
      const input = screen.getByPlaceholderText('별칭을 입력하세요');
      await user.clear(input);
      await user.type(input, '회사{Enter}');

      expect(mockUpdateAlias).toHaveBeenCalledWith(mockFavorite.placeId, '회사');
    });

    it('should not navigate when edit button is clicked', async () => {
      const user = userEvent.setup();

      render(<FavoriteCard favorite={mockFavorite} />, { wrapper: createWrapper() });

      const editButton = screen.getByRole('button', { name: 'Edit alias' });
      await user.click(editButton);

      expect(mockPush).not.toHaveBeenCalled();
    });
  });
});
