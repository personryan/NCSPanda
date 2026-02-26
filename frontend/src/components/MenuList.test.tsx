// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import MenuList from './MenuList';

describe('MenuList', () => {
  it('renders grouped menu items with name, price and availability', () => {
    render(
      <MenuList
        items={[
          {
            itemId: '1',
            name: 'Roasted Chicken Rice',
            price: 4.5,
            currency: 'SGD',
            availability: { isAvailable: true, status: 'available' },
          },
          {
            itemId: '2',
            name: 'Braised Tofu Set',
            price: 3.8,
            currency: 'SGD',
            availability: { isAvailable: false, status: 'sold_out' },
          },
        ]}
      />,
    );

    expect(screen.getAllByText('Available').length).toBeGreaterThan(0);
    expect(screen.getByText('Sold Out')).toBeTruthy();
    expect(screen.getByText('Roasted Chicken Rice')).toBeTruthy();
    expect(screen.getByText('SGD 4.50')).toBeTruthy();
    expect(screen.getAllByText(/Sold out/i).length).toBeGreaterThan(0);
  });

  it('renders empty state when no menu items exist', () => {
    render(<MenuList items={[]} />);
    expect(screen.getByText('No menu items available for this outlet.')).toBeTruthy();
  });
});
