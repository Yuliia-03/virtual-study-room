import React, { useEffect, useState } from 'react';
import { getAuthenticatedRequest } from "./utils/authService";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useLocation } from 'react-router-dom';

const backendURL = '/events/';

const CalendarPage = () => {
    const [myEvents, setMyEvents] = useState([]);
    const [eventTitle, setEventTitle] = useState('');
    const [eventDescription, setEventDescription] = useState('');
    const [eventStart, setEventStart] = useState('');
    const [eventEnd, setEventEnd] = useState('');
    const location = useLocation();
    const userId = location.state.userId;

    const fetchEvents = async () => {
        try {
            const response = await getAuthenticatedRequest(backendURL, "GET");
            const userEvents = response.filter(event => event.user === userId);
            setMyEvents(userEvents);
        } catch (error) {
            console.error('Error fetching events:', error);
            toast.error('Error fetching events');
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const newEvent = {
                title: eventTitle,
                description: eventDescription,
                start: eventStart,
                end: eventEnd,
                user: userId
            };

            const response = await getAuthenticatedRequest(backendURL, "POST", newEvent);

            if (response) {
                setMyEvents([...myEvents, response]);
                setEventTitle('');
                setEventDescription('');
                setEventStart('');
                setEventEnd('');
                toast.success('Event added successfully');
            } else {
                toast.error('Error saving event.');
            }
        } catch (error) {
            console.error('Error saving event:', error);
            toast.error('Error connecting to backend.');
        }
    };

    return (
        <div>
            <h1>My Calendar</h1>
            <ToastContainer position='top-center'/>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Event Title"
                    value={eventTitle}
                    onChange={(e) => setEventTitle(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Event Description"
                    value={eventDescription}
                    onChange={(e) => setEventDescription(e.target.value)}
                />
                <input
                    type="datetime-local"
                    value={eventStart}
                    onChange={(e) => setEventStart(e.target.value)}
                />
                <input
                    type="datetime-local"
                    value={eventEnd}
                    onChange={(e) => setEventEnd(e.target.value)}
                />
                <button type="submit">Add Event</button>
            </form>
            <div>
                <h2>Upcoming Events</h2>
                <ul>
                    {myEvents.map((event) => (
                        <li key={event.id}>
                            {event.title} - {event.start} to {event.end}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default CalendarPage;