import React, { useState, useEffect } from 'react';
import { getDatabase, ref, set, onValue } from 'firebase/database';

const StudyTimer = ({ roomId, isHost, onClose }) => {
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [dragging, setDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const [studyLength, setStudyLength] = useState(25);
  const [breakLength, setBreakLength] = useState(5);
  const [rounds, setRounds] = useState(4);
  const [currentRound, setCurrentRound] = useState(1);
  const [isBreak, setIsBreak] = useState(false);
  const [timeLeft, setTimeLeft] = useState(studyLength * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [currentPage, setCurrentPage] = useState('welcome');
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    const savedStudyLength = localStorage.getItem('studyLength');
    const savedBreakLength = localStorage.getItem('breakLength');
    const savedRounds = localStorage.getItem('rounds');

    if (savedStudyLength) setStudyLength(parseInt(savedStudyLength));
    if (savedBreakLength) setBreakLength(parseInt(savedBreakLength));
    if (savedRounds) setRounds(parseInt(savedRounds));
  }, []);

  const saveSettings = () => {
    localStorage.setItem('studyLength', studyLength);
    localStorage.setItem('breakLength', breakLength);
    localStorage.setItem('rounds', rounds);
  };

  const handleExit = () => {
    if (onClose) {
      onClose();
    } else {
      console.error("onClose is not a function");
    }
  };

  const handleMinimize = () => {
    setIsMinimized(true);
  };

  const handleRestore = () => {
    setIsMinimized(false);
  };

  const startTimer = () => {
    saveSettings();
    setTimeLeft(studyLength * 60);
    setCurrentRound(1);
    setIsBreak(false);
    setIsRunning(true);
    setCurrentPage('timer');
  };

  const onMouseDown = (e) => {
    if (isHost && e.target.className.includes('timer-handle')) {
      setDragging(true);
      setDragOffset({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  const onMouseMove = (e) => {
    if (dragging && isHost) {
      setPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y
      });
    }
  };

  const onMouseUp = () => {
    setDragging(false);
  };

  useEffect(() => {
    if (isHost) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
      
      return () => {
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
      };
    }
  }, [dragging, dragOffset, isHost]);

  useEffect(() => {
    let timer;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      // Handle timer completion (e.g., switch to break)
      setIsBreak(!isBreak);
      setCurrentRound((prevRound) => (prevRound < rounds ? prevRound + 1 : 1));
      setTimeLeft(isBreak ? breakLength * 60 : studyLength * 60);
    }

    return () => clearInterval(timer);
  }, [isRunning, timeLeft, isBreak, studyLength, breakLength, rounds]);

  const renderContent = () => {
    if (isMinimized) {
      return null;
    }

    switch (currentPage) {
      case 'welcome':
        return (
          <div className="timer-page">
            <h3>Let's time your study!</h3>
            {isHost && (
              <button onClick={() => setCurrentPage('setup')}>
                Start
              </button>
            )}
          </div>
        );

      case 'setup':
        return (
          <div className="timer-page">
            <h3>Set your timer</h3>
            {isHost && (
              <>
                <div className="timer-input">
                  <label>Study time (minutes):</label>
                  <input
                    type="number"
                    value={studyLength}
                    onChange={(e) => setStudyLength(parseInt(e.target.value))}
                    min="1"
                  />
                </div>
                <div className="timer-input">
                  <label>Break time (minutes):</label>
                  <input
                    type="number"
                    value={breakLength}
                    onChange={(e) => setBreakLength(parseInt(e.target.value))}
                    min="1"
                  />
                </div>
                <div className="timer-input">
                  <label>Number of rounds:</label>
                  <input
                    type="number"
                    value={rounds}
                    onChange={(e) => setRounds(parseInt(e.target.value))}
                    min="1"
                  />
                </div>
                <button onClick={() => setCurrentPage('confirm')}>
                  Next
                </button>
              </>
            )}
          </div>
        );

      case 'confirm':
        return (
          <div className="timer-page">
            <h3>Confirm settings</h3>
            <div>Study time: {studyLength} minutes</div>
            <div>Break time: {breakLength} minutes</div>
            <div>Rounds: {rounds}</div>
            {isHost && (
              <div>
                <button onClick={() => setCurrentPage('setup')}>
                  Back
                </button>
                <button onClick={startTimer}>
                  Start Timer
                </button>
                <button onClick={handleExit}>
                  Exit
                </button>
                <button onClick={handleMinimize}>
                  Minimize
                </button>
              </div>
            )}
          </div>
        );

      case 'timer':
        return (
          <div className="timer-page">
            <div className="timer-display">
              <h3>{isBreak ? 'Break Time!' : 'Study Time!'}</h3>
              <div className="time">{formatTime(timeLeft)}</div>
              <div className="round">Round {currentRound} of {rounds}</div>
            </div>
            {isHost && (
              <div className="timer-controls">
                <button onClick={() => setIsRunning(!isRunning)}>
                  {isRunning ? 'Pause' : 'Resume'}
                </button>
                <button onClick={() => setCurrentPage('setup')}>
                  Reset
                </button>
                <button onClick={handleMinimize}>
                  Minimize
                </button>
                <button onClick={handleExit}>
                  Exit
                </button>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const unsubscribe = onValue(ref(getDatabase(), `rooms/${roomId}/timer`), (snapshot) => {
    const data = snapshot.val();
    if (!data && isHost) {
      // Initialiise data if it doesn't exist
    } else if (data) {
      // Update local state with Firebase data
    }
  });

  return (
    <div
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        background: 'white',
        border: '2px solid #ccc',
        padding: '10px',
        cursor: dragging ? 'grabbing' : 'default',
        zIndex: 1000,
        width: '300px',
        height: '400px',
        boxSizing: 'border-box',
        display: isMinimized ? 'none' : 'block'
      }}
      onMouseDown={onMouseDown}
    >
      <div 
        className="timer-handle"
        style={{
          padding: '5px',
          cursor: isHost ? 'grab' : 'default',
          borderBottom: '1px solid #ccc',
          textAlign: 'center',
          position: 'relative'
        }}
      >
        <div style={{ position: 'absolute', right: '5px', top: '5px' }}>
          <button onClick={handleMinimize} style={{ fontSize: '12px' }}>-</button>
          <button onClick={handleExit} style={{ fontSize: '12px' }}>X</button>
        </div>
        <h4 style={{ margin: 0 }}>Egg Timer</h4>
      </div>
      {renderContent()}
    </div>
  );
};

export default StudyTimer;