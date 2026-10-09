import crypto from 'node:crypto';

export const PROBLEMS = [
  { latex: '\\int_0^{\\infty} \\frac{x^3}{e^x - 1}\\,dx', answer: Math.PI ** 4 / 15, hint: '\\frac{\\pi^4}{15}' },
  { latex: '\\int_0^{1} \\ln(x)\\,\\ln(1-x)\\,dx', answer: 2 - Math.PI ** 2 / 6, hint: '2 - \\frac{\\pi^2}{6}' },
  { latex: '\\int_0^{1} \\frac{x^4(1-x)^4}{1+x^2}\\,dx', answer: 22 / 7 - Math.PI, hint: '\\frac{22}{7} - \\pi' },
  { latex: '\\int_0^{1} x^{-x}\\,dx \\quad \\text{(to 4 decimal places)}', answer: 1.2912859970626636, hint: '\\sum_{n=1}^{\\infty} n^{-n} \\approx 1.29129' },
  { latex: '\\left.\\frac{d}{dx}\\left[x^{x^{x}}\\right]\\right|_{x=1}', answer: 1, hint: '1' },
  { latex: '\\left.\\frac{d^2}{dx^2}\\left[x^{x}\\right]\\right|_{x=1}', answer: 2, hint: '2' },
  { latex: '\\int_{-\\infty}^{\\infty} e^{-x^2}\\cos(2x)\\,dx', answer: Math.sqrt(Math.PI) / Math.E, hint: '\\frac{\\sqrt{\\pi}}{e}' },
  { latex: '\\int_0^{\\pi/2} \\ln(\\sin x)\\,dx', answer: -(Math.PI / 2) * Math.LN2, hint: '-\\frac{\\pi}{2}\\ln 2' },
  { latex: '\\int_0^{\\infty} \\frac{\\ln(1+x^2)}{1+x^2}\\,dx', answer: Math.PI * Math.LN2, hint: '\\pi \\ln 2' },
  { latex: '\\left.\\frac{d}{dx}\\left[\\arctan\\!\\left(\\frac{1+x}{1-x}\\right)\\right]\\right|_{x=\\sqrt{3}}', answer: 0.25, hint: '\\frac{1}{4}' },
  { latex: '\\int_0^{\\infty} \\frac{\\sin^2 x}{x^2}\\,dx', answer: Math.PI / 2, hint: '\\frac{\\pi}{2}' },
];

const WORDS = { pi: 'Math.PI', 'π': 'Math.PI', sqrt: 'Math.sqrt', ln: 'Math.log', log: 'Math.log10', exp: 'Math.exp', e: 'Math.E' };

export function parseAnswer(raw) {
  const s = String(raw ?? '').trim().toLowerCase().replace(/\s+/g, '');
  if (!s || s.length > 60) return NaN;
  const tokens = s.match(/sqrt|exp|ln|log|pi|π|e|\d*\.?\d+|[+\-*/^()]/g);
  if (!tokens || tokens.join('') !== s) return NaN;
  const js = tokens.map((t) => WORDS[t] ?? (t === '^' ? '**' : t)).join('');
  try {
    const v = Function(`"use strict"; return (${js});`)();
    return typeof v === 'number' ? v : NaN;
  } catch {
    return NaN;
  }
}

export function isCorrect(value, answer) {
  if (!Number.isFinite(value)) return false;
  const tol = Math.abs(answer) < 0.01 ? 2e-5 : Math.abs(answer) * 1e-3;
  return Math.abs(value - answer) <= tol;
}

const sessions = new Map();

export function newChallenge(orderId, action) {
  const idx = crypto.randomInt(PROBLEMS.length);
  const id = crypto.randomUUID();
  sessions.set(id, { idx, orderId, action, attempts: 0 });
  return { captchaId: id, latex: PROBLEMS[idx].latex };
}

export function checkChallenge(id, orderId, raw) {
  const s = sessions.get(id);
  if (!s || s.orderId !== orderId) return { ok: false, expired: true };
  const p = PROBLEMS[s.idx];
  if (isCorrect(parseAnswer(raw), p.answer)) {
    sessions.delete(id);
    return { ok: true, action: s.action };
  }
  s.attempts += 1;
  return { ok: false, attempts: s.attempts, hint: s.attempts >= 3 ? p.hint : null };
}
