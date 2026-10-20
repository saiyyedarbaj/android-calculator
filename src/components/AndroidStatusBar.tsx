import React, { useState, useEffect } from 'react';
import { Wifi, Battery } from 'lucide-react';

interface AndroidStatusBarProps {
  isDarkMode?: boolean;
}

export const AndroidStatusBar: React.FC<AndroidStatusBarProps> = ({ isDarkMode = true }) => {
  const [currentTime, setCurrentTime] = useState<string>('9:41');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, '0');
      // Android format: 12-hour or 24-hour cleanly
      hours = hours % 12 || 12;
      setCurrentTime(`${hours}:${minutes}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className={`w-full px-6 pt-3 pb-2 flex items-center justify-between text-xs font-medium select-none tracking-tight transition-colors ${
        isDarkMode ? 'text-neutral-300' : 'text-neutral-700'
      }`}
    >
      {/* Time */}
      <span className="font-semibold tracking-normal text-[13px]">{currentTime}</span>

      {/* Center Camera Punch-hole spacing */}
      <div className="w-4 h-4 rounded-full bg-neutral-900 border border-neutral-800 shadow-inner flex items-center justify-center">
        <div className="w-1.5 h-1.5 rounded-full bg-neutral-950/90" />
      </div>

      {/* System status icons */}
      <div className="flex items-center gap-1.5">
        {/* Signal Bars SVG */}
        <svg
          className="w-3.5 h-3.5 fill-current opacity-90"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M2 22h20V2L2 22z" />
        </svg>

        <Wifi className="w-3.5 h-3.5 opacity-90" />

        <div className="flex items-center gap-0.5">
          <Battery className="w-4 h-4 opacity-90 fill-current" />
          <span className="text-[10px] tabular-nums font-semibold ml-0.5">98%</span>
        </div>
      </div>
    </div>
  );
};
