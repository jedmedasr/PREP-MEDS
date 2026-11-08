import type {Actor,Catalog,InventoryItem,Ledger,ReviewRequest,AuditEvent} from './core.mjs';
export interface Snapshot {sourceSha:string;catalog:Catalog;head:string|null;ledger:Ledger}
export class ReviewStore {
 constructor(token:string,key:string,inventory:InventoryItem[]);
 read():Promise<Snapshot>;
 review(actor:Actor,allowedIds:string[],request:ReviewRequest,expectedHead:string|null):Promise<{event:AuditEvent;head:string|null;resumed:boolean;effectiveState?:string;commitUrl?:string}>;
}
