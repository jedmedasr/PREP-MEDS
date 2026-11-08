# PREP-MEDS — parallel clinical evidence bucket allocation (2026-11-08)

**Source:** `docs/medication-audit-manifest.json` (436 canonical IDs, 233 provisional ingredient sets, 48 combination medication records). These are **provisional ingredient-set work queues**, NOT the final clinically distinct formulation/route/regimen denominator. Each group must be adjudicated and split when necessary; brand/strength aliases inherit only after testing. Do not count provisional mapping as validation.

**Assignment:** CURRENT CHAT = ODD-numbered buckets (1,3,...,23); OTHER CHAT = EVEN-numbered buckets (2,4,...,24). Work within your assigned buckets only; neither chat edits the other chat's medication evidence, group statuses or test files. Shared branch edits to the same manifest can conflict: fetch current blob SHA immediately before each update, update only owned records, and retry conflicts by re-reading; prefer separate evidence files and PR branches per lane. The existing engineering and clinical scheduled tasks belong to CURRENT CHAT/ODD buckets. **Do not start work in the other chat until its prompt is pasted there.**

**Priority:** Process buckets in numerical order within each lane. A bucket contains 10 provisional ingredient sets except final bucket. Each distinct formulation may require an additional clinical review unit; never collapse incompatible routes/regimens. Only count a completed group when source-linked guideline comparison, scenario applicability, tested canonical inheritance and evidence tests are verified; clinician alone approves clinical guidance. No patient-facing activation without explicit clinician authorization. If a bucket's groups are blocked, document exact blockers and proceed to the next eligible owned group rather than endless re-research.

## Bucket 01 — CURRENT CHAT — 10 provisional groups, 10 mapped canonical IDs

- `ING-apixaban` (1 canonical ID)
- `ING-rivaroxaban` (1 canonical ID)
- `ING-dabigatran` (1 canonical ID)
- `ING-edoxaban` (1 canonical ID)
- `ING-warfarin` (1 canonical ID)
- `ING-aspirin` (1 canonical ID)
- `ING-clopidogrel` (1 canonical ID)
- `ING-prasugrel` (1 canonical ID)
- `ING-ticagrelor` (1 canonical ID)
- `ING-enoxaparin` (1 canonical ID)

## Bucket 02 — OTHER CHAT — 10 provisional groups, 34 mapped canonical IDs

- `ING-heparin` (1 canonical ID)
- `ING-aspirin+ING-dipyridamole` (1 canonical ID)
- `ING-insulin-glargine` (5 canonical IDs)
- `ING-insulin-lispro` (8 canonical IDs)
- `ING-insulin-aspart` (4 canonical IDs)
- `ING-insulin-regular` (5 canonical IDs)
- `ING-insulin-nph` (3 canonical IDs)
- `ING-insulin-degludec` (3 canonical IDs)
- `ING-insulin-detemir` (2 canonical IDs)
- `ING-insulin-glulisine` (2 canonical IDs)

## Bucket 03 — CURRENT CHAT — 10 provisional groups, 23 mapped canonical IDs

- `ING-semaglutide` (6 canonical IDs)
- `ING-empagliflozin` (1 canonical ID)
- `ING-inhaled-human-insulin` (5 canonical IDs)
- `ING-insulin-degludec+ING-liraglutide` (1 canonical ID)
- `ING-insulin-glargine+ING-lixisenatide` (1 canonical ID)
- `ING-insulin-nph+ING-insulin-regular` (3 canonical IDs)
- `ING-albiglutide` (2 canonical IDs)
- `ING-canagliflozin+ING-metformin` (2 canonical IDs)
- `ING-dapagliflozin+ING-metformin` (1 canonical ID)
- `ING-dapagliflozin+ING-metformin+ING-saxagliptin` (1 canonical ID)

## Bucket 04 — OTHER CHAT — 10 provisional groups, 21 mapped canonical IDs

- `ING-dapagliflozin+ING-saxagliptin` (3 canonical IDs)
- `ING-dulaglutide` (2 canonical IDs)
- `ING-empagliflozin+ING-linagliptin` (1 canonical ID)
- `ING-empagliflozin+ING-linagliptin+ING-metformin` (1 canonical ID)
- `ING-empagliflozin+ING-metformin` (2 canonical IDs)
- `ING-ertugliflozin+ING-metformin` (1 canonical ID)
- `ING-ertugliflozin+ING-sitagliptin` (1 canonical ID)
- `ING-exenatide` (4 canonical IDs)
- `ING-liraglutide` (4 canonical IDs)
- `ING-lixisenatide` (2 canonical IDs)

