<script lang="ts">
 import {onMount} from 'svelte';
 import {afterNavigate} from '$app/navigation';
 let visible=$state(false);
 let update=()=>{};
 afterNavigate(()=>update());
 onMount(()=>{
  let frame=0;
  update=()=>{
   const opening=document.querySelector('.hero-stage');
   visible=opening?opening.getBoundingClientRect().bottom<=110:true;
  };
  const queue=()=>{if(!frame)frame=requestAnimationFrame(()=>{frame=0;update();});};
  window.addEventListener('scroll',queue,{passive:true});window.addEventListener('resize',queue);update();
  return ()=>{cancelAnimationFrame(frame);window.removeEventListener('scroll',queue);window.removeEventListener('resize',queue);update=()=>{};};
 });
</script>
<a class="contact-now" class:visible href="tel:+94787773059" aria-label="Contact now — call +94 78 777 3059" inert={!visible} aria-hidden={!visible}>
 <span class="contact-now-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.9v3a2 2 0 0 1-2.2 2A19.8 19.8 0 0 1 3.1 5.2 2 2 0 0 1 5.1 3h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.5 2.1L9 11a16 16 0 0 0 4 4l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.9.6 2.9.7a2 2 0 0 1 1.7 2Z"/></svg></span>
 <span>Contact now</span><span class="contact-now-arrow" aria-hidden="true">↗</span>
</a>
