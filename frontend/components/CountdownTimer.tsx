'use client';

import { useEffect, useState } from 'react';

interface CountdownTimerProps {
  endTime: string;
  onEnd?: () => void;
}

export default function CountdownTimer({ endTime, onEnd }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, isEnded: false });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const end = new Date(endTime).getTime();
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isEnded: true });
        onEnd?.();
        clearInterval(timer);
        return;
      }

      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
        isEnded: false
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime, onEnd]);

  const formatNumber = (num: number) => num.toString().padStart(2, '0');

  if (timeLeft.isEnded) {
    return <div className="bg-red-100 text-red-600 px-4 py-2 rounded-lg text-center font-semibold">⏰ 竞价已结束</div>;
  }

  return (
    <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-3 text-white text-center">
      <div className="text-sm opacity-90">剩余时间</div>
      <div className="flex justify-center gap-2 text-xl font-bold">
        {timeLeft.days > 0 && <span>{timeLeft.days}天</span>}
        <span>{formatNumber(timeLeft.hours)}:{formatNumber(timeLeft.minutes)}:{formatNumber(timeLeft.seconds)}</span>
      </div>
    </div>
  );
}