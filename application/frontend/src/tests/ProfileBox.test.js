import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import ProfileBox from '../pages/ProfileBox';
import { BrowserRouter as Router } from "react-router-dom";
import { ref, getDownloadURL, uploadBytes } from 'firebase/storage';
import { getAuthenticatedRequest } from '../pages/utils/authService';
import defaultAvatar from '../assets/avatars/avatar_2.png';

//mock the necessary modules
jest.mock('../pages/utils/authService');
jest.mock('firebase/storage'); 
jest.mock('../firebase-config.js') ;

describe('ProfileBox', () => {
    beforeEach(() => {
        getAuthenticatedRequest.mockResolvedValue({
            username: 'testuser',
            description: 'Test Description',
        });
      
        getDownloadURL.mockResolvedValue('https://example.com/avatar.png');
        uploadBytes.mockResolvedValue();

        global.fetch = jest.fn(() =>
            Promise.resolve({
                blob: () => Promise.resolve(new Blob(['avatar'])), // Mock the blob response
            })
        );

        jest.spyOn(Storage.prototype, 'removeItem');
    });

    test('renders ProfileBox component', async () => {
        render(
          <Router>
            <ProfileBox />
          </Router>
        );
    
        expect(screen.getByText('Profile')).toBeInTheDocument();
        await waitFor(() => expect(screen.getByText('testuser')).toBeInTheDocument());
        expect(screen.getByPlaceholderText('Please Enter Description')).toBeInTheDocument();
    });

    test('updates description', async () => {
        render(
          <Router>
            <ProfileBox />
          </Router>
        );
    
        const descriptionTextarea = screen.getByPlaceholderText('Please Enter Description');
        fireEvent.change(descriptionTextarea, { target: { value: 'New Description' } });
    
        expect(descriptionTextarea.value).toBe('New Description');
    
        const saveButton = screen.getByText('Save');
        fireEvent.click(saveButton);
    
        await waitFor(() => expect(getAuthenticatedRequest).toHaveBeenCalledWith('/description/', 'PUT', { description: 'New Description' }));
    });

    test('handles avatar upload', async () => {
        render(
          <Router>
            <ProfileBox />
          </Router>
        );
    
        const file = new File(['avatar'], 'avatar.png', { type: 'image/png' });
    
        const uploadLabel = screen.getByText('Upload Avatar');
        await act(async () => {
            fireEvent.click(uploadLabel); 
        });
        // Find the hidden file input and simulate file selection
        const input = screen.getByTestId('file-input'); // Change this to match your input's label
        await act(async () => {
            fireEvent.change(input, { target: { files: [file] } }); // Simulate file selection
        });
    
        // Check that uploadBytes and getDownloadURL were called
        await waitFor(() => expect(uploadBytes).toHaveBeenCalled());
        await waitFor(() => expect(getDownloadURL).toHaveBeenCalled());
    });    
    
    test('handles default avatar selection', async () => {
        render(
          <Router>
            <ProfileBox />
          </Router>
        );
    
        const defaultAvatarButton = screen.getByText('Default Avatars');
        fireEvent.click(defaultAvatarButton);
    
        const avatarImage = screen.getByAltText('Avatar 1');
        fireEvent.click(avatarImage);
    
        await waitFor(() => expect(global.fetch).toHaveBeenCalled());
        await waitFor(() => expect(uploadBytes).toHaveBeenCalled());
        await waitFor(() => expect(getDownloadURL).toHaveBeenCalled());
    });

    test('fetches user badges', async () => {
        getAuthenticatedRequest.mockResolvedValueOnce([
          { reward_number: 1, date_earned: '2023-01-01' },
          { reward_number: 2, date_earned: '2023-02-01' },
        ]);
    
        render(
          <Router>
            <ProfileBox />
          </Router>
        );
    
        const inventoryButton = screen.getByLabelText('View Badge Collection');
        fireEvent.click(inventoryButton);
    
        await waitFor(() => expect(screen.getByText('Your Badge Collection')).toBeInTheDocument());
        expect(screen.getByText('Badge 1')).toBeInTheDocument();
        expect(screen.getByText('Badge 2')).toBeInTheDocument();
    });

    test('logs off user', async () => {
        render(
          <Router>
            <ProfileBox />
          </Router>
        );
    
        const logoffButton = screen.getByText('Log Off');
        fireEvent.click(logoffButton);
    
        await waitFor(() => expect(localStorage.removeItem).toHaveBeenCalledWith('access_token'));
        await waitFor(() => expect(localStorage.removeItem).toHaveBeenCalledWith('refresh_token'));
    });

});