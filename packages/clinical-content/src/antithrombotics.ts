import type { ClinicalRule } from '@prep-meds/clinical-engine';
import type { EvidenceAtom, EvidenceBundle, SourceDocument } from '@prep-meds/evidence';

const generatedAt = '2026-09-17T02:00:00Z';
const procedures = ['EGD', 'COLONOSCOPY', 'EGD_COLONOSCOPY'] as const;

const sources: SourceDocument[] = [
  {
    id: 'SRC-ACG-CAG-ANTITHROMBOTIC-2022-BATCH1',
    version: 1,
    sourceType: 'GUIDELINE',
    title: 'ACG-CAG Clinical Practice Guideline: Management of Anticoagulants and Antiplatelets During Acute Gastrointestinal Bleeding and the Periendoscopic Period',
    publisher: 'American College of Gastroenterology / Canadian Association of Gastroenterology',
    societyOrRegulator: 'ACG/CAG',
    publicationDate: '2022-03-17',
    externalIdentifier: 'doi:10.14309/ajg.0000000000001627',
    jurisdiction: 'US/Canada',
    language: 'en',
    retrievedAt: generatedAt,
    lifecycle: 'DRAFT',
  },
  {
    id: 'SRC-CHEST-PERIOP-ANTITHROMBOTIC-2022',
    version: 1,
    sourceType: 'GUIDELINE',
    title: 'Perioperative Management of Antithrombotic Therapy: An American College of Chest Physicians Clinical Practice Guideline',
    publisher: 'CHEST',
    societyOrRegulator: 'American College of Chest Physicians',
    publicationDate: '2022-08-11',
    externalIdentifier: 'doi:10.1016/j.chest.2022.07.025',
    jurisdiction: 'US/international',
    language: 'en',
    retrievedAt: generatedAt,
    lifecycle: 'DRAFT',
  },
  {
    id: 'SRC-BSG-ESGE-ANTITHROMBOTIC-2021',
    version: 1,
    sourceType: 'GUIDELINE',
    title: 'Endoscopy in patients on antiplatelet or anticoagulant therapy: BSG and ESGE guideline update',
    publisher: 'British Society of Gastroenterology / European Society of Gastrointestinal Endoscopy',
    societyOrRegulator: 'BSG/ESGE',
    publicationDate: '2021-08-05',
    externalIdentifier: 'doi:10.1136/gutjnl-2021-325184',
    jurisdiction: 'UK/Europe',
    language: 'en',
    retrievedAt: generatedAt,
    lifecycle: 'DRAFT',
  },
  {
    id: 'SRC-FDA-APIXABAN-LABEL-2025',
    version: 1,
    sourceType: 'FDA_LABEL',
    title: 'Apixaban tablets prescribing information',
    publisher: 'U.S. Food and Drug Administration / DailyMed',
    societyOrRegulator: 'FDA',
    publicationDate: '2025-04-03',
    externalIdentifier: 'DailyMed SETID 396912c0-9f68-47ed-ba3f-8d9ace755a48',
    jurisdiction: 'US',
    language: 'en',
    retrievedAt: generatedAt,
    lifecycle: 'DRAFT',
  },
  {
    id: 'SRC-FDA-RIVAROXABAN-LABEL-2025',
    version: 1,
    sourceType: 'FDA_LABEL',
    title: 'Rivaroxaban tablets prescribing information',
    publisher: 'U.S. Food and Drug Administration / DailyMed',
    societyOrRegulator: 'FDA',
    publicationDate: '2025-11-28',
    externalIdentifier: 'DailyMed SETID 9fee7136-c8fd-4bea-ab15-7a0e7292396d',
    jurisdiction: 'US',
    language: 'en',
    retrievedAt: generatedAt,
    lifecycle: 'DRAFT',
  },
  {
    id: 'SRC-FDA-CLOPIDOGREL-LABEL',
    version: 1,
    sourceType: 'FDA_LABEL',
    title: 'Clopidogrel tablets prescribing information',
    publisher: 'U.S. Food and Drug Administration / DailyMed',
    societyOrRegulator: 'FDA',
    jurisdiction: 'US',
    language: 'en',
    retrievedAt: generatedAt,
    lifecycle: 'DRAFT',
  },
  {
    id: 'SRC-FDA-PRASUGREL-LABEL-2022',
    version: 1,
    sourceType: 'FDA_LABEL',
    title: 'Prasugrel tablets prescribing information',
    publisher: 'U.S. Food and Drug Administration / DailyMed',
    societyOrRegulator: 'FDA',
    publicationDate: '2022-09-07',
    jurisdiction: 'US',
    language: 'en',
    retrievedAt: generatedAt,
    lifecycle: 'DRAFT',
  },
  {
    id: 'SRC-FDA-TICAGRELOR-LABEL',
    version: 1,
    sourceType: 'FDA_LABEL',
    title: 'Ticagrelor tablets prescribing information',
    publisher: 'U.S. Food and Drug Administration / DailyMed',
    societyOrRegulator: 'FDA',
    jurisdiction: 'US',
    language: 'en',
    retrievedAt: generatedAt,
    lifecycle: 'DRAFT',
  },
];

