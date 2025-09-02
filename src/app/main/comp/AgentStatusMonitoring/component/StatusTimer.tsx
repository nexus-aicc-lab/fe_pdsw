// src/components/shared/StatusTimer.tsx
import React, { useState, useEffect } from 'react';

interface StatusTimerProps {
  initialTime: string | number; // Initial time in seconds or "HH:MM:SS" format
  isRunning?: boolean; // Optional: control if timer is running
}

const StatusTimer: React.FC<StatusTimerProps> = ({ 
  initialTime, 
  isRunning = true 
}) => {
  // Convert initialTime to seconds from various possible formats
  const parseTimeToSeconds = (time: string | number): number => {
    // Handle numeric inputs (already in seconds)
    if (typeof time === 'number') return time;
    if (!isNaN(Number(time))) return Number(time);
    
    // Handle HH:MM:SS format
    if (time && time.includes(':')) {
      try {
        const [hours, minutes, seconds] = time.split(':').map(Number);
        return (hours * 3600) + (minutes * 60) + seconds;
      } catch (e) {
        // console.error('Error parsing time:', time, e);
        return 0;
      }
    }
    
    // Default fallback
    return 0;
  };

  const [seconds, setSeconds] = useState<number>(parseTimeToSeconds(initialTime));

  // Format seconds to "HH:MM:SS"
  const formatTime = (totalSeconds: number): string => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    return [hours, minutes, secs]
      .map(val => String(val).padStart(2, '0'))
      .join(':');
  };

  useEffect(() => {
    // Reset timer when initialTime changes
    setSeconds(parseTimeToSeconds(initialTime));
  }, [initialTime]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    if (isRunning) {
      intervalId = setInterval(() => {
        setSeconds(prevSeconds => prevSeconds + 1);
      }, 1000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isRunning]);

  return <span>{formatTime(seconds)}</span>;
};

export default StatusTimer;