"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { useState } from "react";

type GalleryItem = {
  src: string;
  alt: string;
};

type VisualGalleryProps = {
  heading: string;
  items: GalleryItem[];
};

export function VisualGallery({ heading, items }: VisualGalleryProps) {
  if (items.length === 0) return null;

  const [current, setCurrent] = useState(0);

  const previous = () => {
    setCurrent((prev) => (prev === 0 ? items.length - 1 : prev - 1));
  };

  const next = () => {
    setCurrent((prev) => (prev === items.length - 1 ? 0 : prev + 1));
  };

  return (
    <section className="section-padding pb-16 pt-28 md:pt-36">
      <div className="container-width space-y-8">
        <div className="flex items-end justify-between gap-4 border-t border-border pt-8">
          <h2 className="font-display text-5xl uppercase tracking-[0.02em] text-foreground md:text-7xl">{heading}</h2>
          <div className="flex items-center gap-4 text-[11px] uppercase tracking-[0.2em] text-foreground">
            <button type="button" onClick={previous} className="focus-ring transition-opacity hover:opacity-60" aria-label="Imagen anterior">
              ← Ant
            </button>
            <span className="text-muted">{String(current + 1).padStart(2, "0")}</span>
            <button type="button" onClick={next} className="focus-ring transition-opacity hover:opacity-60" aria-label="Siguiente imagen">
              Sig →
            </button>
          </div>
        </div>

        <div className="overflow-hidden border-y border-border/70 py-8">
          <motion.div
            animate={{ x: `-${current * 100}%` }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="flex"
          >
            {items.map((item) => (
              <div key={item.src} className="relative min-w-full pr-8">
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image src={item.src} alt={item.alt} fill sizes="100vw" className="object-cover" />
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
