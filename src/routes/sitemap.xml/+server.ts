import {works,services,heroSlides,studio,photo} from '$lib/data';
const escape=(text:string)=>text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
export function GET(){
 const pages=[{path:'/',images:[...heroSlides.map(s=>s.image),...studio.studioGallery.map(s=>s.image)]},{path:'/works',images:works.map(w=>w.img)},{path:'/contact',images:[]},...works.map(w=>({path:'/works/'+w.slug,images:w.gallery})),...services.map(s=>({path:'/services/'+s.slug,images:[s.image]}))];
 return new Response('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">'+pages.map(p=>`<url><loc>https://www.inceptchange.com${p.path}</loc>${[...new Set(p.images)].map(img=>`<image:image><image:loc>${escape(photo(img,1600).startsWith('/')?'https://www.inceptchange.com'+photo(img,1600):photo(img,1600))}</image:loc></image:image>`).join('')}</url>`).join('')+'</urlset>',{headers:{'Content-Type':'application/xml','Cache-Control':'public, max-age=3600'}});
}
