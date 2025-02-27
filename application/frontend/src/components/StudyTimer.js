import React, { useState, useEffect } from 'react';
import { getDatabase, ref, set, onValue } from 'firebase/database';
import 'tailwindcss';
import '@fontsource/vt323';
import '@fontsource/press-start-2p';

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
  const [isPaused, setIsPaused] = useState(false);
  const [playSound, setPlaySound] = useState(true);
  const [studyTime, setStudyTime] = useState({ hours: 0, minutes: 25, seconds: 0 });
  const [breakTime, setBreakTime] = useState({ hours: 0, minutes: 5, seconds: 0 });

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
    // Convert hours, minutes, seconds to total seconds
    const totalStudySeconds = (
      studyTime.hours * 3600 + 
      studyTime.minutes * 60 + 
      studyTime.seconds
    );
    
    const totalBreakSeconds = (
      breakTime.hours * 3600 + 
      breakTime.minutes * 60 + 
      breakTime.seconds
    );

    setTimeLeft(totalStudySeconds);
    setStudyLength(totalStudySeconds);
    setBreakLength(totalBreakSeconds);
    setCurrentRound(1);
    setIsBreak(false);
    setIsRunning(true);
    setCurrentPage('timer');
  };

  const onMouseDown = (e) => {
    if (e.target.className.includes('timer-handle')) {
      setDragging(true);
      setDragOffset({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  const onMouseMove = (e) => {
    if (dragging) {
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
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [dragging, dragOffset]);

  useEffect(() => {
    let timer;
    if (isRunning && !isPaused && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      if (playSound) {
        // Add your sound playing logic here
      }
      setIsBreak(!isBreak);
      setTimeLeft(isBreak ? studyLength : breakLength);
      if (!isBreak) {
        setCurrentRound((prevRound) => (prevRound < rounds ? prevRound + 1 : 1));
      }
    }

    return () => clearInterval(timer);
  }, [isRunning, isPaused, timeLeft, isBreak, studyLength, breakLength, rounds, playSound]);

  const renderContent = () => {
    if (!isRunning) {
      return (
        <div className="flex flex-col items-center space-y-4">
          <div className="text-2xl" style={{ color: '#bac6f1', fontFamily: '"Press Start 2P", monospace' }}>
            Set Your Study Timer
          </div>
          
          <div className="w-full space-y-4">
            <div className="flex flex-col items-center">
              <label style={{ color: '#d1cbed', fontFamily: 'VT323, monospace' }} className="mb-2 text-sm">Study Time</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={studyTime.hours}
                  onChange={(e) => setStudyTime({...studyTime, hours: parseInt(e.target.value) || 0})}
                  className="w-16 h-10 text-center border-2 rounded-lg focus:outline-none"
                  style={{ borderColor: '#d1cbed', color: '#b2b2b2', fontFamily: '"Press Start 2P", monospace' }}
                  min="0"
                  placeholder="HH"
                />
                <span style={{ color: '#d1cbed' }} className="self-center">:</span>
                <input
                  type="number"
                  value={studyTime.minutes}
                  onChange={(e) => setStudyTime({...studyTime, minutes: parseInt(e.target.value) || 0})}
                  className="w-16 h-10 text-center border-2 rounded-lg focus:outline-none"
                  style={{ borderColor: '#d1cbed', color: '#b2b2b2', fontFamily: '"Press Start 2P", monospace' }}
                  min="0"
                  max="59"
                  placeholder="MM"
                />
                <span style={{ color: '#d1cbed' }} className="self-center">:</span>
                <input
                  type="number"
                  value={studyTime.seconds}
                  onChange={(e) => setStudyTime({...studyTime, seconds: parseInt(e.target.value) || 0})}
                  className="w-16 h-10 text-center border-2 rounded-lg focus:outline-none"
                  style={{ borderColor: '#d1cbed', color: '#b2b2b2', fontFamily: '"Press Start 2P", monospace' }}
                  min="0"
                  max="59"
                  placeholder="SS"
                />
              </div>
            </div>

            <div className="flex flex-col items-center">
              <label style={{ color: '#d1cbed', fontFamily: 'VT323, monospace' }} className="mb-2 text-sm">Break Time</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={breakTime.hours}
                  onChange={(e) => setBreakTime({...breakTime, hours: parseInt(e.target.value) || 0})}
                  className="w-16 h-10 text-center border-2 rounded-lg focus:outline-none"
                  style={{ borderColor: '#d1cbed', color: '#b2b2b2', fontFamily: '"Press Start 2P", monospace' }}
                  min="0"
                  placeholder="HH"
                />
                <span style={{ color: '#d1cbed' }} className="self-center">:</span>
                <input
                  type="number"
                  value={breakTime.minutes}
                  onChange={(e) => setBreakTime({...breakTime, minutes: parseInt(e.target.value) || 0})}
                  className="w-16 h-10 text-center border-2 rounded-lg focus:outline-none"
                  style={{ borderColor: '#d1cbed', color: '#b2b2b2', fontFamily: '"Press Start 2P", monospace' }}
                  min="0"
                  max="59"
                  placeholder="MM"
                />
                <span style={{ color: '#d1cbed' }} className="self-center">:</span>
                <input
                  type="number"
                  value={breakTime.seconds}
                  onChange={(e) => setBreakTime({...breakTime, seconds: parseInt(e.target.value) || 0})}
                  className="w-16 h-10 text-center border-2 rounded-lg focus:outline-none"
                  style={{ borderColor: '#d1cbed', color: '#b2b2b2', fontFamily: '"Press Start 2P", monospace' }}
                  min="0"
                  max="59"
                  placeholder="SS"
                />
              </div>
            </div>

            <div className="flex flex-col items-center">
              <label style={{ color: '#d1cbed', fontFamily: 'VT323, monospace' }} className="mb-2 text-sm">Rounds</label>
              <input
                type="number"
                value={rounds}
                onChange={(e) => setRounds(parseInt(e.target.value))}
                className="w-16 h-10 text-center border-2 rounded-lg focus:outline-none"
                style={{ borderColor: '#d1cbed', color: '#b2b2b2', fontFamily: '"Press Start 2P", monospace' }}
                min="1"
              />
            </div>

            <div className="flex items-center justify-center gap-2 mt-2">
              <input
                type="checkbox"
                id="soundToggle"
                checked={playSound}
                onChange={(e) => setPlaySound(e.target.checked)}
                className="w-4 h-4 border rounded focus:ring-[#d1cbed]"
                style={{ borderColor: '#d1cbed' }}
              />
              <label htmlFor="soundToggle" style={{ color: '#d1cbed', fontFamily: 'VT323, monospace' }}>
                Play sound when timer ends
              </label>
            </div>
          </div>

          <button
            onClick={startTimer}
            className="mt-4 px-8 py-3 text-white rounded-lg transition-colors duration-200"
            style={{ backgroundColor: '#d1cbed', fontFamily: '"Press Start 2P", monospace' }}
          >
            Start Timer
          </button>
        </div>
      );
    }

    return (
      <>
        <div className="text-[#FFB5C5] text-2xl mt-8" style={{ fontFamily: '"Press Start 2P", monospace' }}>
          {isBreak ? 'Break Time!' : 'Lock in or else!'}
        </div>

        <div className="text-[48px] font-bold text-[#FFB5C5] mb-2" style={{ fontFamily: '"Press Start 2P", monospace' }}>
          {formatTime(timeLeft)}
        </div>

        <div className="text-sm text-gray-600 text-center mt-2">
          Round {currentRound} of {rounds}
        </div>

        <div className="flex justify-between gap-2.5 mt-2.5">
          <button 
            onClick={toggleTimer}
            className="flex-1 bg-[#E6E6FA] border border-[#FFB5C5] rounded px-4 py-1.5 text-gray-600 text-sm hover:bg-[#FFB5C5] hover:text-white cursor-pointer"
          >
            {isPaused ? 'Resume' : 'Pause'}
          </button>
          <button 
            onClick={resetTimer}
            className="flex-1 bg-[#E6E6FA] border border-[#FFB5C5] rounded px-4 py-1.5 text-gray-600 text-sm hover:bg-[#FFB5C5] hover:text-white cursor-pointer"
          >
            Reset
          </button>
        </div>
      </>
    );
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const unsubscribe = onValue(ref(getDatabase(), `rooms/${roomId}/timer`), (snapshot) => {
    const data = snapshot.val();
    if (!data && isHost) {
      // Initialise data if it doesn't exist
    } else if (data) {
      // Update local state with Firebase data
    }
  });

  const toggleTimer = () => {
    setIsPaused(!isPaused);
  };

  const resetTimer = () => {
    // Convert hours, minutes, seconds to total seconds
    const totalStudySeconds = (
      studyTime.hours * 3600 + 
      studyTime.minutes * 60 + 
      studyTime.seconds
    );
    
    setTimeLeft(totalStudySeconds);
    setCurrentRound(1);
    setIsBreak(false);
    setIsRunning(true);
    setIsPaused(false);
  };

  const handleBack = () => {
    setIsRunning(false);
    setIsPaused(false);
    setTimeLeft(studyLength * 60);
    setCurrentRound(1);
    setIsBreak(false);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center">
      <div 
        style={{ 
          position: 'absolute',
          left: `${position.x}px`,
          top: `${position.y}px`,
          cursor: dragging ? 'grabbing' : 'grab',
          backgroundColor: '#F0F3FC',
          border: '4px solid #E2E8FF',
          boxShadow: '0 0 10px #E2E8FF, inset 0 0 10px #E2E8FF, 0 0 20px rgba(226, 232, 255, 0.4), 0 0 30px rgba(186, 198, 241, 0.2)',
          filter: 'blur(0.3px)',
          outline: '4px solid rgba(186, 198, 241, 0.3)',
          outlineOffset: '4px',
          WebkitFilter: 'drop-shadow(0 0 40px rgba(186, 198, 241, 0.4))'
        }}
        className="timer-handle"
        onMouseDown={(e) => {
          if (e.target.classList.contains('timer-handle')) {
            onMouseDown(e);
          }
        }}
      >
        {!isRunning ? (
          <div className="p-6 w-80 h-[500px] flex flex-col bg-[#F0F3FC] timer-handle">
            <div className="timer-handle mb-4 pl-3">
              <h1 className="text-2xl" style={{ color: '#b2b2b2', fontFamily: 'VT323, monospace' }}>Study Timer</h1>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="text-2xl mb-4" style={{ color: '#bac6f1', fontFamily: '"Press Start 2P", monospace' }}>
                Set Your Study Timer
              </div>
              
              <div className="w-full space-y-4">
                <div className="flex flex-col items-center">
                  <label style={{ color: '#d1cbed', fontFamily: 'VT323, monospace' }} className="mb-2 text-sm">Study Time</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={studyTime.hours}
                      onChange={(e) => setStudyTime({...studyTime, hours: parseInt(e.target.value) || 0})}
                      className="w-16 h-10 text-center border-2 rounded-lg focus:outline-none"
                      style={{ borderColor: '#d1cbed', color: '#b2b2b2', fontFamily: '"Press Start 2P", monospace' }}
                      min="0"
                      placeholder="HH"
                    />
                    <span style={{ color: '#d1cbed' }} className="self-center">:</span>
                    <input
                      type="number"
                      value={studyTime.minutes}
                      onChange={(e) => setStudyTime({...studyTime, minutes: parseInt(e.target.value) || 0})}
                      className="w-16 h-10 text-center border-2 rounded-lg focus:outline-none"
                      style={{ borderColor: '#d1cbed', color: '#b2b2b2', fontFamily: '"Press Start 2P", monospace' }}
                      min="0"
                      max="59"
                      placeholder="MM"
                    />
                    <span style={{ color: '#d1cbed' }} className="self-center">:</span>
                    <input
                      type="number"
                      value={studyTime.seconds}
                      onChange={(e) => setStudyTime({...studyTime, seconds: parseInt(e.target.value) || 0})}
                      className="w-16 h-10 text-center border-2 rounded-lg focus:outline-none"
                      style={{ borderColor: '#d1cbed', color: '#b2b2b2', fontFamily: '"Press Start 2P", monospace' }}
                      min="0"
                      max="59"
                      placeholder="SS"
                    />
                  </div>
                </div>

                <div className="flex flex-col items-center">
                  <label style={{ color: '#d1cbed', fontFamily: 'VT323, monospace' }} className="mb-2 text-sm">Break Time</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={breakTime.hours}
                      onChange={(e) => setBreakTime({...breakTime, hours: parseInt(e.target.value) || 0})}
                      className="w-16 h-10 text-center border-2 rounded-lg focus:outline-none"
                      style={{ borderColor: '#d1cbed', color: '#b2b2b2', fontFamily: '"Press Start 2P", monospace' }}
                      min="0"
                      placeholder="HH"
                    />
                    <span style={{ color: '#d1cbed' }} className="self-center">:</span>
                    <input
                      type="number"
                      value={breakTime.minutes}
                      onChange={(e) => setBreakTime({...breakTime, minutes: parseInt(e.target.value) || 0})}
                      className="w-16 h-10 text-center border-2 rounded-lg focus:outline-none"
                      style={{ borderColor: '#d1cbed', color: '#b2b2b2', fontFamily: '"Press Start 2P", monospace' }}
                      min="0"
                      max="59"
                      placeholder="MM"
                    />
                    <span style={{ color: '#d1cbed' }} className="self-center">:</span>
                    <input
                      type="number"
                      value={breakTime.seconds}
                      onChange={(e) => setBreakTime({...breakTime, seconds: parseInt(e.target.value) || 0})}
                      className="w-16 h-10 text-center border-2 rounded-lg focus:outline-none"
                      style={{ borderColor: '#d1cbed', color: '#b2b2b2', fontFamily: '"Press Start 2P", monospace' }}
                      min="0"
                      max="59"
                      placeholder="SS"
                    />
                  </div>
                </div>

                <div className="flex flex-col items-center">
                  <label style={{ color: '#d1cbed', fontFamily: 'VT323, monospace' }} className="mb-2 text-sm">Rounds</label>
                  <input
                    type="number"
                    value={rounds}
                    onChange={(e) => setRounds(parseInt(e.target.value))}
                    className="w-16 h-10 text-center border-2 rounded-lg focus:outline-none"
                    style={{ borderColor: '#d1cbed', color: '#b2b2b2', fontFamily: '"Press Start 2P", monospace' }}
                    min="1"
                  />
                </div>

                <div className="flex items-center justify-center gap-2">
                  <input
                    type="checkbox"
                    id="soundToggle"
                    checked={playSound}
                    onChange={(e) => setPlaySound(e.target.checked)}
                    className="w-4 h-4 border rounded focus:ring-[#d1cbed]"
                    style={{ borderColor: '#d1cbed' }}
                  />
                  <label htmlFor="soundToggle" style={{ color: '#d1cbed', fontFamily: 'VT323, monospace' }}>
                    Play sound when timer ends
                  </label>
                </div>
              </div>

              <button
                onClick={startTimer}
                className="mt-4 px-8 py-2 text-white rounded-lg transition-colors duration-200"
                style={{ backgroundColor: '#d1cbed', fontFamily: '"Press Start 2P", monospace' }}
              >
                Start Timer
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6 w-80 h-[500px] flex flex-col bg-[#F0F3FC] timer-handle">
            <div className="timer-handle mb-4 pl-3 flex justify-between items-center">
              <h1 className="text-2xl" style={{ color: '#b2b2b2', fontFamily: 'VT323, monospace' }}>Study Timer</h1>
              <div style={{ color: '#b2b2b2', fontFamily: 'VT323, monospace' }}>
                Round {currentRound} of {rounds}
              </div>
            </div>
            
            <div className="flex-grow flex flex-col items-center">
              <div className="text-2xl mb-4" style={{ color: '#bac6f1', fontFamily: '"Press Start 2P", monospace' }}>
                {isBreak ? 'Break Time!' : 'Lock in or else!'}
              </div>
              
              <div className="text-[48px] font-bold mb-2" style={{ color: '#bac6f1', fontFamily: '"Press Start 2P", monospace' }}>
                {formatTime(timeLeft)}
              </div>
            </div>

            <div className="flex justify-between items-center">
              <button 
                onClick={handleBack}
                className="hover:text-[#bac6f1] transition-colors duration-200 pl-3"
                style={{ fontFamily: 'VT323, monospace', fontSize: '24px', color: '#e4d1f1' }}
              >
                ⬅
              </button>
              <div className="flex gap-4">
                <button 
                  onClick={toggleTimer}
                  className="px-4 py-1 text-sm rounded-lg transition-colors duration-200"
                  style={{ backgroundColor: '#d1cbed', color: 'white', fontFamily: 'VT323, monospace' }}
                >
                  {isPaused ? 'Resume' : 'Pause'}
                </button>
                <button 
                  onClick={resetTimer}
                  className="px-4 py-1 text-sm rounded-lg transition-colors duration-200"
                  style={{ backgroundColor: '#d1cbed', color: 'white', fontFamily: 'VT323, monospace' }}
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudyTimer;