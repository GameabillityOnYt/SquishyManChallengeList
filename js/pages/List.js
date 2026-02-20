import { store } from "../main.js";
import { embed } from "../util.js";
import { score } from "../score.js";
import { fetchEditors, fetchList } from "../content.js";

import Spinner from "../components/Spinner.js";

const roleIconMap = {
    owner: "crown",
    admin: "user-gear",
    helper: "user-shield",
    dev: "code",
    trial: "user-lock",
};

export default {
components:{Spinner},
template:`

<main v-if="loading"><Spinner/></main>

<main v-else class="page-list-custom">

<div class="central-container">

<div v-for="([level,err],i) in list" class="level-card">

<div class="level-video-side">
<iframe :src="embed(level.verification)" allowfullscreen></iframe>
</div>

<div class="level-details-side">

<!-- TITLE ROW -->
<div class="title-row">

<div class="title-left">
<span class="level-rank">#{{i+1}}</span>
<h2 class="level-name">{{level.name}}</h2>
</div>

<div class="level-meta">
<span>C: {{level.creators.join(', ')}}</span>
<span>V: {{level.verifier}}</span>
<span>P: {{level.publisher || level.author}}</span>
</div>

</div>

<div class="stats-middle-grid">

<div class="stat-card">
<span class="stat-label">ID</span>
<div class="id-copy-box">
<span class="stat-value">{{level.id}}</span>

<button class="copy-id" @click="copyID(level.id)">
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
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
<div v-show="isOpen(i)" class="records-panel">
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
<h3>Submission Requirements</h3>
<p>Achieved the record without hacks</p>
<p>Correct listed level</p>
<p>Clicks or audio required</p>
</div>
</div>

</main>
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
