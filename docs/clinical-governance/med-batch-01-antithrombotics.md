# Medication Batch 01 — Antithrombotics

**Status:** clinical review required  
**Intended use:** shadow validation only  
**Production activation:** prohibited until accountable clinical governance review

## Checkpoint A — evidence re-audit

**Re-audit status:** completed  
**Re-audit date:** 2026-09-16  
**Purpose:** re-validate the prior one-shot Batch 01 evidence layer under the checkpoint workflow before terminology/rule/test audits proceed.

The current evidence hierarchy was re-checked against current authoritative sources. No newer ACG/CAG periendoscopic antithrombotic guideline replacing the 2022 document was identified on the current ACG guideline index. CHEST still identifies its 2022 perioperative antithrombotic guideline as the current guideline, with its implementation resource updated in 2026. The BSG/ESGE 2021 endoscopy antithrombotic guideline remains the relevant published endoscopy-specific international comparator identified in this audit.

### Re-audit findings that must remain explicit in PREP-MEDS

1. **ACG/CAG 2022 remains the primary US-oriented GI source for elective endoscopy.** It suggests warfarin continuation for elective endoscopy in general; temporary DOAC interruption; continuation of secondary-prevention aspirin monotherapy; P2Y12 interruption while continuing aspirin for DAPT; and it does not provide a recommendation for single-agent P2Y12 interruption or a universal postprocedure restart interval for warfarin, DOACs, or P2Y12 inhibitors.
2. **High-thromboembolic-risk patients are not routine elective-pathway patients.** ACG/CAG explicitly excludes/defer-routes patients with recent VTE, stroke/TIA, recent ACS, and specified recent coronary-stent windows from the routine elective recommendations. This must remain an escalation/defer-review concept rather than being treated merely as a medication timing modifier.
3. **Mechanical-valve bridging is a genuine cross-guideline conflict.** ACG/CAG allows a mechanical-valve exception to its general recommendation against bridging when warfarin is interrupted. CHEST 2022 suggests against heparin bridging even in patients receiving VKA therapy for a mechanical heart valve who require interruption. BSG/ESGE 2021 recommends LMWH substitution for high-thrombotic-risk patients undergoing high-risk endoscopic procedures. PREP-MEDS must preserve this disagreement and require clinician/local anticoagulation policy review rather than selecting a universal bridging rule.
4. **Colonoscopy procedure-risk classification is operationally consequential.** BSG/ESGE classifies diagnostic endoscopy ± biopsy as low risk and polypectomy as high risk, while also noting that endoscopists may choose to manage colonoscopy as high risk when polypectomy may be required. PREP-MEDS' "potential intervention/polypectomy" assumption therefore remains a local GI practice policy, not a universal national fact.
5. **DOAC timing differs by source and context.** ACG/CAG supports temporary interruption but does not provide one universal drug-specific interval for all elective endoscopies. CHEST provides general perioperative drug/bleeding-risk pathways. BSG/ESGE gives explicit endoscopy timing, including longer interruption for dabigatran with reduced renal function. Exact timing must therefore remain governed and policy-sensitive.
6. **Dabigatran requires verified renal-function context.** The system must use a validated/verified creatinine-clearance result or band; it must not infer CrCl from serum creatinine or perform LLM arithmetic.
7. **P2Y12 surgery-label timing is not automatically an endoscopy rule.** Current labels support clinically important bleeding/thrombotic warnings and drug-specific surgical interruption language, but these must not override GI-specific evidence or recent-stent/ACS thrombotic risk. Clopidogrel, prasugrel, and ticagrelor interruption therefore remain clinician-reviewed in the current shadow content.
8. **Premature interruption risk is material.** Current apixaban and rivaroxaban labeling carries boxed warnings that premature discontinuation increases thrombotic risk. Clopidogrel, prasugrel, and ticagrelor labeling likewise warns against unsupervised discontinuation, particularly in patients with coronary stents. Patient-facing autonomous stop instructions remain prohibited without an approved pathway.
9. **Restart remains context dependent.** ACG/CAG found insufficient evidence to choose same-day versus later restart after elective endoscopy for warfarin, DOACs, and P2Y12 inhibitors. Other perioperative/endoscopy guidance supplies timing frameworks, but actual intervention, hemostasis, bleeding risk, thrombotic risk, and local workflow remain care-changing inputs. Restart ownership remains clinician/endoscopist unless a future approved rule states otherwise.
10. **No evidence source in this audit is promoted by automation.** SourceDocuments and EvidenceAtoms remain `DRAFT`; successful evidence verification does not equal clinical approval or activation.

### Evidence-audit disposition

Checkpoint A is complete for the re-audit workflow. The existing evidence corpus is directionally appropriate, but later checkpoints must specifically verify that the deterministic rule layer encodes the high-thromboembolic-risk defer/escalation concept and the mechanical-valve bridging conflict without collapsing either into a routine timing rule.

## Checkpoint B — terminology audit

**Audit status:** completed  
**Audit date:** 2026-09-17  
**Commit:** `451fff87225ca12f1853582fadfe4465e7e87214`

The antithrombotic terminology layer was reviewed for exact identity, class ambiguity, ingredient decomposition, and external-code safety.

### Terminology findings

