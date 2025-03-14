import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AllFriends from '../../friends/PendingRequests';
import * as authService from '../../../utils/authService';
import { FriendsContext } from "../../friends/FriendsContext";
import { BrowserRouter as Router } from "react-router-dom";
import { ref, getDownloadURL, uploadBytes } from 'firebase/storage';
import PendingFriends from '../../friends/PendingRequests';

// Mocking modules
jest.mock('../../../utils/authService', () => ({
    getAuthenticatedRequest: jest.fn(),
}));

jest.mock('firebase/storage');
jest.mock('../../../firebase-config.js');
jest.mock('react-toastify', () => {
    const actual = jest.requireActual('react-toastify'); // Preserve the actual module
    return {
        ...actual, // Spread actual exports
        toast: {
            error: jest.fn(),
            success: jest.fn(),
        },
    };
});

const mockRequestData = [
    { id: 1, name: "Name1", surname: "Surname1", username: "@username1" },
    { id: 2, name: "Name2", surname: "Surname2", username: "@username2" },
];

describe("PendingRequests", () => {

    const mockOnReject = jest.fn(); // ✅ Use jest.fn() here
    const mockOnAccept = jest.fn();
    const mockLoading = false;

    const renderWithContext = (contextValue) => {
        return render(
            <FriendsContext.Provider value={contextValue}>
                <PendingFriends />
            </FriendsContext.Provider>
        );
    };

    beforeEach(() => {
        jest.spyOn(console, 'error').mockImplementation(() => { });
        jest.spyOn(window, 'alert').mockImplementation(() => { });
        getDownloadURL.mockResolvedValue('https://example.com/avatar.png');
        uploadBytes.mockResolvedValue();
        global.fetch = jest.fn(() =>
            Promise.resolve({
                blob: () => Promise.resolve(new Blob(['avatar'])),
            })
        );
        jest.spyOn(Storage.prototype, 'removeItem');
    });

    afterEach(() => {
        console.error.mockRestore();
        window.alert.mockRestore();
    });

    test("shows loading state", () => {
        renderWithContext({
            onReject: mockOnReject,
            onAccept: mockOnAccept,
            friendRequests: [],
            loading: true,
        });
        expect(screen.getByText(/Loading Friend Requests.../i)).toBeInTheDocument();
    });


    test('renders the list of friends correctly', async () => {
        renderWithContext({
            onAccept: mockOnAccept,
            onReject: mockOnReject,
            friends: mockFriendsData,
            loading: mockLoading,
        });

        // Use getAllByText to find friend names inside the span tags
        const friendNames = screen.getAllByText(/Name/i); // This will find both Name1 and Name2

        // Assert that the friend names are displayed
        expect(friendNames[0]).toHaveTextContent('Name1');
        expect(friendNames[1]).toHaveTextContent('Name2');
    });


    test('renders the empty list of friends correctly', async () => {
        renderWithContext({
            onReject: mockOnReject,
            onAccept: mockOnAccept,
            friendRequests: [],
            loading: mockLoading,
        });

        expect(screen.getByText(/No pending invitations./i)).toBeInTheDocument();
    });

    test('renders the invitation actions and handles accept/reject button clicks', async () => {
        renderWithContext({
            onAccept: mockOnAccept,
            onReject: mockOnReject,
            friendRequests: mockRequestData,
            loading: mockLoading,
        });

        // Select accept and reject buttons by querying the icons inside them
        //const acceptIcons = screen.getAllByClassName('bi-check2-circle');  // Select by icon class for accept button

        const acceptButtons = screen.getAllByRole('button', { name: /add friend/i });
        const rejectButtons = screen.getAllByRole('button', { name: /remove friend/i });
        // Assert that the correct number of accept and reject icons exist
        expect(acceptButtons).toHaveLength(mockRequestData.length);
        expect(rejectButtons).toHaveLength(mockRequestData.length);

        // Simulate a click event on the first accept button (by clicking the parent button of the icon)
        fireEvent.click(acceptButtons[0].parentElement); // Click the parent button of the icon

        // Check if onAccept was called with the correct parameters (inv.id, 'accept_friend', "PATCH")
        expect(mockOnAccept).toHaveBeenCalledWith(mockRequestData[0].id, 'accept_friend', 'PATCH');
        expect(mockOnAccept).toHaveBeenCalledTimes(1); // Ensure it was called exactly once

        // Simulate a click event on the first reject button (by clicking the parent button of the icon)
        fireEvent.click(rejectButtons[0].parentElement); // Click the parent button of the icon

        // Check if onReject was called with the correct inv.id (in this case, 1)
        expect(mockOnReject).toHaveBeenCalledWith(mockRequestData[0].id);
        expect(mockOnReject).toHaveBeenCalledTimes(1); // Ensure it was called exactly once

        // Optionally, you can simulate another click for the second buttons and check again
        fireEvent.click(acceptButtons[1].parentElement);
        expect(mockOnAccept).toHaveBeenCalledWith(mockRequestData[1].id, 'accept_friend', 'PATCH');
        expect(mockOnAccept).toHaveBeenCalledTimes(2); // Ensure it was called exactly twice

        fireEvent.click(rejectButtons[1].parentElement);
        expect(mockOnReject).toHaveBeenCalledWith(mockRequestData[1].id);
        expect(mockOnReject).toHaveBeenCalledTimes(2); // Ensure it was called exactly twice
    });



});