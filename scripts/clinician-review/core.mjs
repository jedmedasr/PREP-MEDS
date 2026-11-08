import { createHash, createHmac, timingSafeEqual } from 'node:crypto';

export const POLICY_VERSION = 'clinician-source-review-2026-11-08';
export const stable = value => JSON.stringify(value, (_, v) => v && typeof v === 'object' && !Array.isArray(v)
  ? Object.fromEntries(Object.keys(v).sort().map(k => [k, v[k]])) : v);
export const digest = value => createHash('sha256').update(stable(value)).digest('hex');
const fail = code => { throw new Error(code); };
const text = v => typeof v === 'string' && v.trim().length > 0;
const object = v => v && typeof v === 'object' && !Array.isArray(v);
const unique = values => Array.isArray(values) && values.every(text) && new Set(values).size === values.length;
const same = (a, b) => stable(a) === stable(b);
const sha = value => /^[a-f0-9]{64}$/.test(value ?? '');
const date = v => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(v) && Number.isFinite(Date.parse(v));
function keys(value, allowed, code) { if (!object(value) || Object.keys(value).some(k => !allowed.includes(k))) fail(code); }
function https(value) {
  try { const u = new URL(value); return u.protocol === 'https:' && !u.username && !u.password; } catch { return false; }
}

/** Stable clinical identity includes ALL ingredients, salt/route/form/release/device and regimen distinctions. */
export function groupKey(group) {
  return digest({ ingredientIds: [...group.ingredientIds].sort(), formulation: group.formulation });
}
export function materialHash(group, packet) {
  // Only presentation-only label/formatting metadata is excluded. New facts, mappings and source revisions invalidate review.
  return digest({ policyVersion: POLICY_VERSION, groupId: group.id, groupKey: groupKey(group),
    mappingRevision: group.mappingRevision, mappings: [...group.canonicalIds].sort(), mappingBasis: group.mappingBasis,
    packet: Object.fromEntries(Object.entries(packet).filter(([key]) => !['displayTitle', 'editorialNotes'].includes(key))) });
}

