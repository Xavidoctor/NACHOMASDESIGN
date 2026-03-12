type FooterProps = {
  brandLine: string;
  copyright: string;
};

export function Footer({ brandLine, copyright }: FooterProps) {
  return (
    <footer className="px-6 pb-10 pt-4 md:px-12 lg:px-20">
      <div className="container-width border-t border-border/70 pt-7">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
          <p className="font-display text-3xl uppercase tracking-[0.02em] text-foreground">{brandLine}</p>
        </div>

        <p className="mt-7 text-xs text-muted">{copyright}</p>
      </div>
    </footer>
  );
}