## Bucket 05 — CURRENT CHAT — 10 provisional groups, 19 mapped canonical IDs

- `ING-tirzepatide` (3 canonical IDs)
- `ING-acarbose` (1 canonical ID)
- `ING-albuterol` (2 canonical IDs)
- `ING-albuterol+ING-ipratropium` (2 canonical IDs)
- `ING-alogliptin` (1 canonical ID)
- `ING-alprazolam` (2 canonical IDs)
- `ING-amantadine` (5 canonical IDs)
- `ING-ambrisentan` (1 canonical ID)
- `ING-amiloride` (1 canonical ID)
- `ING-amiloride+ING-hydrochlorothiazide` (1 canonical ID)

## Bucket 06 — OTHER CHAT — 10 provisional groups, 17 mapped canonical IDs

- `ING-aminophylline-dihydrate` (1 canonical ID)
- `ING-amiodarone` (2 canonical IDs)
- `ING-amitriptyline-hydrochloride` (1 canonical ID)
- `ING-amlodipine` (1 canonical ID)
- `ING-amphetamine+ING-dextroamphetamine` (2 canonical IDs)
- `ING-aripiprazole` (4 canonical IDs)
- `ING-aripiprazole-lauroxil` (2 canonical IDs)
- `ING-atenolol` (1 canonical ID)
- `ING-atorvastatin` (1 canonical ID)
- `ING-azathioprine` (2 canonical IDs)

## Bucket 07 — CURRENT CHAT — 10 provisional groups, 21 mapped canonical IDs

- `ING-benazepril` (1 canonical ID)
- `ING-bisoprolol` (1 canonical ID)
- `ING-bosentan` (2 canonical IDs)
- `ING-bromocriptine` (3 canonical IDs)
- `ING-budesonide+ING-formoterol` (1 canonical ID)
- `ING-budesonide+ING-formoterol+ING-glycopyrrolate` (1 canonical ID)
- `ING-bumetanide` (3 canonical IDs)
- `ING-buprenorphine` (4 canonical IDs)
- `ING-buprenorphine+ING-naloxone` (2 canonical IDs)
- `ING-bupropion-hydrochloride` (3 canonical IDs)

## Bucket 08 — OTHER CHAT — 10 provisional groups, 20 mapped canonical IDs

- `ING-bupropion+ING-naltrexone` (1 canonical ID)
- `ING-candesartan` (1 canonical ID)
- `ING-cannabidiol` (1 canonical ID)
- `ING-cannabis-product-unspecified` (2 canonical IDs)
- `ING-captopril` (1 canonical ID)
- `ING-carbamazepine` (6 canonical IDs)
- `ING-carbidopa+ING-entacapone+ING-levodopa` (1 canonical ID)
- `ING-carbidopa+ING-levodopa` (5 canonical IDs)
- `ING-carvedilol` (1 canonical ID)
- `ING-chlorthalidone` (1 canonical ID)

## Bucket 09 — CURRENT CHAT — 10 provisional groups, 18 mapped canonical IDs

- `ING-cilostazol` (1 canonical ID)
- `ING-clomipramine-hydrochloride` (1 canonical ID)
- `ING-clonazepam` (2 canonical IDs)
- `ING-clonidine` (2 canonical IDs)
- `ING-clozapine` (3 canonical IDs)
- `ING-colesevelam` (1 canonical ID)
- `ING-cyclosporine` (4 canonical IDs)
- `ING-dalteparin` (1 canonical ID)
- `ING-desvenlafaxine` (1 canonical ID)
- `ING-dexamethasone` (2 canonical IDs)

## Bucket 10 — OTHER CHAT — 10 provisional groups, 18 mapped canonical IDs

- `ING-diazepam` (1 canonical ID)
- `ING-digoxin` (3 canonical IDs)
- `ING-diltiazem` (4 canonical IDs)
- `ING-dipyridamole` (1 canonical ID)
- `ING-divalproex-sodium` (3 canonical IDs)
- `ING-dofetilide` (1 canonical ID)
- `ING-doxazosin` (1 canonical ID)
- `ING-dronabinol` (2 canonical IDs)
- `ING-dronedarone` (1 canonical ID)
- `ING-duloxetine` (1 canonical ID)

## Bucket 11 — CURRENT CHAT — 10 provisional groups, 13 mapped canonical IDs

