# InceptChange

See [start.md](start.md) for Windows, macOS and Linux setup, local startup, Git commands and VPS deployment.

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

`src/lib/content.json` contains galleries, contacts and image URLs imported from the existing public website. `src/lib/data.ts` defines service copy. Cloudinary transformations deliver resized, compressed images. The contact page builds a guided brief using streamed Gemini questions. A private Go service sends the reviewed brief to inceptchange@gmail.com through Resend. Enquiries are not stored in a database.

## SEO and launch

Pages use server rendering, unique titles and descriptions, canonical URLs, Open Graph tags and ProfessionalService JSON-LD. `/sitemap.xml` includes all portfolio and service pages. `/robots.txt` references the sitemap.

Before replacing the existing site, confirm the business address (the old site’s about copy and footer describe different locations), approve page copy and image crops, map existing indexed URLs to redirects, and verify HTTPS and canonical host redirects. Submit the sitemap to Search Console and measure mobile Core Web Vitals after deploying. Add verified video URLs and metadata before using VideoObject schema. No rankings or Lighthouse score are claimed.

Browser visual testing could not be completed in the development session because no browser was connected. Desktop/mobile layout and form interactions should be reviewed in a browser before publication.

## Site structure and SEO audit

See [SITE_MAP.md](SITE_MAP.md) for homepage order, navigation mapping, page inventory, implemented SEO and deployment follow-up. Run `python3 scripts/audit_site.py` with the development server running to audit metadata, schemas, links and anchors.

## AI contact enquiries (Go backend)

1. Copy `.env.example` to `.env` for SvelteKit. Generate a long random `ENQUIRY_PROXY_SECRET` (for example, `openssl rand -hex 32`).
2. Copy `backend/.env.example` to `backend/.env`, fill in the same proxy secret, a Gemini API key and Resend credentials. Set `RESEND_FROM` to a sender on your verified Resend domain.
3. Start the private Go service in a second terminal:

```sh
cd backend
set -a
source .env
set +a
go run .
```

Then run `npm run dev` in the project root. Go 1.24 or newer is required. The backend uses the Gemini REST `streamGenerateContent` API with SSE; `GEMINI_MODEL` can be changed to a model available to your API key. The assistant starts streaming the first question when the contact page opens and tailors subsequent questions to the supplied brief.

Production: run the compiled Go service (`cd backend && go build -o enquiry .`) alongside the SvelteKit Node server. Supply the same private environment settings to both processes and set `ENQUIRY_BACKEND_URL` to the private Go service address. Keep the Go port private. Configure your HTTPS reverse proxy to preserve the public origin, disable response buffering for `/api/enquiry/question`, and allow at least 75 seconds for streaming. With adapter-node, configure trusted proxy/client-address settings for your deployment; only trust headers supplied by your proxy. The Go service limits each client to 40 requests per hour per process.

Resend sends the enquiry to the fixed recipient inceptchange@gmail.com, with the visitor's email as Reply-To. Set `RESEND_FROM` to a verified domain sender for production. The default onboarding@resend.dev sender is restricted by Resend to your account email. Success appears only after Resend accepts the email; failed requests retain the brief for retry.

Validate with `npm run check`, `npm run build`, and `cd backend && go test ./...`. Before launch, test a complete enquiry using real Gemini/Resend credentials and check receipt in the studio inbox. Retrying an ambiguously interrupted Resend request can deliver a duplicate; the current backend has no persistent submission queue or deduplication store.

## OVH production server

The site is deployed to Ubuntu 24.04 at `15.235.185.226`, with HTTPS for `inceptchange.com` and `www.inceptchange.com`. The root domain redirects to `https://www.inceptchange.com`. Node 22 runs the production build, and Go runs the enquiry API. Both services restart automatically through systemd; Nginx serves as the reverse proxy. Certbot renews HTTPS certificates automatically. The firewall allows ports 22, 80 and 443.

- Site files: `/opt/inceptchange/site`
- Go binary: `/opt/inceptchange/enquiry`
- Private settings: `/etc/inceptchange/site.env` and `/etc/inceptchange/enquiry.env`
- Services: `inceptchange-site`, `inceptchange-enquiry`, `nginx`
- Nginx configuration: `/etc/nginx/sites-available/inceptchange`

From the deployment Mac, SSH with `ssh -i ~/.ssh/inceptchange_vps ubuntu@15.235.185.226`. The initial OVH password required replacement; the new password is saved privately in `~/.ssh/inceptchange_vps_password`. Neither credentials nor private keys are in this repository.

For updates, build locally with `npm run build` and cross-compile Go using `cd backend && GOOS=linux GOARCH=amd64 go build -o enquiry .`. Upload the build and Go binary to the corresponding server paths, then restart the services with `sudo systemctl restart inceptchange-site inceptchange-enquiry`. The ignored MP4 must be uploaded separately to `build/client/images/ShowReel.mp4` after replacing a build.

Cloudflare can proxy the DNS records once SSL mode is set to Full (strict). Both @ and www must point to the VPS. Resend is configured with the verified sender `hello@inceptchange.com`; production submission acceptance was tested. Gemini quota remains separate from email delivery. See [server operations](docs/SERVER.md) for access, settings, updates, logs and recovery.

## Private admin and studio calendar

The `/admin` panel manages full-day IdeaBay bookings and displays monthly browser sessions and page views. It requires Supabase authentication and a private admin-email allowlist, and is excluded from public links, the sitemap and search indexing. Follow [Supabase and admin setup](docs/ADMIN.md) to run the database migration, create your admin user and set the environment variables. Real database verification and production activation are pending project configuration.
