import { NextResponse } from 'next/server';
import { clinicalReviewRules, clinicalReviewEvidenceBundles, terminologyDataset } from '@/lib/content';
export async function GET(request: Request) {
 const url = new URL(request.url);
 const medicationId = url.searchParams.get('medicationId');
 const procedureCode = url.searchParams.get('procedureCode');
 if (!medicationId || !procedureCode || !['EGD','COLONOSCOPY','EGD_COLONOSCOPY'].includes(procedureCode)) return NextResponse.json({error:'Invalid request'},{status:400});
 const medication = terminologyDataset.medications.find(m=>m.id===medicationId);
 if (!medication) return NextResponse.json({error:'Unknown medication'},{status:404});
 const rules = clinicalReviewRules.filter(rule => (!rule.scope.medicationIds || rule.scope.medicationIds.includes(medicationId)) && (!rule.scope.procedureCodes || rule.scope.procedureCodes.includes(procedureCode as 'EGD'|'COLONOSCOPY'|'EGD_COLONOSCOPY')));
 const refs = new Set(rules.flatMap(rule=>rule.evidenceRefs.map(ref=>ref.id)));
 const evidence = clinicalReviewEvidenceBundles.flatMap(bundle=>bundle.atoms.filter(atom=>refs.has(atom.id)).map(atom=>{
   const source=bundle.sources.find(s=>s.id===atom.source.id);
   return {id:atom.id,title:atom.retrieval.title,summary:atom.retrieval.summary,claim:atom.claim,evidenceStrength:atom.evidenceStrength,limitations:atom.limitations,source:source?{title:source.title,publicationDate:source.publicationDate,externalIdentifier:source.externalIdentifier}:null};
 }));
 return NextResponse.json({medication:medication.canonicalName,rules,evidence,reviewOnly:true});
}
