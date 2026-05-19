"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, GripVertical, LoaderCircle, MessageSquarePlus, X } from "lucide-react";

export type PhotoSlot = {
  url: string;
  caption: string;
};

type PhotoSlotCellProps = {
  slot: PhotoSlot;
  index: number;
  uploading: boolean;
  onUpload: (file: File) => void;
  onRemove: () => void;
  onCaptionChange: (c: string) => void;
  onDragStart: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: () => void;
};

const CAPTION_SUGGESTIONS = [
  "Post gym glow 💪",
  "Guess where this was 📍",
  "Rate my chai obsession ☕",
  "Golden hour energy 🌅",
  "No context needed 😂",
  "This was unplanned ✈️",
  "Campus life 📚",
  "My kind of Friday 🎶",
];

function PhotoSlotCell({
  slot,
  index,
  uploading,
  onUpload,
  onRemove,
  onCaptionChange,
  onDragStart,
  onDragOver,
  onDrop,
}: PhotoSlotCellProps) {
  const fileRef        = useRef<HTMLInputElement>(null);
  const [editingCaption, setEditingCaption] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const isHero = index === 0;

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border-2 transition-all duration-200 ${
        isDragOver
          ? "scale-[1.03] border-[#FF2D78]/60 shadow-[0_0_18px_rgba(255,45,120,0.25)]"
          : slot.url
            ? "border-pink-200 hover:border-[#FF2D78]/50"
            : "border-dashed border-pink-200 hover:border-[#FF2D78]/60"
      }`}
      style={{ aspectRatio: "3/4" }}
      draggable={Boolean(slot.url)}
      onDragStart={onDragStart}
      onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); onDragOver(e); }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={() => { setIsDragOver(false); onDrop(); }}
    >
      {slot.url ? (
        <>
          <img src={slot.url} alt="" className="h-full w-full object-cover" />

          {/* Bottom gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent pointer-events-none" />

          {/* Uploading overlay */}
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
              <LoaderCircle className="h-7 w-7 animate-spin text-white" />
            </div>
          )}

          {/* Top right controls */}
          {!uploading && (
            <div className="absolute right-1.5 top-1.5 flex flex-col gap-1">
              <button
                type="button"
                onClick={() => { setEditingCaption((v) => !v); setShowSuggestions(false); }}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-black/55 text-white/80 backdrop-blur-sm transition hover:bg-fuchsia-500/80"
                title="Add caption"
              >
                <MessageSquarePlus className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={onRemove}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-black/55 text-white/80 backdrop-blur-sm transition hover:bg-rose-500/80"
                title="Remove photo"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {/* Drag handle */}
          {!uploading && (
            <div className="absolute left-1.5 top-1.5 flex h-7 w-7 cursor-grab items-center justify-center rounded-full bg-black/45 text-white/50 backdrop-blur-sm">
              <GripVertical className="h-3.5 w-3.5" />
            </div>
          )}

          {/* Hero badge */}
          {isHero && (
            <div className="absolute left-2 top-10 rounded-full border border-fuchsia-400/40 bg-fuchsia-500/25 px-2 py-0.5 text-[10px] font-bold text-fuchsia-100 backdrop-blur-sm">
              Main
            </div>
          )}

          {/* Caption display */}
          {!editingCaption && slot.caption && (
            <div className="absolute bottom-2 left-2 right-2 pointer-events-none">
              <p className="rounded-xl bg-black/55 px-2.5 py-1 text-[11px] font-medium text-white/90 backdrop-blur-sm">
                {slot.caption}
              </p>
            </div>
          )}

          {/* Caption editor */}
          <AnimatePresence>
            {editingCaption && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className="absolute bottom-0 left-0 right-0 bg-black/70 p-2 backdrop-blur-md"
              >
                <input
                  autoFocus
                  value={slot.caption}
                  onChange={(e) => onCaptionChange(e.target.value.slice(0, 60))}
                  placeholder="Add a caption… ✈️"
                  className="w-full rounded-xl border border-white/20 bg-white/10 px-2.5 py-1.5 text-xs text-white outline-none placeholder:text-white/40"
                />
                {/* Suggestions */}
                <div className="mt-1.5 flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-hide">
                  {CAPTION_SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onMouseDown={(e) => { e.preventDefault(); onCaptionChange(s); setEditingCaption(false); }}
                      className="flex-shrink-0 rounded-full border border-white/15 bg-white/10 px-2 py-0.5 text-[10px] text-white/70 transition hover:bg-fuchsia-500/30 hover:text-fuchsia-100"
                    >
                      {s}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onMouseDown={() => setEditingCaption(false)}
                  className="mt-1.5 w-full text-center text-[10px] text-white/40 hover:text-white/70"
                >
                  Done
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      ) : (
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="flex h-full w-full flex-col items-center justify-center gap-2 bg-pink-50/60 text-[#9B7065] transition hover:bg-pink-100/70 hover:text-[#FF2D78]"
        >
          {uploading ? (
            <LoaderCircle className="h-7 w-7 animate-spin" />
          ) : (
            <>
              <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-pink-200 bg-white">
                <Camera className="h-5 w-5" />
              </div>
              {isHero && (
                <span className="text-[10px] font-medium text-[#9B7065]">Main photo</span>
              )}
            </>
          )}
        </button>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onUpload(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}

// ─── Photo Grid ───────────────────────────────────────────────────────────────

export function PhotoGrid({
  slots,
  uploadingIndex,
  onUpload,
  onRemove,
  onCaptionChange,
  onReorder,
}: {
  slots: PhotoSlot[];
  uploadingIndex: number | null;
  onUpload: (index: number, file: File) => void;
  onRemove: (index: number) => void;
  onCaptionChange: (index: number, caption: string) => void;
  onReorder: (from: number, to: number) => void;
}) {
  const dragFrom = useRef<number | null>(null);
  const filled = slots.filter((s) => s.url).length;

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-white">Photos</p>
          <p className="text-xs text-purple-300/60">
            {filled}/6 uploaded · drag slots to reorder
          </p>
        </div>
        {filled > 0 && (
          <span
            className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
              filled >= 4
                ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-200"
                : "border-amber-400/25 bg-amber-500/10 text-amber-200"
            }`}
          >
            {filled >= 4 ? "✓ Great" : `${4 - filled} more for best results`}
          </span>
        )}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-3 gap-2">
        {slots.map((slot, i) => (
          <PhotoSlotCell
            key={i}
            slot={slot}
            index={i}
            uploading={uploadingIndex === i}
            onUpload={(file) => onUpload(i, file)}
            onRemove={() => onRemove(i)}
            onCaptionChange={(c) => onCaptionChange(i, c)}
            onDragStart={() => { dragFrom.current = i; }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => {
              if (dragFrom.current !== null && dragFrom.current !== i) {
                onReorder(dragFrom.current, i);
              }
              dragFrom.current = null;
            }}
          />
        ))}
      </div>

      <p className="text-center text-[10px] text-purple-300/30">
        Tap a photo to add a caption · tap ✕ to remove
      </p>
    </div>
  );
}
