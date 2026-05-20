"use client";

import Image from "next/image";
import { UniformDesign } from "@/types";

interface UniformImageProps {
  design: UniformDesign;
  view?: "front" | "back";
  className?: string;
}

/**
 * Renders the uniform image for a given design.
 * Falls back to a styled brand-color placeholder if no imageSrc is provided.
 * To swap in real images: set design.imageSrc / design.backImageSrc in UNIFORM_DESIGNS.
 */
export default function UniformImage({
  design,
  view = "front",
  className = "",
}: UniformImageProps) {
  const src = view === "back" ? design.backImageSrc : design.imageSrc;
  const viewLabel = view === "back" ? "BACK VIEW" : "FRONT VIEW";

  if (src) {
    return (
      <div className={`relative overflow-hidden ${className}`}>
        <Image
          src={src}
          alt={`${design.name} — ${viewLabel}`}
          fill
          className="object-cover"
        />
      </div>
    );
  }

  // Placeholder: intentional brand-color block
  return (
    <div
      className={`flex flex-col items-center justify-center select-none ${className}`}
      style={{ backgroundColor: design.primaryColor }}
    >
      {/* Large "Z" monogram */}
      <span
        className="text-7xl font-syne font-bold leading-none mb-3 opacity-20"
        style={{ color: design.accentColor }}
        aria-hidden="true"
      >
        Z
      </span>

      {/* Design name */}
      <span
        className="text-sm font-syne font-bold tracking-[3px] uppercase text-center px-4"
        style={{ color: design.accentColor }}
      >
        {design.name}
      </span>

      {/* View indicator */}
      <span
        className="mt-2 text-[10px] tracking-[2px] uppercase font-dm opacity-60"
        style={{ color: design.secondaryColor }}
      >
        {viewLabel}
      </span>

      {/* Accent stripe */}
      <div
        className="absolute bottom-0 left-0 right-0 h-1"
        style={{ backgroundColor: design.accentColor }}
      />
    </div>
  );
}
