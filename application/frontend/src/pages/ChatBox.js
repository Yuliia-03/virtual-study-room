import React, { Component} from "react";
import { w3websocket as W3CWebSocket } from "websocket";


const Analytics = () => {
    // useEffect(() => {
    //     const fetchAnalytics = async () => {
    //         const token = localStorage.getItem("access_token"); // Get the access token from localStorage

    //         if (!token) {
    //             console.error("No access token found. Please log in.");
    //             return;
    //         }

    //         try {
    //             const response = await axios.get(
    //                 // "https://studyspot.pythonanywhere.com/api/analytics/",
    //                 "http://127.0.0.1:8000/api/chatbox/", // Endpoint for fetching analytics
    //                 {
    //                     headers: {
    //                         Authorization: `Bearer ${token}`, // Include the access token in the request
    //                     },
    //                     withCredentials: true,
    //                 }
    //             );
    //             setAnalytics(response.data); // Set the analytics data
    //         } catch (error) {
    //             console.error(
    //                 "Error fetching analytics:",
    //                 error.response ? error.response.status : error.message
    //             );
    //         }
    //     };

    //     fetchAnalytics();
    // }, []); // Empty dependency array ensures this runs only once when the component mounts

    state =  {
        isLoggedIn: false,
        messages: [],
        value:'',
        name:'',
        room: 'testRoom',
    }
    render() {
        return (
            <Container component="main" maxWidth="xs">
                 {this.state.isLoggedIn ? : }

            </Container>
         );
    }
    
};

export default ChatBox;
