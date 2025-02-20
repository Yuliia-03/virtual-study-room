import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import UserBadges from '../UserBadges';
import { getImageUrl } from '../../utils/uploadImages';

jest.mock('../../utils/uploadImages', () => ({
  getImageUrl: jest.fn()
}));

describe('UserBadges', () => {
  const mockProps = {
    userId: 'test-user-123',
    userBadges: ['badge_1', 'badge_2', 'badge_3']
  };

  beforeEach(() => {
    jest.clearAllMocks();
    getImageUrl.mockImplementation((folder, filename) => 
      Promise.resolve(`http://example.com/${folder}/${filename}`)
    );
  });

  test('renders user badges', async () => {
    render(<UserBadges {...mockProps} />);
    const badges = await screen.findAllByRole('img');
    expect(badges).toHaveLength(12);
  });

  test('handles empty badge list', async () => {
    render(<UserBadges userId="test-user-123" userBadges={[]} />);
    const badges = await screen.findAllByRole('img');
    expect(badges).toHaveLength(12);
  });

  test('loads badge images correctly', async () => {
    render(<UserBadges {...mockProps} />);
    const badges = await screen.findAllByRole('img');
    expect(badges[0]).toHaveAttribute(
      'src', 
      'http://example.com/badges/badge_1.png'
    );
  });

  test('handles image loading errors', async () => {
    // Mock getImageUrl to fail for the first call but succeed for others
    getImageUrl
      .mockRejectedValueOnce(new Error('Failed to load'))
      .mockImplementation((folder, filename) => 
        Promise.resolve(`http://example.com/${folder}/${filename}`)
      );
    
    console.error = jest.fn();
    
    render(<UserBadges {...mockProps} />);
    
    // Wait for images to load
    await waitFor(() => {
      expect(screen.getAllByRole('img')).toHaveLength(12);
    });
    
    expect(console.error).toHaveBeenCalled();
  });

});