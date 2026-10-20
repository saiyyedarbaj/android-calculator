import { AngleMode } from '../types/calculator';

/**
 * Android Calculator Evaluation Engine
 * Handles expression parsing, operator precedence, precision handling, and error states.
 */

// Math constants
export const PI = Math.PI;
export const E = Math.E;

// Helper to format numbers with commas (1,234.56) without affecting operators
export function formatExpressionDisplay(expr: string, useSeparators = true): string {
  if (!useSeparators) return expr;

  // Regex to format contiguous numeric chunks with commas
  return expr.replace(/\b\d+(\.\d+)?\b/g, (match) => {
    const parts = match.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
  });
}

// Clean floating point errors (e.g. 0.1 + 0.2 => 0.3)
export function sanitizeNumber(num: number): string {
  if (isNaN(num)) return 'Error';
  if (!isFinite(num)) {
    if (num > 0) return 'Infinity';
    return '-Infinity';
  }

  // Check if it's virtually an integer
  const rounded = Math.round(num * 1e12) / 1e12;
  if (Math.abs(rounded - Math.round(rounded)) < 1e-11) {
    return Math.round(rounded).toString();
  }

  // Format to reasonable precision
  let str = num.toPrecision(12);
  // Parse back to float to remove scientific notation if within standard range
  if (Math.abs(num) < 1e14 && Math.abs(num) > 1e-6) {
    str = parseFloat(str).toString();
  } else {
    str = num.toString();
  }

  // Trim trailing decimal zeros if any
  if (str.includes('.') && !str.includes('e')) {
    str = str.replace(/\.?0+$/, '');
  }

  return str;
}

// Factorial helper
function factorial(n: number): number {
  if (n < 0 || !Number.isInteger(n)) return NaN;
  if (n > 170) return Infinity; // Overflow for JS Number
  let res = 1;
  for (let i = 2; i <= n; i++) res *= i;
  return res;
}

/**
 * Prepares the human expression (with ÷, ×, −, √, π, e, sin, etc.) into an evaluable mathematical form.
 */
function prepareExpression(expr: string, angleMode: AngleMode): string {
  let prepared = expr
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/−/g, '-')
    .replace(/π/g, `(${Math.PI})`)
    .replace(/\be\b/g, `(${Math.E})`);

  // Handle implicit multiplication: e.g. 2(3) => 2*(3), (2)(3) => (2)*(3), 2π => 2*π, 5√4 => 5*√4
  prepared = prepared.replace(/(\d)\(/g, '$1*(');
  prepared = prepared.replace(/\)(\d)/g, ')*$1');
  prepared = prepared.replace(/\)\(/g, ')*(');
  prepared = prepared.replace(/(\d)(sin|cos|tan|ln|log|√)/g, '$1*$2');
  prepared = prepared.replace(/\)(sin|cos|tan|ln|log|√)/g, ')*$1');

  // Handle square root: √(x) or √x
  prepared = prepared.replace(/√\(/g, 'Math.sqrt(');
  prepared = prepared.replace(/√(\d+(\.\d+)?)/g, 'Math.sqrt($1)');

  // Handle percentages: e.g. 50% => (50/100) or A + B% => A + (A * B / 100)
  // For basic calculation, X% is (X/100)
  prepared = prepared.replace(/(\d+(\.\d+)?)%/g, '($1/100)');

  // Handle logarithms
  prepared = prepared.replace(/ln\(/g, 'Math.log(');
  prepared = prepared.replace(/log\(/g, 'Math.log10(');

  // Handle powers: a^b => Math.pow(a, b)
  // Simple regex conversion for base^exp
  while (prepared.includes('^')) {
    prepared = prepared.replace(
      /(\(?[0-9a-zA-Z_.]+\)?)\^(\(?[0-9a-zA-Z_.]+\)?)/,
      'Math.pow($1,$2)'
    );
  }

  // Handle trig functions according to DEG / RAD mode
  const angleMultiplier = angleMode === 'DEG' ? `*(${Math.PI}/180)` : '';
  prepared = prepared.replace(/sin\(([^)]+)\)/g, `Math.sin(($1)${angleMultiplier})`);
  prepared = prepared.replace(/cos\(([^)]+)\)/g, `Math.cos(($1)${angleMultiplier})`);
  prepared = prepared.replace(/tan\(([^)]+)\)/g, `Math.tan(($1)${angleMultiplier})`);

  return prepared;
}

