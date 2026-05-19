"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";

export function Dropzone({
  label,
  accept,
  onFile
}: {
  label: string;
  accept: string;
  onFile: (f: File) => Promise<void> | void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [drag, setDrag] = useState(false);

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      className={[
        "rounded-3xl border p-4 transition",
        drag ? "border-pink-200/50 bg-pink-500/10" : "border-purple-200/20 bg-white/10"
      ].join(" ")}
      onDragOver={(e) => {
        e.preventDefault();
        setDrag(true);
      }}
      onDragLeave={() => setDrag(false)}
      onDrop={async (e) => {
        e.preventDefault();
        setDrag(false);
        const f = e.dataTransfer.files?.[0];
        if (f) await onFile(f);
      }}
      onClick={() => inputRef.current?.click()}
      role="button"
      tabIndex={0}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-white">{label}</p>
          <p className="mt-1 text-xs text-purple-100/75">Drag & drop or tap to upload</p>
        </div>
        <span className="rounded-full border border-purple-200/20 bg-white/10 px-3 py-1 text-[11px] text-purple-50">
          Upload
        </span>
      </div>
      <input
        ref={inputRef}
        hidden
        type="file"
        accept={accept}
        onChange={async (e) => {
          const f = e.target.files?.[0];
          if (f) await onFile(f);
        }}
      />
    </motion.div>
  );
}

