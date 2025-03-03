
import React from "react";
import ToDoList from '../pages/ToDoList';
import "../styles/Dashboard.css";


function Dashboard() {
    return (
        <div className="some-page-wrapper">

            {/* Dashboard Layout */}
            <div className="">
                {/* First Column - 30% Width */}
                <div className="column">
                    <div className="row"><ToDoList /></div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
