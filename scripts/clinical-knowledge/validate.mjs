import {readFileSync} from 'node:fs';
import Ajv2020 from 'ajv/dist/2020.js';
import {validateKnowledge} from './core.mjs';
const read=p=>JSON.parse(readFileSync(p,'utf8'));
const graph=read('clinical-knowledge/catalog.json'),registry=read('clinical-knowledge/source-register.json');
const validator=new Ajv2020({allErrors:true,strict:false}).compile(read('schemas/clinical-knowledge.schema.json'));
const errors=validateKnowledge(graph,registry);
if(!validator(graph))errors.push(JSON.stringify(validator.errors));
if(errors.length){console.error(errors);process.exitCode=1;}else console.log(`Clinical graph PASS: ${graph.scenarios.length} specifications, ${graph.pathways.length} reference-only pathway, ${graph.claims.length} unverified semantic claims. No clinical authorization.`);
