<script lang="ts">
 import {onMount} from 'svelte';
 import {navigating} from '$app/state';
 let intro=$state(false),leaving=$state(false),routeLoading=$state(false);
 let mounted=$state(false),reduceMotion=$state(false);
 $effect(()=>{
  if(!mounted||reduceMotion||!navigating.to||navigating.to.url.pathname===navigating.from?.url.pathname){routeLoading=false;return;}
  const timer=window.setTimeout(()=>routeLoading=true,140);
  return ()=>window.clearTimeout(timer);
 });
 onMount(()=>{
  const motion=window.matchMedia('(prefers-reduced-motion: reduce)');
  reduceMotion=motion.matches;mounted=true;
  if(reduceMotion)return;
  let disposed=false;
  let exitTimer:number;
  intro=true;document.documentElement.classList.add('site-intro-active');
  const critical=document.querySelector<HTMLImageElement>('.slideshow-image.current');
  const imageReady=critical?critical.decode().catch(()=>{}):Promise.resolve();
  let readinessTimer:number;
  const maximumWait=new Promise<void>(resolve=>readinessTimer=window.setTimeout(resolve,2200));
  const entrance=new Promise<void>(resolve=>exitTimer=window.setTimeout(resolve,1000));
  Promise.all([entrance,Promise.race([imageReady,maximumWait])]).then(()=>{
   if(disposed)return;
   window.clearTimeout(readinessTimer);leaving=true;
   document.documentElement.classList.remove('site-intro-active');
   exitTimer=window.setTimeout(()=>intro=false,750);
  });
  const preference=()=>{
   reduceMotion=motion.matches;
   if(reduceMotion){intro=false;routeLoading=false;document.documentElement.classList.remove('site-intro-active');}
  };
  motion.addEventListener('change',preference);
  return ()=>{disposed=true;window.clearTimeout(exitTimer);window.clearTimeout(readinessTimer);motion.removeEventListener('change',preference);document.documentElement.classList.remove('site-intro-active');};
 });
</script>

{#if intro}
 <div class="page-intro" class:leaving role="status" aria-label="Loading InceptChange">
  <div class="intro-glow intro-glow-teal"></div><div class="intro-glow intro-glow-peach"></div>
  <div class="intro-brand">
   <div class="intro-logo"><span class="intro-orbit"></span><img src="/images/logo.png" alt="" width="256" height="212"/></div>
   <p class="intro-wordmark">incept<span>change</span><i>✳</i></p>
   <p class="intro-caption">STORIES COMING INTO FOCUS</p>
   <div class="intro-line"><span></span></div>
  </div>
  <span class="intro-corner">SRI LANKA · CREATIVE STUDIO</span>
 </div>
{/if}
{#if routeLoading&&!intro}<div class="route-loader" role="status" aria-label="Loading page"><span></span></div>{/if}
