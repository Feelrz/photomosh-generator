const fs=require('fs'),vm=require('vm'),assert=require('assert'),path=require('path');
const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8'),code=html.slice(html.indexOf('  const JPEG_BASIS='),html.indexOf('  function videoFxSettings('));
const scope={Math,Number,Float64Array,Uint8ClampedArray,clamp:(x,a,b)=>Math.max(a,Math.min(b,x)),fxHash:(a,b)=>{const n=Math.sin(a*127.1+b*311.7)*43758.5453;return n-Math.floor(n)}};vm.createContext(scope);vm.runInContext(code,scope);
for(const [w,h] of [[1,1],[17,13],[32,24]]){
 const input=Uint8ClampedArray.from({length:w*h*4},(_,i)=>i%4===3?210:(i*29)%256);
 assert.deepEqual(Array.from(scope.jpegDamagePixels(input,w,h,0,0,0,5)),Array.from(input));
 const a=scope.jpegDamagePixels(input,w,h,.65,.7,.8,5),b=scope.jpegDamagePixels(input,w,h,.65,.7,.8,5);
 assert.deepEqual(Array.from(a),Array.from(b));assert.equal(a.length,input.length);for(let i=3;i<a.length;i+=4)assert.equal(a[i],210);
 if(w>1){assert.notDeepEqual(Array.from(a),Array.from(input));assert.notDeepEqual(Array.from(a),Array.from(scope.jpegDamagePixels(input,w,h,.65,.7,.8,42)));}
}
const gray=new Uint8ClampedArray(8*8*4);for(let i=0;i<gray.length;i+=4){gray[i]=gray[i+1]=gray[i+2]=100;gray[i+3]=255;}
assert.deepEqual(Array.from(scope.jpegDamagePixels(gray,8,8,0,0,1,5)),Array.from(gray));
console.log('PASS: JPEG block processing, seed determinism, edge blocks, alpha and neutral reconstruction');
const base=scope.jpegQuantTable(.5,7),over=scope.jpegQuantTable(.5,7,{override:true,position:23,value:200});
assert.equal(over[23],200);assert.equal(over.filter((v,i)=>v!==base[i]).length,1);
const randomized=scope.jpegQuantTable(.5,7,{override:false,count:12,max:1});
assert.equal(randomized.filter(v=>v===1).length,12);
assert.deepEqual(Array.from(scope.jpegQuantTable(.5,7,{count:12,max:80})),Array.from(scope.jpegQuantTable(.5,7,{count:12,max:80})));
assert.equal(scope.jpegQuantTable(.5,7,{override:true,position:23,value:200,count:64,max:1})[23],1);
// Minimal segmented stream: headers, entropy, stuffed FF, restart and EOI.
const fixture=Uint8Array.from([255,216,255,224,0,4,12,34,255,218,0,2,10,20,255,0,30,255,208,40,50,255,217]);
const copy=Array.from(fixture),broken=scope.breakJpegBytes(fixture,128,9);
assert.equal(broken.changed,5);assert.deepEqual(Array.from(fixture),copy);
const eligible=[12,13,16,19,20];for(let i=0;i<fixture.length;i++){if(eligible.includes(i)){assert.notEqual(broken.bytes[i],fixture[i]);assert.notEqual(broken.bytes[i],255);}else assert.equal(broken.bytes[i],fixture[i]);}
assert.deepEqual(Array.from(scope.breakJpegBytes(fixture,0,9).bytes),copy);
assert.deepEqual(Array.from(scope.breakJpegBytes(fixture,128,9).bytes),Array.from(broken.bytes));
assert.throws(()=>scope.breakJpegBytes(Uint8Array.from([0,1,2]),4,1));
assert.throws(()=>scope.breakJpegBytes(Uint8Array.from([255,216,255,224,255,255]),4,1));
console.log('PASS: QTC override, independent random entries, deterministic scan-byte damage, immutable headers/markers, malformed input rejection');
(async()=>{
 let rejectDecode=false,revoked=0;
 const controls={jpegBytes:{value:3},jpegByteStatus:{textContent:''}};
 scope.$=id=>controls[id];scope.state={playing:true};scope.labSettings=()=>({bytes:3});
 scope.atob=s=>Buffer.from(s,'base64').toString('binary');scope.Blob=Blob;
 scope.URL={createObjectURL:()=> 'blob:test',revokeObjectURL:()=>revoked++};
 scope.setTimeout=setTimeout;scope.clearTimeout=clearTimeout;
 scope.Image=class{set src(v){queueMicrotask(()=>rejectDecode?this.onerror():this.onload())}};
 const rendered=[];scope.document={createElement:()=>({getContext:()=>({drawImage(){},getImageData:()=>({data:new Uint8ClampedArray(16)}),putImageData(p){rendered.push(p.data)}})})};
 const work={width:2,height:2,toDataURL:()=> 'data:image/jpeg;base64,'+Buffer.from(fixture).toString('base64')};
 const pixels=new Uint8ClampedArray(16).fill(123);
 assert.equal(scope.byteDamagedSignal(work,pixels,.5,7),work);
 work.width=9;await scope.state.jpegPending.promise;
 assert.equal(scope.state.jpegByteCache.canvas.width,2);assert.equal(rendered[0][3],123);assert.equal(revoked,1);assert.equal(scope.state.jpegPending,null);
 work.width=2;assert.equal(scope.byteDamagedSignal(work,pixels,.5,7),scope.state.jpegByteCache.canvas);
 rejectDecode=true;scope.byteDamagedSignal(work,pixels,.5,8);await scope.state.jpegPending.promise;
 assert.equal(scope.state.jpegByteCache.canvas,null);assert.match(controls.jpegByteStatus.textContent,/rejected/);assert.equal(revoked,2);
 assert.equal(scope.byteDamagedSignal(work,pixels,.5,8),work);
 controls.jpegBytes.value=0;assert.equal(scope.byteDamagedSignal(work,pixels,.5,8),work);
 console.log('PASS: mocked async decode success/rejection, alpha/dimension snapshot, URL cleanup, cached fallback and bypass');
})().catch(e=>{console.error(e);process.exitCode=1});
