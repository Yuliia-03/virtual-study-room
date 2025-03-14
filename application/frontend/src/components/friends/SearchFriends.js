import React, { useContext, useEffect, useState } from "react";
import { FriendsContext } from "./FriendsContext";
import "../../styles/friends/SearchFriends.css";
import "../../styles/friends/PendingFriends.css";
import { getAuthenticatedRequest } from "../../utils/authService";

import defaultAvatar from '../../assets/avatars/avatar_2.png';
import { storage } from "../../firebase-config";
import { ref, getDownloadURL, uploadBytes } from "firebase/storage";

const PendingFriends = () => {
    const { loading, onAccept, onReject, friendRequests, invitationsRequests, friends  } = useContext(FriendsContext);

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

                    // Process friendsData with images
                    const friendsWithImages = await Promise.all(
                        friendsData.map(async (friend) => {
                            const imageRef = ref(storage, `avatars/${friend.username}`);
                            const imageUrl = await getDownloadURL(imageRef).catch(() => defaultAvatar); // Default if not found
                            return { ...friend, image: imageUrl }; // Add profileImage to friend object
                        })
                    );

                    // Set the result state with friends including images
                    setResult(friendsWithImages);
                } catch (error) {
                    console.error("Error fetching friends:", error);
                }
            };

            fetchData();
        } else {
            setResult([]); // Clear the result if search length is less than or equal to 2
        }
    }, [search]);

    if (loading) return <div className="loading">Loading Friends...</div>;

    return (
        <div className="search-friends">
            <input className="search-input" type="text" value={search} onChange={handleChange} placeholder="Add new friends..." />
            <ul className="invitations-container invitations-list">
                {result.map((friend) => (
                    <li key={friend.id} className="invitation-card">
                        <img src={friend.image} alt="logo" className="small-pic" />
                        <div className="invitation-name">
                        <span >
                            {friend.name} {friend.surname} ({friend.username})
                        </span>
                        <div className="invitation-actions">
                            {
                            friendRequests.some(request => request.username === friend.username) ? (
                                friendRequests.filter(r => r.username === friend.username).map((r) => (
                                <div >
                                    <span> (user sent you request)   </span>
                                    <button onClick={() => onAccept(r.id, 'accept_friend', "PATCH")} className="btn btn-success btn-sm" aria-label="Add Friend">
                                        <i class="bi bi-check2-circle"></i>
                                    </button>
                                    <button className="btn btn-danger" onClick={() => onReject(r.id)}>
                                        <i className="bi bi-x-circle"></i>
                                    </button>
                                </div>
                                ))
                            ) : invitationsRequests.some(request => request.username === friend.username) ? (
                                    invitationsRequests.filter(request => request.username === friend.username).map((request) => (
                                        <div>
                                            <span> (you sent request to that user)   </span>
                                            <button onClick={() => onReject(request.id)} className="btn btn-danger" aria-label="Add Friend">
                                                <i className="bi bi-x-circle"></i>
                                            </button>
                                        </div>
                                    ))
                            ) : friends.some(request => request.username === friend.username) ? (
                                friends.filter(request => request.username === friend.username).map((request) => (
                                    <div>
                                        <span> (you are already a friends)   </span>
                                        <button onClick={() => onReject(request.id)} className="btn btn-danger" aria-label="Add Friend">    
                                            <i className="bi bi-x-circle"></i>
                                        </button>   
                                    </div>
                                        
                                ))
                            ) : (
                                <button onClick={() => onAccept(friend.id, 'create_friend_request', "POST")} className="btn btn-danger" aria-label="Add Friend">
                                    <i className="bi bi-person-plus"></i>
                                </button>       
                                            
                            )}
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default PendingFriends;
