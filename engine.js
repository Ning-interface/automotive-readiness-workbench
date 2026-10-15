(function (root) {
  'use strict';
  const order = ['A', 'B', 'C', 'PVS', '0S', 'SOP', 'RAMP'];
  function applicable(record, gate) { return order.indexOf(record.from) <= order.indexOf(gate); }
  function validWaiver(program, record, gate) {
    if (record.critical) return null;
    const date = program.gates.find(g => g.id === gate)?.date || program.asOf;
    const requiredThrough = date > program.asOf ? date : program.asOf;
    return program.waivers.find(w => w.evidence === record.id && w.approved === true && Boolean(w.authority) && Boolean(w.restriction) && Boolean(w.signedAt) && w.signedAt <= program.asOf && w.scope === program.decisionScope && w.allowedGates.includes(gate) && w.expires >= requiredThrough) || null;
  }
  function evaluate(program, gate) {
    if (!order.includes(gate)) throw new Error('Unknown decision gate: ' + gate);
    const byId = new Map(program.records.map(r => [r.id, r]));
    const cache = new Map();
    function inspect(record, trail) {
      if (cache.has(record.id)) return cache.get(record.id);
      if (trail.includes(record.id)) return { ...record, disposition: 'blocked', reason: 'Circular evidence dependency.' };
      const dependency = record.dependencies.map(id => byId.get(id)).find(r => !r || inspect(r, [...trail, record.id]).disposition !== 'verified');
      const missingDependency = record.dependencies.some(id => !byId.has(id));
      let disposition, reason, waiver = null;
      if (record.status === 'verified' && record.reviewedRevision === program.revision && record.reviewer && record.reviewedAt && record.reviewedAt <= program.asOf && !dependency && !missingDependency) {
        disposition = 'verified'; reason = 'Independent review recorded for the current configuration.';
      } else if (record.status === 'verified') {
        disposition = 'blocked'; reason = record.reviewedRevision !== program.revision ? 'Evidence belongs to a different configuration revision.' : dependency || missingDependency ? 'Required upstream evidence is not verified.' : 'Independent reviewer and a valid review date are required.';
      } else {
        waiver = validWaiver(program, record, gate);
        disposition = waiver ? 'conditional' : 'blocked';
        reason = waiver ? `${waiver.id}: ${waiver.restriction}` : record.status === 'rejected' ? 'Acceptance criterion failed; validation closure required.' : 'Required evidence has not been independently accepted.';
      }
      const result = { ...record, disposition, reason, waiver }; cache.set(record.id, result); return result;
    }
    const rows = program.records.filter(r => applicable(r, gate)).map(r => inspect(r, []));
    const blockers = rows.filter(r => r.disposition === 'blocked');
    const conditions = rows.filter(r => r.disposition === 'conditional');
    const verified = rows.filter(r => r.disposition === 'verified');
    const status = blockers.length ? 'HOLD' : conditions.length ? 'CONDITIONAL' : 'GO';
    const due = program.issues.filter(issue => rows.some(r => r.id === issue.evidence && r.disposition !== 'verified'));
    return { gate, status, rows, blockers, conditions, verified, percentage: rows.length ? Math.round(verified.length / rows.length * 100) : 0, issues: due, overdue: due.filter(i => i.due < program.asOf).length, daysToSop: Math.round((Date.parse(program.sop) - Date.parse(program.asOf)) / 86400000) };
  }
  function simulateChange(program) {
    const p = structuredClone(program); p.revision = 'R4';
    for (const record of p.records) {
      if (!['EV-04', 'EV-05', 'EV-06', 'EV-07', 'EV-09', 'EV-11'].includes(record.id)) { if (record.status === 'verified') record.reviewedRevision = 'R4'; }
    }
    p.changes[0].proposed = 'Tool T03 / seal track R4';
    p.changes[0].controls.unshift('New R4 scenario: retained R3 evidence is invalid for affected records until revalidated.');
    p.waivers = [];
    return p;
  }
  const api = { evaluate, validWaiver, applicable, simulateChange };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.GateEngine = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
