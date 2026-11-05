import { evaluateCondition } from './conditions.js';
import { immutableSnapshot } from './immutability.js';
import { resolvePolicies } from './policies.js';
import { resolveRequiredModifiers, selectRule } from './rules.js';
import type {
  ClinicalRule,
  DecisionEvent,
  DecisionExecution,
  DecisionTrace,
  Disposition,
  EngineRequest,
  HardStopTrace,
  ModifierValue,
  PolicyOverlay,
  RestartOwner,
  TimingRule,
  VersionedRef,
} from './types.js';

function uniqueSorted(values: string[]): string[] {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b));
}

function dedupeRefs(refs: VersionedRef[]): VersionedRef[] {
  const byKey = new Map<string, VersionedRef>();
  for (const ref of refs) byKey.set(`${ref.id}@${ref.version}`, ref);
  return [...byKey.values()].sort((a, b) => {
    const idDelta = a.id.localeCompare(b.id);
    return idDelta !== 0 ? idDelta : a.version - b.version;
  });
}

function modifierIdsFromFields(fields: string[]): string[] {
  return uniqueSorted(
    fields
      .filter((field) => field.startsWith('modifier:'))
      .map((field) => field.slice('modifier:'.length)),
  );
}

function unresolvedModifierIds(modifierIds: string[], modifiers: ModifierValue[]): {
  missing: string[];
  conflicting: string[];
  notApplicable: string[];
} {
  const byId = new Map(modifiers.map((modifier) => [modifier.modifierId, modifier]));
  const missing: string[] = [];
  const conflicting: string[] = [];
  const notApplicable: string[] = [];

  for (const id of modifierIds) {
    const modifier = byId.get(id);
    if (!modifier || modifier.state === 'UNKNOWN') missing.push(id);
    else if (modifier.state === 'CONFLICTING') conflicting.push(id);
    else if (modifier.state === 'NOT_APPLICABLE') notApplicable.push(id);
  }

  return {
    missing: uniqueSorted(missing),
    conflicting: uniqueSorted(conflicting),
    notApplicable: uniqueSorted(notApplicable),
  };
}

function selectedPolicyEvidenceRefs(
  selectedPolicyRefs: VersionedRef[],
  policies: PolicyOverlay[],
): VersionedRef[] {
  const selectedKeys = new Set(selectedPolicyRefs.map((ref) => `${ref.id}@${ref.version}`));
  return dedupeRefs(
    policies
      .filter((policy) => selectedKeys.has(`${policy.id}@${policy.version}`))
      .flatMap((policy) => policy.evidenceRefs ?? []),
  );
}

interface FinalizeArgs {
  request: EngineRequest;
  trace: DecisionTrace;
  disposition: Disposition;
  reasonCodes?: string[];
  missingModifierIds?: string[];
  ruleRefs?: VersionedRef[];
  evidenceRefs?: VersionedRef[];
  policyRefs?: VersionedRef[];
  timingRule?: TimingRule;
  restartOwner?: RestartOwner;
}

function finalize(args: FinalizeArgs): DecisionExecution {
  const outputSnapshot: DecisionEvent['outputSnapshot'] = {};
  if (args.timingRule !== undefined) outputSnapshot.timingRule = args.timingRule;
  if (args.restartOwner !== undefined) outputSnapshot.restartOwner = args.restartOwner;

  const eventBase: DecisionEvent = {
    id: args.request.decisionEventId,
    occurredAt: args.request.occurredAt,
    organizationId: args.request.context.organizationId,
    procedureCode: args.request.context.procedureCode,
    medicationId: args.request.context.medication.medicationId,
    modifierValues: args.request.context.modifiers,
    disposition: args.disposition,
    reasonCodes: uniqueSorted(args.reasonCodes ?? []),
    missingModifierIds: uniqueSorted(args.missingModifierIds ?? []),
    ruleRefs: dedupeRefs(args.ruleRefs ?? []),
    evidenceRefs: dedupeRefs(args.evidenceRefs ?? []),
    policyRefs: dedupeRefs(args.policyRefs ?? []),
    engineVersion: args.request.engineVersion,
    outputSnapshot,
  };

  const event: DecisionEvent = {
    ...eventBase,
    ...(args.request.caseId !== undefined ? { caseId: args.request.caseId } : {}),
    ...(args.request.context.siteId !== undefined ? { siteId: args.request.context.siteId } : {}),
    ...(args.request.actorRole !== undefined ? { actorRole: args.request.actorRole } : {}),
  };

  return {
    event: immutableSnapshot(event),
    trace: immutableSnapshot(args.trace),
  };
}

