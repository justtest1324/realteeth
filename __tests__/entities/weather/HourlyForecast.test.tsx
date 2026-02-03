import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HourlyForecast } from '@/entities/weather/ui/HourlyForecast';
import type { WeatherHourly } from '@/entities/weather/types';

// Mock WeatherIcon component
vi.mock('@/entities/weather/ui/WeatherIcon', () => ({
  WeatherIcon: ({ icon, size }: { icon: string; size: number }) => (
    <div data-testid="weather-icon" data-icon={icon} data-size={size}>
      WeatherIcon
    </div>
  ),
}));

describe('HourlyForecast', () => {
  describe('Loading State', () => {
    it('should display loading skeleton when isLoading=true', () => {
      render(<HourlyForecast hourly={undefined} isLoading={true} />);

      // Should render skeletons (using data-slot attribute)
      const skeletons = document.querySelectorAll('[data-slot="skeleton"]');
      expect(skeletons.length).toBeGreaterThan(0);

      // Should show the title even when loading
      expect(screen.getByText('시간별 예보')).toBeInTheDocument();
    });
  });

  describe('No Data State', () => {
    it('should return null when hourly is undefined', () => {
      const { container } = render(<HourlyForecast hourly={undefined} isLoading={false} />);

      expect(container.firstChild).toBeNull();
    });

    it('should return null when hourly is empty array', () => {
      const { container } = render(<HourlyForecast hourly={[]} isLoading={false} />);

      expect(container.firstChild).toBeNull();
    });
  });

  describe('Data Display', () => {
    const mockHourlyData: WeatherHourly[] = [
      {
        time: '2024-01-01T00:00:00Z', // Will show as "지금"
        temp: 15.7,
        icon: '01d',
      },
      {
        time: '2024-01-01T14:00:00+09:00', // 14시 in KST
        temp: 18.3,
        icon: '02d',
      },
      {
        time: '2024-01-01T09:00:00+09:00', // 9시 in KST
        temp: 12.1,
        icon: '03d',
      },
    ];

    it('should display "시간별 예보" title when data present', () => {
      render(<HourlyForecast hourly={mockHourlyData} isLoading={false} />);

      expect(screen.getByText('시간별 예보')).toBeInTheDocument();
    });

    it('should show "지금" for first hour entry (index === 0)', () => {
      render(<HourlyForecast hourly={mockHourlyData} isLoading={false} />);

      expect(screen.getByText('지금')).toBeInTheDocument();
    });

    it('should format subsequent hours as "X시" (e.g., "14시")', () => {
      render(<HourlyForecast hourly={mockHourlyData} isLoading={false} />);

      // Second entry should show formatted hour
      expect(screen.getByText('14시')).toBeInTheDocument();
      // Third entry should show formatted hour
      expect(screen.getByText('9시')).toBeInTheDocument();
    });

    it('should display temperature for each hour rounded (Math.round)', () => {
      render(<HourlyForecast hourly={mockHourlyData} isLoading={false} />);

      // Math.round(15.7) = 16
      expect(screen.getByText('16°')).toBeInTheDocument();
      // Math.round(18.3) = 18
      expect(screen.getByText('18°')).toBeInTheDocument();
      // Math.round(12.1) = 12
      expect(screen.getByText('12°')).toBeInTheDocument();
    });

    it('should display WeatherIcon for each hour', () => {
      render(<HourlyForecast hourly={mockHourlyData} isLoading={false} />);

      const icons = screen.getAllByTestId('weather-icon');
      expect(icons).toHaveLength(3);

      // Check that icons have correct props
      expect(icons[0]).toHaveAttribute('data-icon', '01d');
      expect(icons[0]).toHaveAttribute('data-size', '40');
      expect(icons[1]).toHaveAttribute('data-icon', '02d');
      expect(icons[2]).toHaveAttribute('data-icon', '03d');
    });
  });
});
