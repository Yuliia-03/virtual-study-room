import React, { useState, useEffect } from 'react';
import { getImageUrl } from '../utils/uploadImages';

const UserAvatar = ({ userId, onSelect, currentAvatar }) => {
  const [avatarUrls, setAvatarUrls] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadAvatars = async () => {
      try {
        const urls = [];
        const promises = Array.from({ length: 12 }, (_, i) => 
          getImageUrl('avatars', `avatar_${i + 1}.png`)
        );
        
        const loadedUrls = await Promise.all(promises);
        setAvatarUrls(loadedUrls);
      } catch (err) {
        setError(err);
        console.error('Error loading avatars:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadAvatars();
  }, []);

  const handleSelect = (url) => {
    if (onSelect) {
      onSelect(url);
    }
  };

  const handleKeyDown = (event, url) => {
    if (event.key === 'Enter' && onSelect) {
      onSelect(url);
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading avatars</div>;

  return (
    <div data-testid="avatar-grid" style={{ width: '440px' }}>
      {Array.from({ length: Math.ceil(avatarUrls.length / 4) }, (_, rowIndex) => (
        <div 
          key={rowIndex} 
          data-testid="avatar-row"
          role="row" 
          style={{ display: 'flex' }}
        >
          {avatarUrls.slice(rowIndex * 4, (rowIndex + 1) * 4).map((url, colIndex) => (
            <img
              key={rowIndex * 4 + colIndex}
              src={url}
              alt={`Avatar ${rowIndex * 4 + colIndex + 1}`}
              onClick={() => handleSelect(url)}
              onKeyDown={(e) => handleKeyDown(e, url)}
              tabIndex={0}
              style={{
                width: '100px',
                height: '100px',
                margin: '5px',
                cursor: 'pointer',
                border: url === currentAvatar ? '2px solid #f2bac9' : '1px solid #bad7f5'
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export default UserAvatar; 