const fs=require('fs'),vm=require('vm'),assert=require('assert');
const html=fs.readFileSync(require('path').join(__dirname,'..','index.html'),'utf8');
const code=html.slice(html.indexOf('  const PARANORMAL_RANGES='),html.indexOf('  function drawFxOverlay(',html.indexOf('  const PARANORMAL_RANGES=')));
const ids=['possessionAmount','broadcastAmount','burstPoint','burstWidth','burstAmount','colonyAmount','colonyGrowth','possessionSource','possessionMode','broadcastText','timeline','outputCanvas'];
const els=Object.fromEntries(ids.map(id=>[id,{value:'0',defaultValue:'0',min:'0',max:'100',options:[]}]));
for(const id of ['paranormalEnabled','possessionEnabled','broadcastEnabled','burstEnabled','colonyEnabled'])els[id]={checked:true};
for(const id of ['possessionAmount','broadcastAmount','burstPoint','burstWidth','burstAmount','colonyAmount','colonyGrowth'])els[id+'Out']={textContent:''};
els.possessionMode.options=[{value:'bright'},{value:'shadow'},{value:'edge'}];els.possessionMode.value='bright';els.possessionSource.options=[{value:'0'},{value:'1'}];els.possessionSource.value='1';els.broadcastText.value='TEST TRANSMISSION';els.timeline.value='500';
for(const match of html.matchAll(/<input\b([^>]+)>/g)){
 const attrs=Object.fromEntries([...match[1].matchAll(/([\w-]+)="([^"]*)"/g)].map(m=>[m[1],m[2]]));
 if(attrs.id&&!els[attrs.id])els[attrs.id]={...attrs,defaultValue:attrs.value,checked:false};
}
for(const match of html.matchAll(/<output id="([^"]+)"/g))if(!els[match[1]])els[match[1]]={textContent:''};
els.burstMode={value:'timeline',options:[{value:'timeline'},{value:'storm'}]};
const data=new Uint8ClampedArray(64*64*4).fill(128);
function makeContext(){return new Proxy({getImageData:()=>({data:new Uint8ClampedArray(data)}),createImageData:()=>({data:new Uint8ClampedArray(data)}),putImageData(){},clearRect(){},save(){},restore(){},drawImage(){},fillRect(){},fillText(){}},{get:(o,k)=>k in o?o[k]:undefined,set:(o,k,v)=>(o[k]=v,true)});}
const canvas=()=>({width:64,height:64,getContext:()=>makeContext()});
const state={frames:[{name:'A',getCanvas:canvas},{name:'B',getCanvas:canvas}]};
const context={Math,Number,String,Object,document:{createElement:canvas},state,$:id=>els[id],clamp:(x,a,b)=>Math.max(a,Math.min(b,x))};
vm.createContext(context);vm.runInContext(code+'\nthis.test={paranormalSettings,applyParanormalSettings,resetParanormalSettings,hasParanormalFx,drawParanormalEffects}',context);
context.test.applyParanormalSettings({possessionAmount:999,broadcastAmount:70,burstAmount:60,colonyAmount:35,burstPoint:50,broadcastText:'HELLO'});
assert.equal(els.possessionAmount.value,100);assert.equal(context.test.hasParanormalFx(),true);
context.test.drawParanormalEffects(makeContext(),64,64,1000);
els.paranormalEnabled.checked=false;assert.equal(context.test.hasParanormalFx(),false);assert.equal(els.possessionAmount.value,100);
els.paranormalEnabled.checked=true;els.possessionEnabled.checked=false;assert.equal(context.test.paranormalSettings().possessionEnabled,false);context.test.drawParanormalEffects(makeContext(),64,64,1000);
context.test.applyParanormalSettings({possessionEnabled:true,burstEnabled:false});assert.equal(els.possessionEnabled.checked,true);assert.equal(els.burstEnabled.checked,false);
assert.equal(context.test.paranormalSettings().broadcastText,'HELLO');context.test.resetParanormalSettings();assert.equal(context.test.hasParanormalFx(),false);
assert.equal(els.burstEnabled.checked,false);console.log('PASS: clamping, toggles, value retention, combined draw, reset');
