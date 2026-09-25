const {assert,fs,path,w,$,app,wait,render,dom,errors,warnings,downloads,createCanvas}=require('./runtime-harness.cjs');
const outputDir=path.join(__dirname,'evidence');fs.mkdirSync(outputDir,{recursive:true});
const change=(id,value)=>{const el=$(id);if(el.type==='checkbox')el.checked=value;else el.value=value;el.dispatchEvent(new w.Event('change',{bubbles:true}));};
const pixels=canvas=>canvas.getContext('2d').getImageData(0,0,canvas.width,canvas.height).data;
const digest=data=>require('node:crypto').createHash('sha256').update(data).digest('hex');
const diff=(a,b)=>{let n=0,sum=0;for(let i=0;i<a.length;i+=4){let d=0;for(let c=0;c<3;c++)d+=Math.abs(a[i+c]-b[i+c]);if(d>24)n++;sum+=d;}return {changed:n/(a.length/4),mean:sum/(a.length/4*3)};};
const draw=t=>{app.state.fxIdleTime=t;app.drawFxOverlay();return app.compositePreview();};
const save=(name,canvas)=>fs.writeFileSync(path.join(outputDir,name+'.png'),Buffer.from(canvas.toDataURL().split(',')[1],'base64'));
async function main(){
 await render();assert.equal($('app').dataset.ready,'1');change('previewQuality','low');await render();
 const fixture=createCanvas(384,384),c=fixture.getContext('2d'),g=c.createLinearGradient(0,0,384,384);g.addColorStop(0,'#5479b5');g.addColorStop(.5,'#98bd91');g.addColorStop(1,'#d9a286');c.fillStyle=g;c.fillRect(0,0,384,384);
 for(let i=0;i<45;i++){c.fillStyle=`hsl(${i*43},55%,${25+i%4*12}%)`;c.fillRect((i*53)%384,(i*91)%384,18+i%7*5,8+i%5*6);}
 c.fillStyle='#40272d';c.beginPath();c.ellipse(195,207,92,138,0,0,Math.PI*2);c.fill();c.fillStyle='#b7967f';c.beginPath();c.ellipse(191,180,63,87,-.08,0,Math.PI*2);c.fill();c.fillStyle='#272020';c.fillRect(157,157,17,10);c.fillRect(207,153,17,10);c.fillRect(177,217,35,6);c.fillStyle='#eae7c9';c.font='24px monospace';c.fillText('SIGNAL / TEST',34,354);
 const file=new w.File([fixture.toBuffer('image/png')],'fixture.png',{type:'image/png'});
 const beforeAdd=app.editHistory.index;await app.addFiles([file]);await render();assert.equal(app.editHistory.index,beforeAdd+1);
 app.undoEdit();assert.equal(app.state.frames.length,0);app.redoEdit();assert.equal(app.state.frames.length,1);
 const idx=app.editHistory.index;
 for(const v of [2,8,18]){$('param-warp').value=v;$('param-warp').dispatchEvent(new w.Event('input',{bubbles:true}));}
 change('param-warp',18);assert.equal(app.editHistory.index,idx+1,'one slider drag = one action');app.undoEdit();assert.equal($('param-warp').value,'0');app.redoEdit();assert.equal($('param-warp').value,'18');
 for(let i=0;i<3;i++){app.undoEdit();app.redoEdit();assert.equal(app.editHistory.index,idx+1,'history does not drift');}
 app.undoEdit();change('param-warp',7);assert.equal($('redoBtn').disabled,true,'new edit drops redo branch');app.resetApp();await render();
 // Masks and keyframes survive command history independently of live canvases.
 change('brushSize',70);$('maskOverlay').getBoundingClientRect=()=>({left:0,top:0,width:320,height:320});
 const transition=()=>app.getCurrentTransitionData(app.segmentForProgress(0));
 const cleanMask=transition().mask.toDataURL();app.paintMask({clientX:150,clientY:150});app.historyCheckpoint('Paint mask');const paintedMask=transition().mask.toDataURL();assert.notEqual(paintedMask,cleanMask);
 app.undoEdit();assert.equal(transition().mask.toDataURL(),cleanMask);app.redoEdit();assert.equal(transition().mask.toDataURL(),paintedMask);
 change('param-fusion',34);app.addKeyframe();assert.equal(transition().keyframes.fusion.length,1);app.undoEdit();assert.equal(transition().keyframes.fusion.length,0);app.redoEdit();assert.equal(transition().keyframes.fusion.length,1);
 app.resetApp();app.undoEdit();assert.equal(transition().keyframes.fusion.length,1);assert.equal(transition().mask.toDataURL(),paintedMask);app.redoEdit();assert.equal(transition().keyframes.fusion.length,0);
 const text=$('broadcastText');text.focus();const typingUndo=new w.KeyboardEvent('keydown',{key:'z',ctrlKey:true,bubbles:true,cancelable:true});text.dispatchEvent(typingUndo);assert.equal(typingUndo.defaultPrevented,false);text.blur();
 const index=app.editHistory.index;w.document.body.dispatchEvent(new w.KeyboardEvent('keydown',{key:'z',ctrlKey:true,bubbles:true,cancelable:true}));assert.equal(app.editHistory.index,index-1);app.redoEdit();
 console.log('PASS: source undo/redo, coalesced slider gesture, stable replay, redo branching, independent masks/keyframes, zero effects and native text shortcuts');
 app.resetApp();await render();const original=app.compositePreview(),orig=pixels(original);save('01-original',original);
 const measurements={};
 // Actual UI checkbox previously could leave Mix=0 and appear broken.
 change('jpegEnabled',true);assert.equal($('jpegMix').value,'100');app.renderCurrent();let current=pixels(draw(0));assert(diff(orig,current).changed>.4,'JPEG checkbox gives a visible starting effect');
 for(const look of ['codec','acid','collapse']){
   w.document.querySelector(`[data-jpeg-look="${look}"]`).click();app.renderCurrent();const out=draw(0);measurements[look]=diff(orig,pixels(out));assert(measurements[look].changed>.4,look+' changes most pixels');save('jpeg-'+look,out);
   const a=digest(pixels(draw(0)));assert.equal(a,digest(pixels(draw(0))),'static seed deterministic');
 }
 change('jpegMix',0);assert.equal(app.jpegSignal($('outputCanvas')),$('outputCanvas'),'zero mix bypass');
 change('jpegMix',100);change('jpegAnimate',true);change('liveMotion',false);assert.notEqual(digest(pixels(draw(.1))),digest(pixels(draw(1.2))),'JPEG animation changes blocks');
 app.resetApp();await render();
 const cases=[['possessionEnabled','possessionAmount','possession'],['broadcastEnabled','broadcastAmount','broadcast'],['colonyEnabled','colonyAmount','colony'],['ditherEnabled','ditherAmount','gravity'],['burstEnabled','burstAmount','burst']];
 for(const [toggle,amount,name] of cases){
   app.resetParanormalSettings();change(toggle,true);change('liveMotion',false);$(amount).value=name==='colony'?99:85;app.renderCurrent();
   const first=draw(name==='burst'?1:0),a=new Uint8ClampedArray(pixels(first));save(name+'-a',first);
   const second=draw(name==='burst'?2:1.4),b=pixels(second);save(name+'-b',second);
   measurements[name]=diff(orig,a);measurements[name+'Motion']=diff(a,b);
   assert(measurements[name].changed>.07,name+' must visibly change a single photo');assert(measurements[name+'Motion'].changed>.005,name+' must change across time');
   if(name==='colony'){let dead=0;for(let i=0;i<a.length;i+=4)if(a[i]+a[i+1]+a[i+2]<22)dead++;assert(dead/(a.length/4)>.7,'max colony really destroys >70% of image');}
   const s=app.paranormalSettings();assert.equal(s.paranormalEnabled,true);
 }
 $('cursedTapeBtn').click();change('liveMotion',false);app.renderCurrent();save('cursed-tape',draw(1.7));
 // Animation should run on a paused image but not alter the undo stack.
 const historyIndex=app.editHistory.index;change('liveMotion',true);const liveIndex=app.editHistory.index;await wait(360);assert(app.state.fxIdleTime>0);assert.equal(app.editHistory.index,liveIndex);assert(liveIndex>=historyIndex);
 change('liveMotion',false);const stopped=app.state.fxIdleTime;await wait(180);assert.equal(app.state.fxIdleTime,stopped);assert.equal(app.state.fxRaf,0);
 // Toggle bypass keeps slider choices; all-off has no residual overlay.
 const previous=$('broadcastAmount').value;change('paranormalEnabled',false);assert.equal($('broadcastAmount').value,previous);app.renderCurrent();assert.equal(pixels($('fxOverlay')).some((v,i)=>i%4===3&&v!==0),false);
 console.log('PASS: visible JPEG UI activation, all 3 looks, seed/mix bypass, animated same-source possession, empty-text broadcast, >70% dead colony, burst and falling dither, idle RAF start/stop without history pollution');
 // New state round trips through both formats without embedding reference images.
 $('deadAirBtn').click();change('liveMotion',false);w.document.querySelector('[data-jpeg-look="acid"]').click();app.renderCurrent();app.saveTemplate();const preset=JSON.parse((await w.__readBlob(downloads.at(-1).blob)).toString());
 app.resetApp();await app.importTemplate(new w.File([JSON.stringify(preset)],'new.preset.json'));assert.equal($('ditherAmount').value,preset.paranormal.ditherAmount);assert.equal($('jpegAcid').value,'100');app.undoEdit();assert.equal($('jpegEnabled').checked,false);app.redoEdit();assert.equal($('jpegEnabled').checked,true);
 const settings=JSON.stringify(app.paranormalSettings());await app.saveProject();const project=JSON.parse((await w.__readBlob(downloads.at(-1).blob)).toString());app.clearSources();await app.loadProjectFile(new w.File([JSON.stringify(project)],'new.project.json'));assert.equal(JSON.stringify(app.paranormalSettings()),settings);
 app.undoEdit();assert.equal(app.state.frames.length,0);app.redoEdit();assert.equal(app.state.frames.length,1);
 // PNG pixels must match the paused composite exactly.
 app.renderCurrent();const composite=app.compositePreview();change('exactPreviewExport',true);await app.exportFrame();const blob=downloads.at(-1).blob,buffer=await w.__readBlob(blob);const {loadImage}=require('@napi-rs/canvas'),im=await loadImage(buffer),decoded=createCanvas(im.width,im.height);decoded.getContext('2d').drawImage(im,0,0);assert.equal(digest(pixels(decoded)),digest(pixels(composite)));
 // Backward compatibility: absent new fields restore to neutral.
 const old={...preset,paranormal:{paranormalEnabled:true,colonyEnabled:true,colonyAmount:'40'},lab:{jpegEnabled:true,jpegMix:'70',jpegCompression:'50'}};
 await app.importTemplate(new w.File([JSON.stringify(old)],'old.preset.json'));assert.equal($('ditherEnabled').checked,false);assert.equal($('jpegAcid').value,'0');assert.equal($('liveMotion').checked,false);assert.equal($('jpegMix').value,'70');
 app.resetApp();await render();for(const input of w.document.querySelectorAll('input[type=range]'))assert.equal(Number(input.value),Number(input.min),input.id+' resets neutral');assert.equal(app.state.fxRaf,0);
 console.log('PASS: new preset/project round trips, import/load history, exact PNG pixels, old preset compatibility, neutral reset');
 assert.equal(errors.length,0,errors.join('\n'));fs.writeFileSync(path.join(outputDir,'measurements.json'),JSON.stringify({measurements,errors,warnings,renderer:app.state.rendererName,note:'JSDOM + native Canvas; not a browser layout, WebGL or codec test.'},null,2));
 console.log(JSON.stringify(measurements,null,2));dom.window.close();
}
main().catch(error=>{console.error(error);console.error('Runtime errors:',errors);dom.window.close();process.exitCode=1;});
