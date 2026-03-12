import { DEFAULT_WHATSAPP_NUMBER, WHATSAPP_PREFILLED_MESSAGE } from "@/lib/constants";
import type { SiteContent } from "@/types/content";

export const siteConfig = {
  domain: "nachomasdesign.com",
  brandName: "Nacho Mas Design",
  locale: "es",
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? DEFAULT_WHATSAPP_NUMBER
} as const;

export const getWhatsappUrl = () => {
  const text = encodeURIComponent(WHATSAPP_PREFILLED_MESSAGE);
  return `https://wa.me/${siteConfig.whatsappNumber}?text=${text}`;
};

export const contentEs: SiteContent = {
  metadata: {
    title: "Nacho Mas Design | Portfolio de producto, 3D y diseno visual",
    description:
      "Web portfolio de Nacho Mas Design: diseno de producto, modelado 3D y direccion visual para marcas contemporaneas."
  },
  nav: {
    brand: "Nacho Mas Design",
    links: [
      { label: "Home", href: "/" },
      { label: "About", href: "/#sobre-mi" },
      { label: "Works", href: "/works" }
    ],
    copyEmail: "Copy Email",
    contactWhatsapp: "Contact / WhatsApp"
  },
  hero: {
    label: "Estudio creativo independiente",
    marqueeText: "NACHOMASDESIGN",
    paragraph:
      "Disenador de producto, artista 3D y disenador visual. Desarrollo imagen de producto y narrativa visual para marcas que buscan una direccion clara y contemporanea.",
    disciplines: ["Modelado 3D", "Diseno de producto", "Diseno grafico"],
    media: {
      type: "video",
      videoSrc: "/assets/video-01.mp4",
      imageSrc: "/assets/hero-01.png",
      posterSrc: "/assets/hero-01.png",
      fallbackColor: "#0d0d0d",
      overlayOpacity: 0.4
    }
  },
  works: {
    homeHeading: "Recent Works",
    homeIntro: "Selecciones recientes con enfoque en producto, CGI y direccion visual.",
    pageHeading: "Works",
    pageIntro: "Listado completo de proyectos de portfolio, cada uno con su pagina de detalle."
  },
  aboutStudio: {
    heading: "Sobre mi",
    paragraphs: [
      "Nacho Mas Design es un estudio independiente centrado en producto, CGI y comunicacion visual.",
      "Cada proyecto combina proceso de diseno, modelado 3D y direccion visual para convertir ideas en piezas claras, potentes y comercialmente utiles.",
      "Trabajo con marcas y equipos que valoran el detalle, la coherencia formal y la ejecucion visual de alto nivel."
    ]
  },
  expertise: {
    heading: "Especialidades",
    intro: "Capacidades del estudio para marcas, agencias y equipos que necesitan imagen de producto con criterio.",
    items: [
      "Modelado 3D",
      "Diseno de producto",
      "Visualizacion de producto",
      "Direccion de arte",
      "Branding",
      "Identidad visual",
      "Packaging",
      "CGI / Render"
    ]
  },
  gallery: {
    heading: "Galeria visual",
    images: [
      { src: "/assets/work-01.png", alt: "Lampara blanca junto a sofa azul" },
      { src: "/assets/work-02.png", alt: "Interior minimal frente al mar" },
      { src: "/assets/work-03.png", alt: "Pabellon organico en playa exterior" },
      { src: "/assets/gallery-04.png", alt: "Interior de pabellon organico" },
      { src: "/assets/gallery-05.png", alt: "Arquitectura minimal sobre el agua" }
    ]
  },
  contact: {
    heading: "Contacto",
    intro: "Si tienes un proyecto de producto, 3D o direccion visual, escribeme y lo vemos.",
    email: "hola@nachomasdesign.com",
    contactLabel: "Enviar email",
    copyEmail: "Copiar email",
    whatsappLabel: "Contactar por WhatsApp",
    socials: [
      { label: "Behance", href: "https://www.behance.net/ignaciomas1" },
      {
        label: "LinkedIn",
        href: "https://www.linkedin.com/in/nacho-mas-294586273?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app"
      }
    ]
  },
  footer: {
    brandLine: "Nacho Mas Design",
    copyright: "© 2026 Nacho Mas Design. Todos los derechos reservados."
  }
};

export const getContentByLocale = (locale: string = siteConfig.locale): SiteContent => {
  if (locale === "es") return contentEs;
  return contentEs;
};
