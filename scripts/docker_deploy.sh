#!/usr/bin/env bash
# Run on the VPS from the Docker project root, with sudo.
set -Eeuo pipefail
cd "$(dirname "$0")/.."
if [[ "$EUID" -ne 0 ]]; then
  echo 'Run: sudo bash scripts/docker_deploy.sh' >&2
  exit 1
fi
compose=(docker compose -f compose.yaml -f compose.production.yaml)
"${compose[@]}" config --quiet
backup_dir="/opt/inceptchange-docker-backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$backup_dir"
chmod 700 "$backup_dir"
cp compose*.yaml "$backup_dir/"
cp -a docker "$backup_dir/docker"
for service in web api; do
  image="inceptchange-${service}:${RELEASE_TAG:-local}"
  if docker image inspect "$image" >/dev/null 2>&1; then
    docker image tag "$image" "inceptchange-${service}:rollback"
  fi
done
"${compose[@]}" build
"${compose[@]}" pull proxy
"${compose[@]}" run --rm --no-deps proxy caddy validate --config /etc/caddy/Caddyfile --adapter caddyfile
printf 'Private configuration backup: %s\n' "$backup_dir"
"${compose[@]}" up -d --wait --wait-timeout 120
"${compose[@]}" ps
curl --fail --silent --show-error https://www.inceptchange.com/healthz
printf '\nDeployment finished. Test booking and admin flows before removing any rollback image.\n'
