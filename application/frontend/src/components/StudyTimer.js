import React, { useState, useEffect } from 'react'; 
import { getDatabase, ref, set, onValue } from 'firebase/database';
import { database } from '../firebase-config';
import 'tailwindcss';
import '@fontsource/vt323';
import '@fontsource/press-start-2p';

const StudyTimer = ({ roomId, isHost, onClose, "data-testid": dataTestId }) => {
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
  const [errorMessage, setErrorMessage] = useState('');

  const completionSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3');

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

  const validateTimeInput = (time, type) => {
    if (time.hours < 0 || time.hours > 99) {
      setErrorMessage(`Invalid ${type} hours. Please enter a value between 0 and 99.`);
      return false;
    }
    if (time.minutes < 0 || time.minutes > 59) {
      setErrorMessage(`Invalid ${type} minutes. Please enter a value between 0 and 59.`);
      return false;
    }
    if (time.seconds < 0 || time.seconds > 59) {
      setErrorMessage(`Invalid ${type} seconds. Please enter a value between 0 and 59.`);
      return false;
    }
    return true;
  };

  const startTimer = () => {
    if (!validateTimeInput(studyTime, 'study') || !validateTimeInput(breakTime, 'break')) {
      return;
    }

    if (studyTime.hours === 0 && studyTime.minutes === 0 && studyTime.seconds === 0) {
      setErrorMessage('Focus time input is empty.');
      return;
    }

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
      if (!isBreak && currentRound >= rounds) {
        setIsRunning(false);
        setCurrentPage('completed');
        if (playSound) {
          completionSound.play();
        }
        return;
      }
      
      if (playSound) {
        completionSound.play();
      }
      
      if (!isBreak) {
        setIsBreak(true);
        setTimeLeft(breakLength);
        setCurrentRound((prevRound) => prevRound + 1);
      } else {
        setIsBreak(false);
        setTimeLeft(studyLength);
      }
    }
  
    return () => clearInterval(timer);
  }, [isRunning, isPaused, timeLeft, isBreak, studyLength, breakLength, rounds, playSound, currentRound]);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleTimer = () => {
    setIsPaused(!isPaused);
  };

  const resetTimer = () => {
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

  const clearError = () => {
    setErrorMessage('');
  };

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => {
        setErrorMessage('');
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  const errorMessageAnimation = `
    @keyframes dissolveIn {
      0% {
        opacity: 0;
        transform: translateY(10px);
      }
      100% {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `;

  return (
    <div className="fixed inset-0 flex items-center justify-center" style={{ pointerEvents: 'none', zIndex: 1000 }}>
      <style>
        {`
          ${errorMessageAnimation}
          
          .study-timer-wrapper {
            position: absolute !important;
            background-color: #F0F3FC !important;
            border: 4px solid #E2E8FF !important;
            padding: 20px;
            border-radius: 30px;
            box-shadow: 0 0 10px #E2E8FF, inset 0 0 10px #E2E8FF, 0 0 20px rgba(226, 232, 255, 0.4), 0 0 30px rgba(186, 198, 241, 0.2) !important;
            filter: blur(0.3px) !important;
            outline: 4px solid rgba(186, 198, 241, 0.3) !important;
            outline-offset: 4px !important;
            -webkit-filter: drop-shadow(0 0 40px rgba(186, 198, 241, 0.4)) !important;
            pointer-events: auto !important;
            z-index: 1000 !important;
            width: 315px !important;
            height: 370px !important;
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
          }

          .study-timer-wrapper .vt323 {
            font-family: "VT323", monospace !important;
          }

          .study-timer-wrapper .press-start {
            font-family: "Press Start 2P", monospace !important;
          }

          .study-timer-wrapper input[type="number"] {
            width: 3rem !important;
            height: 2.5rem !important;
            text-align: center !important;
            border: 2px solid #d1cbed !important;
            border-radius: 8px !important;
            background-color: transparent !important;
            color: #b2b2b2 !important;
            font-family: "Press Start 2P", monospace !important;
            font-size: 0.875rem !important;
            margin: 0 0.5rem !important;
            outline: none !important;
          }

          .study-timer-wrapper input[type="number"]:focus {
            border-color: #bac6f1 !important;
          }

          .study-timer-wrapper .input-label {
            font-family: "VT323", monospace !important;
            color: #d1cbed !important;
          }

          .study-timer-wrapper .start-timer-button {
            font-family: "Press Start 2P", monospace !important;
            background-color: #d1cbed !important;
            color: white !important;
            width: 80% !important;
            padding: 0.5rem !important;
            border-radius: 0.5rem !important;
            font-size: 0.875rem !important;
            margin-top: 1rem !important;
            text-align: center !important;
            transition: background-color 0.3s, transform 0.3s !important;
          }

          .study-timer-wrapper .start-timer-button:hover {
            background-color: #8e99e3 !important;
            transform: scale(1.05) !important;
          }

          .study-timer-wrapper .timer-title {
            font-family: "VT323", monospace !important;
            color: #b2b2b2 !important;
          }

          .study-timer-wrapper .timer-subtitle {
            font-family: "Press Start 2P", monospace !important;
            color: #bac6f1 !important;
          }
        `}
      </style>
      
      {errorMessage && (
        <div 
          className="fixed p-3 z-50 flex items-center justify-center"
          style={{ 
            backgroundColor: '#e2e8ff',
            borderBottom: '2px solid rgba(209, 203, 237, 0.5)',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(186, 198, 241, 0.2)',
            width: '300px',
            animation: 'dissolveIn 0.3s ease-out forwards',
            top: `${position.y - 50}px`,
            left: `${position.x}px`,  
            transform: 'translateX(10px)',  
            pointerEvents: 'auto',
            margin: '0 auto',  
            right: 'auto',
            marginLeft: '10px',  
          }}
        >
          <span 
            style={{ 
              color: '#99a8c7', 
              fontFamily: 'VT323, monospace',
              fontSize: '18px'
            }}
          >
            {errorMessage}
          </span>
        </div>
      )}
      
      <div 
        className="study-timer-wrapper timer-handle"
        style={{ 
          left: `${position.x}px`,
          top: `${position.y}px`,
          cursor: dragging ? 'grabbing' : 'grab',
        }}
        onMouseDown={onMouseDown}
      >
        <div className="timer-content">
          {currentPage === 'completed' ? (
            <div className="p-4 w-80 flex flex-col bg-[#F0F3FC] timer-handle" style={{ height: "350px", position: "relative" }}>
              <div className="text-2xl mt-8 text-center" style={{ color: '#bac6f1', fontFamily: '"Press Start 2P", monospace' }}>
                Well done!
                <br />
                Here, have a blueberry
              </div>
              
              <div style={{ 
                position: "absolute", 
                bottom: "0", 
                left: "0", 
                width: "100%",
                padding: "0 20px 20px 20px"
              }}>
                <button
                  onClick={() => {
                    setCurrentPage('welcome');
                    setCurrentRound(1);
                    setIsBreak(false);
                    setTimeLeft(studyLength);
                    setIsRunning(false);
                  }}
                  className="w-full px-4 py-2 text-white rounded-lg"
                  style={{ 
                    backgroundColor: '#d1cbed', 
                    fontFamily: '"Press Start 2P", monospace',
                    transition: 'background-color 0.3s, transform 0.3s',
                    color: 'white',
                    borderRadius: '0.5rem'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#8e99e3';
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#d1cbed';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  Start New Session
                </button>
              </div>
            </div>
          ) : !isRunning ? (
            <div className="p-4 w-80 min-height flex flex-col bg-[#F0F3FC] timer-handle">
              <div className="timer-handle mb-2 px-8 mt-2">
                <h1 className="text-2xl vt323" style={{ color: '#b2b2b2' }}>Study Timer</h1>
              </div>
              
              <div className="flex flex-col items-center px-8">
                <div className="text-2xl mb-4 press-start" style={{ color: '#bac6f1' }}>
                  Set Your Study Timer
                </div>
                
                <div className="w-full space-y-4">
                  <div className="flex flex-col items-center space-y-2">
                    <label className="vt323 text-sm" style={{ color: '#d1cbed' }}>Study Time</label>
                    <div className="flex justify-center gap-4">
                      <input
                        type="number"
                        value={studyTime.hours}
                        onChange={(e) => {
                          const value = parseInt(e.target.value) || 0;
                          if (value >= 0 && value <= 99) {
                            setStudyTime({...studyTime, hours: value});
                          }
                        }}
                        min="0"
                        max="99"
                        placeholder="0"
                      />
                      <input
                        type="number"
                        value={studyTime.minutes}
                        onChange={(e) => {
                          const value = parseInt(e.target.value) || 0;
                          if (value >= 0 && value <= 59) {
                            setStudyTime({...studyTime, minutes: value});
                          }
                        }}
                        min="0"
                        max="59"
                        placeholder="0"
                      />
                      <input
                        type="number"
                        value={studyTime.seconds}
                        onChange={(e) => {
                          const value = parseInt(e.target.value) || 0;
                          if (value >= 0 && value <= 59) {
                            setStudyTime({...studyTime, seconds: value});
                          }
                        }}
                        min="0"
                        max="59"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col items-center space-y-2">
                    <label className="vt323 text-sm" style={{ color: '#d1cbed' }}>Break Time</label>
                    <div className="flex justify-center gap-4">
                      <input
                        type="number"
                        value={breakTime.hours}
                        onChange={(e) => {
                          const value = parseInt(e.target.value) || 0;
                          if (value >= 0 && value <= 99) {
                            setBreakTime({...breakTime, hours: value});
                          }
                        }}
                        min="0"
                        max="99"
                        placeholder="0"
                      />
                      <input
                        type="number"
                        value={breakTime.minutes}
                        onChange={(e) => {
                          const value = parseInt(e.target.value) || 0;
                          if (value >= 0 && value <= 59) {
                            setBreakTime({...breakTime, minutes: value});
                          }
                        }}
                        min="0"
                        max="59"
                        placeholder="0"
                      />
                      <input
                        type="number"
                        value={breakTime.seconds}
                        onChange={(e) => {
                          const                           value = parseInt(e.target.value) || 0;
                          if (value >= 0 && value <= 59) {
                            setBreakTime({...breakTime, seconds: value});
                          }
                        }}
                        min="0"
                        max="59"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col items-center">
                    <label className="vt323 text-sm text-center mb-2" style={{ color: '#d1cbed' }}>Rounds</label>
                    
                    <div className="flex flex-row items-center"> 
                      <input
                        type="number"
                        value={rounds}
                        onChange={(e) => setRounds(parseInt(e.target.value) || 1)}
                        min="1"
                        placeholder="4"
                      />
                      
                      <span 
                        className="heart-toggle ml-6"
                        onClick={() => setPlaySound(!playSound)}
                        role="button"
                        aria-label="Toggle sound"
                      >
                        {playSound ? '💜' : '🤍'}
                      </span>
                      <span className="vt323 text-sm ml-2" style={{ color: '#d1cbed' }}>
                        Play sound when timer ends
                      </span>
                    </div>
                  </div>
                </div>

                <div className="w-full px-4">
                  <button
                    onClick={startTimer}
                    className="start-timer-button"
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#8e99e3';
                      e.currentTarget.style.transform = 'scale(1.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#d1cbed';
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  >
                    Start Timer
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 w-80 min-height bg-[#F0F3FC] timer-handle" style={{ height: '370px', position: 'relative' }}>
              <div 
                className="absolute left-0 right-0 mx-auto text-center flex justify-center items-center" 
                style={{ 
                  top: '8px', 
                  height: '50px',
                  width: '180px'
                }}
              >
                <h2 className="press-start w-full text-center" style={{ 
                  color: '#bac6f1',
                  fontSize: '20px',
                  lineHeight: 1.2
                }}>
                  {isBreak ? 'Break Time!' : 'Lock in or else!'}
                </h2>
              </div>
              
              <div className="absolute left-0 right-0 text-center" style={{ 
                top: '80px',
                color: '#bac6f1',
                fontFamily: '"Press Start 2P", monospace',
                fontSize: '50px',
                fontWeight: 'bold'
              }}>
                {formatTime(timeLeft)}
              </div>

              <div className="absolute left-0 right-0 text-center flex justify-center" style={{ 
                top: '180px',
                width: '100%'
              }}>
                <span style={{ 
                  color: '#d1cbed', 
                  fontFamily: 'VT323, monospace',
                  fontSize: '24px',
                  textAlign: 'center'
                }}>
                  Round {currentRound}/{rounds}
                </span>
              </div>

              <div className="absolute left-0 right-0 flex justify-center" style={{ 
                top: '240px',
                width: '100%',
                gap: '20px'
              }}>
                <button 
                  onClick={toggleTimer}
                  style={{
                    backgroundColor: '#d1cbed',
                    color: 'white',
                    fontFamily: 'VT323, monospace',
                    padding: '0.5rem 1.5rem',
                    borderRadius: '0.375rem',
                    fontSize: '1.25rem',
                    transition: 'background-color 0.3s, transform 0.3s',
                    width: '120px',
                    textAlign: 'center'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#8e99e3';
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#d1cbed';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  {isPaused ? 'Resume' : 'Pause'}
                </button>
                <button 
                  onClick={resetTimer}
                  style={{
                    backgroundColor: '#d1cbed',
                    color: 'white',
                    fontFamily: 'VT323, monospace',
                    padding: '0.5rem 1.5rem',
                    borderRadius: '0.375rem',
                    fontSize: '1.25rem',
                    transition: 'background-color 0.3s, transform 0.3s',
                    width: '120px',
                    textAlign: 'center'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#8e99e3';
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#d1cbed';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  Reset
                </button>
              </div>

              <button 
                onClick={handleBack}
                style={{
                  position: 'absolute',
                  left: '20px',
                  bottom: '20px',
                  fontFamily: 'VT323, monospace',
                  fontSize: '24px', 
                  color: '#d1cbed',
                  transition: 'color 0.3s',
                  background: 'none',
                  border: 'none'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#8e99e3';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#d1cbed';
                }}
              >
                ⬅
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudyTimer;
