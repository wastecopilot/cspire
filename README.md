# C Spire Authorized Retailer — Static Site

Plain HTML/CSS/JS build of the C Spire Authorized Retailer landing page. No framework or build step is required to run it.

## Structure

```
index.html            Landing page
legal/*.html          8 legal pages
assets/css/site.css   Styles, including all animations and effects
assets/js/site.js     Interactions: reveals, parallax, 3D tilt, magnetic buttons,
                      header, mobile menu, ZIP checker, FAQ
assets/js/lenis.min.js  Smooth scrolling
assets/fonts/         Self-hosted web fonts
assets/img/           Optimized WebP photography (+ 800w / 1200w variants)
vercel.json           Vercel headers and caching
```

## Run locally

Open `index.html` directly in a browser, or serve the folder:

```bash
npx http-server . -p 3000
```

## Deploy to Vercel

1. Import this repository in Vercel.
2. Framework preset: **Other**. Leave the build command empty and set the output directory to the repository root (this is already set in `vercel.json`).
3. Deploy.

## Updating content

These files are generated. Prices, plans, and copy are maintained in the source project's `lib/content.ts`, then regenerated with `npm run export:html`. Avoid editing the HTML by hand, because the next export will overwrite it.

**Before launch:** replace the placeholder sales number `(XXX) XXX-XXXX` / `tel:+10000000000` in the source project and re-export.
