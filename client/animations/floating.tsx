"use client";

export function Floating({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: "inline-block",
        animation: "cc-float 3s ease-in-out infinite",
      }}
    >
      {children}
    </div>
  );
}
