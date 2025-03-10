
import React, { useState } from 'react';
import "../styles/Dashboard.css";
import ToDoList from '../components/ToDoListComponents/ToDoList';
import Analytics from './Analytics';
import Friends from '../components/Friends';

function Dashboard() {
    return (
        <div className='dashboard-container'>
            <h1 className="dashboard-heading">Dashboard</h1> {/* A simple heading */}

            {/* This is where all the main components will go*/}
            {/* Left panel - main panel - right panel*/}
            <div class = "dashboard-content">
                <div class = "dashboard-left-panel">
                    <Analytics />
                    <div class="dashboard-panel">Calendar</div>
                    <div class="dashboard-panel">Invites</div>
                </div>
                <div class = "dashboard-main-panel">
                    <div class="dashboard-panel">Profile</div>
                    <div class="dashboard-panel"><Friends/></div>
                    {/*<div class="dashboard-panel">Add Friends</div>*/}
                </div>
                <div class = "dashboard-right-panel">
                    <div class="dashboard-panel">Generate Group Study Room</div>
                    <div class="dashboard-panel"><ToDoList/></div>
                </div>
            </div>

        </div>
    );
}

export default Dashboard;
