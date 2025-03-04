import { React, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';

// Assume you are using fetch or axios to send data to your backend
// Backend URL to save event
const backendURL = 'http://127.0.0.1:8000/appointments/';

const MyCal = () => {
    const [myEvents, setMyEvents] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null);
    
    // States for popup form
    const [showPopup, setShowPopup] = useState(false);
    const [eventTitle, setEventTitle] = useState('');
    const [eventDescription, setEventDescription] = useState('');
    const [eventStart, setEventStart] = useState('');
    const [eventEnd, setEventEnd] = useState('');

    // Open the add event popup
    const openAddEventPopup = () => {
        setShowPopup(true);
    };

    // Close the add event popup
    const closeAddEventPopup = () => {
        setShowPopup(false);
    };

    // Submit event form and save it to backend
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Create event object
        const newEvent = {
            title: eventTitle,
            description: eventDescription,
            start: eventStart,
            end: eventEnd,
        };

        // Send data to backend
        try {
            const response = await fetch(backendURL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newEvent),
            });

            if (response.ok) {
                const savedEvent = await response.json();
                // Add the saved event to state
                setMyEvents([...myEvents, savedEvent]);

                // Close popup after submission
                closeAddEventPopup();

                // Reset form values
                setEventTitle('');
                setEventDescription('');
                setEventStart('');
                setEventEnd('');
            } else {
                alert('Error saving event.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error connecting to backend.');
        }
    };

    // Event click handler to open popup
    const handleEventClick = (info) => {
        setSelectedEvent(info.event);
    };

    // Close the event popup
    const closePopup = () => {
        setSelectedEvent(null);
    };

    return (
        <div>
            {/* Button to open the Add Event popup */}
            <button onClick={openAddEventPopup}>Add Event</button>

            {/* Add Event Popup Form */}
            {showPopup && (
                <div className="event-popup">
                    <div className="popup-content">
                        <h2>Add Event</h2>
                        <form onSubmit={handleSubmit}>
                            <div>
                                <label>Title: </label>
                                <input
                                    type="text"
                                    value={eventTitle}
                                    onChange={(e) => setEventTitle(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label>Description: </label>
                                <textarea
                                    value={eventDescription}
                                    onChange={(e) => setEventDescription(e.target.value)}
                                />
                            </div>
                            <div>
                                <label>Start: </label>
                                <input
                                    type="datetime-local"
                                    value={eventStart}
                                    onChange={(e) => setEventStart(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label>End: </label>
                                <input
                                    type="datetime-local"
                                    value={eventEnd}
                                    onChange={(e) => setEventEnd(e.target.value)}
                                />
                            </div>
                            <button type="submit">Save Event</button>
                            <button type="button" onClick={closeAddEventPopup}>Cancel</button>
                        </form>
                    </div>
                </div>
            )}

            {/* FullCalendar Component */}
            <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin]}
                initialView="timeGridWeek"
                events={myEvents}
                headerToolbar={{
                    left: 'prev,today,next',
                    center: 'title',
                    right: 'timeGridWeek,dayGridMonth,dayGridYear',
                }}
                eventClick={handleEventClick}
            />

            {/* Event Popup */}
            {selectedEvent && (
                <div className="event-popup">
                    <div className="popup-content">
                        <h2>Event Details</h2>
                        <p><strong>Title:</strong> {selectedEvent.title}</p>
                        <p><strong>Start:</strong> {selectedEvent.start.toLocaleString()}</p>
                        <p><strong>End:</strong> {selectedEvent.end ? selectedEvent.end.toLocaleString() : 'N/A'}</p>
                        <p><strong>Description:</strong> {selectedEvent.extendedProps.description || 'No description available'}</p>
                        <button onClick={closePopup}>Close</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyCal;
