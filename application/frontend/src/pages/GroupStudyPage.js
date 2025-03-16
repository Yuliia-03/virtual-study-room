import React, { useEffect, useState } from "react";
import "../styles/GroupStudyPage.css";
import MotivationalMessage from "./Motivation";
import musicLogo from "../assets/music_logo.png";
import customLogo from "../assets/customisation_logo.png";
import copyLogo from "../assets/copy_logo.png";
import exitLogo from "../assets/exit_logo.png";
import StudyTimer from "../components/StudyTimer.js";
import StudyParticipants from "../components/StudyParticipants.js";
import { getAuthenticatedRequest } from "../pages/utils/authService";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "../styles/ChatBox.css";
import 'react-toastify/dist/ReactToastify.css';
import defaultAvatar from "../assets/avatars/avatar_2.png";
import { storage } from "../firebase-config";
import { ref, getDownloadURL, uploadBytes } from "firebase/storage";

function GroupStudyPage() {

  const [participants, setParticipants] = useState([]); // State to store participants

  // Location object used for state
  const location = useLocation();
  const navigate = useNavigate(); // initialise

  // Track the logged-in user
  const [loggedInUser, setLoggedInUser] = useState(null);

  const { roomCode, roomName } = location.state || {
    roomCode: "",
    roomName: "",
  };
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

  const [customInput, setCustomInput] = useState(""); // For the customisation box
  const [chatInput, setChatInput] = useState(""); //Fot chat box

  const [username, setUsername] = useState("ANON_USER");   // Default to 'ANON_USER' before fetching. Stores username fetched from the backend

  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState("");


  useEffect(() => {
      console.log("GroupStudyPage UseEffect is being called now!")
      if (finalRoomCode) {
          fetchParticipants(finalRoomCode);
          fetchParticipantData();
          }

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
        
        // Ensure room code is given
        if (!finalRoomCode) {
          console.error("Room code is missing.");
          return;
        }

        // Check if a WebSocket connection already exists, not sure if this actually does anything?
        if (socket === WebSocket.OPEN) {
            console.log("Using existing WebSocket connection");
            return; // Reuse the existing connection
        }

        console.log("Creates a new websocket connection");
        const ws = new WebSocket(`ws://localhost:8000/ws/room/${finalRoomCode}/`);
    
        //Logs when connection is established
        ws.onopen = () => {
            console.log("Connected to Websocket");
            setSocket(ws);
        };
    
        //Handles incoming messages.
        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log("Received WebSocket Message:", data); 
            if (data.type === "chat_message") { //if message type is 'chat_message' then add to messages state
                // Ensure the message is structured as an object with `sender` and `text`
                console.log("Received message:", data); // Debugging
                setMessages((prev) => [...prev, { sender: data.sender, text: data.message }]);
            }
            if (data.type === "participants_update") {
            setParticipants(data.participants);
            fetchParticipants(finalRoomCode);
            fetchUserData();
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
        ws.onclose = (event) => console.log("Disconnected from Websocket", event.code,  event.reason);
    
        // Cleanup function -> closes the websocket connection when the component unmounts
        return () => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.close(); // Cleanup on unmount
        }
    };

//     setSocket(ws);

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

  // Function to fetch participants
  const fetchParticipants = async (roomCode) => {
    try {
      const response = await getAuthenticatedRequest(
        `/get-participants/?roomCode=${roomCode}`,
        "GET"
      );
      console.log("Participants", response.participantsList);

      // Fetch profile pictures for each participant
      const participantsWithImages = await Promise.all(
        response.participantsList.map(async (participant) => {
          const imageUrl = await fetchParticipantData(participant.username);
          return { ...participant, imageUrl }; // Add imageUrl to the participant object
        })
      );

      setParticipants(participantsWithImages); // Update participants state with image URLs
    } catch (error) {
      console.error("Error fetching participants:", error);
    }
  };

  // Function to get user profiles

  const fetchParticipantData = async (username) => {
    try {
      const data = await getAuthenticatedRequest("/profile/", "GET");

      //fetch profile picture from firebase using user_id
      const imageRef = ref(storage, `avatars/${username}`);
      const imageUrl = await getDownloadURL(imageRef).catch(
        () => defaultAvatar
      ); //default image if not found
      return imageUrl; // Return the imageUrl
    } catch (error) {
      toast.error("error fetching user data");
      return defaultAvatar; // IF there is an error return default avatar
    }
  };


  const handleMouseDown = (btnType) => {
    //when the button is pressed then the variable setIsActive is set to True
    if (btnType === "addMore") {
      setIsActiveAddMore(true);
    } else if (btnType === "music") {
      setIsActiveMusic(true);
    } else if (btnType === "custom") {
      setIsActiveCustom(true);
    } else if (btnType === "copy") {
      setIsActiveCopy(true);
    } else if (btnType === "exit") {
      setIsActiveExit(true);
    }
  };

  const handleMouseUp = (btnType) => {
    //when the button is released then setIsActive is set to False
    if (btnType === "addMore") {
      setIsActiveAddMore(false);
    } else if (btnType === "music") {
      setIsActiveMusic(false);
    } else if (btnType === "custom") {
      setIsActiveCustom(false);
    } else if (btnType === "copy") {
      setIsActiveCopy(false);
    } else if (btnType === "exit") {
      setIsActiveExit(false);
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

  const toggleTodo = (id) => {
    const newTodos = todos.map((todo) => {
      if (todo.id === id) {
        return { ...todo, checked: !todo.checked };
      }
      return todo;
    });
    setTodos(newTodos);
  };

  // Method to leave room
  const leaveRoom = async () => {
    try {
      // This stuff gets sent to the backend!
      const response = await getAuthenticatedRequest("/leave-room/", "POST", {
        roomCode: finalRoomCode, // Sends the room name to the backend
      });

      console.log("leaving .. . .");

      console.log("ROOM CODE", finalRoomCode);

      if (response.status === 200) setIsActiveExit(true);
      // Redirect to the Dashboard
      navigate("/dashboard/", {});
      console.log("User has left the room");
    } catch (error) {
      console.error("Error leaving room:", error);
    }
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
    <div
      className="groupStudyRoom-container"
      data-testid="groupStudyRoom-container"
    >
      {/*1st Column */}
      <div className="column" role="column" data-testid="column-1">
        <div className="todo-list-container" data-testid="todo-list-container">
          <h2 className="todo-heading">
            To Do:
            <div className="checkbox-wrapper-5">
              <div className="check">
                <input id="check-5" type="checkbox"></input>
                <label htmlFor="check-5"></label>
              </div>
            </div>

          </h2>
          <div style={{ flex: 1, width: "100%" }}>
            {" "}
            {/* This div takes all available space */}
            {todos.map((todo) => (
              <div key={todo.id} className="todo-item">
                <div className="checkbox-wrapper-28">
                  <input
                    id={`todo-${todo.id}`}
                    type="checkbox"
                    className="checkbox"
                    checked={todo.checked}
                    onChange={() => toggleTodo(todo.id)}
                  />
                  <label htmlFor={`todo-${todo.id}`} className="todo-label">
                    {todo.text}
                  </label>
                </div>
                <button type="button" className="delete-button">
                  X
                </button>
              </div>
            ))}
          </div>
          {/*This is the add More button in the to do list- needs functionality (onClick method) */}
          <button
            type="button"
            className={`add-more-button ${isActiveAddMore ? "active" : ""}`}
            onMouseDown={() => handleMouseDown("addMore")}
            onMouseUp={() => handleMouseUp("addMore")}
            onMouseLeave={() => handleMouseUp("addMore")}
          >
            Add More
          </button>
        </div>

        <div
          className="sharedMaterials-container"
          data-testid="sharedMaterials-container"
        >
          Shared Materials
        </div>
      </div>
      {/*2nd Column */}
      <div className="column" role="column" data-testid="column-2">
        <div className="user-list-container" data-testid="user-list-container">
          <h2 className="heading"> Study Room: {roomName} </h2>
          <h3 className="gs-heading2"> Code: {finalRoomCode}</h3>
          <div className="utility-bar" data-testid="utility-bar">
            <button
              type="button"
              className={`music-button ${isActiveMusic ? "active" : ""}`}
              onMouseDown={() => handleMouseDown("music")}
              onMouseUp={() => handleMouseUp("music")}
              onMouseLeave={() => handleMouseUp("music")}
            >
              <img src={musicLogo} alt="Music" />
            </button>
            <button
              type="button"
              className={`customisation-button ${
                isActiveCustom ? "active" : ""
              }`}
              onMouseDown={() => handleMouseDown("custom")}
              onMouseUp={() => handleMouseUp("custom")}
              onMouseLeave={() => handleMouseUp("custom")}
            >
              <img src={customLogo} alt="Customisation" />
            </button>
          </div>
          <div className="utility-bar-2" data-testid="utility-bar-2">
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
              className={`exit-button ${isActiveExit ? "active" : ""}`}
              onMouseDown={() => handleMouseDown("exit")}
              onMouseUp={() => handleMouseUp("exit")}
              onMouseLeave={() => handleMouseUp("exit")}
              onClick={() => leaveRoom()}
            >
              <img src={exitLogo} alt="Exit" />
            </button>
                  </div>
                   <div className="users">
              {/* Dynamically render participants */}
              {participants.map((participant, index) => (
                <div key={index} className="user-circle">
                  <div className="user-image">
                    <img
                      src={participant.imageUrl}
                      alt="profile"
                      className="user-image"
                    />
                  </div>
                  <div className="user-name">{participant.username}</div>
                </div>
              ))}
            </div>
          );
        };
        </div>
        <MotivationalMessage data-testid="motivationalMessage-container" />
      </div>
      {/*3rd Column */}
            <div className="column" role='column' data-testid="column-3">
                {/* StudyTimer replaces the timer-container div */}
                <StudyTimer
                    roomId={finalRoomCode}
                    isHost={true}
                    onClose={() => console.log('Timer closed')}
                    data-testid="studyTimer-container"
                />
                {/* <StudyTimer roomId="yourRoomId" isHost={true} onClose={() => console.log('Timer closed')} data-testid="studyTimer-container" /> */}
                {/* Chat Box */}
                <div className="chatBox-container" data-testid="chatBox-container">
                    {/* Chat Messages */}
                    <div className="chat-messages">
                        {messages.map((msg, index) => (
                        <div key={index} className={`chat-message ${msg.sender === username ? "current-user" : "other-user"}`}>
                            <strong>{msg.sender}:</strong> {msg.text}
                        </div>
                        ))}
                        {typingUser && (<p className="typing-indicator"> <strong>{typingUser}</strong> is typing...</p>)}
                    </div>
                    {/* Chat Input */}
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
  );
}

export default GroupStudyPage;
