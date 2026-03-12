"use client";

import Image from "next/image";
import { motion } from "motion/react";

type HeroMedia = {
  type: "video" | "image";
  videoSrc?: string;
  imageSrc?: string;
  posterSrc?: string;
  fallbackColor?: string;
  overlayOpacity?: number;
};

type HeroSectionProps = {
  label: string;
  marqueeText: string;
  paragraph: string;
  disciplines: string[];
  media: HeroMedia;
};

export function HeroSection({ label, marqueeText, paragraph, disciplines, media }: HeroSectionProps) {
  const overlayOpacity = media.overlayOpacity ?? 0.38;
  const marqueeItems = [marqueeText, marqueeText, marqueeText];

  return (
    <section id="inicio" className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0">
        {media.type === "video" && media.videoSrc ? (
          <video
            className="h-full w-full object-cover"
            src={media.videoSrc}
            poster={media.posterSrc}
            autoPlay
            muted
            loop
            playsInline
          />
        ) : media.imageSrc ? (
          <Image src={media.imageSrc} alt="Fondo principal del hero" fill className="object-cover" priority />
        ) : (
          <div className="h-full w-full" style={{ backgroundColor: media.fallbackColor ?? "#0d0d0d" }} />
        )}
      </div>

      <div className="absolute inset-0" style={{ backgroundColor: `rgba(0, 0, 0, ${overlayOpacity})` }} />

      <div className="hero-marquee-mask absolute inset-x-0 top-1/2 -translate-y-1/2">
        <motion.div
          className="hero-marquee-track"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 30, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
        >
          {[0, 1].map((group) => (
            <div key={group} className="hero-marquee-group" aria-hidden={group === 1}>
              {marqueeItems.map((item, index) => (
                <span key={`${group}-${index}`} className="font-display text-[27vw] leading-none tracking-[0.02em] text-white/20 md:text-[18vw]">
                  {item}
                </span>
              ))}
            </div>
          ))}
        </motion.div>
      </div>

      <div className="relative z-10 flex min-h-screen items-end px-6 pb-12 md:px-12 md:pb-16 lg:px-20 lg:pb-20">
        <div className="container-width w-full">
          <div className="grid gap-10 border-t border-foreground/20 pt-6 md:grid-cols-[0.9fr_1.1fr] md:items-end">
            <div>
              <p className="editorial-kicker text-white/75">{label}</p>
            </div>
            <div className="space-y-6">
              <p className="max-w-xl text-sm leading-relaxed text-white/80 md:text-base">{paragraph}</p>
              <ul className="flex flex-wrap gap-x-6 gap-y-2 text-[11px] uppercase tracking-[0.2em] text-white/70">
                {disciplines.map((discipline) => (
                  <li key={discipline}>{discipline}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <h1 className="sr-only">{marqueeText}</h1>
    </section>
  );
}
