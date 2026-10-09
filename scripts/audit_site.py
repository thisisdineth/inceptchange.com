"""Audit rendered metadata, structured data, internal links and section anchors."""
from html.parser import HTMLParser
from urllib.request import urlopen
from urllib.error import HTTPError
from urllib.parse import urlsplit, urljoin
import json
import sys
import xml.etree.ElementTree as ET
from urllib.request import build_opener, install_opener
opener = build_opener()
opener.addheaders = [('User-Agent', 'InceptChangeSiteAudit/1.0')]
install_opener(opener)

BASE=(sys.argv[1] if len(sys.argv)>1 else 'http://localhost:5173').rstrip('/')
ORIGIN='https://www.inceptchange.com'
class Page(HTMLParser):
    def __init__(self,html):
        super().__init__(); self.links=[]; self.ids=set(); self.metas={}; self.canonical=[]; self.h1=0; self.schemas=[]; self.title=''; self.in_title=False; self.in_schema=False; self.schema=''; self.feed(html)
    def handle_starttag(self,tag,attrs):
        data=dict(attrs)
        if data.get('id'): self.ids.add(data['id'])
        if tag=='a' and data.get('href'): self.links.append(data['href'])
        if tag=='meta': self.metas[data.get('name',data.get('property',''))]=data.get('content','')
        if tag=='link' and data.get('rel')=='canonical': self.canonical.append(data['href'])
        if tag=='h1': self.h1+=1
        if tag=='title': self.in_title=True
        if tag=='script' and data.get('type')=='application/ld+json': self.in_schema=True; self.schema=''
    def handle_data(self,text):
        if self.in_title: self.title+=text
        if self.in_schema: self.schema+=text
    def handle_endtag(self,tag):
        if tag=='title': self.in_title=False
        if tag=='script' and self.in_schema: self.schemas.append(json.loads(self.schema)); self.in_schema=False

sitemap=ET.fromstring(urlopen(BASE+'/sitemap.xml').read())
paths=[urlsplit(item.find('{http://www.sitemaps.org/schemas/sitemap/0.9}loc').text).path for item in sitemap]
cache={path:Page(urlopen(BASE+path).read().decode()) for path in paths}
assert len(paths)==12
assert sitemap.findall('.//{http://www.google.com/schemas/sitemap-image/1.1}loc')
titles=set(); descriptions=set(); checked=set()
for path,page in cache.items():
    assert page.h1==1,(path,'heading count')
    assert page.canonical==[ORIGIN+path],(path,'canonical')
    assert page.title and page.title not in titles,(path,'title'); titles.add(page.title)
    description=page.metas['description']; assert description and description not in descriptions; descriptions.add(description)
    for key in ['og:title','og:description','og:image','og:image:alt','twitter:title','twitter:description','twitter:image','twitter:image:alt']: assert page.metas[key],(path,key)
    assert page.metas['og:image'].startswith('https://'),(path,'absolute preview image')
    assert any(schema.get('@type')=='ProfessionalService' for schema in page.schemas)
    graph=[node for schema in page.schemas for node in schema.get('@graph',[])]
    assert any(node.get('@id')==ORIGIN+path+'#page' for node in graph)
    if path!='/': assert any(node.get('@type')=='BreadcrumbList' for node in graph)
    if path.startswith('/services/'): assert any(node.get('@type')=='Service' for node in graph)
    if path.startswith('/works/'): assert any(node.get('@type')=='CreativeWork' for node in graph)
    for link in page.links:
        url=urlsplit(urljoin(BASE+path,link))
        if url.netloc!=urlsplit(BASE).netloc: continue
        target=url.path or '/'
        if target.startswith('/cdn-cgi/'): continue  # Cloudflare-injected email protection links
        assert target in cache,(path,'unknown route',link)
        if url.fragment: assert url.fragment in cache[target].ids,(path,'missing anchor',link)
        checked.add(link)
    print(path,'metadata, schemas, links OK')
for path in ['/works/missing','/services/missing','/missing']:
    try: urlopen(BASE+path); raise AssertionError('Expected 404')
    except HTTPError as error:
        assert error.code==404
        assert 'noindex' in Page(error.read().decode()).metas['robots']
query=Page(urlopen(BASE+'/contact?service=photography&date=2026-12-01').read().decode())
assert query.canonical==[ORIGIN+'/contact']
assert [cache['/'].ids.__contains__(id) for id in ['home','work','services','documentary','about','studio-booking']]==[True]*6
print(f'PASS: {len(paths)} pages, {len(checked)} internal links, image sitemap, query canonical, 404 noindex')
