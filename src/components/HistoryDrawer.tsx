import React from 'react';
import { X, Trash2, Clock, Copy, Check } from 'lucide-react';
import { HistoryItem, ThemeMode } from '../types/calculator';
import { formatExpressionDisplay } from '../utils/calculatorLogic';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  onSelectExpression: (expr: string) => void;
  onSelectResult: (result: string) => void;
  onClearHistory: () => void;
  theme: ThemeMode;
  useSeparators: boolean;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  history,
  onSelectExpression,
  onSelectResult,
  onClearHistory,
  theme,
  useSeparators,
}) => {
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  if (!isOpen) return null;

  const isLight = theme === 'light';
  const isAmoled = theme === 'amoled';

  const handleCopy = async (id: string, text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1500);
    } catch {
      // Ignore clipboard error
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      {/* Dimmed backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet Container */}
      <div
        className={`relative z-10 w-full max-h-[85%] rounded-t-3xl flex flex-col shadow-2xl transition-transform duration-300 animate-in slide-in-from-bottom border-t ${
          isLight
            ? 'bg-neutral-50 text-neutral-900 border-neutral-200'
            : isAmoled
            ? 'bg-black text-neutral-100 border-neutral-850'
            : 'bg-neutral-900 text-neutral-100 border-neutral-800'
        }`}
      >
        {/* Android drag handle affordance */}
        <div className="w-10 h-1.5 bg-neutral-500/40 rounded-full mx-auto my-3" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 pb-3 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-sky-500" />
            <h2 className="text-base font-semibold">Calculation History</h2>
            {history.length > 0 && (
              <span className="text-xs text-neutral-500 font-normal">
                ({history.length})
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {history.length > 0 && (
              <button
                onClick={onClearHistory}
                aria-label="Clear all history"
                className="flex items-center gap-1 text-xs font-medium text-rose-500 hover:text-rose-400 p-2 rounded-lg hover:bg-rose-500/10 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Clear</span>
              </button>
            )}

            <button
              onClick={onClose}
              aria-label="Close history"
              className="p-1.5 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* History List or Empty state */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[260px] max-h-[460px]">
          {history.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center py-12 text-center text-neutral-500">
              <div className="w-12 h-12 rounded-full bg-neutral-200/50 dark:bg-neutral-800/50 flex items-center justify-center mb-3">
                <Clock className="w-6 h-6 text-neutral-400" />
              </div>
              <p className="text-sm font-medium">No history yet</p>
              <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1 max-w-[200px]">
                Your calculations will appear here as you compute results.
              </p>
            </div>
          ) : (
            history.map((item) => (
              <div
                key={item.id}
                className={`p-3.5 rounded-2xl transition-all border group ${
                  isLight
                    ? 'bg-white border-neutral-200 hover:border-sky-300 shadow-xs'
                    : 'bg-neutral-850/60 border-neutral-800 hover:border-neutral-700'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 overflow-hidden">
                    {/* Click expression to restore */}
                    <button
                      onClick={() => {
                        onSelectExpression(item.expression);
                        onClose();
                      }}
                      title="Tap to reuse expression"
                      className="text-left w-full text-xs text-neutral-500 hover:text-sky-500 transition-colors truncate font-mono block"
                    >
                      {formatExpressionDisplay(item.expression, useSeparators)}
                    </button>

                    {/* Click result to use in current calculation */}
                    <button
                      onClick={() => {
                        onSelectResult(item.result);
                        onClose();
                      }}
                      title="Tap to insert result"
                      className="text-left w-full text-lg font-semibold tracking-tight text-neutral-900 dark:text-neutral-100 hover:text-sky-500 transition-colors font-mono tabular-nums mt-0.5 block truncate"
                    >
                      = {formatExpressionDisplay(item.result, useSeparators)}
                    </button>
                  </div>

                  <div className="flex items-center gap-1 self-center">
                    <button
                      onClick={(e) => handleCopy(item.id, item.result, e)}
                      title="Copy result"
                      aria-label="Copy result"
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-sky-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                    >
                      {copiedId === item.id ? (
                        <Check className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="mt-2 text-[10px] text-neutral-400 dark:text-neutral-500">
                  {new Date(item.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer tip */}
        <div className="p-3 text-center border-t border-neutral-200 dark:border-neutral-800 text-[11px] text-neutral-500">
          Tip: Tap any expression or result to load it into the display
        </div>
      </div>
    </div>
  );
};
