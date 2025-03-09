import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const CreateStudyRoom = () => {
    // Web socket handling
    const [roomCode, setRoomCode, setUser] = useState("")    // Ensure that the room code is defined
    const [joined, setJoined] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem("access_token");
            // takes the access token from localStorage

            if (!token) {
                console.error("No access token found. Please log in.");
                return;
            }

            try {
                const response = await axios.get(
                    "https://127.0.0.1:8000/api/createStudyRoom/",
                    // creates an endpoint for fetching user
                    // use this in production : "https://studyspot.pythonanywhere.com/api/createStudyRoom/",

                { headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    withCredentials: true,
                } );

                setUser(response);  // set user

                }

                catch (error) {
                    console.error(
                    "Error fetching user:",
                    error.response ? error.response.status : error.message);
                }
        };

        fetchUser();
    }, []); // Empty dependency array ensures this runs only once when the component mounts
}