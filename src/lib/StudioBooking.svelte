<script lang="ts">
 import {onMount} from 'svelte';
 import {studio,photo} from '$lib/data';
 const dateParts=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Colombo',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());
 const part=(type:string)=>dateParts.find(item=>item.type===type)?.value||'';
 const today=`${part('year')}-${part('month')}-${part('day')}`;
 const initialYear=Number(part('year')),initialMonth=Number(part('month'))-1;
 let year=$state(initialYear),month=$state(initialMonth),selected=$state('');
 let unavailable=$state<string[]>([]),availabilityLoaded=$state(false);
 $effect(()=>{
  const query=`${year}-${String(month+1).padStart(2,'0')}`;const controller=new AbortController();availabilityLoaded=false;unavailable=[];
  fetch('/api/studio/availability?month='+query,{signal:controller.signal}).then(r=>r.json()).then(result=>{unavailable=result.dates||[];availabilityLoaded=!!result.available;if(unavailable.includes(selected))selected='';}).catch(()=>{});
  return ()=>controller.abort();
 });
 let slide=$state(0),paused=$state(false),visible=$state(false);
 let gallery:HTMLElement;
 const images=studio.studioGallery;
 let requestedSlides=$state<number[]>([0]);
 $effect(()=>{if(visible){const next=(slide+1)%images.length;if(!requestedSlides.includes(slide)||!requestedSlides.includes(next))requestedSlides=[...new Set([...requestedSlides,slide,next])];}});
 const days=$derived(new Date(Date.UTC(year,month+1,0)).getUTCDate());
 const offset=$derived((new Date(Date.UTC(year,month,1)).getUTCDay()+6)%7);
 const monthLabel=$derived(new Intl.DateTimeFormat('en',{month:'long',year:'numeric',timeZone:'UTC'}).format(new Date(Date.UTC(year,month,1))));
 const isFirstMonth=$derived(year===initialYear&&month===initialMonth);
 const dateKey=(day:number)=>`${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
 const readable=(date:string)=>new Intl.DateTimeFormat('en',{weekday:'short',day:'numeric',month:'long',year:'numeric',timeZone:'UTC'}).format(new Date(date+'T00:00:00Z'));
 function changeMonth(direction:number){const next=new Date(Date.UTC(year,month+direction,1));year=next.getUTCFullYear();month=next.getUTCMonth();}
 onMount(()=>{
  const motion=window.matchMedia('(prefers-reduced-motion: reduce)');
  const observer=new IntersectionObserver(entries=>visible=entries[0].isIntersecting);observer.observe(gallery);
  const timer=window.setInterval(()=>{if(visible&&!paused&&!motion.matches&&!document.hidden)slide=(slide+1)%images.length;},5000);
  return ()=>{window.clearInterval(timer);observer.disconnect();};
 });
</script>

<section class="section booking-section" id="studio-booking">
 <div class="section-head"><div><h2>IdeaBay <span class="serif">the studio space</span></h2></div><p class="section-description">Choose your preferred date.<br/>Let’s bring your next session to life.</p></div>
 <div class="booking-grid">
  <div class="booking-calendar">
   <div class="calendar-heading"><h3>Pick your date</h3><span>01 / PLAN YOUR SESSION</span></div>
   <div class="calendar-month"><button onclick={()=>changeMonth(-1)} disabled={isFirstMonth} aria-label="Previous month">←</button><h4 aria-live="polite">{monthLabel}</h4><button onclick={()=>changeMonth(1)} aria-label="Next month">→</button></div>
   <div class="calendar-days">
    {#each ['M','T','W','T','F','S','S'] as day}<span class="calendar-weekday" aria-hidden="true">{day}</span>{/each}
    {#each Array(offset) as blank}<span aria-hidden="true"></span>{/each}
    {#each Array(days) as _,index}{@const date=dateKey(index+1)}<button class="calendar-day" class:chosen={selected===date} class:today={date===today} class:unavailable={unavailable.includes(date)} disabled={date<today||unavailable.includes(date)} aria-label={readable(date)+(unavailable.includes(date)?' — unavailable':'')} aria-pressed={selected===date} onclick={()=>selected=date}>{index+1}</button>{/each}
   </div>
   <div class="booking-selection"><p role="status">{selected?readable(selected):'Select a preferred date to get started.'}</p>{#if selected}<a class="button booking-enquire" href={'/contact?service=studio-session&studio=1&date='+selected}>Enquire about this date <span>↗</span></a>{:else}<button class="button booking-enquire" disabled>Enquire about this date <span>↗</span></button>{/if}<small>{availabilityLoaded?'Marked dates are unavailable. Other dates are requests; we’ll confirm availability.':'Live availability is unavailable. Dates are requests; we’ll confirm with you.'}</small></div>
  </div>
  <div class="booking-gallery" bind:this={gallery}>
   {#each images as item,index}{#if requestedSlides.includes(index)}<img class:visible={slide===index} src={photo(item.image,1400)} srcset={`${photo(item.image,800)} 800w, ${photo(item.image,1400)} 1400w`} sizes="(max-width: 700px) 88vw, 46vw" decoding="async" alt={item.alt} aria-hidden={slide!==index} width="1400" height="1400" loading="lazy"/>{/if}{/each}
   <div class="booking-gallery-shade"></div>
   <div class="booking-gallery-caption"><p class="eyebrow">INSIDE InceptChange</p><h3>{images[slide].caption}</h3><div class="booking-gallery-controls"><div>{#each images as item,index}<button class:chosen={slide===index} aria-label={`Show image ${index+1}: ${item.caption}`} aria-pressed={slide===index} onclick={()=>{slide=index;paused=true;}}></button>{/each}</div><button class="booking-gallery-pause" aria-label={paused?'Play studio slideshow':'Pause studio slideshow'} aria-pressed={paused} onclick={()=>paused=!paused}>{paused?'▶':'Ⅱ'}</button></div></div>
  </div>
 </div>
</section>

<style>.calendar-day.unavailable{text-decoration:line-through;background:#db919815;opacity:.65}.booking-gallery-controls>div{flex-wrap:wrap;gap:3px;max-width:calc(100% - 52px)}.booking-gallery-controls>div button{width:18px;height:24px}</style>
