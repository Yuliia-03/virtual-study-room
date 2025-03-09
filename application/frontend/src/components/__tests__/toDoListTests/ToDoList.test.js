import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import ToDoList from '../../ToDoListComponents/ToDoList';
import * as authService from '../../../utils/authService'; // Import authService
import axios from 'axios';

// Mock axios
jest.mock('axios');

// Mock the `getAuthenticatedRequest` function to avoid hitting real endpoints and simulate success or failure.
jest.mock('../../../utils/authService', () => ({
    getAuthenticatedRequest: jest.fn(),
}));

const mockListsData = [
    {
        id: 1,
        name: "List 1",
        tasks: [
            { id: 1, title: "Task 1", content: "Task 1 details", is_completed: false },
            { id: 2, title: "Task 2", content: "Task 2 details", is_completed: true },
        ],
    },
    {
        id: 2,
        name: "List 2",
        tasks: [
            { id: 3, title: "Task 3", content: "Task 3 details", is_completed: false },
        ],
    },
];

describe("ToDoList", () => {

    let mockSetLists;
    let mockSetLoading;

    beforeEach(() => {
        mockSetLists = jest.fn();
        mockSetLoading = jest.fn();
    });

    const setup = () => {
        render(<ToDoList />);
    };

    test('renders the list of to-do lists correctly', async () => {
        authService.getAuthenticatedRequest.mockResolvedValue(mockListsData);

        setup();
        await waitFor(() => expect(authService.getAuthenticatedRequest).toHaveBeenCalled());
        await waitFor(() => expect(screen.getByText('To-Do Lists')).toBeInTheDocument());
        expect(screen.getByText('List 1')).toBeInTheDocument();
    });

    test('should toggle task completion status correctly', async () => {
        authService.getAuthenticatedRequest.mockResolvedValue(mockListsData);
        render(<ToDoList />);
        await waitFor(() => screen.queryByText(/Loading To-Do Lists.../i), { timeout: 3000 });
        const taskCheckbox = screen.getAllByRole('checkbox'); // Use `getAllByRole` for multiple checkboxes
        await act(async () => {
            fireEvent.click(taskCheckbox[0]); // This triggers the state update
        });
        
        expect(taskCheckbox[0].checked).toBe(true); // Adjust this according to the completion logic

        const taskLabel = screen.getByText(/Task 1/i);
        expect(taskLabel).toHaveClass('completed');

    });



});
