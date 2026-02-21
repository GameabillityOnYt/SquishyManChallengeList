import { store } from "../main.js";
import { embed } from "../util.js";
import { score } from "../score.js";
import { fetchEditors, fetchList } from "../content.js";
import Spinner from "../components/Spinner.js";

export default {
components:{Spinner},
template:`

<main v-if="loading"><Spinner/></main>

<div v-else class="page-list-custom">

<div class="central-container">

<div v-for="([level,err],i) in list" class="level-card">

<div class="level-video-side">
<div class="lazy-video"
     :data-src="embed(level.verification)"
     ref="lazyVideos">
</div>
</div>

<div class="level-details-side">

<div class="level-title-info">
<span v-if="level.formerTop1" class="former-top-1-tag">Former Top 1</span>
<div class="title-left">
<span class="level-rank">#{{i+1}}<span v-if="i+1>150"> legacy</span></span>
<h2>{{level.name}}</h2>
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

</div>

<button class="show-records-btn" @click="toggleRecords(i)">
{{isOpen(i)?'Hide Records':'Show Records'}}
</button>

<transition name="records">
<div v-if="isOpen(i)" class="records-panel">
<table v-if="level.records && level.records.length > 0" class="records">
<tr v-for="record in level.records">
<td>{{record.percent}}%</td>
<td><a :href="record.link" target="_blank">{{record.user}}</a></td>
<td>{{record.hz}}Hz</td>
</tr>
</table>
<p v-if="!level.records || level.records.length===0" class="no-records-message">No records on this level yet.</p>
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
`,
data:()=>({

list:[],
editors:[],
loading:true,
toggledRecords:{},
observer:null,
store

}),
async mounted(){
this.list=await fetchList();
this.editors=await fetchEditors();
this.loading=false;

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

this.observer.unobserve(el);

}
});
},{
rootMargin:"200px"
});

this.$refs.lazyVideos.forEach(el=>{
this.observer.observe(el);
});

});

},
methods:{
embed,
score,
isOpen(i){return this.toggledRecords[i]===true},
toggleRecords(i){this.toggledRecords={[i]:!this.toggledRecords[i]}},
copyID(id){navigator.clipboard.writeText(id.toString())},
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
