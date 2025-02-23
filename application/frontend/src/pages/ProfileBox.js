import React, { useState, useEffect } from 'react';
import mangoCat from "../assets/mango_cat.png";
import { storage } from "../firebase-config";
import { ref, getDownloadURL, uploadBytes } from "firebase/storage";
import axios from 'axios';

function ProfileBox() {

    const [userData, setUserData] = useState({
        username: null,
        description: "",
        image: mangoCat, //default image
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
        console.log("log off");
    }

    const handleChangeDescription = (event) => {
        const newDescription = event.target.value;
        console.log(newDescription);
        setUserData((prevData) => ({
            ...prevData,
            description: newDescription,
        }));
    }

    const handleSaveDescription = async () => {
        // put axios call here
    }

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                // const response = await axios.get("http://127.0.0.1:8000/api/profile/", {
                //     Authorization: `Bearer ${localStorage.getItem("access_token")}`,
                // });

                // const data = response.data;

                //test data
                const data = {
                    username : "alice123",
                    description : "HELLO WORLD",
                };

                //fetch profile picture from firebase using user_id
                const imageRef = ref(storage, `avatars/${data.username}`);
                const imageUrl = await getDownloadURL(imageRef).catch(() => mangoCat); //default image if not found

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

    return (
        <div className='profile-container'>
            <div className='profile-box'>
                <h1 className='profile-title'>Profile</h1>
                <img src={userData.image} alt="logo" className="profile-pic" />
                <input type="file" accept="image/*" id='change-avatar' onChange={handleChangeAvatar} className="change-avatar-button" style={{ display: 'none' }} />
                <label htmlFor="change-avatar" className="upload-button" style={{ color: 'black' }}>Change Avatar</label>
                <h1 className='profile-username'>{userData.username}</h1>
                <textarea
                    className="profile-description"
                    value={userData.description}
                    onChange={handleChangeDescription}
                    placeholder="Please enter description"
                />
                <button type="button" className="save-desc-button" onClick={handleSaveDescription}>Save</button>
                <button type="button" className="logoff-button" onClick={handleLogOff}>Log Off</button>
            </div>
        </div>
    );
}

export default ProfileBox;