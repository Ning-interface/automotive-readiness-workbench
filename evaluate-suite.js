'use strict';
const fs=require('node:fs'),crypto=require('node:crypto'),path=require('node:path'),W=require('./workbench-core.js');
function evaluateSuite(suitePath){
  const bytes=fs.readFileSync(suitePath),suite=JSON.parse(bytes.toString('utf8')),results=[];
  for(const c of suite.cases){
    let actual,error;
    try{actual=W.analyze(W.normalizeJSON(c.input,{file:'holdout/'+c.id+'.json'}));}catch(e){error=e.message;}
    const checks=[];
    if(c.expected.status)checks.push({metric:'status',expected:c.expected.status,actual:actual?.status,pass:actual?.status===c.expected.status});
    if(c.expected.acceptableStatuses)checks.push({metric:'acceptableStatus',expected:c.expected.acceptableStatuses,actual:actual?.status,pass:c.expected.acceptableStatuses.includes(actual?.status)});
    if(c.expected.schedule)for(const[k,v]of Object.entries(c.expected.schedule)){const value=actual?.plan?.[k];checks.push({metric:'schedule.'+k,expected:v,actual:value,pass:typeof v==='number'?Math.abs(value-v)<0.001:JSON.stringify(value)===JSON.stringify(v)});}
    if(c.expected.findingCodes)for(const code of c.expected.findingCodes)checks.push({metric:'finding:'+code,expected:true,actual:actual?.findings.some(f=>f.code===code),pass:actual?.findings.some(f=>f.code===code)});
    if(c.expected.findingAnyOf)for(const codes of c.expected.findingAnyOf)checks.push({metric:'findingAnyOf',expected:codes,actual:actual?.findings.map(f=>f.code),pass:actual?.findings.some(f=>codes.includes(f.code))});
    if(c.expected.hasCitations)checks.push({metric:'hasCitations',expected:true,actual:actual?.findings.some(f=>f.locations.length>0),pass:actual?.findings.some(f=>f.locations.length>0)});
    results.push({id:c.id,name:c.name,pass:!error&&checks.every(c=>c.pass),checks,error:error||null,status:actual?.status,plan:actual?.plan,findings:actual?.findings});
  }
  return {kind:'independent-ai-fixture-evaluation',humanExpertValidation:false,generatedAt:new Date().toISOString(),engineSha256:crypto.createHash('sha256').update(fs.readFileSync(path.join(__dirname,'workbench-core.js'))).digest('hex'),suiteSha256:crypto.createHash('sha256').update(bytes).digest('hex'),suitePath:path.basename(suitePath),total:results.length,passed:results.filter(r=>r.pass).length,failed:results.filter(r=>!r.pass).length,results,interpretation:'Independent AI-authored scenarios. Not industry certification, real-user validation or human expert approval.'};
}
if(require.main===module){const result=evaluateSuite(process.argv[2]);if(process.argv[3])fs.writeFileSync(process.argv[3],JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));process.exitCode=result.failed?1:0;}
module.exports={evaluateSuite};
