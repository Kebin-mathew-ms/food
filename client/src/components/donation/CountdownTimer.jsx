import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

/**
 * Live Countdown timer to expire listings on screen.
 */
export const CountdownTimer = ({ expiryTime, onExpire }) => {
  const [timeLeft, setTimeLeft] = useState('');
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(expiryTime) - new Date();
      if (difference <= 0) {
        setIsExpired(true);
        setTimeLeft('Expired');
        if (onExpire) onExpire();
        return;
      }

      const hours = Math.floor(difference / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      const parts = [];
      if (hours > 0) parts.push(`${hours}h`);
      parts.push(`${minutes}m`);
      parts.push(`${seconds}s`);

      setTimeLeft(parts.join(' '));
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [expiryTime, onExpire]);

  return (
    <div
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold border transition-colors ${
        isExpired
          ? 'bg-rose-500/10 text-rose-500 border-rose-500/20'
          : 'bg-primary/5 text-primary border-primary/10 animate-pulse'
      }`}
    >
      <Clock className="w-3.5 h-3.5" />
      <span>{timeLeft}</span>
    </div>
  );
};

export default CountdownTimer;
