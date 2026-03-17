"use client";

import { useState } from "react";

export function HelpTooltip({
  title,
  shortText,
  onOpen,
}: {
  title: string;
  shortText: string;
  onOpen?: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative inline-flex items-center">
      <button
        type="button"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={() => onOpen?.()}
        className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-white/20 text-[10px] text-neutral-300 transition-colors hover:bg-white/10"
        aria-label={`Ayuda sobre ${title}`}
      >
        ?
      </button>
      {open ? (
        <div className="absolute left-7 top-0 z-20 w-64 rounded-md border border-white/15 bg-black/95 p-2 text-xs text-neutral-200 shadow-xl">
          <p className="font-medium text-white">{title}</p>
          <p className="mt-1 text-neutral-300">{shortText}</p>
          {onOpen ? <p className="mt-1 text-[11px] text-neutral-500">Haz clic para ampliar.</p> : null}
        </div>
      ) : null}
    </div>
  );
}
