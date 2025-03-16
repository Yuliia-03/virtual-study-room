import React, { useContext } from "react";
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { FriendsProvider, FriendsContext } from '../../friends/FriendsContext';
import * as authService from "../../../utils/authService";
import { getDownloadURL } from 'firebase/storage';

// Mock API responses for the data we want to fetch
jest.mock('../../../utils/authService', () => ({
    getAuthenticatedRequest: jest.fn(),
}));


jest.mock('firebase/storage');
jest.mock('../../../firebase-config.js');

jest.mock('react-toastify', () => {
    const actual = jest.requireActual('react-toastify');
    return {
        ...actual,
        toast: {
            error: jest.fn(),
            success: jest.fn(),
        },
    };
});

// Helper component to consume context values for testing
const TestComponent = () => {
    const { friends, invitationsRequests, loading, onAccept, onReject } = useContext(FriendsContext);

    if (loading) return <div>Loading...</div>;

    return (
        <div>
            <div>
                {friends.map(friend => (
                    <div key={friend.id}>
                        <span>{friend.name}</span>
                        <button onClick={() => onAccept(friend.id, 'accept_friend', 'POST')}>Accept</button>
                        <button onClick={() => onReject(friend.id)}>Reject</button>
                    </div>
                ))}
            </div>
            <div>
                {invitationsRequests.map(invitation => (
                    <div key={invitation.id}>
                        <span>{invitation.name}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

describe('FriendsContext', () => {
    
    
    beforeEach(() => {
        mockOnReject = jest.fn();
        mockOnAccept = jest.fn();
        const mockContext = {
            loading: false,
            onAccept: mockOnAccept,
            onReject: mockOnReject,
            friendRequests: [],
            invitationsRequests: [],
            friends: [],
        };

        const mockRequestData = [
            {
                id: 1,
                username: "friend1",
                image: "https://example.com/avatar.png",
            },
            {
                id: 2,
                username: "friend2",
                image: "https://example.com/avatar2.png",
            },
        ];

        jest.spyOn(console, 'error').mockImplementation(() => { });
        jest.spyOn(window, 'alert').mockImplementation(() => { });

        getDownloadURL.mockResolvedValue('https://example.com/avatar.png');
        authService.getAuthenticatedRequest.mockResolvedValue(mockRequestData);
    });
    afterEach(() => {
        jest.restoreAllMocks(); // ✅ Restores all spies/mocks to their original behavior
    });

    test('should correctly fetch and render friends data', async () => {
        // Mocking the API call to return friends data
        getAuthenticatedRequest.mockResolvedValueOnce([
            { id: 1, username: 'john_doe', name: 'John Doe' },
            { id: 2, username: 'jane_doe', name: 'Jane Doe' },
        ]);

        render(
            <FriendsProvider>
                <TestComponent />
            </FriendsProvider>
        );

        // Check the loading state
        expect(screen.getByText(/Loading.../i)).toBeInTheDocument();

        // Wait for the data to load and check if friends names are rendered
        await waitFor(() => {
            expect(screen.getByText('John Doe')).toBeInTheDocument();
            expect(screen.getByText('Jane Doe')).toBeInTheDocument();
        });
    });

    test('should use default avatar if image fetch fails', async () => {
        // Mock `getDownloadURL` to simulate an error (image fetch failure)
        getDownloadURL.mockRejectedValueOnce(new Error('Image not found'));

        render(
            <FriendsProvider>
                <TestComponent />
            </FriendsProvider>
        );

        // Wait for friends data to be rendered
        await waitFor(() => {
            const images = screen.getAllByRole('img'); // Find all images
            expect(images[0]).toHaveAttribute('src', 'https://example.com/avatar.png'); // Default avatar
        });
    });

    test('should call onAccept and update the friends list', async () => {
        // Mock the API response for accepting a friend
        const acceptResponse = { status: 1 };  // Simulate successful API response
        getAuthenticatedRequest.mockResolvedValueOnce(acceptResponse);

        render(
            <FriendsProvider>
                <TestComponent />
            </FriendsProvider>
        );

        // Wait for friends data to load
        await waitFor(() => {
            const acceptButton = screen.getByText('Accept');
            expect(acceptButton).toBeInTheDocument();

            // Simulate click on "Accept"
            fireEvent.click(acceptButton);

            // Verify that the onAccept function has been called
            expect(getAuthenticatedRequest).toHaveBeenCalledWith('/accept_friend/1/', 'POST');
        });
    });

    test('should call onReject and remove friend from the list', async () => {
        // Mock the API response for rejecting a friend
        const rejectResponse = { status: 1 };  // Simulate successful API response
        getAuthenticatedRequest.mockResolvedValueOnce(rejectResponse);

        render(
            <FriendsProvider>
                <TestComponent />
            </FriendsProvider>
        );

        // Wait for friends data to load
        await waitFor(() => {
            const rejectButton = screen.getByText('Reject');
            expect(rejectButton).toBeInTheDocument();

            // Simulate click on "Reject"
            fireEvent.click(rejectButton);

            // Verify that the onReject function has been called
            expect(getAuthenticatedRequest).toHaveBeenCalledWith('/reject_friend/1/', 'DELETE');
        });
    });
});
