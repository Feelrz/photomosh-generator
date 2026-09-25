const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {JSDOM,VirtualConsole}=require('jsdom');
const {createCanvas,Image}=require('@napi-rs/canvas');
const project=path.resolve(process.argv[2]||path.join(__dirname,'..'));
const html=fs.readFileSync(path.join(project,'index.html'),'utf8');
const errors=[],warnings=[],downloads=[];let stoppedTracks=0;const consoleBridge=new VirtualConsole();
consoleBridge.on('error',(...args)=>errors.push(args.map(String).join(' ')));consoleBridge.on('warn',(...args)=>warnings.push(args.map(String).join(' ')));consoleBridge.on('jsdomError',e=>errors.push(e.message));
const exposed=['state','currentSettings','resetApp','clearSources','addFiles','createFrame','renderSourceList','renderCurrent','removeFrame','moveFrame','coreEffectsActive','getCurrentTransitionData','segmentForProgress','videoFxSettings','cookerActive','jpegActive','hasParanormalFx','exportFrame','freezeOutput','saveProject','loadProjectFile','saveTemplate','importTemplate','applyPreset','ghostProtocol','labSettings','applyLabSettings','paranormalSettings','applyParanormalSettings','drawFxOverlay','setSettings','recordWebM','startPlayback','stopPlayback','restartPlayback','paintMask','resetMaskNeutral','addKeyframe','clearKeyframes','compositePreview'];
const code=html.replace('  init();','  window.auditTest={'+exposed.join(',')+'};\n  init();');
const canvases=new WeakMap();
const dom=new JSDOM(code,{url:'http://photomosh.test/',runScripts:'dangerously',pretendToBeVisual:true,virtualConsole:consoleBridge,beforeParse(w){
 w.localStorage.setItem('photomosh-theme','dark');
 const native=node=>{if(!canvases.has(node))canvases.set(node,createCanvas(node.width||300,node.height||150));return canvases.get(node)};
 for(const attr of ['width','height']){const desc=Object.getOwnPropertyDescriptor(w.HTMLCanvasElement.prototype,attr);Object.defineProperty(w.HTMLCanvasElement.prototype,attr,{get:desc.get,set(v){desc.set.call(this,v);if(canvases.has(this))canvases.get(this)[attr]=this[attr]}});}
 w.HTMLCanvasElement.prototype.getContext=function(type){if(type!=='2d')return null;const ctx=native(this).getContext('2d');return new Proxy(ctx,{get(target,key){if(key==='drawImage')return (im,...a)=>target.drawImage(im instanceof w.HTMLCanvasElement?native(im):im,...a);const v=target[key];return typeof v==='function'?v.bind(target):v},set(target,key,value){target[key]=value;return true}})};
 w.HTMLCanvasElement.prototype.toDataURL=function(type='image/png',q){return native(this).toDataURL(type,q)};
 w.HTMLCanvasElement.prototype.toBlob=function(cb,type='image/png',q){try{const raw=Buffer.from(this.toDataURL(type,q).split(',')[1],'base64');cb(new w.Blob([raw],{type}))}catch(e){cb(null)}};
 w.HTMLCanvasElement.prototype.captureStream=function(){return {getTracks:()=>[{stop(){stoppedTracks++}}]}};
 w.MediaRecorder=class{
  static isTypeSupported(mime){return mime.startsWith('video/webm')||mime.startsWith('video/mp4')}
  constructor(stream,opts){this.state='inactive';this.mimeType=opts.mimeType;}
  start(){this.state='recording'}
  stop(){if(this.state==='inactive')return;this.state='inactive';const self=this;queueMicrotask(()=>{self.ondataavailable?.({data:new w.Blob(['mock video'],{type:self.mimeType})});self.onstop?.()})}
 };
 w.Image=Image;
 w.Blob.prototype.text=function(){return new Promise((resolve,reject)=>{const reader=new w.FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=reject;reader.readAsText(this)})};
 const blobs=new Map();let counter=0;
 w.URL.createObjectURL=b=>{const id='blob:audit/'+(++counter);blobs.set(id,b);return id};w.URL.revokeObjectURL=id=>blobs.delete(id);
 w.HTMLAnchorElement.prototype.click=function(){downloads.push({name:this.download,url:this.href,blob:blobs.get(this.href)})};
 w.__readBlob=blob=>new Promise((res,rej)=>{const f=new w.FileReader();f.onload=()=>res(Buffer.from(f.result));f.onerror=rej;f.readAsArrayBuffer(blob)});
 w.HTMLMediaElement.prototype.pause=function(){};
}});
const w=dom.window,$=id=>w.document.getElementById(id),app=w.auditTest;
const wait=ms=>new Promise(r=>setTimeout(r,ms));
async function render(){await wait(60);assert.equal(errors.length,0,errors.join('\n'));}
async function main(){
 await render();assert.equal($('app').dataset.ready,'1');
 assert.equal($('app').dataset.errors||'0','0');assert.equal(w.document.documentElement.dataset.theme,'light');assert.equal($('uiFontInput'),null);assert.equal($('themeSelect'),null);
 assert.equal(app.state.frames.length,0);assert.equal($('emptyStage').hidden,false);assert.equal($('exportFrameBtn').disabled,true);
 for(const el of w.document.querySelectorAll('input[type="range"]'))assert.equal(Number(el.value),Number(el.min),el.id+' neutral');
 for(const el of w.document.querySelectorAll('input[type="checkbox"]'))assert.equal(el.checked,false,el.id+' off');
 assert.equal(app.cookerActive(),false);assert.equal(app.jpegActive(),false);assert.equal(app.hasParanormalFx(),false);assert.equal(app.coreEffectsActive(app.currentSettings()),false);
 $('themeToggle').click();assert.equal(w.document.documentElement.dataset.theme,'dark');$('themeToggle').click();assert.equal(w.document.documentElement.dataset.theme,'light');
 console.log('PASS: complete script startup in DOM+Canvas harness, neutral defaults, blank media, fixed font UI and theme switch');
 const fixture=createCanvas(48,48),c=fixture.getContext('2d');c.fillStyle='#f02040';c.fillRect(0,0,48,48);c.fillStyle='#20a0dd';c.fillRect(24,0,24,48);
 const bytes=fixture.toBuffer('image/png'),file=new w.File([bytes],'two-colors.png',{type:'image/png'});
 await app.addFiles([file]);await render();assert.equal(app.state.frames.length,1);assert.equal(app.state.frames[0].ghostWeight,0);assert.equal($('emptyStage').hidden,true);assert.equal($('playBtn').disabled,false);
 const out=$('outputCanvas').getContext('2d').getImageData(60,60,1,1).data;assert.deepEqual([...out],[240,32,64,255],'neutral source pixels');
 assert.equal($('fxOverlay').getContext('2d').getImageData(60,60,1,1).data[3],0,'overlay transparent');
 $('exactPreviewExport').checked=true;await app.exportFrame();const png=downloads.at(-1);assert(png.name.endsWith('.png'));const pngBuf=await w.__readBlob(png.blob);assert.equal(pngBuf.readUInt32BE(0),0x89504e47);
 app.applyPreset('flesh');await render();assert.equal($('topologyTabValue').textContent,$('topologySelect').selectedOptions[0].textContent);
 app.applyLabSettings({fryEnabled:true,fryHeat:22,fryPasses:3,fryMix:80,fryTexture:10});app.renderCurrent();await render();
 await app.freezeOutput();assert.equal(app.state.frames.length,2);assert.equal(app.state.frames[1].ghostWeight,0);
 app.saveTemplate();const preset=JSON.parse((await w.__readBlob(downloads.at(-1).blob)).toString());
 app.resetApp();assert.equal(app.state.frames.length,2);assert.equal(app.cookerActive(),false);assert.equal(app.coreEffectsActive(app.currentSettings()),false);
 await app.importTemplate(new w.File([JSON.stringify(preset)],'preset.json',{type:'application/json'}));await render();assert.equal(app.cookerActive(),true);assert.equal(Number($('fryHeat').value),22);
 app.saveProject();await render();const saved=JSON.parse((await w.__readBlob(downloads.at(-1).blob)).toString());
 app.clearSources();assert.equal(app.state.frames.length,0);assert.equal($('emptyStage').hidden,false);
 await app.loadProjectFile(new w.File([JSON.stringify(saved)],'project.json',{type:'application/json'}));await render();assert.equal(app.state.frames.length,2);assert.equal(app.cookerActive(),true);
 app.resetApp();app.removeFrame(1);app.removeFrame(0);assert.equal(app.state.frames.length,0);assert.equal($('emptyStage').hidden,false);
 await app.exportFrame();await app.freezeOutput();app.recordWebM();await render();assert.equal(app.state.frames.length,0);
 console.log('PASS: image load/remove, clean pixels, real PNG encoding, presets, Cooker, freeze, settings/project round trips, empty action guards');
 await app.addFiles([file]);await render();app.resetApp();
 app.state.locked.add('warp');app.setSettings({warp:13});app.ghostProtocol();assert.equal(Number($('param-warp').value),13,'randomizer respects locks');app.state.locked.clear();app.resetApp();await render();
 // Real native Canvas rendering for newly combined modules.
 app.applyLabSettings({jpegEnabled:true,jpegMix:65,jpegCompression:48,jpegDamage:12,jpegBleed:20});app.renderCurrent();await render();assert($('fxOverlay').getContext('2d').getImageData(60,60,1,1).data[3]>0);
 app.applyParanormalSettings({paranormalEnabled:true,broadcastEnabled:true,broadcastAmount:60,broadcastText:'TEST',colonyEnabled:true,colonyAmount:30,burstEnabled:true,burstAmount:30});
 $('displayModeSelect').value='crt';$('displayIntensity').value=100;$('scanlineFx').value=24;app.renderCurrent();await render();
 app.resetApp();$('maskOverlay').getBoundingClientRect=()=>({left:0,top:0,width:520,height:520});$('brushSize').value=70;app.paintMask({clientX:260,clientY:260});
 const transition=app.getCurrentTransitionData(app.segmentForProgress(0)),maskBefore=transition.mask.toDataURL();app.setSettings({fusion:21});app.addKeyframe();assert.equal(transition.keyframes.fusion.length,1);
 app.resetApp();assert.equal(transition.keyframes.fusion.length,0);assert.equal(transition.mask.toDataURL(),maskBefore,'Zero effects keeps masks');
 $('modeSelect').value='still';$('modeSelect').dispatchEvent(new w.Event('change'));assert.equal($('playBtn').disabled,true);
 $('modeSelect').value='video';$('modeSelect').dispatchEvent(new w.Event('change'));assert.equal($('playBtn').disabled,false);
 $('exportFormat').value='jpeg';$('exportSize').value='1080';$('exactPreviewExport').checked=false;await app.exportFrame();const jpeg=await w.__readBlob(downloads.at(-1).blob);assert.equal(jpeg.readUInt16BE(0),0xffd8);
 // Recorder mock checks lifecycle only; it does not verify codec output.
 app.recordWebM();assert.equal(app.state.playing,true);app.recordWebM();await render();assert.equal(app.state.playing,false);assert.equal(app.state.recording,null);assert(stoppedTracks>0);
 const savedCount=downloads.length;app.recordWebM();app.clearSources();await render();assert.equal(app.state.playing,false);assert.equal(app.state.frames.length,0);assert.equal(downloads.length,savedCount+1);
 console.log('PASS: locks, JPEG/analog/paranormal composition, masks/keyframes, still mode, native 1080px JPEG, mocked recorder start/stop/reset cleanup');
 await app.saveProject();const empty=JSON.parse((await w.__readBlob(downloads.at(-1).blob)).toString());await app.loadProjectFile(new w.File([JSON.stringify(empty)],'empty.json'));await render();assert.equal(app.state.frames.length,0);
 console.log('PASS: empty project round trip');
 // A malformed project must fail before changing loaded sources/settings.
 await app.addFiles([file]);await render();const existing=app.state.frames[0],beforeSettings=JSON.stringify(app.currentSettings()),expectedErrors=errors.length;
 await app.loadProjectFile(new w.File([JSON.stringify({...empty,settings:{topology:'not-real'},frames:[]})],'bad.json'));
 assert.equal(app.state.frames[0],existing);assert.equal(JSON.stringify(app.currentSettings()),beforeSettings);assert.equal(errors.length,expectedErrors+1);assert.match(errors.at(-1),/Invalid topology/);errors.splice(expectedErrors);$('errorBanner').hidden=true;
 app.clearSources();app.resetApp();
 console.log('PASS: invalid project rejected without state loss');
 console.log(JSON.stringify({errors,warnings,downloads:downloads.map(x=>x.name)}));
 dom.window.close();
}
main().catch(e=>{console.error(e);console.error('Runtime errors:',errors);dom.window.close();process.exitCode=1});
