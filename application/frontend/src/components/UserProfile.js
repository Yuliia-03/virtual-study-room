import React, { useState, useEffect } from 'react';
import UserAvatar from './UserAvatar';
import UserBadges from './UserBadges';
import { getDatabase, ref, set, get } from 'firebase/database';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
// Import default avatar
import defaultAvatar from '../assets/avatars/avatar_2.png'; // The graduation cap avatar

const UserProfile = ({ userId }) => {
  const [showInventory, setShowInventory] = useState(false);
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);
  const [currentAvatar, setCurrentAvatar] = useState(defaultAvatar); // Set default avatar
  const [userBadges, setUserBadges] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const loadUserProfile = async () => {
      setIsLoading(true);
      try {
        const db = getDatabase();
        const avatarRef = ref(db, `users/${userId}/avatar`);
        const avatarSnapshot = await get(avatarRef);
        setCurrentAvatar(avatarSnapshot.val() || defaultAvatar); // Use default if no avatar is set
        
        const badgesRef = ref(db, `users/${userId}/badges`);
        const badgesSnapshot = await get(badgesRef);
        setUserBadges(badgesSnapshot.val() || []);
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserProfile();
  }, [userId]);

  const handleAvatarSelect = async (avatarSrc) => {
    setCurrentAvatar(avatarSrc); // Immediate UI update
    setShowAvatarSelector(false); // Close selector immediately

    try {
      // Upload to Firebase Storage
      const storage = getStorage();
      const avatarStorageRef = storageRef(storage, `userAvatars/${userId}.png`);
      const response = await fetch(avatarSrc);
      const blob = await response.blob();
      await uploadBytes(avatarStorageRef, blob);
      
      // Get the download URL and update database
      const downloadURL = await getDownloadURL(avatarStorageRef);
      const db = getDatabase();
      await set(ref(db, `users/${userId}/avatar`), downloadURL);
    } catch (error) {
      console.error('Error uploading avatar:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner" />
      </div>
    );
  }

  return (
    <div className="profile-section">
      <h1>User Profile</h1>
      
      {/* Avatar Section */}
      <div>
        <h2>Your Avatar</h2>
        <div onClick={() => setShowAvatarSelector(!showAvatarSelector)} style={{ cursor: 'pointer' }}>
          <img 
            src={currentAvatar} 
            alt="Avatar" 
            style={{ width: '150px', height: '150px', border: '2px solid #f2bac9' }} 
          />
        </div>
        
        {/* Avatar Selector */}
        {showAvatarSelector && (
          <UserAvatar 
            onSelect={handleAvatarSelect}
            currentAvatar={currentAvatar}
          />
        )}
      </div>

      {/* Inventory Section */}
      <div style={{ marginTop: '20px' }}>
        <button 
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
        >
          🏆
        </button>

        {showInventory && (
          <div style={{ marginTop: '10px' }}>
            <h2>Your Badge Collection</h2>
            <UserBadges 
              userId={userId} 
              userBadges={userBadges}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile; 