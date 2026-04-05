/**
 * ProgressBar.jsx
 * Animated progress bar shown during PDF generation.
 * Uses Framer Motion for smooth width transitions.
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProgressBar({ progress, isVisible, label }) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.25 }}
          className="overflow-hidden"
        >
          <div className="mb-3">
            {/* Labels */}
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {label || 'Generating PDF…'}
              </span>
              <motion.span
                key={progress}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs font-bold text-brand-600 dark:text-brand-400 tabular-nums"
              >
                {progress}%
              </motion.span>
            </div>

            {/* Track */}
            <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-brand-400 to-teal-500"
                initial={{ width: '0%' }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
              />
            </div>

            {/* Completion stages */}
            <div className="flex justify-between mt-1">
              {['Processing', 'Embedding', 'Finalising', 'Done'].map((stage, i) => {
                const threshold = [0, 30, 85, 100][i];
                return (
                  <span
                    key={stage}
                    className={`text-[9px] font-medium transition-colors duration-300 ${
                      progress >= threshold
                        ? 'text-brand-500 dark:text-brand-400'
                        : 'text-slate-300 dark:text-slate-700'
                    }`}
                  >
                    {stage}
                  </span>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
