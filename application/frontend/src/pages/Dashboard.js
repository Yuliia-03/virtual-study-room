import React from "react";
import ToDoList from '../pages/ToDoList';
import "../styles/Dashboard.css";

function Dashboard() {
    return (
        <div className="some-page-wrapper">

            {/* First Column - 30% Width */}
            <div className="column">
                <div><ToDoList /></div>
            </div>

        </div>
    );
}

export default Dashboard;
