import { store } from "../main.js";
import { embed } from "../util.js";
import { score } from "../score.js";
import { fetchEditors, fetchList, fetchNewTags } from "../content.js";
import Spinner from "../components/Spinner.js";

export default {
components:{Spinner},
template:`

<main v-if="loading"><Spinner/></main>

<div v-else class="page-list-scroll-shell">
<div class="page-list-custom">

<div class="central-container">

<div v-for="([level,err],i) in list" class="level-card">
<span v-if="isLevelNew(level)" class="new-corner-tag">NEW</span>

<div class="level-video-side">
<div class="lazy-video"
     :data-src="embedWithPlayerApi(level.verification)"
     ref="lazyVideos">
</div>
</div>

<div class="level-details-side">

<div class="level-title-info">
<div v-if="isLevelDecorated(level) || level.formerTop1" class="level-badges">
<span v-if="isLevelDecorated(level)" class="decorated-tag">Decorated</span>
<span v-if="level.formerTop1" class="former-top-1-tag">Former Top 1</span>
</div>
<div class="title-left">
<div class="rank-row">
<span class="level-rank">#{{i+1}}</span>
<span v-if="i+1>150" class="legacy-rank-label">legacy</span>
</div>

<div class="level-name-row">
<h2>{{level.name}}</h2>
</div>
</div>
</div>

<div class="authors-box centered-authors">
<div>
<span>CREATOR</span>
<span>{{level.creators.join(', ')}}</span>
</div>
<div>
<span>VERIFIER</span>
<span>{{level.verifier}}</span>
</div>
<div>
<span>PUBLISHER</span>
<span>{{level.publisher||level.author}}</span>
</div>
</div>

<div class="stats-middle-grid">

<div class="stat-card">
<span class="stat-label">ID</span>
<div class="id-copy-box">
<span class="stat-value">{{level.id}}</span>
<button class="copy-id" @click="copyID(level.id)">
<svg viewBox="0 0 24 24">
<path fill="currentColor"
d="M16 1H4C2.9 1 2 1.9 2 3V15H4V3H16V1ZM19
5H8C6.9 5 6 5.9 6 7V21C6 22.1 6.9 23 8 23H19
C20.1 23 21 22.1 21 21V7C21 5.9 20.1 5 19
5ZM19 21H8V7H19V21Z"/>
</svg>
</button>
</div>
</div>

<div class="stat-card">
<span class="stat-label">Points</span>
<span class="stat-value">{{score(i+1,100,level.percentToQualify)}}</span>
</div>

<div class="stat-card">
<span class="stat-label">{{(level.length||level.Length)?'Length':'Password'}}</span>
<span class="stat-value">{{level.length||level.Length||level.password||'Free'}}</span>
</div>

<div class="stat-card">
<span class="stat-label">Requirement</span>
<span class="stat-value">{{ Number(level.percentToQualify) === 100 ? '100%' : (level.percentToQualify + '%+') }}</span>
</div>

</div>

<button class="show-records-btn" @click="toggleRecords(i)">
{{isOpen(i)?'Hide Records':'Show Records'}}<span v-if="level.records && level.records.length"> ({{level.records.length}})</span>
</button>

<transition
@before-enter="beforeRecordsEnter"
@enter="recordsEnter"
@after-enter="afterRecordsEnter"
@before-leave="beforeRecordsLeave"
@leave="recordsLeave"
@after-leave="afterRecordsLeave"
>
<div v-if="isOpen(i)" class="records-panel">
<div class="records-panel-inner">
<table v-if="level.records && level.records.length > 0" class="records">
<tr v-for="record in level.records">
<td>{{record.percent}}%</td>
<td><a :href="record.link" target="_blank">{{record.user}}</a></td>
<td>{{record.hz}}Hz</td>
</tr>
</table>
<p v-if="!level.records || level.records.length===0" class="no-records-message">No records on this level yet.</p>
</div>
</div>
</transition>

</div>
</div>
</div>

<div class="meta-container">
<div class="meta editors-panel">
<h3>List Editors</h3>
<ol class="editors">
<li v-for="editor in editors">
<img :src="iconFor(editor.role)">
<a :href="editor.link" target="_blank">{{editor.name}}</a>
</li>
</ol>
</div>
<div class="meta requirements-panel">
<h3>Submission Requirements</h3>
<p>Achieved the record without using hacks (however, FPS bypass is allowed, up to 360fps)</p>
<p>Achieved the record on the level that is listed on the site - please check the level ID before you submit a record</p>
<p>Have either source audio or clicks/taps in the video. Edited audio only does not count</p>
<p>The recording must have a previous attempt and entire death animation shown before the completion, unless the completion is on the first attempt. Everyplay records are exempt from this</p>
<p>The recording must also show the player hit the endwall, or the completion will be invalidated.</p>
<p>Do not use secret routes or bug routes</p>
<p>Do not use easy modes, only a record of the unmodified level qualifies</p>
<p>Once a level falls onto the Legacy List, we accept records for it for 24 hours after it falls off, then afterwards we never accept records for said level</p>
</div>
</div>

</div>
</div>
`,
data:()=>({

list:[],
editors:[],
loading:true,
toggledRecords:{},
observer:null,
newTags:{},
youtubePlayers:[],
youtubeApiPromise:null,
store
}),
async mounted(){
const fetchedList = await fetchList();
this.list = Array.isArray(fetchedList)
? fetchedList.filter(([level])=>Boolean(level))
: [];
this.editors=(await fetchEditors())||[];
this.newTags=(await fetchNewTags())||{};
this.loading=false;
this.ensureYoutubeApi().catch(()=>{});

this.$nextTick(()=>{

this.observer = new IntersectionObserver(entries=>{
entries.forEach(entry=>{
if(entry.isIntersecting){

const el = entry.target;
const src = el.dataset.src;

el.innerHTML = `
<iframe src="${src}"
allowfullscreen
loading="lazy"
frameborder="0">
</iframe>
`;

const iframe = el.querySelector("iframe");
this.attachYoutubePlayer(iframe);

this.observer.unobserve(el);

}
});
},{
rootMargin:"900px 0px",
threshold:0.01
});

const lazyVideos = Array.isArray(this.$refs.lazyVideos)
? this.$refs.lazyVideos
: [this.$refs.lazyVideos].filter(Boolean);

lazyVideos.forEach(el=>{
this.observer.observe(el);
});

});

},
beforeUnmount(){
if(this.observer){
this.observer.disconnect();
}
this.youtubePlayers.forEach(player=>{
try{
player.destroy();
}catch{}
});
this.youtubePlayers = [];
},
methods:{
embed,
embedWithPlayerApi(video){
const base = this.embed(video);
const sep = base.includes('?') ? '&' : '?';
return `${base}${sep}enablejsapi=1&playsinline=1&rel=0&modestbranding=1`;
},
ensureYoutubeApi(){
if(window.YT?.Player){
return Promise.resolve(window.YT);
}
if(this.youtubeApiPromise){
return this.youtubeApiPromise;
}
this.youtubeApiPromise = new Promise((resolve,reject)=>{
const previousReady = window.onYouTubeIframeAPIReady;
window.onYouTubeIframeAPIReady = ()=>{
if(typeof previousReady === 'function'){
try{ previousReady(); }catch{}
}
resolve(window.YT);
};

let script = document.querySelector('script[data-youtube-iframe-api]');
if(!script){
script = document.createElement('script');
script.src = 'https://www.youtube.com/iframe_api';
script.async = true;
script.setAttribute('data-youtube-iframe-api','1');
script.onerror = ()=>reject(new Error('Failed to load YouTube API'));
document.head.appendChild(script);
}
});
return this.youtubeApiPromise;
},
pauseOtherVideos(activeIframe){
this.youtubePlayers = this.youtubePlayers.filter(player=>{
try{
const playerIframe = player.getIframe?.();
if(!playerIframe || !playerIframe.isConnected){
return false;
}
if(playerIframe && playerIframe !== activeIframe){
player.pauseVideo();
}
}catch{}
return true;
});
},
attachYoutubePlayer(iframe){
if(!iframe || iframe.dataset.youtubeBound === '1'){
return;
}
iframe.dataset.youtubeBound = '1';
const setup = ()=>{
this.ensureYoutubeApi()
.then(YT=>{
if(!YT?.Player){
return;
}
const player = new YT.Player(iframe,{
events:{
onStateChange: event=>{
if(event?.data === YT.PlayerState.PLAYING){
const currentIframe = event.target?.getIframe?.() ?? iframe;
this.pauseOtherVideos(currentIframe);
}
}
}
});
this.youtubePlayers.push(player);
})
.catch(()=>{});
};
if(typeof window.requestIdleCallback === 'function'){
window.requestIdleCallback(setup,{ timeout: 300 });
}else{
setTimeout(setup,0);
}
},
score,
isOpen(i){return this.toggledRecords[i]===true},
toggleRecords(i){this.toggledRecords={[i]:!this.toggledRecords[i]}},
isLevelNew(level){
const path = String(level?.path||'').toLowerCase();
if(!path) return false;
const keyWithExt = `${path}.json`;
const raw = this.newTags[path] ?? this.newTags[keyWithExt];
if(!raw || typeof raw!=='string') return false;
const addedAt = new Date(`${raw}T00:00:00`);
if(Number.isNaN(addedAt.getTime())) return false;
const now = new Date();
const diff = now.getTime() - addedAt.getTime();
const days = diff / 86400000;
return days >= 0 && days < 7;
},
beforeRecordsEnter(el){
if(el._recordsEndHandler){
el.removeEventListener('transitionend',el._recordsEndHandler);
el._recordsEndHandler = null;
}
const inner = el.querySelector('.records-panel-inner');
el.style.transition='none';
el.style.height='0px';
el.style.overflow='hidden';
if(inner){
inner.style.transition='none';
inner.style.opacity='0';
inner.style.transform='translateY(-3px)';
}
void el.offsetHeight;
},
recordsEnter(el,done){
const targetHeight = `${el.scrollHeight}px`;
const inner = el.querySelector('.records-panel-inner');
el.style.willChange='height';
el.style.transition='height .26s cubic-bezier(.22,1,.36,1)';
if(inner){
inner.style.willChange='opacity,transform';
inner.style.transition='opacity .18s ease-out, transform .22s cubic-bezier(.22,1,.36,1)';
}
const onEnd = (e)=>{
if(e.target!==el || e.propertyName!=='height') return;
el.removeEventListener('transitionend',onEnd);
el._recordsEndHandler = null;
done();
};
el._recordsEndHandler = onEnd;
el.addEventListener('transitionend',onEnd);
requestAnimationFrame(()=>{
el.style.height=targetHeight;
if(inner){
inner.style.opacity='1';
inner.style.transform='translateY(0)';
}
});
},
afterRecordsEnter(el){
const inner = el.querySelector('.records-panel-inner');
el.style.height='auto';
el.style.transition='';
el.style.willChange='';
el.style.overflow='hidden';
if(inner){
inner.style.transition='';
inner.style.willChange='';
inner.style.opacity='1';
inner.style.transform='none';
}
},
beforeRecordsLeave(el){
if(el._recordsEndHandler){
el.removeEventListener('transitionend',el._recordsEndHandler);
el._recordsEndHandler = null;
}
const inner = el.querySelector('.records-panel-inner');
el.style.transition='none';
el.style.height=`${el.getBoundingClientRect().height}px`;
el.style.overflow='hidden';
if(inner){
inner.style.transition='none';
inner.style.opacity='1';
inner.style.transform='none';
}
void el.offsetHeight;
},
recordsLeave(el,done){
const startHeight = el.getBoundingClientRect().height;
const inner = el.querySelector('.records-panel-inner');
if(startHeight <= 1){
done();
return;
}
const duration = Math.max(140, Math.min(260, Math.round(startHeight * 1.8)));
el.style.willChange='height';
el.style.transition=`height ${duration}ms linear`;
if(inner){
const fadeDuration = Math.max(110, Math.min(180, Math.round(duration * 0.7)));
inner.style.willChange='opacity,transform';
inner.style.transition=`opacity ${fadeDuration}ms ease-out, transform ${fadeDuration}ms ease-out`;
}
const onEnd = (e)=>{
if(e.target!==el || e.propertyName!=='height') return;
el.removeEventListener('transitionend',onEnd);
el._recordsEndHandler = null;
done();
};
el._recordsEndHandler = onEnd;
el.addEventListener('transitionend',onEnd);
requestAnimationFrame(()=>{
el.style.height='0px';
if(inner){
inner.style.opacity='0';
inner.style.transform='translateY(-2px)';
}
});
},
afterRecordsLeave(el){
const inner = el.querySelector('.records-panel-inner');
el.style.transition='';
el.style.willChange='';
el.style.height='';
el.style.overflow='';
if(inner){
inner.style.transition='';
inner.style.willChange='';
inner.style.opacity='';
inner.style.transform='';
}
},
copyID(id){
const text = id.toString();
if(navigator.clipboard?.writeText){
navigator.clipboard.writeText(text).catch(()=>{
this.fallbackCopy(text);
});
return;
}

this.fallbackCopy(text);
},
fallbackCopy(text){
const ta = document.createElement("textarea");
ta.value = text;
ta.setAttribute("readonly","");
ta.style.position = "fixed";
ta.style.opacity = "0";
ta.style.pointerEvents = "none";
document.body.appendChild(ta);
ta.focus();
ta.select();
try{
document.execCommand("copy");
}catch{}
document.body.removeChild(ta);
},
isLevelDecorated(level){
const value =
level?.decorated ??
level?.isDecorated ??
level?.decoration ??
level?.decoratedTag;
if(typeof value === 'string'){
const normalized = value.trim().toLowerCase();
return normalized === 'true' || normalized === 'yes' || normalized === '1' || normalized === 'decorated';
}
return value === true || value === 1;
},
iconFor(role){
	const map = {
		owner: 'crown',
		admin: 'user-shield',
		helper: 'user-shield',
		dev: 'code'
	};
	const name = map[role] || 'user-gear';
	return `/assets/${name}${this.store.dark?'-dark':''}.svg`;
}
}
};

