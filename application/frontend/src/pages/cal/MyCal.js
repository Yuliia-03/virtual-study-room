import {React} from 'react'
import { Calendar } from '@fullcalendar/core';
//import interactionPlugin, { Draggable } from '@fullcalendar/interaction';
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid' // a plugin!
import timeGridPlugin from '@fullcalendar/timegrid'
const MyCal = ({myEvents}) => {
    return (
        <FullCalendar
            plugins={[ dayGridPlugin, timeGridPlugin ]}
            initialView="timeGridWeek"
            events={myEvents}
        
            headerToolbar = {{
                left: 'prev,today,next',
                center: 'title',
                right: 'timeGridWeek,dayGridMonth,dayGridYear'

            }}
        


        />
    )
    
}
export default MyCal