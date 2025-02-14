import React, { useState, useEffect } from 'react';
import { getImageUrl } from '../utils/uploadImages';
import { getStorage, ref, listAll, getDownloadURL } from 'firebase/storage';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';

const UserProfile = ({ userId }) => {
  const [availableAvatars, setAvailableAvatars] = useState([]);
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [userBadges, setUserBadges] = useState([]);
  const [showBadges, setShowBadges] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUserData = async () => {
      setIsLoading(true);
      try {
        const db = getFirestore();
        const storage = getStorage();
        
        // Load user's current avatar and badges
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
          setSelectedAvatar(userDoc.data().avatarUrl || null);
          setUserBadges(userDoc.data().badges || []);
        }

        // Load available avatars from Firebase Storage
        const avatarsRef = ref(storage, 'avatars');
        const avatarsList = await listAll(avatarsRef);
        const urls = await Promise.all(
          avatarsList.items.map(item => getDownloadURL(item))
        );
        setAvailableAvatars(urls);
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, [userId]);

  const handleAvatarSelect = async (avatar) => {
    setSelectedAvatar(avatar);
    
    // Save selected avatar to user's profile
    const db = getFirestore();
    await updateDoc(doc(db, 'users', userId), {
      avatarUrl: avatar
    });
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="profile-section">
      {/* Current avatar display */}
      <div className="current-avatar">
        {selectedAvatar && <img src={selectedAvatar} alt="Current Avatar" />}
      </div>

      {/* avatar selection grid */}
      <div className="avatar-grid">
        {availableAvatars.map((avatar, index) => (
          <img
            key={index}
            src={avatar}
            alt={`Avatar option ${index + 1}`}
            onClick={() => handleAvatarSelect(avatar)}
            className={selectedAvatar === avatar ? 'selected' : ''}
          />
        ))}
      </div>

      {/* Badge Inventory Button */}
      <button onClick={() => setShowBadges(!showBadges)}>
        {showBadges ? 'Hide Badges' : 'Show Badges'}
      </button>

      {/* Badge Display */}
      {showBadges && (
        <div className="badge-inventory">
          {userBadges.map((badge, index) => (
            <img
              key={index}
              src={badge.url}
              alt={badge.name}
              title={badge.description}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default UserProfile; 