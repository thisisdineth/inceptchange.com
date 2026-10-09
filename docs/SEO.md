# Search and AI discovery

## Implemented

The site renders public content on the server, so crawlers receive text, links, metadata and JSON-LD without requiring JavaScript. Twelve canonical public pages are included in the XML image sitemap. Public pages have unique titles and descriptions, absolute social preview images, breadcrumbs and generous snippet/image/video preview permissions. Administration remains authenticated, noindexed and excluded from the sitemap.

The business identity is InceptChange, with IdeaBay as the studio space. The current address is No. 21/2, Rajamaha Vihara Road, Navinna, Maharagama, Sri Lanka. The business started in Dharga Town and takes projects throughout Sri Lanka. Keep these facts consistent across the website, social profiles, directories and Google Business Profile.

The `/services` hub links to four substantive service pages. Each explains suitable projects, brief preparation and frequently asked questions. `/studio` provides a searchable IdeaBay destination with photographs, address, booking guidance and calendar. The footer links to both hubs. Structured data describes the visible business, website, pages, services and FAQs. FAQ markup does not guarantee a rich result; Google restricts FAQ rich results to eligible sites.

`robots.txt` permits public content for crawlers, including Googlebot, Bingbot and OAI-SearchBot through the wildcard rule. Admin and API paths are excluded. Cloudflare rules can independently block bots: inspect Security Events and allow verified search crawlers through appropriate rules. Do not disable security globally. A successful request using a bot user agent is a routing check, not proof that a real crawler's IP is allowed.

## Required owner setup

1. Add a **Domain property** for `inceptchange.com` in [Google Search Console](https://search.google.com/search-console). Copy the supplied DNS TXT verification record into Cloudflare and verify. Submit `https://www.inceptchange.com/sitemap.xml`. Inspect `/`, `/services`, `/studio` and the four service pages; request indexing when appropriate.
2. Add the site to [Bing Webmaster Tools](https://www.bing.com/webmasters/), importing the verified Search Console property or following Bing's ownership verification. Submit the same sitemap. Review indexing and available AI performance reports.
3. Create or update the genuine [Google Business Profile](https://www.google.com/business/). Use the real studio address, real business category, phone, hours, website and actual service area. Complete the verification requested by Google. Avoid duplicate profiles, invented locations or keyword-stuffed business names.
4. Add real studio photographs, complete business details and request honest reviews from actual customers. Keep social profiles linked to the canonical website. Obtain permission before publishing client names, endorsements or project details.
5. In Cloudflare, inspect crawler access controls, AI crawler settings, managed robots rules and security challenges. Search visibility and model training are different permissions. OAI-SearchBot handles OpenAI search discovery; allowing a training crawler is not a requirement for it.

These ownership steps require the account owner's Google/Bing/Cloudflare access; deploying code does not complete verification. Search appearance, position, indexing and AI citations are decided by external systems and cannot be guaranteed.

## Content work with the largest remaining value

Publish detailed, permission-approved project case studies describing the actual brief, audience, locations, creative decisions and deliverables. Add measurable results only when supported by evidence. Replace generic photo captions with accurate descriptions of each photograph. Publish equipment, studio capacity, accessibility, session inclusions and pricing only after the team confirms them. Add accurate Sinhala/Tamil translations if those audiences need them, using separate language URLs and correct hreflang references; do not claim untranslated pages are multilingual.

Prioritise real questions about documentary coverage, corporate event photography, brand films and studio sessions. Avoid cloned city pages, fabricated reviews, bought links, hidden keywords and claims that cannot be verified. Establish legitimate mentions through clients, partners and relevant industry directories.

## Measurement and maintenance

Record the first 28 days of Search Console impressions, clicks, search terms, indexed pages and mobile Core Web Vitals. Compare the next 28 days by page and query. In Bing, inspect crawl/index reports and AI reports when available. Track qualified booking enquiries alongside traffic; admin site visits alone do not measure search rankings or AI citations. Test representative real customer questions periodically, recording the engine, date, query and cited source.

Run:

```sh
npm install
npm run check
npm run build
# While the local dev server is running:
python3 scripts/audit_site.py http://localhost:5173
# After deployment:
python3 scripts/audit_site.py https://www.inceptchange.com
```

The rendered audit checks all sitemap pages, unique metadata, absolute image previews, JSON-LD, internal links, anchors, query-string canonicalisation and noindexed 404s. Also use [Rich Results Test](https://search.google.com/test/rich-results), [Schema Validator](https://validator.schema.org/) and [PageSpeed Insights](https://pagespeed.web.dev/). The script validates JSON and site relationships, not every schema vocabulary rule or Google's eligibility decisions.

Keep sitemap routes and the audit's expected route count in sync whenever adding a page. Do not invent `lastmod` timestamps to suggest freshness. Optimised studio images use responsive WebP derivatives; Cloudinary images use automatic format/quality and responsive widths. Keep the first visible hero image high priority and below-fold images lazy.

## Authoritative guidance

- [Google AI features and websites](https://developers.google.com/search/docs/appearance/ai-features): standard SEO applies; there is no special AI schema or required AI text file.
- [Google local business structured data](https://developers.google.com/search/docs/appearance/structured-data/local-business).
- [Google FAQ structured data](https://developers.google.com/search/docs/appearance/structured-data/faqpage).
- [Bing Webmaster Guidelines](https://www.bing.com/webmasters/help/bing-webmaster-guidelines-30fba23a).
- [OpenAI crawler reference](https://developers.openai.com/api/docs/bots).

An `llms.txt` file is not required by Google and is not a ranking shortcut. We focus on accessible pages, accurate facts and useful text.

## IndexNow update notifications

A public verification key is hosted at `/indexnow-key.txt`. It is intentionally public and grants no application/database access. After deploying changed pages, notify participating search engines:

```sh
# Preview a selected set of changed paths:
python3 scripts/submit_indexnow.py /studio /services
# Submit that set after publication:
python3 scripts/submit_indexnow.py --submit /studio /services
# For a site-wide metadata change, submit all public sitemap pages:
python3 scripts/submit_indexnow.py --submit
```

The script verifies the live key, same-host canonical URLs, public paths and successful responses before submission. Do not repeatedly submit unchanged pages. HTTP 200/202 means the notification was accepted or queued for verification, not that a page was indexed. Follow [IndexNow documentation](https://www.indexnow.org/documentation); this is separate from Google's Search Console sitemap submission.

Fonts are linked directly from the HTML head with `display=swap`, avoiding a CSS `@import` discovery chain. Responsive page headings wrap on small screens.

## Deployment verification — October 9, 2026

The updated Docker deployment passed its health checks. The production rendered-page audit passed for all twelve public pages, 22 internal links, image sitemap, query-string canonicalisation and noindexed 404s. Googlebot, Bingbot and OAI-SearchBot user-agent requests returned HTTP 200 for the homepage and sitemap; this does not verify real crawler IP access. Cloudflare-generated email protection links are excluded from the application-route audit. IndexNow returned HTTP 202 for twelve updated URLs, meaning the submission was accepted for processing/verification, not indexing confirmation.

`npm run check` passed with zero errors; the existing showreel captions warning remains. The production build passed. Search Console, Bing ownership verification and Business Profile setup still require the owner's account access.
