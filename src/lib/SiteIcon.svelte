<script lang="ts">
 import Icon from '@iconify/svelte';
 import icon0 from '@iconify-icons/lucide/arrow-up-right';
 import icon1 from '@iconify-icons/lucide/arrow-left';
 import icon2 from '@iconify-icons/lucide/arrow-right';
 import icon3 from '@iconify-icons/lucide/arrow-up';
 import icon4 from '@iconify-icons/lucide/arrow-down';
 import icon5 from '@iconify-icons/lucide/asterisk';
 import icon6 from '@iconify-icons/lucide/check';
 import icon7 from '@iconify-icons/lucide/x';
 import icon8 from '@iconify-icons/lucide/menu';
 import icon9 from '@iconify-icons/lucide/sun';
 import icon10 from '@iconify-icons/lucide/moon';
 import icon11 from '@iconify-icons/lucide/contrast';
 import icon12 from '@iconify-icons/lucide/phone';
 import icon13 from '@iconify-icons/lucide/play';
 import icon14 from '@iconify-icons/lucide/pause';
 import icon15 from '@iconify-icons/lucide/volume-x';
 import icon16 from '@iconify-icons/lucide/volume-2';
 const icons={'arrow-up-right':icon0,'arrow-left':icon1,'arrow-right':icon2,'arrow-up':icon3,'arrow-down':icon4,'asterisk':icon5,'check':icon6,'x':icon7,'menu':icon8,'sun':icon9,'moon':icon10,'system':icon11,'phone':icon12,'play':icon13,'pause':icon14,'volume-x':icon15,'volume-2':icon16};
 let {name,size='1em'}:{name:keyof typeof icons;size?:string|number}=$props();
</script>
<Icon icon={icons[name]} width={size} height={size} inline aria-hidden="true" focusable="false" style="flex-shrink:0;display:inline-block;"/>