/**
 * Safely evaluates an arithmetic expression using Function constructor with whitelist
 */
export function evaluateExpression(
  expr: string,
  angleMode: AngleMode = 'DEG'
): { success: boolean; result?: string; error?: string } {
  if (!expr || expr.trim() === '') {
    return { success: true, result: '0' };
  }

  const clean = expr.trim();

  // Check for division by zero upfront
  if (/\/0(?![.\d])|÷0(?![.\d])/.test(clean)) {
    return { success: false, error: "Can't divide by 0" };
  }

  // Handle trailing factorial
  if (clean.endsWith('!')) {
    const numPart = clean.slice(0, -1);
    const evalBase = evaluateExpression(numPart, angleMode);
    if (evalBase.success && evalBase.result) {
      const val = parseFloat(evalBase.result);
      if (val < 0 || !Number.isInteger(val)) {
        return { success: false, error: 'Invalid input' };
      }
      const fact = factorial(val);
      return { success: true, result: sanitizeNumber(fact) };
    }
  }

  try {
    // Balance open parentheses if user didn't close them yet
    let balanced = clean;
    const openParens = (balanced.match(/\(/g) || []).length;
    const closeParens = (balanced.match(/\)/g) || []).length;
    if (openParens > closeParens) {
      balanced += ')'.repeat(openParens - closeParens);
    }

    const prepared = prepareExpression(balanced, angleMode);

    // Security check: ensure only Math, numbers, parentheses, and arithmetic operators exist
    const sanitized = prepared.replace(
      /Math\.(sin|cos|tan|log|log10|sqrt|pow|PI|E)|[0-9+\-*/()., ]/g,
      ''
    );
    if (sanitized.length > 0) {
      return { success: false, error: 'Invalid expression' };
    }

    // Evaluate in safe scope
    // eslint-disable-next-line @typescript-eslint/no-implied-eval
    const evaluated = new Function(`"use strict"; return (${prepared});`)();

    if (evaluated === Infinity || evaluated === -Infinity) {
      return { success: false, error: "Can't divide by 0" };
    }

    if (typeof evaluated !== 'number' || isNaN(evaluated)) {
      return { success: false, error: 'Invalid format' };
    }

    return {
      success: true,
      result: sanitizeNumber(evaluated),
    };
  } catch {
    return { success: false, error: 'Error' };
  }
}

/**
 * Evaluates live preview while the user is still typing.
 * Silently ignores incomplete syntax (e.g. "12 + ").
 */
export function getLivePreview(expr: string, angleMode: AngleMode = 'DEG'): string | null {
  if (!expr || expr.trim() === '') return null;

  let candidate = expr.trim();

  // Strip trailing operators or dots for preview
  candidate = candidate.replace(/[+\−\-×*÷/.,^]+$/, '').trim();
  if (!candidate) return null;

  // Don't show preview if it's just a raw single number with no operations
  if (/^-?\d+(\.\d+)?$/.test(candidate)) {
    return null;
  }

  const res = evaluateExpression(candidate, angleMode);
  if (res.success && res.result && res.result !== candidate) {
    return res.result;
  }

  return null;
}

/**
 * Handles negation (±) toggle on the current active number
 */
export function toggleNegation(expr: string): string {
  if (!expr || expr === '0') return '0';

  // Find the last number token in expression
  const match = expr.match(/(-?\d+(\.\d+)?|\(-?\d+(\.\d+)?\))$/);
  if (!match) return expr;

  const target = match[0];
  const prefix = expr.slice(0, expr.length - target.length);

  if (target.startsWith('(-') && target.endsWith(')')) {
    // Remove negative wrap: (-5) -> 5
    const inner = target.slice(2, -1);
    return prefix + inner;
  } else if (target.startsWith('-')) {
    // Remove negative: -5 -> 5
    return prefix + target.slice(1);
  } else {
    // Add negative wrap: 5 -> (-5)
    return `${prefix}(-${target})`;
  }
}

/**
 * Intelligent backspace handling
 */
export function handleBackspace(expr: string): string {
  if (!expr || expr.length <= 1) return '';

  // Check for multi-character function tokens at the end
  const funcs = ['sin(', 'cos(', 'tan(', 'ln(', 'log(', '√('];
  for (const fn of funcs) {
    if (expr.endsWith(fn)) {
      return expr.slice(0, -fn.length);
    }
  }

  // Otherwise remove single character
  return expr.slice(0, -1);
}
