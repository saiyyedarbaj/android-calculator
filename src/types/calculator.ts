export type AngleMode = 'DEG' | 'RAD';

export type ThemeMode = 'dark' | 'light' | 'amoled';

export interface HistoryItem {
  id: string;
  expression: string;
  result: string;
  timestamp: number;
}

export interface CalculatorSettings {
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  angleMode: AngleMode;
  useThousandSeparators: boolean;
  theme: ThemeMode;
}

export type KeyActionType =
  | 'digit'
  | 'operator'
  | 'clear'
  | 'backspace'
  | 'equals'
  | 'parenthesis'
  | 'percent'
  | 'decimal'
  | 'negate'
  | 'scientific';

export interface KeyConfig {
  id: string;
  label: string;
  symbol?: string;
  actionType: KeyActionType;
  value?: string;
  ariaLabel: string;
  keyboardShortcuts?: string[];
  secondary?: boolean;
}