function atom(args: {
  id: string;
  sourceId: string;
  claim: string;
  normalizedTopic: string;
  stance: EvidenceAtom['stance'];
  evidenceStrength: EvidenceAtom['evidenceStrength'];
  applicability: EvidenceAtom['applicability'];
  title: string;
  summary: string;
  keywords: string[];
  concepts: string[];
  authority: number;
  limitations?: string[];
  conflictGroup?: string;
}): EvidenceAtom {
  return {
    id: args.id,
    version: 1,
    source: { id: args.sourceId, version: 1 },
    claim: args.claim,
    normalizedTopic: args.normalizedTopic,
    stance: args.stance,
    evidenceStrength: args.evidenceStrength,
    applicability: args.applicability,
    locator: {},
    limitations: args.limitations ?? [],
    ...(args.conflictGroup ? { conflictGroup: args.conflictGroup } : {}),
    retrieval: {
      title: args.title,
      summary: args.summary,
      keywords: args.keywords,
      concepts: args.concepts,
      sourceAuthorityRank: args.authority,
    },
    lifecycle: 'DRAFT',
    createdAt: generatedAt,
  };
}

const timingConflict = 'CONFLICT-ENDOSCOPY-ANTITHROMBOTIC-TIMING';

const atoms: EvidenceAtom[] = [
  atom({
    id: 'EVD-B1-ACG-DOAC-INTERRUPT', sourceId: 'SRC-ACG-CAG-ANTITHROMBOTIC-2022-BATCH1',
    claim: 'For elective planned GI endoscopy, ACG/CAG suggests temporary interruption of direct oral anticoagulants rather than continuation.',
    normalizedTopic: 'elective-endoscopy-doac-interruption', stance: 'SUPPORTS', evidenceStrength: 'VERY_LOW',
    applicability: { drugClassIds: ['CLS-doac-factor-xa', 'CLS-direct-thrombin-inhibitor'], procedureCodes: [...procedures] },
    title: 'ACG/CAG favors temporary DOAC interruption for elective endoscopy',
    summary: 'US/Canadian GI guidance favors temporary DOAC interruption but does not establish one universal interval for every drug and patient.',
    keywords: ['DOAC', 'apixaban', 'rivaroxaban', 'edoxaban', 'dabigatran'], concepts: ['doac-interruption'], authority: 100,
    limitations: ['Conditional recommendation with very low certainty.', 'Exact timing and restart remain context dependent.'], conflictGroup: timingConflict,
  }),
  atom({
    id: 'EVD-B1-ACG-WARFARIN-CONTINUE', sourceId: 'SRC-ACG-CAG-ANTITHROMBOTIC-2022-BATCH1',
    claim: 'ACG/CAG suggests warfarin continuation for elective planned GI endoscopy in general, with interruption considered for higher-bleeding-risk advanced procedures.',
    normalizedTopic: 'elective-endoscopy-warfarin', stance: 'CONDITIONAL', evidenceStrength: 'VERY_LOW',
    applicability: { medicationIds: ['MED-warfarin'], procedureCodes: [...procedures] },
    title: 'ACG/CAG warfarin guidance is procedure-risk dependent',
    summary: 'Warfarin is not a universal stop medication for elective endoscopy; procedure and thromboembolic risk matter.',
    keywords: ['warfarin', 'endoscopy', 'polypectomy'], concepts: ['warfarin', 'procedure-risk'], authority: 100,
    limitations: ['Conditional recommendation with very low certainty.', 'Local colonoscopy intervention assumptions may be more restrictive.'], conflictGroup: timingConflict,
  }),
  atom({
    id: 'EVD-B1-ACG-NO-ROUTINE-BRIDGE', sourceId: 'SRC-ACG-CAG-ANTITHROMBOTIC-2022-BATCH1',
    claim: 'When warfarin is interrupted for elective endoscopy, ACG/CAG suggests against routine bridging anticoagulation, with selected high-risk exceptions requiring individualized review.',
    normalizedTopic: 'warfarin-bridging', stance: 'CONDITIONAL', evidenceStrength: 'LOW',
    applicability: { medicationIds: ['MED-warfarin'], procedureCodes: [...procedures] },
    title: 'Routine warfarin bridging is generally discouraged', summary: 'Bridge decisions require the actual indication and thrombotic-risk context.',
    keywords: ['warfarin', 'bridging', 'LMWH'], concepts: ['warfarin-bridging'], authority: 100,
  }),
  atom({
    id: 'EVD-B1-ACG-DAPT', sourceId: 'SRC-ACG-CAG-ANTITHROMBOTIC-2022-BATCH1',
    claim: 'For dual antiplatelet therapy used for secondary prevention, ACG/CAG suggests temporary interruption of the P2Y12 inhibitor while continuing aspirin for elective endoscopy.',
    normalizedTopic: 'elective-endoscopy-dapt', stance: 'CONDITIONAL', evidenceStrength: 'VERY_LOW',
    applicability: { drugClassIds: ['CLS-p2y12-inhibitor'], procedureCodes: [...procedures], contextTags: ['dual-antiplatelet-therapy'] },
    title: 'DAPT requires component-specific planning', summary: 'Recent ACS or coronary stent status materially changes whether P2Y12 interruption is safe.',
    keywords: ['DAPT', 'aspirin', 'P2Y12'], concepts: ['dapt'], authority: 100,
  }),
  atom({
    id: 'EVD-B1-ACG-P2Y12-MONOTHERAPY-UNCERTAIN', sourceId: 'SRC-ACG-CAG-ANTITHROMBOTIC-2022-BATCH1',
    claim: 'ACG/CAG could not recommend for or against temporary interruption of single-agent P2Y12 therapy before elective endoscopy.',
    normalizedTopic: 'p2y12-monotherapy-uncertainty', stance: 'INSUFFICIENT', evidenceStrength: 'VERY_LOW',
    applicability: { drugClassIds: ['CLS-p2y12-inhibitor'], procedureCodes: [...procedures], contextTags: ['monotherapy'] },
    title: 'Single-agent P2Y12 interruption remains unresolved', summary: 'The GI guideline does not support a universal stop or continue instruction for P2Y12 monotherapy.',
    keywords: ['P2Y12', 'clopidogrel', 'prasugrel', 'ticagrelor'], concepts: ['p2y12', 'evidence-gap'], authority: 100,
  }),
  atom({
    id: 'EVD-B1-ACG-ASPIRIN-SECONDARY-CONTINUE', sourceId: 'SRC-ACG-CAG-ANTITHROMBOTIC-2022-BATCH1',
    claim: 'For cardiac aspirin monotherapy used for secondary prevention, ACG/CAG suggests against interruption for elective endoscopy.',
    normalizedTopic: 'aspirin-secondary-prevention-endoscopy', stance: 'SUPPORTS', evidenceStrength: 'VERY_LOW',
    applicability: { medicationIds: ['MED-aspirin'], procedureCodes: [...procedures], contextTags: ['secondary-cardiovascular-prevention', 'monotherapy'] },
    title: 'Continue secondary-prevention aspirin monotherapy', summary: 'This recommendation does not automatically apply to primary-prevention aspirin or combination antithrombotic therapy.',
    keywords: ['aspirin', 'secondary prevention'], concepts: ['aspirin-continuation'], authority: 100,
  }),
  atom({
    id: 'EVD-B1-ACG-RESTART-UNCERTAIN', sourceId: 'SRC-ACG-CAG-ANTITHROMBOTIC-2022-BATCH1',
    claim: 'ACG/CAG could not recommend one universal same-day versus later restart interval after elective endoscopy for interrupted warfarin, DOACs, or P2Y12 inhibitors.',
    normalizedTopic: 'antithrombotic-restart-uncertainty', stance: 'INSUFFICIENT', evidenceStrength: 'VERY_LOW',
    applicability: { procedureCodes: [...procedures], contextTags: ['post-procedure-restart'] },
    title: 'Post-endoscopy restart timing is context dependent', summary: 'Actual intervention, hemostasis, bleeding risk, and thrombotic risk inform restart.',
    keywords: ['restart', 'warfarin', 'DOAC', 'P2Y12'], concepts: ['restart-owner'], authority: 100,
  }),
  atom({
    id: 'EVD-B1-CHEST-DOAC-INTERRUPTION', sourceId: 'SRC-CHEST-PERIOP-ANTITHROMBOTIC-2022',
    claim: 'CHEST provides short preprocedural interruption pathways for factor Xa DOACs and a renal-function-sensitive longer range for dabigatran, with timing dependent on bleeding risk.',
    normalizedTopic: 'perioperative-doac-timing', stance: 'CONDITIONAL', evidenceStrength: 'VERY_LOW',
    applicability: { drugClassIds: ['CLS-doac-factor-xa', 'CLS-direct-thrombin-inhibitor'], procedureCodes: [...procedures] },
    title: 'CHEST uses bleeding-risk and renal-sensitive DOAC interruption', summary: 'General perioperative guidance is not automatically an endoscopy-specific operational protocol.',
    keywords: ['CHEST', 'DOAC', 'dabigatran', 'renal'], concepts: ['doac-timing', 'renal-function'], authority: 90,
    limitations: ['General perioperative guidance rather than a GI-only guideline.'], conflictGroup: timingConflict,
  }),
  atom({
    id: 'EVD-B1-CHEST-NO-DOAC-BRIDGE', sourceId: 'SRC-CHEST-PERIOP-ANTITHROMBOTIC-2022',
    claim: 'CHEST suggests against perioperative heparin bridging when a DOAC is interrupted.',
    normalizedTopic: 'doac-no-bridging', stance: 'SUPPORTS', evidenceStrength: 'VERY_LOW',
    applicability: { drugClassIds: ['CLS-doac-factor-xa', 'CLS-direct-thrombin-inhibitor'], procedureCodes: [...procedures] },
    title: 'Routine DOAC bridging is discouraged', summary: 'Interrupted DOAC therapy generally does not require heparin bridging.',
    keywords: ['DOAC', 'bridging', 'heparin'], concepts: ['doac-no-bridge'], authority: 90,
  }),
  atom({
    id: 'EVD-B1-CHEST-COLONOSCOPY-WARFARIN-BRIDGE', sourceId: 'SRC-CHEST-PERIOP-ANTITHROMBOTIC-2022',
    claim: 'For colonoscopy with anticipated polypectomy when warfarin interruption is required, CHEST suggests against heparin bridging during the interruption period.',
    normalizedTopic: 'colonoscopy-polypectomy-warfarin-bridging', stance: 'SUPPORTS', evidenceStrength: 'VERY_LOW',
    applicability: { medicationIds: ['MED-warfarin'], procedureCodes: ['COLONOSCOPY', 'EGD_COLONOSCOPY'], contextTags: ['anticipated-polypectomy'] },
    title: 'CHEST discourages bridging for interrupted warfarin around colonoscopy with anticipated polypectomy',
    summary: 'Whether warfarin itself is interrupted still depends on the indication and thrombotic-risk context.',
    keywords: ['warfarin', 'colonoscopy', 'polypectomy', 'bridging'], concepts: ['warfarin-bridging'], authority: 90,
  }),
  atom({
    id: 'EVD-B1-BSG-LOW-HIGH-RISK-ENDOSCOPY', sourceId: 'SRC-BSG-ESGE-ANTITHROMBOTIC-2021',
    claim: 'BSG/ESGE distinguishes lower- and higher-bleeding-risk endoscopic procedures and changes antithrombotic management according to procedural risk.',
    normalizedTopic: 'endoscopy-procedure-risk-antithrombotics', stance: 'DESCRIPTIVE', evidenceStrength: 'LOW',
    applicability: { procedureCodes: [...procedures] },
    title: 'BSG/ESGE separates endoscopic procedure-risk pathways', summary: 'European guidance is retained as evidence context rather than silently substituted for US or local policy.',
    keywords: ['BSG', 'ESGE', 'endoscopy', 'polypectomy'], concepts: ['procedure-risk'], authority: 75,
    conflictGroup: timingConflict,
  }),
  atom({
    id: 'EVD-B1-BSG-HIGH-RISK-TIMING', sourceId: 'SRC-BSG-ESGE-ANTITHROMBOTIC-2021',
    claim: 'For higher-risk endoscopic procedures, BSG/ESGE uses longer interruption pathways for P2Y12 inhibitors, warfarin, and DOACs, with renal-function-sensitive handling of dabigatran.',
    normalizedTopic: 'high-risk-endoscopy-antithrombotic-timing', stance: 'CONDITIONAL', evidenceStrength: 'LOW',
    applicability: { procedureCodes: ['COLONOSCOPY', 'EGD_COLONOSCOPY'], contextTags: ['potential-polypectomy'] },
    title: 'BSG/ESGE high-risk timing differs from other pathways', summary: 'Timing differences are preserved as an explicit policy conflict rather than automatically resolved.',
    keywords: ['BSG', 'ESGE', 'DOAC', 'warfarin', 'P2Y12'], concepts: ['timing-conflict'], authority: 75,
    conflictGroup: timingConflict,
  }),
  atom({
    id: 'EVD-B1-FDA-APIXABAN-PREMATURE-DISCONTINUATION', sourceId: 'SRC-FDA-APIXABAN-LABEL-2025',
    claim: 'The apixaban label carries a boxed warning that premature discontinuation increases the risk of thrombotic events.',
    normalizedTopic: 'apixaban-premature-discontinuation', stance: 'DESCRIPTIVE', evidenceStrength: 'NOT_GRADED',
    applicability: { medicationIds: ['MED-apixaban'], procedureCodes: [...procedures] },
    title: 'Apixaban premature discontinuation increases thrombosis risk', summary: 'The label warning does not itself determine the correct endoscopy interruption interval.',
    keywords: ['apixaban', 'Eliquis', 'boxed warning'], concepts: ['premature-discontinuation'], authority: 100,
  }),
  atom({
    id: 'EVD-B1-FDA-RIVAROXABAN-PREMATURE-DISCONTINUATION', sourceId: 'SRC-FDA-RIVAROXABAN-LABEL-2025',
    claim: 'The rivaroxaban label carries a boxed warning that premature discontinuation increases the risk of thrombotic events.',
    normalizedTopic: 'rivaroxaban-premature-discontinuation', stance: 'DESCRIPTIVE', evidenceStrength: 'NOT_GRADED',
    applicability: { medicationIds: ['MED-rivaroxaban'], procedureCodes: [...procedures] },
    title: 'Rivaroxaban premature discontinuation increases thrombosis risk', summary: 'The label warning does not itself determine the correct endoscopy interruption interval.',
    keywords: ['rivaroxaban', 'Xarelto', 'boxed warning'], concepts: ['premature-discontinuation'], authority: 100,
  }),
  atom({
    id: 'EVD-B1-FDA-CLOPIDOGREL-DISCONTINUATION', sourceId: 'SRC-FDA-CLOPIDOGREL-LABEL',
    claim: 'Clopidogrel labeling warns against unsupervised discontinuation because premature interruption can increase cardiovascular risk and describes surgery-related interruption when antiplatelet effect is not desired.',
    normalizedTopic: 'clopidogrel-discontinuation', stance: 'DESCRIPTIVE', evidenceStrength: 'NOT_GRADED',
    applicability: { medicationIds: ['MED-clopidogrel'], procedureCodes: [...procedures] },
    title: 'Clopidogrel discontinuation requires prescriber-directed planning', summary: 'A surgical label interval is not substituted for GI-endoscopy-specific decision making.',
    keywords: ['clopidogrel', 'Plavix', 'surgery'], concepts: ['p2y12-discontinuation'], authority: 100,
  }),
  atom({
    id: 'EVD-B1-FDA-PRASUGREL-DISCONTINUATION', sourceId: 'SRC-FDA-PRASUGREL-LABEL-2022',
    claim: 'Prasugrel labeling describes clinically important perioperative bleeding and discontinuation considerations and directs patients not to stop therapy without the prescribing clinician.',
    normalizedTopic: 'prasugrel-discontinuation', stance: 'DESCRIPTIVE', evidenceStrength: 'NOT_GRADED',
    applicability: { medicationIds: ['MED-prasugrel'], procedureCodes: [...procedures] },
    title: 'Prasugrel requires prescriber-directed perioperative planning', summary: 'The drug label is not an endoscopy-specific protocol.',
    keywords: ['prasugrel', 'Effient', 'surgery'], concepts: ['p2y12-discontinuation'], authority: 100,
  }),
  atom({
    id: 'EVD-B1-FDA-TICAGRELOR-DISCONTINUATION', sourceId: 'SRC-FDA-TICAGRELOR-LABEL',
    claim: 'Ticagrelor labeling warns patients not to stop therapy without the prescriber because premature interruption after coronary stenting can increase stent thrombosis, myocardial infarction, or death.',
    normalizedTopic: 'ticagrelor-discontinuation', stance: 'DESCRIPTIVE', evidenceStrength: 'NOT_GRADED',
    applicability: { medicationIds: ['MED-ticagrelor'], procedureCodes: [...procedures] },
    title: 'Ticagrelor should not be stopped without prescriber coordination', summary: 'The drug label is not an endoscopy-specific protocol.',
    keywords: ['ticagrelor', 'Brilinta', 'stent'], concepts: ['p2y12-discontinuation'], authority: 100,
  }),
];

