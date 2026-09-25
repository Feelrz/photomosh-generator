const fs=require('fs'),vm=require('vm'),assert=require('assert'),path=require('path');
const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const code=html.slice(html.indexOf('  const LAB_RANGES='),html.indexOf('  function videoFxSettings('));
const els={modEnabled:{checked:true},modTarget:{value:'warp'},modWave:{value:'sine'},modRate:{value:1},modDepth:{value:100},timeline:{value:250}};
const scope={Uint8ClampedArray,Math,Number,Object,$:id=>els[id],totalDurationSeconds:()=>1,clamp:(v,a,b)=>Math.max(a,Math.min(b,v)),fxHash:(a,b)=>{const n=Math.sin(a*127.1+b*311.7)*43758.5453;return n-Math.floor(n)}};
vm.createContext(scope);vm.runInContext(code,scope);
const input=Uint8ClampedArray.from({length:16*16*4},(_,i)=>i%4===3?255:(i*37)%256);
assert.deepEqual(Array.from(scope.cookPixels(input,16,16,0,.8,5)),Array.from(input));
const one=scope.cookPixels(input,16,16,.8,.7,1),many=scope.cookPixels(input,16,16,.8,.7,6);assert.notDeepEqual(Array.from(one),Array.from(many));
for(let i=3;i<many.length;i+=4)assert.equal(many[i],255);
assert.equal(scope.modValue('warp',50),100);assert.equal(scope.modValue('trackingFx',25),25);els.modEnabled.checked=false;assert.equal(scope.modValue('warp',50),50);
for(const wave of ['sine','triangle','pulse','hold'])for(let t=0;t<8;t+=.13){const v=scope.modWaveValue(t,wave);assert(v>=-1&&v<=1)}
console.log('PASS: iterative pixel changes, heat-zero identity, alpha, waveform bounds, modulation bypass');
for(const key of ['damage','texture','color','edge']){
 const opts={[key]:.85,seed:29};
 const processed=scope.cookPixels(input,16,16,.8,.4,4,opts);
 assert.notDeepEqual(Array.from(processed),Array.from(scope.cookPixels(input,16,16,.8,.4,4)),key+' changes pixels');
 assert.deepEqual(Array.from(processed),Array.from(scope.cookPixels(input,16,16,.8,.4,4,opts)));
 for(let i=3;i<processed.length;i+=4)assert.equal(processed[i],input[i]);
 assert.deepEqual(Array.from(scope.cookPixels(input,16,16,0,.4,24,opts)),Array.from(input));
}
const options={damage:.7,texture:.6,color:.5,edge:.4,seed:17};
assert.notDeepEqual(Array.from(scope.cookPixels(input,16,16,.3,.2,1,options)),Array.from(scope.cookPixels(input,16,16,.3,.2,12,options)));
for(const [w,h] of [[1,1],[3,17],[17,3]]){
 const pixels=new Uint8ClampedArray(w*h*4).fill(100);
 const result=scope.cookPixels(pixels,w,h,1,1,24,options);
 assert.equal(result.length,pixels.length);for(let i=3;i<result.length;i+=4)assert.equal(result[i],100);
}
console.log('PASS: each Cooker control affects pixels, seeded determinism, heat bypass, alpha, 24 iterations and narrow/edge dimensions');
// A uniform frame makes the repeated contrast transform analytically checkable.
const flat=new Uint8ClampedArray(8*8*4);for(let i=0;i<flat.length;i+=4){flat[i]=flat[i+1]=flat[i+2]=100;flat[i+3]=91;}
for(const passes of [1,6,24]){
 let expected=100;for(let i=0;i<passes;i++)expected=Math.round(Math.max(0,Math.min(255,(expected-128)*1.032+128)));
 const frame=scope.cookPixels(flat,8,8,.2,0,passes);
 for(let i=0;i<frame.length;i++)assert.equal(frame[i],i%4===3?91:expected);
}
assert.equal(require('crypto').createHash('sha256').update(many).digest('hex'),'0afcb32ab120b48ade4a428333c98918f787cfdbcc070a37f0b34f099a810c52','legacy Cooker fixture remains identical');
scope.state={};const cached=scope.cookedFrame(input,16,16,.5,.3,3,options);
assert.equal(scope.cookedFrame(input,16,16,.5,.3,3,options),cached,'reuse exact unchanged pixels');
const changedInput=new Uint8ClampedArray(input);changedInput[0]++;
assert.notEqual(scope.cookedFrame(changedInput,16,16,.5,.3,3,options),cached,'source change invalidates');
const before=scope.state.cookerCache.output;
assert.notEqual(scope.cookedFrame(changedInput,16,16,.5,.3,4,options),before,'iterations change invalidates');
console.log('PASS: analytical accumulated transform, legacy pixel fixture and exact source/settings cache invalidation');
// Exercise the same control snapshot/apply path used by projects and presets.
for(const match of html.matchAll(/<input\b([^>]+)>/g)){
 const attrs=Object.fromEntries([...match[1].matchAll(/([\w-]+)="([^"]*)"/g)].map(m=>[m[1],m[2]]));
 if(attrs.id)els[attrs.id]={...attrs,defaultValue:attrs.value,checked:false};
}
els.modTarget={value:'warp',options:[{value:'warp'},{value:'fryHeat'}]};els.modWave={value:'sine',options:[{value:'sine'},{value:'triangle'}]};
for(const match of html.matchAll(/<output id="([^"]+)"/g))els[match[1]]={textContent:''};
els.jpegByteStatus={textContent:""};
scope.resetLab();scope.applyLabSettings({fryEnabled:true,fryHeat:30,fryMix:70,fryPasses:24,fryDamage:67,fryTexture:28,fryColor:36,fryEdge:51,frySeed:432});
const saved=JSON.parse(JSON.stringify(scope.labSettings()));scope.resetLab();scope.applyLabSettings(saved);
for(const id of ['fryPasses','fryDamage','fryTexture','fryColor','fryEdge','frySeed'])assert.equal(els[id].value,saved[id]);
assert.equal(els.fryEnabled.checked,true);assert.equal(els.fryDamageOut.textContent,67);
scope.resetLab();scope.applyLabSettings({fryEnabled:true,fryPasses:6,fryHeat:38,fryCrush:20,fryMix:80});
for(const id of ['fryDamage','fryTexture','fryColor','fryEdge'])assert.equal(Number(els[id].value),0);
assert.equal(scope.cookerActive(),true);els.fryEnabled.checked=false;assert.equal(scope.cookerActive(),false);
scope.applyLabSettings({fryDamage:1000,fryPasses:-2});assert.equal(els.fryDamage.value,100);assert.equal(els.fryPasses.value,1);
console.log('PASS: preset/project controls round trip, old-settings reset, clamping, output labels and enable bypass');
