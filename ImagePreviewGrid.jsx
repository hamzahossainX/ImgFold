/**
 * ImagePreviewGrid.jsx
 * Responsive grid of SortableImageCard components.
 * Uses @dnd-kit for drag-to-reorder with Framer Motion layout animations.
 */

import React, { useState } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  arrayMove,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { AnimatePresence } from 'framer-motion';

import SortableImageCard from './SortableImageCard.jsx';

/* ─────────────────────────────────────────────────────────────────── */

export default function ImagePreviewGrid({ images, onRemove, onReorder }) {
  const [activeId, setActiveId] = useState(null);

  /* Configure sensors:
   * - PointerSensor: mouse/trackpad with a 5px activation distance
   *   (prevents accidental drags on clicks)
   * - TouchSensor: mobile with a 50ms delay
   * - KeyboardSensor: for accessibility
   */
  const sensors = useSensors(
    useSensor(PointerSensor,  { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor,    { activationConstraint: { delay: 200, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  /* ── Drag handlers ─────────────────────────────────────────────── */
  function handleDragStart({ active }) {
    setActiveId(active.id);
  }

  function handleDragEnd({ active, over }) {
    setActiveId(null);
    if (!over || active.id === over.id) return;

    const oldIndex = images.findIndex((img) => img.id === active.id);
    const newIndex = images.findIndex((img) => img.id === over.id);
    onReorder(arrayMove(images, oldIndex, newIndex));
  }

  function handleDragCancel() {
    setActiveId(null);
  }

  /* Active image (being dragged) — used for DragOverlay */
  const activeImage = images.find((img) => img.id === activeId);

  /* ─────────────────────────────────────────────────────────────── */
  return (
    <div>
      {/* Section header */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-poppins font-semibold text-slate-800 dark:text-slate-100 text-sm">
          Images
          <span className="ml-2 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs font-normal">
            {images.length}
          </span>
        </h2>
        <p className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M5 9l-3 3 3 3M9 5l3-3 3 3M15 19l-3 3-3-3M19 9l3 3-3 3M2 12h20M12 2v20"/>
          </svg>
          Drag to reorder
        </p>
      </div>

      {/* DnD context */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <SortableContext items={images.map((img) => img.id)} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
            <AnimatePresence initial={false}>
              {images.map((image, index) => (
                <SortableImageCard
                  key={image.id}
                  image={image}
                  index={index}
                  onRemove={onRemove}
                />
              ))}
            </AnimatePresence>
          </div>
        </SortableContext>

        {/* DragOverlay: renders a "ghost" of the dragged card above everything */}
        <DragOverlay adjustScale={false}>
          {activeImage ? (
            <div className="rounded-xl overflow-hidden border-2 border-brand-400 shadow-2xl shadow-brand-500/25 rotate-2 opacity-95 bg-white dark:bg-slate-800">
              <div className="aspect-[4/3] overflow-hidden bg-slate-100 dark:bg-slate-700">
                <img
                  src={activeImage.dataUrl}
                  alt={activeImage.name}
                  className="w-full h-full object-cover"
                  draggable={false}
                />
              </div>
              <div className="px-2.5 py-2 border-t border-slate-100 dark:border-slate-700">
                <p className="text-xs text-slate-600 dark:text-slate-300 font-medium truncate">
                  {activeImage.name}
                </p>
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