export const antithromboticEvidence: EvidenceBundle = {
  schemaVersion: '1.0.0',
  generatedAt,
  sources,
  atoms,
  conflicts: [
    {
      conflictGroup: timingConflict,
      atomRefs: [
        { id: 'EVD-B1-ACG-DOAC-INTERRUPT', version: 1 },
        { id: 'EVD-B1-ACG-WARFARIN-CONTINUE', version: 1 },
        { id: 'EVD-B1-CHEST-DOAC-INTERRUPTION', version: 1 },
        { id: 'EVD-B1-BSG-LOW-HIGH-RISK-ENDOSCOPY', version: 1 },
        { id: 'EVD-B1-BSG-HIGH-RISK-TIMING', version: 1 },
      ],
      reason: 'CONDITIONAL_DISAGREEMENT',
      summary: 'Major sources use different procedure-risk definitions and interruption intervals. Operational timing requires an approved US/local policy and patient-specific modifiers.',
    },
  ],
};

const commonAnticoagulantModifiers = [
  'MOD-anticoagulation-indication',
  'MOD-recent-thrombotic-event',
  'MOD-concomitant-antithrombotic',
];

function reviewRule(args: {
  id: string;
  name: string;
  medicationIds: string[];
  evidenceRefs: Array<{ id: string; version: number }>;
  requiredModifierIds?: string[];
  restartOwner?: 'ENDOSCOPIST' | 'PRESCRIBER' | 'CLINICIAN_REVIEW';
  policyDependencyIds?: string[];
}): ClinicalRule {
  return {
    id: args.id,
    version: 1,
    name: args.name,
    scope: { medicationIds: args.medicationIds, procedureCodes: [...procedures] },
    requiredModifierIds: args.requiredModifierIds ?? commonAnticoagulantModifiers,
    disposition: 'CLINICIAN_REVIEW_REQUIRED',
    restartOwner: args.restartOwner ?? 'ENDOSCOPIST',
    evidenceRefs: args.evidenceRefs,
    ...(args.policyDependencyIds ? { policyDependencyIds: args.policyDependencyIds } : {}),
    status: 'CLINICAL_REVIEW',
    priority: 30,
  };
}

