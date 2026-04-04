/**
 * ControlsPanel.jsx
 * Left sidebar containing all PDF customisation controls:
 *   1. PDF file name
 *   2. Page size mode (Auto / A4 / Letter)
 *   3. Orientation (Portrait / Landscape)
 *   4. Image fit (Contain / Fill)
 *   5. Margin slider
 *   6. Compression slider
 */

import React from 'react';
import { motion } from 'framer-motion';

/* ─────────────────────────────────────────────────────────────────── */
/* ── Sub-components ────────────────────────────────────────────────── */

/** Animated section wrapper with a label */
function Section({ title, icon, children, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="py-4 border-b border-slate-100 dark:border-slate-800 last:border-0"
    >
      <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3">
        <span className="text-brand-500">{icon}</span>
        {title}
      </p>
      {children}
    </motion.div>
  );
}

/** A segmented button group (radio-style toggle) */
function SegmentedControl({ options, value, onChange }) {
  return (
    <div className="flex rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 p-0.5 gap-0.5">
      {options.map((opt) => (
        <motion.button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          whileTap={{ scale: 0.96 }}
          aria-pressed={value === opt.value}
          className={[
            'flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-medium transition-all duration-150',
            value === opt.value
              ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200',
          ].join(' ')}
        >
          {opt.icon && <span aria-hidden="true">{opt.icon}</span>}
          {opt.label}
        </motion.button>
      ))}
    </div>
  );
}

/** A labelled slider with live value display */
function LabelledSlider({ label, value, min, max, step, format, onChange }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">{label}</span>
        <span className="text-xs font-semibold text-brand-600 dark:text-brand-400 tabular-nums">
          {format ? format(value) : value}
        </span>
      </div>
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          style={{
            background: `linear-gradient(to right, #14b8a6 ${pct}%, transparent ${pct}%)`,
          }}
          className="w-full"
        />
      </div>
      <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-600">
        <span>{format ? format(min) : min}</span>
        <span>{format ? format(max) : max}</span>
      </div>
    </div>
  );
}

/* ── Icon helpers (SVG) ─────────────────────────────────────────────── */
const PortraitIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2">
    <rect x="5" y="2" width="14" height="20" rx="2"/>
  </svg>
);

const LandscapeIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2">
    <rect x="2" y="5" width="20" height="14" rx="2"/>
  </svg>
);

/* ─────────────────────────────────────────────────────────────────── */

export default function ControlsPanel({ settings, onChange, imageCount }) {
  return (
    <div className="flex flex-col h-full">
      {/* Panel header */}
      <div className="px-5 pt-5 pb-4 border-b border-slate-100 dark:border-slate-800">
        <h2 className="font-poppins font-bold text-slate-900 dark:text-white text-base">
          PDF Settings
        </h2>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
          Configure your output document
        </p>
      </div>

      {/* Scrollable settings */}
      <div className="flex-1 overflow-y-auto px-5 pb-6">

        {/* ── 1. PDF File Name ── */}
        <Section title="File Name" icon="✦" delay={0.05}>
          <div className="flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 focus-within:ring-2 focus-within:ring-brand-500/30 focus-within:border-brand-400 transition-all duration-150">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round"
              className="text-slate-400 shrink-0">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
            <input
              type="text"
              value={settings.pdfName}
              onChange={(e) => onChange('pdfName', e.target.value)}
              placeholder="converted"
              className="flex-1 bg-transparent text-sm text-slate-800 dark:text-slate-100 placeholder-slate-300 dark:placeholder-slate-600 outline-none min-w-0"
              aria-label="PDF file name"
            />
            <span className="text-xs text-slate-400 dark:text-slate-500 shrink-0">.pdf</span>
          </div>
        </Section>

        {/* ── 2. Page Size ── */}
        <Section title="Page Size" icon="⬜" delay={0.1}>
          <SegmentedControl
            options={[
              { value: 'auto',   label: 'Auto'   },
              { value: 'a4',     label: 'A4'     },
              { value: 'letter', label: 'Letter' },
            ]}
            value={settings.sizeMode}
            onChange={(v) => onChange('sizeMode', v)}
          />
          <p className="mt-2 text-[11px] text-slate-400 dark:text-slate-500 leading-relaxed">
            {settings.sizeMode === 'auto'
              ? "Page dimensions match each image's aspect ratio automatically."
              : settings.sizeMode === 'a4'
              ? 'ISO A4 — 210 × 297 mm (595 × 842 pt)'
              : 'US Letter — 8.5 × 11 in (612 × 792 pt)'}
          </p>
        </Section>

        {/* ── 3. Orientation ── */}
        <Section title="Orientation" icon="⟳" delay={0.15}>
          <SegmentedControl
            options={[
              { value: 'portrait',  label: 'Portrait',  icon: <PortraitIcon />  },
              { value: 'landscape', label: 'Landscape', icon: <LandscapeIcon /> },
            ]}
            value={settings.orientation}
            onChange={(v) => onChange('orientation', v)}
          />
        </Section>

        {/* ── 4. Image Fit ── */}
        <Section title="Image Fit" icon="⊡" delay={0.2}>
          <SegmentedControl
            options={[
              { value: 'contain', label: 'Contain' },
              { value: 'fill',    label: 'Fill'    },
            ]}
            value={settings.fit}
            onChange={(v) => onChange('fit', v)}
          />
          <p className="mt-2 text-[11px] text-slate-400 dark:text-slate-500 leading-relaxed">
            {settings.fit === 'contain'
              ? 'Image scaled to fit inside page — aspect ratio preserved, centred.'
              : 'Image stretched to fill the entire page — may crop or distort.'}
          </p>
        </Section>

        {/* ── 5. Margin ── */}
        <Section title="Margin" icon="⇥" delay={0.25}>
          <LabelledSlider
            label="Page margin"
            value={settings.margin}
            min={0}
            max={60}
            step={2}
            format={(v) => `${v} pt`}
            onChange={(v) => onChange('margin', v)}
          />
        </Section>

        {/* ── 6. Compression ── */}
        <Section title="Image Quality" icon="⬡" delay={0.3}>
          <LabelledSlider
            label="JPEG compression"
            value={settings.compression}
            min={0.1}
            max={1.0}
            step={0.05}
            format={(v) => `${Math.round(v * 100)}%`}
            onChange={(v) => onChange('compression', v)}
          />
          <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500">
            <span>Smaller file</span>
            <span>Best quality</span>
          </div>
          {settings.compression < 0.5 && (
            <motion.p
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 text-[11px] text-amber-500 dark:text-amber-400 font-medium"
            >
              ⚠ Low quality may cause visible artefacts.
            </motion.p>
          )}
        </Section>

        {/* ── Info card ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-2 rounded-xl bg-brand-50 dark:bg-brand-900/20 border border-brand-100 dark:border-brand-800/40 p-3.5"
        >
          <p className="text-[11px] text-brand-700 dark:text-brand-300 font-medium leading-relaxed">
            🔒 All processing happens in your browser.
            No images are ever uploaded to any server.
          </p>
          {imageCount > 0 && (
            <p className="mt-1 text-[11px] text-brand-600 dark:text-brand-400">
              Ready to convert {imageCount} image{imageCount !== 1 ? 's' : ''}.
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
}
