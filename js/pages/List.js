
import { store } from "../main.js";
import { getThumbnailFromId, getYoutubeIdFromUrl } from "../util.js";
import { score } from "../score.js";
import { fetchEditors, fetchList, fetchNewTags } from "../content.js";
import Spinner from "../components/spinner.js";
import listTemplate from "./ListTemplate.js";

export default {
components:{Spinner},
template:listTemplate,
data:()=>({

list:[],
editors:[],
loading:true,
toggledRecords:{},
gridRecordAnimating:{},
newTags:{},
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
this._authorFitResizeHandler = ()=>this.queueAuthorNameFit();
window.addEventListener('resize',this._authorFitResizeHandler,{passive:true});
this.$nextTick(()=>this.queueAuthorNameFit());
},
beforeUnmount(){
if(this._authorFitResizeHandler){
window.removeEventListener('resize',this._authorFitResizeHandler);
this._authorFitResizeHandler = null;
}
if(this._authorFitRaf){
cancelAnimationFrame(this._authorFitRaf);
this._authorFitRaf = null;
}
},
watch:{
'store.listView'(){
this.$nextTick(()=>this.queueAuthorNameFit());
},
list(){
this.$nextTick(()=>this.queueAuthorNameFit());
}
},
methods:{
thumbnailFor(video){
const id = getYoutubeIdFromUrl(video);
return id ? getThumbnailFromId(id) : "e.png";
},
score,
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
setGridAnimating(index,isAnimating){
if(Number.isNaN(index)) return;
const next = {...this.gridRecordAnimating};
if(isAnimating){
next[index] = true;
}else{
delete next[index];
}
this.gridRecordAnimating = next;
},
queueAuthorNameFit(){
if(this._authorFitRaf){
cancelAnimationFrame(this._authorFitRaf);
}
this._authorFitRaf = requestAnimationFrame(()=>{
this._authorFitRaf = null;
this.fitAuthorNames();
});
},
getLastLineCharCount(el){
const firstNode = el.firstChild;
if(!firstNode || firstNode.nodeType !== Node.TEXT_NODE) return 0;
const text = firstNode.textContent || '';
if(!text) return 0;
const range = document.createRange();
let lastTop = null;
let count = 0;
for(let i=1;i<=text.length;i++){
range.setStart(firstNode,i-1);
range.setEnd(firstNode,i);
const rects = range.getClientRects();
if(!rects.length) continue;
const top = Math.round(rects[0].top);
if(lastTop === null){
lastTop = top;
count = 1;
continue;
}
if(Math.abs(top-lastTop) <= 1){
count += 1;
continue;
}
lastTop = top;
count = 1;
}
return count;
},
fitAuthorNames(){
if(!this.$el) return;
const labels = this.$el.querySelectorAll('.authors-box span:last-child');
labels.forEach((el)=>{
el.style.fontSize = '';
if(this.store.listView !== 'grid') return;
const text = (el.textContent || '').trim();
if(!text) return;
const styles = window.getComputedStyle(el);
const lineHeight = parseFloat(styles.lineHeight);
const baseSize = parseFloat(styles.fontSize);
if(Number.isNaN(lineHeight) || Number.isNaN(baseSize) || lineHeight <= 0) return;
const wraps = el.scrollHeight > (lineHeight * 1.35);
if(!wraps) return;
const tailChars = this.getLastLineCharCount(el);
if(tailChars < 1 || tailChars > 3) return;
const minSize = Math.max(10,baseSize * 0.82);
let nextSize = baseSize;
let attempts = 0;
while(el.scrollHeight > (lineHeight * 1.35) && nextSize > minSize && attempts < 8){
nextSize -= 0.6;
el.style.fontSize = `${nextSize}px`;
attempts += 1;
}
});
},
isOpen(i){return this.toggledRecords[i]===true},
toggleRecords(i){
const wasOpen = this.toggledRecords[i]===true;
if(this.store.listView === 'grid' && wasOpen){
this.setGridAnimating(i,true);
}
this.toggledRecords = {[i]:!wasOpen};
this.$nextTick(()=>this.queueAuthorNameFit());
},
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
if(this.store.listView === 'grid'){
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
if(this.store.listView === 'grid'){
const index = Number(el.dataset.index);
if(!Number.isNaN(index) && this.gridRecordAnimating[index]){
this.setGridAnimating(index,false);
}
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
if(this.store.listView === 'grid'){
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
if(this.store.listView === 'grid'){
this.clearGridAnimation(el);
this.clearEndHandler(el);
el.style.transition = 'none';
el.style.willChange = 'opacity, transform';
el.style.opacity = '1';
el.style.transform = 'translateY(0) scale(1)';
el.style.overflow = 'hidden';
void el.offsetHeight;
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
if(this.store.listView === 'grid'){
const index = Number(el.dataset.index);
if(!Number.isNaN(index) && !this.gridRecordAnimating[index]){
this.setGridAnimating(index,true);
}
el.style.transition = 'none';
el.style.overflow = 'hidden';
el.style.willChange = 'opacity, transform';
this.runGridAnimation(
el,
[
{ opacity:'1', transform:'translateY(0) scale(1)' },
{ opacity:'.0', transform:'translateY(12px) scale(.985)' }
],
{
duration:220,
easing:'cubic-bezier(.4,0,.2,1)',
fill:'forwards'
},
done
);
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
if(this.store.listView === 'grid'){
this.clearGridAnimation(el);
const index = Number(el.dataset.index);
if(!Number.isNaN(index) && this.gridRecordAnimating[index]){
this.setGridAnimating(index,false);
}
el.style.transition = '';
el.style.willChange = '';
el.style.height = '';
el.style.overflow = '';
el.style.opacity = '';
el.style.transform = '';
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




