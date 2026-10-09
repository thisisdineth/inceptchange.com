"""Create private Docker runtime files from existing local .env configuration."""
from pathlib import Path
import argparse
import os
import secrets

parser = argparse.ArgumentParser()
parser.add_argument('--production', action='store_true')
args = parser.parse_args()

def read_env(filename):
    result = {}
    path = Path(filename)
    if path.exists():
        for line in path.read_text().splitlines():
            if '=' in line and not line.strip().startswith('#'):
                key, value = line.split('=', 1)
                result[key.strip()] = value.strip()
    return result

root = read_env('.env')
api_source = read_env('backend/.env')
shared = root.get('ENQUIRY_PROXY_SECRET') or api_source.get('ENQUIRY_PROXY_SECRET') or secrets.token_hex(32)
web = {key: root.get(key, '') for key in ['SUPABASE_URL', 'SUPABASE_SECRET_KEY', 'SUPABASE_PUBLISHABLE_KEY', 'SUPABASE_JWKS_URL', 'ADMIN_EMAILS']}
web.update(ORIGIN='https://www.inceptchange.com' if args.production else 'http://localhost:5173', ENQUIRY_PROXY_SECRET=shared)
api = {key: api_source.get(key) or root.get(key, '') for key in ['GEMINI_API_KEY', 'GEMINI_MODEL', 'RESEND_API_KEY', 'RESEND_FROM']}
api['GEMINI_MODEL'] = api['GEMINI_MODEL'] or 'gemini-3.8-flash'
api['RESEND_FROM'] = api['RESEND_FROM'] or '"InceptChange <hello@inceptchange.com>"'
api['ENQUIRY_PROXY_SECRET'] = shared
Path('docker').mkdir(exist_ok=True)
for name, values in [('web', web), ('api', api)]:
    path = Path(f'docker/{name}.env')
    path.write_text('\n'.join(f'{key}={value}' for key, value in values.items()) + '\n')
    os.chmod(path, 0o600)
print('Created private docker/web.env and docker/api.env. No credentials were printed; ADMIN_PASSWORD is excluded.')
