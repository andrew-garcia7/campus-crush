"use client";

import { motion, useMotionValue } from "framer-motion";
import { useEffect } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// Bird silhouette – elegant swallow, facing RIGHT, centered near (0,0)
// Body spans roughly –24 to +24 on x; total with beak ≈ –40 to +36
// ─────────────────────────────────────────────────────────────────────────────
const B_BODY   = "M -24,0 C -14,-8 6,-7 24,0 C 6,7 -14,8 -24,0 Z";
const B_WING_U = "M  0,-2 C -4,-18 -18,-26 -26,-20 C -22,-12 -12,-6  0,-2 Z";
const B_WING_D = "M  0, 2 C -4, 18 -18, 26 -26, 20 C -22, 12 -12, 6  0, 2 Z";
const B_BEAK   = "M 24,-1 L 36, 0 L 24, 1 Z";
const B_TAIL_U = "M -24,-0.5 C -34,-8 -40,-6 -38,-2 Z";
const B_TAIL_D = "M -24, 0.5 C -34, 8 -40, 6 -38, 2 Z";

// ─── Heart path, centered at (0,0), ~44 units wide ───────────────────────────
const HEART = "M 0,14 C -3,10 -22,0 -22,-12 C -22,-23 -12,-28 0,-18 C 12,-28 22,-23 22,-12 C 22,0 3,10 0,14 Z";

// ─── 12 sparkle positions around the kiss point ──────────────────────────────
const SPARKS = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  angle: (i / 12) * Math.PI * 2,
  r: 30 + (i % 3) * 10,
}));

// ─── Tiny helpers ────────────────────────────────────────────────────────────
const lerp  = (a: number, b: number, t: number) => a + (b - a) * t;
const eo3   = (t: number) => 1 - Math.pow(1 - t, 3);
const eio   = (t: number) => t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2,3)/2;
const clamp = (v: number) => Math.max(0, Math.min(1, v));
const ph    = (t: number, s: number, e: number) => clamp((t - s) / (e - s));

// \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
interface LogoProps {
  size?: number;
  showText?: boolean;
  animated?: boolean;
  dark?: boolean;
  className?: string;
}

