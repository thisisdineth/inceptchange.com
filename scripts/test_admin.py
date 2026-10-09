"""Private admin smoke checks using a local mock Supabase service; no real credentials needed."""
import http.server,threading,json,subprocess,os,time,urllib.request,urllib.error,http.cookiejar
class Fake(http.server.BaseHTTPRequestHandler):
 def log_message(self,*args):pass
 def respond(self,value,status=200):
  data=json.dumps(value).encode();self.send_response(status);self.send_header('Content-Type','application/json');self.end_headers();self.wfile.write(data)
 def do_GET(self):
  if self.path=='/auth/v1/user':return self.respond({'id':'admin','email':'admin@example.com'} if self.headers.get('Authorization')=='Bearer test-access' else {},200 if self.headers.get('Authorization')=='Bearer test-access' else 401)
  if 'select=booking_date' in self.path:return self.respond([{'booking_date':'2026-10-15'}])
  return self.respond([{'id':'11111111-1111-4111-8111-111111111111','booking_date':'2026-10-15','name':'Private customer','email':'private@example.com','service':'Studio','start_time':None,'duration':'','notes':'Private notes','status':'confirmed'}])
 def do_POST(self):
  body=json.loads(self.rfile.read(int(self.headers.get('Content-Length',0))) or '{}')
  if self.path.startswith('/auth/v1/token'):
   if body.get('password')!='correct':return self.respond({},400)
   return self.respond({'access_token':'test-access','refresh_token':'test-refresh','expires_in':3600,'user':{'email':'admin@example.com'}})
  if 'admin_monthly_stats' in self.path:return self.respond({'visits':12,'pageviews':25,'daily':[{'day':'2026-10-09','visits':12,'pageviews':25}],'pages':[{'path':'/','views':25}]})
  return self.respond({})
server=http.server.HTTPServer(('127.0.0.1',9998),Fake);threading.Thread(target=server.serve_forever,daemon=True).start()
env=os.environ.copy();env.update({'SUPABASE_URL':'http://127.0.0.1:9998','SUPABASE_SERVICE_ROLE_KEY':'test-key','ADMIN_EMAILS':'admin@example.com'})
log=open('/tmp/incept-admin-test-server.log','w');proc=subprocess.Popen(['npm','run','dev','--','--port','5199','--strictPort'],env=env,stdout=log,stderr=log,start_new_session=True)
base='http://localhost:5199';jar=http.cookiejar.CookieJar();browser=urllib.request.build_opener(urllib.request.HTTPCookieProcessor(jar))
def request(path,data=None,origin=None):
 headers={'Accept':'text/html'};
 if data is not None:headers['Origin']=origin or base
 return browser.open(urllib.request.Request(base+path,data=data,headers=headers),timeout=20)
try:
 for _ in range(100):
  try:r=request('/admin/login');break
  except Exception:time.sleep(.2)
 else:raise AssertionError('Development server unavailable')
 assert r.headers['X-Robots-Tag']=='noindex, nofollow, noarchive';assert 'no-store' in r.headers['Cache-Control']
 r=request('/admin');assert r.url.endswith('/admin/login');assert 'Private customer' not in r.read().decode()
 r=request('/api/studio/availability?month=2026-10');payload=json.load(r);assert payload=={'dates':['2026-10-15'],'available':True}
 try:request('/admin/login',b'email=admin%40example.com&password=correct','https://evil.example');raise AssertionError('CSRF accepted')
 except urllib.error.HTTPError as e:assert e.code==403
 try:
  r=request('/admin/login',b'email=other%40example.com&password=correct');assert 'Email or password is incorrect.' in r.read().decode();assert not list(jar)
 except urllib.error.HTTPError as e:assert e.code==400
 r=request('/admin/login',b'email=admin%40example.com&password=correct');html=r.read().decode();assert r.url.endswith('/admin');assert 'Private customer' in html;assert 'Visits this month' in html
 assert all(c.has_nonstandard_attr('HttpOnly') for c in jar)
 r=request('/admin?/logout',b'');assert r.url.endswith('/admin/login');assert not list(jar)
 r=request('/admin');assert r.url.endswith('/admin/login')
 print('PASS: unauthenticated redirect, noindex/no-store, allowlist, CSRF, authenticated dashboard, HttpOnly session, public date-only availability and logout (mock Supabase).')
finally:
 import signal
 os.killpg(proc.pid,signal.SIGTERM);proc.wait(timeout=10);server.shutdown();log.close()
