import React, { useState } from 'react';
import { Smartphone, Maximize2, Minimize2 } from 'lucide-react';
import { AndroidStatusBar } from './AndroidStatusBar';
import { ThemeMode } from '../types/calculator';

interface AndroidFrameProps {
  children: React.ReactNode;
  theme: ThemeMode;
}

export const AndroidFrame: React.FC<AndroidFrameProps> = ({ children, theme }) => {
  const [isPhoneFrame, setIsPhoneFrame] = useState<boolean>(true);

  const isLight = theme === 'light';
  const isAmoled = theme === 'amoled';

  return (
    <div
      className={`min-h-screen w-full flex flex-col items-center justify-center transition-colors duration-300 ${
        isLight
          ? 'bg-neutral-100 text-neutral-900'
          : isAmoled
          ? 'bg-neutral-950 text-neutral-100'
          : 'bg-neutral-950 text-neutral-100'
      }`}
    >
      {/* Desktop Viewport Toolbar (Hidden on mobile) */}
      <div className="hidden sm:flex items-center justify-between w-full max-w-4xl px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span className="text-xs font-medium tracking-wide uppercase text-neutral-400">
            ArbajS™ • Calculator
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPhoneFrame(!isPhoneFrame)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors border border-neutral-700/60"
            aria-label="Toggle phone frame or full view"
          >
            {isPhoneFrame ? (
              <>
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Expanded Mode</span>
              </>
            ) : (
              <>
                <Smartphone className="w-3.5 h-3.5" />
                <span>Phone Frame</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Container */}
      <main className="w-full flex-1 flex items-center justify-center sm:p-4">
        {isPhoneFrame ? (
          /* Phone Frame Container */
          <div className="relative w-full sm:w-[380px] md:w-[410px] sm:my-2">
            {/* Realistic Side Buttons (Desktop only) */}
            <div className="hidden sm:block absolute -right-[11px] top-28 w-[3px] h-12 bg-neutral-700 rounded-r-sm" />
            <div className="hidden sm:block absolute -right-[11px] top-44 w-[3px] h-20 bg-neutral-700 rounded-r-sm" />

            {/* Phone Chassis */}
            <div
              className={`w-full min-h-screen sm:min-h-[760px] sm:max-h-[860px] flex flex-col justify-between overflow-hidden transition-all duration-300 ${
                isLight
                  ? 'bg-neutral-50 text-neutral-900 sm:border-[9px] sm:border-neutral-300 sm:rounded-[52px] sm:shadow-2xl sm:shadow-neutral-400/20'
                  : isAmoled
                  ? 'bg-black text-neutral-100 sm:border-[9px] sm:border-neutral-900 sm:rounded-[52px] sm:shadow-2xl sm:shadow-black'
                  : 'bg-neutral-900 text-neutral-100 sm:border-[9px] sm:border-neutral-800 sm:rounded-[52px] sm:shadow-2xl sm:shadow-black/60'
              }`}
            >
              {/* Android System Status Bar */}
              <AndroidStatusBar isDarkMode={!isLight} />

              {/* Calculator Content */}
              <div className="flex-1 flex flex-col justify-between overflow-hidden">
                {children}
              </div>

              {/* Android Gesture Navigation Bar & Bottom Chassis Trademark Signature */}
              <div className="w-full pt-1 pb-3 flex flex-col items-center justify-center gap-1.5 select-none">
                <div
                  className={`w-32 h-1 rounded-full transition-colors ${
                    isLight ? 'bg-neutral-300' : 'bg-neutral-700'
                  }`}
                />
                <div
                  className={`text-[11px] font-medium tracking-tight flex items-center gap-1 transition-colors ${
                    isLight ? 'text-neutral-500' : 'text-neutral-400'
                  }`}
                >
                  <span className="font-semibold text-neutral-700 dark:text-neutral-200 tracking-wide">
                    ArbajS™
                  </span>
                  <span className="opacity-40">·</span>
                  <span>© By Arbaj Saiyyed</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Expanded / Tablet Mode */
          <div
            className={`w-full max-w-xl min-h-[700px] rounded-3xl p-4 flex flex-col justify-between shadow-2xl transition-all ${
              isLight
                ? 'bg-white text-neutral-900 border border-neutral-200'
                : isAmoled
                ? 'bg-black text-neutral-100 border border-neutral-850'
                : 'bg-neutral-900 text-neutral-100 border border-neutral-800'
            }`}
          >
            <div className="flex-1 flex flex-col justify-between">
              {children}
            </div>

            {/* Bottom Chassis Signature for Expanded Mode */}
            <div
              className={`w-full pt-3 mt-2 border-t flex items-center justify-center text-[11px] font-medium select-none gap-1 transition-colors ${
                isLight ? 'border-neutral-200 text-neutral-500' : 'border-neutral-800 text-neutral-400'
              }`}
            >
              <span className="font-semibold text-neutral-700 dark:text-neutral-200 tracking-wide">
                ArbajS™
              </span>
              <span className="opacity-40">·</span>
              <span>© By Arbaj Saiyyed</span>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
