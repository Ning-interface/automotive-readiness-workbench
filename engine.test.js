'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const D = require('./data.js'), E = require('./engine.js');

test('sealing baseline is HOLD with three traceable release blockers', () => {
  const a = E.evaluate(D.program('sealing'), '0S');
  assert.equal(a.status, 'HOLD');
  assert.deepEqual(a.blockers.map(r => r.id), ['EV-04', 'EV-07', 'EV-09']);
  assert.equal(a.verified.length, 8);
});
test('a critical failure is never averaged away by otherwise complete evidence', () => {
  const p = D.program('ready');
  p.records.find(r => r.id === 'EV-04').status = 'rejected';
  const a = E.evaluate(p, 'SOP');
  assert.equal(a.status, 'HOLD');
  assert(a.blockers.some(r => r.id === 'EV-04'));
  assert(a.blockers.some(r => r.id === 'EV-09'));
});
test('a signed trial concession yields CONDITIONAL at the permitted gate only', () => {
  const p = D.program('capacity');
  assert.equal(E.evaluate(p, 'PVS').status, 'CONDITIONAL');
  assert.equal(E.evaluate(p, '0S').status, 'HOLD');
  assert.equal(E.evaluate(p, 'SOP').status, 'HOLD');
});
test('expired concession cannot support conditional release', () => {
  const p = D.program('capacity'); p.asOf = '2027-03-02';
  assert.equal(E.evaluate(p, 'PVS').status, 'HOLD');
});
test('concession must cover the planned gate date, not just the current date', () => {
  const p = D.program('capacity'); p.asOf = '2027-02-01'; p.waivers[0].signedAt = '2027-01-31'; p.waivers[0].expires = '2027-02-10';
  assert.equal(E.evaluate(p, 'PVS').status, 'HOLD');
});
for (const field of ['authority', 'scope', 'restriction', 'signedAt']) test(`a concession without valid ${field} is not accepted`, () => {
  const p = D.program('capacity'); p.waivers[0][field] = '';
  assert.equal(E.evaluate(p, 'PVS').status, 'HOLD');
});
test('unsigned or future-dated authorization cannot clear an exception', () => {
  for (const override of [{ approved: false }, { signedAt: '2027-02-17' }]) {
    const p = D.program('capacity'); Object.assign(p.waivers[0], override);
    assert.equal(E.evaluate(p, 'PVS').status, 'HOLD');
  }
});
test('critical gaps cannot be waived by the portfolio exception rule', () => {
  const p = D.program('capacity'); p.records.find(r => r.id === 'EV-08').critical = true;
  assert.equal(E.evaluate(p, 'PVS').status, 'HOLD');
});
test('verified recovery closes the evidence path without changing baseline data', () => {
  const baseline = D.program('sealing'); const recovered = D.recover(baseline);
  assert.equal(E.evaluate(recovered, '0S').status, 'GO');
  assert.equal(E.evaluate(baseline, '0S').status, 'HOLD');
  assert.equal(E.evaluate(D.recover(D.program('capacity')), 'SOP').status, 'GO');
});
test('GO at SOP does not imply operations handover', () => {
  const p = D.program('ready');
  assert.equal(E.evaluate(p, 'SOP').status, 'GO');
  assert.equal(E.evaluate(p, 'RAMP').status, 'HOLD');
  assert.equal(E.evaluate(p, 'RAMP').blockers[0].id, 'EV-12');
});
test('a new configuration invalidates affected accepted evidence', () => {
  const p = D.program('ready'); const changed = E.simulateChange(p);
  const a = E.evaluate(changed, 'SOP');
  assert.equal(a.status, 'HOLD');
  assert(a.blockers.some(r => r.id === 'EV-04' && r.reason.includes('revision')));
  assert(a.verified.some(r => r.id === 'EV-01'));
  assert.equal(E.evaluate(p, 'SOP').status, 'GO');
});
test('an accepted downstream dossier cannot bypass failed dependencies', () => {
  const p = D.program('ready'); p.records.find(r => r.id === 'EV-07').status = 'open';
  const a = E.evaluate(p, 'SOP');
  assert(a.blockers.some(r => r.id === 'EV-09' && r.reason.includes('upstream')));
});
test('missing reviewer and future review date cannot count as verified', () => {
  for (const update of [{ reviewer: '' }, { reviewedAt: '2028-01-01' }]) {
    const p = D.program('ready'); Object.assign(p.records[0], update);
    assert.equal(E.evaluate(p, 'SOP').status, 'HOLD');
  }
});
test('unreferenced evidence cannot fulfill a missing dependency', () => {
  const p = D.program('ready'); p.records[2].dependencies.push('MISSING-RECORD');
  assert.equal(E.evaluate(p, 'SOP').status, 'HOLD');
});
test('all scenario/gate combinations keep counts and release disposition consistent', () => {
  for (const id of ['sealing', 'capacity', 'ready']) for (const snapshot of ['baseline', 'recovery']) for (const gate of D.stages) {
    let p = D.program(id); if(snapshot === 'recovery') p = D.recover(p);
    const a = E.evaluate(p, gate.id);
    assert.equal(a.rows.length, a.verified.length + a.blockers.length + a.conditions.length);
    if (a.status === 'GO') assert.equal(a.verified.length, a.rows.length);
    if (a.blockers.length) assert.equal(a.status, 'HOLD');
    assert(a.rows.every(r => D.stages.findIndex(s => s.id === r.from) <= D.stages.findIndex(s => s.id === gate.id)));
  }
});
