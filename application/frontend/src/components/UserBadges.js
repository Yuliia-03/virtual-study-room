import React, { useState, useEffect } from 'react';
import { getImageUrl } from '../../../../frontend/src/utils/uploadImages';
import { getDatabase, ref, get } from 'firebase/database';

const UserBadges = ({ userId }) => {
  const [badgeUrls, setBadgeUrls] = useState({});
  const [earnedBadges, setEarnedBadges] = useState([]);

  useEffect(() => {
    const loadUserBadges = async () => {
      const db = getDatabase();
      const userBadgesRef = ref(db, `users/${userId}/badges`);
      
      try {
        const snapshot = await get(userBadgesRef);
        if (snapshot.exists()) {
          const badges = Object.keys(snapshot.val());
          setEarnedBadges(badges);
          
          // Load badge images
          const urls = {};
          for (const badgeId of badges) {
            const url = await getImageUrl('badges', `badge_${badgeId}`);
            urls[badgeId] = url;
          }
          setBadgeUrls(urls);
        }
      } catch (error) {
        console.error('Error loading user badges:', error);
      }
    };

    loadUserBadges();
  }, [userId]);

  return (
    <div style={{ display: 'flex', gap: '10px' }}>
      {earnedBadges.map(badgeId => (
        <img 
          key={badgeId}
          src={badgeUrls[badgeId]}
          alt={`Badge ${badgeId}`}
          style={{ width: 50, height: 50 }}
        />
      ))}
    </div>
  );
};

export default UserBadges; 