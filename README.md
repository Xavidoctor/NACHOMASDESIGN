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
NEXT_PUBLIC_WHATSAPP_NUMBER=34123456789
NEXT_PUBLIC_SITE_URL=https://nachomasdesign.com
```

Notas:
- `NEXT_PUBLIC_WHATSAPP_NUMBER` debe ir en formato internacional sin `+` ni espacios.
- El mensaje precargado de WhatsApp se edita en `lib/constants.ts`.
- El email que recibe formularios se configura en el admin (`Ajustes > Panel admin`), no en código.
- Si no hay valor configurado, el sistema usa por defecto `ignaciomasgomis@gmail.com`.
- Variables opcionales para consumo por plataformas:
  - `VERCEL_API_TOKEN`
  - `VERCEL_PROJECT_ID`
  - `VERCEL_TEAM_ID`
  - `SUPABASE_MANAGEMENT_TOKEN`
  - `SUPABASE_PROJECT_REF`
  - `CLOUDFLARE_API_TOKEN`
  - `USAGE_SYNC_CRON_SECRET` (o `CRON_SECRET` en Vercel) para sync automática segura

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
- Anti-spam y robustez:
  - honeypot (`website`)
  - rate limit basico por IP
  - sanitizacion de campos
  - guardado de lead antes del envio de email
  - estado de notificacion persistido (`enviado/error/omitido`)
  - mensaje minimo (`CONTACT_FORM_MIN_MESSAGE`)

## Dashboard admin profesional
- Ruta principal: `/admin`
- Periodos: `7d`, `30d`, `6m`, `12m`
- Bloques:
  - resumen de negocio
  - evolucion temporal
  - trafico/top contenidos
  - rendimiento (estado simplificado)
  - consumo por plataforma (Vercel, Supabase, Cloudflare R2, Email)
  - alertas de limites
- Ayuda contextual:
  - tooltips `?`
  - modal explicativo (que es / por que importa / cuando preocuparse / que hacer)
  - guia del panel: `/admin/guia`
- Modo de lectura:
  - `Modo basico`
  - `Modo avanzado`
  - preferencia persistida en navegador

## Sincronizacion de consumo
- Desde `Ajustes > Panel admin` se puede lanzar `Sincronizar consumos ahora`.
- Endpoint interno: `POST /api/admin/usage/sync`
- Guarda snapshots en `platform_usage_snapshots` y alertas en `platform_alerts`.
- Ruta para cron segura: `GET /api/admin/usage/cron` (requiere `Authorization: Bearer <USAGE_SYNC_CRON_SECRET>`).
- Si despliegas en Vercel, existe `vercel.json` con cron diaria para esa ruta.
- Panel de salud operativa en ajustes:
  - ultima sync por plataforma
  - estado de credenciales
  - ultimo error detectado
  - estado de cron

### Fuentes de métricas de consumo
- `cloudflare_r2`: lectura real del bucket (bytes y objetos) cuando la API S3 de R2 responde.
- `vercel`: deployments reales de los últimos 30 días si hay credenciales Vercel.
- `supabase`: métricas reales vía SQL/RPC (tamaño DB, storage, objetos storage, MAU estimado); egress por management API si está disponible.
- `email`: métricas internas reales desde `contact_leads`.

### Rollups de analytics
- Se refrescan con `refresh_analytics_rollups`.
- Tabla diaria: `analytics_daily_rollups`.
- Tabla mensual: `analytics_monthly_rollups`.
- El dashboard usa rollups para periodos largos (`6m` y `12m`) y fallback a eventos raw cuando falten agregados.

## Validacion final recomendada
1. Entra a `/admin/settings` > `Panel admin`.
2. Pulsa `Sincronizar consumos ahora`.
3. Pulsa `Refrescar salud operativa` y verifica:
   - cron configurado o pendiente
   - estado por plataforma
   - credenciales faltantes si aplica
   - ultimo error si existe
4. Entra a `/admin` y valida `7d`, `30d`, `6m`, `12m`.
5. Comprueba que las tarjetas distinguen dato real / estimado / manual.

## Produccion
- SEO base: metadata, Open Graph, `sitemap.xml`, `robots.txt`
- Estructura semantica y responsive para movil/tablet/desktop
- Componentes modulares y reutilizables
# NACHOMASDESIGN
