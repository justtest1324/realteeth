import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

describe('Vitest Setup', () => {
  it('should perform basic math operations', () => {
    expect(1 + 1).toBe(2);
  });

  it('should render React components with Testing Library', () => {
    const TestComponent = () => <div>Hello, Vitest!</div>;

    render(<TestComponent />);

    expect(screen.getByText('Hello, Vitest!')).toBeInTheDocument();
  });
});
