import { novologPresentationMarketingStatuses, novologProductDefinitions } from '@prep-meds/clinical-content';
import type { MedicationRecord } from '@prep-meds/terminology';
import {
  diabetesLevemirIdentities, diabetesLevemirMedications,
  type LevemirIdentity,
} from './diabetes-levemir';

const strengthAliases=(name:string):string[]=>[
  `${name} U-100`, `${name} U100`, `${name} 100 units/mL`,
];

const replacements:Record<string,Partial<MedicationRecord>>={
  'MED-insulin-aspart':{
    canonicalName:'Insulin aspart (product/concentration unspecified)',
    brandNames:[],
    aliases:['aspart','rapid acting insulin',...strengthAliases('insulin aspart'),...strengthAliases('aspart')],
  },
};

export const novologMedications:MedicationRecord[]=novologProductDefinitions.map((product)=>({
  id:product.medicationId,
  canonicalName:`${product.brand} U-${product.concentration} (${product.labelledActiveName})`,
  genericName:`${product.labelledActiveName} U-${product.concentration}`,
  brandNames:[product.brand],
  aliases:[`${product.brand} U-${product.concentration}`,...product.aliases],
  ingredientIds:[product.ingredientId],
  drugClassIds:[product.drugClassId],
}));

export const diabetesNovoLogMedications:MedicationRecord[]=[
  ...diabetesLevemirMedications.map((medication)=>({ ...medication, ...(replacements[medication.id]??{}) })),
  ...novologMedications,
];

export interface NovoLogIdentity extends LevemirIdentity {
  presentationMarketingStatuses?: typeof novologPresentationMarketingStatuses;
  presentationMarketingStatusEvidenceRefs?: Array<{id:string;version:number}>;
}

const unspecifiedAspart:NovoLogIdentity={
  medicationId:'MED-insulin-aspart',
  version:2,
  state:'UNSPECIFIED',
  evidenceRefs:[],
  allowsDoseCalculation:false,
  presentationConfirmed:false,
  deviceCompatibilityAuthorized:false,
  substitutionAuthorized:false,
};

export const diabetesNovoLogIdentities:Record<string,NovoLogIdentity>={
  ...diabetesLevemirIdentities,
  'MED-insulin-aspart':unspecifiedAspart,
  ...Object.fromEntries(novologProductDefinitions.map((product):[string,NovoLogIdentity]=>[
    product.medicationId,
    {
      medicationId:product.medicationId,
      version:1,
      state:'SOURCE_LINKED_IDENTITY',
      labelledActiveName:product.labelledActiveName,
      concentration:{value:product.concentration,unit:'units/mL'},
      evidenceRefs:[{id:'EVD-B2-NOVOLOG-PRODUCT-IDENTITY',version:1}],
      presentationMarketingStatuses:novologPresentationMarketingStatuses,
      presentationMarketingStatusEvidenceRefs:[{id:'EVD-B2-NOVOLOG-US-PRESENTATION-MARKETING-STATUS',version:1}],
      allowsDoseCalculation:false,
      presentationConfirmed:false,
      deviceCompatibilityAuthorized:false,
      substitutionAuthorized:false,
    },
  ])),
};

export const diabetesNovoLogAudit={
  version:7,
  status:'PARTIAL_PRODUCT_AUDIT_CLINICAL_REVIEW_REQUIRED',
  completedWorkItem:'B_NOVOLOG_PRODUCT_IDENTITY_01',
  searchableConceptCount:diabetesNovoLogMedications.length,
  sourceLinkedIdentityCount:Object.values(diabetesNovoLogIdentities).filter((identity)=>identity.state==='SOURCE_LINKED_IDENTITY').length,
  marketAvailabilityAsserted:false,
  presentationMarketingStatusVerified:true,
  rxPresentationProductCount:novologPresentationMarketingStatuses.filter((item)=>item.status==='RX').length,
  discontinuedPresentationProductCount:novologPresentationMarketingStatuses.filter((item)=>item.status==='DISCONTINUED').length,
  limitations:[
    'NovoLog presentation-level Purple Book status is preserved as mixed Rx/Disc rather than collapsed into one product-wide availability flag.',
    'Purple Book regulatory status is not a pharmacy inventory assertion.',
    'Generic insulin aspart plus concentration does not authenticate the NovoLog manufacturer identity; other insulin-aspart products/biosimilars exist.',
    'Label presentation names do not confirm a patient presentation or authorize a pump/device.',
    'No dose arithmetic, insulin conversion, substitution, transition, hold/restart instruction or clinical approval is encoded.',
    'Humalog reconciliation, oral release variants and whole-regimen validation remain open.',
  ],
} as const;