const p2y12RuleSpecs = [
  ['MED-clopidogrel', 'Clopidogrel', 'EVD-B1-FDA-CLOPIDOGREL-DISCONTINUATION'],
  ['MED-prasugrel', 'Prasugrel', 'EVD-B1-FDA-PRASUGREL-DISCONTINUATION'],
  ['MED-ticagrelor', 'Ticagrelor', 'EVD-B1-FDA-TICAGRELOR-DISCONTINUATION'],
  ['MED-ticlopidine', 'Ticlopidine', 'EVD-B1-ACG-P2Y12-MONOTHERAPY-UNCERTAIN'],
] as const;

export const antithromboticCandidateRules: ClinicalRule[] = [
  reviewRule({
    id: 'RULE-B1-APIXABAN-REVIEW', name: 'Apixaban peri-endoscopic review pathway', medicationIds: ['MED-apixaban'],
    evidenceRefs: [
      { id: 'EVD-B1-ACG-DOAC-INTERRUPT', version: 1 }, { id: 'EVD-B1-CHEST-DOAC-INTERRUPTION', version: 1 },
      { id: 'EVD-B1-CHEST-NO-DOAC-BRIDGE', version: 1 }, { id: 'EVD-B1-FDA-APIXABAN-PREMATURE-DISCONTINUATION', version: 1 },
    ],
    policyDependencyIds: ['POLICY-GI-ANTITHROMBOTIC-TIMING'],
  }),
  reviewRule({
    id: 'RULE-B1-RIVAROXABAN-REVIEW', name: 'Rivaroxaban peri-endoscopic review pathway', medicationIds: ['MED-rivaroxaban'],
    evidenceRefs: [
      { id: 'EVD-B1-ACG-DOAC-INTERRUPT', version: 1 }, { id: 'EVD-B1-CHEST-DOAC-INTERRUPTION', version: 1 },
      { id: 'EVD-B1-CHEST-NO-DOAC-BRIDGE', version: 1 }, { id: 'EVD-B1-FDA-RIVAROXABAN-PREMATURE-DISCONTINUATION', version: 1 },
    ],
    policyDependencyIds: ['POLICY-GI-ANTITHROMBOTIC-TIMING'],
  }),
  reviewRule({
    id: 'RULE-B1-EDOXABAN-REVIEW', name: 'Edoxaban peri-endoscopic review pathway', medicationIds: ['MED-edoxaban'],
    evidenceRefs: [
      { id: 'EVD-B1-ACG-DOAC-INTERRUPT', version: 1 }, { id: 'EVD-B1-CHEST-DOAC-INTERRUPTION', version: 1 },
      { id: 'EVD-B1-CHEST-NO-DOAC-BRIDGE', version: 1 },
    ],
    policyDependencyIds: ['POLICY-GI-ANTITHROMBOTIC-TIMING'],
  }),
  reviewRule({
    id: 'RULE-B1-DABIGATRAN-REVIEW', name: 'Dabigatran renal-sensitive peri-endoscopic review pathway', medicationIds: ['MED-dabigatran'],
    evidenceRefs: [
      { id: 'EVD-B1-ACG-DOAC-INTERRUPT', version: 1 }, { id: 'EVD-B1-CHEST-DOAC-INTERRUPTION', version: 1 },
      { id: 'EVD-B1-BSG-HIGH-RISK-TIMING', version: 1 }, { id: 'EVD-B1-CHEST-NO-DOAC-BRIDGE', version: 1 },
    ],
    requiredModifierIds: [...commonAnticoagulantModifiers, 'MOD-verified-crcl-band'],
    policyDependencyIds: ['POLICY-GI-ANTITHROMBOTIC-TIMING'],
  }),
  reviewRule({
    id: 'RULE-B1-WARFARIN-REVIEW', name: 'Warfarin procedure- and thrombotic-risk review pathway', medicationIds: ['MED-warfarin'],
    evidenceRefs: [
      { id: 'EVD-B1-ACG-WARFARIN-CONTINUE', version: 1 }, { id: 'EVD-B1-ACG-NO-ROUTINE-BRIDGE', version: 1 },
      { id: 'EVD-B1-CHEST-COLONOSCOPY-WARFARIN-BRIDGE', version: 1 }, { id: 'EVD-B1-BSG-LOW-HIGH-RISK-ENDOSCOPY', version: 1 },
    ],
    requiredModifierIds: [...commonAnticoagulantModifiers, 'MOD-mechanical-heart-valve'],
    policyDependencyIds: ['POLICY-GI-ANTITHROMBOTIC-TIMING'],
  }),
  reviewRule({
    id: 'RULE-B1-ENOXAPARIN-REVIEW', name: 'Enoxaparin peri-endoscopic review pathway', medicationIds: ['MED-enoxaparin'],
    evidenceRefs: [{ id: 'EVD-B1-CHEST-COLONOSCOPY-WARFARIN-BRIDGE', version: 1 }],
    requiredModifierIds: ['MOD-anticoagulation-indication', 'MOD-anticoagulant-intent', 'MOD-recent-thrombotic-event', 'MOD-verified-crcl-band'], restartOwner: 'CLINICIAN_REVIEW',
  }),
  reviewRule({
    id: 'RULE-B1-DALTEPARIN-REVIEW', name: 'Dalteparin peri-endoscopic review pathway', medicationIds: ['MED-dalteparin'],
    evidenceRefs: [{ id: 'EVD-B1-CHEST-COLONOSCOPY-WARFARIN-BRIDGE', version: 1 }],
    requiredModifierIds: ['MOD-anticoagulation-indication', 'MOD-anticoagulant-intent', 'MOD-recent-thrombotic-event', 'MOD-verified-crcl-band'], restartOwner: 'CLINICIAN_REVIEW',
  }),
  reviewRule({
    id: 'RULE-B1-HEPARIN-REVIEW', name: 'Unfractionated heparin peri-endoscopic review pathway', medicationIds: ['MED-heparin'],
    evidenceRefs: [{ id: 'EVD-B1-CHEST-NO-DOAC-BRIDGE', version: 1 }],
    requiredModifierIds: ['MOD-anticoagulation-indication', 'MOD-anticoagulant-intent', 'MOD-recent-thrombotic-event'], restartOwner: 'CLINICIAN_REVIEW',
  }),
  reviewRule({
    id: 'RULE-B1-FONDAPARINUX-REVIEW', name: 'Fondaparinux peri-endoscopic review pathway', medicationIds: ['MED-fondaparinux'],
    evidenceRefs: [{ id: 'EVD-B1-CHEST-NO-DOAC-BRIDGE', version: 1 }],
    requiredModifierIds: ['MOD-anticoagulation-indication', 'MOD-anticoagulant-intent', 'MOD-recent-thrombotic-event', 'MOD-verified-crcl-band'], restartOwner: 'CLINICIAN_REVIEW',
  }),
  {
    id: 'RULE-B1-ASPIRIN-SECONDARY-MONOTHERAPY',
    version: 1,
    name: 'Aspirin monotherapy for confirmed secondary cardiovascular prevention',
    scope: { medicationIds: ['MED-aspirin'], procedureCodes: [...procedures] },
    requiredModifierIds: ['MOD-aspirin-indication', 'MOD-dual-antiplatelet-therapy', 'MOD-concomitant-antithrombotic'],
    hardStops: [
      {
        reasonCode: 'ASPIRIN_NOT_CONFIRMED_SECONDARY_PREVENTION',
        condition: { op: 'NOT_EQUALS', field: 'modifier:MOD-aspirin-indication', value: 'SECONDARY_CV_PREVENTION' },
        disposition: 'CLINICIAN_REVIEW_REQUIRED',
      },
      {
        reasonCode: 'ASPIRIN_DAPT_REQUIRES_COMPONENT_REVIEW',
        condition: { op: 'EQUALS', field: 'modifier:MOD-dual-antiplatelet-therapy', value: true },
        disposition: 'CLINICIAN_REVIEW_REQUIRED',
      },
      {
        reasonCode: 'ASPIRIN_WITH_OTHER_ANTITHROMBOTIC_REQUIRES_REVIEW',
        condition: { op: 'EQUALS', field: 'modifier:MOD-concomitant-antithrombotic', value: true },
        disposition: 'CLINICIAN_REVIEW_REQUIRED',
      },
    ],
    disposition: 'CONTINUE',
    restartOwner: 'NOT_APPLICABLE',
    evidenceRefs: [{ id: 'EVD-B1-ACG-ASPIRIN-SECONDARY-CONTINUE', version: 1 }],
    status: 'CLINICAL_REVIEW',
    priority: 40,
  },
  ...p2y12RuleSpecs.map(([medicationId, displayName, labelEvidenceId]) =>
    reviewRule({
      id: `RULE-B1-${displayName.toUpperCase()}-REVIEW`,
      name: `${displayName} peri-endoscopic antiplatelet review pathway`,
      medicationIds: [medicationId],
      evidenceRefs: [
        { id: 'EVD-B1-ACG-DAPT', version: 1 },
        { id: 'EVD-B1-ACG-P2Y12-MONOTHERAPY-UNCERTAIN', version: 1 },
        { id: labelEvidenceId, version: 1 },
      ],
      requiredModifierIds: ['MOD-antiplatelet-indication', 'MOD-dual-antiplatelet-therapy', 'MOD-recent-coronary-stent-or-acs', 'MOD-concomitant-antithrombotic'],
      restartOwner: 'ENDOSCOPIST',
      policyDependencyIds: ['POLICY-GI-ANTITHROMBOTIC-TIMING'],
    }),
  ),
  reviewRule({
    id: 'RULE-B1-DIPYRIDAMOLE-REVIEW', name: 'Dipyridamole peri-endoscopic review pathway', medicationIds: ['MED-dipyridamole'],
    evidenceRefs: [{ id: 'EVD-B1-ACG-P2Y12-MONOTHERAPY-UNCERTAIN', version: 1 }],
    requiredModifierIds: ['MOD-antiplatelet-indication', 'MOD-concomitant-antithrombotic'], restartOwner: 'ENDOSCOPIST',
  }),
  reviewRule({
    id: 'RULE-B1-CILOSTAZOL-REVIEW', name: 'Cilostazol peri-endoscopic review pathway', medicationIds: ['MED-cilostazol'],
    evidenceRefs: [{ id: 'EVD-B1-BSG-LOW-HIGH-RISK-ENDOSCOPY', version: 1 }],
    requiredModifierIds: ['MOD-antiplatelet-indication', 'MOD-concomitant-antithrombotic'], restartOwner: 'ENDOSCOPIST',
  }),
  reviewRule({
    id: 'RULE-B1-ASPIRIN-DIPYRIDAMOLE-REVIEW', name: 'Aspirin/dipyridamole combination peri-endoscopic review pathway', medicationIds: ['MED-aspirin-dipyridamole'],
    evidenceRefs: [
      { id: 'EVD-B1-ACG-ASPIRIN-SECONDARY-CONTINUE', version: 1 },
      { id: 'EVD-B1-BSG-LOW-HIGH-RISK-ENDOSCOPY', version: 1 },
    ],
    requiredModifierIds: ['MOD-antiplatelet-indication', 'MOD-concomitant-antithrombotic'], restartOwner: 'ENDOSCOPIST',
  }),
];

