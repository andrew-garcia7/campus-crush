"use client";

import Picker, { SuggestionMode, Theme } from "emoji-picker-react";
import { AnimatePresence, motion } from "framer-motion";

export function EmojiPicker({ open, onPick, onClose }: { open: boolean; onPick: (emoji: string) => void; onClose: () => void }) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.98 }}
          className="absolute bottom-[calc(100%+12px)] left-0 z-30 overflow-hidden rounded-[28px] border border-pink-100 bg-white shadow-[0_8px_40px_rgba(255,45,120,0.12)]"
        >
          <Picker
            theme={Theme.LIGHT}
            onEmojiClick={(emojiData) => {
              onPick(emojiData.emoji);
              onClose();
            }}
            lazyLoadEmojis
            previewConfig={{ showPreview: false }}
            searchPlaceholder="Search emoji"
            suggestedEmojisMode={SuggestionMode.RECENT}
            width={320}
            height={380}
            skinTonesDisabled={false}
          />
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
