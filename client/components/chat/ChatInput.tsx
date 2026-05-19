"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Camera, ImagePlus, SendHorizontal, SmilePlus, X } from "lucide-react";
import { EmojiPicker } from "./EmojiPicker";
import { VoiceRecorder } from "./VoiceRecorder";
import type { ReplyPreview } from "./chat-types";

interface ChatInputProps {
  onSendText: (text: string) => void;
  onSendImage: (file: File, caption?: string) => void;
  onSendVoice: (blob: Blob, durationSec: number) => void;
  onTyping: () => void;
  replyingTo?: ReplyPreview | null;
  onCancelReply: () => void;
}

export function ChatInput({ onSendText, onSendImage, onSendVoice, onTyping, replyingTo, onCancelReply }: ChatInputProps) {
  const [value, setValue] = useState("");
  const [openEmoji, setOpenEmoji] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!selectedImage) {
      setImagePreviewUrl("");
      return;
    }
    const nextUrl = URL.createObjectURL(selectedImage);
    setImagePreviewUrl(nextUrl);
    return () => URL.revokeObjectURL(nextUrl);
  }, [selectedImage]);

  const sendCurrent = () => {
    const trimmed = value.trim();
    if (selectedImage) {
      onSendImage(selectedImage, trimmed || undefined);
      setSelectedImage(null);
      setValue("");
      return;
    }
    if (!trimmed) return;
    onSendText(trimmed);
    setValue("");
  };

  return (
    <div className="relative space-y-3 border-t border-pink-100 bg-white px-3 py-3 sm:px-4">
      <EmojiPicker open={openEmoji} onPick={(emoji) => setValue((current) => `${current}${emoji}`)} onClose={() => setOpenEmoji(false)} />

      <AnimatePresence>
        {replyingTo ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="flex items-start justify-between rounded-2xl border border-pink-100 bg-pink-50/40 px-3 py-2"
          >
            <div className="min-w-0">
              <p className="text-[11px] font-medium text-[#FF2D78]">Replying to {replyingTo.senderName}</p>
              <p className="truncate text-xs text-[#9B7065]">{replyingTo.text || `Shared ${replyingTo.type}`}</p>
            </div>
            <button type="button" onClick={onCancelReply} className="text-[#9B7065] hover:text-[#2D1810]">
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {selectedImage && imagePreviewUrl ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="flex items-center gap-3 rounded-2xl border border-pink-100 bg-pink-50/40 p-2"
          >
            <img src={imagePreviewUrl} alt="Preview" className="h-16 w-16 rounded-xl object-cover" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-[#2D1810]">{selectedImage.name}</p>
              <p className="text-xs text-[#9B7065]">Ready to send</p>
            </div>
            <button type="button" onClick={() => setSelectedImage(null)} className="rounded-full bg-pink-50 p-2 text-[#9B7065] hover:text-[#2D1810]">
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div className="flex items-end gap-2">
        <div className="flex flex-shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => setOpenEmoji((current) => !current)}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-pink-100 bg-pink-50 text-[#9B7065] transition hover:border-[#FF2D78] hover:text-[#FF2D78]"
          >
            <SmilePlus className="h-4.5 w-4.5" />
          </button>
          <button
            type="button"
            onClick={() => imageInputRef.current?.click()}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-pink-100 bg-pink-50 text-[#9B7065] transition hover:border-[#FF2D78] hover:text-[#FF2D78]"
          >
            <ImagePlus className="h-4.5 w-4.5" />
          </button>
          <button
            type="button"
            onClick={() => cameraInputRef.current?.click()}
            className="hidden h-11 w-11 items-center justify-center rounded-full border border-pink-100 bg-pink-50 text-[#9B7065] transition hover:border-[#FF2D78] hover:text-[#FF2D78] sm:flex"
          >
            <Camera className="h-4.5 w-4.5" />
          </button>
        </div>

        <div className="min-w-0 flex-1 rounded-[28px] border border-pink-100 bg-[#FFF8F0] px-3 py-2.5">
          <textarea
            value={value}
            onChange={(event) => {
              setValue(event.target.value);
              onTyping();
            }}
            rows={1}
            placeholder={selectedImage ? "Add a caption..." : "Type a message"}
            className="min-h-[22px] w-full resize-none overflow-hidden bg-transparent text-sm text-[#2D1810] outline-none placeholder:text-[#9B7065]/50"
          />
        </div>

        <VoiceRecorder onRecorded={onSendVoice} disabled={Boolean(selectedImage && value.trim())} />

        <motion.button
          type="button"
          whileTap={{ scale: 0.92 }}
          onClick={sendCurrent}
          disabled={!value.trim() && !selectedImage}
          className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-[#FF2D78] text-white shadow-[0_4px_18px_rgba(255,45,120,0.40)] transition disabled:cursor-not-allowed disabled:opacity-45"
        >
          <SendHorizontal className="h-4.5 w-4.5" />
        </motion.button>

        <input
          ref={imageInputRef}
          hidden
          type="file"
          accept="image/*"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) setSelectedImage(file);
            event.target.value = "";
          }}
        />
        <input
          ref={cameraInputRef}
          hidden
          type="file"
          accept="image/*"
          capture="environment"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) setSelectedImage(file);
            event.target.value = "";
          }}
        />
      </div>
    </div>
  );
}
