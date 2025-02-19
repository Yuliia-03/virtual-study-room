import React, { useState, useEffect } from 'react';
import { getImageUrl } from '../utils/uploadImages';

const UserAvatar = ({ userId, onSelect, currentAvatar }) => {
  const [avatarUrls, setAvatarUrls] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAvatars = async () => {
      const urls = [];
      const promises = Array.from({ length: 12 }, (_, i) => 
        getImageUrl('avatars', `avatar_${i + 1}.png`)
      );
      
      const loadedUrls = await Promise.all(promises);
      setAvatarUrls(loadedUrls);
      setIsLoading(false);
    };

    loadAvatars();
  }, []);

  if (isLoading) return <div>Loading...</div>;

  const rows = [];
  for (let i = 0; i < avatarUrls.length; i += 4) {
    rows.push(avatarUrls.slice(i, i + 4));
  }

  return (
    <div style={{ width: '440px' }}>
      {rows.map((row, rowIndex) => (
        <div key={rowIndex} style={{ display: 'flex' }}>
          {row.map((url, colIndex) => (
            <img
              key={rowIndex * 4 + colIndex}
              src={url}
              alt={`Avatar ${rowIndex * 4 + colIndex + 1}`}
              onClick={() => onSelect(url)}
              style={{
                width: '100px',
                height: '100px',
                margin: '5px',
                cursor: 'pointer',
                border: url === currentAvatar ? '2px solid blue' : '1px solid gray'
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export default UserAvatar; 