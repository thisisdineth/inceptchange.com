# InceptChange

Photography, film and creative studio website built with Svelte 5/SvelteKit and a Go enquiry service. Supabase provides private admin authentication, visitor analytics and booking records. Gemini streams guided questions; Resend sends branded studio/customer emails.

Production: https://www.inceptchange.com. Private admin: https://www.inceptchange.com/admin/login.

## Start with Docker

Install Docker Desktop (Windows/macOS) or Docker Engine with Compose (Linux). Copy the ignored studio photos and showreel into static/images before building. From the repository root, import existing private settings:

```sh
python3 scripts/docker_env.py
docker compose -f compose.yaml -f compose.local.yaml up --build -d --wait
```

On Windows use py -3 instead of python3. Without existing .env files, copy docker/web.env.example to docker/web.env and docker/api.env.example to docker/api.env, then configure them privately. Open http://localhost:5173. Application images include their own Node/Go runtimes.

## Documentation

| Guide | Contents |
| --- | --- |
| [Docker operations](docs/DOCKER.md) | Architecture, setup, production deploy, health, logs, backups and rollback |
| [Local startup and commands](start.md) | Native Windows/macOS/Linux development, Git commands and legacy deployment |
| [Admin and Supabase](docs/ADMIN.md) | Database migrations, authentication, booking statuses and analytics |
| [Server record](docs/SERVER.md) | VPS details, deployment history and legacy paths |
| [Site map](SITE_MAP.md) | Pages, navigation and SEO |

## Application behavior

- Public portfolio, service pages, studio slideshow and booking calendar.
- Studio enquiries use IdeaBay as the venue and skip the location question; general projects collect their location.
- All configured enquiries are saved in Supabase before email delivery, with request IDs guarding against duplicate booking records.
- Admins can review, edit, confirm, cancel, complete and delete bookings. Only studio reservations block studio availability.
- Admin routes require authenticated allowlisted accounts and send noindex/private-cache headers.
- Monthly visits count anonymous browser sessions in Asia/Colombo time; recording starts after database configuration.
- Studio photos generate responsive, content-hashed WebP variants before builds. The slideshow loads images gradually.
- Gemini outages switch to standard guided questions. Both studio and customer receive branded HTML/plain-text emails; partial customer-copy failure is reported truthfully.

Supabase, Gemini and Resend are external services. Their keys stay in private runtime files; no secrets are baked into images or committed. Provider acceptance is not a guarantee of email inbox delivery. Bookings are requests until the team confirms availability.

## Native development and checks

```sh
npm ci
npm run dev
```

In a second terminal, export backend/.env and run go run . inside backend. See start.md for PowerShell equivalents.

```sh
npm run check
npm run build
(cd backend && go test ./... && go vet ./...)
python3 scripts/test_admin.py
```

The mock admin test uses macOS/Linux process management. Live database/provider verification is separate. Docker builds run the frontend checks and Go tests/vet as part of producing production images.

## Content and deployments

src/lib/content.json contains portfolio/gallery/contact content, src/lib/data.ts contains service copy, and the ignored static/images/studio folder contains source studio photos. Keep those files available to the Docker build. npm run images:optimize generates responsive variants and their manifest; originals remain intact locally.

A GitHub push does not deploy the VPS automatically. Follow docs/DOCKER.md to upload source, build the release and replace the healthy containers. Keep certificate volumes and a verified rollback image/configuration backup.
