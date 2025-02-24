import React from 'react';
import './styles/App.css';
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Welcome from "./pages/Welcome";
import UserProfile from "./components/UserProfile";
import Dashboard from "./pages/Dashboard";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import StudyRoomTest from './components/StudyRoomTest';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/profile" element={<UserProfile userId="test-user-1" />} />
        <Route path="/timer-test" element={<StudyRoomTest />} />
      </Routes>
    </Router>
  );
}

export default App;