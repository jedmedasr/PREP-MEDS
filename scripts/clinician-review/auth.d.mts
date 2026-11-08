import type {Actor} from './core.mjs';
export const SESSION_COOKIE:string;
export const LOGIN_COOKIE:string;
export interface Config {origin:string;secret:string;allowedIds:string[];clientId:string;clientSecret:string;storeToken:string;auditKey:string}
export function config(env?:Record<string,string|undefined>):Config;
export function loginRequest(c:Config):{url:string;cookie:string};
export function completeLogin(c:Config,cookie:string|undefined,code:string|null,state:string|null):Promise<string>;
export function authenticate(c:Config,cookie:string|undefined):Promise<{actor:Actor;csrf:string}>;
export function requireMutation(request:Request,c:Config,csrf:string):void;
