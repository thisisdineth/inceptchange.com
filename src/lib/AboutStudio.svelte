<script lang="ts">
 import {onMount} from 'svelte';
 const copy=[
  'InceptChange is a Creative Digital Studio based in Maharagama, Sri Lanka, with roots in Dharga Town. Working across Sri Lanka, we share a singular belief — that every brand has a story worth telling beautifully.',
  'Over 9+ years, we have partnered with NGOs, startups, corporate brands, and families to produce photography, videography, documentary films, and events that truly endure.'
 ];
 const tokens=copy.map(text=>text.split(' '));
 const count=tokens.reduce((total,words)=>total+words.length,0);
 const paragraphs=tokens.map((words,p)=>words.map((text,i)=>({text,index:i+tokens.slice(0,p).reduce((total,previous)=>total+previous.length,0),emphasis:p===1&&(i===1||i===2)})));
 let section:HTMLElement;
 let fill=$state(1);
 onMount(()=>{
  const motion=window.matchMedia('(prefers-reduced-motion: reduce)');
  let frame=0;
  const update=()=>{
   frame=0;
   const bounds=section.getBoundingClientRect();
   fill=motion.matches?1:Math.max(0,Math.min(1,(window.innerHeight*.8-bounds.top)/(bounds.height+window.innerHeight*.15)));
  };
  const queue=()=>{if(!frame)frame=requestAnimationFrame(update);};
  window.addEventListener('scroll',queue,{passive:true});window.addEventListener('resize',queue);motion.addEventListener('change',queue);update();
  return ()=>{cancelAnimationFrame(frame);window.removeEventListener('scroll',queue);window.removeEventListener('resize',queue);motion.removeEventListener('change',queue);};
 });
</script>

<section id="about" class="section about-studio" bind:this={section} style={`--text-progress:${fill};--word-count:${count};`}>
 <div class="about-studio-heading"><p class="eyebrow"><span class="dot"></span> THE PEOPLE BEHIND THE LENS</p><h2>About <span class="serif">InceptChange</span></h2></div>
 <div class="about-scroll-copy">
  {#each paragraphs as words}
   <p>{#each words as word}<svelte:element this={word.emphasis?'strong':'span'} class="fill-word" style={`--word-index:${word.index};`}>{word.text}</svelte:element>{' '}{/each}</p>
  {/each}
  <a class="text-link" href="/contact">Meet your creative partner <span>↗</span></a>
 </div>
</section>
