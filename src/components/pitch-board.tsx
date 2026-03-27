"use client";

import { ReactNode } from "react";

export type PitchMarker = {
  id: string;
  label: string;
  shirtNumber?: number;
  x: number;
  y: number;
  accent?: "lime" | "white";
};

type CoverageOverlay = {
  x: number;
  y: number;
  width: number;
  depth: number;
  bias: "left" | "center" | "right";
};

type PitchBoardProps = {
  title?: string;
  subtitle?: string;
  markers?: PitchMarker[];
  coverage?: CoverageOverlay;
  interactive?: boolean;
  onPitchClick?: (x: number, y: number) => void;
  footer?: ReactNode;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function PitchBoard({
  title,
  subtitle,
  markers = [],
  coverage,
  interactive = false,
  onPitchClick,
  footer,
}: PitchBoardProps) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-[#09110c]/85 p-4 text-white shadow-[0_24px_80px_rgba(0,0,0,0.3)]">
      {(title || subtitle) && (
        <header className="mb-4 flex items-end justify-between gap-4">
          <div>
            {title ? (
              <h3 className="text-lg font-black uppercase tracking-[0.12em]">
                {title}
              </h3>
            ) : null}
            {subtitle ? (
              <p className="mt-1 text-sm text-white/65">{subtitle}</p>
            ) : null}
          </div>
        </header>
      )}

      <div
        className={`relative aspect-[10/14] overflow-hidden rounded-[1.6rem] border border-[#baff6c]/20 bg-[radial-gradient(circle_at_top,_rgba(166,255,71,0.22),_rgba(15,62,24,0.94)_35%,_rgba(4,20,10,0.98)_100%)] ${
          interactive ? "cursor-crosshair" : ""
        }`}
        onClick={(event) => {
          if (!interactive || !onPitchClick) {
            return;
          }

          const bounds = event.currentTarget.getBoundingClientRect();
          const x = clamp(((event.clientX - bounds.left) / bounds.width) * 100, 0, 100);
          const y = clamp(((event.clientY - bounds.top) / bounds.height) * 100, 0, 100);
          onPitchClick(Math.round(x), Math.round(y));
        }}
      >
        <div className="absolute inset-[3%] rounded-[1.4rem] border border-white/20" />
        <div className="absolute inset-x-[16%] top-[6%] h-[16%] rounded-b-[2.5rem] border border-white/20" />
        <div className="absolute inset-x-[16%] bottom-[6%] h-[16%] rounded-t-[2.5rem] border border-white/20" />
        <div className="absolute inset-x-[30%] top-[6%] h-[7%] rounded-b-[2rem] border border-white/15" />
        <div className="absolute inset-x-[30%] bottom-[6%] h-[7%] rounded-t-[2rem] border border-white/15" />
        <div className="absolute inset-x-[3%] top-1/2 h-px -translate-y-1/2 bg-white/25" />
        <div className="absolute left-1/2 top-1/2 h-[18%] w-[18%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/25" />
        <div className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/70" />

        {coverage ? (
          <div
            className="absolute -translate-x-1/2 -translate-y-1/2 rounded-[40%] border border-[#dfffbc]/40 bg-[#baff6c]/18 shadow-[0_0_30px_rgba(186,255,108,0.12)] backdrop-blur-[1px]"
            style={{
              left: `${coverage.x}%`,
              top: `${coverage.y}%`,
              width: `${coverage.width}%`,
              height: `${coverage.depth}%`,
              transform: `translate(calc(-50% + ${
                coverage.bias === "left"
                  ? "-8%"
                  : coverage.bias === "right"
                    ? "8%"
                    : "0%"
              }), -50%)`,
            }}
          />
        ) : null}

        {markers.map((marker) => (
          <div
            key={marker.id}
            className="absolute -translate-x-1/2 -translate-y-1/2 text-center"
            style={{ left: `${marker.x}%`, top: `${marker.y}%` }}
          >
            <div className="mx-auto flex h-14 w-12 items-center justify-center border border-white/25 bg-[#050705] text-lg font-black shadow-[0_10px_30px_rgba(0,0,0,0.3)]"
              style={{
                clipPath:
                  "polygon(22% 0%, 78% 0%, 88% 15%, 100% 20%, 88% 100%, 12% 100%, 0% 20%, 12% 15%)",
                boxShadow:
                  marker.accent === "white"
                    ? "0 10px 30px rgba(255,255,255,0.12)"
                    : "0 10px 30px rgba(166,255,71,0.24)",
              }}
            >
              <div className="absolute inset-x-[17%] top-[7%] h-[8%] rounded-full border border-[#a6ff47]/75" />
              <div className="absolute inset-x-0 top-[16%] h-[5%] bg-[#a6ff47]" />
              <div className="absolute inset-y-0 left-0 w-[8%] bg-[#a6ff47]" />
              <div className="absolute inset-y-0 right-0 w-[8%] bg-[#a6ff47]" />
              <span className="relative z-10 mt-2 text-white">
                {marker.shirtNumber ?? marker.label.slice(0, 1)}
              </span>
            </div>
            <div className="mt-2 rounded-full bg-black/45 px-2 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.24em] text-white/75">
              {marker.label}
            </div>
          </div>
        ))}
      </div>

      {footer ? <div className="mt-4">{footer}</div> : null}
    </section>
  );
}
