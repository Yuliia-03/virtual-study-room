// MyCal.js
import React, { useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';

const MyCal = ({ myEvents }) => {
    const calendarRef = useRef(null);

    // Handle dropping an event onto the calendar
    const handleEventReceive = (info) => {
        const task = JSON.parse(info.draggedEl.getAttribute('data-task'));
        const newEvent = {
            ...task,
            start: info.dateStr,
            allDay: true,
        };

        console.log('Event dropped:', newEvent);
        // Here, you could make an API call to update the event's start date in your backend
    };

    return (
        <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            editable={true}
            droppable={true}
            events={myEvents}
            eventReceive={handleEventReceive}
        />
    );
};

export default MyCal;

