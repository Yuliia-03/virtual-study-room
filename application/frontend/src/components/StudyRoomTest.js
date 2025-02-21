import React from 'react';
import StudyTimer from './StudyTimer';

const StudyRoomTest = () => {
  // Mock data for testing
  const testRoomId = 'test-room-123';
  const isHost = true; // Set to true so we can test all controls

  return (
    <div style={{ padding: '20px' }}>
      <h1>Study Room Timer Test</h1>
      <StudyTimer 
        roomId={testRoomId}
        isHost={isHost}
      />
    </div>
  );
};

export default StudyRoomTest; 