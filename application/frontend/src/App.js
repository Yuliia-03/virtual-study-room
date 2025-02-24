import React from 'react';
import './styles/App.css';
import Login from "./pages/Login";
import Calendar1 from "./pages/Calendar1";
import Signup from "./pages/Signup";
import Welcome from "./pages/Welcome";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/calendar" element={<Calendar1 />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
    </Router>
  );
}

export default App;
