# PREP-MEDS Deterministic Clinical Engine

## Purpose
The clinical engine is the only component permitted to convert governed clinical rules and approved policy overlays into a structured care-changing disposition. RAG and LLM components may retrieve, normalize, explain, and format; they do not create medication-management decisions.

This stage implements the generic engine only. It does **not** activate medication-specific production recommendations.

## Execution contract
Every evaluation requires:
- immutable decision-event identifier supplied by the caller;
- evaluation timestamp;
- engine version;
- organization/site context;
- procedure code;
- normalized medication/ingredient/class identity;
- explicit modifier values with `KNOWN`, `UNKNOWN`, `CONFLICTING`, or `NOT_APPLICABLE` state;
- versioned clinical rules;
- optional versioned organization/site policy overlays.

The engine returns:
- one canonical structured disposition;
- reason codes;
- unresolved modifier IDs;
- exact rule/evidence/policy references;
- timing/restart metadata when provided by governed content;
- a deterministic execution trace;
- an in-process deeply frozen DecisionEvent snapshot.

## Evaluation order
The order is safety-critical and must not be changed casually.

1. **Rule eligibility**
   - Production mode permits only `ACTIVE` rules.
   - Validation mode permits non-retired rule states for synthetic/pre-release testing.
2. **Scope matching**
   - medication, ingredient, drug class, and procedure scope are deterministic filters.
3. **Applicability evaluation**
   - conditions use three-state logic: `TRUE`, `FALSE`, `UNKNOWN`.
   - an unresolved material field becomes `UNKNOWN`; it is not converted to `FALSE`.
4. **Rule selection**
   - lower numeric priority has higher precedence.
   - tied top-priority rules are not guessed between; the result escalates.
5. **Required-input resolution**
   - missing, conflicting, or not-applicable required modifiers block routine finalization.
6. **Hard-stop evaluation**
   - a true hard stop yields `CLINICIAN_REVIEW_REQUIRED`.
   - an unknown hard-stop condition yields `INSUFFICIENT_INFORMATION`.
7. **Policy dependency and overlay resolution**
   - production uses only `ACTIVE` policies.
   - missing declared policy dependencies yield `LOCAL_POLICY_REQUIRED`.
   - unknown policy applicability yields `INSUFFICIENT_INFORMATION`.
   - equal-precedence conflicting policy effects yield `CLINICIAN_REVIEW_REQUIRED`.
   - site policy is more specific than organization policy.
   - within equivalent scope, lower numeric priority has higher precedence.
8. **Policy-required inputs**
   - policy-specific missing/conflicting inputs again block finalization.
9. **Disposition finalization**
   - governed policy may operationally override a routine rule result.
   - policy may not downgrade a rule-level `CLINICIAN_REVIEW_REQUIRED` result.
10. **Provenance snapshot**
    - exact rule, evidence, policy, engine, modifier, and output state are frozen into the result.

## Three-state condition logic
Conditions are deliberately not ordinary JavaScript booleans.

Examples:
- `true AND unknown -> unknown`
- `false AND unknown -> false`
- `true OR unknown -> true`
- `false OR unknown -> unknown`
- `NOT unknown -> unknown`

Comparison against an `UNKNOWN`, `CONFLICTING`, or `NOT_APPLICABLE` modifier returns `UNKNOWN`.

Supported condition operators remain constrained to the canonical ontology:
- `ALL`
- `ANY`
- `NOT`
- `EXISTS`
- `KNOWN`
- `EQUALS`
- `NOT_EQUALS`
- `IN`
- numeric comparison operators

No arbitrary JavaScript, SQL, or LLM-generated expression is executed as clinical rule logic.

## Field references
The evaluator currently supports:
- `context.organizationId`
- `context.siteId`
- `context.procedureCode`
- `context.medicationId`
- `context.ingredientIds`
- `context.drugClassIds`
- `modifier:<MODIFIER_ID>`

Most patient-specific branching should use modifier fields. Medication/procedure identity should generally be represented in rule scope rather than duplicated in applicability conditions.

## Policy precedence
Policies are candidate overlays only when all of the following are satisfied:
- eligible lifecycle state;
- organization match;
- site match when site-scoped;
- medication/procedure scope match;
- applicability condition evaluates `TRUE`.

Precedence is computed from:
1. site scope over organization scope;
2. more specifically scoped policies over generic policies;
3. lower numeric priority over higher numeric priority.

Different policy effects can coexist when non-conflicting. If equal-precedence policies provide different values for the same operational field, the engine fails closed rather than choosing one.

## Production versus validation mode
`PRODUCTION`:
- rule must be `ACTIVE`;
- policy must be `ACTIVE`.

`VALIDATION`:
- draft/review/test content may be executed against synthetic scenarios;
- `SUPERSEDED` and `RETIRED` content remains ineligible.

The mode boundary is essential: automated evidence/rule generation can be tested without making unapproved content available to production workflows.

## Decision immutability
The returned event/trace are deep-copied and recursively frozen in-process. Persistence infrastructure added later must preserve the same semantic contract using append-only/versioned storage. Re-evaluation creates a new DecisionEvent rather than modifying a historical one.

## Reason-code examples
System reason codes include:
- `NO_APPLICABLE_RULE`
- `RULE_APPLICABILITY_UNRESOLVED`
- `RULE_AMBIGUITY`
- `REQUIRED_INPUT_UNRESOLVED`
- `CONFLICTING_REQUIRED_INPUT`
- `HARD_STOP_STATUS_UNRESOLVED`
- `REQUIRED_POLICY_MISSING`
- `POLICY_APPLICABILITY_UNRESOLVED`
- `POLICY_CONFLICT`
- `POLICY_CANNOT_DOWNGRADE_CLINICIAN_REVIEW`

Clinical hard stops use governance-defined reason codes attached to the rule itself.

## Deliberate limitations at Stage 5
- No medication-specific production rule corpus is activated.
- No validated calculator module is implemented yet.
- No persistence/database layer exists yet.
- No external API/HTTP endpoint exists yet.
- No clinical-rule approval workflow UI exists yet.
- No automatic rule activation from evidence retrieval is permitted.
- The generic policy resolver is intentionally conservative; complex multi-policy semantics must be encoded explicitly and regression-tested before production use.

## Required future quality gates
Before clinical deployment:
- executable CI must run typechecking and unit/regression tests;
- every production rule must have branch, hard-stop, missing-data, policy, and regression coverage;
- deterministic results must be compared against an expert reference set;
- false-negative escalation must be measured explicitly;
- rule/policy changes must produce versioned diffs and require governance approval.
