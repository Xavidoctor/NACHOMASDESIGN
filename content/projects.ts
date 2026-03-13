import type { PortfolioProject } from "@/types/content";

export const projects: PortfolioProject[] = [
  {
    slug: "estudio-aurea",
    title: "Estudio Aurea",
    category: "Visualizacion de producto",
    shortDescription: "Direccion visual para una pieza escultorica de iluminacion en entorno de estudio.",
    fullDescription:
      "Proyecto de visualizacion orientado a presentar un objeto de iluminacion como pieza de autor. Se trabajo composicion, escala y materiales para construir una narrativa limpia, elegante y comercialmente util.",
    coverImage: "/assets/work-01.png",
    heroImage: "/assets/work-01.png",
    gallery: ["/assets/work-01.png", "/assets/work-02.png", "/assets/renders/ARCH4.png"],
    year: "2026",
    services: ["Modelado 3D", "Direccion de arte", "Render de producto"],
    featured: true
  },
  {
    slug: "marco-costero",
    title: "Marco Costero",
    category: "Interiorismo 3D",
    shortDescription: "Escena interior con composicion limpia, horizonte abierto y atmosfera contemplativa.",
    fullDescription:
      "Desarrollo de un interior minimalista para comunicar calma material y precision formal. El trabajo prioriza el ritmo espacial, la luz ambiental y la coherencia cromatica para reforzar una lectura premium.",
    coverImage: "/assets/work-02.png",
    heroImage: "/assets/work-02.png",
    gallery: ["/assets/work-02.png", "/assets/renders/ARCH4.png", "/assets/work-01.png"],
    year: "2026",
    services: ["Diseno de producto", "Visualizacion arquitectonica", "Postproduccion"],
    featured: true
  },
  {
    slug: "pabellon-organico",
    title: "Pabellon Organico",
    category: "Concepto espacial",
    shortDescription: "Propuesta arquitectonica con lenguaje organico y enfoque en materialidad.",
    fullDescription:
      "Concepto de pabellon para entorno litoral con una geometria fluida que integra refugio, sombra y recorrido. El proyecto combina exploracion formal, texturas y visuales de uso para validar la propuesta.",
    coverImage: "/assets/work-03.png",
    heroImage: "/assets/work-03.png",
    gallery: ["/assets/work-03.png", "/assets/renders/ARCH3.png", "/assets/work-02.png"],
    year: "2026",
    services: ["Concept design", "Modelado 3D", "Visualizacion"],
    featured: true
  },
  {
    slug: "interior-organico",
    title: "Interior Organico",
    category: "CGI / Render",
    shortDescription: "Vision interior para presentar materialidad y volumen en clave cinematografica.",
    fullDescription:
      "Serie de renders para explorar una arquitectura organica desde dentro. La direccion visual se centra en contraste, profundidad y atmosfera para construir una identidad memorable.",
    coverImage: "/assets/renders/ARCH3.png",
    heroImage: "/assets/renders/ARCH3.png",
    gallery: ["/assets/renders/ARCH3.png", "/assets/work-03.png", "/assets/renders/ARCH4.png"],
    year: "2025",
    services: ["Direccion de arte", "CGI", "Render"],
    featured: false
  },
  {
    slug: "arquitectura-sobre-agua",
    title: "Arquitectura sobre Agua",
    category: "Direccion visual",
    shortDescription: "Composicion minimalista para comunicar precision y equilibrio espacial.",
    fullDescription:
      "Proyecto conceptual orientado a marcas de arquitectura y mobiliario. Se trabajaron vistas aereas, proporciones y reflejos para reforzar una narrativa de sofisticacion tecnica.",
    coverImage: "/assets/renders/ARCH4.png",
    heroImage: "/assets/renders/ARCH4.png",
    gallery: ["/assets/renders/ARCH4.png", "/assets/work-02.png", "/assets/work-01.png"],
    year: "2025",
    services: ["Visualizacion de conceptos", "Direccion de arte", "Composicion"],
    featured: false
  }
];

export const featuredProjects = projects.filter((project) => project.featured);

export const getProjectBySlug = (slug: string) => projects.find((project) => project.slug === slug);
