<script lang="ts">
 import {onMount} from 'svelte';
 let section:HTMLElement;
 let progress=$state(1);
 const stats=[{value:9,suffix:'+',label:'Years'},{value:350,suffix:'+',label:'Projects'},{value:5,suffix:'M',label:'Reach'},{value:1,suffix:'K+',label:'Clients'}];
 onMount(()=>{
  const motion=window.matchMedia('(prefers-reduced-motion: reduce)');
  if(motion.matches)return;
  progress=0;
  let frame=0;
  const finish=()=>{if(motion.matches){cancelAnimationFrame(frame);progress=1;}};
  const observer=new IntersectionObserver(entries=>{
   if(!entries.some(entry=>entry.isIntersecting))return;
   observer.disconnect();
   if(motion.matches){progress=1;return;}
   const start=performance.now();
   const tick=(now:number)=>{
    const elapsed=Math.min(1,(now-start)/1600);
    progress=1-Math.pow(1-elapsed,3);
    if(elapsed<1)frame=requestAnimationFrame(tick);
   };
   frame=requestAnimationFrame(tick);
  },{threshold:.25});
  observer.observe(section);motion.addEventListener('change',finish);
  return ()=>{observer.disconnect();cancelAnimationFrame(frame);motion.removeEventListener('change',finish);};
 });
</script>

<section class="studio-stats" bind:this={section} aria-label="InceptChange in numbers">
 <p class="eyebrow"><span class="dot"></span> OUR STORY IN NUMBERS</p>
 <div class="stats-grid">
  {#each stats as stat}
   <div class="stat-item" aria-label={`${stat.value}${stat.suffix} ${stat.label}`}>
    <span class="stat-number" aria-hidden="true">{Math.round(stat.value*progress)}<span class="stat-suffix">{stat.suffix}</span></span>
    <span class="stat-label" aria-hidden="true">{stat.label}</span>
   </div>
  {/each}
 </div>
</section>
