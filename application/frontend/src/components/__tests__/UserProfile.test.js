/**
 * Test implementation for avatar/badge functionality.
 * Use this as reference for implementing these features in the final profile component.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import UserProfile from '../UserProfile';
import { preloadImages } from '../../utils/uploadImages';
import { getDatabase, ref, get, set } from 'firebase/database';

jest.mock('firebase/database');
jest.mock('../../utils/uploadImages');

describe('UserProfile', () => {
  const mockUserId = 'test-user-123';
  const mockAvatar = 'http://example.com/avatar.png';
  const mockBadges = ['badge1', 'badge2'];

  beforeEach(() => {
    jest.clearAllMocks();
    console.error = jest.fn(); 
    
    getDatabase.mockReturnValue({});
    ref.mockReturnValue({});
    get.mockImplementation(() => Promise.resolve({
      val: () => mockAvatar
    }));
    
    preloadImages.mockResolvedValue(true);
  });

  test('shows loading state initially', () => {
    render(<UserProfile userId={mockUserId} />);
    expect(screen.getByText(/Loading/i)).toBeInTheDocument();
  });

  test('loads and displays avatar', async () => {
    await act(async () => {
      render(<UserProfile userId={mockUserId} />);
    });

    const avatarImg = await screen.findByAltText('Avatar');
    expect(avatarImg).toBeInTheDocument();
    expect(avatarImg).toHaveAttribute('src', mockAvatar);
  });

  test('toggles inventory display', async () => {
    render(<UserProfile userId={mockUserId} />);
    
    await waitFor(() => {
      expect(screen.queryByText(/Loading/)).not.toBeInTheDocument();
    });
    
    const button = await screen.findByRole('button');
    fireEvent.click(button);
    expect(await screen.findByText(/Your Badge Collection/i)).toBeInTheDocument();
    
    fireEvent.click(button);
    expect(screen.queryByText(/Your Badge Collection/i)).not.toBeInTheDocument();
  });

  test('handles loading error gracefully', async () => {
    preloadImages.mockRejectedValue(new Error('Failed to load'));
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    await act(async () => {
      render(<UserProfile userId={mockUserId} />);
    });
    
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  test('updates loading progress correctly', async () => {
    let resolvePreload;
    preloadImages.mockImplementation(() => new Promise(resolve => {
      resolvePreload = resolve;
    }));

    render(<UserProfile userId={mockUserId} />);
    expect(screen.getByText(/Loading/i)).toBeInTheDocument();
    
    await act(async () => {
      resolvePreload(true);
    });
    
    await waitFor(() => {
      expect(screen.queryByText(/Loading/i)).not.toBeInTheDocument();
    });
  });

  test('handles avatar selection', async () => {
    set.mockResolvedValue();
    
    await act(async () => {
      render(<UserProfile userId={mockUserId} />);
    });
    
    const avatarContainer = await screen.findByAltText('Avatar');
    fireEvent.click(avatarContainer);
    
    expect(await screen.findByText(/Choose Your Avatar/i)).toBeInTheDocument();
  });

  test('handles database error gracefully', async () => {
    get.mockRejectedValueOnce(new Error('Database error'));
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    await act(async () => {
      render(<UserProfile userId={mockUserId} />);
    });
    
    expect(consoleSpy).toHaveBeenCalledWith('Error loading profile:', expect.any(Error));
    consoleSpy.mockRestore();
  });

  test('handles missing avatar data', async () => {
    get.mockImplementationOnce(() => Promise.resolve({
      val: () => null
    }));
    
    await act(async () => {
      render(<UserProfile userId={mockUserId} />);
    });
    
    expect(screen.getByText('Click to select an avatar')).toBeInTheDocument();
  });

  test('handles missing badges data', async () => {
    // First call for avatar, second for badges
    get
      .mockImplementationOnce(() => Promise.resolve({ val: () => mockAvatar }))
      .mockImplementationOnce(() => Promise.resolve({ val: () => null }));
    
    await act(async () => {
      render(<UserProfile userId={mockUserId} />);
    });
    
    // Will still render with empty badges array
    expect(await screen.findByAltText('Avatar')).toBeInTheDocument();
  });

  test('handles preloadImages failure', async () => {
    preloadImages.mockRejectedValue(new Error('Preload failed'));
    
    await act(async () => {
      render(<UserProfile userId={mockUserId} />);
    });
    
    expect(console.error).toHaveBeenCalledWith(
      'Error loading profile:',
      expect.any(Error)
    );
  });

  test('handles avatar update failure', async () => {
    // Mock database error for set operation
    set.mockRejectedValueOnce(new Error('Update failed'));
    console.error = jest.fn();
    
    await act(async () => {
      render(<UserProfile userId={mockUserId} />);
    });

    const avatarContainer = await screen.findByAltText('Avatar');
    fireEvent.click(avatarContainer);

    const avatarToSelect = await screen.findByAltText('Avatar 1');
    await act(async () => {
      fireEvent.click(avatarToSelect);
    });

    expect(console.error).toHaveBeenCalledWith(
      'Error updating avatar:',
      expect.any(Error)
    );
  });

  test('handles initialization errors', async () => {
    // Mock preloadImages to fail
    preloadImages.mockRejectedValueOnce(new Error('Failed to preload'));
    console.error = jest.fn();

    await act(async () => {
      render(<UserProfile userId={mockUserId} />);
    });

    expect(console.error).toHaveBeenCalledWith(
      'Error loading profile:',
      expect.any(Error)
    );
  });

  test('handles database initialization errors', async () => {
    // Mock database operations to fail
    get.mockRejectedValueOnce(new Error('Database error'));
    console.error = jest.fn();

    await act(async () => {
      render(<UserProfile userId={mockUserId} />);
    });

    expect(console.error).toHaveBeenCalledWith(
      'Error loading profile:',
      expect.any(Error)
    );
  });

  test('handles loading state transitions correctly', async () => {
    let resolvePreload;
    preloadImages.mockImplementation(() => new Promise(resolve => {
      resolvePreload = resolve;
    }));

    render(<UserProfile userId={mockUserId} />);
    
    expect(screen.getByText(/Loading/i)).toBeInTheDocument();
    
    // Resolve preload and check state transitions
    await act(async () => {
      resolvePreload(true);
      await Promise.resolve(); 
    });

    await waitFor(() => {
      expect(screen.queryByText(/Loading/i)).not.toBeInTheDocument();
    });
  });
}); 