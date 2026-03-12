"use client";

import { motion } from "motion/react";

type AboutSectionProps = {
  heading: string;
  paragraphs: string[];
};

export function AboutSection({ heading, paragraphs }: AboutSectionProps) {
  return (
    <section id="sobre-mi" className="section-padding pb-16 pt-24 md:py-32">
      <motion.div
        className="container-width grid gap-10 border-y border-border/70 py-16 md:grid-cols-[0.8fr_1.2fr] md:gap-20"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.35 }}
        transition={{ duration: 0.65 }}
      >
        <h2 className="font-display text-5xl uppercase tracking-[0.02em] text-foreground md:text-7xl">{heading}</h2>
        <div className="space-y-6 text-base leading-relaxed text-muted md:text-xl">
          {paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
