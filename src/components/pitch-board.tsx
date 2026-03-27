"use client";

import Image from "next/image";
import { ReactNode } from "react";

export type PitchMarker = {
  id: string;
  label: string;
  shirtNumber?: number;
  jerseySrc?: string;
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
  selectedMarkerId?: string;
  coverage?: CoverageOverlay;
  interactive?: boolean;
  onPitchClick?: (x: number, y: number) => void;
  onMarkerClick?: (markerId: string) => void;
  footer?: ReactNode;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function PitchBoard({
  title,
  subtitle,
  markers = [],
  selectedMarkerId,
  coverage,
  interactive = false,
  onPitchClick,
  onMarkerClick,
  footer,
}: PitchBoardProps) {
  return (
    <section className="rounded-[1.75rem] bg-[#09110c]/85 p-3 text-white shadow-[0_24px_80px_rgba(0,0,0,0.3)] sm:p-4">
      {(title || subtitle) && (
        <header className="mb-3 flex items-end justify-between gap-4">
          <div>
            {title ? (
              <h3 className="text-base font-black uppercase tracking-[0.12em] sm:text-lg">
                {title}
              </h3>
            ) : null}
            {subtitle ? (
              <p className="mt-1 text-xs text-white/65 sm:text-sm">{subtitle}</p>
            ) : null}
          </div>
        </header>
      )}

      <div
        className={`relative aspect-[16/19] max-h-[48rem] overflow-hidden rounded-[1.35rem] border border-[#baff6c]/20 bg-[radial-gradient(circle_at_top,_rgba(166,255,71,0.22),_rgba(15,62,24,0.94)_35%,_rgba(4,20,10,0.98)_100%)] ${
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
        <div className="absolute inset-[3%] border border-white/20" />
        <div className="absolute inset-x-[16%] top-[3%] h-[19%] border-x border-b border-white/20" />
        <div className="absolute inset-x-[16%] bottom-[3%] h-[19%] border-x border-t border-white/20" />
        <div className="absolute inset-x-[30%] top-[3%] h-[10%] border-x border-b border-white/15" />
        <div className="absolute inset-x-[30%] bottom-[3%] h-[10%] border-x border-t border-white/15" />
        <div className="absolute inset-x-[3%] top-1/2 h-px -translate-y-1/2 bg-white/25" />
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/25"
          style={{ width: "18%", aspectRatio: "1 / 1" }}
        />
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
          <button
            key={marker.id}
            className="absolute -translate-x-1/2 -translate-y-[42%] text-center"
            onClick={(event) => {
              event.stopPropagation();
              onMarkerClick?.(marker.id);
            }}
            type="button"
            style={{ left: `${marker.x}%`, top: `${marker.y}%` }}
          >
            <div
              className={`relative mx-auto h-[4.75rem] w-[3.9rem] transition-transform ${
                selectedMarkerId === marker.id ? "scale-110" : "hover:scale-105"
              }`}
            >
              <Image
                alt=""
                className="pointer-events-none select-none object-contain"
                height={114}
                priority={false}
                sizes="62px"
                src={marker.jerseySrc ?? "/jersey.png"}
                width={62}
              />
              <span className="absolute inset-0 z-10 flex items-center justify-center pt-1 text-[1.35rem] font-black text-white [text-shadow:0_2px_10px_rgba(0,0,0,0.8)]">
                {marker.shirtNumber ?? marker.label.slice(0, 1)}
              </span>
            </div>
            <div
              className={`mt-4 rounded-full px-3.5 py-1.5 text-[0.78rem] font-semibold uppercase tracking-[0.24em] ${
                selectedMarkerId === marker.id
                  ? "bg-[#a6ff47] text-[#081108]"
                  : "bg-black/45 text-white/75"
              }`}
            >
              {marker.label}
            </div>
          </button>
        ))}
      </div>

      {footer ? <div className="mt-4">{footer}</div> : null}
    </section>
  );
}
