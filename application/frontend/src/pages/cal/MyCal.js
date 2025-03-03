import { React, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
//import '../styles/calendar.css'; // One directory up
//import ".../styles/calendar.css";

const MyCal = ({ myEvents }) => {
    // Get today's date (without time)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // State to hold the selected event for the popup
    const [selectedEvent, setSelectedEvent] = useState(null);

    // Process events to set colors dynamically
    const processedEvents = myEvents.map(event => {
        const eventDate = new Date(event.start); // Assuming `start` holds the date
        eventDate.setHours(0, 0, 0, 0); // Normalize to ignore time differences

        let backgroundColor = '#BAD7F2'; // Future events (Red)
        if (eventDate < today) {
            backgroundColor = '#F2BAC9'; // Past events (Green)
        } else if (eventDate.getTime() === today.getTime()) {
            backgroundColor =  '#B0F2B4'; // Today's events (Yellow)
        }

        return {
            ...event,
            backgroundColor,
            borderColor: backgroundColor,
            textColor: 'black', // Set text color explicitly
            classNames: ['rounded-event'],
        };
    });

    // Event click handler to open popup
    const handleEventClick = (info) => {
        setSelectedEvent(info.event); // Store the clicked event in state
    };

    // Close the popup
    const closePopup = () => {
        setSelectedEvent(null); // Reset the event
    };

    return (
        <div className = "calendar">
            {/* FullCalendar Component */}
            <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin]}
                initialView="timeGridWeek"
                events={processedEvents}
                headerToolbar={{
                    left: 'prev,today,next',
                    center: 'title',
                    right: 'timeGridWeek,dayGridMonth,dayGridYear',
                }}
                eventClick={handleEventClick} // Handle event click
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