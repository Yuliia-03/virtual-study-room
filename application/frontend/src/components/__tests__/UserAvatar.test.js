import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import UserAvatar from '../UserAvatar';
import { getImageUrl } from '../../utils/uploadImages';

jest.mock('../../utils/uploadImages', () => ({
  getImageUrl: jest.fn()
}));

describe('UserAvatar', () => {
  const mockProps = {
    userId: 'test-user-123',
    onSelect: jest.fn(),
    currentAvatar: 'http://example.com/avatars/avatar_1.png'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    getImageUrl.mockImplementation((folder, filename) => 
      Promise.resolve(`http://example.com/${folder}/${filename}`)
    );
  });

  test('renders avatar grid', async () => {
    await act(async () => {
      render(<UserAvatar {...mockProps} />);
    });
    
    const avatars = await screen.findAllByRole('img');
    expect(avatars).toHaveLength(12);
    
    // Check grid layout
    const container = screen.getByTestId('avatar-grid');
    const rows = container.querySelectorAll('[data-testid="avatar-row"]');
    expect(rows).toHaveLength(3);
  });

  test('handles avatar selection', async () => {
    await act(async () => {
      render(<UserAvatar {...mockProps} />);
    });
    
    const firstAvatar = await screen.findByAltText('Avatar 1');
    await act(async () => {
      fireEvent.click(firstAvatar);
    });
    
    expect(mockProps.onSelect).toHaveBeenCalledWith(
      'http://example.com/avatars/avatar_1.png'
    );
  });

  test('handles loading errors gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    getImageUrl.mockRejectedValueOnce(new Error('Failed to load'));
    
    await act(async () => {
      render(<UserAvatar {...mockProps} />);
    });
    
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalled();
    });
    consoleSpy.mockRestore();
  });

  test('handles null onSelect prop', async () => {
    const propsWithoutSelect = { ...mockProps, onSelect: undefined };
    
    await act(async () => {
      render(<UserAvatar {...propsWithoutSelect} />);
    });
    
    const firstAvatar = await screen.findByAltText('Avatar 1');
    await act(async () => {
      fireEvent.click(firstAvatar);
    });
    // Should not throw error
  });

  test('handles avatar loading state', async () => {
    const promises = [];
    const resolvers = [];
    
    for (let i = 0; i < 12; i++) {
      let resolver;
      const promise = new Promise(resolve => {
        resolver = resolve;
      });
      promises.push(promise);
      resolvers.push(resolver);
    }
    
    let currentPromiseIndex = 0;
    getImageUrl.mockImplementation(() => promises[currentPromiseIndex++]);

    render(<UserAvatar {...mockProps} />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    
    // Resolve all promises
    await act(async () => {
      resolvers.forEach((resolve, index) => {
        resolve(`http://example.com/avatars/avatar_${index + 1}.png`);
      });
      // Wait for all promises to resolve
      await Promise.all(promises);
    });
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
  });

  test('handles keyboard navigation', async () => {
    const onSelect = jest.fn();
    await act(async () => {
      render(<UserAvatar {...mockProps} onSelect={onSelect} />);
    });
    
    const firstAvatar = await screen.findByAltText('Avatar 1');
    await act(async () => {
      firstAvatar.focus();
      fireEvent.keyDown(firstAvatar, { key: 'Enter' });
    });
    
    expect(onSelect).toHaveBeenCalled();
  });

  test('renders correct grid layout', async () => {
    render(<UserAvatar {...mockProps} />);
    
    const avatars = await screen.findAllByRole('img');
    expect(avatars).toHaveLength(12);
    
    const rows = screen.getAllByRole('row');
    expect(rows).toHaveLength(3); // 3 rows of 4 avatars
  });

  test('applies correct styling to selected avatar', async () => {
    const selectedUrl = 'http://example.com/avatars/avatar_1.png';
    await act(async () => {
      render(
        <UserAvatar 
          {...mockProps} 
          currentAvatar={selectedUrl}
        />
      );
    });
    
    const selectedAvatar = await screen.findByAltText('Avatar 1');
    expect(selectedAvatar).toHaveStyle({
      border: '2px solid blue'
    });
  });

  test('handles failed avatar loading', async () => {
    getImageUrl.mockRejectedValueOnce(new Error('Failed to load'));
    console.error = jest.fn();
    
    render(<UserAvatar {...mockProps} />);
    
    await waitFor(() => {
      expect(console.error).toHaveBeenCalled();
    });
  });

  test('maintains grid layout with missing avatars', async () => {
    getImageUrl.mockImplementation((folder, filename) => {
      if (filename === 'avatar_1.png') return null;
      return Promise.resolve(`http://example.com/${folder}/${filename}`);
    });
    
    render(<UserAvatar {...mockProps} />);
    
    const avatars = await screen.findAllByRole('img');
    expect(avatars).toHaveLength(12);
  });

  test('handles click events with keyboard navigation', async () => {
    const onSelect = jest.fn();
    
    await act(async () => {
      render(<UserAvatar {...mockProps} onSelect={onSelect} />);
    });
    
    const avatar = await screen.findByAltText('Avatar 1');
    fireEvent.keyDown(avatar, { key: 'Enter' });
    
    expect(onSelect).toHaveBeenCalledWith('http://example.com/avatars/avatar_1.png');
  });
}); 