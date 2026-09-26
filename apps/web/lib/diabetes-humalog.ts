import { humalogPresentationMarketingStatuses, humalogProductDefinitions } from '@prep-meds/clinical-content';
import type { MedicationRecord } from '@prep-meds/terminology';
import { diabetesNovoLogIdentities, diabetesNovoLogMedications, type NovoLogIdentity } from './diabetes-novolog';

const strengthAliases=(name:string):string[]=>[name+' U-100',name+' U100',name+' 100 units/mL',name+' U-200',name+' U200',name+' 200 units/mL'];
const replacements:Record<string,Partial<MedicationRecord>>={
  'MED-insulin-lispro':{
    canonicalName:'Insulin lispro (product/concentration unspecified)',
    brandNames:[],
    aliases:['lispro','rapid acting insulin',...strengthAliases('insulin lispro'),...strengthAliases('lispro')],
  },
};

export const humalogMedications:MedicationRecord[]=humalogProductDefinitions.map((product)=>({
  id:product.medicationId,
  canonicalName:`${product.brand} U-${product.concentration} (${product.labelledActiveName})`,
  genericName:`${product.labelledActiveName} U-${product.concentration}`,
  brandNames:[product.brand],
  aliases:[`${product.brand} U-${product.concentration}`,...product.aliases],
  ingredientIds:[product.ingredientId],drugClassIds:[product.drugClassId],
}));

export const diabetesHumalogMedications:MedicationRecord[]=[
  ...diabetesNovoLogMedications.map((medication)=>({...medication,...(replacements[medication.id]??{})})),
  ...humalogMedications,
];

export type HumalogIdentity = Omit<NovoLogIdentity, 'presentationMarketingStatuses' | 'presentationMarketingStatusEvidenceRefs'> & {
  presentationMarketingStatuses?: typeof humalogPresentationMarketingStatuses;
  presentationMarketingStatusEvidenceRefs?: Array<{id:string;version:number}>;
};

const unspecifiedLispro:HumalogIdentity={
  medicationId:'MED-insulin-lispro',version:3,state:'UNSPECIFIED',evidenceRefs:[],
  allowsDoseCalculation:false,presentationConfirmed:false,deviceCompatibilityAuthorized:false,substitutionAuthorized:false,
};

export const diabetesHumalogIdentities:Record<string,HumalogIdentity>={
  ...diabetesNovoLogIdentities,
  'MED-insulin-lispro':unspecifiedLispro,
  ...Object.fromEntries(humalogProductDefinitions.map((product):[string,HumalogIdentity]=>[
    product.medicationId,{
      medicationId:product.medicationId,version:1,state:'SOURCE_LINKED_IDENTITY',
      labelledActiveName:product.labelledActiveName,concentration:{value:product.concentration,unit:'units/mL'},
      evidenceRefs:[{id:'EVD-B2-HUMALOG-PRODUCT-IDENTITY',version:1}],
      presentationMarketingStatuses:humalogPresentationMarketingStatuses.filter((item)=>item.concentration===product.concentration),
      presentationMarketingStatusEvidenceRefs:[{id:product.concentration===100?'EVD-B2-HUMALOG-U100-US-PRESENTATION-MARKETING-STATUS':'EVD-B2-HUMALOG-U200-US-PRESENTATION-MARKETING-STATUS',version:1}],
      allowsDoseCalculation:false,presentationConfirmed:false,deviceCompatibilityAuthorized:false,substitutionAuthorized:false,
    }
  ])),
};

export const diabetesHumalogAudit={
  version:8,status:'PARTIAL_PRODUCT_AUDIT_CLINICAL_REVIEW_REQUIRED',completedWorkItem:'B_HUMALOG_PRODUCT_IDENTITY_01',
  searchableConceptCount:diabetesHumalogMedications.length,
  sourceLinkedIdentityCount:Object.values(diabetesHumalogIdentities).filter((identity)=>identity.state==='SOURCE_LINKED_IDENTITY').length,
  marketAvailabilityAsserted:false,presentationMarketingStatusVerified:true,
  rxPresentationProductCount:humalogPresentationMarketingStatuses.filter((item)=>item.status==='RX').length,
  discontinuedPresentationProductCount:humalogPresentationMarketingStatuses.filter((item)=>item.status==='DISCONTINUED').length,
  limitations:[
    'Humalog U-100 and U-200 are separate source-linked identities; numeric concentration detail is not discarded.',
    'Generic insulin lispro does not authenticate Humalog because Admelog and other lispro products exist.',
    'FDA Purple Book marketing status remains presentation/product-number metadata and is not a pharmacy inventory assertion.',
    'Label presentation names do not confirm the patient presentation or authorize a pump/device.',
    'No dose arithmetic, conversion, substitution, transition, hold/restart instruction or clinical approval is encoded.',
    'Oral release variants and whole-regimen/malformed-input validation remain open.',
  ],
} as const;
