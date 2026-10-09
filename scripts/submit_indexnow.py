"""Notify IndexNow about published canonical pages. Default is a dry run."""
import argparse
import json
import re
from pathlib import Path
from urllib.parse import urlsplit
from urllib.request import Request, urlopen
import xml.etree.ElementTree as ET
from urllib.request import build_opener, install_opener
opener = build_opener()
opener.addheaders = [('User-Agent', 'InceptChangeSiteAudit/1.0')]
install_opener(opener)

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--submit', action='store_true', help='Send the notification after verifying the live key and pages')
parser.add_argument('paths', nargs='*', help='Changed canonical paths; omit to use the public sitemap')
args = parser.parse_args()
origin = 'https://www.inceptchange.com'
key = (Path(__file__).resolve().parents[1] / 'static/indexnow-key.txt').read_text().strip()
assert re.fullmatch(r'[a-f0-9]{32}', key), 'Invalid public verification key'
if args.paths:
    assert all(p.startswith('/') and not p.startswith('//') for p in args.paths), 'Supply paths, not external URLs'
    urls = [origin + p for p in args.paths]
else:
    with urlopen(origin + '/sitemap.xml', timeout=30) as response:
        sitemap = ET.fromstring(response.read())
    urls = [item.text for item in sitemap.findall('{http://www.sitemaps.org/schemas/sitemap/0.9}url/{http://www.sitemaps.org/schemas/sitemap/0.9}loc')]
urls = list(dict.fromkeys(urls))
assert 0 < len(urls) <= 10000
for url in urls:
    parsed = urlsplit(url)
    assert parsed.scheme == 'https' and parsed.netloc == 'www.inceptchange.com' and not parsed.query and not parsed.fragment
    assert not parsed.path.startswith(('/admin', '/api', '/healthz'))
payload = {'host': 'www.inceptchange.com', 'key': key, 'keyLocation': origin + '/indexnow-key.txt', 'urlList': urls}
if not args.submit:
    print('DRY RUN: ' + str(len(urls)) + ' URLs; use --submit after publishing changes.')
    print('\n'.join(urls))
else:
    with urlopen(origin + '/indexnow-key.txt', timeout=30) as response:
        assert response.read().decode().strip() == key, 'Live key does not match; deploy first'
    for url in urls:
        with urlopen(url, timeout=30) as response:
            assert response.status == 200 and response.geturl() == url, 'URL must be live and canonical: ' + url
    request = Request('https://api.indexnow.org/indexnow', data=json.dumps(payload).encode(), headers={'Content-Type': 'application/json; charset=utf-8'}, method='POST')
    with urlopen(request, timeout=30) as response:
        assert response.status in (200, 202), 'Unexpected IndexNow response'
        print(f'IndexNow HTTP {response.status}: notified {len(urls)} URLs. This does not guarantee indexing.')
