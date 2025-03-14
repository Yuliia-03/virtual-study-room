import React, { useContext } from "react";
import { createContext, useState, useEffect } from "react";
import { getAuthenticatedRequest } from "../../utils/authService";
import defaultAvatar from '../../assets/avatars/avatar_2.png';
import { storage } from "../../firebase-config";
import { ref, getDownloadURL, uploadBytes } from "firebase/storage";

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

    const fetchData = async (userId = null) => {
        setLoading(true);
        try {
            const requestsData = await getAuthenticatedRequest("/get_pending_friends/");
            const invitationsData = await getAuthenticatedRequest("/get_made_requests/");
            const friendsData = await getAuthenticatedRequest("/get_friends/");

            // Set invitations and requests without images initially
            setInvitations(invitationsData);
            setRequests(requestsData);

            // Process friends with images
            const friendsWithImages = await Promise.all(
                friendsData.map(async (friend) => {
                    const imageRef = ref(storage, `avatars/${friend.username}`);
                    const imageUrl = await getDownloadURL(imageRef).catch(() => defaultAvatar); // Default if not found
                    return { ...friend, image: imageUrl }; // Add profileImage to friend object
                })
            );

            // Process invitations with images
            const invitationsWithImages = await Promise.all(
                invitationsData.map(async (invitation) => {
                    const imageRef = ref(storage, `avatars/${invitation.username}`);
                    const imageUrl = await getDownloadURL(imageRef).catch(() => defaultAvatar); // Default if not found
                    return { ...invitation, image: imageUrl }; // Add profileImage to invitation object
                })
            );

            // Process requests with images
            const requestsWithImages = await Promise.all(
                requestsData.map(async (request) => {
                    const imageRef = ref(storage, `avatars/${request.username}`);
                    const imageUrl = await getDownloadURL(imageRef).catch(() => defaultAvatar); // Default if not found
                    return { ...request, image: imageUrl }; // Add profileImage to request object
                })
            );

            // Update the state with friends, invitations, and requests with images
            setFriends(friendsWithImages);
            setInvitations(invitationsWithImages);
            setRequests(requestsWithImages);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };


    const manageFriends = async (request, Id, method) => {
        try {
            const response = await getAuthenticatedRequest(`/${request}/${Id}/`, method);
            console.log(response)
            if (response.status !== 0) {
                const requests = friendRequests.find(req => req.id === Id);
                const invitation = invitationsRequests.find(req => req.id === Id);
                if (invitation || requests) {
                    // if user was in requests on invitations array - remove and ...
                    setRequests(prev => prev.filter(req => req.id !== Id));
                    setInvitations(prev => prev.filter(req => req.id !== Id));
                    if (request == 'accept_friend') {
                        // ... add to friends or ...
                        setFriends(prev => [...prev, requests]);
                    }
                }
                else {
                    if (request == 'create_friend_request') {
                        // ... or add new user to requested list
                        setInvitations(prev => [...prev, response])
                    } else {
                        // ... or remove from friends and add to waiting list
                        const friend = friends.find(req => req.id === Id);
                        setFriends(prev => prev.filter(req => req.id !== Id));
                        setRequests(prev => [...prev, friend]);
                    }

                }
            } else {
                console.error("Error accepting friend request");
            }
        } catch (error) {
            console.error("Error:", error);
        }
    }

    const onAccept = async (requestId, request, method) => {
        console.log(`Accepting friend... ${method}, ${request} `);
        manageFriends(request, requestId, method);
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
