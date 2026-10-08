import urllib.request
import urllib.error
import re
import json
import xml.etree.ElementTree as ET
base = 'http://localhost:5173'
paths = ['/', '/works', '/contact', '/works/giga-field-visit', '/works/women-empowerment-program', '/works/weather-kids-program', '/services/photography', '/services/videography', '/services/documentary', '/services/event-management']
for path in paths:
    response = urllib.request.urlopen(base + path)
    html = response.read().decode()
    assert response.status == 200
    assert len(re.findall(r'<h1[ >]', html)) == 1
    assert 'rel="canonical"' in html
    assert 'name="description"' in html
    schema = re.search(r'<script type="application/ld\+json">(.*?)</script>', html)
    assert schema and json.loads(schema.group(1))['name'] == 'InceptChange'
    print(path, 'OK')
root = ET.fromstring(urllib.request.urlopen(base + '/sitemap.xml').read())
assert len(root) == 10
assert 'Sitemap:' in urllib.request.urlopen(base + '/robots.txt').read().decode()
print('Sitemap and robots OK')
try:
    urllib.request.urlopen(base + '/works/missing')
    raise AssertionError('Expected 404')
except urllib.error.HTTPError as error:
    assert error.code == 404
    print('Missing project: 404 OK')
