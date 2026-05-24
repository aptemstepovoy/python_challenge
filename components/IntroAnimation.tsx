"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

const SESSION_KEY = "operator-intro-shown";
const COOLDOWN_MIN = 30;
const TOTAL_MS = 9000;

type Phase =
  | "appear"
  | "spheres"
  | "collect"
  | "box"
  | "lotus"
  | "text"
  | "fade";

const SPHERES = [
  { color: "#a78bfa", icon: "◉", angle: -140 },
  { color: "#ec4899", icon: "✦", angle: -100 },
  { color: "#22d3ee", icon: "❖", angle: -60 },
  { color: "#34d399", icon: "▲", angle: 60 },
  { color: "#fbbf24", icon: "✺", angle: 100 },
  { color: "#f472b6", icon: "♥", angle: 140 },
];

const HANDS = [
  { x: 100, y: 110 },
  { x: 75, y: 175 },
  { x: 95, y: 235 },
  { x: 305, y: 235 },
  { x: 325, y: 175 },
  { x: 300, y: 110 },
];

export function IntroAnimation() {
  const [show, setShow] = useState(false);
  const [phase, setPhase] = useState<Phase>("appear");

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      if (raw) {
        const ts = parseInt(raw, 10);
        const ageMin = (Date.now() - ts) / 60000;
        if (ageMin < COOLDOWN_MIN) return;
      }
      sessionStorage.setItem(SESSION_KEY, String(Date.now()));
    } catch {
      /* show anyway */
    }
    setShow(true);
  }, []);

  useEffect(() => {
    if (!show) return;
    const schedule: Array<[Phase, number]> = [
      ["appear", 0],
      ["spheres", 800],
      ["collect", 2100],
      ["box", 3400],
      ["lotus", 4400],
      ["text", 5500],
      ["fade", 8600],
    ];
    const timers = schedule.map(([name, at]) =>
      setTimeout(() => setPhase(name), at)
    );
    timers.push(setTimeout(() => setShow(false), TOTAL_MS));
    return () => timers.forEach(clearTimeout);
  }, [show]);

  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-background"
        initial={{ opacity: 0 }}
        animate={{ opacity: phase === "fade" ? 0 : 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(167,139,250,0.18) 0%, rgba(236,72,153,0.08) 40%, transparent 70%)",
          }}
        />

        <button
          onClick={() => setShow(false)}
          aria-label="skip"
          className="absolute right-5 top-5 z-10 text-secondary hover:text-foreground"
        >
          <X className="h-5 w-5" />
        </button>

        <svg
          viewBox="0 0 400 540"
          className="relative h-[80vh] max-h-[640px] w-auto"
          aria-hidden
        >
          <defs>
            <radialGradient id="i-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#f3c97a" stopOpacity="1" />
              <stop offset="50%" stopColor="#ec4899" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#a78bfa" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="i-box" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fff" stopOpacity="1" />
              <stop offset="40%" stopColor="#f3c97a" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#ec4899" stopOpacity="0.4" />
            </radialGradient>
            <linearGradient id="i-figure" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#3a2e55" />
              <stop offset="100%" stopColor="#0a0814" />
            </linearGradient>
            <filter id="i-soft" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="i-strong" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="9" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <Figure phase={phase} />

          {SPHERES.map((s, i) => (
            <Sphere key={i} idx={i} {...s} phase={phase} />
          ))}

          <Box phase={phase} />

          <Caption phase={phase} />
        </svg>
      </motion.div>
    </AnimatePresence>
  );
}

