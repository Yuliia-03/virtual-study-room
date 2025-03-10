import React, { useState, useEffect } from "react";
import { getAuthenticatedRequest } from "../utils/authService";
import "../styles/Friends.css";

const Friends = () => {
    const [friends, setFriends] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        console.log("Fetching friends data...");

        const fetchFriends = async () => {
            try {
                const data = await getAuthenticatedRequest("/get_friends/");
                console.log("Fetched friends:", data);
                setFriends(data);
            } catch (error) {
                if (error.response) {
                    alert(error.response.data.error);
                }
                console.error("Error fetching friends:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchFriends();
    }, []);

    if (loading) return <div className="loading">Loading Friends List...</div>;

    return (
        <div>
            <h3 className="friends-title">Friends</h3>
            <div className="friends-container">
                {friends.length === 0 ? (
                    <p className="no-friends">No friends found.</p>
                ) : (
                    <ul className="friends-list">
                        {friends.map((friend) => (
                            <li key={friend.id} className="friend-card">
                                <h4>{friend.name} {friend.surname}</h4>
                                <p className="username">{friend.username}</p>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default Friends;
