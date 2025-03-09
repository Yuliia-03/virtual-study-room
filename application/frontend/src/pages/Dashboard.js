
import React, { useState } from 'react';
import "../styles/Dashboard.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import ToDoList from '../pages/ToDoList';
import GroupStudyRoom from '../pages/GroupStudyPage';
import Analytics from './Analytics';

import { getAuthenticatedRequest } from "./utils/authService";

function Dashboard() {

    // Web socket handling
    const [roomCode, setRoomCode] = useState("");   // Ensure that the room code is defined
    const [roomName, setRoomName] = useState("");
    const [joined, setJoined] = useState(false);

    const createRoom = async () => {
        console.log("Saving room...");

        try {

            // This stuff gets sent to the backend!
            const response = await getAuthenticatedRequest("/create-room/", "POST", {
                sessionName: roomName,  // Sends the room name to the backend
            });
            setRoomCode(response.data.roomCode);
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

            if (res.status === 200) setJoined(true);
        }

        catch (error) {
            console.error("Error joining room:", error)}
    };

    return (
        <div className='dashboard-container'>
            <h1 className="dashboard-heading">Dashboard</h1> {/* A simple heading */}

            {/* This is where all the main components will go*/}
            {/* Left panel - main panel - right panel*/}
            <div className = "dashboard-content">
                <div className = "dashboard-left-panel">
                    <Analytics />
                    <div className="dashboard-panel">Calendar</div>
                    <div className="dashboard-panel">Invites</div>
                </div>

                <div className = "dashboard-main-panel">
                    <div className="dashboard-panel">Profile</div>
                    <div className="dashboard-panel">Friends List</div>
                    <div className="dashboard-panel">Add Friends</div>
                </div>

                <div className = "dashboard-right-panel">
                    <div className="dashboard-panel">Generate Group Study Room
                        <div>
                            {!joined ? (
                                <>
                                    {/* To create a study room, text field to enter a room name ( NOT CODE, code is auto generated ) */}

                                    <input
                                        type = "text"
                                        placeholder = "What do we feel like studying? :D"
                                        value = {roomName}
                                        onChange={(e) => setRoomName(e.target.value)}
                                    />
                                    <button onClick={createRoom}>Create Room</button>

                                    {/* For joining the room, there is also a text input for the room code"*/}

                                    <input value={roomCode} onChange={(e) => setRoomCode(e.target.value)} />
                                    <button onClick={joinRoom}>Join Room</button>
                                </>
                            ) : (
                                <GroupStudyRoom roomCode={roomCode} />
                            )}
                        </div>
                    </div>
                    <div className="dashboard-panel"><ToDoList/></div>
                </div>

                </div>
            </div>
         );
}

export default Dashboard;
