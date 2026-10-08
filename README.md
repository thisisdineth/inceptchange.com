# InceptChange

Photography and videography studio website, built with Svelte 5, SvelteKit, TypeScript and a Node.js server. White editorial design with teal, peach, rose and lime drawn from the existing logo. The homepage opens with a full-width photograph and overlaid logo, a sticky navbar, scroll-linked image movement, and section entrance animations. Reduced-motion preferences disable these effects.

## Run

```sh
npm install
npm run dev
```

Open http://localhost:5173. Validate with `npm run check` and `npm run build`. With the dev server running, `python3 scripts/verify.py` checks all routes, server-rendered SEO metadata, structured data, sitemap and 404 handling.

## Production

```sh
npm run build
ORIGIN=https://www.inceptchange.com node build
```

The Node adapter defaults to port 3000. Serve behind an HTTPS reverse proxy. No database is required for the current portfolio.

## Content

`src/lib/content.json` contains galleries, contacts and image URLs imported from the existing public website. `src/lib/data.ts` defines service copy. Cloudinary transformations deliver resized, compressed images. The contact form prepares a mailto enquiry; it does not send or store enquiries on the server. Configure an email provider and a SvelteKit server action to support direct delivery.

## SEO and launch

Pages use server rendering, unique titles and descriptions, canonical URLs, Open Graph tags and ProfessionalService JSON-LD. `/sitemap.xml` includes all portfolio and service pages. `/robots.txt` references the sitemap.

Before replacing the existing site, confirm the business address (the old site’s about copy and footer describe different locations), approve page copy and image crops, map existing indexed URLs to redirects, and verify HTTPS and canonical host redirects. Submit the sitemap to Search Console and measure mobile Core Web Vitals after deploying. Add verified video URLs and metadata before using VideoObject schema. No rankings or Lighthouse score are claimed.

Browser visual testing could not be completed in the development session because no browser was connected. Desktop/mobile layout and form interactions should be reviewed in a browser before publication.
