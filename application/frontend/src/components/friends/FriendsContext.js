import React, { useContext } from "react";
import { createContext, useState, useEffect } from "react";
import { getAuthenticatedRequest } from "../../utils/authService";

// Create context
export const FriendsContext = createContext();

// Provider component
export const FriendsProvider = ({ children }) => {
    const [invitationsRequests, setInvitations] = useState([]);
    const [friendRequests, setRequests] = useState([]);
    const [friends, setFriends] = useState([]);
    const [loading, setLoading] = useState(true);


    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const requestsData = await getAuthenticatedRequest("/get_pending_friends/");
            const invitationsData = await getAuthenticatedRequest("/get_made_requests/");
            const friendsData = await getAuthenticatedRequest("/get_friends/");
            
            setInvitations(invitationsData);
            setRequests(requestsData);
            setFriends(friendsData);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    const manageFriends = async (request, Id, method) => {
        try {
            const response = await getAuthenticatedRequest(`/${request}/${Id}/`, method);
            if (response.status !== 0) {
                const requests = friendRequests.find(req => req.id === Id);
                const invitation = invitationsRequests.find(req => req.id === Id);
                
                if (invitation || requests) {
                    

                    setRequests(prev => prev.filter(req => req.id !== Id));
                    setInvitations(prev => prev.filter(req => req.id !== Id));
                    if (request == 'accept_friend') {
                        setFriends(prev => [...prev, requests]);
                    }
                }
                else {
                    const friend = friends.find(req => req.id === Id);
                    setFriends(prev => prev.filter(req => req.id !== Id));

                    setRequests(prev => [...prev, friend]);

                }
            } else {
                console.error("Error accepting friend request");
            }
        } catch (error) {
            console.error("Error:", error);
        }
    }

    const onAccept = async (requestId) => {
        console.log("Accepting friend...");
        manageFriends('accept_friend', requestId, "PATCH");
    };

    const onReject = async (requestId) => {
        console.log("Deleting friend...");
        await manageFriends('reject_friend', requestId, "DELETE");
    };

    return (
        <FriendsContext.Provider value={{ friendRequests, invitationsRequests, friends, onAccept, onReject, loading }}>
            {children}
        </FriendsContext.Provider>
    );
};