function Figure({ phase }: { phase: Phase }) {
  const isLotus =
    phase === "lotus" || phase === "text" || phase === "fade";
  const cx = 200;
  const shoulderY = 180;
  const handsFolded =
    phase === "collect" || phase === "box" || isLotus;

  return (
    <g>
      {/* Aura behind head when in lotus */}
      {isLotus && (
        <motion.circle
          initial={{ opacity: 0, r: 20 }}
          animate={{ opacity: 0.4, r: 75 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          cx={cx}
          cy={285}
          fill="url(#i-glow)"
        />
      )}

      {/* Standing body morphs into lotus base */}
      <motion.path
        initial={{ opacity: 0 }}
        animate={{
          opacity: 1,
          d: isLotus
            ? `M ${cx - 65} 335
               Q ${cx} 322 ${cx + 65} 335
               L ${cx + 45} 405
               Q ${cx} 415 ${cx - 45} 405 Z`
            : `M ${cx - 38} 180
               L ${cx + 38} 180
               L ${cx + 30} 345
               L ${cx - 30} 345 Z`,
        }}
        transition={{ duration: 0.9, ease: "easeInOut" }}
        fill="url(#i-figure)"
        stroke="#a78bfa"
        strokeOpacity="0.55"
        strokeWidth="1.2"
      />

      {/* Head */}
      <motion.circle
        initial={{ opacity: 0, cy: 140 }}
        animate={{
          opacity: 1,
          cy: isLotus ? 285 : 140,
        }}
        transition={{ duration: 0.9, ease: "easeInOut" }}
        cx={cx}
        r="28"
        fill="url(#i-figure)"
        stroke="#c4b5fd"
        strokeOpacity="0.7"
        strokeWidth="1.4"
      />

      {/* Legs — standing */}
      {!isLotus && (
        <>
          <motion.rect
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            x={cx - 26}
            y={345}
            width={20}
            height={95}
            fill="url(#i-figure)"
            stroke="#a78bfa"
            strokeOpacity="0.3"
            rx="6"
          />
          <motion.rect
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            x={cx + 6}
            y={345}
            width={20}
            height={95}
            fill="url(#i-figure)"
            stroke="#a78bfa"
            strokeOpacity="0.3"
            rx="6"
          />
        </>
      )}

      {/* Lotus crossed legs */}
      {isLotus && (
        <>
          <motion.ellipse
            initial={{ opacity: 0, ry: 8 }}
            animate={{ opacity: 1, ry: 24 }}
            transition={{ duration: 0.8 }}
            cx={cx}
            cy={410}
            rx={100}
            fill="url(#i-figure)"
            stroke="#a78bfa"
            strokeOpacity="0.45"
            strokeWidth="1.2"
          />
          <motion.ellipse
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            cx={cx}
            cy={410}
            rx={70}
            ry={14}
            fill="none"
            stroke="#c4b5fd"
            strokeOpacity="0.4"
          />
        </>
      )}

      {/* 6 arms */}
      {HANDS.map((target, i) => {
        const shoulderX = i < 3 ? cx - 28 : cx + 28;
        const isFolded = handsFolded;
        const cx2 = isFolded ? cx : target.x;
        const cy2 = isFolded ? (isLotus ? 360 : 245) : target.y;
        // simple cubic-ish curve via two segments through midpoint
        const midX = (shoulderX + cx2) / 2;
        const midY = (shoulderY + 10 + cy2) / 2 - 15;
        return (
          <g key={i}>
            <motion.path
              initial={{ opacity: 0 }}
              animate={{
                opacity: 1,
                d: `M ${shoulderX} ${shoulderY + 10} Q ${midX} ${midY} ${cx2} ${cy2}`,
              }}
              transition={{
                duration: 0.8,
                ease: "easeInOut",
                delay: 0.04 * i,
              }}
              fill="none"
              stroke="#a78bfa"
              strokeOpacity="0.78"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <motion.circle
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, cx: cx2, cy: cy2 }}
              transition={{
                duration: 0.8,
                ease: "easeInOut",
                delay: 0.04 * i,
              }}
              r="6"
              fill="#c4b5fd"
              filter="url(#i-soft)"
            />
          </g>
        );
      })}
    </g>
  );
}

