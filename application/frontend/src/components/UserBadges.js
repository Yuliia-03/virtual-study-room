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
          {row.map((url, colIndex) => (
            <div key={rowIndex * 4 + colIndex} style={{ margin: '10px' }}>
              <img
                src={url}
                alt={`Badge ${rowIndex * 4 + colIndex + 1}`}
                style={{
                  width: '80px',
                  height: '80px',
                  margin: '5px'
                }}
              />
              <div>Badge {rowIndex * 4 + colIndex + 1}</div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default UserBadges; 