1. **Exact generic and brand identity remains the deterministic resolution path.** Common current/historical patient-reported names are represented, including Eliquis, Xarelto, Savaysa, Pradaxa, Lovenox, Fragmin, Arixtra, Plavix, Effient, Brilinta, Ticlid, Persantine, Pletal, Coumadin, Jantoven, and Aggrenox where applicable.
2. **Salt/prodrug names are searchable where clinically relevant.** The dataset now recognizes terms such as dabigatran etexilate/mesylate, enoxaparin sodium, dalteparin sodium, heparin sodium, and fondaparinux sodium without creating separate PREP-MEDS clinical identities for salts that share the same management pathway.
3. **Class-level aliases are intentionally ambiguous.** Terms such as `blood thinner`, `DOAC`, `LMWH`, `P2Y12 inhibitor`, and `antiplatelet` are attached to multiple candidate medications. The search layer must not convert those class-only phrases into one medication identity without an exact or otherwise unambiguous match.
4. **Aspirin/extended-release dipyridamole remains a combination identity and decomposes to both ingredients.** Aggrenox and common aspirin/ER-dipyridamole phrasings map to `MED-aspirin-dipyridamole`, which references both `ING-aspirin` and `ING-dipyridamole`.
5. **No RxNorm identifier was invented or inferred.** Batch 01 continues to omit RxCUI values unless they are ingested and verified through the governed RxNorm terminology pipeline. Brand/generic verification does not authorize guessing external terminology identifiers.
6. **Systemic heparin identity is distinct from future line-flush/device-use handling.** `MED-heparin` represents systemic unfractionated heparin review logic. A heparin lock/flush formulation must not silently resolve into the systemic anticoagulation pathway; that formulation distinction remains future terminology work if encountered in outpatient medication reconciliation.
7. **Historical brand aliases are recognition aids, not claims of current commercial availability.** Patients may still report older brand names such as Coumadin, Ticlid, Persantine, or Pletal. PREP-MEDS may recognize those strings while keeping product-market status separate from clinical identity.

### Terminology-audit disposition

Checkpoint B is complete. No external terminology code has been asserted without verification, combination decomposition is preserved, and ambiguous class terms remain non-authoritative search inputs.

The next checkpoint is **C — deterministic rule audit**.

## Scope

This batch expands PREP-MEDS antithrombotic recognition and review logic for elective outpatient EGD, colonoscopy, and same-day EGD + colonoscopy.

Covered medication identities:

- warfarin
- apixaban, rivaroxaban, edoxaban, dabigatran
- enoxaparin, dalteparin, unfractionated heparin, fondaparinux
- aspirin
- clopidogrel, prasugrel, ticagrelor, ticlopidine
- dipyridamole, cilostazol
- aspirin/extended-release dipyridamole combination product

## Evidence hierarchy represented

1. ACG/CAG 2022 periendoscopic antithrombotic guideline — primary GI source for the current US-oriented evidence layer.
2. CHEST 2022 perioperative antithrombotic guideline — drug-specific perioperative interruption/bridging context.
3. BSG/ESGE 2021 guideline update — secondary international source that explicitly distinguishes low- and high-risk endoscopic procedures.
4. FDA prescribing information — drug-specific discontinuation/bleeding/thrombotic-risk warnings where relevant.

All source documents and EvidenceAtoms remain `DRAFT` pending human source verification/review.

## Preserved evidence conflicts

The batch deliberately does not collapse current guidance into a single hidden timing rule.

Key unresolved operational questions include:

- whether a routine colonoscopy is operationally treated as diagnostic/low-risk or as potential-polypectomy/high-risk;
- exact DOAC interruption intervals across GI-specific versus general perioperative guidance;
- renal-function-sensitive dabigatran timing;
- warfarin continuation versus interruption when polypectomy may occur;
- whether/when heparin bridging is appropriate for mechanical-valve patients, given conflicting ACG/CAG, CHEST, and BSG/ESGE approaches;
- single-agent P2Y12 interruption, for which ACG/CAG found insufficient evidence;
- postprocedure restart timing, which depends on actual intervention, hemostasis, bleeding risk, and thrombotic risk.

PREP-MEDS therefore stores these sources as a conflict group and requires an approved operational GI/anesthesia/anticoagulation policy before any future routine timing instruction is activated.

## Safety behavior

Shadow rules are intentionally non-actionable except for the already-supported aspirin secondary-prevention monotherapy continuation candidate.

Hard stops explicitly preserve clinician review for:

- recent thrombotic event;
- concomitant anticoagulant/antiplatelet therapy;
- mechanical heart valve in the warfarin pathway;
- recent coronary stent or acute coronary syndrome in P2Y12 pathways.

Dabigatran requires a **verified creatinine-clearance band**. PREP-MEDS does not calculate CrCl with an LLM and does not infer CrCl from serum creatinine alone.

Injectable anticoagulants require treatment intent to be identified as therapeutic, prophylactic, bridging, or unclear before review.

## Combination products / whole-list reasoning

Aspirin/dipyridamole is decomposed into both active ingredients. DAPT and other concurrent antithrombotic combinations are currently represented by explicit modifiers. A later whole-medication-list interaction resolver should replace manual boolean combination capture where the medication list itself can reliably establish the combination.

## Activation checklist

Before any Batch 01 rule can move to `APPROVED` or `ACTIVE`:

1. Physician reviewer confirms every source and EvidenceAtom against the primary publication/current label.
2. GI governance chooses the colonoscopy intervention-risk assumption.
3. Anesthesia/anticoagulation stakeholders approve operational interruption timing where needed.
4. Recent VTE/stroke/TIA, mechanical-valve, ACS, and coronary-stent escalation logic is clinically adjudicated.
5. Restart ownership and actual-hemostasis workflow are approved.
6. Synthetic regression cases are reviewed for false-negative escalation.
7. Shadow-mode cases are compared with usual workflow and physician adjudication.
8. A named approver and approval timestamp are recorded through the clinical governance lifecycle.

No automated task may perform those approval/activation transitions.
