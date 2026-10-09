<script lang="ts">
 import {page} from '$app/state';
 import {studio,photo} from '$lib/data';
 import JsonLd from '$lib/JsonLd.svelte';
 let {title,description,image=studio.covers.documentary,imageAlt='Photography and visual storytelling by InceptChange',type='WebPage',schema=[]}: {title:string;description:string;image?:string;imageAlt?:string;type?:string;schema?:Record<string,unknown>[]}=$props();
 const origin='https://www.inceptchange.com';
 const canonical=$derived(origin+(page.url.pathname==='/'?'/':page.url.pathname.replace(/\/+$/,'')));
 const socialImage=$derived(new URL(photo(image,1200),origin).href);
 const fullTitle=$derived(title+' | InceptChange');
 const crumbs=$derived(page.url.pathname==='/'?[]:[{name:'Home',url:origin+'/'},...(page.url.pathname.startsWith('/works/')?[{name:'Our work',url:origin+'/works'}]:page.url.pathname.startsWith('/services/')?[{name:'Services',url:origin+'/services'}]:[]),{name:title.split(' — ')[0],url:canonical}]);
</script>
<svelte:head>
 <title>{fullTitle}</title><meta name="description" content={description}/>
 <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"/>
 <link rel="canonical" href={canonical}/>
 <meta property="og:type" content="website"/><meta property="og:site_name" content="InceptChange"/><meta property="og:locale" content="en_LK"/>
 <meta property="og:title" content={fullTitle}/><meta property="og:description" content={description}/><meta property="og:url" content={canonical}/><meta property="og:image" content={socialImage}/><meta property="og:image:alt" content={imageAlt}/>
 <meta name="twitter:card" content="summary_large_image"/><meta name="twitter:title" content={fullTitle}/><meta name="twitter:description" content={description}/><meta name="twitter:image" content={socialImage}/><meta name="twitter:image:alt" content={imageAlt}/>
</svelte:head>
<JsonLd data={{'@context':'https://schema.org','@graph':[
 {'@type':type,'@id':canonical+'#page',url:canonical,name:fullTitle,description,inLanguage:'en',isPartOf:{'@id':origin+'/#website'},about:{'@id':origin+'/#studio'},primaryImageOfPage:{'@type':'ImageObject',contentUrl:socialImage,caption:imageAlt}},
 ...(crumbs.length?[{'@type':'BreadcrumbList','@id':canonical+'#breadcrumbs',itemListElement:crumbs.map((crumb,i)=>({'@type':'ListItem',position:i+1,name:crumb.name,item:crumb.url}))}]:[]),...schema
]}}/>
