import {readFileSync,writeFileSync,mkdirSync,existsSync,readdirSync} from 'node:fs';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {assertCatalog,digest,materialHash,POLICY_VERSION} from './core.mjs';
export function prepareImport(catalog,group,inventory,history=[]) {
 const previous=catalog.groups.find(g=>g.id===group.id);
 const next={...catalog,groups:[...catalog.groups.filter(g=>g.id!==group.id),group].sort((a,b)=>a.id.localeCompare(b.id))};
 assertCatalog(next,inventory);
 if(previous && materialHash(previous,previous.package)!==materialHash(group,group.package) && previous.package.revision===group.package.revision)throw new Error('MATERIAL_EDIT_REQUIRES_NEW_REVISION');
 if((!previous || materialHash(previous,previous.package)!==materialHash(group,group.package)) && history.some(g=>g.id===group.id&&g.package.revision===group.package.revision))throw new Error('REVISION_REUSE_OR_ROLLBACK_REJECTED');
 return {catalog:next,previous,changed:!previous||digest(previous)!==digest(group)};
}
export function immutable(path,value) {
 const data=JSON.stringify(value,null,2)+'\n';
 if(existsSync(path)){if(digest(JSON.parse(readFileSync(path,'utf8')))!==digest(value))throw new Error('HISTORY_REWRITE_REJECTED');return;}
 mkdirSync(resolve(path,'..'),{recursive:true});writeFileSync(path,data,{flag:'wx'});
}
if(process.argv[1]===fileURLToPath(import.meta.url)) {
 const [groupPath,inventoryPath,write]=process.argv.slice(2);
 if(!groupPath||!inventoryPath||write!=='--write')throw new Error('Usage: node scripts/clinician-review/import.mjs GROUP.json INVENTORY.json --write');
 const path=resolve('clinical-content/clinician-review/catalog.json');
 const catalog=JSON.parse(readFileSync(path,'utf8'));if(catalog.policyVersion!==POLICY_VERSION)throw new Error('POLICY_VERSION_MISMATCH');
 const group=JSON.parse(readFileSync(groupPath,'utf8')),inventory=JSON.parse(readFileSync(inventoryPath,'utf8'));
 if(!/^[A-Za-z0-9][A-Za-z0-9._-]{0,99}$/.test(group.id??''))throw new Error('GROUP_IDENTITY');
 const historyDir=resolve('clinical-content/clinician-review/history',String(group.id));
 const history=existsSync(historyDir)?readdirSync(historyDir).filter(n=>n.endsWith('.json')).map(n=>JSON.parse(readFileSync(resolve(historyDir,n),'utf8'))):[];
 const next=prepareImport(catalog,group,inventory,history);
 if(next.changed){for(const record of [next.previous,group].filter(Boolean))immutable(`clinical-content/clinician-review/history/${record.id}/${digest(record)}.json`,record);writeFileSync(path,JSON.stringify(next.catalog,null,2)+'\n');}
 console.log(JSON.stringify({groupId:group.id,state:group.package.state,changed:next.changed,nextAction:'Continue extraction of the next medication; clinician review is an independent queue.',independentAiRequired:false,clinicalApproval:false,patientFacingAuthorized:false}));
}