export const antithromboticReleaseMetadata = {
  releaseId: 'PREP-MEDS-MED-BATCH-001-ANTITHROMBOTICS',
  version: 1,
  status: 'CLINICAL_REVIEW_REQUIRED' as const,
  intendedUse: 'SHADOW_VALIDATION_ONLY' as const,
  generatedAt,
  medications: [
    'MED-warfarin', 'MED-apixaban', 'MED-rivaroxaban', 'MED-edoxaban', 'MED-dabigatran',
    'MED-enoxaparin', 'MED-dalteparin', 'MED-heparin', 'MED-fondaparinux',
    'MED-aspirin', 'MED-clopidogrel', 'MED-prasugrel', 'MED-ticagrelor', 'MED-ticlopidine',
    'MED-dipyridamole', 'MED-cilostazol', 'MED-aspirin-dipyridamole',
  ],
  unresolved: [
    'Exact operational DOAC timing must be selected through approved US/local policy because current sources differ in framing and interval.',
    'Warfarin interruption versus continuation depends on procedure-risk assumptions and thrombotic context.',
    'Single-agent P2Y12 interruption remains insufficiently resolved in ACG/CAG guidance.',
    'Post-endoscopy restart timing remains dependent on actual intervention, hemostasis, and thrombotic risk.',
    'Whole-medication-list DAPT and multi-antithrombotic interaction resolution is represented by explicit modifiers until a first-class interaction primitive is implemented.',
    'No RxNorm identifiers are asserted unless independently verified in a terminology-ingestion pass.',
  ],
} as const;
