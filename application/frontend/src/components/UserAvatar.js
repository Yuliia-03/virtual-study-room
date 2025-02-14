import React, { useState } from 'react';
import { uploadImage, getImageUrl } from '../../../../frontend/src/utils/uploadImages';

const UserAvatar = ({ userId }) => {
  const [avatarUrl, setAvatarUrl] = useState(null);

  const loadAvatar = async () => {
    try {
      const url = await getImageUrl('avatars', `user_${userId}`);
      setAvatarUrl(url);
    } catch (error) {
      console.log('No avatar found for user');
    }
  };

  const handleAvatarUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        const url = await uploadImage(file, 'avatars', `user_${userId}`);
        setAvatarUrl(url);
      } catch (error) {
        console.error('Error uploading avatar:', error);
      }
    }
  };

  return (
    <div>
      {avatarUrl ? (
        <img src={avatarUrl} alt="User Avatar" style={{ width: 100, height: 100 }} />
      ) : (
        <div>No avatar selected</div>
      )}
      <input type="file" onChange={handleAvatarUpload} accept="image/*" />
    </div>
  );
};

export default UserAvatar; 