- `ING-enalapril` (1 canonical ID)
- `ING-entacapone` (1 canonical ID)
- `ING-eplerenone` (1 canonical ID)
- `ING-epoprostenol` (1 canonical ID)
- `ING-everolimus` (3 canonical IDs)
- `ING-felodipine` (1 canonical ID)
- `ING-flecainide` (1 canonical ID)
- `ING-fluticasone-furoate+ING-umeclidinium+ING-vilanterol` (1 canonical ID)
- `ING-fluticasone-furoate+ING-vilanterol` (1 canonical ID)
- `ING-fluticasone-propionate+ING-salmeterol` (2 canonical IDs)

## Bucket 12 — OTHER CHAT — 10 provisional groups, 19 mapped canonical IDs

- `ING-fondaparinux` (1 canonical ID)
- `ING-formoterol+ING-mometasone-furoate` (1 canonical ID)
- `ING-fosphenytoin` (1 canonical ID)
- `ING-furosemide` (5 canonical IDs)
- `ING-gabapentin` (4 canonical IDs)
- `ING-gabapentin-enacarbil` (1 canonical ID)
- `ING-garlic` (1 canonical ID)
- `ING-ginkgo-biloba` (1 canonical ID)
- `ING-glimepiride` (1 canonical ID)
- `ING-glipizide` (3 canonical IDs)

## Bucket 13 — CURRENT CHAT — 10 provisional groups, 13 mapped canonical IDs

- `ING-glyburide` (1 canonical ID)
- `ING-haloperidol` (2 canonical IDs)
- `ING-haloperidol-decanoate` (1 canonical ID)
- `ING-haloperidol-lactate` (1 canonical ID)
- `ING-hydralazine` (1 canonical ID)
- `ING-hydrochlorothiazide` (1 canonical ID)
- `ING-hydrochlorothiazide+ING-spironolactone` (1 canonical ID)
- `ING-hydrochlorothiazide+ING-triamterene` (2 canonical IDs)
- `ING-hydrocortisone` (2 canonical IDs)
- `ING-hypericum-perforatum` (1 canonical ID)

## Bucket 14 — OTHER CHAT — 10 provisional groups, 14 mapped canonical IDs

- `ING-iloprost` (2 canonical IDs)
- `ING-imipramine-hydrochloride` (1 canonical ID)
- `ING-indapamide` (1 canonical ID)
- `ING-ipratropium` (2 canonical IDs)
- `ING-irbesartan` (1 canonical ID)
- `ING-isocarboxazid` (1 canonical ID)
- `ING-isosorbide-dinitrate` (2 canonical IDs)
- `ING-isosorbide-mononitrate` (1 canonical ID)
- `ING-ivabradine` (2 canonical IDs)
- `ING-labetalol` (1 canonical ID)

## Bucket 15 — CURRENT CHAT — 10 provisional groups, 22 mapped canonical IDs

- `ING-lacosamide` (3 canonical IDs)
- `ING-levalbuterol` (2 canonical IDs)
- `ING-levetiracetam` (5 canonical IDs)
- `ING-levodopa` (1 canonical ID)
- `ING-linagliptin` (1 canonical ID)
- `ING-lisdexamfetamine` (2 canonical IDs)
- `ING-lisinopril` (1 canonical ID)
- `ING-lithium` (4 canonical IDs)
- `ING-lorazepam` (2 canonical IDs)
- `ING-losartan` (1 canonical ID)

## Bucket 16 — OTHER CHAT — 10 provisional groups, 16 mapped canonical IDs

- `ING-macitentan` (1 canonical ID)
- `ING-macitentan+ING-tadalafil` (1 canonical ID)
- `ING-metformin` (3 canonical IDs)
- `ING-methadone` (2 canonical IDs)
- `ING-methylphenidate` (2 canonical IDs)
- `ING-methylprednisolone` (2 canonical IDs)
- `ING-metoprolol` (2 canonical IDs)
- `ING-mexiletine` (1 canonical ID)
- `ING-miglitol` (1 canonical ID)
- `ING-minoxidil` (1 canonical ID)

## Bucket 17 — CURRENT CHAT — 10 provisional groups, 21 mapped canonical IDs

- `ING-mycophenolate-mofetil` (4 canonical IDs)
- `ING-mycophenolic-acid` (1 canonical ID)
- `ING-nadolol` (1 canonical ID)
- `ING-naltrexone` (2 canonical IDs)
- `ING-nateglinide` (1 canonical ID)
- `ING-nifedipine` (2 canonical IDs)
- `ING-nitroglycerin` (4 canonical IDs)
- `ING-nortriptyline-hydrochloride` (1 canonical ID)
- `ING-olanzapine` (4 canonical IDs)
- `ING-olmesartan` (1 canonical ID)

## Bucket 18 — OTHER CHAT — 10 provisional groups, 20 mapped canonical IDs