function ruleRef(rule: ClinicalRule): VersionedRef {
  return { id: rule.id, version: rule.version };
}

export function evaluateDecision(request: EngineRequest): DecisionExecution {
  const mode = request.mode ?? 'PRODUCTION';
  const selection = selectRule(request.rules, request.context, mode);
  const trace: DecisionTrace = {
    ruleCandidates: selection.trace,
    hardStops: [],
    policyCandidates: [],
  };

  if (selection.kind === 'NO_MATCH') {
    return finalize({
      request,
      trace,
      disposition: 'OUT_OF_SCOPE',
      reasonCodes: ['NO_APPLICABLE_RULE'],
    });
  }

  if (selection.kind === 'UNKNOWN_APPLICABILITY') {
    const fields = selection.unresolvedFields ?? [];
    return finalize({
      request,
      trace,
      disposition: 'INSUFFICIENT_INFORMATION',
      reasonCodes: ['RULE_APPLICABILITY_UNRESOLVED', ...fields.map((field) => `UNRESOLVED_FIELD:${field}`)],
      missingModifierIds: modifierIdsFromFields(fields),
    });
  }

  if (selection.kind === 'AMBIGUOUS') {
    const competing = selection.competing ?? [];
    return finalize({
      request,
      trace,
      disposition: 'CLINICIAN_REVIEW_REQUIRED',
      reasonCodes: ['RULE_AMBIGUITY'],
      ruleRefs: competing.map(ruleRef),
      evidenceRefs: competing.flatMap((rule) => rule.evidenceRefs),
    });
  }

  const rule = selection.selected!;
  const selectedRuleRef = ruleRef(rule);
  trace.selectedRuleRef = selectedRuleRef;

  const required = resolveRequiredModifiers(rule, request.context);
  const requiredUnresolved = uniqueSorted([
    ...required.unresolvedModifierIds,
    ...required.conflictingModifierIds,
    ...required.notApplicableModifierIds,
  ]);

  if (requiredUnresolved.length > 0) {
    const reasons = ['REQUIRED_INPUT_UNRESOLVED'];
    if (required.conflictingModifierIds.length) reasons.push('CONFLICTING_REQUIRED_INPUT');
    if (required.notApplicableModifierIds.length) reasons.push('REQUIRED_INPUT_NOT_APPLICABLE');
    return finalize({
      request,
      trace,
      disposition: 'INSUFFICIENT_INFORMATION',
      reasonCodes: reasons,
      missingModifierIds: requiredUnresolved,
      ruleRefs: [selectedRuleRef],
      evidenceRefs: rule.evidenceRefs,
    });
  }

  const hardStopTrace: HardStopTrace[] = [];
  const triggeredHardStops: string[] = [];
  const unresolvedHardStopFields: string[] = [];

  for (const hardStop of rule.hardStops ?? []) {
    const evaluation = evaluateCondition(hardStop.condition, request.context);
    hardStopTrace.push({
      ruleRef: selectedRuleRef,
      reasonCode: hardStop.reasonCode,
      state: evaluation.state,
      unresolvedFields: evaluation.unresolvedFields,
    });
    if (evaluation.state === 'TRUE') triggeredHardStops.push(hardStop.reasonCode);
    if (evaluation.state === 'UNKNOWN') unresolvedHardStopFields.push(...evaluation.unresolvedFields);
  }
  trace.hardStops = hardStopTrace;

  if (triggeredHardStops.length > 0) {
    return finalize({
      request,
      trace,
      disposition: 'CLINICIAN_REVIEW_REQUIRED',
      reasonCodes: triggeredHardStops,
      ruleRefs: [selectedRuleRef],
      evidenceRefs: rule.evidenceRefs,
    });
  }

  if (unresolvedHardStopFields.length > 0) {
    const fields = uniqueSorted(unresolvedHardStopFields);
    return finalize({
      request,
      trace,
      disposition: 'INSUFFICIENT_INFORMATION',
      reasonCodes: ['HARD_STOP_STATUS_UNRESOLVED', ...fields.map((field) => `UNRESOLVED_FIELD:${field}`)],
      missingModifierIds: modifierIdsFromFields(fields),
      ruleRefs: [selectedRuleRef],
      evidenceRefs: rule.evidenceRefs,
    });
  }

  const policyResolution = resolvePolicies(
    request.policies ?? [],
    request.context,
    mode,
    rule.policyDependencyIds ?? [],
  );
  trace.policyCandidates = policyResolution.trace;

  if (policyResolution.kind === 'UNKNOWN') {
    const fields = policyResolution.unresolvedFields ?? [];
    return finalize({
      request,
      trace,
      disposition: 'INSUFFICIENT_INFORMATION',
      reasonCodes: ['POLICY_APPLICABILITY_UNRESOLVED', ...fields.map((field) => `UNRESOLVED_FIELD:${field}`)],
      missingModifierIds: modifierIdsFromFields(fields),
      ruleRefs: [selectedRuleRef],
      evidenceRefs: rule.evidenceRefs,
    });
  }

  if (policyResolution.kind === 'MISSING_DEPENDENCY') {
    return finalize({
      request,
      trace,
      disposition: 'LOCAL_POLICY_REQUIRED',
      reasonCodes: [
        'REQUIRED_POLICY_MISSING',
        ...(policyResolution.missingPolicyIds ?? []).map((id) => `MISSING_POLICY:${id}`),
      ],
      ruleRefs: [selectedRuleRef],
      evidenceRefs: rule.evidenceRefs,
    });
  }

  if (policyResolution.kind === 'CONFLICT') {
    return finalize({
      request,
      trace,
      disposition: 'CLINICIAN_REVIEW_REQUIRED',
      reasonCodes: [
        'POLICY_CONFLICT',
        ...(policyResolution.conflictFields ?? []).map((field) => `POLICY_CONFLICT_FIELD:${field}`),
      ],
      ruleRefs: [selectedRuleRef],
      evidenceRefs: rule.evidenceRefs,
    });
  }

  const policyEffect = policyResolution.effect;
  const selectedPolicyRefs = policyEffect?.policyRefs ?? [];
  const selectedPolicyRefsSorted = dedupeRefs(selectedPolicyRefs);
  const policyEvidenceRefs = selectedPolicyEvidenceRefs(selectedPolicyRefsSorted, request.policies ?? []);

  const selectedPolicyRef = selectedPolicyRefsSorted[0];
  if (selectedPolicyRefsSorted.length === 1 && selectedPolicyRef) {
    trace.selectedPolicyRef = selectedPolicyRef;
  }

  const policyRequiredModifiers = policyEffect?.requiredModifierIds ?? [];
  if (policyRequiredModifiers.length > 0) {
    const unresolved = unresolvedModifierIds(policyRequiredModifiers, request.context.modifiers);
    const all = uniqueSorted([...unresolved.missing, ...unresolved.conflicting, ...unresolved.notApplicable]);
    if (all.length > 0) {
      const reasons = ['POLICY_REQUIRED_INPUT_UNRESOLVED'];
      if (unresolved.conflicting.length) reasons.push('CONFLICTING_POLICY_INPUT');
      if (unresolved.notApplicable.length) reasons.push('POLICY_INPUT_NOT_APPLICABLE');
      return finalize({
        request,
        trace,
        disposition: 'INSUFFICIENT_INFORMATION',
        reasonCodes: reasons,
        missingModifierIds: all,
        ruleRefs: [selectedRuleRef],
        evidenceRefs: [...rule.evidenceRefs, ...policyEvidenceRefs],
        policyRefs: selectedPolicyRefsSorted,
      });
    }
  }

  const requestedOverride = policyEffect?.dispositionOverride;
  if (
    rule.disposition === 'CLINICIAN_REVIEW_REQUIRED' &&
    requestedOverride !== undefined &&
    requestedOverride !== 'CLINICIAN_REVIEW_REQUIRED'
  ) {
    return finalize({
      request,
      trace,
      disposition: 'CLINICIAN_REVIEW_REQUIRED',
      reasonCodes: ['POLICY_CANNOT_DOWNGRADE_CLINICIAN_REVIEW'],
      ruleRefs: [selectedRuleRef],
      evidenceRefs: [...rule.evidenceRefs, ...policyEvidenceRefs],
      policyRefs: selectedPolicyRefsSorted,
    });
  }

  const finalDisposition = requestedOverride ?? rule.disposition;
  const finalTiming = policyEffect?.timingRule ?? rule.timingRule;
  const finalRestartOwner = policyEffect?.restartOwner ?? rule.restartOwner;

  return finalize({
    request,
    trace,
    disposition: finalDisposition,
    reasonCodes: policyEffect?.reasonCodes ?? [],
    ruleRefs: [selectedRuleRef],
    evidenceRefs: [...rule.evidenceRefs, ...policyEvidenceRefs],
    policyRefs: selectedPolicyRefsSorted,
    ...(finalTiming !== undefined ? { timingRule: finalTiming } : {}),
    ...(finalRestartOwner !== undefined ? { restartOwner: finalRestartOwner } : {}),
  });
}
