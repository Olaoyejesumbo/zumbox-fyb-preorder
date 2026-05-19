"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AnnouncementBanner from "@/components/AnnouncementBanner";
import UniformImage from "@/components/UniformImage";
import { UNIFORM_DESIGNS, UniformDesign, Gender } from "@/types";

type FilterType = "All" | Gender;

export default function GalleryPage() {
  const router = useRouter();
  const [filter, setFilter] = useState<FilterType>("All");
  const [flippedCard, setFlippedCard] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const [preOrdersOpen, setPreOrdersOpen] = useState(true);

  useEffect(() => {
    fetch("/api/config")
      .then((r) => r.json())
      .then((data) => {
        if (data.announcement_text) setAnnouncement(data.announcement_text);
        if (typeof data.pre_orders_open === "boolean")
          setPreOrdersOpen(data.pre_orders_open);
      })
      .catch(() => {});
  }, []);

  const filtered =
    filter === "All"
      ? UNIFORM_DESIGNS
      : UNIFORM_DESIGNS.filter((d) => d.gender === filter);

  function handleSelectDesign(design: UniformDesign) {
    if (!preOrdersOpen) return;
    router.push(`/fyb-week/order?design=${design.id}`);
  }

  function toggleFlip(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    setFlippedCard((prev) => (prev === id ? null : id));
  }

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      {announcement && <AnnouncementBanner text={announcement} />}

      {/* Nav */}
      <nav className="bg-ebony text-cream px-6 py-4 flex items-center justify-between">
        <span className="font-syne font-bold text-lg tracking-[3px] uppercase">
          ZumboX
        </span>
        <span className="text-gold text-xs tracking-[2px] uppercase font-dm hidden sm:block">
          The Rare Form
        </span>
      </nav>

      {/* Hero */}
      <header className="bg-forest text-cream px-6 py-16 sm:py-24 text-center">
        <p className="text-gold text-xs tracking-[4px] uppercase font-dm mb-4">
          FYB Week 2026
        </p>
        <h1 className="font-syne font-bold text-3xl sm:text-5xl uppercase tracking-tight leading-tight mb-4 max-w-3xl mx-auto">
          ZumboX Academy Uniform
        </h1>
        <p className="text-cream/70 font-dm text-sm sm:text-base mb-8 tracking-wide">
          Custom Uniforms for Byte-Circle 26&apos; &mdash; Back to School Day
        </p>
        <p className="max-w-xl mx-auto text-cream/80 font-dm text-sm sm:text-base leading-relaxed">
          ZumboX Fashion is proud to present four exclusive uniform designs for
          FYB Week 2026. Each piece is custom-made to your measurements,
          blending school-uniform precision with editorial fashion sensibility.
          Select your design below to begin your pre-order — deposit secures
          your spot.
        </p>
      </header>

      {/* Filter */}
      <div className="sticky top-0 z-10 bg-cream border-b border-ebony/10 px-6 py-3 flex gap-2 justify-center">
        {(["All", "Male", "Female"] as FilterType[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-5 py-2 text-xs font-syne font-bold uppercase tracking-[2px] border transition-colors ${
              filter === f
                ? "bg-forest text-cream border-forest"
                : "bg-transparent text-forest border-forest hover:bg-forest hover:text-cream"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Cards Grid */}
      <main className="flex-1 px-4 sm:px-8 py-12 max-w-6xl mx-auto w-full">
        {!preOrdersOpen && (
          <div className="mb-8 bg-burgundy text-cream text-center py-4 px-6 font-dm text-sm">
            Pre-orders are currently closed. Check back soon.
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-8">
          {filtered.map((design) => {
            const isFlipped = flippedCard === design.id;
            return (
              <div
                key={design.id}
                className="group cursor-pointer"
                onClick={() => handleSelectDesign(design)}
              >
                <div className="card-flip">
                  <div
                    className={`card-flip-inner ${isFlipped ? "flipped" : ""}`}
                  >
                    {/* Front */}
                    <div className="card-face">
                      <UniformImage
                        design={design}
                        view="front"
                        className="w-full h-72 sm:h-96 relative"
                      />
                    </div>
                    {/* Back */}
                    <div className="card-face card-face-back">
                      <UniformImage
                        design={design}
                        view="back"
                        className="w-full h-72 sm:h-96 relative"
                      />
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="border border-t-0 border-ebony/10 p-4 bg-white">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h2 className="font-syne font-bold text-base uppercase tracking-wide text-ebony">
                        {design.name}
                      </h2>
                      <span
                        className="inline-block mt-1 text-[10px] font-dm font-semibold uppercase tracking-[2px] px-2 py-0.5 border"
                        style={{
                          borderColor:
                            design.gender === "Male" ? "#1B3A2D" : "#4A0E1A",
                          color:
                            design.gender === "Male" ? "#1B3A2D" : "#4A0E1A",
                        }}
                      >
                        {design.gender}
                      </span>
                    </div>
                    {/* Flip toggle */}
                    <button
                      onClick={(e) => toggleFlip(design.id, e)}
                      className="text-[10px] font-dm uppercase tracking-[1.5px] text-ebony/50 hover:text-ebony border border-ebony/20 hover:border-ebony px-3 py-1.5 transition-colors"
                    >
                      {isFlipped ? "Front" : "Back"}
                    </button>
                  </div>

                  <button
                    disabled={!preOrdersOpen}
                    className={`w-full py-3 font-syne font-bold text-xs uppercase tracking-[2px] transition-colors ${
                      preOrdersOpen
                        ? "bg-forest text-cream hover:bg-burgundy"
                        : "bg-ebony/20 text-ebony/40 cursor-not-allowed"
                    }`}
                  >
                    {preOrdersOpen ? "Select This Design" : "Closed"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Sticky bottom CTA */}
      {preOrdersOpen && (
        <div className="sticky bottom-0 bg-ebony text-cream py-4 px-6 flex items-center justify-center gap-4 border-t border-gold/20">
          <span className="font-dm text-sm text-cream/80 hidden sm:block">
            Found your design?
          </span>
          <span className="font-syne font-bold text-sm uppercase tracking-[2px] text-gold">
            Select Your Design to Begin Pre-Order
          </span>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-forest text-cream/60 text-center py-6 px-4 text-xs font-dm tracking-wider">
        <p className="font-syne font-bold text-cream tracking-[3px] uppercase mb-1">
          ZumboX Fashion
        </p>
        <p>The Rare Form &mdash; FYB Week 2026</p>
      </footer>
    </div>
  );
}
