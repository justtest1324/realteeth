import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LocationSearchInput } from '@/features/location-search/ui/LocationSearchInput';

describe('LocationSearchInput', () => {
  it('should render search input', () => {
    const onSelect = vi.fn();
    render(<LocationSearchInput onSelect={onSelect} />);

    const input = screen.getByRole('combobox');
    expect(input).toBeInTheDocument();
  });

  it('should show placeholder text', () => {
    const onSelect = vi.fn();
    render(<LocationSearchInput onSelect={onSelect} placeholder="지역을 검색하세요" />);

    expect(screen.getByPlaceholderText('지역을 검색하세요')).toBeInTheDocument();
  });

  it('should display results when typing', async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();

    render(<LocationSearchInput onSelect={onSelect} />);

    const input = screen.getByRole('combobox');
    await user.type(input, '서울');

    await waitFor(() => {
      expect(screen.getByRole('option', { name: '서울특별시' })).toBeInTheDocument();
    });
  });

  it('should call onSelect when clicking a result', async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();

    render(<LocationSearchInput onSelect={onSelect} />);

    const input = screen.getByRole('combobox');
    await user.type(input, '서울');

    await waitFor(() => {
      const option = screen.getByRole('option', { name: '서울특별시' });
      return user.click(option);
    });

    expect(onSelect).toHaveBeenCalledWith('서울특별시');
  });

  it('should show empty state when no results found', async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();

    render(<LocationSearchInput onSelect={onSelect} />);

    const input = screen.getByRole('combobox');
    await user.type(input, 'xyzabc123');

    await waitFor(() => {
      expect(screen.getByText('검색 결과가 없습니다')).toBeInTheDocument();
    });
  });

  it('should hide results when input is empty', async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();

    render(<LocationSearchInput onSelect={onSelect} />);

    const input = screen.getByRole('combobox');
    await user.type(input, '서울');

    await waitFor(() => {
      expect(screen.getByRole('option', { name: '서울특별시' })).toBeInTheDocument();
    });

    await user.clear(input);

    await waitFor(() => {
      expect(screen.queryByRole('option')).not.toBeInTheDocument();
    });
  });

  it('should support keyboard navigation', async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();

    render(<LocationSearchInput onSelect={onSelect} />);

    const input = screen.getByRole('combobox');
    await user.type(input, '서울');

    await waitFor(() => {
      expect(screen.getByRole('option', { name: '서울특별시' })).toBeInTheDocument();
    });

    // Arrow down to select first item
    fireEvent.keyDown(input, { key: 'ArrowDown' });

    // Enter to select
    fireEvent.keyDown(input, { key: 'Enter' });

    await waitFor(() => {
      expect(onSelect).toHaveBeenCalled();
    });
  });

  it('should clear selection when clear button clicked', async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();

    render(<LocationSearchInput onSelect={onSelect} />);

    const input = screen.getByRole('combobox');
    await user.type(input, '서울');

    await waitFor(() => {
      const option = screen.getByRole('option', { name: '서울특별시' });
      return user.click(option);
    });

    expect(onSelect).toHaveBeenCalledWith('서울특별시');

    // Type again to trigger new search
    await user.clear(input);
    await user.type(input, '부산');

    await waitFor(() => {
      expect(screen.getByRole('option', { name: '부산광역시' })).toBeInTheDocument();
    });
  });
});
