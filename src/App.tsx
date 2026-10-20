import React, { useState, useEffect, useCallback } from 'react';
import { AndroidFrame } from './components/AndroidFrame';
import { Display } from './components/Display';
import { Keypad } from './components/Keypad';
import { HistoryDrawer } from './components/HistoryDrawer';
import { SettingsModal } from './components/SettingsModal';
import { CalculatorSettings, HistoryItem, ThemeMode } from './types/calculator';
import {
  evaluateExpression,
  getLivePreview,
  toggleNegation,
  handleBackspace,
} from './utils/calculatorLogic';
import { playKeySound, triggerHaptic } from './utils/soundHaptics';

const SETTINGS_KEY = 'android_calc_settings_v1';
const HISTORY_KEY = 'android_calc_history_v1';

const DEFAULT_SETTINGS: CalculatorSettings = {
  soundEnabled: true,
  hapticsEnabled: true,
  angleMode: 'DEG',
  useThousandSeparators: true,
  theme: 'dark',
};

export default function App() {
  // Settings State
  const [settings, setSettings] = useState<CalculatorSettings>(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_KEY);
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  // History State
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem(HISTORY_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Calculator Engine State
  const [expression, setExpression] = useState<string>('');
  const [mainDisplay, setMainDisplay] = useState<string>('0');
  const [resultPreview, setResultPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isNewCalculation, setIsNewCalculation] = useState<boolean>(false);
  const [activeKeyId, setActiveKeyId] = useState<string | null>(null);

  // Modals
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  // Save settings to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch {
      // Ignore localStorage quotas
    }
  }, [settings]);

  // Save history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    } catch {
      // Ignore localStorage quotas
    }
  }, [history]);

  // Apply theme to document element
  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === 'light') {
      root.classList.remove('dark');
    } else {
      root.classList.add('dark');
    }
  }, [settings.theme]);

  // Audio/Haptic trigger helper
  const feedback = useCallback(
    (type: 'number' | 'operator' | 'equals' | 'delete') => {
      if (settings.soundEnabled) playKeySound(type);
      if (settings.hapticsEnabled) triggerHaptic(type === 'equals' ? 'medium' : 'light');
    },
    [settings.soundEnabled, settings.hapticsEnabled]
  );

  // Flash key highlight
  const flashKey = useCallback((keyId: string) => {
    setActiveKeyId(keyId);
    setTimeout(() => {
      setActiveKeyId(null);
    }, 150);
  }, []);

  // Update live preview when expression changes
  const updateExpressionAndPreview = useCallback(
    (newExpr: string) => {
      setExpression(newExpr);
      setError(null);
      if (newExpr === '') {
        setMainDisplay('0');
        setResultPreview(null);
        return;
      }
      setMainDisplay(newExpr);
      const preview = getLivePreview(newExpr, settings.angleMode);
      setResultPreview(preview);
    },
    [settings.angleMode]
  );

  // Handler: Digits (0 - 9)
  const handleDigit = useCallback(
    (digit: string) => {
      feedback('number');
      flashKey(digit);

      if (error) {
        setError(null);
        updateExpressionAndPreview(digit);
        setIsNewCalculation(false);
        return;
      }

      if (isNewCalculation) {
        updateExpressionAndPreview(digit);
        setIsNewCalculation(false);
        return;
      }

      // Avoid multiple leading zeros like 000
      if (expression === '0') {
        updateExpressionAndPreview(digit);
        return;
      }

      updateExpressionAndPreview(expression + digit);
    },
    [error, isNewCalculation, expression, feedback, flashKey, updateExpressionAndPreview]
  );

  // Handler: Decimal point (.)
  const handleDecimal = useCallback(() => {
    feedback('number');
    flashKey('.');

    if (error || isNewCalculation) {
      setError(null);
      updateExpressionAndPreview('0.');
      setIsNewCalculation(false);
      return;
    }

    if (!expression || expression === '') {
      updateExpressionAndPreview('0.');
      return;
    }

    // Check if the current trailing number already contains a decimal
    const parts = expression.split(/[\s+\−\-×*÷/()^]+/);
    const currentNum = parts[parts.length - 1];
    if (currentNum && currentNum.includes('.')) {
      return; // already has decimal
    }

    // If last char is an operator, add 0.
    if (/[\s+−×÷^]$/.test(expression)) {
      updateExpressionAndPreview(`${expression} 0.`);
    } else {
      updateExpressionAndPreview(`${expression}.`);
    }
  }, [error, isNewCalculation, expression, feedback, flashKey, updateExpressionAndPreview]);

  // Handler: Operators (÷, ×, −, +, ^)
  const handleOperator = useCallback(
    (op: string) => {
      feedback('operator');
      flashKey(op === '÷' ? '/' : op === '×' ? '*' : op === '−' ? '-' : op);

      if (error) {
        setError(null);
      }

      // If user just got a result and taps an operator, chain calculation from that result!
      let baseExpr = expression;
      if (isNewCalculation && mainDisplay && !error) {
        baseExpr = mainDisplay;
        setIsNewCalculation(false);
      }

      if (!baseExpr || baseExpr === '') {
        if (op === '−') {
          updateExpressionAndPreview('−');
        }
        return;
      }

      // If expression ends with an existing operator, replace it!
      const trimmed = baseExpr.trimEnd();
      if (/[+−×÷^]$/.test(trimmed)) {
        const withoutOp = trimmed.slice(0, -1).trimEnd();
        updateExpressionAndPreview(`${withoutOp} ${op} `);
        return;
      }

      updateExpressionAndPreview(`${trimmed} ${op} `);
    },
    [error, isNewCalculation, mainDisplay, expression, feedback, flashKey, updateExpressionAndPreview]
  );

  // Handler: Equals (=)
  const handleEquals = useCallback(() => {
    feedback('equals');
    flashKey('=');

    if (!expression || expression.trim() === '') return;

    const evalResult = evaluateExpression(expression, settings.angleMode);

    if (evalResult.success && evalResult.result !== undefined) {
      const finalResult = evalResult.result;

      // Add to history
      const newHistoryItem: HistoryItem = {
        id: `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        expression: expression.trim(),
        result: finalResult,
        timestamp: Date.now(),
      };
      setHistory((prev) => [newHistoryItem, ...prev.slice(0, 49)]); // keep last 50

      setMainDisplay(finalResult);
      setResultPreview(null);
      setIsNewCalculation(true);
      setError(null);
    } else {
      setError(evalResult.error || 'Error');
      setResultPreview(null);
    }
  }, [expression, settings.angleMode, feedback, flashKey]);

  // Handler: Clear (AC / C)
  const handleClear = useCallback(() => {
    feedback('delete');
    flashKey('Escape');
    setExpression('');
    setMainDisplay('0');
    setResultPreview(null);
    setError(null);
    setIsNewCalculation(false);
  }, [feedback, flashKey]);

  // Handler: Backspace
  const handleBackspaceAction = useCallback(() => {
    feedback('delete');
    flashKey('Backspace');

    if (error) {
      setError(null);
      setMainDisplay(expression || '0');
      return;
    }

    if (isNewCalculation) {
      setExpression('');
      setMainDisplay('0');
      setIsNewCalculation(false);
      return;
    }

    const trimmed = expression.trimEnd();
    const newExpr = handleBackspace(trimmed);
    updateExpressionAndPreview(newExpr);
  }, [error, isNewCalculation, expression, feedback, flashKey, updateExpressionAndPreview]);

  // Handler: Parentheses ()
  const handleParentheses = useCallback(() => {
    feedback('operator');
    flashKey('(');

    if (error || isNewCalculation) {
      setError(null);
      updateExpressionAndPreview('(');
      setIsNewCalculation(false);
      return;
    }

    const openCount = (expression.match(/\(/g) || []).length;
    const closeCount = (expression.match(/\)/g) || []).length;
    const lastChar = expression.trim().slice(-1);

    // If more open parentheses than close, and last character is a digit or closing parenthesis, close it!
    if (openCount > closeCount && (/[\d)πe!]/.test(lastChar))) {
      updateExpressionAndPreview(`${expression})`);
    } else if (/[\d)πe!]/.test(lastChar)) {
      // Implicit multiplication: 5( -> 5 × (
      updateExpressionAndPreview(`${expression} × (`);
    } else {
      updateExpressionAndPreview(`${expression}(`);
    }
  }, [error, isNewCalculation, expression, feedback, flashKey, updateExpressionAndPreview]);

  // Handler: Percent (%)
  const handlePercent = useCallback(() => {
    feedback('operator');
    flashKey('%');

    if (!expression || /[\s+−×÷^(]$/.test(expression)) return;
    updateExpressionAndPreview(`${expression}%`);
  }, [expression, feedback, flashKey, updateExpressionAndPreview]);

  // Handler: Plus/Minus Negate (±)
  const handleNegate = useCallback(() => {
    feedback('number');
    const negated = toggleNegation(expression || mainDisplay);
    updateExpressionAndPreview(negated);
  }, [expression, mainDisplay, feedback, updateExpressionAndPreview]);

  // Handler: Scientific functions (sin, cos, tan, ln, log, √, π, e, !)
  const handleScientificFunc = useCallback(
    (func: string) => {
      feedback('operator');

      if (error || isNewCalculation) {
        setError(null);
        updateExpressionAndPreview(func);
        setIsNewCalculation(false);
        return;
      }

      // Check if constant (π, e) or function (sin(, log(, etc.)
      if (func === 'π' || func === 'e') {
        const lastChar = expression.trim().slice(-1);
        if (/\d|\)/.test(lastChar)) {
          updateExpressionAndPreview(`${expression} × ${func}`);
        } else {
          updateExpressionAndPreview(`${expression}${func}`);
        }
      } else if (func === '!') {
        if (/[\d)πe]/.test(expression.trim().slice(-1))) {
          updateExpressionAndPreview(`${expression}!`);
        }
      } else {
        // e.g. sin(
        const lastChar = expression.trim().slice(-1);
        if (/\d|\)/.test(lastChar)) {
          updateExpressionAndPreview(`${expression} × ${func}`);
        } else {
          updateExpressionAndPreview(`${expression}${func}`);
        }
      }
    },
    [error, isNewCalculation, expression, feedback, updateExpressionAndPreview]
  );

  // Toggle angle mode
  const handleToggleAngleMode = useCallback(() => {
    const newMode = settings.angleMode === 'DEG' ? 'RAD' : 'DEG';
    setSettings((prev) => ({ ...prev, angleMode: newMode }));
    if (expression) {
      const preview = getLivePreview(expression, newMode);
      setResultPreview(preview);
    }
  }, [settings.angleMode, expression]);

  // Global Keyboard event capture
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if focus is inside an input/textarea if any
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }

      const key = e.key;

      if (key >= '0' && key <= '9') {
        e.preventDefault();
        handleDigit(key);
      } else if (key === '.') {
        e.preventDefault();
        handleDecimal();
      } else if (key === '+') {
        e.preventDefault();
        handleOperator('+');
      } else if (key === '-') {
        e.preventDefault();
        handleOperator('−');
      } else if (key === '*' || key.toLowerCase() === 'x') {
        e.preventDefault();
        handleOperator('×');
      } else if (key === '/') {
        e.preventDefault();
        handleOperator('÷');
      } else if (key === '^') {
        e.preventDefault();
        handleOperator('^');
      } else if (key === '%') {
        e.preventDefault();
        handlePercent();
      } else if (key === '(' || key === ')') {
        e.preventDefault();
        handleParentheses();
      } else if (key === 'Enter' || key === '=') {
        e.preventDefault();
        handleEquals();
      } else if (key === 'Backspace') {
        e.preventDefault();
        handleBackspaceAction();
      } else if (key === 'Escape' || key.toLowerCase() === 'c') {
        e.preventDefault();
        handleClear();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    handleDigit,
    handleDecimal,
    handleOperator,
    handleEquals,
    handleBackspaceAction,
    handleClear,
    handleParentheses,
    handlePercent,
  ]);

  return (
    <AndroidFrame theme={settings.theme}>
      {/* Calculator Display Section */}
      <Display
        expression={expression}
        resultPreview={resultPreview}
        mainDisplay={mainDisplay}
        error={error}
        angleMode={settings.angleMode}
        theme={settings.theme}
        onToggleAngleMode={handleToggleAngleMode}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onBackspace={handleBackspaceAction}
        useSeparators={settings.useThousandSeparators}
      />

      {/* Calculator Keypad Section */}
      <Keypad
        onDigit={handleDigit}
        onOperator={handleOperator}
        onClear={handleClear}
        onBackspace={handleBackspaceAction}
        onEquals={handleEquals}
        onParentheses={handleParentheses}
        onPercent={handlePercent}
        onDecimal={handleDecimal}
        onNegate={handleNegate}
        onScientificFunc={handleScientificFunc}
        hasInput={Boolean(expression || error)}
        activeKeyId={activeKeyId}
        theme={settings.theme}
      />

      {/* History Drawer Modal */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onSelectExpression={(expr) => {
          updateExpressionAndPreview(expr);
          setIsNewCalculation(false);
        }}
        onSelectResult={(result) => {
          updateExpressionAndPreview(result);
          setIsNewCalculation(false);
        }}
        onClearHistory={() => setHistory([])}
        theme={settings.theme}
        useSeparators={settings.useThousandSeparators}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={(newSettings) =>
          setSettings((prev) => ({ ...prev, ...newSettings }))
        }
      />
    </AndroidFrame>
  );
}
