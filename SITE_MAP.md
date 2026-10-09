# Site structure

## Homepage

1. Hero photograph slideshow (`/#home`).
2. Photography, videography, documentary and experiences marquee.
3. Selected work (`/#work`) linking to `/works` and three project galleries.
4. Our story in numbers.
5. Partner logo grid from `static/images/partner logos/`.
6. Service cards (`/#services`).
7. Showreel (`/#documentary`), reached by the navbar's “Why we?” link.
8. About InceptChange (`/#about`).
9. IdeaBay studio gallery and booking calendar (`/#studio-booking`).
10. Contact details and footer navigation, including the services and studio hubs.

## Public pages

| URL | Purpose |
| --- | --- |
| `/` | Studio introduction, work, services, showreel and calendar |
| `/services` | Creative services hub |
| `/services/photography` | Portrait, event and brand photography guidance |
| `/services/videography` | Brand films, event coverage and production guidance |
| `/services/documentary` | Documentary photography and filmmaking guidance |
| `/services/event-management` | Planning, coordination and visual coverage guidance |
| `/studio` | IdeaBay in Maharagama, photographs, session guidance and calendar |
| `/works` | Portfolio index |
| `/works/giga-field-visit` | Project photograph gallery |
| `/works/women-empowerment-program` | Project photograph gallery |
| `/works/weather-kids-program` | Project photograph gallery |
| `/contact` | Guided enquiry; records bookings and sends team/customer emails |

Studio calendar links pass the chosen date and studio flag into the enquiry flow. Studio enquiries use IdeaBay as their venue. Other enquiries collect their project location. Requests require team confirmation.

## Private and technical routes

- `/admin/login`, `/admin`: authenticated administration, noindex, private caching, excluded from public navigation and sitemap.
- `/api/`: enquiry, availability, visits and protected admin endpoints; excluded from crawling.
- `/healthz`: operational health check, excluded from crawling.
- `/sitemap.xml`: twelve public canonical pages plus image URLs.
- `/robots.txt`: public crawl access and private route exclusions.
- `/indexnow-key.txt`: public domain verification token for IndexNow notifications.

## Business facts and search operations

Current studio: No. 21/2, Rajamaha Vihara Road, Navinna, Maharagama, Sri Lanka. InceptChange started in Dharga Town and takes projects throughout Sri Lanka. The business owner confirmed these facts on October 9, 2026.

Public pages render metadata and JSON-LD on the server. Titles and descriptions are unique; canonical URLs exclude enquiry parameters. Structured data covers the studio, website, breadcrumbs, service pages, visible FAQs and portfolio. Missing routes return a noindexed HTTP 404. Search and AI visibility work, ownership verification, testing and measurement are documented in [docs/SEO.md](docs/SEO.md).

Run `python3 scripts/audit_site.py` while local development is running, or supply the production URL to audit the deployed pages.
