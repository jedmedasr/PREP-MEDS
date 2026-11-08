import { appendReview, assertCatalog, validateLedger, reviewStatus, digest } from './core.mjs';
import { boundedJSON } from './auth.mjs';
const PREFIX='/repos/jedmedasr/PREP-MEDS';
export const AUDIT_BRANCH='clinical-review/audit';
export const AUDIT_PATH='clinical-review-audit/ledger.json';
export const CATALOG_PATH='clinical-content/clinician-review/catalog.json';
const SHA=/^[a-f0-9]{40}$/;

/** Contents-write token is server-only. Only the dedicated audit branch can be mutated. */
export class ReviewStore {
  constructor(token,key,inventory,{fetchImpl=fetch}={}) {this.token=token;this.key=key;this.inventory=inventory;this.fetch=fetchImpl;}
  async request(path,method='GET',body) {
    if(!path.startsWith(PREFIX+'/')||path.includes('..'))throw new Error('REVIEW_STORE_PATH_REJECTED');
    const response=await this.fetch('https://api.github.com'+path,{method,redirect:'error',cache:'no-store',signal:AbortSignal.timeout(15000),
      headers:{Accept:'application/vnd.github+json',Authorization:'Bearer '+this.token,'X-GitHub-Api-Version':'2022-11-28','Content-Type':'application/json'},
      ...(body===undefined?{}:{body:JSON.stringify(body)})});
    if(response.status===404){const e=new Error('REVIEW_STORE_NOT_FOUND');e.status=404;throw e;}
    return boundedJSON(response);
  }
  async ref(branch) {
    const r=await this.request(PREFIX+'/git/ref/heads/'+branch);
    if(!SHA.test(r?.object?.sha))throw new Error('REVIEW_STORE_REF_INVALID');return r.object.sha;
  }
  async json(path,sha) {
    const r=await this.request(PREFIX+'/contents/'+path+'?ref='+sha);
    if(r.encoding!=='base64'||typeof r.content!=='string')throw new Error('REVIEW_STORE_ENCODING');
    return JSON.parse(Buffer.from(r.content,'base64').toString('utf8'));
  }
  async catalog() {
    const sourceSha=await this.ref('main');const catalog=await this.json(CATALOG_PATH,sourceSha);
    assertCatalog(catalog,this.inventory);return {sourceSha,catalog};
  }
  async read() {
    const source=await this.catalog();
    let head=null,ledger={schemaVersion:1,events:[]};
    try {head=await this.ref(AUDIT_BRANCH);} catch(e) {if(e.status!==404)throw e;}
    if(head)ledger=await this.json(AUDIT_PATH,head); // Existing branch with missing ledger is corruption, not a fresh start.
    validateLedger(ledger,this.key);
    return {...source,head,ledger};
  }
  async review(actor,allowedIds,request,expectedHead) {
    const snapshot=await this.read();
    if(expectedHead!==snapshot.head)throw new Error('AUDIT_MOVED_REFRESH_REQUIRED');
    const next=appendReview(snapshot.catalog,this.inventory,snapshot.ledger,actor,allowedIds,request,this.key);
    if(next.resumed)return {...snapshot,event:next.event,resumed:true};
    // Both evidence and identity are revalidated by server before append. No hidden retry after a race.
    const fresh=await this.catalog();
    if(digest(fresh.catalog)!==digest(snapshot.catalog))throw new Error('STALE_EVIDENCE_REFRESH_REQUIRED');
    const parent=snapshot.head??snapshot.sourceSha;
    const c=await this.request(PREFIX+'/git/commits/'+parent);
    if(!SHA.test(c?.tree?.sha))throw new Error('REVIEW_STORE_TREE_INVALID');
    const tree=await this.request(PREFIX+'/git/trees','POST',{base_tree:c.tree.sha,tree:[{path:AUDIT_PATH,mode:'100644',type:'blob',content:JSON.stringify(next.ledger,null,2)+'\n'}]});
    const commit=await this.request(PREFIX+'/git/commits','POST',{message:`clinical evidence ${request.action}: ${request.groupId}; actor ${actor.id}; evidence ${next.event.materialHash}; catalog ${fresh.sourceSha}`,
      tree:tree.sha,parents:[parent]});
    if(!SHA.test(commit.sha))throw new Error('REVIEW_STORE_COMMIT_INVALID');
    try {
      if(snapshot.head)await this.request(PREFIX+'/git/refs/heads/'+AUDIT_BRANCH,'PATCH',{sha:commit.sha,force:false});
      else await this.request(PREFIX+'/git/refs','POST',{ref:'refs/heads/'+AUDIT_BRANCH,sha:commit.sha});
    } catch(e) { if(/^GITHUB_HTTP_(409|422)$/.test(e.message))throw new Error('AUDIT_MOVED_REFRESH_REQUIRED');throw e; }
    // Concurrent source change can leave a historical review, never valid approval of a different package.
    const after=await this.catalog();
    const group=after.catalog.groups.find(g=>g.id===request.groupId);
    return {sourceSha:after.sourceSha,head:commit.sha,ledger:next.ledger,event:next.event,resumed:false,
      effectiveState:group?reviewStatus(group,next.ledger).state:'REVIEW_INVALIDATED',
      commitUrl:`https://github.com/jedmedasr/PREP-MEDS/commit/${commit.sha}`};
  }
}