function Sphere({
  idx,
  angle,
  color,
  icon,
  phase,
}: {
  idx: number;
  angle: number;
  color: string;
  icon: string;
  phase: Phase;
}) {
  const cx = 200;
  const cy = 220;
  // Orbit position
  const rad = (angle * Math.PI) / 180;
  const orbitR = 180;
  const orbitX = cx + Math.sin(rad) * orbitR;
  const orbitY = cy - Math.cos(rad) * orbitR * 0.6;

  const hand = HANDS[idx];
  const boxX = 200;
  const boxY = 245;

  let tx = orbitX;
  let ty = orbitY;
  let op = 0;
  let scale = 0.4;

  if (phase === "appear") {
    op = 0;
    scale = 0.2;
  } else if (phase === "spheres") {
    tx = orbitX;
    ty = orbitY;
    op = 1;
    scale = 1;
  } else if (phase === "collect") {
    tx = hand.x;
    ty = hand.y;
    op = 1;
    scale = 0.9;
  } else if (phase === "box") {
    tx = boxX;
    ty = boxY;
    op = 0;
    scale = 0.15;
  } else {
    op = 0;
    scale = 0;
    tx = boxX;
    ty = boxY;
  }

  return (
    <motion.g
      initial={{ opacity: 0 }}
      animate={{ opacity: op }}
      transition={{ duration: 0.6, delay: 0.08 * idx }}
    >
      <motion.circle
        animate={{ cx: tx, cy: ty, scale }}
        transition={{
          duration: 0.9,
          ease: "easeInOut",
          delay: 0.05 * idx,
        }}
        r="18"
        fill={color}
        fillOpacity="0.85"
        filter="url(#i-soft)"
      />
      <motion.text
        animate={{ x: tx, y: ty + 5, scale }}
        transition={{
          duration: 0.9,
          ease: "easeInOut",
          delay: 0.05 * idx,
        }}
        textAnchor="middle"
        fill="#0a0814"
        fontSize="15"
        fontWeight="700"
        style={{ pointerEvents: "none" }}
      >
        {icon}
      </motion.text>
    </motion.g>
  );
}

function Box({ phase }: { phase: Phase }) {
  const visible =
    phase === "box" ||
    phase === "lotus" ||
    phase === "text" ||
    phase === "fade";
  if (!visible) return null;
  const inLotus =
    phase === "lotus" || phase === "text" || phase === "fade";
  const y = inLotus ? 355 : 245;
  return (
    <motion.g
      initial={{ opacity: 0, scale: 0.3 }}
      animate={{ opacity: inLotus ? 0.9 : 1, scale: 1 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
    >
      <motion.circle
        animate={{ cy: y, r: [55, 75, 55] }}
        transition={{
          cy: { duration: 0.8 },
          r: { duration: 2, repeat: Infinity, ease: "easeInOut" },
        }}
        cx={200}
        fill="url(#i-glow)"
      />
      <motion.rect
        animate={{ y: y - 16 }}
        transition={{ duration: 0.8 }}
        x={184}
        width={32}
        height={32}
        rx={5}
        fill="url(#i-box)"
        stroke="#f3c97a"
        strokeWidth="1.3"
        filter="url(#i-strong)"
      />
    </motion.g>
  );
}

function Caption({ phase }: { phase: Phase }) {
  const visible = phase === "text" || phase === "fade";
  if (!visible) return null;
  return (
    <motion.g
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <text
        x={200}
        y={500}
        textAnchor="middle"
        fill="#ece8f5"
        fontFamily="var(--font-display), Forum, serif"
        fontSize="22"
        style={{ letterSpacing: "0.08em" }}
      >
        Будь лучшей версией себя
      </text>
      <text
        x={200}
        y={524}
        textAnchor="middle"
        fill="#a78bfa"
        fontSize="14"
        fontFamily="var(--font-display), Forum, serif"
        style={{ letterSpacing: "0.3em" }}
      >
        OPERATOR
      </text>
    </motion.g>
  );
}
