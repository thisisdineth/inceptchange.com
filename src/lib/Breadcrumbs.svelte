<script lang="ts">let {items}:{items:{label:string;href?:string}[]}=$props();</script>
<nav class="breadcrumbs" aria-label="Breadcrumb"><a href="/">Home</a>{#each items as item}<span aria-hidden="true">/</span>{#if item.href}<a href={item.href}>{item.label}</a>{:else}<span aria-current="page">{item.label}</span>{/if}{/each}</nav>
