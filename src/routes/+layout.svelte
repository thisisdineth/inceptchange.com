<script lang="ts">
 import ContactNow from '$lib/ContactNow.svelte';import ThemeToggle from '$lib/ThemeToggle.svelte';import PageLoader from '$lib/PageLoader.svelte';import JsonLd from '$lib/JsonLd.svelte';import {afterNavigate} from '$app/navigation';import CursorPattern from '$lib/CursorPattern.svelte';import {onMount} from 'svelte';import '../app.css';import {studio} from '$lib/data';import {page} from '$app/state';
 let {children}=$props();let menu=$state(false);let scrolled=$state(false);let activeSection=$state('');
 const links=[{label:'Our work',id:'work',route:'/works'},{label:'What we do',id:'services',route:'/services'},{label:'The studio',id:'about',route:''},{label:'Studio booking',id:'studio-booking',route:''}];
 afterNavigate(()=>{menu=false;});
 onMount(()=>{
  const update=()=>{
   scrolled=window.scrollY>32;
   if(page.url.pathname!=='/'){activeSection='';return;}
   let current='';
   for(const link of links){const section=document.getElementById(link.id);if(section&&section.getBoundingClientRect().top<=window.innerHeight*.35)current=link.id;}
   activeSection=current;
  };
  const escape=(event:KeyboardEvent)=>{if(event.key==='Escape')menu=false;};
  window.addEventListener('scroll',update,{passive:true});window.addEventListener('resize',update);window.addEventListener('keydown',escape);update();
  return ()=>{window.removeEventListener('scroll',update);window.removeEventListener('resize',update);window.removeEventListener('keydown',escape);};
 });
</script>
<svelte:head><link rel="preconnect" href="https://res.cloudinary.com"/><link rel="preconnect" href="https://fonts.googleapis.com"/><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous"/><link rel="icon" href="/images/logo.png"/>{@html '<script type="application/ld+json">'+JSON.stringify({'@context':'https://schema.org','@type':'ProfessionalService','@id':'https://www.inceptchange.com/#studio',name:'InceptChange',url:'https://www.inceptchange.com',image:'https://www.inceptchange.com/images/logo.png',telephone:'+94787773059',email:studio.contacts.email,address:{'@type':'PostalAddress',streetAddress:studio.contacts.address,addressCountry:'LK'},openingHoursSpecification:{'@type':'OpeningHoursSpecification',dayOfWeek:['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'],opens:'08:00',closes:'22:00'},areaServed:{'@type':'Country',name:'Sri Lanka'},sameAs:[studio.contacts.facebook,studio.contacts.instagram,studio.contacts.linkedin,studio.contacts.youtube]}).replace(/</g,'\\u003c')+'</script>'}</svelte:head>
<JsonLd data={{'@context':'https://schema.org','@type':'WebSite','@id':'https://www.inceptchange.com/#website',name:'InceptChange',url:'https://www.inceptchange.com/',inLanguage:'en',publisher:{'@id':'https://www.inceptchange.com/#studio'}}}/>
<a class="skip" href="#main">Skip to content</a>
<header class="header" class:home-header={page.url.pathname === "/"} class:scrolled><a class="brand" href="/" aria-label="InceptChange home"><span class="brand-logo"><img src="/images/logo.png" alt="" width="64" height="54"/></span><span>incept<span class="brand-light">change</span><small>CREATIVE DIGITAL STUDIO</small></span></a><button class="menu-toggle" onclick={()=>menu=!menu} aria-expanded={menu} aria-controls="navigation">{menu?'Close':'Menu'} <span>☰</span></button><nav id="navigation" class:open={menu} aria-label="Main navigation">{#each links as link}{@const active=page.url.pathname==='/'?activeSection===link.id:!!link.route&&page.url.pathname.startsWith(link.route)}<a class:active href={'/#'+link.id} aria-current={active?'location':undefined} onclick={()=>menu=false}>{link.label}</a>{/each}<a class="nav-contact" href="/contact" onclick={()=>menu=false}>Let’s talk <span aria-hidden="true">↗</span></a></nav></header>
<main id="main">{@render children()}</main>
<footer><div class="footer-top"><div><p class="eyebrow"><span class="dot"></span> YOUR NEXT STORY STARTS HERE</p><a class="footer-title" href="/contact">Let’s make<br/>something <em>matter.</em> ↗</a></div><div class="footer-contact"><a href={'mailto:'+studio.contacts.email}>{studio.contacts.email}</a><a href="tel:+94787773059">+94 78 777 3059</a><p>{studio.contacts.address}</p><div class="socials"><a href={studio.contacts.instagram}>Instagram ↗</a><a href={studio.contacts.facebook}>Facebook ↗</a><a href={studio.contacts.youtube}>YouTube ↗</a></div></div></div><nav class="footer-links" aria-label="Footer navigation"><a href="/works">Full portfolio ↗</a>{#each links.slice(1) as link}<a href={'/#'+link.id}>{link.label} ↗</a>{/each}<a href="/contact">Contact ↗</a></nav><div class="footer-marquee" role="region" aria-label="InceptChange — Photography, Film, Stories">
 <div class="footer-marquee-track" aria-hidden="true">
  {#each [0,1] as copy}<div class="footer-marquee-group"><span>InceptChange</span><i>✳</i><span>Photography</span><i>✳</i><span class="serif">Film &amp; stories.</span><i>✳</i></div>{/each}
 </div>
</div><ThemeToggle/><div class="footer-bottom"><span>© {new Date().getFullYear()} InceptChange</span><span>Incepting minds. Changing behaviors.</span><a href="#main">Back to top ↑</a></div></footer>

<CursorPattern/>

<PageLoader/>

<ContactNow/>
