import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import CalendarPage from '../pages/Calendar1';

jest.mock('axios');

describe('CalendarPage Component', () => {
  let originalLocation;

  beforeAll(() => {
    originalLocation = window.location;
    delete window.location;
    window.location = { assign: jest.fn() };
  });

  afterAll(() => {
    window.location = originalLocation;
  });

  beforeEach(() => {
    // Mocking localStorage
    const mockAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' + 
                            'eyJleHAiOjE2Mjk2Mjk2MDB9.' + 
                            'SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
    Storage.prototype.getItem = jest.fn().mockImplementation((key) => {
      if (key === 'access_token') return mockAccessToken;
      return null;
    });
    Storage.prototype.setItem = jest.fn();
    Storage.prototype.removeItem = jest.fn();

    // Mock the decodeJWT function
    global.decodeJWT = jest.fn().mockReturnValue({ exp: Math.floor(Date.now() / 1000) + 3600 });

    // Mocking the axios.get and axios.post functions
    axios.get.mockResolvedValue({ status: 200, data: [{ id: 1, title: 'Event 1', start: '2025-01-01T10:00', end: '2025-01-01T12:00' }] });
    axios.post.mockResolvedValue({ status: 201, data: { id: 2, title: 'New Event', start: '2025-01-02T10:00', end: '2025-01-02T12:00' } });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders CalendarPage correctly', () => {
    render(<CalendarPage />);
    
    // Check if the CalendarPage title is displayed
    expect(screen.getByText('My Calendar')).toBeInTheDocument();
  });

  test('displays events correctly', async () => {
    render(<CalendarPage />);
    
    // Wait for events to be fetched
    await waitFor(() => {
      expect(screen.getByText('Event 1 - 2025-01-01T10:00 to 2025-01-01T12:00')).toBeInTheDocument();
    });
  });

  test('handles adding new event', async () => {
    render(<CalendarPage />);
    
    // Find the form elements and input event details
    const titleInput = screen.getByPlaceholderText('Event Title');
    const descriptionInput = screen.getByPlaceholderText('Event Description');
    const startInput = screen.getByLabelText('start');
    const endInput = screen.getByLabelText('end');
    
    // Simulate user input
    fireEvent.change(titleInput, { target: { value: 'New Event' } });
    fireEvent.change(descriptionInput, { target: { value: 'Event description' } });
    fireEvent.change(startInput, { target: { value: '2025-01-02T10:00' } });
    fireEvent.change(endInput, { target: { value: '2025-01-02T12:00' } });

    // Submit the form
    const submitButton = screen.getByText('Add Event');
    fireEvent.click(submitButton);
    
    // Wait for the new event to be displayed
    await waitFor(() => {
      expect(screen.getByText('New Event - 2025-01-02T10:00 to 2025-01-02T12:00')).toBeInTheDocument();
    });

    // Verify axios.post was called with the correct data
    expect(axios.post).toHaveBeenCalledWith(
      'http://127.0.0.1:8000/api/events/',
      {
        title: 'New Event',
        description: 'Event description',
        start: '2025-01-02T10:00',
        end: '2025-01-02T12:00',
      },
      expect.objectContaining({
        headers: {
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2Mjk2Mjk2MDB9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
        },
      })
    );
  });

  test('handles token expiration and redirects to login', async () => {
    // Mock axios call to return 401 (Unauthorized)
    axios.get.mockRejectedValueOnce({ response: { status: 401 } });

    // Render the component
    render(<CalendarPage />);
    
    // Wait for the redirect to login after token expiry
    await waitFor(() => {
      expect(window.location.assign).toHaveBeenCalledWith('/login');
    });
  });
});