'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),http=require('node:http');
const {createServer}=require('./server.js');
test('local HTTP boundary and static assets',async t=>{
  const server=createServer();await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  t.after(()=>new Promise(resolve=>{server.closeAllConnections();server.close(resolve);}));
  const base='http://127.0.0.1:'+server.address().port;
  await t.test('health explicitly declares no cloud AI',async()=>{const r=await fetch(base+'/api/health');assert.equal(r.status,200);assert.equal((await r.json()).cloudAI,false);});
  await t.test('new application scripts are served',async()=>{const r=await fetch(base+'/workbench-core.js');assert.equal(r.status,200);assert((await r.text()).includes('function analyze'));});
  await t.test('hidden source control files are denied',async()=>{const r=await fetch(base+'/.git/config');assert.equal(r.status,403);await r.text();});
  await t.test('mutating static methods are denied',async()=>{const r=await fetch(base+'/index.html',{method:'POST'});assert.equal(r.status,405);await r.text();});
  await t.test('cross-origin extraction is denied',async()=>{const r=await fetch(base+'/api/extract',{method:'POST',headers:{Origin:'https://attacker.invalid','Content-Type':'application/json'},body:'{}'});assert.equal(r.status,403);await r.text();});
  await t.test('same-origin unsupported payload is rejected',async()=>{const r=await fetch(base+'/api/extract',{method:'POST',headers:{Origin:base,'Content-Type':'application/json'},body:JSON.stringify({filename:'script.exe',contentBase64:'AAAA'})});assert.equal(r.status,400);await r.text();});
  await t.test('invalid document bytes fail without a successful extraction',async()=>{const r=await fetch(base+'/api/extract',{method:'POST',headers:{Origin:base,'Content-Type':'application/json'},body:JSON.stringify({filename:'memo.pdf',contentBase64:'bm90IGEgcGRm'})});assert.equal(r.status,422);assert((await r.json()).error);});
  await t.test('foreign Host headers are rejected',async()=>{const result=await new Promise((resolve,reject)=>{http.get(base+'/api/health',{headers:{Host:'attacker.invalid'}},r=>{r.resume();r.on('end',()=>resolve(r.statusCode));}).on('error',reject);});assert.equal(result,403);});
});
