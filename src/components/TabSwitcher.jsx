/**
 * TabSwitcher.jsx
 * Premium animated tab switcher for Upload / Camera Scan modes.
 */

import React from 'react';
import { motion } from 'framer-motion';

const TABS = [
  {
    value: 'upload',
    label: 'Upload Images',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="9" cy="9" r="2" />
        <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
      </svg>
    ),
  },
  {
    value: 'camera',
    label: 'Camera Scan',
    badge: 'NEW',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
        <circle cx="12" cy="13" r="3" />
      </svg>
    ),
  },
];

export default function TabSwitcher({ activeTab, onTabChange }) {
  return (
    <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/50 mb-5 max-w-full min-w-0">
      {TABS.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onTabChange(tab.value)}
          className={[
            'relative flex-1 flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 min-w-0',
            activeTab === tab.value
              ? 'text-white'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200',
          ].join(' ')}
        >
          {/* Animated background indicator */}
          {activeTab === tab.value && (
            <motion.div
              layoutId="tab-indicator"
              className="absolute inset-0 rounded-lg bg-brand-500 shadow-md"
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            />
          )}

          <span className="relative z-10 flex items-center gap-2">
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
            {tab.badge && (
              <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-full bg-amber-400/90 text-amber-900 leading-none">
                {tab.badge}
              </span>
            )}
          </span>
        </button>
      ))}
    </div>
  );
}
