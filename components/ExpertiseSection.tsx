"use client";

import { motion } from "motion/react";

type ExpertiseSectionProps = {
  heading: string;
  intro: string;
  items: string[];
};

export function ExpertiseSection({ heading, intro, items }: ExpertiseSectionProps) {
  return (
    <section className="section-padding pt-14 md:pt-20">
      <div className="container-width grid gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:gap-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.65 }}
          className="space-y-6"
        >
          <h2 className="font-display text-5xl uppercase tracking-[0.02em] text-foreground md:text-7xl">{heading}</h2>
          <p className="max-w-lg text-base leading-relaxed text-muted md:text-lg">{intro}</p>
        </motion.div>

        <motion.ul
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.65, delay: 0.08 }}
          className="grid gap-0 border-t border-border/70 md:grid-cols-2"
        >
          {items.map((item) => (
            <li key={item} className="border-b border-border/70 py-5 text-xs uppercase tracking-[0.2em] text-foreground md:pr-8">
              {item}
            </li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}
