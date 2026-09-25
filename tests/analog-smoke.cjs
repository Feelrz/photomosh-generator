const fs=require('fs'),vm=require('vm'),assert=require('assert'),path=require('path');
const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const code=html.slice(html.indexOf('  function tapeNoise('),html.indexOf('  function drawFxOverlay('));
const scope={Math,clamp:(n,a,b)=>Math.max(a,Math.min(b,n)),fxHash:(a,b)=>{const n=Math.sin(a*127.1+b*311.7)*43758.5453;return n-Math.floor(n)}};
vm.createContext(scope);vm.runInContext(code,scope);
for(const [w,h] of [[360,640],[720,720],[1280,720]]){
 for(const time of [0,.25,10,99]){
  const calls=[];const ctx={save(){},restore(){},fillRect(){},drawImage(...args){calls.push(args)}};
  scope.drawAnalogTracking(ctx,{},w,h,time,1,1);assert(calls.length>0);
  for(const args of calls){const [,x,y,sw,sh]=args;assert(x>=0&&y>=0&&sw>0&&sh>0&&x+sw<=w+.001&&y+sh<=h+.001)}
  for(let y=0;y<h;y+=17){assert.equal(scope.tapeShift(y,h,w,time,0,0),0);assert(Math.abs(scope.tapeShift(y,h,w,time,1,1)-scope.tapeShift(y,h,w,time+.0001,1,1))<.1)}
 }
}
let draws=0;scope.drawAnalogTracking({drawImage(){draws++}}, {},720,720,0,0,0);assert.equal(draws,0);
console.log('PASS: tape continuity, bounded source rectangles, zero bypass, portrait/square/landscape');
