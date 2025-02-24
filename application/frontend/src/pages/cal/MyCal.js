import {React} from 'react'
import { Calendar } from '@fullcalendar/core';
//import interactionPlugin, { Draggable } from '@fullcalendar/interaction';
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid' // a plugin!
import timeGridPlugin from '@fullcalendar/timegrid'
const MyCal = () => {
    return (
        <FullCalendar
            plugins={[ dayGridPlugin, timeGridPlugin ]}
            initialView="timeGridWeek"
            events={[
                { title: 'event 1', date: '2025-02-25' },
                { title: 'event 2', date: '2025-02-23', allDay: false }
              ]}
        
            headerToolbar = {{
                left: 'prev,today,next',
                center: 'title',
                right: 'timeGridWeek,dayGridMonth,dayGridYear'

            }}
        


        />
    )
    
}
export default MyCal