<script lang="ts">
 import {onMount} from 'svelte';
 type Theme='system'|'light'|'dark';
 let preference=$state<Theme>('system');
 const choices:{value:Theme;label:string;icon:string}[]=[{value:'system',label:'System',icon:'◐'},{value:'light',label:'Light',icon:'☀'},{value:'dark',label:'Dark',icon:'☾'}];
 function apply(){
  const dark=preference==='dark'||(preference==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.dataset.theme=dark?'dark':'light';
  document.documentElement.style.colorScheme=dark?'dark':'light';
 }
 function select(theme:Theme){preference=theme;try{localStorage.setItem('inceptchange-theme',theme);}catch{}apply();}
 onMount(()=>{
  try{const saved=localStorage.getItem('inceptchange-theme');if(saved==='dark'||saved==='light'||saved==='system')preference=saved;}catch{}
  const media=window.matchMedia('(prefers-color-scheme: dark)');
  const sync=()=>{if(preference==='system')apply();};
  const storage=(event:StorageEvent)=>{if(event.key==='inceptchange-theme'){preference=event.newValue==='dark'||event.newValue==='light'?event.newValue:'system';apply();}};
  apply();media.addEventListener('change',sync);window.addEventListener('storage',storage);
  return ()=>{media.removeEventListener('change',sync);window.removeEventListener('storage',storage);};
 });
</script>
<div class="theme-control"><span class="theme-label">Appearance</span><div class="theme-options" role="group" aria-label="Colour theme">{#each choices as choice}<button aria-pressed={preference===choice.value} onclick={()=>select(choice.value)}><span aria-hidden="true">{choice.icon}</span>{choice.label}</button>{/each}</div></div>
