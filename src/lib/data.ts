import content from './content.json';
import studioImages from './studio-images.json';
export const studio = content;
export const slugify = (text:string) => text.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
export const works = content.featuredWorks.map(work=>({...work,slug:slugify(work.title)}));
export const photo = (url:string,width=1200) => {
 const local=(studioImages as Record<string,Record<string,string>>)[url];
 if(local)return local[width<=800?'800':'1400'];
 return url.includes('res.cloudinary.com') ? url.replace('/upload/',`/upload/f_auto,q_auto,w_${width}/`) : url;
};
export const services = [
 {slug:'photography',title:'Photography',tag:'A moment. A feeling. Forever.',description:'Portraits, corporate events, and brand photography with a thoughtful eye for light, detail, and the moments that matter.',color:'peach',image:content.covers.photography},
 {slug:'videography',title:'Videography',tag:'Stories you can feel.',description:'From a brand film to an event highlight, we bring movement, sound, and emotion together to tell your story.',color:'teal',image:content.covers.videography},
 {slug:'documentary',title:'Documentary',tag:'Real people. Lasting impact.',description:'Human stories told with care. Documentary photography and films for organisations, communities, and causes.',color:'lime',image:content.covers.documentary},
 {slug:'event-management',title:'Event management',tag:'From the first idea to the final moment.',description:'Creative planning, coordination, and visual coverage to help bring your next event together.',color:'rose',image:content.covers.about}
];

export const heroSlides = [
 {image:content.covers.documentary,alt:'Documentary photography by InceptChange in Sri Lanka',first:'Real people. Real stories.',second:'Made to',emphasis:'make a difference.'},
 {image:content.covers.photography,alt:'Schoolchildren walking with umbrellas in Sri Lanka, photographed by InceptChange',first:'Every story deserves',second:'to be',emphasis:'beautifully told.'},
 {image:content.covers.videography,alt:'A moment from InceptChange’s videography portfolio',first:'More than a moment.',second:'A story',emphasis:'you can feel.'}
];
