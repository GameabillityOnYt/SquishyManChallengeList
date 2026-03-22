import { store } from "../main.js";
import { getThumbnailFromId, getYoutubeIdFromUrl } from "../util.js";
import { score } from "../score.js";
import { fetchEditors, fetchList, fetchNewTags, fetchUnbeatenList } from "../content.js";
import Spinner from "../components/Spinner.js";

export default {
components:{Spinner},
template:`

<main v-if="loading"><Spinner/></main>

<div v-else class="page-list-scroll-shell">
<div class="page-list-custom" :class="{ 'unverified-mode': activeListMode === 'unverified' }">

<div class="central-container" :class="'view-mode-' + effectiveListView">
<div class="list-mode-switch-row">
<div class="list-mode-switch" role="group" aria-label="Main list, legacy list, and unverified list toggle">
<button class="list-mode-btn" :class="{ active: activeListMode === 'main' }" @click="showMainList" type="button">
Main List
</button>
<button class="list-mode-btn" :class="{ active: activeListMode === 'legacy' }" @click="showLegacyList" type="button">
Legacy List
</button>
<button class="list-mode-btn" :class="{ active: activeListMode === 'unverified' }" @click="showUnverifiedList" type="button">
Unverified Levels
</button>
</div>
<div class="tag-help" aria-label="Tag explanations">
<button class="tag-help-btn" type="button" aria-controls="tag-help-panel">
!
</button>
<div id="tag-help-panel" class="tag-help-panel" role="dialog" aria-label="Tag explanations">
<p><span class="tag-help-label decorated-tag">Decorated</span> Used for levels that have a well executed theme/decoration.</p>
<p><span class="tag-help-label former-top-1-tag">Former Top 1</span> For every level that was once #1 but got dethroned by a new one.</p>
<p><span class="tag-help-label demise-tag">Demise</span> Used for the top 3 in "Unverified Levels" tab (the hardest SMLL levels), this tag also transfers if a level that as it gets verified.</p>
</div>
</div>
</div>

<div
v-for="([level, absoluteRank],i) in visibleList"
class="level-card"
:class="{
'grid-records-open': effectiveListView === 'grid' && isOpen(absoluteRank),
'legacy-card': absoluteRank > 150
}"
>
<span v-if="isLevelNew(level)" class="new-corner-tag">NEW</span>

<div class="level-video-side">
<a class="lazy-video"
   :href="level.verification"
   target="_blank"
   rel="noopener noreferrer">
<img :src="thumbnailFor(level.verification)" :alt="'Thumbnail for ' + level.name" loading="lazy" decoding="async">
</a>
</div>

<div class="level-details-side">

<div class="level-title-info">
<div
class="level-badges"
:class="{ 'is-empty': !(isLevelDecorated(level) || level.formerTop1 || showDemiseTag(absoluteRank)) }"
>
<span v-if="isLevelDecorated(level)" class="decorated-tag">Decorated</span>
<span v-if="level.formerTop1" class="former-top-1-tag">Former Top 1</span>
<span v-if="showDemiseTag(absoluteRank)" class="demise-tag">Demise</span>
</div>
<div class="title-left">
<div class="rank-row">
<span class="level-rank">#{{absoluteRank}}</span>
<span v-if="absoluteRank>150" class="legacy-rank-label">legacy</span>
</div>

<div class="level-name-row">
<h2>{{level.name}}</h2>
</div>
</div>
</div>

<div class="authors-box centered-authors">
<div>
<span>{{creatorLabel(level.creators)}}</span>
<span class="author-value" :title="formatCreators(level.creators)">{{formatCreators(level.creators)}}</span>
</div>
<div>
<span>VERIFIER</span>
<span class="author-value" :title="formatPerson(level.verifier)">{{formatPerson(level.verifier)}}</span>
</div>
<div>
<span>PUBLISHER</span>
<span class="author-value" :title="formatPerson(level.publisher||level.author)">{{formatPerson(level.publisher||level.author)}}</span>
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
<span class="stat-value">{{activeListMode === 'unverified' ? '-' : score(absoluteRank,100,level.percentToQualify)}}</span>
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

<button class="show-records-btn" @click="toggleRecords(absoluteRank)">
{{isOpen(absoluteRank)?(activeListMode==='unverified'?'Hide Progress':'Hide Records'):(activeListMode==='unverified'?'Show Progress':'Show Records')}}<span v-if="level.records && level.records.length"> ({{level.records.length}})</span>
</button>

<transition
@before-enter="beforeRecordsEnter"
@enter="recordsEnter"
@after-enter="afterRecordsEnter"
@before-leave="beforeRecordsLeave"
@leave="recordsLeave"
@after-leave="afterRecordsLeave"
>
<div v-if="isOpen(absoluteRank)" class="records-panel" :data-index="absoluteRank">
<div class="records-panel-inner">
<div
class="records-scroll-area"
:class="{ 'records-scroll-limited': effectiveListView === 'list' && hasManyRecords(level) }"
>
<table v-if="level.records && level.records.length > 0" class="records">
<tr v-for="record in level.records">
<td>{{record.percent}}%</td>
<td><a :href="record.link" target="_blank">{{record.user}}</a></td>
<td>{{formatHz(record.hz)}}</td>
</tr>
</table>
<p v-if="!level.records || level.records.length===0" class="no-records-message">{{activeListMode==='unverified'?'No progress on this level yet.':'No records on this level yet.'}}</p>
</div>
</div>
</div>
</transition>

</div>
</div>

<transition name="legacy-dropdown">
<div v-if="activeListMode === 'legacy'" class="legacy-dropdown">
<p class="legacy-dropdown-title">Legacy List (151+)</p>
<div class="legacy-dropdown-grid-wrap">
<div class="legacy-dropdown-grid">
<button
v-for="([legacyLevel, legacyRank]) in legacyList"
class="legacy-entry-btn"
type="button"
@click="openLegacyLevel(legacyRank)"
>
<span class="legacy-entry-rank">#{{ legacyRank }}</span>
<span class="legacy-entry-name">{{ legacyLevel.name }}</span>
</button>
</div>
</div>
</div>
</transition>
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
<p>Once a level falls into legacy records for that level will no longer be accepted</p>
<p>Have either source audio or clicks/taps in the video. Edited audio only does not count</p>
<p>The recording must have a previous attempt and entire death animation shown before the completion, unless the completion is on the first attempt. Everyplay records are exempt from this</p>
<p>The recording must also show the player hit the endwall, or the completion will be invalidated.</p>
<p>Do not use secret routes or bug routes</p>
<p>Do not use easy modes, only a record of the unmodified level qualifies</p>
</div>
</div>

</div>
</div>
`,
data:()=>({

list:[],
unverifiedList:[],
editors:[],
loading:true,
toggledRecords:{},
newTags:{},
activeListMode:'main',
selectedLegacyRank:null,
store
}),
async mounted(){
const fetchedList = await fetchList();
this.list = Array.isArray(fetchedList)
? fetchedList
    .filter(([level])=>Boolean(level))
    .map(([level],index)=>[level,index+1])
: [];
const fetchedUnverified = await fetchUnbeatenList();
this.unverifiedList = Array.isArray(fetchedUnverified)
? fetchedUnverified
    .filter(([level])=>Boolean(level))
    .map(([level],index)=>[level,index+1])
: [];
this.editors=(await fetchEditors())||[];
this.newTags=(await fetchNewTags())||{};
this.loading=false;
this.syncUnverifiedTheme();
},
unmounted(){
this.clearUnverifiedTheme();
},
computed:{
effectiveListView(){
if(this.activeListMode === 'legacy'){
return 'list';
}
return this.store.listView || 'list';
},
mainList(){
return this.list.slice(0,150);
},
legacyList(){
return this.list.slice(150);
},
visibleList(){
if(this.activeListMode === 'legacy'){
if(this.selectedLegacyRank != null){
return this.list.filter(([,rank])=>rank === this.selectedLegacyRank);
}
return [];
}
if(this.activeListMode === 'unverified'){
return this.unverifiedList;
}
return this.mainList;
}
},
methods:{
thumbnailFor(video){
const id = getYoutubeIdFromUrl(video);
return id ? getThumbnailFromId(id) : "e.png";
},

score,
showMainList(){
this.activeListMode = 'main';
this.selectedLegacyRank = null;
this.toggledRecords = {};
this.syncUnverifiedTheme();
},
showLegacyList(){
this.activeListMode = 'legacy';
this.selectedLegacyRank = null;
this.toggledRecords = {};
this.syncUnverifiedTheme();
},
showUnverifiedList(){
this.activeListMode = 'unverified';
this.selectedLegacyRank = null;
this.toggledRecords = {};
this.syncUnverifiedTheme();
},
openLegacyLevel(rank){
this.selectedLegacyRank = rank;
this.toggledRecords = {};
this.$nextTick(()=>this.scrollLegacyTop());
},
scrollLegacyTop(){
if(!this.$el || typeof this.$el.scrollTo !== 'function') return;
this.$el.scrollTo({ top: 0, behavior: 'smooth' });
},
clearEndHandler(el){
if(!el._recordsEndHandler) return;
el.removeEventListener('transitionend',el._recordsEndHandler);
el._recordsEndHandler = null;
},
clearGridAnimation(el){
if(!el._recordsAnim) return;
try{
el._recordsAnim.cancel();
}catch{}
el._recordsAnim = null;
},
runGridAnimation(el,keyframes,options,done){
this.clearGridAnimation(el);
if(typeof el.animate !== 'function'){
const finalFrame = keyframes[keyframes.length-1] || {};
Object.keys(finalFrame).forEach((prop)=>{
el.style[prop] = finalFrame[prop];
});
done();
return;
}
const anim = el.animate(keyframes,options);
el._recordsAnim = anim;
anim.onfinish = ()=>{
if(el._recordsAnim !== anim) return;
el._recordsAnim = null;
done();
};
anim.oncancel = ()=>{
if(el._recordsAnim === anim){
el._recordsAnim = null;
}
};
},
attachTransitionEnd(el,propertyName,done){
const onEnd = (e)=>{
if(e.target!==el || e.propertyName!==propertyName) return;
el.removeEventListener('transitionend',onEnd);
el._recordsEndHandler = null;
done();
};
el._recordsEndHandler = onEnd;
el.addEventListener('transitionend',onEnd);
},
isOpen(i){return this.toggledRecords[i]===true},
toggleRecords(i){
const wasOpen = this.toggledRecords[i]===true;
this.toggledRecords = {[i]:!wasOpen};
},
hasManyRecords(level){
return Array.isArray(level?.records) && level.records.length > 5;
},
creatorNames(creators){
const source = Array.isArray(creators) ? creators : [creators];
return source
.flatMap((value)=>String(value ?? '')
.replace(/\u00A0/g,' ')
.split(','))
.map((part)=>part
.replace(/\s+/g,' ')
.trim()
.replace(/^,+\s*/,'')
.replace(/\s*,+$/,'')
.trim())
.filter(Boolean);
},
creatorLabel(creators){
return this.creatorNames(creators).length > 1 ? 'CREATORS' : 'CREATOR';
},
formatCreators(creators){
return this.creatorNames(creators).join(', ');
},
formatPerson(value){
return String(value ?? '')
.replace(/\u00A0/g,' ')
.replace(/\s+/g,' ')
.trim();
},
formatHz(value){
const normalized = String(value ?? '').trim();
if(!normalized) return '';
if(normalized.toLowerCase() === 'cbf'){
return 'CBF';
}
return `${normalized}Hz`;
},
isLevelNew(level){
const path = String(level?.path||'');
if(!path) return false;

const tagKey = Object.keys(this.newTags)
.find(k => k.toLowerCase() === path.toLowerCase());

if(!tagKey) return false;

const raw = this.newTags[tagKey];
if(!raw || typeof raw!=='string') return false;

const addedAt = new Date(raw + "T00:00:00Z");
if(Number.isNaN(addedAt.getTime())) return false;

const now = new Date();
const diff = now.getTime() - addedAt.getTime();

return diff >= 0 && diff < 7 * 86400000;
},
beforeRecordsEnter(el){
if(this.effectiveListView === 'grid'){
this.clearGridAnimation(el);
el.style.transition = 'none';
el.style.willChange = 'opacity, transform';
el.style.opacity = '0';
el.style.transform = 'translateY(10px) scale(.99)';
el.style.overflow = 'hidden';
void el.offsetHeight;
return;
}
this.clearEndHandler(el);
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
if(this.effectiveListView === 'grid'){
el.style.transition = 'none';
el.style.overflow = 'hidden';
el.style.willChange = 'opacity, transform';
this.runGridAnimation(
el,
[
{ opacity:'0', transform:'translateY(10px) scale(.99)' },
{ opacity:'1', transform:'translateY(0) scale(1)' }
],
{
duration:280,
easing:'cubic-bezier(.22,.61,.36,1)',
fill:'forwards'
},
done
);
return;
}
const targetHeight = `${el.scrollHeight}px`;
const inner = el.querySelector('.records-panel-inner');
el.style.willChange='height';
el.style.transition='height .26s cubic-bezier(.22,1,.36,1)';
if(inner){
inner.style.willChange='opacity,transform';
inner.style.transition='opacity .18s ease-out, transform .22s cubic-bezier(.22,1,.36,1)';
}
this.attachTransitionEnd(el,'height',done);
requestAnimationFrame(()=>{
el.style.height=targetHeight;
if(inner){
inner.style.opacity='1';
inner.style.transform='translateY(0)';
}
});
},
afterRecordsEnter(el){
if(this.effectiveListView === 'grid'){
this.clearGridAnimation(el);
el.style.height = '';
el.style.transition = '';
el.style.willChange = '';
el.style.overflow = 'hidden';
el.style.opacity = '';
el.style.transform = '';
return;
}
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
if(this.effectiveListView === 'grid'){
return;
}
this.clearEndHandler(el);
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
if(this.effectiveListView === 'grid'){
done();
return;
}
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
this.attachTransitionEnd(el,'height',done);
requestAnimationFrame(()=>{
el.style.height='0px';
if(inner){
inner.style.opacity='0';
inner.style.transform='translateY(-2px)';
}
});
},
afterRecordsLeave(el){
if(this.effectiveListView === 'grid'){
return;
}
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
showDemiseTag(rank){
return this.activeListMode === 'unverified' && rank <= 3;
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
},
syncUnverifiedTheme(){
const root = document.documentElement;
if(!root) return;
root.classList.toggle('list-unverified', this.activeListMode === 'unverified');
},
clearUnverifiedTheme(){
const root = document.documentElement;
if(!root) return;
root.classList.remove('list-unverified');
}
}
};