- `ING-opicapone` (1 canonical ID)
- `ING-orforglipron` (2 canonical IDs)
- `ING-orlistat` (2 canonical IDs)
- `ING-oxcarbazepine` (3 canonical IDs)
- `ING-panax-ginseng` (1 canonical ID)
- `ING-phenelzine` (1 canonical ID)
- `ING-phenobarbital` (3 canonical IDs)
- `ING-phentermine` (2 canonical IDs)
- `ING-phentermine+ING-topiramate` (1 canonical ID)
- `ING-phenytoin` (4 canonical IDs)

## Bucket 19 — CURRENT CHAT — 10 provisional groups, 16 mapped canonical IDs

- `ING-pioglitazone` (1 canonical ID)
- `ING-piper-methysticum` (1 canonical ID)
- `ING-pramipexole` (2 canonical IDs)
- `ING-pramlintide` (1 canonical ID)
- `ING-prazosin` (1 canonical ID)
- `ING-prednisolone` (2 canonical IDs)
- `ING-prednisone` (2 canonical IDs)
- `ING-pregabalin` (3 canonical IDs)
- `ING-propafenone` (2 canonical IDs)
- `ING-propranolol` (1 canonical ID)

## Bucket 20 — OTHER CHAT — 10 provisional groups, 18 mapped canonical IDs

- `ING-quetiapine` (2 canonical IDs)
- `ING-quinidine` (2 canonical IDs)
- `ING-ramipril` (1 canonical ID)
- `ING-ranolazine` (1 canonical ID)
- `ING-rasagiline` (1 canonical ID)
- `ING-repaglinide` (1 canonical ID)
- `ING-riociguat` (1 canonical ID)
- `ING-risperidone` (6 canonical IDs)
- `ING-ropinirole` (2 canonical IDs)
- `ING-rosiglitazone` (1 canonical ID)

## Bucket 21 — CURRENT CHAT — 10 provisional groups, 20 mapped canonical IDs

- `ING-rotigotine` (1 canonical ID)
- `ING-sacubitril+ING-valsartan` (3 canonical IDs)
- `ING-safinamide` (1 canonical ID)
- `ING-saxagliptin` (1 canonical ID)
- `ING-selegiline` (2 canonical IDs)
- `ING-selexipag` (2 canonical IDs)
- `ING-sildenafil` (3 canonical IDs)
- `ING-sirolimus` (2 canonical IDs)
- `ING-sitagliptin` (1 canonical ID)
- `ING-sotalol` (4 canonical IDs)

## Bucket 22 — OTHER CHAT — 10 provisional groups, 21 mapped canonical IDs

- `ING-sotatercept-csrk` (1 canonical ID)
- `ING-spironolactone` (2 canonical IDs)
- `ING-tacrolimus` (5 canonical IDs)
- `ING-tadalafil` (1 canonical ID)
- `ING-telmisartan` (1 canonical ID)
- `ING-temazepam` (1 canonical ID)
- `ING-theophylline-anhydrous` (3 canonical IDs)
- `ING-ticlopidine` (1 canonical ID)
- `ING-tolcapone` (1 canonical ID)
- `ING-topiramate` (5 canonical IDs)

## Bucket 23 — CURRENT CHAT — 10 provisional groups, 18 mapped canonical IDs

- `ING-torsemide` (2 canonical IDs)
- `ING-tranylcypromine` (1 canonical ID)
- `ING-treprostinil` (4 canonical IDs)
- `ING-triamterene` (1 canonical ID)
- `ING-valeriana-officinalis` (1 canonical ID)
- `ING-valproate-sodium` (1 canonical ID)
- `ING-valproic-acid` (2 canonical IDs)
- `ING-valsartan` (1 canonical ID)
- `ING-venlafaxine` (2 canonical IDs)
- `ING-verapamil` (3 canonical IDs)

## Bucket 24 — OTHER CHAT — 3 provisional groups, 4 mapped canonical IDs

- `ING-ziprasidone-hydrochloride` (1 canonical ID)
- `ING-ziprasidone-mesylate` (1 canonical ID)
- `ING-zonisamide` (2 canonical IDs)

## Verification rules

- Every one of the 233 provisional ingredient-set keys occurs in exactly one bucket; canonical ID totals across buckets equal 436 (counted within original groups, not extra formulation splits).
- Maintain source links, dated guideline versions, ASGE 2016 comparator for antithrombotics, renal/procedure/indication and combination distinctions, and documented uncertainties. FDA label revision checks are not a hold-duration completion gate.
- Report each run as `completed evidence groups / 10 target`, exact group keys, test evidence, commit links, and failures. Never claim clinician signoff or passing tests without verification.
