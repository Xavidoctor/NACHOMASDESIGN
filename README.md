# Nacho Mas Design Portfolio

Web portfolio profesional creada con Next.js (App Router), TypeScript, Tailwind CSS y Motion for React.

## Stack
- Next.js App Router
- TypeScript
- Tailwind CSS
- Motion for React (`motion`)
- Resend (formulario de contacto por email)
- Netlify listo para deploy

## Estructura principal
- `app/`: rutas, layout global, SEO tecnico y API route `/api/contact`
- `components/`: componentes reutilizables por seccion
- `content/`: contenido editable (incluye proyectos demo)
- `lib/`: constantes, utilidades y esquema de validacion
- `public/projects/`: imagenes demo de proyectos
- `netlify.toml`: configuracion de build para Netlify

## 1) Instalar dependencias
```bash
npm install
```

## 2) Variables de entorno
Crea `.env.local` a partir de `.env.example` y define:

```bash
RESEND_API_KEY=tu_api_key
CONTACT_TO_EMAIL=tu_correo_personal@dominio.com
NEXT_PUBLIC_WHATSAPP_NUMBER=34123456789
NEXT_PUBLIC_SITE_URL=https://nachomasdesign.com
```

Notas:
- `NEXT_PUBLIC_WHATSAPP_NUMBER` debe ir en formato internacional sin `+` ni espacios.
- El mensaje precargado de WhatsApp se edita en `lib/constants.ts`.
- El email que recibe formularios se configura en `CONTACT_TO_EMAIL`.

## 3) Ejecutar en local
```bash
npm run dev
```

Abre `http://localhost:3000`.

## 4) Build de produccion
```bash
npm run build
npm run start
```

## 5) Desplegar en Netlify
1. Sube este repo a GitHub/GitLab/Bitbucket.
2. En Netlify, crea un nuevo sitio desde el repositorio.
3. Netlify detecta `netlify.toml` y usara:
   - Build command: `npm run build`
4. En Netlify > Site configuration > Environment variables, agrega:
   - `RESEND_API_KEY`
   - `CONTACT_TO_EMAIL`
   - `NEXT_PUBLIC_WHATSAPP_NUMBER`
   - `NEXT_PUBLIC_SITE_URL`
5. Lanza el deploy.

## 6) Conectar dominio `nachomasdesign.com`
1. En Netlify > Domain management > Add domain, agrega `nachomasdesign.com`.
2. Configura DNS en tu proveedor de dominio:
   - Registro `A` para raiz (`@`) apuntando a la IP que Netlify indique.
   - Registro `CNAME` para `www` apuntando al subdominio Netlify asignado.
3. Espera propagacion DNS.
4. Activa HTTPS en Netlify (Let\'s Encrypt se configura automaticamente).

## Edicion rapida de contenido
- Texto global y secciones: `content/site-content.ts`
- Proyectos destacados (6 demos): `content/projects.ts`
- Numero y mensaje de WhatsApp: `lib/constants.ts`

## Formulario y anti-spam
- Endpoint server-side: `app/api/contact/route.ts`
- Validacion frontend + backend: `lib/contact-schema.ts`
- Anti-spam basico:
  - honeypot (`website`)
  - mensaje minimo (`CONTACT_FORM_MIN_MESSAGE`)

## Produccion
- SEO base: metadata, Open Graph, `sitemap.xml`, `robots.txt`
- Estructura semantica y responsive para movil/tablet/desktop
- Componentes modulares y reutilizables
