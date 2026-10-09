<script lang="ts">
 import SiteIcon from "$lib/SiteIcon.svelte";
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
 <span class="contact-now-icon"><SiteIcon name="phone" size={20}/></span>
 <span>Contact now</span><span class="contact-now-arrow" aria-hidden="true"><SiteIcon name="arrow-up-right"/></span>
</a>
