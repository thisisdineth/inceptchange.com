<script lang="ts">
 import CursorPattern from '$lib/CursorPattern.svelte';import {onMount} from 'svelte';import '../app.css';import {studio} from '$lib/data';import {page} from '$app/state';
 let {children}=$props();let menu=$state(false);let scrolled=$state(false);
 onMount(()=>{const update=()=>{scrolled=window.scrollY>32;};window.addEventListener('scroll',update,{passive:true});update();return ()=>window.removeEventListener('scroll',update);});
</script>
<svelte:head><link rel="icon" href="/images/logo.png"/>{@html '<script type="application/ld+json">'+JSON.stringify({'@context':'https://schema.org','@type':'ProfessionalService',name:'InceptChange',url:'https://www.inceptchange.com',image:'https://www.inceptchange.com/images/logo.png',telephone:'+94787773059',email:studio.contacts.email,address:{'@type':'PostalAddress',streetAddress:studio.contacts.address,addressCountry:'LK'},sameAs:[studio.contacts.facebook,studio.contacts.instagram,studio.contacts.linkedin,studio.contacts.youtube]}).replace(/</g,'\\u003c')+'</script>'}</svelte:head>
<a class="skip" href="#main">Skip to content</a>
<header class="header" class:home-header={page.url.pathname === "/"} class:scrolled><a class="brand" href="/" aria-label="InceptChange home"><span class="brand-logo"><img src="/images/logo.png" alt="" width="64" height="54"/></span><span>incept<span class="brand-light">change</span><small>CREATIVE DIGITAL STUDIO</small></span></a><button class="menu-toggle" onclick={()=>menu=!menu} aria-expanded={menu} aria-controls="navigation">{menu?'Close':'Menu'} <span>☰</span></button><nav id="navigation" class:open={menu} aria-label="Main navigation"><a class:active={page.url.pathname.startsWith('/works')} href="/works" onclick={()=>menu=false}>Our work</a><a href="/#services" onclick={()=>menu=false}>What we do</a><a href="/#about" onclick={()=>menu=false}>The studio</a><a class="nav-contact" href="/contact" onclick={()=>menu=false}>Let’s talk <span aria-hidden="true">↗</span></a></nav></header>
<main id="main">{@render children()}</main>
<footer><div class="footer-top"><div><p class="eyebrow"><span class="dot"></span> YOUR NEXT STORY STARTS HERE</p><a class="footer-title" href="/contact">Let’s make<br/>something <em>matter.</em> ↗</a></div><div class="footer-contact"><a href={'mailto:'+studio.contacts.email}>{studio.contacts.email}</a><a href="tel:+94787773059">+94 78 777 3059</a><p>{studio.contacts.address}</p><div class="socials"><a href={studio.contacts.instagram}>Instagram ↗</a><a href={studio.contacts.facebook}>Facebook ↗</a><a href={studio.contacts.youtube}>YouTube ↗</a></div></div></div><div class="footer-marquee" role="region" aria-label="InceptChange — Photography, Film, Stories">
 <div class="footer-marquee-track" aria-hidden="true">
  {#each [0,1] as copy}<div class="footer-marquee-group"><span>InceptChange</span><i>✳</i><span>Photography</span><i>✳</i><span class="serif">Film &amp; stories.</span><i>✳</i></div>{/each}
 </div>
</div><div class="footer-bottom"><span>© {new Date().getFullYear()} InceptChange</span><span>Incepting minds. Changing behaviors.</span><a href="#main">Back to top ↑</a></div></footer>

<CursorPattern/>
