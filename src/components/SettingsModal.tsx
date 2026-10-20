import React from 'react';
import { X, Volume2, VolumeX, Smartphone, Hash, Moon, Sun, Monitor, Keyboard } from 'lucide-react';
import { CalculatorSettings, ThemeMode, AngleMode } from '../types/calculator';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: CalculatorSettings;
  onUpdateSettings: (newSettings: Partial<CalculatorSettings>) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
}) => {
  if (!isOpen) return null;

  const isLight = settings.theme === 'light';
  const isAmoled = settings.theme === 'amoled';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div
        className={`relative z-10 w-full max-w-sm rounded-3xl p-6 shadow-2xl transition-all duration-200 animate-in zoom-in-95 border ${
          isLight
            ? 'bg-neutral-50 text-neutral-900 border-neutral-200'
            : isAmoled
            ? 'bg-black text-neutral-100 border-neutral-850'
            : 'bg-neutral-900 text-neutral-100 border-neutral-800'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-200 dark:border-neutral-800 mb-4">
          <h2 className="text-lg font-semibold tracking-tight">Calculator Settings</h2>
          <button
            onClick={onClose}
            aria-label="Close settings"
            className="p-1.5 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Options list */}
        <div className="space-y-4 text-sm">
          {/* Sound toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {settings.soundEnabled ? (
                <Volume2 className="w-5 h-5 text-sky-500" />
              ) : (
                <VolumeX className="w-5 h-5 text-neutral-400" />
              )}
              <div>
                <p className="font-medium">Key Click Sounds</p>
                <p className="text-xs text-neutral-500">Audio feedback when pressing buttons</p>
              </div>
            </div>
            <button
              onClick={() => onUpdateSettings({ soundEnabled: !settings.soundEnabled })}
              aria-label="Toggle key click sounds"
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                settings.soundEnabled ? 'bg-sky-500' : 'bg-neutral-650'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform shadow-xs absolute top-0.5 left-0.5 ${
                  settings.soundEnabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Haptic vibration toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Smartphone className="w-5 h-5 text-sky-500" />
              <div>
                <p className="font-medium">Haptic Feedback</p>
                <p className="text-xs text-neutral-500">Vibrate on touch (supported devices)</p>
              </div>
            </div>
            <button
              onClick={() => onUpdateSettings({ hapticsEnabled: !settings.hapticsEnabled })}
              aria-label="Toggle haptic vibration"
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                settings.hapticsEnabled ? 'bg-sky-500' : 'bg-neutral-650'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform shadow-xs absolute top-0.5 left-0.5 ${
                  settings.hapticsEnabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Thousand separators toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Hash className="w-5 h-5 text-sky-500" />
              <div>
                <p className="font-medium">Thousands Separators</p>
                <p className="text-xs text-neutral-500">Format numbers with commas (1,234.5)</p>
              </div>
            </div>
            <button
              onClick={() =>
                onUpdateSettings({ useThousandSeparators: !settings.useThousandSeparators })
              }
              aria-label="Toggle thousands separators"
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                settings.useThousandSeparators ? 'bg-sky-500' : 'bg-neutral-650'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform shadow-xs absolute top-0.5 left-0.5 ${
                  settings.useThousandSeparators ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Angle mode */}
          <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800">
            <p className="font-medium mb-2">Trigonometry Angle Unit</p>
            <div className="grid grid-cols-2 gap-2">
              {(['DEG', 'RAD'] as AngleMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => onUpdateSettings({ angleMode: mode })}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all ${
                    settings.angleMode === mode
                      ? 'bg-sky-500 text-neutral-950 font-bold shadow-xs'
                      : isLight
                      ? 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300'
                      : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-750'
                  }`}
                >
                  {mode === 'DEG' ? 'Degrees (DEG)' : 'Radians (RAD)'}
                </button>
              ))}
            </div>
          </div>

          {/* Theme selection */}
          <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800">
            <p className="font-medium mb-2">Color Theme</p>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => onUpdateSettings({ theme: 'dark' })}
                className={`py-2 px-2 rounded-xl text-xs flex flex-col items-center gap-1.5 transition-all ${
                  settings.theme === 'dark'
                    ? 'bg-sky-500 text-neutral-950 font-bold'
                    : isLight
                    ? 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300'
                    : 'bg-neutral-800 text-neutral-300'
                }`}
              >
                <Moon className="w-4 h-4" />
                <span>Dark</span>
              </button>

              <button
                onClick={() => onUpdateSettings({ theme: 'light' })}
                className={`py-2 px-2 rounded-xl text-xs flex flex-col items-center gap-1.5 transition-all ${
                  settings.theme === 'light'
                    ? 'bg-sky-500 text-neutral-950 font-bold'
                    : isLight
                    ? 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300'
                    : 'bg-neutral-800 text-neutral-300'
                }`}
              >
                <Sun className="w-4 h-4" />
                <span>Light</span>
              </button>

              <button
                onClick={() => onUpdateSettings({ theme: 'amoled' })}
                className={`py-2 px-2 rounded-xl text-xs flex flex-col items-center gap-1.5 transition-all ${
                  settings.theme === 'amoled'
                    ? 'bg-sky-500 text-neutral-950 font-bold'
                    : isLight
                    ? 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300'
                    : 'bg-neutral-800 text-neutral-300'
                }`}
              >
                <Monitor className="w-4 h-4" />
                <span>AMOLED</span>
              </button>
            </div>
          </div>

          {/* Keyboard Shortcuts Hint */}
          <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center gap-1.5 text-xs text-neutral-400 mb-1.5 font-medium">
              <Keyboard className="w-3.5 h-3.5" />
              <span>Keyboard Controls</span>
            </div>
            <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[11px] text-neutral-500">
              <div><span className="font-mono text-neutral-400">0-9</span> : Digits</div>
              <div><span className="font-mono text-neutral-400">+ - * /</span> : Operators</div>
              <div><span className="font-mono text-neutral-400">Enter / =</span> : Calculate</div>
              <div><span className="font-mono text-neutral-400">Backspace</span> : Delete</div>
              <div><span className="font-mono text-neutral-400">Esc / C</span> : Clear All</div>
              <div><span className="font-mono text-neutral-400">% ( )</span> : Mod & Parens</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
