import React, { useState, useEffect } from "react";
import { getAuthenticatedRequest } from "../../utils/authService";
import "../../styles/PendingFriends.css";

const PendingFriends = () => {
    const [friends, setFriends] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        console.log("Fetching friends data...");

        const fetchFriends = async () => {
            try {
                const data = await getAuthenticatedRequest("/get_pending_friends/");
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

            {/* Friend Invitations */}
            <h3 className="invitations-title">Friend Invitations</h3>
            <div className="invitations-container">
                {friends.length === 0 ? (
                    <p className="no-invitations">No pending invitations.</p>
                ) : (
                    <ul className="invitations-list">
                            {friends.map((inv) => (
                            <li key={inv.id} className="invitation-card">
                                <span className="invitation-name">
                                    {inv.name} {inv.surname} ({inv.username})
                                </span>
                                <div className="invitation-actions">
                                        <button className="accept-btn" >✅</button>
                                    <button className="reject-btn" >❌</button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default PendingFriends;