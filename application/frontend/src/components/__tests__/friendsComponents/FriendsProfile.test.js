import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import FriendsProfile from '../../friends/FriendsProfile';
import { getAuthenticatedRequest } from "../../../utils/authService";
import { getDownloadURL } from 'firebase/storage';

// Mocking external modules
jest.mock("../../../utils/authService", () => ({
    getAuthenticatedRequest: jest.fn(),
}));

jest.mock('firebase/storage');
jest.mock('../../../firebase-config.js');
jest.mock('react-toastify', () => ({
    toast: {
        error: jest.fn(),
        success: jest.fn(),
    },
}));

const mockFriendsProfile = {
    id: 1,
    name: 'John',
    surname: 'Doe',
    username: '@johndoe',
    email: 'johndoe@example.com',
    hours_studied: 50,
    streaks: 10,
    share_analytics: true,
};

describe("FriendsProfile", () => {
    let setAddUserWindow;

    beforeEach(() => {
        // Mock the setAddUserWindow function
        setAddUserWindow = jest.fn();
        getDownloadURL.mockResolvedValue("https://example.com/avatar.jpg");
        getAuthenticatedRequest.mockResolvedValue(mockFriendsProfile);
    });

    test('renders loading state initially', () => {
        render(<FriendsProfile FriendsId={1} addUserWindow={true} setAddUserWindow={setAddUserWindow} />);

        // Check if loading text is shown initially
        expect(screen.getByText(/Loading.../i)).toBeInTheDocument();
    });

    test('renders error message if fetch fails', async () => {
        // Simulate an error by making the mock return an error
        getAuthenticatedRequest.mockRejectedValue(new Error("Failed to load profile"));

        render(<FriendsProfile FriendsId={1} addUserWindow={true} setAddUserWindow={setAddUserWindow} />);

        await waitFor(() => {
            // Check if error message is displayed
            expect(screen.getByText(/Failed to load profile./i)).toBeInTheDocument();
        });
    });

    test('renders the profile correctly when data is fetched', async () => {
        // Wrap the async code inside act() to ensure state updates are handled
        await act(async () => {
            render(<FriendsProfile FriendsId={1} addUserWindow={true} setAddUserWindow={setAddUserWindow} />);
        });

        // Use waitFor to ensure the component has completed rendering and state updates
        await waitFor(() => {
            // Check that profile details are rendered
            expect(screen.getByText(mockFriendsProfile.name + ' ' + mockFriendsProfile.surname)).toBeInTheDocument();
            expect(screen.getByText(mockFriendsProfile.username)).toBeInTheDocument();

            expect(screen.getByText(mockFriendsProfile.email)).toBeInTheDocument();
        });

        // Check if the profile image is correctly displayed
        expect(screen.getByAltText("Profile")).toHaveAttribute("src", "https://example.com/avatar.jpg");
    });


    test('closes the modal when close button is clicked', () => {
        render(<FriendsProfile FriendsId={1} addUserWindow={true} setAddUserWindow={setAddUserWindow} />);

        const closeButton = screen.getByText("×");
        fireEvent.click(closeButton);

        // Check if setAddUserWindow is called to close the modal
        expect(setAddUserWindow).toHaveBeenCalledWith(false);
    });

    test('does not render anything when addUserWindow is false', () => {
        render(<FriendsProfile FriendsId={1} addUserWindow={false} setAddUserWindow={setAddUserWindow} />);

        // Ensure that nothing is rendered when addUserWindow is false
        expect(screen.queryByText(/Loading.../i)).not.toBeInTheDocument();
    });
    test('closes the modal when the overlay is clicked', async () => {
        render(<FriendsProfile FriendsId={1} addUserWindow={true} setAddUserWindow={setAddUserWindow} />);

        // Find the modal-overlay element and simulate a click on it
        const overlay = screen.getByTestId('modal-overlay');
        fireEvent.click(overlay);

        // Check if the setAddUserWindow was called with 'false' to close the modal
        expect(setAddUserWindow).toHaveBeenCalledWith(false);
    });
});
