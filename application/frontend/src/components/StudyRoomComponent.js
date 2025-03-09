import React, { useState } from 'react';
import axios from "axios";
import GroupStudyRoom from '../pages/GroupStudyPage';
import { getAuthenticatedRequest } from "../pages/utils/authService";

const StudyRoomComponent = () => {

    // Web socket handling
    const [roomCode, setRoomCode] = useState("");   // Ensure that the room code is defined
    const [roomName, setRoomName] = useState("");
    const [joined, setJoined] = useState(false);

    // Method to create Room
    const createRoom = async () => {
        console.log("Creating room...");

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


    // Methods to join room
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


    return(
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
    );
};

export default StudyRoomComponent;