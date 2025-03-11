import React, { useState } from "react";
import AllFriends from "./AllFriends";
import PendingRequests from "./PendingRequests";
import FriendsRequested from "./FriendsRequested";
import "../../styles/friends/FriendsTab.css";

import { FriendsProvider } from './FriendsContext';

const FriendsTab = () => {
    const [activeTab, setActiveTab] = useState("all");

    return (
        <FriendsProvider>
            <div className="friends-tabs-container">
            {/* Tab Navigation */}
            <div className="tabs">
                <button className={activeTab === "all" ? "active" : ""} onClick={() => setActiveTab("all")}>
                    All Friends
                </button>
                <button className={activeTab === "pending" ? "active" : ""} onClick={() => setActiveTab("pending")}>
                    Pending Requests
                </button>
                <button className={activeTab === "sent" ? "active" : ""} onClick={() => setActiveTab("sent")}>
                    Sent Requests
                </button>
            </div>

            {/* Tab Content */}
            <div className="tab-content">
                {activeTab === "all" && <AllFriends />}
                {activeTab === "pending" && <PendingRequests />}
                {activeTab === "sent" && <FriendsRequested />}
            </div>
            </div>
        </FriendsProvider>
    );
};

export default FriendsTab;
