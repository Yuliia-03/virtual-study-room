import React, { useState, useEffect } from 'react';
import { storage } from "../firebase-config";
import { Navigate, useNavigate } from 'react-router-dom';
import { ref, getDownloadURL, uploadBytes } from "firebase/storage";
import { getAuthenticatedRequest, getAccessToken } from "./utils/authService";
import defaultAvatar from '../assets/avatars/avatar_2.png';
import UserAvatar from '../components/UserAvatar';
import UserBadges from '../components/UserBadges';

function ProfileBox() {
    const navigate = useNavigate();
    const [showAvatarSelector, setShowAvatarSelector] = useState(false);
    const [showInventory, setShowInventory] = useState(false);
    const [userData, setUserData] = useState({
        username: null,
        description: "",
        image: defaultAvatar, //default image
    });

    const handleChangeAvatar = async (event) => {
        const file = event.target.files[0];
        if (!file || !userData.username) {
            //TODO: put error message here
            console.log("no valid user id");
            return;
        }
        const fileRef = ref(storage, `avatars/${userData.username}`);
        try 
        {
            //upload file to firebase
            await uploadBytes(fileRef, file);

            //get imageURL
            const imageUrl = await getDownloadURL(fileRef);

            //update userData with new imageURL
            setUserData((prevData) => ({
                ...prevData,
                image: imageUrl,
            }));

            //TODO: put success message here
            console.log("success!");
        } 
        catch (error) {
            //TODO: put error message here
            console.log("error");
        }
    }

    const handleLogOff = async () => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");

        navigate("/login");
        console.log("logged off");
    }

    const handleChangeDescription = (event) => {
        const newDescription = event.target.value;
        setUserData((prevData) => ({
            ...prevData,
            description: newDescription,
        }));
    }

    const handleSaveDescription = async () => {
        try {
            const data = await getAuthenticatedRequest("/description/", "PUT", {
                description: userData.description,
            });

            setUserData((prevData) => ({
                ...prevData,
                description: data.description,
            }));

            //TODO: put success message here
        }
        catch (error) {
            console.error("Error Updating Description:", error);
        }
        
    }

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const data = await getAuthenticatedRequest("/profile/", "GET");

                //fetch profile picture from firebase using user_id
                const imageRef = ref(storage, `avatars/${data.username}`);
                const imageUrl = await getDownloadURL(imageRef).catch(() => defaultAvatar); //default image if not found

                setUserData({
                    username: data.username || "N/A",
                    description: data.description || "",
                    image: imageUrl,
                });
            } 
            catch (error) {
                console.error("Error Fetching User Data:", error);
            }
        };

        fetchUserData();

    }, []);

    const handleDefaultPFP = async (avatarSrc) => {
        const fileRef = ref(storage, `avatars/${userData.username}`);
        try 
        {
            //upload file to firebase
            const response = await fetch(avatarSrc);
            const blob = await response.blob();
            await uploadBytes(fileRef, blob);

            //get imageURL
            const imageUrl = await getDownloadURL(fileRef);

            //update userData with new imageURL
            setUserData((prevData) => ({
                ...prevData,
                image: imageUrl,
            }));

            //TODO: put success message here
            console.log("success!");
        } 
        catch (error) {
            //TODO: put error message here
            console.log("error");
        }
    }

    return (
        <div className='profile-container'>
            <div className='profile-box'>
                <h1 className='profile-title'>Profile</h1>
                <img src={userData.image} alt="logo" className="profile-pic" />
                <input type="file" accept="image/*" id='change-avatar' onChange={handleChangeAvatar} className="change-avatar-button" style={{ display: 'none' }} />
                <label htmlFor="change-avatar" className="upload-button" style={{ color: 'black' }}>Upload Avatar</label>
                <h1 className='profile-username'>{userData.username}</h1>
                <button className="default-select-button" onClick={() => setShowAvatarSelector(!showAvatarSelector)}>Default Avatars</button>
                {showAvatarSelector && (<UserAvatar onSelect={handleDefaultPFP} currentAvatar={userData.image}/>)} 
                {/* TODO: can't use userData.image for current avatar? change in actual component instead? */}
                <textarea
                    className="profile-description"
                    value={userData.description}
                    onChange={handleChangeDescription}
                    placeholder="Please enter description"
                />
                <button type="button" className="save-desc-button" onClick={handleSaveDescription}>Save</button>
                <button 
                    className='inventory-button'
                    onClick={() => setShowInventory(!showInventory)}
                    style={{
                        width: '45px',
                        height: '45px',
                        borderRadius: '50%',
                        backgroundColor: showInventory ? '#b0f2b4' : '#bad7f5',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '24px',
                        transition: 'all 0.2s ease-in-out',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}
                    aria-label={showInventory ? 'Hide Badge Collection' : 'View Badge Collection'}
                    >🏆
                </button>
                {showInventory && (
                    <div className='inventory-content'>
                        <h2>Your Badge Collection</h2>
                        <UserBadges />
                        {/* TODO: add variable userBadges here */}
                    </div>
                )}
                <button type="button" className="logoff-button" onClick={handleLogOff}>Log Off</button>
            </div>
        </div>
    );
}

export default ProfileBox;