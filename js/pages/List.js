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
<iframe :src="embed(level.verification)" allowfullscreen></iframe>
</div>

<div class="level-details-side">

<div class="level-title-info">
<div class="title-left">
<span class="level-rank">#{{i+1}}</span>
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
<span class="stat-label">Password</span>
<span class="stat-value">{{level.password||'Free'}}</span>
</div>

</div>

<button class="show-records-btn" @click="toggleRecords(i)">
{{isOpen(i)?'Hide Records':'Show Records'}}
</button>

<transition name="records">
<div v-if="isOpen(i)" class="records-panel">
<table class="records">
<tr v-for="record in level.records">
<td>{{record.percent}}%</td>
<td><a :href="record.link" target="_blank">{{record.user}}</a></td>
<td>{{record.hz}}Hz</td>
</tr>
</table>
</div>
</transition>

</div>
</div>
</div>

<div class="meta-container">
<div class="meta">
<h3>List Editors</h3>
<ol class="editors">
<li v-for="editor in editors">
<img :src="\`/assets/\${editor.role}\${store.dark?'-dark':''}.svg\`">
<span>{{editor.name}}</span>
</li>
</ol>

<h3>Submission Requirements</h3>
<p>Achieved the record without using hacks</p>
<p>Achieved the record on the listed level</p>
<p>Clicks or audio required</p>
</div>
</div>

</div>
`,
data:()=>({

list:[],
editors:[],
loading:true,
toggledRecords:{},
store

}),
async mounted(){
this.list=await fetchList();
this.editors=await fetchEditors();
this.loading=false;
},
methods:{
embed,
score,
isOpen(i){return this.toggledRecords[i]===true},
toggleRecords(i){this.toggledRecords={[i]:!this.toggledRecords[i]}},
copyID(id){navigator.clipboard.writeText(id.toString())}
}
};
