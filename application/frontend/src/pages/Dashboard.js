import React, { useState } from 'react';
import "../styles/Dashboard.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import ToDoList from '../pages/ToDoList';
import GroupStudyRoom from '../pages/GroupStudyPage';
import Analytics from './Analytics';

function Dashboard() {

    // Web socket handling
    const [roomCode, setRoomCode] = useState("")    // Ensure that the room code is defined
    const [joined, setJoined] = useState(false);

    const createRoom = async () => {
        try {
            const res = await axios.post("http://localhost:8000/api/create-room/");
            setRoomCode(res.data.roomCode);
            setJoined(true);
        }

        catch (error) {
            console.error("Error creating room: ", error)
        }
    };

    const joinRoom = async () => {
        try {
            const res = await axios.post("http://localhost:8000/api/join-room/", {
                roomCode
            }, {
                headers: { "Content-Type" : "application/json" }
            });

            if (res.statue === 200) setJoined(true);
        }

        catch (error) {
            console.error("Error joining room:", error)}
    };

    return (
        <div className='dashboard-container'>
            <h1 className="dashboard-heading">Dashboard</h1> {/* A simple heading */}

            {/* This is where all the main components will go*/}
            {/* Left panel - main panel - right panel*/}
            <div class = "dashboard-content">
                <div class = "dashboard-left-panel">
                    <Analytics />
                    <div>
                        {!joined ? (
                            <>
                                <button onClick={createRoom}>Create Room</button>
                                <input value={roomCode} onChange={(e) => setRoomCode(e.target.value)} />
                                <button onClick={joinRoom}>Join Room</button>
                            </>
                        ) : (
                            <GroupStudyRoom roomCode={roomCode} />
                        )}
                    </div>
                    <div class="dashboard-panel">Analytics</div>
                    <div class="dashboard-panel">Calendar</div>
                    <div class="dashboard-panel">Invites</div>
                </div>
                <div class = "dashboard-main-panel">
                    <div class="dashboard-panel">Profile</div>
                    <div class="dashboard-panel">Friends List</div>
                    <div class="dashboard-panel">Add Friends</div>
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
