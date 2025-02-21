import React, { useState, useEffect } from 'react';
import { getImageUrl } from '../utils/uploadImages';

const UserBadges = ({ userId, userBadges }) => {
  const [badgeUrls, setBadgeUrls] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadBadges = async () => {
      const promises = Array.from({ length: 12 }, (_, i) => 
        getImageUrl('badges', `badge_${i + 1}.png`)
      );
      
      const loadedUrls = await Promise.all(promises);
      setBadgeUrls(loadedUrls);
      setIsLoading(false);
    };

    loadBadges();
  }, []);

  if (isLoading) return <div>Loading...</div>;

  const rows = [];
  for (let i = 0; i < badgeUrls.length; i += 4) {
    rows.push(badgeUrls.slice(i, i + 4));
  }

  return (
    <div style={{ width: '440px' }}>
      {rows.map((row, rowIndex) => (
        <div key={rowIndex} style={{ display: 'flex' }}>
          {row.map((url, colIndex) => {
            const badgeIndex = rowIndex * 4 + colIndex + 1;
            const isEarned = userBadges && userBadges[`badge_${badgeIndex}`];

            return (
              <div 
                key={rowIndex * 4 + colIndex} 
                style={{ 
                  margin: '10px',
                  textAlign: 'center',
                  position: 'relative',
                  padding: '8px',
                  backgroundColor: isEarned ? '#fff5f7' : 'transparent',
                  borderRadius: '8px',
                  transition: 'all 0.2s ease-in-out'
                }}
              >
                <img
                  src={url}
                  alt={`Badge ${badgeIndex}`}
                  style={{
                    width: '80px',
                    height: '80px',
                    margin: '5px',
                    opacity: isEarned ? '1' : '0.4',
                    filter: isEarned ? 'drop-shadow(0 0 4px #f2e2ba)' : 'grayscale(100%)',
                    transition: 'all 0.2s ease-in-out'
                  }}
                />
                <div style={{ 
                  fontSize: '14px',
                  fontWeight: isEarned ? 'bold' : 'normal',
                  color: isEarned ? '#000' : '#666'
                }}>
                  Badge {badgeIndex}
                </div>
                {isEarned && (
                  <div style={{ 
                    fontSize: '12px', 
                    color: '#666',
                    marginTop: '2px'
                  }}>
                    Earned: {new Date(userBadges[`badge_${badgeIndex}`].dateAwarded).toLocaleDateString()}
                  </div>
                )}
                {!isEarned && (
                  <div style={{ 
                    fontSize: '12px', 
                    color: '#666',
                    marginTop: '2px'
                  }}>
                    Not yet earned
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default UserBadges; 