<script lang="ts">
 import {page} from '$app/state';
 import {studio,photo} from '$lib/data';
 let {title,description,image=studio.covers.photography}: {title:string;description:string;image?:string}=$props();
 const origin='https://www.inceptchange.com';
</script>
<svelte:head>
 <title>{title} | InceptChange</title><meta name="description" content={description}/>
 <link rel="canonical" href={origin+page.url.pathname}/><meta property="og:type" content="website"/><meta property="og:site_name" content="InceptChange"/><meta property="og:title" content={title}/><meta property="og:description" content={description}/><meta property="og:url" content={origin+page.url.pathname}/><meta property="og:image" content={photo(image)}/><meta name="twitter:card" content="summary_large_image"/>
</svelte:head>
