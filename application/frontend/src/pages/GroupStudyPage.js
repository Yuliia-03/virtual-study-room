import React, { useEffect, useState } from 'react';
import "../styles/GroupStudyPage.css";
import MotivationalMessage from './Motivation';
import musicLogo from "../assets/music_logo.png";
import customLogo from "../assets/customisation_logo.png";
import copyLogo from "../assets/copy_logo.png";
import exitLogo from "../assets/exit_logo.png";
import StudyTimer from '../components/StudyTimer.js';
import { useParams, useLocation } from 'react-router-dom';
import "../styles/ChatBox.css";
import { getAuthenticatedRequest } from "./utils/authService";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from "react-router-dom";


function GroupStudyPage(){

    // Location object used for state
    const location = useLocation();

    const { roomCode, roomName } = location.state || { roomCode: '', roomName: '' };
    // Retrieve roomCode and roomName from state

    // Retrieve roomCode from state if not in URL
    const stateRoomCode = location.state?.roomCode;
    const finalRoomCode = roomCode || stateRoomCode;
    // finalRoomCode is what we should refer to!

    const [isActiveAddMore, setIsActiveAddMore] = useState(false); //initialise both variables: isActive and setIsActive to false
    const [isActiveMusic, setIsActiveMusic] = useState(false);
    const [isActiveCustom, setIsActiveCustom] = useState(false);
    const [isActiveCopy, setIsActiveCopy] = useState(false);
    const [isActiveExit, setIsActiveExit] = useState(false);

    // for websockets
    const [socket, setSocket] = useState(null);
    const [messages, setMessages] = useState([]);
    // const [input, setInput] = useState("");
    const [customInput, setCustomInput] = useState(""); // For the customisation box
    const [chatInput, setChatInput] = useState(""); //Fot chat box

    const [username, setUsername] = useState("ANON_USER");   // Default to 'ANON_USER' before fetching. Stores username fetched from the backend

    const navigate = useNavigate();
    const [isTyping, setIsTyping] = useState(false);
    const [typingUser, setTypingUser] = useState("");

    useEffect(() => {
        //Fetches logged in user's username when component mounts
        //Updates username state with fetched data or defaults to 'anonymous'
        const fetchUserData = async () => {
            try {
                const data = await getAuthenticatedRequest("/profile/", "GET");
                setUsername(data.username || "Anonymous"); // Fallback in case username is missing
            } catch (error) {
                console.error("Error fetching user data", error);
            }
        };
        fetchUserData();

        if (!finalRoomCode) {   //Ensure room code is given
            console.error("Room code is missing.");
            return;
        }

        const ws = new WebSocket(`ws://localhost:8000/ws/room/${finalRoomCode}/`);
    
        //Logs when connection is established
        ws.onopen = () => {
            console.log("Connected to Websocket");
            setSocket(ws);
        };
        
        //Handles incoming messages.
        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === "chat_message") { //if message type is 'chat_message' then add to messages state
                // Ensure the message is structured as an object with `sender` and `text`
                setMessages((prev) => [...prev, { sender: data.sender, text: data.message }]);
            }
            else if (data.type === "typing") {
                setTypingUser(data.sender);
                
                // Remove "typing" message after 3 seconds
                setTimeout(() => {
                    setTypingUser("");
                }, 3000);
                
            }
        };
    
        //Logs when the connection is closed
        ws.onclose = () => console.log("Disconnected from Websocket");
    
        // Cleanup function -> closes the websocket connection when the component unmounts
        return () => {
            ws.close();
        };
    }, [finalRoomCode]);

    //Sends chat message through websocket connection
    const sendMessage = () => {
        if (!socket || socket.readyState !== WebSocket.OPEN) {
            console.error("WebSocket not connected.");
            return;
        }

        if (!chatInput.trim()) { // Prevent empty messages
            console.error("Cannot send an empty message.");
            return;
        }

        //construct a message with type, message and sender
        const messageData = { 
            type: "chat_message", 
            message: chatInput, 
            sender: username
        };
    
        console.log("Sending message to WebSocket:", messageData); // Debugging log
    
        socket.send(JSON.stringify(messageData));
        setChatInput("");   //resets chatinput field after sending message
    };
    // end of websockets stuff

    const handleMouseDown = (btnType) => {
        //when the button is pressed then the variable setIsActive is set to True
        if (btnType === 'addMore') {
            setIsActiveAddMore(true);
        } else if (btnType === 'music') {
            setIsActiveMusic(true);
        } else if (btnType === 'custom'){
            setIsActiveCustom(true)
        } else if (btnType === 'copy'){
            setIsActiveCopy(true)
        } else if (btnType === 'exit'){
            setIsActiveExit(true)
        }
        
    };

    const handleMouseUp = (btnType) => {
        //when the button is released then setIsActive is set to False
        if (btnType === 'addMore') {
            setIsActiveAddMore(false);
        } else if (btnType === 'music') {
            setIsActiveMusic(false);
        } else if (btnType === 'custom'){
            setIsActiveCustom(false)
        } else if (btnType === 'copy'){
            setIsActiveCopy(false)
        } else if (btnType === 'exit'){
            setIsActiveExit(false)
        }
    };

    //testing functions- for UI purposes (not linked to the database)

    const [todos, setTodos] = useState([
        { id: 1, text: "Study for Math", checked: false },
        { id: 2, text: "Study for English", checked: false },
        { id: 3, text: "Study for Geography", checked: false },
        { id: 4, text: "Study for Chemistry", checked: false },
        { id: 5, text: "Study for Economics", checked: false },
        { id: 6, text: "Study for Engineering", checked: false },
        { id: 7, text: "Study for Physics", checked: false },
        { id: 8, text: "Study for Biology", checked: false },
    ]);

    const toggleTodo = id => {
        const newTodos = todos.map(todo => {
            if (todo.id === id) {
                return { ...todo, checked: !todo.checked };
            }
            return todo;
        });
        setTodos(newTodos);
    };

    const handleCopy = () => {
        if (finalRoomCode) {
            navigator.clipboard.writeText(finalRoomCode)
                .then(() => {
                    toast.success("Code copied to clipboard!", {
                        position: "top-center",
                        autoClose: 1000,  
                        closeOnClick: true,
                        pauseOnHover: true, 
                    });
                })
                .catch(err => {
                    console.error("Failed to copy: ", err);
                    toast.error("Failed to copy code!");
                });
        }
    };

    const handleExit = () => {
        navigate("/dashboard")
    }

    let typingTimeout;
    const handleTyping = () => {
        if (!socket || socket.readyState !== WebSocket.OPEN) return;
        // Send "typing" event to WebSocket
        socket.send(JSON.stringify({ type: "typing", sender: username }));
    
        // Prevent multiple events from being sent too frequently
        if (isTyping) {
            setIsTyping(true);
        }
        clearTimeout(typingTimeout);
        typingTimeout =  setTimeout(() =>{
            setIsTyping(false);
        }, 3000);
    };
    
    

    //page is designed in columns
    //First Column: todoList, shared materials 
    //Second Column: users listes, motivational message
    //Third Column: Timer, customisation, chatbox
    
    return (
        <div className='groupStudyRoom-container'>
            {/* Add this new header section */}
            <div className="study-room-header">
                <h2 className="heading">Study Room: {roomName}</h2>
                <h3 className='gs-heading2'>Code: {finalRoomCode}</h3>
            </div>
            
            {/*1st Column */}
            <div className="column">
                <div className="todo-list-container">
                    <h2 className='todo-heading'>To Do: 
                    <div className="checkbox-wrapper-5">
                        <div className="check">
                            <input id="check-5" type="checkbox"></input>
                            <label htmlFor="check-5"></label>
                        </div>
                    </div>
                    </h2>
                    <div style={{ flex: 1, width: '100%' }}> {/* This div takes all available space */}
                    {todos.map(todo => (
                            <div key={todo.id} className="todo-item">
                                <div className="checkbox-wrapper-28">
                                    <input
                                        id={`todo-${todo.id}`}
                                        type="checkbox"
                                        className="checkbox"
                                  f      checked={todo.checked}
                                        onChange={() => toggleTodo(todo.id)}
                                    />
                                    <label htmlFor={`todo-${todo.id}`} className='todo-label'>{todo.text}</label>
                                </div>
                                <button type= "button" className='delete-button' >X</button>
                            </div>
                        ))}
                    </div>
                    {/*This is the add More button in the to do list- needs functionality (onClick method) */}
                    <button
                        type="button"
                        className={`add-more-button ${isActiveAddMore ? 'active' : ''}`}
                        onMouseDown={() => handleMouseDown('addMore')}
                        onMouseUp={() => handleMouseUp('addMore')}
                        onMouseLeave={() => handleMouseUp('addMore')}
                        >Add More
                    </button>      
                </div>

                <div className="sharedMaterials-container">Shared Materials</div>
            </div>
            {/*2nd Column */}
            <div className="column" role='column' data-testid="column-2">
                <div className="user-list-container" data-testid="user-list-container">
                    <h2 className="heading"> Study Room: {roomName} </h2>
                    <h3 className='gs-heading2'> Code: {finalRoomCode}</h3>
                    {/* Debugging messages */}
                    {/* {messages.map((msg, index) => <p key={index}>{msg}</p>)} */}   {/* WHAT IS THIS DO YOU NEED IT*/}
                    <div className='utility-bar' data-testid="utility-bar">
                        <button
                            type="button"
                            className={`music-button ${isActiveMusic ? 'active' : ''}`}
                            onMouseDown={() => handleMouseDown('music')}
                            onMouseUp={() => handleMouseUp('music')}
                            onMouseLeave={() => handleMouseUp('music')}
                        >
                            <img src={musicLogo} alt="Music" />
                        </button>
                        <button
                            type="button"
                            className={`customisation-button ${isActiveCustom ? 'active' : ''}`}
                            onMouseDown={() => handleMouseDown('custom')}
                            onMouseUp={() => handleMouseUp('custom')}
                            onMouseLeave={() => handleMouseUp('custom')}
                        >
                            <img src={customLogo} alt="Customisation" />
                        </button>
                    </div>
                    <div className='utility-bar-2'>
                        <button
                            type="button"
                            className={`copy-button ${isActiveCopy ? 'active' : ''}`}
                            onClick={handleCopy} 
                            onMouseDown={() => handleMouseDown('copy')}
                            onMouseUp={() => handleMouseUp('copy')}
                            onMouseLeave={() => handleMouseUp('copy')}
                        >
                            <img src={copyLogo} alt="Copy" />
                        </button>
                        <ToastContainer />
                        <button
                            type="button"
                            className={`exit-button ${isActiveExit ? 'active' : ''}`}
                            onClick={handleExit}
                            onMouseDown={() => handleMouseDown('exit')}
                            onMouseUp={() => handleMouseUp('exit')}
                            onMouseLeave={() => handleMouseUp('exit')}
                        >
                            <img src={exitLogo} alt="Exit" />
                        </button>
                    </div>
                    <div className='users'>
                        {/*These are examples of how the user profiles are displayed. 
                        user-image has the white circle, user-name is for the name at the bottom of the user. Can be changed, this is just an example.*/}
                        <div className="user-circle"> 
                            <div className="user-image">JD</div>
                            <div className="user-name">John Doe</div>
                        </div>
                        <div className="user-circle">
                            <div className="user-image">JD</div>
                            <div className="user-name">John Doe</div>
                        </div>
                        <div className="user-circle">
                            <div className="user-image">JD</div>
                            <div className="user-name">John Doe</div>
                        </div>
                        <div className="user-circle">
                            <div className="user-image">JD</div>
                            <div className="user-name">John Doe</div>
                        </div>
                        <div className="user-circle">
                            <div className="user-image">JD</div>
                            <div className="user-name">John Doe</div>
                        </div>
                        <div className="user-circle">
                            <div className="user-image">JD</div>
                            <div className="user-name">John Doe</div>
                        </div>
                    </div>
                </div>
                <MotivationalMessage />
            </div>
            {/*3rd Column */}
            <div className="column">
                {/* StudyTimer replaces the timer-container div */}
                <StudyTimer 
                    roomId={finalRoomCode} 
                    isHost={true} 
                    onClose={() => console.log('Timer closed')} 
                />
                {/* <StudyTimer roomId="yourRoomId" isHost={true} onClose={() => console.log('Timer closed')} data-testid="studyTimer-container" /> */}
                {/* Chat Box */}
                <div className="chatBox-container" data-testid="chatBox-container">
                    <div className="chat-messages">
                        {messages.map((msg, index) => (
                        <div key={index} className={`chat-message ${msg.sender === username ? "current-user" : "other-user"}`}>
                            <strong>{msg.sender}:</strong> {msg.text}
                        </div>
                        ))}
                        {typingUser && (<p className="typing-indicator"> <strong>{typingUser}</strong> is typing...</p>)}
                    </div>
                    <div className="input-container">
                        <input 
                            value={chatInput} 
                            onChange={(e) => {
                                setChatInput(e.target.value); 
                                handleTyping();}}
                            onKeyDown={(e) => e.key === "Enter" && sendMessage(e)}
                            placeholder="Type a message..." 
                        />
                        <button onClick={sendMessage}>Send</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default GroupStudyPage;