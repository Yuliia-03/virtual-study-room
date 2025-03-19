import React from 'react';
import "../styles/Dashboard.css";
import axios from "axios";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
// import ToDoList from '../pages/ToDoList';
import CalendarPage from './Calendar';
import ToDoList from '../components/ToDoListComponents/newToDoList';
import StudyRoomComponent from '../components/StudyRoomComponent';
import Analytics from './Analytics';
import  FriendsTab  from '../components/friends/FriendsTab';

import ProfileBox from './ProfileBox';

function Dashboard() { 
    const navigate = useNavigate();

    const gotoCalendar = () => {
        const user_id = localStorage.getItem('user_id');
        console.log(user_id);
        navigate(`/calendar/`, {
            state: { userId : user_id }
        });
        }

    return (
        <div className='dashboard-container'>
            <h1 className="dashboard-heading">Dashboard</h1> {/* A simple heading */}

            {/* This is where all the main components will go*/}
            {/* Left panel - main panel - right panel*/}
            <div className = "dashboard-content">
                <div className = "dashboard-left-panel" data-testid="left-panel">
                    <Analytics />
                    <div className="dashboard-panel">
                    <button
                        className="CalendarButton"
                        onClick={gotoCalendar}
                        style={{
                            width: '45px',
                            height: '45px',
                            borderRadius: '50%',
                            backgroundColor: '#bad7f5', // Static background color
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '24px',
                            transition: 'all 0.2s ease-in-out',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                            marginBottom: '10px',
                        }}
                    >
                        📅
                    </button>
                    </div>
                </div>
                <div className = "dashboard-main-panel" data-testid="main-panel">
                    <div className="dashboard-panel"><ProfileBox /></div>
                    <div className="dashboard-panel"><FriendsTab /></div>
                </div>
                <div className = "dashboard-right-panel" data-testid="right-panel">
                    <StudyRoomComponent />
                    <div><ToDoList
                        isShared={false}
                        listData={[]}
                    />
                    </div>
                </div>

                </div>
            </div>
         );
}

export default Dashboard;
