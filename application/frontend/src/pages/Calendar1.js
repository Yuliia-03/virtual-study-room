//import {React, useEffect, useState} from 'react';
import MyCal from './cal/MyCal';
import axios from 'axios'; 
import AxiosInstance from './AxiosInstance';
import React, { useEffect, useState } from 'react';

const Calendar1 = () => {
    const [appointments, setAppointments] = useState([]);

    const GetData = async () => {
        try {
            const response = await axios.get('http://127.0.0.1:8000/appointments/', {
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            setAppointments(response.data);
            console.log('Appointments fetched:', response.data);
        } catch (error) {
            console.error('Error fetching data:', error.message, error);
        }
    };

    useEffect(() => {
        GetData();
    }, []);

    return (
        <div>
            <h1>Appointments</h1>
            <MyCal 
            myEvents={appointments}
            />
        </div>
    );
};

export default Calendar1;