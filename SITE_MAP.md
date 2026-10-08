# Site structure and SEO

## Homepage order

| Order | Section | Link | Navbar |
| --- | --- | --- | --- |
| 1 | Full-screen slideshow | `/#home` | Logo → homepage |
| 2 | Photography / Videography / Documentary / Experiences marquee | Below slideshow | — |
| 3 | Selected work and project galleries | `/#work` | Our work |
| 4 | Years, projects, reach and clients | Below selected work | — |
| 5 | Four service cards | `/#services` | What we do |
| 6 | Documentary feature | `/#documentary` | Linked through Documentary service |
| 7 | About InceptChange with scroll-filled copy | `/#about` | The studio |
| 8 | Studio booking calendar and image slideshow | `/#studio-booking` | Studio booking |
| 9 | Contact details, navigation, marquee and copyright | Footer | Let’s talk → `/contact` |

Navbar links follow this order. Section links return to the relevant homepage anchor from other pages; the active section highlights on scroll. “All our work” and footer “Full portfolio” link to `/works`. The mobile menu closes on selection/navigation or Escape.

## Pages

- `/works`: portfolio index, linking to all three project galleries.
- `/works/giga-field-visit`
- `/works/women-empowerment-program`
- `/works/weather-kids-program`
- `/services/photography`
- `/services/videography`
- `/services/documentary`
- `/services/event-management`
- `/contact`: enquiry form. Studio booking passes the preferred date into the message. Service enquiry links pass the service choice. Sending still uses the visitor’s email app.

## SEO implementation

All ten pages render their content and metadata on the server. Each has a unique title/description, a production canonical URL without query parameters, Open Graph and Twitter metadata including image descriptions. Trailing slash URLs normalize to the same route.

Structured data includes the studio, website, page information, breadcrumbs, service descriptions, portfolio list and project creative works. Only information present on the website is included; no invented reviews, ratings, prices or video metadata. Visible breadcrumbs and footer links connect the content.

The sitemap includes all pages and their photography images, with XML escaping and cache headers. Robots points to the sitemap. Missing pages return HTTP 404 and a `noindex` directive. Connection hints warm the image and font providers.

Validation: `npm run check`, `npm run build`, and `python3 scripts/audit_site.py` (with the development server running). The audit checks all ten pages, twenty distinct internal links, section targets, metadata, JSON-LD, image sitemap, query-string canonicals and missing-page responses. This is a code/HTTP audit, not a Lighthouse run or Google Rich Results Test.

## Remaining launch work

Confirm the business address: About describes Dharga Town; the imported footer address says Navinna/Maharagama. Current schema uses the footer address without inferring a locality or coordinates. Correct the content in `src/lib/content.json` and `src/lib/AboutStudio.svelte` once confirmed.

Before replacing the public site, configure HTTPS/canonical-host redirects, map any changed indexed routes, submit the sitemap in Search Console, validate structured data using Google’s Rich Results Test, and measure mobile Core Web Vitals on the deployed site. Check that Cloudinary assets are crawlable. Studio gallery images currently use existing behind-the-scenes photos; replace `studioGallery` entries with actual studio interiors if desired.

Google references: [structured data](https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data), [image sitemaps](https://developers.google.com/search/docs/crawling-indexing/sitemaps/image-sitemaps). Search rankings and rich result appearance are not guaranteed by these changes.
