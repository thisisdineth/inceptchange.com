# InceptChange server operations

**Current production uses Docker Compose.** The active project is `/opt/inceptchange/docker-project`; private configuration is in its `docker/web.env` and `docker/api.env`. Caddy handles HTTPS and certificate renewal. Use [docs/DOCKER.md](DOCKER.md) for current deployment commands. The systemd/Nginx paths below are retained history and emergency rollback details.

## Production

Website: https://www.inceptchange.com. The root domain redirects to www.

| Item | Configuration |
| --- | --- |
| Provider / OS | OVHcloud / Ubuntu 24.04 |
| VPS | vps-bb4c48b9.vps.ovh.ca |
| IPv4 | 15.235.185.226 |
| IPv6 | 2402:1f00:8000:800::2368 |
| SSH user | ubuntu |
| Frontend | SvelteKit production build, Node 22, 127.0.0.1:3000 |
| Backend | Go enquiry API, 127.0.0.1:8080 |
| Reverse proxy | Nginx, public ports 80 and 443 |
| Firewall | UFW: SSH, HTTP and HTTPS allowed |
| TLS | Let's Encrypt for root and www, certbot.timer renewal |

Cloudflare @ and www records point to the VPS. Orange proxy is supported with SSL/TLS **Full (strict)**. Do not use Flexible. Nginx disables proxy buffering and allows 90 seconds for streamed AI responses. Only the private backend accepts the shared proxy secret. Rate limiting currently counts the Nginx client address; with Cloudflare proxy enabled this may group visitors by Cloudflare edge address until trusted Cloudflare real-IP configuration is installed.

## Access and private settings

```sh
ssh -i ~/.ssh/inceptchange_vps ubuntu@15.235.185.226
```

The private SSH key and replacement first-login password are saved on the deployment Mac at `~/.ssh/inceptchange_vps` and `~/.ssh/inceptchange_vps_password`. Never commit either file.

| Path | Purpose |
| --- | --- |
| /opt/inceptchange/site | Website build and package metadata |
| /opt/inceptchange/enquiry | Linux Go executable |
| /etc/inceptchange/site.env | Frontend private environment, root-readable |
| /etc/inceptchange/enquiry.env | Gemini, Resend and shared proxy configuration, root-readable |
| /etc/nginx/sites-available/inceptchange | Redirect, TLS and reverse proxy settings |
| /etc/systemd/system/inceptchange-site.service | Website process |
| /etc/systemd/system/inceptchange-enquiry.service | Go API process |

Local `.env` contains the API keys and verified sender. `backend/.env` supplies the running Go process; keep its credentials and `ENQUIRY_PROXY_SECRET` synchronized with the root `.env`. Both are Git-ignored. Source the backend environment before starting Go; editing its file requires restarting the process.

Resend sender: `InceptChange <hello@inceptchange.com>`. Recipient: `inceptchange@gmail.com`. Customer email is Reply-To. The configured key has sending-only permission. Success means Resend accepted the request; it does not prove inbox placement. Check the Resend Emails dashboard for delivery/bounce events. This sender address does not automatically create a receiving mailbox.

## Status, logs and configuration changes

```sh
sudo systemctl status inceptchange-site inceptchange-enquiry nginx --no-pager
sudo journalctl -u inceptchange-site -u inceptchange-enquiry -n 100 --no-pager
sudo tail -n 100 /var/log/nginx/error.log
sudo systemctl list-timers certbot.timer
sudo nginx -t
```

Edit secrets with `sudoedit /etc/inceptchange/enquiry.env`, then `sudo systemctl restart inceptchange-enquiry`. After frontend environment changes, restart `inceptchange-site`. After Nginx changes, run `sudo nginx -t && sudo systemctl reload nginx`. Keep Node and Go ports private.

## Updating the website

On the deployment Mac:

```sh
npm run check
npm run build
(cd backend && go test ./... && go vet ./...)
(cd backend && GOOS=linux GOARCH=amd64 go build -o /tmp/inceptchange-enquiry .)
tar -czf /tmp/inceptchange-site.tar.gz build package.json package-lock.json
scp -i ~/.ssh/inceptchange_vps /tmp/inceptchange-site.tar.gz /tmp/inceptchange-enquiry ubuntu@15.235.185.226:/tmp/
```

On the server, back up the current files first, then deploy:

```sh
sudo cp -a /opt/inceptchange /opt/inceptchange-backup-$(date +%Y%m%d-%H%M%S)
sudo tar -xzf /tmp/inceptchange-site.tar.gz -C /opt/inceptchange/site
sudo install -m 755 /tmp/inceptchange-enquiry /opt/inceptchange/enquiry
cd /opt/inceptchange/site
sudo /usr/local/bin/npm ci --omit=dev --ignore-scripts
sudo chown -R root:root /opt/inceptchange/site
sudo find /opt/inceptchange/site -type d -exec chmod 755 {} +
sudo find /opt/inceptchange/site -type f -exec chmod 644 {} +
sudo systemctl restart inceptchange-site inceptchange-enquiry
rm /tmp/inceptchange-site.tar.gz /tmp/inceptchange-enquiry
```

Overlaying the build preserves the separately uploaded `build/client/images/ShowReel.mp4`; replacing the build directory requires uploading the ignored MP4 again. Keep a backup until the site and contact flow have passed checks. Overlay deployment may leave old hashed assets, which can be cleaned during a later maintenance window. Restore the backup and restart both services to roll back.

## Verification and remaining limits

On 8 October 2026, a test enquiry through the public production `/api/enquiry/submit` endpoint returned HTTP 200 with `sent: true` using the verified sender. A separate local Go submission was also tested. Test emails are explicitly labelled as integration tests.

Check the home, contact, portfolio, service pages, video, robots.txt and sitemap.xml after deployments. Test AI questions separately: the configured Gemini key previously returned HTTP 429 after exhausting its daily free-tier quota. Resend configuration does not resolve that limit; review Gemini billing/quota or wait for reset. Enquiries have no persistent queue or duplicate suppression; ambiguous retries can send twice.

## Contact resilience fix

If Gemini fails or reaches its quota, the question proxy returns standard guided questions as SSE and the page discloses that AI is unavailable. Visitors can continue through all fields and submit by Resend. The client also falls back when an intermediary returns HTML instead of SSE. Email responses are checked for JSON before parsing, so an HTML gateway error produces a readable retry message while preserving answers. Email success still requires an explicit `sent: true` response.

## Studio and customer enquiry emails

The Go service sends a branded HTML email with a plain-text alternative to the studio, then a separate confirmation containing the submitted brief to the customer. Customer replies go to inceptchange@gmail.com; studio replies go to the customer. All customer content is HTML-escaped. Each provider request has a 20-second timeout. The API returns sent=true once the studio email is accepted, and customerCopySent indicates acceptance of the customer copy. A customer-copy failure does not undo studio acceptance or prompt a duplicate enquiry retry; the UI explains the partial result. Both emails describe an enquiry, not a confirmed booking. Resend acceptance does not guarantee inbox delivery.

## Release verified — 9 October 2026

The latest frontend, Go email API, ignored studio photos and private Supabase settings were deployed. Backup: `/opt/inceptchange-release-backup-20261009-052308` (includes code, executable and private environment snapshots; root-only access). Live verification passed for public pages, video, studio images, noindex/protected admin routes, admin sign-in, real database dashboard, all-project enquiry recording, studio venue skipping, both branded email acceptances, completion and deletion. The temporary verification booking was deleted. Studio photos are included in the uploaded build; the previous showreel was preserved. Admin sign-in is at https://www.inceptchange.com/admin/login using the configured Supabase account. No admin password was included in server environment files.

## Gemini model update — 9 October 2026

The replacement API key is configured privately on the VPS and locally. Its project rejects gemini-2.5-flash with HTTP 404 and recommends gemini-3.8-flash. GEMINI_MODEL is now gemini-3.8-flash in backend/.env and /etc/inceptchange/enquiry.env. The live question endpoint returned a complete streamed Gemini response without fallback after the update. Refresh an already-open contact page to clear its previous fallback state.

## Studio image optimization — 9 October 2026

`npm run images:optimize` uses sharp to resize studio originals into 800px and 1400px WebP files at quality 78. It runs automatically before development and production builds and retains the original photos. The generated `src/lib/studio-images.json` maps originals to content-hashed URLs. Originals total 44.34 MB; all 1400px variants total 1.74 MB (96% smaller) and the 800px variants total 0.70 MB. The booking slideshow uses responsive sizes and requests only the first photo initially, preloading current/next slides as it becomes visible. Nginx serves `/images/studio/optimized/` directly with a one-year immutable cache because changed source images create new filenames. Ensure original studio photos are copied locally before building a new release. Sharp is a build-time dependency only; it is not needed on the runtime VPS.

## Docker migration verified — 9 October 2026

Docker Engine and Compose were installed from the official Ubuntu repository. The Node and Go images were built/tested on the VPS and checked at a loopback staging port before cutover. Production now runs healthy `web`, `api` and `proxy` services from `/opt/inceptchange/docker-project`. Caddy obtained new certificates for both domain names and owns renewal through persistent volumes. Host Nginx, the legacy website/API units and Certbot timer are disabled. Cutover backup: `/opt/inceptchange-container-cutover-20261009-060521`. Live checks passed for pages, video, immutable image caching, protected admin login, Supabase, Gemini streaming, booking insertion and acceptance of both branded email copies. The temporary booking was deleted. Docker Desktop was not installed on the deployment Mac; container builds and runtime validation used the VPS Docker Engine.
