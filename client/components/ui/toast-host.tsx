"use client";

import { useToastStore } from "@/store/toast-store";

export function ToastHost() {
  const { toasts, remove } = useToastStore();
  return (
    <div className="fixed right-4 top-4 z-[100] flex w-[320px] flex-col gap-2">
      {toasts.map((t) => (
        <button
          key={t.id}
          onClick={() => remove(t.id)}
          className={[
            "rounded-[22px] border px-3 py-2 text-left shadow-[0_18px_34px_rgba(11,4,13,0.24)] backdrop-blur-xl",
            "bg-[linear-gradient(180deg,rgba(43,22,49,0.86),rgba(29,12,34,0.88))]",
            t.variant === "success" ? "border-emerald-300/30" : "",
            t.variant === "error" ? "border-rose-300/30" : "",
            t.variant === "info" ? "border-[#f7e7b2]/24" : ""
          ].join(" ")}
        >
          <p className="text-sm font-semibold text-white">{t.title}</p>
          {t.message ? <p className="mt-0.5 text-xs text-[#f3dce8]/80">{t.message}</p> : null}
        </button>
      ))}
    </div>
  );
}