export function CampusCrushLogo({
  size = 220,
  showText = true,
  animated = true,
  dark = false,
  className = "",
}: LogoProps) {
  const iconH = showText ? size * 0.68 : size;
  const textH = showText ? size * 0.32 : 0;
  const cx    = size / 2;
  const cy    = iconH / 2;
  const sc    = size / 300;

  // \u2500\u2500 Motion values \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
  const b1x  = useMotionValue(cx - 130 * sc);
  const b1y  = useMotionValue(cy);
  const b1r  = useMotionValue(0);
  const b1op = useMotionValue(0);

  const b2x  = useMotionValue(cx + 130 * sc);
  const b2y  = useMotionValue(cy);
  const b2r  = useMotionValue(180);
  const b2op = useMotionValue(0);

  const wingY  = useMotionValue(1);
  const hScale = useMotionValue(0);
  const hOp    = useMotionValue(0);
  const gScale = useMotionValue(0);
  const gOp    = useMotionValue(0);
  const sOp    = useMotionValue(0);
  const sSc    = useMotionValue(0);
  const textOp = useMotionValue(0);

  // \u2500\u2500 Main animation loop \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
  useEffect(() => {
    if (!animated) {
      b1x.set(cx - 50 * sc); b1y.set(cy); b1r.set(0);  b1op.set(0.85);
      b2x.set(cx + 50 * sc); b2y.set(cy); b2r.set(180); b2op.set(0.85);
      hScale.set(0.75); hOp.set(0.7);
      if (showText) textOp.set(1);
      return;
    }

    let raf: number;
    let t0: number | null = null;
    const CYCLE = 12000;

    const T_ENTRY  = 0.10;
    const T_ORBIT  = 0.55;
    const T_KISS   = 0.65;
    const T_BLOOM  = 0.74;
    const T_SETTLE = 0.87;
    const T_EXIT   = 0.96;

    const tick = (ts: number) => {
      if (t0 === null) t0 = ts;
      const t = ((ts - t0) % CYCLE) / CYCLE;

      // Continuous wing flap
      const flapT = (ts % 480) / 480;
      wingY.set(0.35 + 0.65 * Math.abs(Math.sin(flapT * Math.PI)));

      let _b1x: number, _b1y: number, _b1r: number, _b1op = 1;
      let _b2x: number, _b2y: number, _b2r: number, _b2op = 1;
      let _hS = 0, _hO = 0, _gS = 0, _gO = 0, _sO = 0, _sS = 0, _tO = 0;

      // \u2500\u2500 Phase 1: Entry \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
      if (t < T_ENTRY) {
        const p = eo3(ph(t, 0, T_ENTRY));
        _b1x = lerp(-150, -72, p); _b1y = lerp(14,  5, p); _b1r = 0;
        _b2x = lerp( 150,  72, p); _b2y = lerp(-14,-5, p); _b2r = 180;
        _b1op = p; _b2op = p;

      // \u2500\u2500 Phase 2: Orbital dance (2.4 rotations, spiraling in) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
      } else if (t < T_ORBIT) {
        const p     = ph(t, T_ENTRY, T_ORBIT);
        const R     = lerp(72, 20, p * p * p);
        const theta = p * Math.PI * 4.8;
        const ry    = 0.46;

        _b1x = Math.cos(theta) * R;
        _b1y = Math.sin(theta) * R * ry;
        _b2x = Math.cos(theta + Math.PI) * R;
        _b2y = Math.sin(theta + Math.PI) * R * ry;

        const eps = 0.0015, pN = p + eps;
        const RN  = lerp(72, 20, pN * pN * pN);
        const tN  = pN * Math.PI * 4.8;
        _b1r = Math.atan2(Math.sin(tN)*RN*ry - _b1y, Math.cos(tN)*RN - _b1x) * 180 / Math.PI;
        _b2r = Math.atan2(Math.sin(tN+Math.PI)*RN*ry - _b2y, Math.cos(tN+Math.PI)*RN - _b2x) * 180 / Math.PI;

      // \u2500\u2500 Phase 3: Slow approach & kiss \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
      } else if (t < T_KISS) {
        const p = eio(ph(t, T_ORBIT, T_KISS));
        _b1x = lerp(-20, -4, p); _b1y = 0; _b1r = lerp(-6,  5, p);
        _b2x = lerp( 20,  4, p); _b2y = 0; _b2r = lerp(186,175, p);

      // \u2500\u2500 Phase 4: Heart blooms + sparkle burst \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
      } else if (t < T_BLOOM) {
        const p = eo3(ph(t, T_KISS, T_BLOOM));
        _b1x = lerp(-4, -9, p); _b1y = lerp(0,-7, p); _b1r = lerp(5,-18, p);
        _b2x = lerp( 4,  9, p); _b2y = lerp(0,-7, p); _b2r = lerp(175,198, p);
        _hS  = p * 1.14;
        _hO  = p;
        _gS  = p * 2.6;
        _gO  = p < 0.5 ? p * 1.6 : (1 - p) * 1.6;
        _sO  = p;
        _sS  = p * 0.9;

      // \u2500\u2500 Phase 5: Settle \u2013 birds perch, heart pulses, text fades in \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
      } else if (t < T_SETTLE) {
        const p = ph(t, T_BLOOM, T_SETTLE);
        _b1x = lerp(-9, -34, eo3(p)); _b1y = lerp(-7,-14, eo3(p)); _b1r = lerp(-18,-28, p);
        _b2x = lerp( 9,  34, eo3(p)); _b2y = lerp(-7,-14, eo3(p)); _b2r = lerp(198,208, p);
        _hS  = 1 + Math.sin(p * Math.PI * 4) * 0.06;
        _hO  = 1;
        _sO  = lerp(1, 0, p);
        _sS  = lerp(0.9, 2.4, p);
        _tO  = eo3(clamp((p - 0.28) / 0.72));

      // \u2500\u2500 Phase 6: Exit \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
      } else if (t < T_EXIT) {
        const p = eio(ph(t, T_SETTLE, T_EXIT));
        _b1x = lerp(-34,-160, p); _b1y = lerp(-14, 0, p); _b1r = lerp(-28, 0, p);
        _b2x = lerp( 34, 160, p); _b2y = lerp(-14, 0, p); _b2r = lerp(208,180, p);
        _hS  = lerp(1, 0, eio(p));
        _hO  = lerp(1, 0, eio(p));
        _tO  = lerp(1, 0, eio(p));

      // \u2500\u2500 Invisible reset \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
      } else {
        _b1x = -160; _b1y = 14; _b1r = 0;
        _b2x =  160; _b2y =-14; _b2r = 180;
        _b1op = 0; _b2op = 0;
      }

      b1x.set(_b1x * sc + cx); b1y.set(_b1y * sc + cy); b1r.set(_b1r); b1op.set(_b1op);
      b2x.set(_b2x * sc + cx); b2y.set(_b2y * sc + cy); b2r.set(_b2r); b2op.set(_b2op);
      hScale.set(_hS); hOp.set(_hO);
      gScale.set(_gS); gOp.set(_gO);
      sOp.set(_sO);    sSc.set(_sS);
      textOp.set(showText ? _tO : 0);

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [animated, sc, cx, cy, showText,
      b1x, b1y, b1r, b1op, b2x, b2y, b2r, b2op,
      wingY, hScale, hOp, gScale, gOp, sOp, sSc, textOp]);

  const bs = sc * 1.2;  // bird glyph scale
  const hs = sc * 1.75; // heart glyph scale

  return (
    <div
      className={`relative inline-flex flex-col items-center ${className}`}
      style={{ width: size, height: iconH + textH }}
    >
      <svg suppressHydrationWarning
        width={size}
        height={iconH}
        viewBox={`0 0 ${size} ${iconH}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ overflow: "visible", display: "block" }}
      >
        <defs>
          <radialGradient id="cc-aura" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor={dark ? "#6b1680" : "#fde4f4"} stopOpacity="0.55" />
            <stop offset="100%" stopColor={dark ? "#150524" : "#fff5fb"} stopOpacity="0" />
          </radialGradient>

          {/* Bird 1 \u2013 warm rose */}
          <linearGradient id="cc-b1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor={dark ? "#fda4cd" : "#f9c0de"} />
            <stop offset="100%" stopColor={dark ? "#f43f8a" : "#d06080"} />
          </linearGradient>
          <filter id="cc-b1g" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation={dark ? "6" : "3"} result="b" />
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>

          {/* Bird 2 \u2013 violet */}
          <linearGradient id="cc-b2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor={dark ? "#e879f9" : "#d8b4f8"} />
            <stop offset="100%" stopColor={dark ? "#a855f7" : "#b07ad0"} />
          </linearGradient>
          <filter id="cc-b2g" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation={dark ? "6" : "3"} result="b" />
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>

          {/* 3D Heart */}
          <linearGradient id="cc-hf" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor="#ffc0d8" />
            <stop offset="50%"  stopColor="#f43f8a" />
            <stop offset="100%" stopColor="#9d174d" />
          </linearGradient>
          <radialGradient id="cc-hs" cx="28%" cy="18%" r="52%">
            <stop offset="0%"   stopColor="white" stopOpacity="0.82" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
          <filter id="cc-hg" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="7" result="b" />
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>

          {/* Glow ring */}
          <radialGradient id="cc-ring" cx="50%" cy="50%" r="50%">
            <stop offset="35%"  stopColor={dark ? "#f0abfc" : "#f9a8d4"} stopOpacity="0.9" />
            <stop offset="100%" stopColor={dark ? "#f0abfc" : "#f9a8d4"} stopOpacity="0" />
          </radialGradient>

          {/* Sparkle */}
          <linearGradient id="cc-sp" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor="#fff4fc" />
            <stop offset="100%" stopColor={dark ? "#f0abfc" : "#e879f9"} />
          </linearGradient>
        </defs>

        {/* Ambient aura */}
        <circle cx={cx} cy={cy} r={size * 0.46} fill="url(#cc-aura)" />

        {/* Kiss glow ring */}
        <motion.circle
          cx={cx} cy={cy} r={60 * sc}
          fill="url(#cc-ring)"
          style={{ scale: gScale, opacity: gOp }}
          transformOrigin={`${cx}px ${cy}px`}
        />

        {/* Sparkle burst */}
        {SPARKS.map((s) => {
          const sx = Math.cos(s.angle) * s.r * sc;
          const sy = Math.sin(s.angle) * s.r * sc;
          return (
            <motion.g
              key={s.id}
              style={{ x: cx + sx, y: cy + sy, opacity: sOp, scale: sSc }}
              transformOrigin={`${cx + sx}px ${cy + sy}px`}
            >
              <path d={`M0,${-5*sc} L${2.2*sc},0 L0,${5*sc} L${-2.2*sc},0 Z`} fill="url(#cc-sp)" />
              <path d={`M${-5*sc},0 L0,${2.2*sc} L${5*sc},0 L0,${-2.2*sc} Z`} fill="url(#cc-sp)" />
            </motion.g>
          );
        })}

        {/* 3D Heart */}
        <motion.g
          style={{ x: cx, y: cy, scale: hScale, opacity: hOp }}
          transformOrigin={`${cx}px ${cy}px`}
        >
          <g filter="url(#cc-hg)" transform={`scale(${hs})`}>
            {[7,6,5,4,3,2,1].map(i => (
              <path key={i} d={HEART}
                fill={`hsl(340,65%,${5+i*5}%)`}
                transform={`translate(${i*0.55},${i*1.05})`}
                opacity={0.18+i*0.09}
              />
            ))}
            <path d={HEART} fill="url(#cc-hf)" />
            <path d={HEART} fill="url(#cc-hs)" />
            <ellipse cx={-6} cy={-14} rx={5} ry={3} fill="white" opacity={0.44} transform="rotate(-26)" />
          </g>
        </motion.g>

        {/* Bird 1 \u2013 rose, starts left */}
        <motion.g
          style={{ x: b1x, y: b1y, rotate: b1r, opacity: b1op,
                   transformBox: "fill-box", transformOrigin: "50% 50%" }}
        >
          <g filter="url(#cc-b1g)" transform={`scale(${bs})`}>
            <path d={B_BODY}   fill="url(#cc-b1)" />
            <motion.g style={{ scaleY: wingY, transformBox: "fill-box", transformOrigin: "50% 50%" }}>
              <path d={B_WING_U} fill="url(#cc-b1)" opacity="0.94" />
              <path d={B_WING_D} fill="url(#cc-b1)" opacity="0.94" />
            </motion.g>
            <path d={B_BEAK}   fill={dark ? "#ffe4f2" : "#edd8e2"} />
            <path d={B_TAIL_U} fill="url(#cc-b1)" opacity="0.82" />
            <path d={B_TAIL_D} fill="url(#cc-b1)" opacity="0.82" />
            <circle cx={8}   cy={-4} r={2.2} fill="white"   opacity={0.9} />
            <circle cx={8.6} cy={-4} r={1}   fill="#2d0a1a" />
          </g>
        </motion.g>

        {/* Bird 2 \u2013 lavender, starts right, horizontally flipped */}
        <motion.g
          style={{ x: b2x, y: b2y, rotate: b2r, opacity: b2op,
                   transformBox: "fill-box", transformOrigin: "50% 50%" }}
        >
          <g filter="url(#cc-b2g)" transform={`scale(${-bs},${bs})`}>
            <path d={B_BODY}   fill="url(#cc-b2)" />
            <motion.g style={{ scaleY: wingY, transformBox: "fill-box", transformOrigin: "50% 50%" }}>
              <path d={B_WING_U} fill="url(#cc-b2)" opacity="0.94" />
              <path d={B_WING_D} fill="url(#cc-b2)" opacity="0.94" />
            </motion.g>
            <path d={B_BEAK}   fill={dark ? "#f3e8ff" : "#e4d8ef"} />
            <path d={B_TAIL_U} fill="url(#cc-b2)" opacity="0.82" />
            <path d={B_TAIL_D} fill="url(#cc-b2)" opacity="0.82" />
            <circle cx={8}   cy={-4} r={2.2} fill="white"   opacity={0.9} />
            <circle cx={8.6} cy={-4} r={1}   fill="#1a0a2d" />
          </g>
        </motion.g>
      </svg>

      {/* Typography */}
      {showText && (
        <motion.div
          className="flex flex-col items-center select-none"
          style={{ opacity: textOp, marginTop: -(size * 0.035) }}
        >
          <span
            style={{
              fontFamily: "'Great Vibes', 'Dancing Script', 'Pinyon Script', cursive",
              fontSize: size * 0.175,
              lineHeight: 1,
              background: "linear-gradient(135deg, #c9747e 0%, #e8a4c4 50%, #b884c0 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              letterSpacing: "0.02em",
            }}
          >
            Campus
          </span>
          <span
            style={{
              fontFamily: "'Inter', 'Poppins', sans-serif",
              fontSize: size * 0.095,
              fontWeight: 300,
              letterSpacing: "0.32em",
              textTransform: "uppercase" as const,
              color: dark ? "#e8cfe0" : "#9b6b8a",
              marginTop: size * -0.015,
            }}
          >
            Crush
          </span>
        </motion.div>
      )}
    </div>
  );
}
