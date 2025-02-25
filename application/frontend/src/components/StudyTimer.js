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
          <div className="text-2xl text-pink-300" style={{ fontFamily: '"Press Start 2P", monospace' }}>Set Your Study Timer</div>
          
          <div className="w-full space-y-6">
            <div className="flex flex-col items-center">
              <label className="text-pink-300 mb-2">Study Time</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={studyTime.hours}
                  onChange={(e) => setStudyTime({...studyTime, hours: parseInt(e.target.value) || 0})}
                  className="w-16 h-10 text-center border-2 border-pink-200 rounded-lg focus:outline-none focus:border-pink-300"
                  style={{ fontFamily: '"Press Start 2P", monospace' }}
                  min="0"
                  placeholder="HH"
                />
                <span className="text-pink-300 self-center">:</span>
                <input
                  type="number"
                  value={studyTime.minutes}
                  onChange={(e) => setStudyTime({...studyTime, minutes: parseInt(e.target.value) || 0})}
                  className="w-16 h-10 text-center border-2 border-pink-200 rounded-lg focus:outline-none focus:border-pink-300"
                  style={{ fontFamily: '"Press Start 2P", monospace' }}
                  min="0"
                  max="59"
                  placeholder="MM"
                />
                <span className="text-pink-300 self-center">:</span>
                <input
                  type="number"
                  value={studyTime.seconds}
                  onChange={(e) => setStudyTime({...studyTime, seconds: parseInt(e.target.value) || 0})}
                  className="w-16 h-10 text-center border-2 border-pink-200 rounded-lg focus:outline-none focus:border-pink-300"
                  style={{ fontFamily: '"Press Start 2P", monospace' }}
                  min="0"
                  max="59"
                  placeholder="SS"
                />
              </div>
            </div>

            <div className="flex flex-col items-center">
              <label className="text-pink-300 mb-2">Break Time</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={breakTime.hours}
                  onChange={(e) => setBreakTime({...breakTime, hours: parseInt(e.target.value) || 0})}
                  className="w-16 h-10 text-center border-2 border-pink-200 rounded-lg focus:outline-none focus:border-pink-300"
                  style={{ fontFamily: '"Press Start 2P", monospace' }}
                  min="0"
                  placeholder="HH"
                />
                <span className="text-pink-300 self-center">:</span>
                <input
                  type="number"
                  value={breakTime.minutes}
                  onChange={(e) => setBreakTime({...breakTime, minutes: parseInt(e.target.value) || 0})}
                  className="w-16 h-10 text-center border-2 border-pink-200 rounded-lg focus:outline-none focus:border-pink-300"
                  style={{ fontFamily: '"Press Start 2P", monospace' }}
                  min="0"
                  max="59"
                  placeholder="MM"
                />
                <span className="text-pink-300 self-center">:</span>
                <input
                  type="number"
                  value={breakTime.seconds}
                  onChange={(e) => setBreakTime({...breakTime, seconds: parseInt(e.target.value) || 0})}
                  className="w-16 h-10 text-center border-2 border-pink-200 rounded-lg focus:outline-none focus:border-pink-300"
                  style={{ fontFamily: '"Press Start 2P", monospace' }}
                  min="0"
                  max="59"
                  placeholder="SS"
                />
              </div>
            </div>

            <div className="flex flex-col items-center">
              <label className="text-pink-300 mb-2">Rounds</label>
              <input
                type="number"
                value={rounds}
                onChange={(e) => setRounds(parseInt(e.target.value))}
                className="w-20 h-10 text-center border-2 border-pink-200 rounded-lg focus:outline-none focus:border-pink-300"
                style={{ fontFamily: '"Press Start 2P", monospace' }}
                min="1"
              />
            </div>

            <div className="flex items-center justify-center gap-2">
              <input
                type="checkbox"
                id="soundToggle"
                checked={playSound}
                onChange={(e) => setPlaySound(e.target.checked)}
                className="w-4 h-4 text-pink-300 border-pink-200 rounded focus:ring-pink-300"
              />
              <label htmlFor="soundToggle" className="text-pink-300">
                Play sound when timer ends
              </label>
            </div>
          </div>

          <button
            onClick={startTimer}
            className="mt-auto mb-4 px-8 py-3 bg-pink-200 text-white rounded-full hover:bg-pink-300 transition-colors duration-200"
            style={{ fontFamily: '"Press Start 2P", monospace' }}
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
      // Initialiise data if it doesn't exist
    } else if (data) {
      // Update local state with Firebase data
    }
  });

  const toggleTimer = () => {
    setIsPaused(!isPaused);
  };

  const resetTimer = () => {
    setTimeLeft(studyLength);
    setCurrentRound(1);
    setIsBreak(false);
    setIsRunning(true);
    setCurrentPage('timer');
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
          backgroundColor: '#FEF9EC',
          border: '4px solid #FFC5D0',
          boxShadow: '0 0 10px #FFC5D0',
          filter: 'blur(0.3px)'
        }}
        className="timer-handle"
        onMouseDown={(e) => {
          if (e.target.classList.contains('timer-handle')) {
            onMouseDown(e);
          }
        }}
      >
        {!isRunning ? (
          <div 
            className="p-8 w-80 h-[600px] flex flex-col bg-[#FEF9EC] timer-handle"
            style={{ fontFamily: 'VT323, monospace' }}
          >
            <div className="flex justify-between items-center mb-4 timer-handle">
              <h1 className="text-2xl font-semibold text-gray-800">Study Timer</h1>
              <div className="flex gap-4">
                <button 
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200 text-xl"
                >
                  —
                </button>
                <button 
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200 text-xl"
                >
                  ×
                </button>
              </div>
            </div>
            
            <div className="flex flex-col items-center space-y-4 -mt-2">
              <div className="text-2xl text-pink-300" style={{ fontFamily: '"Press Start 2P", monospace' }}>Set Your Study Timer</div>
              
              <div className="w-full space-y-6">
                <div className="flex flex-col items-center">
                  <label className="text-pink-300 mb-2">Study Time</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={studyTime.hours}
                      onChange={(e) => setStudyTime({...studyTime, hours: parseInt(e.target.value) || 0})}
                      className="w-16 h-10 text-center border-2 border-pink-200 rounded-lg focus:outline-none focus:border-pink-300"
                      style={{ fontFamily: '"Press Start 2P", monospace' }}
                      min="0"
                      placeholder="HH"
                    />
                    <span className="text-pink-300 self-center">:</span>
                    <input
                      type="number"
                      value={studyTime.minutes}
                      onChange={(e) => setStudyTime({...studyTime, minutes: parseInt(e.target.value) || 0})}
                      className="w-16 h-10 text-center border-2 border-pink-200 rounded-lg focus:outline-none focus:border-pink-300"
                      style={{ fontFamily: '"Press Start 2P", monospace' }}
                      min="0"
                      max="59"
                      placeholder="MM"
                    />
                    <span className="text-pink-300 self-center">:</span>
                    <input
                      type="number"
                      value={studyTime.seconds}
                      onChange={(e) => setStudyTime({...studyTime, seconds: parseInt(e.target.value) || 0})}
                      className="w-16 h-10 text-center border-2 border-pink-200 rounded-lg focus:outline-none focus:border-pink-300"
                      style={{ fontFamily: '"Press Start 2P", monospace' }}
                      min="0"
                      max="59"
                      placeholder="SS"
                    />
                  </div>
                </div>

                <div className="flex flex-col items-center">
                  <label className="text-pink-300 mb-2">Break Time</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={breakTime.hours}
                      onChange={(e) => setBreakTime({...breakTime, hours: parseInt(e.target.value) || 0})}
                      className="w-16 h-10 text-center border-2 border-pink-200 rounded-lg focus:outline-none focus:border-pink-300"
                      style={{ fontFamily: '"Press Start 2P", monospace' }}
                      min="0"
                      placeholder="HH"
                    />
                    <span className="text-pink-300 self-center">:</span>
                    <input
                      type="number"
                      value={breakTime.minutes}
                      onChange={(e) => setBreakTime({...breakTime, minutes: parseInt(e.target.value) || 0})}
                      className="w-16 h-10 text-center border-2 border-pink-200 rounded-lg focus:outline-none focus:border-pink-300"
                      style={{ fontFamily: '"Press Start 2P", monospace' }}
                      min="0"
                      max="59"
                      placeholder="MM"
                    />
                    <span className="text-pink-300 self-center">:</span>
                    <input
                      type="number"
                      value={breakTime.seconds}
                      onChange={(e) => setBreakTime({...breakTime, seconds: parseInt(e.target.value) || 0})}
                      className="w-16 h-10 text-center border-2 border-pink-200 rounded-lg focus:outline-none focus:border-pink-300"
                      style={{ fontFamily: '"Press Start 2P", monospace' }}
                      min="0"
                      max="59"
                      placeholder="SS"
                    />
                  </div>
                </div>

                <div className="flex flex-col items-center">
                  <label className="text-pink-300 mb-2">Rounds</label>
                  <input
                    type="number"
                    value={rounds}
                    onChange={(e) => setRounds(parseInt(e.target.value))}
                    className="w-20 h-10 text-center border-2 border-pink-200 rounded-lg focus:outline-none focus:border-pink-300"
                    style={{ fontFamily: '"Press Start 2P", monospace' }}
                    min="1"
                  />
                </div>

                <div className="flex items-center justify-center gap-2">
                  <input
                    type="checkbox"
                    id="soundToggle"
                    checked={playSound}
                    onChange={(e) => setPlaySound(e.target.checked)}
                    className="w-4 h-4 text-pink-300 border-pink-200 rounded focus:ring-pink-300"
                  />
                  <label htmlFor="soundToggle" className="text-pink-300">
                    Play sound when timer ends
                  </label>
                </div>
              </div>

              <button 
                onClick={startTimer}
                className="mt-auto mb-4 px-8 py-3 bg-pink-200 text-white rounded-full hover:bg-pink-300 transition-colors duration-200"
                style={{ fontFamily: '"Press Start 2P", monospace' }}
              >
                Start Timer
              </button>
            </div>
          </div>
        ) : (
          <div 
            className="p-8 w-80 h-[600px] flex flex-col bg-[#FEF9EC] timer-handle"
            style={{ fontFamily: 'VT323, monospace' }}
          >
            <div className="flex justify-between items-center timer-handle mb-2">
              <div className="flex items-center gap-3">
                <button 
                  onClick={handleBack}
                  className="text-[#FFB5C5] hover:text-pink-400 transition-colors duration-200"
                >
                  ←
                </button>
                <h1 className="text-2xl font-semibold text-gray-800">Study Timer</h1>
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200 text-xl"
                >
                  —
                </button>
                <button 
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200 text-xl"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="text-[#FFB5C5] text-2xl mt-2" style={{ fontFamily: '"Press Start 2P", monospace' }}>
              {isBreak ? 'Break Time!' : 'Lock in or else!'}
            </div>

            <div className="flex-grow flex flex-col justify-between">
              <div className="flex-grow">
                {/* Your animation space */}
              </div>

                <div className="flex flex-col items-center mb-4">
                  <div 
                    className="text-[48px] font-bold text-[#FFB5C5] mb-2" 
                    style={{ fontFamily: '"Press Start 2P", monospace' }}
                  >
                    {formatTime(timeLeft)}
                  </div>

                  <div className="text-sm text-gray-600 mb-4">
                    Round {currentRound} of {rounds}
                  </div>

                  <div className="flex justify-between gap-2.5 w-full">
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
                </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudyTimer;