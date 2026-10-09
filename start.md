# InceptChange — install, run and deploy

**Docker is the primary production workflow.** See [docs/DOCKER.md](docs/DOCKER.md) for container startup and deployment on all operating systems. The native commands below remain useful for development; the artifact/systemd deployment sections describe the retained legacy setup and should not be mixed with the active Docker stack.

Local website: http://localhost:5173. Production: https://www.inceptchange.com.

Use Node.js 22 (or a newer supported LTS), Go 1.24+, Git and Python 3. Python is needed for the audit scripts. Run local commands from the repository root unless a step says otherwise. Keep the frontend and Go backend running in two separate terminals.

## 1. Install tools

### Windows 10/11 — PowerShell

Install App Installer from Microsoft Store if `winget` is unavailable. Run:

```powershell
winget install --id Git.Git --exact
winget install --id OpenJS.NodeJS.LTS --exact
winget install --id GoLang.Go --exact
winget install --id Python.Python.3.13 --exact
```

Close and reopen PowerShell after installation:

```powershell
git --version
node --version
npm.cmd --version
go version
py -3 --version
ssh -V
```

Modern Windows includes SSH, SCP and tar. If SSH is missing, install OpenSSH Client from Windows Optional Features. Use `npm.cmd` in PowerShell if script execution policy prevents `npm.ps1` from running.

### macOS — Terminal

Install Homebrew if it is not already available:

```sh
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

Follow the installer's `brew shellenv` instructions, then:

```sh
brew install node@22 go git python
export PATH="$(brew --prefix node@22)/bin:$PATH"
printf '\nexport PATH="%s/bin:$PATH"\n' "$(brew --prefix node@22)" >> ~/.zshrc
node --version
npm --version
go version
git --version
python3 --version
```

### Linux — Ubuntu/Debian, Bash

For other distributions, install Git, curl, Python 3, tar and xz with your distribution's package manager; the Node/Go steps below support x86-64 and ARM64 Linux.

```sh
sudo apt-get update
sudo apt-get install -y git curl ca-certificates python3 xz-utils tar openssh-client
```

Install Node 22 with nvm. If nvm is already installed, skip the clone and source its existing `nvm.sh`.

```sh
git clone --branch v0.40.3 --depth 1 https://github.com/nvm-sh/nvm.git "$HOME/.nvm"
export NVM_DIR="$HOME/.nvm"
. "$NVM_DIR/nvm.sh"
nvm install 22
nvm alias default 22
printf '\nexport NVM_DIR="$HOME/.nvm"\n[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"\n' >> ~/.bashrc
```

Install the latest stable Go from its official downloads, checking the archive checksum. These commands install into `/usr/local/go`; on an existing Go installation, first back up or remove the old installation following the official Go instructions.

```sh
mkdir -p /tmp/inceptchange-go-install
cd /tmp/inceptchange-go-install
curl -fsSL 'https://go.dev/dl/?mode=json' -o releases.json
python3 - <<'PY'
import json, platform
arch = {'x86_64': 'amd64', 'aarch64': 'arm64'}.get(platform.machine())
if not arch:
    raise SystemExit('Unsupported architecture: use the official Go download page.')
releases = json.load(open('releases.json'))
release = next(r for r in releases if r['stable'])
archive = next(f for f in release['files'] if f['os'] == 'linux' and f['arch'] == arch and f['kind'] == 'archive')
open('archive-name', 'w').write(archive['filename'])
open('archive.sha256', 'w').write(archive['sha256'] + '  ' + archive['filename'] + '\n')
PY
GO_ARCHIVE=$(cat archive-name)
curl -fsSL "https://go.dev/dl/$GO_ARCHIVE" -o "$GO_ARCHIVE"
sha256sum -c archive.sha256
sudo tar -C /usr/local -xzf "$GO_ARCHIVE"
export PATH="/usr/local/go/bin:$PATH"
printf '\nexport PATH="/usr/local/go/bin:$PATH"\n' >> ~/.bashrc
cd ~
node --version
npm --version
go version
python3 --version
```

## 2. Get the code and configure private settings

If you already have this repository, open a terminal in its root and skip cloning. Otherwise, on any OS:

```sh
git clone https://github.com/thisisdineth/inceptchange.com.git
cd inceptchange.com
```

On Windows:

```powershell
npm.cmd ci
Copy-Item .env.example .env
Copy-Item backend/.env.example backend/.env
notepad .env
notepad backend/.env
```

On macOS/Linux:

```sh
npm ci
cp .env.example .env
cp backend/.env.example backend/.env
```

**Copy examples only during initial setup:** copying over existing `.env` files replaces your configured keys. Edit the files in your IDE. Generate a shared random secret on any OS:

```sh
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Set these values:

| Setting | File | Purpose |
| --- | --- | --- |
| ENQUIRY_BACKEND_URL=http://127.0.0.1:8080 | .env | Private Go API address |
| ENQUIRY_PROXY_SECRET | Both files, identical value | Authenticates frontend-to-Go requests |
| GEMINI_API_KEY | Both files; Go uses backend/.env | Streaming AI questions |
| GEMINI_MODEL=gemini-2.5-flash | backend/.env | Gemini model |
| RESEND_API_KEY | Both files; Go uses backend/.env | Email delivery |
| RESEND_FROM="InceptChange <hello@inceptchange.com>" | Both files | Verified sender |
| LISTEN_ADDR=127.0.0.1:8080 | backend/.env | Keeps Go private |
| SUPABASE_URL | .env | Supabase project URL |
| SUPABASE_SECRET_KEY | .env | Private database access |
| ADMIN_EMAILS | .env | Comma-separated authorised admin emails |

The API keys and SSH credentials must remain private. `.env` files are Git-ignored. The site can run without Supabase, but admin sign-in and database features require the migration and user setup in [docs/ADMIN.md](docs/ADMIN.md). Missing email credentials prevent enquiry delivery; Gemini outages use standard guided questions.

Studio photos in `static/images/studio/` are Git-ignored as well; copy them separately when setting up a fresh checkout. They are included in the website build when present locally. `npm run dev` and `npm run build` automatically generate smaller WebP variants using Sharp; you can also run `npm run images:optimize` manually.

MP4 files are also Git-ignored. For the showreel, obtain the existing video separately and place it at `static/images/ShowReel.mp4` before running/building locally.

## 3. Start locally

### Terminal 1 — website, all operating systems

From the repository root:

```sh
npm run dev -- --port 5173 --strictPort
```

Windows PowerShell uses:

```powershell
npm.cmd run dev -- --port 5173 --strictPort
```

### Terminal 2 — Go backend

macOS/Linux, from the repository root:

```sh
cd backend
set -a
source .env
set +a
go run .
```

Windows PowerShell, from the repository root:

```powershell
Set-Location backend
Get-Content .env | ForEach-Object {
    $line = $_.Trim()
    if ($line -match '^([A-Za-z_][A-Za-z0-9_]*)=(.*)$') {
        $settingName = $Matches[1]
        $settingValue = $Matches[2].Trim().Trim('"').Trim("'")
        Set-Item -Path "Env:$settingName" -Value $settingValue
    }
}
go run .
```

Open http://localhost:5173, http://localhost:5173/contact or http://localhost:5173/admin/login. Stop a process with Ctrl+C. Restart Go after editing `backend/.env`; restart the frontend after changing its private environment.

If port 5173 is occupied, stop the other development server or use `--port 5175 --strictPort` and open http://localhost:5175. Go must keep port 8080 unless you update both LISTEN_ADDR and ENQUIRY_BACKEND_URL.

## 4. Check and build

macOS/Linux:

```sh
npm run check
npm run build
(cd backend && go test ./... && go vet ./...)
python3 scripts/test_admin.py
```

Windows PowerShell:

```powershell
npm.cmd run check
npm.cmd run build
Push-Location backend
go test ./...
go vet ./...
Pop-Location
```

The mock admin smoke script currently launches `npm` directly and uses Unix process groups; run it on macOS/Linux or Windows WSL. It uses ports 5199 and 9998 and does not need real Supabase credentials. The existing `scripts/verify.py` and `scripts/audit_site.py` expect the frontend at port 5173:

```sh
python3 scripts/verify.py
python3 scripts/audit_site.py
```

On Windows replace `python3` with `py -3`. These audit scripts run while the development server is already running.

## 5. Commit and push to GitHub

Run from the repository root on any OS. Check the diff first and stage only the intended changes if other work is present.

```sh
git status
git diff
git remote -v
git add -A
git diff --cached --stat
git commit -m "Describe your changes"
git push origin main
```

The configured `origin` is `https://github.com/thisisdineth/inceptchange.com.git`; `upstream` is the Calcusai repository. Confirm your intended remote before pushing. Do not force-push to solve a rejected push; fetch and reconcile remote changes first.

**A GitHub push does not deploy the VPS.** This server runs uploaded build artifacts, not an automatic GitHub deployment. Complete the next steps to publish a change.

## 6. Connect to the OVH VPS

| Item | Value |
| --- | --- |
| Server | vps-bb4c48b9.vps.ovh.ca |
| IPv4 | 15.235.185.226 |
| User | ubuntu |
| Website | https://www.inceptchange.com |

On the original deployment Mac, the authorised key is `~/.ssh/inceptchange_vps`:

```sh
chmod 600 ~/.ssh/inceptchange_vps
ssh -i ~/.ssh/inceptchange_vps ubuntu@15.235.185.226
```

Linux uses the same command once its key is authorised. Windows PowerShell:

```powershell
ssh -i "$env:USERPROFILE/.ssh/inceptchange_vps" ubuntu@15.235.185.226
```

A fresh computer will not have the Mac's private key. Create its own key and authorise the public key using an existing authorised session:

```sh
ssh-keygen -t ed25519 -f ~/.ssh/inceptchange_vps
```

On Windows, use `ssh-keygen -t ed25519 -f "$env:USERPROFILE/.ssh/inceptchange_vps"`. Choose a passphrase when prompted. Display the `.pub` file with `cat` (macOS/Linux) or `Get-Content` (Windows). On the VPS, append that public key using:

```sh
mkdir -p ~/.ssh
chmod 700 ~/.ssh
nano ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

Leave existing keys in place. The original OVH password was replaced at first login; it is not listed here. Type `exit` to leave the server terminal.

## 7. Build and upload a release

Run these on your local computer from the repository root. Keep deployments serial: use the same archive names only when no other deployment is in progress. Stop on any failed check or build; do not upload an incomplete release.

### macOS/Linux

```sh
set -e
npm run check
npm run build
(cd backend && go test ./... && go vet ./...)
(cd backend && GOOS=linux GOARCH=amd64 go build -o /tmp/inceptchange-enquiry .)
tar --exclude='build/client/images/ShowReel.mp4' -czf /tmp/inceptchange-site.tar.gz build package.json package-lock.json
scp -i ~/.ssh/inceptchange_vps /tmp/inceptchange-site.tar.gz /tmp/inceptchange-enquiry ubuntu@15.235.185.226:/tmp/
ssh -i ~/.ssh/inceptchange_vps ubuntu@15.235.185.226
```

### Windows PowerShell

```powershell
npm.cmd run check
if ($LASTEXITCODE -ne 0) { throw 'Check failed' }
npm.cmd run build
if ($LASTEXITCODE -ne 0) { throw 'Build failed' }
Push-Location backend
try {
    go test ./...
    if ($LASTEXITCODE -ne 0) { throw 'Go tests failed' }
    go vet ./...
    if ($LASTEXITCODE -ne 0) { throw 'Go vet failed' }
    $env:GOOS = 'linux'
    $env:GOARCH = 'amd64'
    go build -o "$env:TEMP/inceptchange-enquiry" .
    if ($LASTEXITCODE -ne 0) { throw 'Go build failed' }
} finally {
    Remove-Item Env:GOOS, Env:GOARCH -ErrorAction SilentlyContinue
    Pop-Location
}
tar.exe --exclude=build/client/images/ShowReel.mp4 -czf "$env:TEMP/inceptchange-site.tar.gz" build package.json package-lock.json
if ($LASTEXITCODE -ne 0) { throw 'Archive failed' }
scp -i "$env:USERPROFILE/.ssh/inceptchange_vps" "$env:TEMP/inceptchange-site.tar.gz" "$env:TEMP/inceptchange-enquiry" ubuntu@15.235.185.226:/tmp/
if ($LASTEXITCODE -ne 0) { throw 'Upload failed' }
ssh -i "$env:USERPROFILE/.ssh/inceptchange_vps" ubuntu@15.235.185.226
```

## 8. Publish on the server

Run inside the SSH session. This updates the already configured VPS; it is not a fresh-server provisioning script. A short restart interrupts requests, so deploy during a quiet period. The archive excludes the MP4 and overlays the build to preserve the server's existing video.

```sh
set -e
DEPLOY_BACKUP="/opt/inceptchange-backup-$(date +%Y%m%d-%H%M%S)"
sudo cp -a /opt/inceptchange "$DEPLOY_BACKUP"
printf 'Backup: %s\n' "$DEPLOY_BACKUP"
sudo tar -xzf /tmp/inceptchange-site.tar.gz -C /opt/inceptchange/site
sudo install -m 755 /tmp/inceptchange-enquiry /opt/inceptchange/enquiry
cd /opt/inceptchange/site
sudo /usr/local/bin/npm ci --omit=dev --ignore-scripts
sudo chown -R root:root /opt/inceptchange/site
sudo find /opt/inceptchange/site -type d -exec chmod 755 {} +
sudo find /opt/inceptchange/site -type f -exec chmod 644 {} +
sudo systemctl restart inceptchange-site inceptchange-enquiry
sudo systemctl is-active inceptchange-site inceptchange-enquiry nginx
curl --fail --silent --show-error -I https://www.inceptchange.com/contact
curl --fail --silent --show-error -I https://www.inceptchange.com/images/ShowReel.mp4
rm /tmp/inceptchange-site.tar.gz /tmp/inceptchange-enquiry
```

Open the live site and test navigation, the contact flow and the studio calendar. A successful email test sends a real message to the studio inbox. `sent: true` means Resend acceptance; verify delivery in Resend or the inbox. Admin changes need the Supabase migration and production settings before sign-in works.

Backups contain the website and executable, not the environment files or Supabase database. Keep the latest known-good backup; older backups consume disk space. Overlay releases can leave old hashed frontend assets.

## 9. Private production settings and logs

Inside SSH:

```sh
sudoedit /etc/inceptchange/site.env
sudoedit /etc/inceptchange/enquiry.env
sudo systemctl restart inceptchange-site inceptchange-enquiry
sudo systemctl status inceptchange-site inceptchange-enquiry nginx --no-pager
sudo journalctl -u inceptchange-site -u inceptchange-enquiry -n 100 --no-pager
sudo tail -n 100 /var/log/nginx/error.log
sudo nginx -t
sudo systemctl list-timers certbot.timer
df -h /
```

`site.env` needs HOST=127.0.0.1, PORT=3000, ORIGIN=https://www.inceptchange.com, ADDRESS_HEADER=X-Real-IP, ENQUIRY_BACKEND_URL, the shared secret and the three admin/Supabase variables. `enquiry.env` needs the Gemini/Resend settings, LISTEN_ADDR and the matching shared secret. Copy values through a private editor; do not publish or commit production `.env` files.

After changing Nginx, use `sudo nginx -t && sudo systemctl reload nginx`. Cloudflare orange proxy is supported with **Full (strict)** SSL mode. Leave Node/Go ports private. See [docs/SERVER.md](docs/SERVER.md) for paths and service details and [docs/ADMIN.md](docs/ADMIN.md) for database setup.

## 10. Roll back a release

Inside SSH, list backups and choose the known-good directory:

```sh
sudo ls -dt /opt/inceptchange-backup-*
```

Replace the example timestamp below with the actual backup you selected. Stop if it does not exist:

```sh
set -e
RESTORE_BACKUP=/opt/inceptchange-backup-YYYYMMDD-HHMMSS
sudo test -d "$RESTORE_BACKUP/site"
sudo test -f "$RESTORE_BACKUP/enquiry"
sudo systemctl stop inceptchange-site inceptchange-enquiry
sudo mv /opt/inceptchange "/opt/inceptchange-failed-$(date +%Y%m%d-%H%M%S)"
sudo cp -a "$RESTORE_BACKUP" /opt/inceptchange
sudo systemctl start inceptchange-site inceptchange-enquiry
sudo systemctl is-active inceptchange-site inceptchange-enquiry nginx
curl --fail --silent --show-error -I https://www.inceptchange.com/contact
```

This restores code only. Environment changes and database migrations need their own recovery plan.

## References

- [Node.js downloads](https://nodejs.org/en/download)
- [Go installation](https://go.dev/doc/install)
- [Homebrew installation](https://brew.sh/)
- [nvm installation and usage](https://github.com/nvm-sh/nvm)
- [WinGet install command](https://learn.microsoft.com/en-us/windows/package-manager/winget/install)
