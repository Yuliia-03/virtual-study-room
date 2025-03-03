import React, { useState } from 'react';
import "../styles/Dashboard.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import ToDoList from '../pages/ToDoList';
import StudySession from "./StudySession";

function Dashboard() {

    // Web socket handling
    const [roomId, setRoomId] = useState("")
    const [joined, setJoined] = useState(false);

    const createRoom = async () => {
        const res = await fetch("http://localhost:8000/api/create-room/", { method: "POST" });
        const data = await res.json();
        setRoomCode(data.roomCode);
        setJoined(true);
    };

    const joinRoom = async () => {
        const res = await fetch("http://localhost:8000/api/join-room/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ roomCode })
        });
        if (res.ok) setJoined(true);
    };

    return (
        <div className='dashboard-container'>
            <h1 className="dashboard-heading">Dashboard</h1> {/* A simple heading */}

            {/* This is where all the main components will go*/}
            {/* Left panel - main panel - right panel*/}
            <div class = "dashboard-content">
                <div class = "dashboard-left-panel">
                    <div>
                        {!joined ? (
                            <>
                                <button onClick={createRoom}>Create Room</button>
                                <input value={roomCode} onChange={(e) => setRoomCode(e.target.value)} />
                                <button onClick={joinRoom}>Join Room</button>
                            </>
                        ) : (
                            <Room roomCode={roomCode} />
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
                    <div class="dashboard-panel">To Do List</div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
