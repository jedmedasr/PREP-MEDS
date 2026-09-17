import type {
  Condition,
  ConditionEvaluation,
  DecisionContext,
  ModifierValue,
  TruthState,
} from './types.js';

interface ResolvedField {
  state: 'RESOLVED' | 'UNRESOLVED' | 'MISSING';
  value?: unknown;
}

function modifierMap(modifiers: ModifierValue[]): Map<string, ModifierValue> {
  return new Map(modifiers.map((modifier) => [modifier.modifierId, modifier]));
}

function resolveContextField(field: string, context: DecisionContext): ResolvedField {
  switch (field) {
    case 'context.organizationId':
      return { state: 'RESOLVED', value: context.organizationId };
    case 'context.siteId':
      return context.siteId === undefined
        ? { state: 'MISSING' }
        : { state: 'RESOLVED', value: context.siteId };
    case 'context.procedureCode':
      return { state: 'RESOLVED', value: context.procedureCode };
    case 'context.medicationId':
      return { state: 'RESOLVED', value: context.medication.medicationId };
    case 'context.ingredientIds':
      return { state: 'RESOLVED', value: [...context.medication.ingredientIds] };
    case 'context.drugClassIds':
      return { state: 'RESOLVED', value: [...context.medication.drugClassIds] };
    default:
      return { state: 'MISSING' };
  }
}

export function resolveField(field: string, context: DecisionContext): ResolvedField {
  if (field.startsWith('modifier:')) {
    const modifierId = field.slice('modifier:'.length);
    const modifier = modifierMap(context.modifiers).get(modifierId);
    if (!modifier) return { state: 'MISSING' };
    if (modifier.state !== 'KNOWN') return { state: 'UNRESOLVED' };
    return { state: 'RESOLVED', value: modifier.value };
  }

  return resolveContextField(field, context);
}

function uniqueSorted(values: string[]): string[] {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b));
}

function result(state: TruthState, unresolvedFields: string[] = []): ConditionEvaluation {
  return { state, unresolvedFields: uniqueSorted(unresolvedFields) };
}

function primitiveEqual(left: unknown, right: unknown): boolean {
  if (Object.is(left, right)) return true;
  if (Array.isArray(left) && Array.isArray(right)) {
    return left.length === right.length && left.every((value, index) => primitiveEqual(value, right[index]));
  }
  return false;
}

function compareNumeric(left: unknown, right: unknown): number | undefined {
  if (typeof left !== 'number' || typeof right !== 'number') return undefined;
  if (!Number.isFinite(left) || !Number.isFinite(right)) return undefined;
  return left === right ? 0 : left < right ? -1 : 1;
}

function evaluateResolvedComparison(condition: Extract<Condition, { field: string }>, value: unknown): TruthState {
  switch (condition.op) {
    case 'EXISTS':
    case 'KNOWN':
      return 'TRUE';
    case 'EQUALS':
      return primitiveEqual(value, condition.value) ? 'TRUE' : 'FALSE';
    case 'NOT_EQUALS':
      return primitiveEqual(value, condition.value) ? 'FALSE' : 'TRUE';
    case 'IN':
      return condition.values.some((candidate) => primitiveEqual(value, candidate)) ? 'TRUE' : 'FALSE';
    case 'GREATER_THAN':
    case 'GREATER_THAN_OR_EQUAL':
    case 'LESS_THAN':
    case 'LESS_THAN_OR_EQUAL': {
      const comparison = compareNumeric(value, condition.value);
      if (comparison === undefined) return 'UNKNOWN';
      if (condition.op === 'GREATER_THAN') return comparison > 0 ? 'TRUE' : 'FALSE';
      if (condition.op === 'GREATER_THAN_OR_EQUAL') return comparison >= 0 ? 'TRUE' : 'FALSE';
      if (condition.op === 'LESS_THAN') return comparison < 0 ? 'TRUE' : 'FALSE';
      return comparison <= 0 ? 'TRUE' : 'FALSE';
    }
  }
}

export function evaluateCondition(condition: Condition, context: DecisionContext): ConditionEvaluation {
  if (condition.op === 'ALL') {
    const evaluations = condition.conditions.map((item) => evaluateCondition(item, context));
    const unresolved = evaluations.flatMap((item) => item.unresolvedFields);
    if (evaluations.some((item) => item.state === 'FALSE')) return result('FALSE', unresolved);
    if (evaluations.some((item) => item.state === 'UNKNOWN')) return result('UNKNOWN', unresolved);
    return result('TRUE', unresolved);
  }

  if (condition.op === 'ANY') {
    const evaluations = condition.conditions.map((item) => evaluateCondition(item, context));
    const unresolved = evaluations.flatMap((item) => item.unresolvedFields);
    if (evaluations.some((item) => item.state === 'TRUE')) return result('TRUE', unresolved);
    if (evaluations.some((item) => item.state === 'UNKNOWN')) return result('UNKNOWN', unresolved);
    return result('FALSE', unresolved);
  }

  if (condition.op === 'NOT') {
    const evaluation = evaluateCondition(condition.condition, context);
    if (evaluation.state === 'UNKNOWN') return evaluation;
    return result(evaluation.state === 'TRUE' ? 'FALSE' : 'TRUE', evaluation.unresolvedFields);
  }

  if (condition.op === 'EXISTS') {
    if (condition.field.startsWith('modifier:')) {
      const modifierId = condition.field.slice('modifier:'.length);
      const exists = context.modifiers.some((modifier) => modifier.modifierId === modifierId);
      return result(exists ? 'TRUE' : 'FALSE');
    }
    const resolved = resolveField(condition.field, context);
    return result(resolved.state === 'MISSING' ? 'FALSE' : 'TRUE');
  }

  if (condition.op === 'KNOWN') {
    if (condition.field.startsWith('modifier:')) {
      const modifierId = condition.field.slice('modifier:'.length);
      const modifier = context.modifiers.find((item) => item.modifierId === modifierId);
      return result(modifier?.state === 'KNOWN' ? 'TRUE' : 'FALSE');
    }
    const resolved = resolveField(condition.field, context);
    return result(resolved.state === 'RESOLVED' ? 'TRUE' : 'FALSE');
  }

  const resolved = resolveField(condition.field, context);
  if (resolved.state !== 'RESOLVED') return result('UNKNOWN', [condition.field]);

  const state = evaluateResolvedComparison(condition, resolved.value);
  return state === 'UNKNOWN' ? result('UNKNOWN', [condition.field]) : result(state);
}
