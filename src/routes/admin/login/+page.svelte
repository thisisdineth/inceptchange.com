<script lang="ts">
 import { enhance } from '$app/forms';
 let { data, form } = $props();
 let pending=$state(false);
</script>
<svelte:head><title>Admin sign in | InceptChange</title><meta name="robots" content="noindex,nofollow,noarchive"/></svelte:head>
<section class="section admin-login"><p class="eyebrow"><span class="dot"></span> INCEPTCHANGE · PRIVATE ACCESS</p><h1 class="page-title">Studio <span class="serif">control.</span></h1><p>Sign in to view visits and manage the IdeaBay calendar.</p>
<form method="POST" use:enhance={()=>{pending=true;return async({update})=>{await update();pending=false;};}}>
 {#if !data.configured}<p class="notice" role="status">Admin access is awaiting Supabase configuration. Follow docs/ADMIN.md to connect the database and create an authorised account.</p>{/if}
 <label>Email<input name="email" type="email" autocomplete="username" required maxlength="254" disabled={!data.configured||pending}/></label>
 <label>Password<input name="password" type="password" autocomplete="current-password" required maxlength="256" disabled={!data.configured||pending}/></label>
 {#if form?.message}<p class="notice" role="alert">{form.message}</p>{/if}
 <button class="button dark" disabled={!data.configured||pending}>{pending?'Signing in…':'Sign in ↗'}</button>
</form></section>
<style>.admin-login{max-width:850px;margin:auto}.admin-login h1{font-size:64px}.admin-login>p:not(.eyebrow){color:var(--muted-ink);line-height:1.8}.admin-login form{margin-top:35px;max-width:460px;padding:30px;border:1px solid var(--line);border-radius:20px;background:var(--panel)}.notice{font-size:13px;line-height:1.8;margin-bottom:22px;color:var(--muted-ink)}button:disabled{opacity:.5;cursor:default}@media(max-width:700px){.admin-login h1{font-size:44px}}</style>
