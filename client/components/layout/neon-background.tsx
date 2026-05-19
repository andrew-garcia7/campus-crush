export function NeonBackground() {
  return (
    <div
      className="fixed inset-0 -z-10 overflow-hidden"
      style={{
        background: "var(--surface-bg)",
        contain: "strict",
        willChange: "auto",
      }}
    >
      <div
        className="absolute -left-24 -top-28 h-[520px] w-[520px] rounded-full blur-[100px]"
        style={{ background: "var(--bg-orb-1)", transform: "translateZ(0)" }}
      />
      <div
        className="absolute right-0 top-1/4 h-[420px] w-[420px] rounded-full blur-[85px]"
        style={{ background: "var(--bg-orb-2)", transform: "translateZ(0)" }}
      />
      <div
        className="absolute bottom-0 left-1/3 h-[360px] w-[360px] rounded-full blur-[75px]"
        style={{ background: "var(--bg-orb-3)", transform: "translateZ(0)" }}
      />
      <div
        className="absolute right-1/4 bottom-1/4 h-[260px] w-[260px] rounded-full blur-[65px]"
        style={{ background: "var(--bg-orb-4)", transform: "translateZ(0)" }}
      />

      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `linear-gradient(var(--bg-grid) 1px, transparent 1px), linear-gradient(90deg, var(--bg-grid) 1px, transparent 1px)`,
          backgroundSize: "120px 120px"
        }}
      />
    </div>
  );
}