/** Validate shape/provenance, not medical truth. Conflicts are retained, not resolved by this function. */
export function validateCatalog(catalog, inventory) {
  const errors = [];
  try {
    keys(catalog, ['schemaVersion','policyVersion','groups','unmappedReason'], 'CATALOG_FIELDS');
    if (catalog.schemaVersion !== 1 || catalog.policyVersion !== POLICY_VERSION || !Array.isArray(catalog.groups)) fail('CATALOG_SCHEMA');
    const ids = new Set(); const clinicalKeys = new Set(); const canonical = new Map(inventory.map(m => [m.id, m]));
    if (canonical.size !== inventory.length) fail('DUPLICATE_INVENTORY_ID');
    const mapped = new Set();
    for (const group of catalog.groups) {
      keys(group, ['id','label','ingredientIds','formulation','mappingRevision','canonicalIds','mappingBasis','package'], 'GROUP_FIELDS');
      if (!/^[A-Za-z0-9][A-Za-z0-9._-]{0,99}$/.test(group.id ?? '') || ids.has(group.id) || !text(group.label) ||
          !unique(group.ingredientIds) || !group.ingredientIds.length || !unique(group.canonicalIds) ||
          !group.canonicalIds.length || !text(group.mappingRevision) || !object(group.mappingBasis)) fail('GROUP_IDENTITY');
      ids.add(group.id);
      keys(group.formulation, ['route','doseForm','release','chemicalForm','device','regimen'], 'FORMULATION_FIELDS');
      if (['route','doseForm','release','chemicalForm','device','regimen'].some(k => !text(group.formulation[k]) || group.formulation[k] === 'UNKNOWN')) fail('FORMULATION_REQUIRED');
      if (clinicalKeys.has(groupKey(group))) fail('DUPLICATE_CLINICAL_GROUP');
      clinicalKeys.add(groupKey(group));
      for (const id of group.canonicalIds) {
        const m = canonical.get(id);
        if (!m || !same([...m.ingredientIds].sort(), [...group.ingredientIds].sort()) || !text(group.mappingBasis[id])) fail('CANONICAL_MAPPING_INVALID');
        mapped.add(id);
      }
      if (Object.keys(group.mappingBasis).some(id => !group.canonicalIds.includes(id))) fail('UNDECLARED_MAPPING');
      const p = group.package;
      keys(p, ['id','revision','state','provenance','recommendations','conflicts','unresolved','testEvidence','displayTitle','editorialNotes'], 'PACKAGE_FIELDS');
      if (!text(p.id) || !text(p.revision) || !['DRAFT','READY_FOR_CLINICIAN_REVIEW'].includes(p.state) ||
          !Array.isArray(p.recommendations) || !unique(p.conflicts) || !unique(p.unresolved) || !unique(p.testEvidence) ||
          !object(p.provenance) || !https(p.provenance.sourceCommit) || !text(p.provenance.extractedBy)) fail('PACKAGE_SCHEMA');
      const seen = new Set();
      for (const r of p.recommendations) {
        keys(r, ['id','source','scenario','interruption','resumption','renal','exceptions','bridging','strength','certainty','conflictsWith'], 'RECOMMENDATION_FIELDS');
        if (!text(r.id) || seen.has(r.id)) fail('RECOMMENDATION_ID'); seen.add(r.id);
        for (const field of ['scenario','interruption','resumption','renal','exceptions','bridging','strength','certainty']) {
          if (!text(r[field])) fail('INCOMPLETE_RECOMMENDATION:' + field);
        }
        if (!unique(r.conflictsWith)) fail('CONFLICT_FIELDS');
        const s = r.source;
        keys(s, ['publisher','title','version','publication','url','locator','deepLink','deepLinkUnavailableReason','passage','footnotes','sourceRevision','accessLimitations'], 'SOURCE_FIELDS');
        if (['publisher','title','version','publication','locator','sourceRevision','passage','footnotes'].some(k => !text(s[k])) ||
            !https(s.url) || !unique(s.accessLimitations)) fail('SOURCE_PROVENANCE_REQUIRED');
        if (s.deepLink !== null && !https(s.deepLink)) fail('DIRECT_SOURCE_LINK_REQUIRED');
        if (s.deepLink === null && !text(s.deepLinkUnavailableReason)) fail('DEEPLINK_FALLBACK_MUST_BE_EXPLAINED');
        // A cover-page alias is not a specific locator. Missing deep links require explicit disclosure.
        if (s.deepLink === s.url && !new URL(s.deepLink).hash && !text(s.deepLinkUnavailableReason)) fail('GENERIC_LINK_IS_NOT_DEEP_LINK');
      }
      if (p.recommendations.some(r => r.conflictsWith.some(id => !seen.has(id) || id === r.id))) fail('DANGLING_CONFLICT');
      if (p.state === 'READY_FOR_CLINICIAN_REVIEW' && (!p.recommendations.length || p.unresolved.length || !p.testEvidence.length ||
          p.recommendations.some(r => r.source.accessLimitations.length))) fail('INCOMPLETE_READY_PACKAGE');
    }
  } catch (e) { errors.push(e.message); }
  return errors;
}
export function assertCatalog(catalog, inventory) {
  const errors = validateCatalog(catalog, inventory); if (errors.length) fail(errors.join(';'));
}
export function nextExtraction(catalog, backlog) {
  // A ready package waiting for a clinician is NEVER a prerequisite for extracting another group.
  const states = new Map(catalog.groups.map(g => [g.id, g.package.state]));
  return [...backlog].filter(x => !states.has(x.groupId) || states.get(x.groupId) === 'DRAFT')
    .sort((a,b) => a.priority - b.priority || a.groupId.localeCompare(b.groupId))[0] ?? null;
}
export function packageDiff(oldPacket, nextPacket) {
  const keys = new Set([...Object.keys(oldPacket ?? {}), ...Object.keys(nextPacket)]);
  return [...keys].sort().filter(key => !same(oldPacket?.[key], nextPacket[key])).map(field => ({ field, before: oldPacket?.[field] ?? null, after: nextPacket[field] }));
}
const signed = (event, key) => createHmac('sha256', key).update(stable(event)).digest('hex');
function unsigned(event) { const { signature, ...rest } = event; return rest; }
export function validateLedger(ledger, key) {
  if (!text(key) || key.length < 32 || !object(ledger) || ledger.schemaVersion !== 1 || !Array.isArray(ledger.events) || ledger.events.length > 10000) fail('AUDIT_UNAVAILABLE');
  let prev = null; let time = -Infinity; const ids = new Set();
  for (const event of ledger.events) {
    const { eventId, ...body } = unsigned(event);
    if (!sha(event.signature) || !sha(eventId) || ids.has(eventId) || event.previousEvent !== prev ||
        digest(body) !== eventId || !timingSafeEqual(Buffer.from(event.signature,'hex'), Buffer.from(signed(unsigned(event), key),'hex')) ||
        !date(event.reviewedAt) || Date.parse(event.reviewedAt) < time || !['MARK_REVIEWED','REQUEST_CHANGES','REVOKE'].includes(event.action) ||
        event.patientFacingAuthorized !== false || event.actor?.type !== 'User' || !Number.isSafeInteger(event.actor?.id) || !text(event.actor?.login)) fail('AUDIT_INTEGRITY');
    prev = eventId; ids.add(eventId); time = Date.parse(event.reviewedAt);
  }
  return ledger;
}
export function actorAuthorized(actor, allowedIds) {
  return actor?.type === 'User' && Number.isSafeInteger(actor.id) && text(actor.login) && allowedIds.includes(String(actor.id));
}
export function reviewStatus(group, ledger) {
  const event = ledger.events.filter(e => e.groupId === group.id).at(-1);
  const currentHash = materialHash(group, group.package);
  if (event?.action === 'MARK_REVIEWED' && event.materialHash === currentHash && event.evidenceRevision === group.package.revision && group.package.state === 'READY_FOR_CLINICIAN_REVIEW') {
    return { state: 'CLINICALLY_REVIEWED', event, materialHash: currentHash, patientFacingAuthorized: false };
  }
  return { state: event ? (event.action === 'MARK_REVIEWED' ? 'REVIEW_INVALIDATED' : 'CHANGES_REQUESTED') : group.package.state,
    event: event ?? null, materialHash: currentHash, patientFacingAuthorized: false };
}
export function appendReview(catalog, inventory, ledger, actor, allowedIds, request, key, now = new Date().toISOString()) {
  assertCatalog(catalog, inventory); validateLedger(ledger, key);
  if (!actorAuthorized(actor, allowedIds)) fail('CLINICIAN_AUTHORIZATION_REQUIRED');
  keys(request, ['action','groupId','expectedMaterialHash','expectedRevision','requestId','attestation','notes'], 'UNTRUSTED_REVIEW_FIELDS');
  if (!['MARK_REVIEWED','REQUEST_CHANGES','REVOKE'].includes(request.action) ||
      !/^[A-Za-z0-9-]{16,100}$/.test(request.requestId ?? '') || typeof request.notes !== 'string' || request.notes.length > 2000 ||
      !date(now) || (ledger.events.length && Date.parse(now) < Date.parse(ledger.events.at(-1).reviewedAt))) fail('INVALID_REVIEW_REQUEST');
  const group = catalog.groups.find(g => g.id === request.groupId); if (!group) fail('GROUP_NOT_FOUND');
  if (request.expectedMaterialHash !== materialHash(group, group.package) || request.expectedRevision !== group.package.revision) fail('STALE_EVIDENCE_REFRESH_REQUIRED');
  const requestDigest = digest({ request, actorId: actor.id });
  const existing = ledger.events.find(e => e.requestId === request.requestId);
  if (existing) {
    if (existing.requestDigest !== requestDigest) fail('IDEMPOTENCY_CONFLICT');
    return { ledger, event: existing, resumed: true };
  }
  if (request.action === 'MARK_REVIEWED' && reviewStatus(group, ledger).state === 'CLINICALLY_REVIEWED') fail('ALREADY_REVIEWED');
  if (request.action === 'MARK_REVIEWED' && (request.attestation !== true || group.package.state !== 'READY_FOR_CLINICIAN_REVIEW')) fail('AFFIRMATIVE_SOURCE_REVIEW_REQUIRED');
  if (request.action !== 'MARK_REVIEWED' && !request.notes.trim()) fail('CORRECTION_REASON_REQUIRED');
  const prior = ledger.events.filter(e => e.groupId === group.id).at(-1);
  const body = { schemaVersion: 1, policyVersion: POLICY_VERSION, groupId: group.id, action: request.action,
    requestId: request.requestId, requestDigest, actor: { id: actor.id, login: actor.login, type: actor.type }, reviewedAt: now,
    evidenceRevision: group.package.revision, materialHash: materialHash(group, group.package),
    sourceVersions: group.package.recommendations.map(r => ({ recommendationId: r.id, publisher: r.source.publisher, version: r.source.version, sourceRevision: r.source.sourceRevision, locator: r.source.locator })),
    canonicalIds: [...group.canonicalIds].sort(), mappingRevision: group.mappingRevision,
    groupSnapshot: structuredClone(group), modifications: packageDiff(prior?.groupSnapshot?.package, group.package),
    notes: request.notes, primarySourcesChecked: request.action === 'MARK_REVIEWED',
    previousEvent: ledger.events.at(-1)?.eventId ?? null, patientFacingAuthorized: false };
  const event = { ...body, eventId: digest(body) }; event.signature = signed(event, key);
  return { ledger: { schemaVersion: 1, events: [...ledger.events, event] }, event, resumed: false };
}
export function canonicalReviewMap(catalog, inventory, ledger) {
  assertCatalog(catalog, inventory);
  return Object.fromEntries(inventory.map(m => {
    const groups = catalog.groups.filter(g => g.canonicalIds.includes(m.id)).map(g => ({ groupId:g.id, formulation:g.formulation, ...reviewStatus(g,ledger) }));
    return [m.id, { state:groups.length ? 'SCOPED_GROUP_EVIDENCE' : 'FORMULATION_MAPPING_REQUIRED', groups, requiresFormulationConfirmation:true, patientFacingAuthorized:false }];
  }));
}
