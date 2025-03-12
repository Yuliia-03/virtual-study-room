import React, { useContext, useEffect, useState } from "react";
import { FriendsContext } from "./FriendsContext";
import "../../styles/friends/SearchFriends.css";
import { getAuthenticatedRequest } from "../../utils/authService";

const PendingFriends = () => {
    const { loading, onReject } = useContext(FriendsContext);

    const [search, setSearch] = useState("");
    const [result, setResult] = useState([]);

    const handleChange = (event) => {
        setSearch(event.target.value);
    };

    useEffect(() => {
        
        if (search.length > 2) {
            const fetchData = async () => {
                try {
                    const friendsData = await getAuthenticatedRequest(`/find_friend/?q=${search}`);
                    setResult(friendsData);
                } catch (error) {
                    console.error("Error fetching friends:", error);
                }
            };

            fetchData();
        } else {
            setResult([]);
        }
        
    }, [search])

    if (loading) return <div className="loading">Loading Friends...</div>;

    return (
        <div className="search-friends">
            <input className="search-input" type="text" value={search} onChange={handleChange} placeholder="Add new friends..." />
            <ul>
                {result.map((friend) => (
                    <li key={friend.id} className="invitation-card">
                        <span >
                            {friend.name} {friend.surname} ({friend.username})
                        </span>
                        <div className="invitation-actions">
                            <button className="reject-btn" onClick={() => onReject(friend.id)}>❌</button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default PendingFriends;
