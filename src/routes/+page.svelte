<script lang="ts">
import {onMount} from 'svelte';
let heroStage: HTMLElement;
let currentSlide=$state(0);
let paused=$state(false);
let loadedSlides=$state<boolean[]>([true,false,false]);
const slide=$derived(heroSlides[currentSlide]);
function selectSlide(index:number){if(loadedSlides[index]){currentSlide=index;paused=true;}}
let frameProgress=$state(0);
let progress=$state(0);
onMount(()=>{
 const motion=window.matchMedia('(prefers-reduced-motion: reduce)');
 let frame=0;
 const update=()=>{
  frame=0;
  const distance=Math.max(1,heroStage.offsetHeight-window.innerHeight);
  const amount=Math.min(1,Math.max(0,-heroStage.getBoundingClientRect().top/distance));
  progress=motion.matches?0:amount;
  frameProgress=motion.matches?1:amount;
 };
 const slideshow=window.setInterval(()=>{
  const bounds=heroStage.getBoundingClientRect();
  const next=(currentSlide+1)%heroSlides.length;
  if(!paused && !motion.matches && !document.hidden && bounds.bottom>0 && bounds.top<window.innerHeight && loadedSlides[next])currentSlide=next;
 },6500);
 const scroll=()=>{if(!frame)frame=requestAnimationFrame(update);};
 window.addEventListener('scroll',scroll,{passive:true});window.addEventListener('resize',scroll);motion.addEventListener('change',scroll);update();
 const observer=new IntersectionObserver(entries=>{for(const entry of entries){if(entry.isIntersecting){entry.target.classList.add('revealed');observer.unobserve(entry.target);}}},{threshold:0.08});
 if(!motion.matches){document.querySelectorAll('.section-head, .work-card, .service-card, .about > div, .feature > div').forEach((element,i)=>{(element as HTMLElement).style.setProperty('--reveal-delay',`${i%4*70}ms`);element.classList.add('reveal-ready');observer.observe(element);});}
 return ()=>{window.removeEventListener('scroll',scroll);window.removeEventListener('resize',scroll);motion.removeEventListener('change',scroll);cancelAnimationFrame(frame);window.clearInterval(slideshow);observer.disconnect();};
});
import Showreel from '$lib/Showreel.svelte';import StudioBooking from '$lib/StudioBooking.svelte';import AboutStudio from '$lib/AboutStudio.svelte';import StudioStats from '$lib/StudioStats.svelte';import SEO from '$lib/SEO.svelte';import WorkCard from '$lib/WorkCard.svelte';import {studio,works,services,photo,heroSlides} from '$lib/data';</script>
<SEO title="Photography & Videography Studio in Sri Lanka" description="Discover InceptChange’s photography, videography and documentary work. A creative studio in Sri Lanka bringing brands, people and meaningful stories into focus."/>
<div id="home" class="hero-stage" bind:this={heroStage}>
<section class="cinematic-hero" style={`--hero-progress: ${progress}; --frame-progress: ${frameProgress};`} aria-label="Welcome to InceptChange">
 <div class="cinematic-image">
  {#each heroSlides as item,i}
   <img class="slideshow-image" class:current={currentSlide===i} src={photo(item.image,2400)} srcset={`${photo(item.image,800)} 800w, ${photo(item.image,1600)} 1600w, ${photo(item.image,2400)} 2400w`} sizes="100vw" alt={item.alt} aria-hidden={currentSlide!==i} width="2400" height="1600" fetchpriority={i===0?'high':'low'} onload={()=>loadedSlides[i]=true}/>
  {/each}
 </div>
 <div class="cinematic-shade"></div>
 <div class="cinematic-content">
  <div class="hero-logo"><img src="/images/logo.png" alt="InceptChange studio logo" width="256" height="212"/></div>
  <h1 class="animated-headline">{#key currentSlide}<span class="headline-phrase headline-first">{slide.first}</span><br/><span class="headline-phrase headline-second">{slide.second}</span> <span class="serif headline-phrase headline-last">{slide.emphasis}</span>{/key}</h1>
 </div>
 <a class="hero-explore" href="#work">Scroll to explore <span aria-hidden="true">↓</span></a>
 <div class="slideshow-controls" role="group" aria-label="Hero slideshow">
  {#each heroSlides as item,i}<button class="slide-dot" class:selected={currentSlide===i} aria-label={`Show slide ${i+1}: ${item.first} ${item.second} ${item.emphasis}`} aria-pressed={currentSlide===i} disabled={!loadedSlides[i]} onclick={()=>selectSlide(i)}><span></span></button>{/each}
  <button class="slide-pause" onclick={()=>paused=!paused} aria-label={paused?'Play slideshow':'Pause slideshow'} aria-pressed={paused}>{paused?'▶':'Ⅱ'}</button>
 </div>
</section>
</div>
<div class="discipline-strip" role="region" aria-label="Our disciplines: Photography, Videography, Documentary, Experiences">
 <div class="discipline-track" aria-hidden="true">
  {#each [0,1] as copy}<div class="discipline-group">{#each ['Photography','Videography','Documentary','Experiences'] as discipline}<span>{discipline}</span><i>✳</i>{/each}</div>{/each}
 </div>
</div>
<section class="section" id="work"><div class="section-head"><div><p class="eyebrow"><span class="dot"></span> SELECTED WORK</p><h2>Stories worth<br/><span class="muted">a closer look.</span></h2><p class="work-intro">Photography, film, and documentary projects for people, brands, and communities in Sri Lanka.</p></div><a class="text-link" href="/works">All our work <span>↗</span></a></div><div class="work-grid">{#each works as work}<WorkCard {work}/>{/each}</div></section>
<StudioStats/>
<section class="section services-section" id="services"><div class="section-head"><div><p class="eyebrow"><span class="dot"></span> WHAT WE DO</p><h2>Your vision.<br/><span class="muted">Our creative lens.</span></h2></div><p class="section-description">From a single photograph to a complete production, we find the right way to tell your story.</p></div><div class="service-grid">{#each services as service,i}<a class={'service-card '+service.color} href={'/services/'+service.slug}><div class="service-number">0{i+1}<span>↗</span></div><h3>{service.title}</h3><p>{service.description}</p></a>{/each}</div></section>
<section class="feature" id="documentary"><Showreel poster={photo(studio.covers.documentary,1800)}/><div><p class="eyebrow">BEYOND THE FRAME</p></div></section>
<AboutStudio/>
<StudioBooking/>
