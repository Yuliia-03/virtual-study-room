// Calendar1.js
import React, { useEffect, useState } from 'react';
import MyCal from './cal/MyCal';
import axios from 'axios';

const Calendar1 = () => {
    const [appointments, setAppointments] = useState([]);
    const [unscheduledTasks, setUnscheduledTasks] = useState([]);

    // Fetch data from the backend
    const GetData = async () => {
        try {
            const response = await axios.get('http://127.0.0.1:8000/appointments/', {
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            console.log('Appointments fetched:', response.data);

            // Check if the response is an array and handle accordingly
            if (Array.isArray(response.data)) {
                const scheduledEvents = response.data.filter(event => event.start);
                const unscheduledEvents = response.data.filter(event => !event.start);
                setAppointments(scheduledEvents);
                setUnscheduledTasks(unscheduledEvents);
            } else {
                console.error('Expected an array but received:', typeof response.data);
            }

        } catch (error) {
            console.error('Error fetching data:', error.message, error);
        }
    };

    // Call the data fetching function once when the component mounts
    useEffect(() => {
        GetData();
    }, []);

    return (
        <div style={{ display: 'flex' }}>
            <div style={{ flex: '1', padding: '10px' }}>
                <h1>Appointments</h1>
                <MyCal myEvents={appointments} />
            </div>

            <div style={{ flex: '1', padding: '10px', borderLeft: '1px solid #ddd' }}>
                <h2>Unscheduled Tasks</h2>
                <ul>
                    {unscheduledTasks.map(task => (
                        <li key={task.id} draggable={true} onDragStart={(e) => {
                            e.dataTransfer.setData('text/plain', JSON.stringify(task));
                        }}>
                            {task.title}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default Calendar1;
