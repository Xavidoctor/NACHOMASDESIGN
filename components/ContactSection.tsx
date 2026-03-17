"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ContactForm } from "@/components/ContactForm";

type ContactSectionProps = {
  heading: string;
  intro: string;
  email: string;
  contactLabel: string;
  copyEmailLabel: string;
  whatsappLabel: string;
  whatsappUrl: string;
  socials: Array<{ label: string; href: string; logoUrl?: string }>;
};

export function ContactSection({
  heading,
  intro,
  email,
  contactLabel,
  copyEmailLabel,
  whatsappLabel,
  whatsappUrl,
  socials
}: ContactSectionProps) {
  void contactLabel;
  void copyEmailLabel;
  return (
    <section className="section-padding pb-16 pt-20 md:pt-28" id="contacto">
      <motion.div
        className="container-width grid gap-10 border-t border-border/70 pt-10 md:grid-cols-[0.9fr_1.1fr]"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ duration: 0.65 }}
      >
        <div className="space-y-7">
          <h2 className="font-display text-5xl uppercase tracking-[0.02em] text-foreground md:text-7xl">{heading}</h2>
          <p className="max-w-md text-base leading-relaxed text-muted">{intro}</p>

          {email ? <p className="text-sm text-foreground">{email}</p> : null}

          <div className="flex flex-col gap-4 text-xs uppercase tracking-[0.18em]">
            <Link href={whatsappUrl} target="_blank" rel="noreferrer" className="focus-ring w-fit text-foreground transition-opacity hover:opacity-60">
              {whatsappLabel}
            </Link>
          </div>

          <div className="flex flex-wrap gap-x-5 gap-y-3 border-t border-border/70 pt-6 text-xs uppercase tracking-[0.16em] text-muted">
            {socials.map((social) => (
              <Link key={social.label} href={social.href} target="_blank" rel="noreferrer" className="focus-ring inline-flex items-center gap-2 transition-colors hover:text-foreground">
                {social.logoUrl ? (
                  <img src={social.logoUrl} alt={`Logo ${social.label}`} className="h-4 w-4 object-contain opacity-80" />
                ) : null}
                <span>{social.label}</span>
              </Link>
            ))}
          </div>
        </div>

        <ContactForm />
      </motion.div>
    </section>
  );
}
