"use client";

import { useRouter } from "next/navigation";
import { X } from "lucide-react";

export function SectionCloseButton({ fallbackHref = "/discover" }: { fallbackHref?: string }) {
  const router = useRouter();

  const handleClose = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }

    router.push(fallbackHref as any);
  };

  return (
    <button
      type="button"
      onClick={handleClose}
      aria-label="Close section"
      title="Close"
      className="flex h-10 w-10 items-center justify-center rounded-full border border-pink-100 bg-pink-50 text-[#9B7065] transition hover:border-[#FF2D78] hover:text-[#FF2D78]"
    >
      <X className="h-4.5 w-4.5" />
    </button>
  );
}