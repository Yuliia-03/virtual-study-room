import React from 'react';
import { render, screen } from '@testing-library/react';
import UserBadges from '../UserBadges';

describe('UserBadges', () => {
  const mockProps = {
    userId: 'test-user-123',
    userBadges: ['badge_1', 'badge_2', 'badge_3']
  };

  test('renders user badges', () => {
    render(<UserBadges {...mockProps} />);
    const badges = screen.getAllByRole('img');
    expect(badges.length).toBeGreaterThan(0);
  });

  test('handles empty badge list', () => {
    render(<UserBadges userId="test-user-123" userBadges={[]} />);
    const badges = screen.getAllByRole('img');
    expect(badges.length).toBeGreaterThan(0);
  });
});