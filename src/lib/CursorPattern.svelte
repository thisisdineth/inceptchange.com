<script lang="ts">
 import {onMount} from 'svelte';
 let canvas: HTMLCanvasElement;
 onMount(()=>{
  const context=canvas.getContext('2d');
  if(!context)return;
  const capability=window.matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
  const colours=['#8ccfcb','#fbcc99','#d5e79e','#db9198'];
  type Particle={x:number;y:number;born:number;colour:string;size:number};
  let particles:Particle[]=[];
  let frame=0,width=0,height=0,x=0,y=0,ringX=0,ringY=0,lastX=0,lastY=0,lastMove=0;
  let visible=false,interactive=false,colourIndex=0;
  const resize=()=>{
   width=window.innerWidth;height=window.innerHeight;
   const ratio=Math.min(window.devicePixelRatio||1,2);
   canvas.width=Math.round(width*ratio);canvas.height=Math.round(height*ratio);
   context.setTransform(ratio,0,0,ratio,0,0);
  };
  const clear=()=>{visible=false;particles=[];cancelAnimationFrame(frame);frame=0;context.clearRect(0,0,width,height);};
  const draw=(now:number)=>{
   frame=0;context.clearRect(0,0,width,height);
   if(!visible||!capability.matches)return;
   ringX+=(x-ringX)*.2;ringY+=(y-ringY)*.2;
   const idleFade=Math.max(0,1-(now-lastMove-250)/650);
   particles=particles.filter(p=>now-p.born<650);
   for(const p of particles){
    const life=1-(now-p.born)/650;
    context.globalAlpha=life*.5;context.strokeStyle=p.colour;context.lineWidth=1.2;
    context.beginPath();context.arc(p.x,p.y,p.size+(1-life)*6,0,Math.PI*2);context.stroke();
   }
   context.globalAlpha=idleFade*.65;context.strokeStyle=colours[colourIndex%colours.length];context.lineWidth=1;
   context.beginPath();context.arc(ringX,ringY,interactive?24:15,0,Math.PI*2);context.stroke();
   context.globalAlpha=1;
   if(idleFade>0||particles.length)frame=requestAnimationFrame(draw);
  };
  const move=(event:PointerEvent)=>{
   if(!capability.matches||event.pointerType!=='mouse'){clear();return;}
   x=event.clientX;y=event.clientY;lastMove=performance.now();
   if(!visible){ringX=x;ringY=y;lastX=x;lastY=y;visible=true;}
   interactive=event.target instanceof Element&&!!event.target.closest('a,button,input,textarea,select,[role="button"]');
   // Leave one small colour ring per 18px of travel, with a bounded particle count.
   if(Math.hypot(x-lastX,y-lastY)>18){
    particles.push({x,y,born:lastMove,colour:colours[colourIndex++%colours.length],size:3+colourIndex%3});
    if(particles.length>24)particles.shift();lastX=x;lastY=y;
   }
   if(!frame)frame=requestAnimationFrame(draw);
  };
  const leave=(event:PointerEvent)=>{if(!event.relatedTarget)clear();};
  const visibility=()=>{if(document.hidden)clear();};
  resize();
  window.addEventListener('pointermove',move,{passive:true});window.addEventListener('pointerout',leave,{passive:true});
  window.addEventListener('resize',resize);window.addEventListener('blur',clear);document.addEventListener('visibilitychange',visibility);capability.addEventListener('change',clear);
  return ()=>{clear();window.removeEventListener('pointermove',move);window.removeEventListener('pointerout',leave);window.removeEventListener('resize',resize);window.removeEventListener('blur',clear);document.removeEventListener('visibilitychange',visibility);capability.removeEventListener('change',clear);};
 });
</script>

<canvas bind:this={canvas} class="cursor-pattern" aria-hidden="true"></canvas>

<style>
 .cursor-pattern{position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:50;}
 @media (hover:none),(pointer:coarse),(prefers-reduced-motion:reduce){.cursor-pattern{display:none;}}
</style>
