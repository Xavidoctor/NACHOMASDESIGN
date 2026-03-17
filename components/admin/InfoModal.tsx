"use client";

export function InfoModal({
  open,
  title,
  content,
  onClose,
}: {
  open: boolean;
  title: string;
  content: {
    what: string;
    why: string;
    worry: string;
    action: string;
  } | null;
  onClose: () => void;
}) {
  if (!open || !content) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-xl space-y-4 rounded-xl border border-white/15 bg-[#0c0c0c] p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-2xl tracking-wide">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-white/15 px-3 py-1 text-xs text-neutral-300 hover:bg-white/10"
          >
            Cerrar
          </button>
        </div>
        <div className="space-y-3 text-sm text-neutral-200">
          <div>
            <p className="text-xs uppercase tracking-[0.12em] text-neutral-500">Qué es</p>
            <p>{content.what}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.12em] text-neutral-500">Por qué importa</p>
            <p>{content.why}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.12em] text-neutral-500">Cuándo preocuparse</p>
            <p>{content.worry}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.12em] text-neutral-500">Qué hacer</p>
            <p>{content.action}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
