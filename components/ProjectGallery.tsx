import Image from "next/image";

type ProjectGalleryProps = {
  title: string;
  images: string[];
};

export function ProjectGallery({ title, images }: ProjectGalleryProps) {
  return (
    <div className="space-y-10 pt-2">
      {images.map((image, index) => (
        <div key={`${title}-${image}-${index}`} className="relative overflow-hidden border-t border-border pt-6">
          <div className={`relative overflow-hidden ${index % 2 === 0 ? "aspect-[16/10]" : "aspect-[16/12]"}`}>
            <Image src={image} alt={`${title} imagen ${index + 1}`} fill sizes="100vw" className="object-cover" />
          </div>
        </div>
      ))}
    </div>
  );
}
