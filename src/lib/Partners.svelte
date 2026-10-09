<script lang="ts">
 const partners = [
  {file:'Picture1.png',name:'Ministry of Health, Sri Lanka'},
  {file:'Picture2.png',name:'Family Health Bureau'},
  {file:'Picture3.png',name:'UNICEF'},
  {file:'Picture4.png',name:'UNFPA'},
  {file:'Picture5.png',name:'The World Bank'},
  {file:'Picture6.png',name:'CERI — protecting childhood'},
  {file:'Picture7.png',name:'Partner organisation emblem'},
  {file:'Picture8.png',name:'UNESCAP'},
  {file:'Picture9.jpg',name:'Partner medical organisation emblem'},
  {file:'Picture10.png',name:'British Council'},
  {file:'Picture11.jpg',name:'Disaster Management Centre, Sri Lanka'},
  {file:'Picture12.jpg',name:'World Health Organization, Sri Lanka'},
  {file:'Picture13.png',name:'Blue Lanka Tours'},
  {file:'Picture14.jpg',name:'World Food Programme'},
  {file:'Koica Logo.jpeg',name:'KOICA — Korea International Cooperation Agency'},
  {file:'ILO Logo.png',name:'ILO — International Labour Organization'}
 ];
</script>

<section class="partners-section" aria-label="Our partners">
 <div class="partners-heading"><p class="eyebrow"><span class="dot"></span> OUR PARTNERS</p><p>Good company.<br/><span class="serif">Meaningful stories.</span></p></div>
 <div class="partner-grid">{#each partners as partner}<div class="partner-logo"><img src={'/images/partner%20logos/'+encodeURIComponent(partner.file)} alt={partner.name} width="220" height="120" loading="lazy" decoding="async"/></div>{/each}</div>
</section>

<style>
.partners-section{padding:50px 6% 65px;border-bottom:1px solid var(--line)}.partners-heading{display:flex;align-items:center;justify-content:space-between;gap:30px;margin-bottom:30px}.partners-heading>p:last-child{font-size:25px;line-height:1.2;letter-spacing:-.6px;text-align:right}.partner-grid{display:grid;grid-template-columns:repeat(8,minmax(0,1fr));gap:14px}.partner-logo{display:flex;align-items:center;justify-content:center;min-height:108px;padding:18px;background:#fff;border:1px solid var(--line);border-radius:12px}.partner-logo img{width:100%;height:76px;object-fit:contain;max-width:170px;transition:transform .25s}.partner-logo:hover img{transform:scale(1.04)}@media(max-width:1100px){.partner-grid{grid-template-columns:repeat(4,minmax(0,1fr))}}@media(max-width:600px){.partners-section{padding:35px 6% 45px}.partner-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.partners-heading>p:last-child{font-size:21px}.partner-logo{min-height:96px;padding:15px}.partner-logo img{height:66px}}@media(prefers-reduced-motion:reduce){.partner-logo img{transition:none}.partner-logo:hover img{transform:none}}
</style>
