import React, { useState } from "react";
import mangoCat from "../assets/mango_cat.png";
import { storage } from "../firebase-config";
import { ref, getDownloadURL } from "firebase/storage";

function ProfileBox() {

    const [userData, setUserData] = useState({
        username: "N/A",
        description: "N/A",
        image: mangoCat, //default image
    });

    const handleChangeAvatar = async () => {
        console.log("change avatar");
    }

    const handleLogOff = async () => {
        console.log("log off");
    }

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await axios.get("http://127.0.0.1:8000/profile/", {
                    withCredentials: true,  //ensures authentication cookies are sent
                });

                const data = response.data;

                //fetch profile picture from firebase using user_id
                const imageRef = ref(storage, 'avatars/${data.user_id}');
                const imageUrl = await getDownloadURL(imageRef).catch(() => mangoCat); //default image if not found

                setUserData({
                    username: data.username || "N/A",
                    description: data.description || "N/A",
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
                <button type="button" className="change-avatar-button" onClick={handleChangeAvatar}>Change Avatar</button>
                <h1 className='profile-username'>{userData.username}</h1>
                <p className='profile-description'>{userData.description}</p>
                <button type="button" className="logoff-button" onClick={handleLogOff}>Log Off</button>
            </div>
        </div>
    );
}

export default ProfileBox;