'use strict';
// Template/event smoke tests in a minimal DOM harness. This does not validate browser layout.
const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
function boot(documentHtml) {
  const elements = new Map(), handlers = {}, windowHandlers = {}, downloads = [];
  const listen=(store,type,cb)=>{(store[type]??=[]).push(cb);};
  const emit=(store,type,event)=>{for(const cb of store[type]||[])cb(event);};
  class Element {
    constructor(id) { this.id = id; this.value = ''; this.style = {}; this.dataset = {}; this.listeners = {}; this.classList = { add() {}, remove() {}, toggle() {} }; this._html = ''; }
    set innerHTML(value) { this._html = value; for (const match of value.matchAll(/\bid="([^"]+)"/g)) if (!elements.has(match[1])) elements.set(match[1], new Element(match[1])); }
    get innerHTML() { return this._html; }
    addEventListener(type, cb) { this.listeners[type] = cb; }
    setAttribute() {} removeAttribute() {} appendChild() {} remove() {} click() {}
    showModal() { this.open = true; } close() { this.open = false; }
  }
  const html = documentHtml || fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
  for (const m of html.matchAll(/\bid="([^"]+)"/g)) elements.set(m[1], new Element(m[1]));
  const nav = [...html.matchAll(/\bdata-view="([^"]+)"/g)].map(m => Object.assign(new Element(), { dataset: { view: m[1] } }));
  const extra=new Map();
  const document = { getElementById: id => elements.get(id), querySelector: selector=>{if(!extra.has(selector))extra.set(selector,new Element());return extra.get(selector);}, querySelectorAll: () => nav, addEventListener: (type, cb) => listen(handlers,type,cb), createElement: () => new Element(), body: new Element() };
  const url = { createObjectURL(blob) { downloads.push(blob); return 'blob:test'; }, revokeObjectURL() {} };
  const context = { document, location: { hash: '',protocol:'file:',hostname:'' }, navigator: { clipboard: { writeText: async () => {} } }, Blob, TextEncoder,TextDecoder,Uint8Array,URL: url, Intl, Date, structuredClone, console, setTimeout: () => 1, clearTimeout() {}, addEventListener: (type, cb) => listen(windowHandlers,type,cb), print() {} };
  context.window = context;
  vm.createContext(context);
  if (documentHtml) {
    for (const [i, match] of [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].entries()) vm.runInContext(match[1], context, { filename: `offline-script-${i}.js` });
  } else {
    for (const match of html.matchAll(/<script src="([^"]+)" defer><\/script>/g)) vm.runInContext(fs.readFileSync(path.join(__dirname, match[1]), 'utf8'), context, { filename: match[1] });
  }
  return {
    elements, downloads,context,
    html: () => elements.get('workspace').innerHTML,
    route(view) { context.location.hash = '#' + view; emit(windowHandlers,'hashchange'); },
    select(id, value) { const target = elements.get(id); target.value = value; target.listeners.change({ target }); },
    click(selector, values) { emit(handlers,'click',{ target: { closest: query => query === selector ? { dataset: values } : null } }); },
    change(dataset,value){emit(handlers,'change',{target:{dataset,value}});},
    search(value) { const target = elements.get('evidence-search'); target.value = value; emit(handlers,'input',{ target }); }
  };
}
test('every main view renders meaningful content without a runtime exception', () => {
  const page = boot();
  for (const view of ['review', 'gates', 'evidence', 'risks', 'changes', 'pack', 'method']) {
    page.route(view); assert(page.html().length > 600); assert(!page.html().includes('undefined')); assert(!page.html().includes('NaN'));
  }
});
test('case and snapshot controls recalculate visible recommendation', () => {
  const page = boot();page.route('review'); assert(page.html().includes('RELEASE BLOCKED'));
  page.select('case-select', 'capacity'); assert(page.html().includes('RESTRICTED SCOPE'));
  page.select('snapshot-select', 'recovery'); assert(page.html().includes('EVIDENCE ACCEPTED'));
  page.select('case-select', 'ready'); assert(page.html().includes('EVIDENCE ACCEPTED'));
  page.select('gate-select', 'RAMP'); assert(page.html().includes('RELEASE BLOCKED'));
});
test('evidence record opens with criterion, review, configuration and dependencies', () => {
  const page = boot(); page.click('[data-evidence]', { evidence: 'EV-04' });
  assert(page.elements.get('evidence-dialog').open);
  const detail = page.elements.get('dialog-body').innerHTML;
  for(const label of ['ACCEPTANCE CRITERION', 'OBSERVED RESULT', 'INDEPENDENT REVIEWER', 'DEPENDENCIES', 'DVP-017-R3']) assert(detail.includes(label));
});
test('search filters evidence rows without replacing the search control', () => {
  const page = boot(); page.route('evidence'); page.search('ECN-024');
  assert(page.elements.get('evidence-results').innerHTML.includes('EV-07'));
  assert(!page.elements.get('evidence-results').innerHTML.includes('EV-01'));
  assert.equal(page.elements.get('evidence-count').textContent, '1 / 11 records');
});
test('R4 what-if reopens an otherwise releasable program and reset restores it', () => {
  const page = boot(); page.select('case-select', 'ready'); page.route('changes'); page.click('[data-action]', { action: 'change' });
  page.route('review'); assert(page.html().includes('RELEASE BLOCKED')); assert(page.html().includes('R4 what-if active'));
  page.click('[data-action]', { action: 'reset-change' }); assert(page.html().includes('EVIDENCE ACCEPTED'));
});
test('downloaded pack has the same disposition and includes inspectable evidence and assumptions', async () => {
  const page = boot(); page.route('pack'); page.click('[data-action]', { action: 'export' });
  const html = await page.downloads[0].text();
  for (const text of ['HOLD', '8/11', 'EV-04', 'Evidence detail appendix', 'Dependency-linked recovery', 'Cost assumptions', 'Public reference register']) assert(html.includes(text));
  assert(!html.includes('<button')); assert(html.endsWith('</body></html>'));
});
test('exported evidence CSV preserves criterion, revision and gate disposition', async () => {
  const page = boot(); page.route('evidence'); page.click('[data-action]', { action: 'csv' });
  const csv = await page.downloads[0].text();
  assert(csv.includes('"Acceptance"')); assert(csv.includes('"Reviewed revision"')); assert(csv.includes('"EV-04","0S"')); assert(csv.includes('"blocked"'));
});
test('the packaged offline application executes with all scripts embedded', { skip: !process.env.PORTFOLIO_OFFLINE_HTML }, () => {
  const html = fs.readFileSync(process.env.PORTFOLIO_OFFLINE_HTML, 'utf8');
  assert(!html.includes('<script src=')); assert(!html.includes('@import'));
  const page = boot(html);page.route('review'); assert(page.html().includes('RELEASE BLOCKED'));
  page.select('case-select', 'ready'); assert(page.html().includes('EVIDENCE ACCEPTED'));
  page.route('method'); assert(page.html().includes('Reference register'));
});
test('all file-driven workbench views render and the seeded scenario propagates',()=>{
  const page=boot();assert(page.html().includes('Choose project files'));
  page.click('[data-wb-action]',{wbAction:'sample'});
  for(const view of ['data','analysis','documents','validation']){page.route(view);assert(page.html().length>600);assert(!page.html().includes('undefined'));assert(!page.html().includes('NaN'));}
  page.route('analysis');assert(page.html().includes('2027-03-08'));
  page.change({taskId:'T2',taskField:'remainingDays'},'7');assert(page.html().includes('2027-03-11'));
  assert.equal(page.context.WorkbenchUI.state.baseline.plan.finish,'2027-03-08');
});
test('workspace snapshot restores imported records, scenarios and declared reviews',async()=>{
  const page=boot();page.click('[data-wb-action]',{wbAction:'sample'});page.change({taskId:'T2',taskField:'remainingDays'},'7');
  page.context.WorkbenchUI.state.reviews.push({name:'Declared reviewer',digest:'unverified',comment:'Not authenticated'});
  page.click('[data-wb-action]',{wbAction:'workspace'});const json=await page.downloads.at(-1).text();
  const other=boot();await other.context.WorkbenchUI.importFiles([{name:'workspace.json',size:json.length,arrayBuffer:async()=>new TextEncoder().encode(json).buffer}]);
  assert.equal(other.context.WorkbenchUI.state.analysis.plan.finish,'2027-03-11');assert.equal(other.context.WorkbenchUI.state.reviews.length,1);
  assert(other.context.WorkbenchUI.state.log.some(x=>x.action==='RESTORE_WORKSPACE'));
});
test('raw document import is explicitly rejected in offline mode',async()=>{
  const page=boot();await page.context.WorkbenchUI.importFiles([{name:'memo.pdf',size:3,arrayBuffer:async()=>new Uint8Array([1,2,3]).buffer}]);
  assert(page.context.WorkbenchUI.state.errors[0].includes('local server'));assert.equal(page.context.WorkbenchUI.state.files.length,0);
});
test('malformed bundle is quarantined without corrupting the active workspace',async()=>{
  const page=boot();page.click('[data-wb-action]',{wbAction:'sample'});const json='{"documents":"invalid"}';
  await page.context.WorkbenchUI.importFiles([{name:'bad.json',size:json.length,arrayBuffer:async()=>new TextEncoder().encode(json).buffer}]);
  assert.equal(page.context.WorkbenchUI.state.files.length,1);assert(page.context.WorkbenchUI.state.errors[0].includes('documents must be an array'));assert.equal(page.context.WorkbenchUI.state.analysis.plan.finish,'2027-03-08');
});
