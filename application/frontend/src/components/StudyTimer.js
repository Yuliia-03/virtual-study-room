import React, { useState, useEffect } from 'react';
import { getDatabase, ref, set, onValue } from 'firebase/database';
import "../styles/Timer.css";

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
      setIsBreak(!isBreak);
      setCurrentRound((prevRound) => (prevRound < rounds ? prevRound + 1 : 1));
      setTimeLeft(isBreak ? breakLength * 60 : studyLength * 60);
    }

    return () => clearInterval(timer);
  }, [isRunning, timeLeft, isBreak, studyLength, breakLength, rounds]);

  const renderContent = () => {
    if (!isRunning) {
      return (
        <>
          <div className="status-text">Set Your Study Timer</div>
          {isHost && (
            <>
              <div className="timer-input">
                <label>Study (mins)</label>
                <input
                  type="number"
                  value={studyLength}
                  onChange={(e) => setStudyLength(parseInt(e.target.value))}
                  min="1"
                />
              </div>
              <div className="timer-input">
                <label>Break (mins)</label>
                <input
                  type="number"
                  value={breakLength}
                  onChange={(e) => setBreakLength(parseInt(e.target.value))}
                  min="1"
                />
              </div>
              <div className="timer-input">
                <label>Rounds</label>
                <input
                  type="number"
                  value={rounds}
                  onChange={(e) => setRounds(parseInt(e.target.value))}
                  min="1"
                />
              </div>
              <button className="start-button" onClick={startTimer}>
                Start Timer
              </button>
            </>
          )}
        </>
      );
    }

    return (
      <>
        <div className="status-text">
          {isBreak ? 'Break Time!' : 'Study Time!'}
        </div>
        <div className="timer-display">
          {formatTime(timeLeft)}
        </div>
        <div className="round-display">
          Round {currentRound} of {rounds}
        </div>
        {isHost && (
          <div className="timer-controls">
            <button onClick={() => setIsRunning(!isRunning)}>
              {isRunning ? 'Pause' : 'Resume'}
            </button>
            <button onClick={() => setTimeLeft(studyLength * 60)}>
              Reset
            </button>
          </div>
        )}
      </>
    );
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
    <div className="flex flex-col items-center justify-center p-6 bg-pink-50 border-2 border-pink-300 rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold text-pink-600">Let's time your study!</h1>
      <div className="mt-4">
        <div className="flex flex-col items-center">
          <label className="text-pink-500">Study (mins)</label>
          <input
            type="number"
            value={studyLength}
            onChange={(e) => setStudyLength(parseInt(e.target.value))}
            className="w-16 p-2 border-2 border-pink-300 rounded-md text-center"
            min="1"
          />
        </div>
        <div className="flex flex-col items-center mt-2">
          <label className="text-pink-500">Break (mins)</label>
          <input
            type="number"
            value={breakLength}
            onChange={(e) => setBreakLength(parseInt(e.target.value))}
            className="w-16 p-2 border-2 border-pink-300 rounded-md text-center"
            min="1"
          />
        </div>
        <div className="flex flex-col items-center mt-2">
          <label className="text-pink-500">Rounds</label>
          <input
            type="number"
            value={rounds}
            onChange={(e) => setRounds(parseInt(e.target.value))}
            className="w-16 p-2 border-2 border-pink-300 rounded-md text-center"
            min="1"
          />
        </div>
        <button
          onClick={startTimer}
          className="mt-4 bg-pink-400 text-white py-2 px-4 rounded-lg hover:bg-pink-500 transition"
        >
          Start Timer
        </button>
      </div>
      <div className="mt-6">
        {isRunning && (
          <div className="text-xl text-pink-600">
            {isBreak ? 'Break Time!' : 'Study Time!'} <br />
            <span className="text-4xl">{formatTime(timeLeft)}</span>
          </div>
        )}
      </div>
      <div className="mt-6">
        {/* Placeholder for animation */}
        <div className="w-32 h-32 bg-blue-200 rounded-full flex items-center justify-center">
          {/* Animation will go here */}
          <span className="text-lg text-blue-600">Animation</span>
        </div>
      </div>
    </div>
  );
};

export default StudyTimer;