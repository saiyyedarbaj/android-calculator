import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { ThemeMode } from '../types/calculator';

interface KeypadProps {
  onDigit: (digit: string) => void;
  onOperator: (op: string) => void;
  onClear: () => void;
  onBackspace: () => void;
  onEquals: () => void;
  onParentheses: () => void;
  onPercent: () => void;
  onDecimal: () => void;
  onNegate: () => void;
  onScientificFunc: (func: string) => void;
  hasInput: boolean;
  activeKeyId: string | null;
  theme: ThemeMode;
}

export const Keypad: React.FC<KeypadProps> = ({
  onDigit,
  onOperator,
  onClear,
  onEquals,
  onParentheses,
  onPercent,
  onDecimal,
  onNegate,
  onScientificFunc,
  hasInput,
  activeKeyId,
  theme,
}) => {
  const [showScientific, setShowScientific] = useState<boolean>(false);
  const [isInverse, setIsInverse] = useState<boolean>(false);

  const isLight = theme === 'light';
  const isAmoled = theme === 'amoled';

  // Base key styling with Android touch ripple and scaling
  const baseButtonClass =
    'android-ripple flex items-center justify-center font-medium transition-all duration-150 active:scale-90 select-none cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400';

  // Number key style
  const numberKeyClass = isLight
    ? 'bg-neutral-100 hover:bg-neutral-200 text-neutral-900 shadow-sm'
    : isAmoled
    ? 'bg-neutral-900 hover:bg-neutral-800 text-neutral-100 border border-neutral-850'
    : 'bg-neutral-800/90 hover:bg-neutral-700/90 text-neutral-150';

  // Function/Utility key style (AC, (), %)
  const utilityKeyClass = isLight
    ? 'bg-neutral-200 hover:bg-neutral-300 text-neutral-800'
    : 'bg-neutral-750/70 hover:bg-neutral-700 text-neutral-200';

  // Operator key style (÷, ×, −, +)
  const operatorKeyClass = isLight
    ? 'bg-sky-100 hover:bg-sky-200 text-sky-800 font-semibold'
    : 'bg-sky-950/60 hover:bg-sky-900/60 text-sky-300 border border-sky-800/30 font-semibold';

  // Equals key style (High focal point)
  const equalsKeyClass = isLight
    ? 'bg-sky-600 hover:bg-sky-500 text-white font-bold shadow-md shadow-sky-600/20'
    : 'bg-sky-500 hover:bg-sky-400 text-neutral-950 font-bold shadow-md shadow-sky-500/20';

  // Scientific key style
  const sciKeyClass = isLight
    ? 'bg-neutral-150 hover:bg-neutral-200 text-neutral-700 text-xs font-semibold py-2.5 rounded-2xl'
    : 'bg-neutral-850 hover:bg-neutral-800 text-neutral-300 text-xs font-semibold py-2.5 rounded-2xl border border-neutral-800';

  return (
    <div className="w-full flex flex-col gap-2.5 px-4 pb-6 select-none">
      {/* Scientific Toggle Bar (Android expandable drawer handle) */}
      <div className="flex items-center justify-between px-1">
        <button
          onClick={() => setShowScientific(!showScientific)}
          aria-expanded={showScientific}
          aria-label={showScientific ? 'Hide scientific functions' : 'Show scientific functions'}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            isLight
              ? 'text-neutral-600 hover:bg-neutral-200'
              : 'text-neutral-400 hover:bg-neutral-800'
          }`}
        >
          <span>{showScientific ? 'Basic' : 'Scientific'}</span>
          {showScientific ? (
            <ChevronUp className="w-3.5 h-3.5" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5" />
          )}
        </button>

        {showScientific && (
          <button
            onClick={() => setIsInverse(!isInverse)}
            className={`text-xs px-2.5 py-1 rounded-full font-medium transition-colors ${
              isInverse
                ? 'bg-sky-500 text-neutral-950 font-semibold'
                : isLight
                ? 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300'
                : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
            }`}
          >
            INV
          </button>
        )}
      </div>

      {/* Expandable Scientific Grid */}
      {showScientific && (
        <div className="grid grid-cols-4 gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <button
            onClick={() => onScientificFunc(isInverse ? 'asin(' : 'sin(')}
            className={`${baseButtonClass} ${sciKeyClass}`}
          >
            {isInverse ? 'sin⁻¹' : 'sin'}
          </button>
          <button
            onClick={() => onScientificFunc(isInverse ? 'acos(' : 'cos(')}
            className={`${baseButtonClass} ${sciKeyClass}`}
          >
            {isInverse ? 'cos⁻¹' : 'cos'}
          </button>
          <button
            onClick={() => onScientificFunc(isInverse ? 'atan(' : 'tan(')}
            className={`${baseButtonClass} ${sciKeyClass}`}
          >
            {isInverse ? 'tan⁻¹' : 'tan'}
          </button>
          <button
            onClick={() => onScientificFunc('ln(')}
            className={`${baseButtonClass} ${sciKeyClass}`}
          >
            ln
          </button>

          <button
            onClick={() => onScientificFunc('log(')}
            className={`${baseButtonClass} ${sciKeyClass}`}
          >
            log
          </button>
          <button
            onClick={() => onScientificFunc('√(')}
            className={`${baseButtonClass} ${sciKeyClass}`}
          >
            √
          </button>
          <button
            onClick={() => onScientificFunc('π')}
            className={`${baseButtonClass} ${sciKeyClass}`}
          >
            π
          </button>
          <button
            onClick={() => onScientificFunc('e')}
            className={`${baseButtonClass} ${sciKeyClass}`}
          >
            e
          </button>

          <button
            onClick={() => onOperator('^')}
            className={`${baseButtonClass} ${sciKeyClass}`}
          >
            ^
          </button>
          <button
            onClick={() => onScientificFunc('!')}
            className={`${baseButtonClass} ${sciKeyClass}`}
          >
            !
          </button>
          <button
            onClick={() => onScientificFunc('(')}
            className={`${baseButtonClass} ${sciKeyClass}`}
          >
            (
          </button>
          <button
            onClick={() => onScientificFunc(')')}
            className={`${baseButtonClass} ${sciKeyClass}`}
          >
            )
          </button>
        </div>
      )}

      {/* Main 4x5 Keypad Grid */}
      <div className="grid grid-cols-4 gap-2.5 sm:gap-3">
        {/* Row 1 */}
        <button
          onClick={onClear}
          id="key-clear"
          className={`${baseButtonClass} ${utilityKeyClass} h-15 sm:h-16 rounded-full text-base sm:text-lg font-semibold ${
            activeKeyId === 'Escape' || activeKeyId === 'c' ? 'ring-2 ring-sky-400 scale-95' : ''
          }`}
          aria-label={hasInput ? 'Clear input' : 'All clear'}
        >
          {hasInput ? 'C' : 'AC'}
        </button>

        <button
          onClick={onParentheses}
          id="key-parentheses"
          className={`${baseButtonClass} ${utilityKeyClass} h-15 sm:h-16 rounded-full text-base sm:text-lg font-medium ${
            activeKeyId === '(' || activeKeyId === ')' ? 'ring-2 ring-sky-400 scale-95' : ''
          }`}
          aria-label="Parentheses"
        >
          ( )
        </button>

        <button
          onClick={onPercent}
          id="key-percent"
          className={`${baseButtonClass} ${utilityKeyClass} h-15 sm:h-16 rounded-full text-base sm:text-lg font-medium ${
            activeKeyId === '%' ? 'ring-2 ring-sky-400 scale-95' : ''
          }`}
          aria-label="Percent"
        >
          %
        </button>

        <button
          onClick={() => onOperator('÷')}
          id="key-divide"
          className={`${baseButtonClass} ${operatorKeyClass} h-15 sm:h-16 rounded-full text-xl sm:text-2xl ${
            activeKeyId === '/' ? 'ring-2 ring-sky-400 scale-95' : ''
          }`}
          aria-label="Divide"
        >
          ÷
        </button>

        {/* Row 2 */}
        <button
          onClick={() => onDigit('7')}
          id="key-7"
          className={`${baseButtonClass} ${numberKeyClass} h-15 sm:h-16 rounded-full text-xl sm:text-2xl ${
            activeKeyId === '7' ? 'ring-2 ring-sky-400 scale-95' : ''
          }`}
          aria-label="Seven"
        >
          7
        </button>

        <button
          onClick={() => onDigit('8')}
          id="key-8"
          className={`${baseButtonClass} ${numberKeyClass} h-15 sm:h-16 rounded-full text-xl sm:text-2xl ${
            activeKeyId === '8' ? 'ring-2 ring-sky-400 scale-95' : ''
          }`}
          aria-label="Eight"
        >
          8
        </button>

        <button
          onClick={() => onDigit('9')}
          id="key-9"
          className={`${baseButtonClass} ${numberKeyClass} h-15 sm:h-16 rounded-full text-xl sm:text-2xl ${
            activeKeyId === '9' ? 'ring-2 ring-sky-400 scale-95' : ''
          }`}
          aria-label="Nine"
        >
          9
        </button>

        <button
          onClick={() => onOperator('×')}
          id="key-multiply"
          className={`${baseButtonClass} ${operatorKeyClass} h-15 sm:h-16 rounded-full text-xl sm:text-2xl ${
            activeKeyId === '*' || activeKeyId === 'x' ? 'ring-2 ring-sky-400 scale-95' : ''
          }`}
          aria-label="Multiply"
        >
          ×
        </button>

        {/* Row 3 */}
        <button
          onClick={() => onDigit('4')}
          id="key-4"
          className={`${baseButtonClass} ${numberKeyClass} h-15 sm:h-16 rounded-full text-xl sm:text-2xl ${
            activeKeyId === '4' ? 'ring-2 ring-sky-400 scale-95' : ''
          }`}
          aria-label="Four"
        >
          4
        </button>

        <button
          onClick={() => onDigit('5')}
          id="key-5"
          className={`${baseButtonClass} ${numberKeyClass} h-15 sm:h-16 rounded-full text-xl sm:text-2xl ${
            activeKeyId === '5' ? 'ring-2 ring-sky-400 scale-95' : ''
          }`}
          aria-label="Five"
        >
          5
        </button>

        <button
          onClick={() => onDigit('6')}
          id="key-6"
          className={`${baseButtonClass} ${numberKeyClass} h-15 sm:h-16 rounded-full text-xl sm:text-2xl ${
            activeKeyId === '6' ? 'ring-2 ring-sky-400 scale-95' : ''
          }`}
          aria-label="Six"
        >
          6
        </button>

        <button
          onClick={() => onOperator('−')}
          id="key-subtract"
          className={`${baseButtonClass} ${operatorKeyClass} h-15 sm:h-16 rounded-full text-xl sm:text-2xl ${
            activeKeyId === '-' ? 'ring-2 ring-sky-400 scale-95' : ''
          }`}
          aria-label="Subtract"
        >
          −
        </button>

        {/* Row 4 */}
        <button
          onClick={() => onDigit('1')}
          id="key-1"
          className={`${baseButtonClass} ${numberKeyClass} h-15 sm:h-16 rounded-full text-xl sm:text-2xl ${
            activeKeyId === '1' ? 'ring-2 ring-sky-400 scale-95' : ''
          }`}
          aria-label="One"
        >
          1
        </button>

        <button
          onClick={() => onDigit('2')}
          id="key-2"
          className={`${baseButtonClass} ${numberKeyClass} h-15 sm:h-16 rounded-full text-xl sm:text-2xl ${
            activeKeyId === '2' ? 'ring-2 ring-sky-400 scale-95' : ''
          }`}
          aria-label="Two"
        >
          2
        </button>

        <button
          onClick={() => onDigit('3')}
          id="key-3"
          className={`${baseButtonClass} ${numberKeyClass} h-15 sm:h-16 rounded-full text-xl sm:text-2xl ${
            activeKeyId === '3' ? 'ring-2 ring-sky-400 scale-95' : ''
          }`}
          aria-label="Three"
        >
          3
        </button>

        <button
          onClick={() => onOperator('+')}
          id="key-add"
          className={`${baseButtonClass} ${operatorKeyClass} h-15 sm:h-16 rounded-full text-xl sm:text-2xl ${
            activeKeyId === '+' ? 'ring-2 ring-sky-400 scale-95' : ''
          }`}
          aria-label="Add"
        >
          +
        </button>

        {/* Row 5 */}
        <button
          onClick={onNegate}
          id="key-negate"
          className={`${baseButtonClass} ${numberKeyClass} h-15 sm:h-16 rounded-full text-lg sm:text-xl font-medium`}
          aria-label="Toggle positive or negative"
        >
          ±
        </button>

        <button
          onClick={() => onDigit('0')}
          id="key-0"
          className={`${baseButtonClass} ${numberKeyClass} h-15 sm:h-16 rounded-full text-xl sm:text-2xl ${
            activeKeyId === '0' ? 'ring-2 ring-sky-400 scale-95' : ''
          }`}
          aria-label="Zero"
        >
          0
        </button>

        <button
          onClick={onDecimal}
          id="key-decimal"
          className={`${baseButtonClass} ${numberKeyClass} h-15 sm:h-16 rounded-full text-2xl font-bold ${
            activeKeyId === '.' ? 'ring-2 ring-sky-400 scale-95' : ''
          }`}
          aria-label="Decimal point"
        >
          .
        </button>

        <button
          onClick={onEquals}
          id="key-equals"
          className={`${baseButtonClass} ${equalsKeyClass} h-15 sm:h-16 rounded-full text-2xl ${
            activeKeyId === 'Enter' || activeKeyId === '=' ? 'ring-2 ring-sky-300 scale-95' : ''
          }`}
          aria-label="Calculate equals"
        >
          =
        </button>
      </div>
    </div>
  );
};
