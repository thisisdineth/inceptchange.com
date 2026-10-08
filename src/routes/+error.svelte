<script lang="ts">import {page} from '$app/state';</script>
<svelte:head><title>{page.status} — Page unavailable | InceptChange</title><meta name="robots" content="noindex, follow"/></svelte:head>
<section class="section"><p class="eyebrow">{page.status}</p><h1 class="page-title">{page.status===404?'Page not found.':'Something went wrong.'}</h1><p class="intro">{page.status===404?'Explore our latest work or get in touch to discuss your story.':'Please try again, or contact the studio for help.'}</p><a class="button dark" href="/">Back to home ↗</a></section>
