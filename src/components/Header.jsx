/**
 * Header.jsx
 * Sticky top bar: logo, image count badge, font-size switcher, dark-mode toggle.
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/* ── Inline SVG icons ──────────────────────────────────────────────── */
const SunIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1"  x2="12" y2="3"/>
    <line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22"   x2="5.64" y2="5.64"/>
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1"  y1="12" x2="3"  y2="12"/>
    <line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78"  x2="5.64" y2="18.36"/>
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
);

const MoonIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
);

const LogoIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M4 4h16v16H4V4z" stroke="white" strokeWidth="1.8" strokeLinejoin="round"/>
    <path d="M4 4l8 9 8-9"    stroke="white" strokeWidth="1.8" strokeLinejoin="round"/>
    <path d="M9 15h6M9 18h4"  stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
);

/* ── Font size options ─────────────────────────────────────────────── */
const FONT_SIZES = [
  { value: 'sm', label: 'S', title: 'Small text' },
  { value: 'md', label: 'M', title: 'Medium text' },
  { value: 'lg', label: 'L', title: 'Large text' },
];

/* ─────────────────────────────────────────────────────────────────── */

export default function Header({ isDark, onToggleDark, fontSize, onFontSizeChange, imageCount }) {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between px-5 lg:px-7 h-14 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shrink-0">

      {/* ── Logo ── */}
      <motion.div
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
        className="flex items-center gap-2.5"
      >
        {/* Icon */}
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-teal-600 flex items-center justify-center shadow-lg shadow-brand-500/30">
          <LogoIcon />
        </div>

        {/* Name */}
        <span className="font-poppins font-bold text-slate-900 dark:text-white text-base tracking-tight">
          ImgFold
        </span>

        {/* Tagline — hidden on small screens */}
        <span className="hidden sm:inline text-xs text-slate-400 dark:text-slate-500 font-medium">
          Images → PDF
        </span>

        {/* Image count badge */}
        <AnimatePresence>
          {imageCount > 0 && (
            <motion.span
              key="badge"
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              className="ml-1 px-2 py-0.5 rounded-full bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300 text-xs font-semibold tabular-nums"
            >
              {imageCount}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ── Right controls ── */}
      <motion.div
        initial={{ opacity: 0, x: 12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
        className="flex items-center gap-2"
      >

        {/* Font-size switcher */}
        <div
          className="hidden sm:flex items-center gap-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg p-1"
          role="group"
          aria-label="UI font size"
        >
          {FONT_SIZES.map(({ value, label, title }) => (
            <button
              key={value}
              onClick={() => onFontSizeChange(value)}
              title={title}
              aria-pressed={fontSize === value}
              className={[
                'w-7 h-7 rounded-md text-xs font-semibold transition-all duration-150',
                fontSize === value
                  ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200',
              ].join(' ')}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Dark-mode toggle */}
        <button
          onClick={onToggleDark}
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          title={isDark ? 'Light mode' : 'Dark mode'}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative overflow-hidden"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={isDark ? 'moon' : 'sun'}
              initial={{ rotate: -30, opacity: 0, scale: 0.7 }}
              animate={{ rotate: 0,   opacity: 1, scale: 1   }}
              exit={{ rotate:   30,   opacity: 0, scale: 0.7 }}
              transition={{ duration: 0.2 }}
              className="flex items-center justify-center"
            >
              {isDark ? <SunIcon /> : <MoonIcon />}
            </motion.span>
          </AnimatePresence>
        </button>
      </motion.div>
    </header>
  );
}
