import React from 'react';
import "../styles/Dashboard.css";
import ToDoList from '../components/ToDoListComponents/ToDoList';

import StudyRoomComponent from '../components/StudyRoomComponent';
import Analytics from './Analytics';
import Friends from '../components/Friends';


function Dashboard() {

    return (
        <div className='dashboard-container'>
            <h1 className="dashboard-heading">Dashboard</h1> {/* A simple heading */}

            {/* This is where all the main components will go*/}
            {/* Left panel - main panel - right panel*/}
            <div className = "dashboard-content">
                <div className = "dashboard-left-panel" data-testid="left-panel">
                    <Analytics />
                    <div className="dashboard-panel">Calendar</div>
                    <div className="dashboard-panel">Invites</div>
                </div>
                <div class = "dashboard-main-panel">
                    <div class="dashboard-panel">Profile</div>
                    <div class="dashboard-panel"><Friends/></div>
                    {/*<div class="dashboard-panel">Add Friends</div>*/}
                </div>
                <div className = "dashboard-right-panel" data-testid="right-panel">
                    <StudyRoomComponent />
                    <div className="dashboard-panel"><ToDoList/></div>
                </div>

                </div>
            </div>
         );
}

export default Dashboard;
