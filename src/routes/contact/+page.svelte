<script lang="ts">
 import { enquiryQuestions, readEnquiryJSON } from '$lib/enquiry';
 import Breadcrumbs from '$lib/Breadcrumbs.svelte';
 import SEO from '$lib/SEO.svelte';
 import { studio } from '$lib/data';
 import { page } from '$app/state';
 import { tick, onMount } from 'svelte';
 const studioRequest = $derived(page.url.searchParams.get('studio') === '1');
 const steps = $derived(studioRequest ? ['service', 'date', 'time', 'review', 'touches', 'contact'] as const : ['service', 'date', 'location', 'time', 'review', 'touches', 'contact'] as const);
 type Field = 'service' | 'date' | 'location' | 'time' | 'touches';
 let index = $state(0);
 let requestId = $state('');
 let brief = $state({ studio: page.url.searchParams.get('studio') === '1', service: page.url.searchParams.get('service') || '', date: page.url.searchParams.get('date') || '', location: page.url.searchParams.get('studio') === '1' ? 'IdeaBay — InceptChange studio' : '', time: '', touches: '', name: '', email: '' });
 let answer = $state(brief.service);
 let question = $state('What kind of service are you looking for? Tell us a little about the story you want to capture.');
 let busy = $state(false);
 let error = $state('');
 let sent = $state(false);
 let customerCopySent = $state(false);
 let ready = $state(true);
 let guided = $state(false);
 let conversation: HTMLDivElement;
 onMount(() => { requestId=crypto.randomUUID();ask(); });
 const step = $derived(steps[index]);
 const labels: Record<string,string> = { service:'Your story', date:'The date', location:'The place', time:'The time', review:'Your brief', touches:'Final touches', contact:'Stay in touch' };
 const suggestions: Record<string,string[]> = {service:['Podcast show','Event coverage','Brand film','Studio portraits'],date:['Date undecided'],location:['Help me choose a location'],time:['Time undecided'],touches:['Candid & natural','Cinematic wide shots','Close-up details','Leave it to your team']};
 async function scroll() { await tick(); conversation?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }
 async function ask() {
  if (step === 'review' || step === 'contact') return;
  if(guided){question=enquiryQuestions[step];ready=true;return;}
  busy=true; ready=false; error=''; question='';
  try {
   const response=await fetch('/api/enquiry/question',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({step,brief})});
   if(!response.ok) throw new Error((await readEnquiryJSON(response)).error || 'Please try again.');
   if(!response.headers.get('content-type')?.includes('text/event-stream')) throw new Error('Assistant unavailable');
   if(!response.body) throw new Error('Streaming is unavailable. Please retry.');
   const reader=response.body.getReader(); const decoder=new TextDecoder(); let buffer=''; let done=false;
   while(true){const part=await reader.read(); buffer+=decoder.decode(part.value,{stream:!part.done});let end;
    while((end=buffer.indexOf('\n\n'))>=0){const event=buffer.slice(0,end);buffer=buffer.slice(end+2);const data=event.split('\n').find(line=>line.startsWith('data: '));if(data){const chunk=JSON.parse(data.slice(6));if(chunk.error) throw new Error(chunk.error);if(chunk.fallback) guided=true;if(chunk.text) question+=chunk.text;if(chunk.done) done=true;}}
    if(part.done) break;
   }
   if(!done) throw new Error('The response was interrupted. Please retry.');
   ready=true;
  } catch {guided=true;question=enquiryQuestions[step];ready=true;error='';} finally {busy=false;scroll();}
 }
 async function next() {
  if(busy || !ready) return;
  if(step==='review'){index++;answer=brief.touches;await ask();return;}
  if(step==='contact'){await submit();return;}
  if(!answer.trim()) return;
  brief[step as Field]=answer.trim();index++;answer= stepValue();
  if(steps[index] !== 'review') await ask();
  scroll();
 }
 function stepValue(){return steps[index] in brief ? brief[steps[index] as Field] : '';}
 async function back(){if(busy||index===0)return;index--;answer=stepValue();ready=true;error='';if(step!=='review'&&step!=='contact')await ask();}
 async function submit(){busy=true;error='';try{const response=await fetch('/api/enquiry/submit',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({brief,requestId})});const result=await readEnquiryJSON(response);if(!response.ok||!result.sent)throw new Error(result.error||'Please try again.');customerCopySent=result.customerCopySent===true;sent=true;}catch(e){error=e instanceof Error?e.message:'Please try again.';}finally{busy=false;scroll();}}
</script>

