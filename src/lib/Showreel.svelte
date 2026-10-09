<script lang="ts">
 import SiteIcon from "$lib/SiteIcon.svelte";
 import {onMount} from 'svelte';
 let {poster}:{poster:string}=$props();
 let video:HTMLVideoElement;
 let source=$state<string|undefined>();
 let playing=$state(false);
 let muted=$state(true);
 let wantsPlayback=$state(false);
 let userPaused=false;
 onMount(()=>{
  const motion=window.matchMedia('(prefers-reduced-motion: reduce)');
  let visible=false;
  const sync=()=>{
   wantsPlayback=visible&&!document.hidden&&!userPaused&&!motion.matches;
   if(wantsPlayback){source='/images/ShowReel.mp4';video.play().catch(()=>{});}else video.pause();
  };
  const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync();},{threshold:.15});
  observer.observe(video);motion.addEventListener('change',sync);document.addEventListener('visibilitychange',sync);
  return ()=>{observer.disconnect();video.pause();motion.removeEventListener('change',sync);document.removeEventListener('visibilitychange',sync);};
 });
 function toggle(){
  if(playing){userPaused=true;wantsPlayback=false;video.pause();}
  else{userPaused=false;wantsPlayback=true;source='/images/ShowReel.mp4';video.play().catch(()=>{});}
 }
 function toggleSound(){muted=!muted;video.muted=muted;}
</script>
<video class="showreel-video" bind:this={video} src={source} {poster} autoplay={wantsPlayback} bind:muted loop playsinline preload="none" aria-label="InceptChange studio showreel" onplay={()=>playing=true} onpause={()=>playing=false} onloadeddata={()=>{if(wantsPlayback)video.play().catch(()=>{});else video.pause();}}></video>
<nav class="showreel-controls" aria-label="Showreel controls">
<button class="showreel-toggle" onclick={toggle} aria-label={playing?'Pause showreel':'Play showreel'}><SiteIcon name={playing?'pause':'play'}/> <span>{playing?'Pause showreel':'Play showreel'}</span></button>

<button class="showreel-toggle" onclick={toggleSound} aria-label={muted?'Unmute showreel':'Mute showreel'} aria-pressed={!muted}>
 <SiteIcon name={muted?'volume-x':'volume-2'} size={16}/>
 <span>{muted?'Sound on':'Sound off'}</span>
</button>
</nav>
