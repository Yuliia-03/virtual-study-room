import React, { useContext } from "react";
import { FriendsContext } from "./FriendsContext";
import "../../styles/friends/PendingFriends.css";

const PendingFriends = () => {
    const { friendRequests, onAccept, onReject, loading } = useContext(FriendsContext);

    if (loading) return <div className="loading">Loading Friend Requests...</div>;

    return (
        <div className="pending-friends">
            <div className="invitations-container">
                {friendRequests.length === 0 ? (
                    <p className="no-invitations">No pending invitations.</p>
                ) : (
                    <ul className="invitations-list">
                        {friendRequests.map((inv) => (
                            <li key={inv.id} className="invitation-card">
                                <span className="invitation-name">
                                    {inv.name} {inv.surname} ({inv.username})
                                </span>
                                <div className="invitation-actions">
                                    <button className="accept-btn" onClick={() => onAccept(inv.id, 'accept_friend', "PATCH")}>✅</button>
                                    <button className="reject-btn" onClick={() => onReject(inv.id)}>❌</button>
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