<SEO title="Contact & Book Your Creative Project" description="Build your creative brief with InceptChange. Plan photography, film and event coverage in Sri Lanka, one question at a time." type="ContactPage"/>
<section class="section story-contact">
 <Breadcrumbs items={[{label:'Contact'}]}/>
 <div class="story-layout">
  <div class="story-copy">
   <p class="eyebrow"><span class="dot"></span> EVERY GREAT FRAME STARTS HERE</p>
   <h1 class="page-title">Tell us<br/><span class="serif">your story.</span></h1>
   <p class="intro">A big occasion. A little idea. Something worth capturing. Let’s shape it together, one question at a time.</p>
   <div class="story-note"><span>✳</span><p>Your vision, our next conversation.<small>A thoughtful brief in just a few steps.</small></p></div>
   <div class="story-direct"><span>Prefer a conversation?</span><a href={'mailto:'+studio.contacts.email}>{studio.contacts.email} ↗</a><a href="tel:+94787773059">+94 78 777 3059</a></div>
  </div>
  <div class="story-card" bind:this={conversation}>

   {#if sent}
    <div class="story-success" role="status"><span>✓</span><p class="eyebrow">YOUR NEXT CHAPTER</p><h2>Your story is<br/><em class="serif">in good hands.</em></h2><p>Your enquiry has been sent to our team. We’ll contact you soon at <strong>{brief.email}</strong> to talk through the details.</p><p>{customerCopySent?'A copy of your brief has also been sent to your email.':'Your enquiry reached our team, but we couldn’t send your email copy. We’ll share the details when we contact you.'}</p><a class="button dark" href="/work">Explore our work ↗</a></div>
   {:else}
    <div class="story-progress"><span>0{index+1} / {String(steps.length).padStart(2,'0')}</span><span>{labels[step]}</span></div>
    <div class="progress-track"><span style:width={`${((index+1)/steps.length)*100}%`}></span></div>
    {#if guided}<p class="guided-note" role="status">Our AI companion is unavailable right now. You can still complete your brief and send it to our team.</p>{/if}
    <form class="story-form" onsubmit={(event)=>{event.preventDefault();next();}}>
     {#if step==='review' || step==='contact'}
      <p class="eyebrow">{step==='review'?'THE STORY SO FAR':'ONE LAST INTRODUCTION'}</p>
      <h2>{step==='review'?'Your idea, taking shape.':'Who should we contact?'}</h2>
      <dl class="brief-summary">{#each ['service','date','location','time'] as field}<div><dt>{field==='service'?'Service / idea':field}</dt><dd>{brief[field as Field]}</dd></div>{/each}{#if step==='contact'}<div><dt>Creative touches</dt><dd>{brief.touches}</dd></div>{/if}</dl>
      {#if step==='review'}<p class="story-hint">Looking good? Next, add the details that make it yours. Use Back to change your answers.</p>{:else}
       <label>Your name<input bind:value={brief.name} required autocomplete="name" maxlength="150" placeholder="What should we call you?" disabled={busy}/></label>
       <label>Email address<input bind:value={brief.email} type="email" required autocomplete="email" maxlength="254" placeholder="you@example.com" disabled={busy}/></label>
       <p class="story-hint">Submitting shares this brief and your contact details with our team at inceptchange@gmail.com so we can respond. This is an enquiry; availability will be confirmed by our team.</p>
      {/if}
     {:else}
      <p class="eyebrow">{index===0?'LET’S START WITH YOU':'A LITTLE MORE ABOUT YOUR VISION'}</p>
      <h2 class="assistant-question" aria-live="polite">{question || 'Thinking about your story…'}{#if busy}<span class="stream-cursor" aria-hidden="true">▍</span>{/if}</h2>
      <label for="story-answer">{labels[step]}{#if step==='date'&&studioRequest}<input id="story-answer" type="date" bind:value={answer} required disabled={busy||!ready}/>{:else}<textarea id="story-answer" bind:value={answer} rows={step==='service'||step==='touches'?4:2} maxlength="3000" required disabled={busy||!ready} placeholder={step==='date'?'e.g. 24 December 2026, or date undecided':step==='time'?'e.g. 4 pm, around 3 hours':step==='location'?'e.g. Colombo, a venue name, or still exploring':step==='touches'?'Favourite angles, must-have moments, mood or reference links…':'Tell us what you have in mind…'}></textarea>{/if}</label>
      <div class="story-chips">{#each (step==='date'&&studioRequest?[]:suggestions[step]) || [] as suggestion}<button type="button" disabled={busy||!ready} onclick={()=>answer=step==='touches'&&answer?`${answer}, ${suggestion}`:suggestion}>{suggestion} +</button>{/each}</div>
     {/if}
     {#if error}<div class="story-error" role="alert">{error}{#if !ready}<button type="button" onclick={ask} disabled={busy}>Retry question ↻</button>{/if}</div>{/if}
     <div class="story-actions">{#if index>0}<button class="story-back" type="button" onclick={back} disabled={busy}>← Back</button>{:else}<span class="story-hint">Made for your kind of story.</span>{/if}<button class="button dark" type="submit" disabled={busy||(!ready&&step!=='review'&&step!=='contact')}>{busy?'Just a moment…':step==='contact'?'Send my enquiry ↗':step==='review'?'Add final touches ↗':'Continue ↗'}</button></div>
    </form>
   {/if}
  </div>
 </div>
</section>

<style>
 .guided-note{padding:18px 32px 0;color:var(--muted-ink);font-size:12px;line-height:1.7} .story-contact{padding-top:45px}.story-layout{display:grid;grid-template-columns:.85fr 1.15fr;gap:8%;align-items:start}.story-copy{padding-top:45px}.story-copy .intro{max-width:370px;margin-bottom:32px}.story-note{display:flex;align-items:center;gap:18px;margin:35px 0 50px}.story-note>span{font-size:48px;color:#68a49b}.story-note p{font-size:14px}.story-note small{display:block;color:var(--muted-ink);font-size:12px;margin-top:8px}.story-direct{display:flex;flex-direction:column;gap:12px;font-size:14px}.story-direct>span{font-size:11px;color:var(--muted-ink);margin-bottom:3px}.story-card{border:1px solid var(--line);border-radius:24px;background:var(--panel);box-shadow:0 24px 70px #27463808;overflow:hidden;scroll-margin-top:110px}.story-progress{display:flex;justify-content:space-between;padding:26px 32px 14px;font-size:10px;letter-spacing:1px;color:var(--muted-ink)}.progress-track{height:3px;background:var(--line);margin:0 32px}.progress-track span{display:block;height:100%;background:#79b9ad;transition:width .4s}.story-form{padding:32px}.story-form h2{font-size:28px;letter-spacing:-.8px;line-height:1.4;margin:18px 0 28px}.assistant-question{min-height:100px;white-space:pre-wrap}.story-form label{color:var(--muted-ink)}.story-form textarea{background:var(--card);color:var(--page-ink);border:1px solid var(--line);border-radius:12px;resize:vertical;line-height:1.7}.story-chips{display:flex;flex-wrap:wrap;gap:8px;margin-top:-8px;margin-bottom:22px}.story-chips button{border:1px solid var(--line);background:var(--card);color:var(--page-ink);border-radius:999px;font-size:11px;padding:10px 14px}.story-chips button:hover{border-color:#79b9ad;background:#8ccfcb15}.story-hint{font-size:11px;color:var(--muted-ink);line-height:1.8}.story-actions{display:flex;justify-content:space-between;align-items:center;gap:16px;margin-top:30px;padding-top:24px;border-top:1px solid var(--line)}.story-back{border:0;background:transparent;color:var(--muted-ink);font-size:12px;padding:10px}.story-actions button:disabled,.story-chips button:disabled{opacity:.5;cursor:wait;transform:none}.brief-summary{margin:0 0 24px}.brief-summary div{padding:14px 0;border-bottom:1px solid var(--line);display:grid;grid-template-columns:100px 1fr;gap:15px;font-size:13px}.brief-summary dt{text-transform:capitalize;color:var(--muted-ink);font-size:11px}.brief-summary dd{margin:0;white-space:pre-wrap;overflow-wrap:anywhere;line-height:1.7}.story-error{padding:16px;border:1px solid #db919880;border-radius:12px;font-size:12px;line-height:1.7;margin-top:18px}.story-error button{display:block;margin-top:10px;border:0;background:transparent;color:var(--fill-accent)}.story-success{padding:50px 32px}.story-success>span{display:grid;place-items:center;background:#8ccfcb30;color:var(--fill-accent);width:64px;height:64px;border-radius:50%;font-size:26px;margin-bottom:30px}.story-success h2{font-size:42px;margin:20px 0}.story-success>p:not(.eyebrow){font-size:14px;line-height:1.8;color:var(--muted-ink);margin-bottom:30px;overflow-wrap:anywhere}.stream-cursor{color:#79b9ad;animation:pulse 1s infinite}@keyframes pulse{50%{opacity:0}}@media(max-width:900px){.story-layout{gap:4%;grid-template-columns:.8fr 1.2fr}.story-form,.story-progress{padding-left:24px;padding-right:24px}.progress-track{margin:0 24px}}@media(max-width:700px){.story-layout{grid-template-columns:1fr;gap:35px}.story-copy{padding-top:15px}.story-copy .intro{margin-bottom:20px}.story-note{margin:24px 0}.story-direct{font-size:12px}.story-form h2{font-size:25px}.story-actions>.story-hint{max-width:100px}.story-card{border-radius:18px}.story-contact{padding-top:30px}.story-success h2{font-size:36px}}@media(prefers-reduced-motion:reduce){.stream-cursor{animation:none}}
</style>
