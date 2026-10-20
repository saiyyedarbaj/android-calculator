import React, { useRef, useEffect, useState } from 'react';
import { History, Settings, Copy, Check, Delete } from 'lucide-react';
import { AngleMode, ThemeMode } from '../types/calculator';
import { formatExpressionDisplay } from '../utils/calculatorLogic';

interface DisplayProps {
  expression: string;
  resultPreview: string | null;
  mainDisplay: string;
  error: string | null;
  angleMode: AngleMode;
  theme: ThemeMode;
  onToggleAngleMode: () => void;
  onOpenHistory: () => void;
  onOpenSettings: () => void;
  onBackspace: () => void;
  useSeparators: boolean;
}

export const Display: React.FC<DisplayProps> = ({
  expression,
  resultPreview,
  mainDisplay,
  error,
  angleMode,
  theme,
  onToggleAngleMode,
  onOpenHistory,
  onOpenSettings,
  onBackspace,
  useSeparators,
}) => {
  const [copied, setCopied] = useState(false);
  const exprScrollRef = useRef<HTMLDivElement>(null);

  // Auto scroll expression container to right when modified
  useEffect(() => {
    if (exprScrollRef.current) {
      exprScrollRef.current.scrollLeft = exprScrollRef.current.scrollWidth;
    }
  }, [expression, mainDisplay]);

  const handleCopy = async () => {
    const textToCopy = error || mainDisplay || expression || '0';
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Ignore clipboard write errors
    }
  };

  // Determine dynamic font size for main display text
  const textLength = (error || mainDisplay).length;
  let fontSizeClass = 'text-5xl md:text-6xl';
  if (textLength > 15) {
    fontSizeClass = 'text-2xl md:text-3xl';
  } else if (textLength > 11) {
    fontSizeClass = 'text-3xl md:text-4xl';
  } else if (textLength > 8) {
    fontSizeClass = 'text-4xl md:text-5xl';
  }

  const isLight = theme === 'light';

  const formattedExpr = formatExpressionDisplay(expression, useSeparators);
  const formattedMain = error ? error : formatExpressionDisplay(mainDisplay, useSeparators);
  const formattedPreview = resultPreview ? formatExpressionDisplay(resultPreview, useSeparators) : null;

  return (
    <div className="flex flex-col justify-between px-5 pt-1 pb-3 flex-1 select-none min-h-[220px]">
      {/* Top Utility Bar */}
      <div className="flex items-center justify-between h-10 mb-2">
        {/* Angle mode toggle chip (DEG / RAD) */}
        <button
          onClick={onToggleAngleMode}
          aria-label={`Toggle angle mode, current: ${angleMode}`}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wider transition-colors ${
            isLight
              ? 'bg-neutral-200/80 text-neutral-800 hover:bg-neutral-300'
              : 'bg-neutral-800/80 text-neutral-300 hover:bg-neutral-700 hover:text-white'
          }`}
        >
          <span>{angleMode}</span>
          <span className="text-[10px] opacity-60">⇄</span>
        </button>

        {/* Action icons: Copy, History, Settings */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleCopy}
            title="Copy value"
            aria-label="Copy to clipboard"
            className={`p-2 rounded-full transition-colors flex items-center justify-center relative ${
              isLight
                ? 'text-neutral-600 hover:bg-neutral-200 hover:text-neutral-900'
                : 'text-neutral-400 hover:bg-neutral-800 hover:text-neutral-100'
            }`}
          >
            {copied ? (
              <Check className="w-4 h-4 text-emerald-500 animate-in zoom-in-50" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
            {copied && (
              <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] px-2 py-0.5 rounded bg-emerald-700 text-white whitespace-nowrap shadow-sm pointer-events-none">
                Copied
              </span>
            )}
          </button>

          <button
            onClick={onOpenHistory}
            title="Calculation History"
            aria-label="Open calculation history"
            className={`p-2 rounded-full transition-colors ${
              isLight
                ? 'text-neutral-600 hover:bg-neutral-200 hover:text-neutral-900'
                : 'text-neutral-400 hover:bg-neutral-800 hover:text-neutral-100'
            }`}
          >
            <History className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenSettings}
            title="Settings & Info"
            aria-label="Open calculator settings"
            className={`p-2 rounded-full transition-colors ${
              isLight
                ? 'text-neutral-600 hover:bg-neutral-200 hover:text-neutral-900'
                : 'text-neutral-400 hover:bg-neutral-800 hover:text-neutral-100'
            }`}
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Expression Area (Scrollable line of operation) */}
      <div className="flex flex-col items-end justify-end mt-auto space-y-1">
        <div
          ref={exprScrollRef}
          className={`w-full overflow-x-auto no-scrollbar text-right font-normal transition-colors whitespace-nowrap tracking-wide min-h-[26px] ${
            isLight ? 'text-neutral-500' : 'text-neutral-400'
          }`}
          style={{ scrollBehavior: 'smooth' }}
        >
          {formattedExpr || '\u00A0'}
        </div>

        {/* Live preview line (if expression is actively being computed before equals) */}
        <div className="h-6 flex items-center justify-end w-full overflow-hidden">
          {formattedPreview && !error && (
            <span
              className={`text-sm md:text-base font-medium tracking-tight animate-in fade-in transition-all ${
                isLight ? 'text-neutral-400' : 'text-neutral-500'
              }`}
            >
              = {formattedPreview}
            </span>
          )}
        </div>

        {/* Primary Main Display Text with Backspace affordance */}
        <div className="w-full flex items-center justify-between gap-2 mt-1">
          {/* Quick Backspace button when there is text to delete */}
          <button
            onClick={onBackspace}
            aria-label="Backspace"
            disabled={!expression && !mainDisplay}
            className={`p-2 rounded-full transition-opacity disabled:opacity-0 ${
              isLight
                ? 'text-neutral-600 hover:bg-neutral-200 active:scale-95'
                : 'text-neutral-400 hover:bg-neutral-800 active:scale-95'
            }`}
          >
            <Delete className="w-5 h-5" />
          </button>

          <div
            className={`font-normal tracking-tight text-right flex-1 overflow-x-auto no-scrollbar transition-all font-mono tabular-nums ${fontSizeClass} ${
              error
                ? 'text-rose-500 font-medium'
                : isLight
                ? 'text-neutral-900'
                : 'text-neutral-100'
            }`}
          >
            {formattedMain}
          </div>
        </div>
      </div>
    </div>
  );
};
