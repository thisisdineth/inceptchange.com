<script lang="ts">
 import SiteIcon from "$lib/SiteIcon.svelte";import {page} from '$app/state';</script>
<svelte:head><title>{page.status} — Page unavailable | InceptChange</title><meta name="robots" content="noindex, follow"/></svelte:head>
<section class="section"><p class="eyebrow">{page.status}</p><h1 class="page-title">{page.status===404?'Page not found.':'Something went wrong.'}</h1><p class="intro">{page.status===404?'Explore our latest work or get in touch to discuss your story.':'Please try again, or contact the studio for help.'}</p><a class="button dark" href="/"><span class="icon-label">Back to home <SiteIcon name="arrow-up-right"/></span></a></section>
