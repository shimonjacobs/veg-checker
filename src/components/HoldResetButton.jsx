import React, { useState, useRef } from 'react';

export default function HoldResetButton({ onConfirm, className }) {
  const [holdProgress, setHoldProgress] = useState(0);
  const timerRef = useRef(null);

  const handleStart = () => {
    const startTime = Date.now();
    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min((elapsed / 1500) * 100, 100);
      setHoldProgress(progress);
      if (progress >= 100) {
        clearInterval(timerRef.current);
        onConfirm();
        setHoldProgress(0);
      }
    }, 20);
  };

  const handleEnd = () => {
    clearInterval(timerRef.current);
    setHoldProgress(0);
  };

  return (
    <button
      onMouseDown={handleStart}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
      onTouchStart={handleStart}
      onTouchEnd={handleEnd}
      className={`relative overflow-hidden ${className || 'px-3 py-2 rounded-xl bg-gray-200 text-gray-800'}`}
    >
      <span className="relative z-10">Hold to Reset</span>
      <div
        className="absolute bottom-0 left-0 h-full bg-black transition-all duration-75"
        style={{ width: `${holdProgress}%`, opacity: holdProgress > 0 ? 0.2 : 0 }}
      ></div>
    </button>
  );
}
