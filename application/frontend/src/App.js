import React, { Component} from "react";
import { w3websocket as W3CWebSocket } from "websocket";

import "./styles/App.css";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Welcome from "./pages/Welcome";
import Dashboard from "./pages/Dashboard";
import GroupStudyPage from './pages/GroupStudyPage';
import Analytics from './pages/Analytics';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MotivationalMessage from "./pages/Motivation";
import ProfileBox from "./pages/ProfileBox";
import ChatBox from "./pages/ChatBox";
//import ToDoList from './pages/ToDoList';

function App() {
  return (
    <Router>
      <Routes>
        // temporary change ok
        <Route path="/" element={<Welcome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/motivational-message" element={<MotivationalMessage />} />
        <Route path="/dashboard/:username" element={<Dashboard />} />
        <Route path="/group-study/:roomCode" element={<GroupStudyPage />} />
        <Route path="/analytics/:username" element={<Analytics />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<ProfileBox />} />
        <Route path="/chatbox" element={<ChatBox />} />
      </Routes>
    </Router>
  );
}

export default App;
