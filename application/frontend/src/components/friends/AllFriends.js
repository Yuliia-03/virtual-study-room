import React, { useContext } from "react";
import { FriendsContext } from "./FriendsContext";
import "../../styles/friends/Friends.css";

const AllFriends = () => {
    const { onReject, friends, loading } = useContext(FriendsContext);

    if (loading) return <div className="loading">Loading Friends List...</div>;

    return (
        <div className="friends-list-container">
            <h3 className="friends-title">Friends</h3>
            <div className="friends-list-wrapper">
                <ul className="friends-list">
                    {friends.length === 0 ? (
                        <p className="no-friends">No friends found.</p>
                    ) : (
                        friends.map((friend) => (
                            <li key={friend.id} className="friend-card">
                                <h4>{friend.name} {friend.surname}</h4>
                                <p className="username">{friend.username}</p>

                                <button className="reject-btn" onClick={() => onReject(friend.id)}>❌</button>
                            </li>
                        ))
                    )}
                </ul>
            </div>
        </div>
    );
};

export default AllFriends;
