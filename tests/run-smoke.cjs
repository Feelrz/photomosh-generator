const {spawnSync}=require('node:child_process'),path=require('node:path');
for(const file of ['creative-smoke.cjs','jpeg-smoke.cjs','analog-smoke.cjs','paranormal-smoke.cjs']){
 const result=spawnSync(process.execPath,[path.join(__dirname,file)],{stdio:'inherit'});
 if(result.status!==0)process.exit(result.status||1);
}
