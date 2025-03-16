import React, { createContext, useContext, useState } from "react";

// Create a context to manage the study room state
const StudyRoomContext = createContext();

// Create a provider component to wrap around the app
export const StudyRoomProvider = ({ children }) => {
  // State to store study room details (roomCode and roomName)
  const [studyRoom, setStudyRoom] = useState(null);

  // Function to enter a study room
  const enterStudyRoom = (roomCode, roomName) => {
    setStudyRoom({ roomCode, roomName }); // Update the state with room details
  };

  // Function to leave the study room
  const leaveStudyRoom = () => {
    setStudyRoom(null); // Clear the study room state
  };

  return (
    // Provide the study room state and functions to the rest of the app
    <StudyRoomContext.Provider
      value={{ studyRoom, enterStudyRoom, leaveStudyRoom }}
    >
      {children}
    </StudyRoomContext.Provider>
  );
};

// Custom hook to easily access the study room context
export const useStudyRoom = () => useContext(StudyRoomContext);
