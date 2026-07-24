# Previews por rama (Cloudflare Pages)

`main` se publica en GitHub Pages (`.github/workflows/deploy.yml`) — eso no cambia.
Este documento agrega **previews automáticos por rama y por PR** con Cloudflare
Pages, para poder ver un cambio en vivo **antes de fusionarlo**.

Con esto, cada push a cualquier rama y cada PR reciben su propia URL en vivo, del
tipo:

```
https://<rama>.<proyecto>.pages.dev      ← alias por rama (p. ej. claude-handoff-review-842qw9.sp-prototipo.pages.dev)
https://<hash>.<proyecto>.pages.dev      ← una por cada build (deploy)
```

Cloudflare además deja el link del preview como comentario en el PR.

## El detalle que importa: el base path

- **GitHub Pages** sirve el sitio bajo `/sp-prototipo/`, así que su build usa
  `NEXT_PUBLIC_BASE_PATH=/sp-prototipo` (los assets se piden con ese prefijo).
- **Cloudflare Pages** sirve desde la **raíz** de `*.pages.dev`, así que el base
  path tiene que quedar **vacío**. El `next.config.mjs` ya hace
  `basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''`, con lo cual **basta con
  NO definir esa variable** en Cloudflare y todo resuelve bien.

> Regla: en Cloudflare **no** setees `NEXT_PUBLIC_BASE_PATH`. Si la seteás a
> `/sp-prototipo`, los assets van a dar 404 (pide `/sp-prototipo/…` sobre un
> dominio que sirve desde la raíz).

## Conectarlo (una sola vez, ~5 min — lo hace el dueño de la cuenta)

1. Entrá a **dash.cloudflare.com** → **Workers & Pages** → **Create** →
   **Pages** → **Connect to Git**.
2. Autorizá GitHub y elegí el repo **`nelargon/sp-prototipo`**.
3. Configuración de build:
   - **Framework preset:** None (o "Next.js (Static HTML Export)" si aparece).
   - **Build command:** `npm run build`
   - **Build output directory:** `out`
   - **Environment variables:** *ninguna* (en particular, **no** agregues
     `NEXT_PUBLIC_BASE_PATH`). El `.node-version` del repo fija Node 20.
4. **Save and Deploy.** Cloudflare hace el primer build de `main` (la producción
   queda en `<proyecto>.pages.dev`; la producción "de verdad" sigue siendo
   GitHub Pages — esto es solo para previsualizar).
5. De ahí en más es **automático**: cada rama y cada PR generan su preview y su
   URL, sin volver a tocar nada.

## Cómo ver el preview de un PR

- Abrí el PR: Cloudflare deja un comentario con el link del preview.
- O entrá al proyecto en Cloudflare → pestaña **Deployments** → buscá el deploy
  de tu rama y abrí su URL.

## Notas

- Es **gratis** para este caso (sitio estático, export de Next).
- El build es idéntico al de CI/producción salvo el base path (ver arriba).
- La guía (`public/guia/`) se genera en el `prebuild` (`npm run build` corre
  `scripts/sync-guia.mjs` antes), así que también entra en el preview.
