import {readFileSync,readdirSync,existsSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {digest,materialHash} from './core.mjs';
const read=path=>JSON.parse(readFileSync(path,'utf8'));
const root='clinical-content/clinician-review',catalog=read(root+'/catalog.json');
for(const g of catalog.groups)if(!/^[A-Za-z0-9][A-Za-z0-9._-]{0,99}$/.test(g.id??''))throw new Error('GROUP_IDENTITY');
const history=catalog.groups.flatMap(g=>readdirSync(`${root}/history/${g.id}`).map(n=>{
 const item=read(`${root}/history/${g.id}/${n}`);if(n!==digest(item)+'.json')throw new Error('HISTORY_HASH_MISMATCH');return item;
}));
for(const group of catalog.groups)if(!history.some(h=>digest(h)===digest(group)))throw new Error('CURRENT_SNAPSHOT_NOT_ARCHIVED');
const base=process.env.REVIEW_BASE_SHA;
if(base&&/^[a-f0-9]{40}$/.test(base)){
 const git=(...args)=>execFileSync('git',args,{encoding:'utf8'});
 const paths=git('ls-tree','-r','--name-only',base,root+'/history').split('\n').filter(Boolean);
 for(const path of paths)if(!existsSync(path)||readFileSync(path,'utf8')!==git('show',`${base}:${path}`))throw new Error('HISTORICAL_EVIDENCE_REWRITTEN');
 let old;
 try{old=JSON.parse(git('show',`${base}:${root}/catalog.json`));}catch{old=null;}
 if(old){
  const oldHistory=paths.map(p=>JSON.parse(git('show',`${base}:${p}`)));
  for(const group of catalog.groups){const prior=old.groups.find(g=>g.id===group.id);
   if(!prior||materialHash(prior,prior.package)!==materialHash(group,group.package)){
    if(prior?.package.revision===group.package.revision)throw new Error('MATERIAL_EDIT_REQUIRES_NEW_REVISION');
    if(oldHistory.some(g=>g.id===group.id&&g.package.revision===group.package.revision))throw new Error('REVISION_REUSE_OR_ROLLBACK_REJECTED');
   }
  }
 }
}
console.log(JSON.stringify({status:'PASS',groups:catalog.groups.length,historicalSnapshots:history.length,clinicalApproval:false}));
