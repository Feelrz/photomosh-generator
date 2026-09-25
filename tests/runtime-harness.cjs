const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {JSDOM,VirtualConsole}=require('jsdom');
const {createCanvas,Image,GlobalFonts}=require('@napi-rs/canvas');
const project=path.resolve(process.argv[2]||path.join(__dirname,'..'));
const html=fs.readFileSync(path.join(project,'index.html'),'utf8');
const font=html.match(/data:font\/ttf;base64,([A-Za-z0-9+/=]+)/);assert(font&&GlobalFonts.register(Buffer.from(font[1],'base64'),'VT323'),'embedded VT323 registers in native Canvas');
const errors=[],warnings=[],downloads=[];let stoppedTracks=0;const consoleBridge=new VirtualConsole();
consoleBridge.on('error',(...args)=>errors.push(args.map(String).join(' ')));consoleBridge.on('warn',(...args)=>warnings.push(args.map(String).join(' ')));consoleBridge.on('jsdomError',e=>errors.push(e.message));
const exposed=['state','currentSettings','resetApp','clearSources','addFiles','createFrame','renderSourceList','renderCurrent','removeFrame','moveFrame','coreEffectsActive','getCurrentTransitionData','segmentForProgress','videoFxSettings','cookerActive','jpegActive','hasParanormalFx','exportFrame','freezeOutput','saveProject','loadProjectFile','saveTemplate','importTemplate','applyPreset','ghostProtocol','labSettings','applyLabSettings','paranormalSettings','applyParanormalSettings','drawFxOverlay','setSettings','recordWebM','startPlayback','stopPlayback','restartPlayback','paintMask','resetMaskNeutral','addKeyframe','clearKeyframes','compositePreview','resetParanormalSettings','applyJpegLook','applyParanormalLook','jpegCodecPixels','jpegSignal','effectSeconds','syncLiveMotion','liveMotionActive','historyCheckpoint','editHistory','undoEdit','redoEdit','clearKeyframes','maskInfectAll'];
const code=html.replace('  init();','  window.auditTest={};'+[...new Set(exposed)].map(name=>'Object.defineProperty(window.auditTest,"'+name+'",{get:()=>'+name+'});').join('')+'\n  init();');
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

module.exports={assert,fs,path,w,$,app,wait,render,dom,errors,warnings,downloads,createCanvas,Image};
