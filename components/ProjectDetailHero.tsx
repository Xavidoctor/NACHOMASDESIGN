import Image from "next/image";

type ProjectDetailHeroProps = {
  title: string;
  shortDescription: string;
  image: string;
};

export function ProjectDetailHero({ title, shortDescription, image }: ProjectDetailHeroProps) {
  return (
    <>
      <div className="space-y-6 border-t border-border pt-8">
        <h1 className="font-display text-6xl uppercase leading-[0.92] tracking-[0.02em] text-foreground md:text-9xl">{title}</h1>
        <p className="max-w-3xl text-base text-muted md:text-lg">{shortDescription}</p>
      </div>

      <div className="relative aspect-[16/9] overflow-hidden border-y border-border py-6">
        <Image src={image} alt={title} fill sizes="100vw" className="object-cover" priority />
      </div>
    </>
  );
}
