(function (root) {
  'use strict';
  const STAGES = ['A', 'B', 'C', 'PVS', '0S', 'SOP', 'RAMP'];
  const TABLES = ['project', 'requirements', 'evidence', 'tasks', 'resources', 'pfmea', 'controlPlan', 'waivers', 'changes'];
  const norm = v => String(v ?? '').normalize('NFKC').toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');
  const id = v => String(v ?? '').trim();
  const list = v => Array.isArray(v) ? v.map(id).filter(Boolean) : String(v ?? '').split(/[;；,，\n|]/).map(id).filter(Boolean);
  const fieldAliases = {
    id: ['id', '编号', '证据编号', '需求编号', '任务编号', '项目编号', 'record id', 'evidence id', 'task id', 'requirement id', 'waiver id', 'change id'],
    name: ['name', '名称', '项目名称', '任务名称', '证据名称', 'requirement', 'title'],
    asOf: ['asof', 'as of', '评审日期', '截止日期'], startDate: ['startdate', '项目开始日期', 'project start'], sop: ['sop', 'sop date', '量产日期', 'target finish'],
    gate: ['gate', '决策节点', '当前节点'], gateDate: ['gate date', '节点日期'], revision: ['revision', 'rev', '版本', '配置版本'], scope: ['scope', '范围', '放行范围'],
    currency: ['currency', '币种'], budget: ['budget', 'approved budget', '预算'], spent: ['spent', 'actual cost', '已发生费用'], overheadPerDay: ['overheadperday', '日管理费'], delayCostPerDay: ['delaycostperday', '日延期损失'], calendar: ['calendar', '日历'], holidays: ['holidays', '假期'],
    from: ['from', 'requiredfrom', 'required from', '适用起始节点', 'first gate'], critical: ['critical', 'hard stop', '硬阻断', '关键项'],
    status: ['status', '状态', 'approval status'], reviewer: ['reviewer', '审核人', '评审人'], reviewedAt: ['reviewedat', 'review date', '评审时间', '审核日期'], owner: ['owner', 'responsible', '责任人'],
    acceptance: ['acceptance', 'acceptance criteria', '验收标准'], result: ['result', 'observed result', '结果', '观察结果'], dependencies: ['dependencies', 'upstream evidence', '证据依赖'], value: ['value', 'measured value', '测量值'], min: ['min', 'lower limit', '下限'], max: ['max', 'upper limit', '上限'], unit: ['unit', '单位'],
    duration: ['duration', 'duration days', '工期', '工期天数'], remainingDays: ['remainingdays', 'remaining duration', '剩余工期'], predecessors: ['predecessors', 'predecessor', '前置任务', '前置依赖'], notBefore: ['notbefore', '不早于'], resource: ['resource', '资源'], units: ['units', '资源数量'], costPerDay: ['costperday', 'daily cost', '每日成本'], fixedCost: ['fixedcost', 'fixed cost', '固定成本'], actualFinish: ['actualfinish', '实际完成日期'], capacity: ['capacity', '资源容量'],
    operationId: ['operationid', 'operation_id', 'operation no', 'op #', 'process step', '工序号', '工序编号'], failureMode: ['failuremode', 'failure mode', '失效模式'], severity: ['severity', 'severity rating', '严重度', 's'], specialCharacteristic: ['specialcharacteristic', 'special characteristic', 'special char', '特殊特性', 'sc/cc'], detectionControl: ['detectioncontrol', 'detection control', '探测控制'],
    characteristic: ['characteristic', 'product characteristic', '特性', '特性名称'], method: ['method', 'control method', 'measurement method', '控制方法', '检测方法'], frequency: ['frequency', 'sample frequency', '频次', '检测频率'], reactionPlan: ['reactionplan', 'reaction plan', '反应计划'],
    evidence: ['evidence', 'evidence reference', '证据引用'], approved: ['approved', '已批准'], authority: ['authority', '批准角色'], allowedGates: ['allowedgates', '适用节点'], expires: ['expires', 'expiry', '到期日期'], signedAt: ['signedat', '签署日期'], restriction: ['restriction', '限制条件'], affectedEvidence: ['affectedevidence', '受影响证据']
  };
  const schema = {
    project: ['id','name','asOf','startDate','sop','gate','gateDate','revision','scope','currency','budget','spent','overheadPerDay','delayCostPerDay','calendar','holidays'],
    requirements: ['id','name','from','critical'], evidence: ['id','name','status','revision','reviewer','reviewedAt','owner','acceptance','result','dependencies','value','min','max','unit'],
    tasks: ['id','name','duration','remainingDays','predecessors','notBefore','resource','units','costPerDay','fixedCost','actualFinish'], resources: ['id','name','capacity'],
    pfmea: ['id','operationId','failureMode','severity','specialCharacteristic','detectionControl','characteristic'], controlPlan: ['id','operationId','characteristic','specialCharacteristic','method','frequency','reactionPlan','owner'],
    waivers: ['id','evidence','approved','authority','scope','allowedGates','expires','signedAt','restriction'], changes: ['id','revision','status','affectedEvidence']
  };
  const required = { project: ['id','asOf','gate','revision','scope'], requirements: ['id','from','critical'], evidence: ['id','status','revision'], tasks: ['id','duration'], resources: ['id','capacity'], pfmea: ['operationId','failureMode','severity'], controlPlan: ['operationId','characteristic','method','reactionPlan'], waivers: ['id','evidence','approved','authority','scope','allowedGates','expires','signedAt','restriction'], changes: ['id','revision','status','affectedEvidence'] };
  const numericFields = new Set(['budget','spent','overheadPerDay','delayCostPerDay','value','min','max','duration','remainingDays','units','costPerDay','fixedCost','capacity','severity']);
  const dateFields = new Set(['asOf','startDate','sop','gateDate','reviewedAt','notBefore','actualFinish','expires','signedAt']);
  const listFields = new Set(['holidays','dependencies','predecessors','allowedGates','affectedEvidence']);
  function bool(value) {
    if (typeof value === 'boolean') return value;
    const s = String(value ?? '').trim().toLowerCase();
    if (['true','yes','y','1','是','有','✓','✔','sc','cc','特殊特性'].includes(s)) return true;
    if (['false','no','n','0','否','无',''].includes(s)) return false;
    return null;
  }
  function number(value) {
    if (typeof value === 'number') return Number.isFinite(value) ? value : NaN;
    const s = String(value ?? '').trim(); if (!s) return null;
    return /^-?(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?$/.test(s) ? Number(s.replace(/,/g,'')) : NaN;
  }
  function validDate(value) { if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value))) return false; const d = new Date(value+'T00:00:00Z'); return !Number.isNaN(+d) && d.toISOString().slice(0,10) === value; }
  function evidenceStatus(value) {const s=norm(value);if(['verified','passed','approved','已验证','已批准','通过'].includes(s))return 'verified';if(['open','pending','submitted','未完成','待审核','进行中','已提交'].includes(s))return 'open';if(['rejected','failed','不通过','失败','已拒绝'].includes(s))return 'rejected';return id(value);}
  function toDate(value) {
    if (value instanceof Date && !Number.isNaN(+value)) return value.toISOString().slice(0,10);
    if (typeof value === 'number' && value > 0 && value < 100000) return new Date(Date.UTC(1899,11,30)+Math.round(value)*86400000).toISOString().slice(0,10);
    return String(value ?? '').trim();
  }
  function blank() { return { project: {}, requirements: [], evidence: [], tasks: [], resources: [], pfmea: [], controlPlan: [], waivers: [], changes: [], documents: [], imports: [], importFindings: [], reviews: [] }; }
  function location(row) { return row?.source ? [row.source] : []; }
  function finding(code, severity, title, detail, rows = [], extra = {}) { return { code, severity, title, detail, locations: rows.flatMap(location), recordIds: rows.map(r=>r.id).filter(Boolean), ...extra }; }
  function parseCSV(text) {
    text = String(text).replace(/^\ufeff/,''); if(text.length > 20*1024*1024) throw new Error('CSV exceeds 20 MB.');
    const rows = []; let cells=[], cell='', quoted=false, line=1, startLine=1;
    for(let i=0;i<text.length;i++) {
      const c=text[i];
      if(c==='"') { if(quoted && text[i+1]==='"') {cell+='"';i++;} else if(!quoted && cell.length) cell+=c; else quoted=!quoted; }
      else if(c===',' && !quoted) {cells.push(cell);cell='';}
      else if((c==='\n'||c==='\r') && !quoted) { if(c==='\r'&&text[i+1]==='\n')i++; cells.push(cell);rows.push({values:cells,line:startLine,row:rows.length+1});cells=[];cell='';line++;startLine=line; }
      else {cell+=c;if(c==='\n')line++;}
    }
    if(quoted) throw new Error('Unterminated quoted CSV field.');
    if(cell.length||cells.length) {cells.push(cell);rows.push({values:cells,line:startLine,row:rows.length+1});}
    return rows;
  }
  function inferKind(name, headers = []) {
    const n=norm(name.replace(/\.[^.]+$/,''));
    const aliases={project:['project','项目','项目信息'],requirements:['requirements','requirement','需求','放行要求'],evidence:['evidence','证据','dvp','dvpr','验证'],tasks:['tasks','task','任务','进度计划','schedule'],resources:['resources','资源'],pfmea:['pfmea','过程fmea'],controlPlan:['controlplan','cp','控制计划'],waivers:['waivers','waiver','豁免','偏差许可'],changes:['changes','ecn','变更']};
    for(const [kind,names] of Object.entries(aliases))if(names.some(v=>n===v||n.endsWith(v)))return kind;
    let best=null, score=0;
    for(const kind of TABLES) {const known=new Set(schema[kind].flatMap(k=>(fieldAliases[k]||[k]).map(norm)));const matched=headers.filter(h=>known.has(norm(h))).length; const specific=(kind==='pfmea'&&headers.some(h=>['failuremode','失效模式'].includes(norm(h))))||(kind==='controlPlan'&&headers.some(h=>['reactionplan','反应计划'].includes(norm(h))))||(kind==='tasks'&&headers.some(h=>['duration','工期','剩余工期'].includes(norm(h)))); const s=matched+(specific?10:0);if(s>score){score=s;best=kind;}}
    return score>=3?best:null;
  }
  function colName(index) {let s='';for(index++;index;index=Math.floor((index-1)/26))s=String.fromCharCode(65+(index-1)%26)+s;return s;}
  function mapTable(kind, matrix, source, customMap = {}) {
    if(!schema[kind]) throw new Error('Unknown table type: '+kind);
    const rows=matrix.map((r,i)=>Array.isArray(r)?{values:r,row:i+1,line:i+1}:r);
    let headerIndex=0, best=-1;
    const aliases=new Map();for(const key of schema[kind])for(const name of [key,...(fieldAliases[key]||[])])aliases.set(norm(name),key);
    for(let i=0;i<Math.min(rows.length,25);i++){const count=rows[i].values.filter(v=>aliases.has(norm(v))).length;if(count>best){best=count;headerIndex=i;}}
    const headers=rows[headerIndex]?.values.map(String)||[]; const mapping={}; const duplicateFields=[];
    headers.forEach((h,i)=>{const key=aliases.get(norm(h));if(key){if(mapping[key]!=null)duplicateFields.push(key);else mapping[key]=i;}});
    for(const [key,value] of Object.entries(customMap)){if(!schema[kind].includes(key))continue; const ix=typeof value==='number'?value:headers.indexOf(String(value));if(ix>=0)mapping[key]=ix;else delete mapping[key];}
    const missing=required[kind].filter(key=>mapping[key]==null);
    const findings=[];
    if(missing.length)findings.push(finding('MAPPING_REQUIRED','high','Required columns are not mapped',`${kind}: ${missing.join(', ')}. Review the column map before using these records.`,[{source}],{blocking:false}));
    const unresolvedDuplicates=duplicateFields.filter(key=>!Object.hasOwn(customMap,key));
    if(unresolvedDuplicates.length)findings.push(finding('AMBIGUOUS_COLUMNS','high','Several columns map to one field',unresolvedDuplicates.join(', '),[{source}],{blocking:false}));
    const records=[];
    for(const row of rows.slice(headerIndex+1)){
      if(!row.values.some(v=>String(v??'').trim()))continue;
      const item={source:{...source,row:row.row,line:row.line,raw:{},cells:{}}};
      for(const [key,ix]of Object.entries(mapping)){
        const raw=row.values[ix]??''; item.source.raw[key]=raw;item.source.cells[key]=colName(ix)+row.row;
        item[key]=dateFields.has(key)?toDate(raw):numericFields.has(key)?number(raw):listFields.has(key)?list(raw):['critical','approved','specialCharacteristic'].includes(key)?bool(raw):id(raw);
        if(kind==='evidence'&&key==='status')item[key]=evidenceStatus(raw);
      }
      records.push(item);
    }
    return {kind,records,findings,mapping:{headerRow:rows[headerIndex]?.row||1,headers,columns:mapping,missing,duplicates:unresolvedDuplicates,unmapped:headers.filter((h,i)=>!Object.values(mapping).includes(i))}};
  }
  function normalizeJSON(input, source = {file:'input.json'}) {
    if(!input||typeof input!=='object'||Array.isArray(input))throw new Error('Bundle must be a JSON object.');
    const out=blank();
    if(input.importFindings!=null){if(!Array.isArray(input.importFindings))throw new Error('importFindings must be an array.');for(const [i,f]of input.importFindings.entries()){if(!f||typeof f!=='object')throw new Error('Invalid persisted import finding.');out.importFindings.push(finding(id(f.code)||'DECLARED_IMPORT_LIMITATION',['critical','high','warning','info'].includes(f.severity)?f.severity:'high',id(f.title)||'Persisted import limitation',id(f.detail),[{source:{...source,pointer:`/importFindings/${i}`,declaredLocations:Array.isArray(f.locations)?f.locations:[]}}],{blocking:f.blocking===true,origin:'persisted input declaration; not authenticated'}));}}
    if(input.project&&typeof input.project==='object'&&!Array.isArray(input.project))out.project={...input.project,source:{...source,pointer:'/project'}};
    for(const kind of TABLES.filter(v=>v!=='project')){
      if(input[kind]!=null&&!Array.isArray(input[kind])){out.importFindings.push(finding('INVALID_TABLE','high','Expected an array',kind,[],{blocking:false}));continue;}
      out[kind]=(input[kind]||[]).map((r,i)=>{
        if(!r||typeof r!=='object'||Array.isArray(r)){out.importFindings.push(finding('INVALID_ROW','high','Expected a record object',`${kind}/${i}`,[],{blocking:false}));return {source:{...source,pointer:`/${kind}/${i}`}};}
        const item={source:{...source,pointer:`/${kind}/${i}`,declaredSource:r.source||null,raw:{}}};
        for(const key of schema[kind])if(r[key]!=null){item.source.raw[key]=r[key];item[key]=numericFields.has(key)?number(r[key]):listFields.has(key)?list(r[key]):['critical','approved','specialCharacteristic'].includes(key)?bool(r[key]):dateFields.has(key)?typeof r[key]==='number'?String(r[key]):toDate(r[key]):id(r[key]);}
        if(kind==='evidence'&&r.status!=null)item.status=evidenceStatus(r.status);
        return item;
      });
    }
    if(input.documents!=null&&!Array.isArray(input.documents))throw new Error('documents must be an array.');
    out.documents=(input.documents||[]).map((d,i)=>{if(!d||typeof d!=='object'||Array.isArray(d))throw new Error('Document entries must be objects.');return {id:d.id||'DOC-'+(i+1),name:d.name||source.file,text:String(d.text||''),page:d.page||null,line:d.line||null,source:{...source,pointer:`/documents/${i}`,declaredSource:d.source||null}};});
    out.reviews=Array.isArray(input.reviews)?input.reviews:[];
    return out;
  }
  function mergeBundles(base, incoming) {
    const out=structuredClone(base); const p=incoming.project||{};
    for(const [key,value]of Object.entries(p))if(key!=='source'&&value!==''&&value!=null){if(out.project[key]!=null&&out.project[key]!==''&&JSON.stringify(out.project[key])!==JSON.stringify(value))out.importFindings.push(finding('PROJECT_CONFLICT','high','Conflicting project metadata',`${key}: ${JSON.stringify(out.project[key])} vs ${JSON.stringify(value)}. Keep the first value until explicitly corrected.`,[out.project,p],{blocking:false}));else out.project[key]=value;}
    if(p.source&&!out.project.source)out.project.source=p.source;
    for(const kind of [...TABLES.filter(v=>v!=='project'),'documents','reviews','imports','importFindings'])out[kind].push(...(incoming[kind]||[]));
    return out;
  }
  function fromTable(parsed) {const out=blank();if(parsed.kind==='project'){if(parsed.records.length>1)out.importFindings.push(finding('MULTIPLE_PROJECTS','high','Project table contains multiple records','Import one project at a time.',parsed.records,{blocking:false}));out.project=parsed.records[0]||{};}else out[parsed.kind]=parsed.records;out.importFindings.push(...parsed.findings);return out;}
  function checkSchema(bundle) {
    const findings=[...(bundle.importFindings||[])];
    for(const kind of TABLES){const rows=kind==='project'?[bundle.project||{}]:(bundle[kind]||[]);const seen=new Map();
      for(const row of rows){if(row.id){if(seen.has(row.id))findings.push(finding('DUPLICATE_ID','high','Ambiguous duplicate identity',`${kind}: ${row.id}`, [seen.get(row.id),row],{blocking:false}));else seen.set(row.id,row);}
        const mandatory={evidence:['id','status','revision'],tasks:['id','duration'],resources:['id','capacity'],pfmea:['operationId','failureMode','severity'],controlPlan:['operationId','characteristic']}[kind]||[];
        const missingFields=mandatory.filter(key=>row[key]==null||row[key]==='');
        if(missingFields.length)findings.push(finding('INCOMPLETE_RECORD','high','A register row is incomplete',`${kind}: ${missingFields.join(', ')}`,[row],{blocking:false}));
        for(const [key,value]of Object.entries(row)){
          if(numericFields.has(key)&&value!=null&&value!==''&&(!Number.isFinite(number(value))))findings.push(finding('INVALID_NUMBER','high','Invalid numeric value',`${kind}.${key}: ${String(value)}`,[row],{blocking:false}));
          if(dateFields.has(key)&&value&&!validDate(String(value)))findings.push(finding('INVALID_DATE','high','Date must be an unambiguous ISO date',`${kind}.${key}: ${value}`,[row],{blocking:false}));
        }
      }
    }
    const p=bundle.project||{};for(const key of required.project)if(!id(p[key]))findings.push(finding('MISSING_PROJECT_FIELD','high','Project metadata incomplete',key,[p],{blocking:false}));
    if(p.gate&&!STAGES.includes(p.gate))findings.push(finding('UNKNOWN_GATE','high','Unknown gate',p.gate,[p],{blocking:false}));
    if(p.calendar&&!['business','calendar'].includes(p.calendar))findings.push(finding('UNKNOWN_CALENDAR','high','Unknown scheduling calendar',p.calendar,[p],{blocking:false}));
    if(list(p.holidays).some(d=>!validDate(d)))findings.push(finding('INVALID_HOLIDAY','high','A holiday is not a valid ISO date','Holiday inputs must be explicit YYYY-MM-DD dates.',[p],{blocking:false}));
    for(const r of bundle.requirements||[]){if(!r.id||!STAGES.includes(r.from)||typeof r.critical!=='boolean')findings.push(finding('INVALID_REQUIREMENT','high','Invalid release requirement','ID, recognized first gate and explicit critical boolean are required.',[r],{blocking:false}));}
    if(!(bundle.requirements||[]).length)findings.push(finding('UNDEFINED_REQUIREMENTS','high','Release completeness is unknown','Import an agreed requirements manifest before interpreting a GO recommendation.',[],{blocking:false}));
    else if(STAGES.includes(p.gate)&&!(bundle.requirements||[]).some(r=>STAGES.includes(r.from)&&STAGES.indexOf(r.from)<=STAGES.indexOf(p.gate)))findings.push(finding('NO_APPLICABLE_REQUIREMENTS','high','No agreed criterion applies to this gate','The supplied manifest cannot establish readiness at this gate.',[],{blocking:false}));
    return findings;
  }
  function assessEvidence(bundle) {
    const p=bundle.project||{}, gate=p.gate;const requirements=bundle.requirements||[], records=bundle.evidence||[], findings=[];const groups=new Map();
    records.forEach(r=>{if(!groups.has(r.id))groups.set(r.id,[]);groups.get(r.id).push(r);});
    const reqMap=new Map(requirements.map(r=>[r.id,r])); const cache=new Map();
    function inspect(req,trail=[]){
      if(cache.has(req.id))return cache.get(req.id);
      if(trail.includes(req.id))return {...req,disposition:'blocked',reason:'Circular evidence dependency.',code:'DEPENDENCY_CYCLE'};
      const copies=groups.get(req.id)||[], r=copies[0];let code='',reason='',waiver=null;
      if(copies.length!==1){code=copies.length?'DUPLICATE_EVIDENCE':'MISSING_EVIDENCE';reason=copies.length?'More than one record has this identity.':'Required evidence record is missing.';}
      if(r&&!code){
        const numeric=['value','min','max'].some(k=>r[k]!=null&&!Number.isFinite(number(r[k])));
        const missingMeasurement=(r.min!=null||r.max!=null)&&r.value==null;
        const outside=r.value!=null&&((r.min!=null&&number(r.value)<number(r.min))||(r.max!=null&&number(r.value)>number(r.max)));
        const invalidRange=r.min!=null&&r.max!=null&&number(r.min)>number(r.max);
        const changed=(bundle.changes||[]).some(c=>list(c.affectedEvidence).includes(req.id)&&norm(c.status)!=='approved');
        if(numeric||invalidRange){code='INVALID_ACCEPTANCE_DATA';reason='Numeric result or acceptance bounds are invalid.';}
        else if(missingMeasurement){code='MISSING_MEASUREMENT';reason='Acceptance limits are declared but no measured value is supplied.';}
        else if(outside){code='OUT_OF_SPEC';reason=`Observed value ${r.value} is outside the declared acceptance range.`;}
        else if(r.revision!==p.revision){code='REVISION_MISMATCH';reason='Evidence configuration does not match the selected project baseline.';}
        else if(changed){code='UNAPPROVED_CHANGE';reason='An affected change has no recorded approval; evidence must be reassessed.';}
        else {
          const dependencies=list(r.dependencies);const dependency=dependencies.map(key=>{const record=groups.get(key)?.[0];if(!record)return {disposition:'blocked',code:'MISSING_DEPENDENCY'};return inspect(reqMap.get(key)||{id:key,name:record.name,critical:true},[...trail,req.id]);}).find(d=>d.disposition!=='verified');
          if(dependency){code=dependency.code==='DEPENDENCY_CYCLE'?'DEPENDENCY_CYCLE':'DEPENDENCY_NOT_VERIFIED';reason='An upstream evidence item is missing, cyclic or unverified.';}
          else if(norm(r.status)==='verified'&&id(r.reviewer)&&!['unknown','na','none','tbd','待定','未知','reviewer'].includes(norm(r.reviewer))&&validDate(r.reviewedAt)&&validDate(p.asOf)&&r.reviewedAt<=p.asOf){return cacheResult({...req,...r,critical:req.critical,disposition:'verified',reason:'Declared independent review is complete on the current configuration.',code:''});}
          else {code=norm(r.status)==='rejected'?'REJECTED_EVIDENCE':'REVIEW_NOT_ACCEPTED';reason=norm(r.status)==='rejected'?'The evidence reports a failed acceptance.':'Evidence needs a declared reviewer, verified status and a non-future ISO review date.';
            if(req.critical===false&&norm(r.status)!=='verified'&&validDate(p.asOf)){
              const through=[p.asOf,p.gateDate,gate==='SOP'?p.sop:null].filter(validDate).sort().at(-1);
              waiver=(bundle.waivers||[]).find(w=>w.evidence===req.id&&w.approved===true&&id(w.authority)&&id(w.restriction)&&w.scope===p.scope&&list(w.allowedGates).includes(gate)&&validDate(w.signedAt)&&w.signedAt<=p.asOf&&validDate(w.expires)&&w.expires>=through)||null;
            }
          }
        }
      }
      if(waiver)return cacheResult({...req,...r,critical:req.critical,disposition:'conditional',reason:`${waiver.id}: ${waiver.restriction}`,code:'SCOPED_CONCESSION',waiver});
      return cacheResult({...req,...r,critical:req.critical,disposition:'blocked',reason,code});
    }
    function cacheResult(row){cache.set(row.id,row);return row;}
    const applicable=requirements.filter(r=>STAGES.includes(r.from)&&STAGES.indexOf(r.from)<=STAGES.indexOf(gate));
    const rows=applicable.map(r=>inspect(r));
    for(const row of rows)if(row.disposition!=='verified')findings.push(finding(row.code,row.disposition==='blocked'?'critical':'warning',row.name||row.id,row.reason,[row,reqMap.get(row.id)].filter(Boolean),{blocking:row.disposition==='blocked'}));
    return {rows,findings,blockers:rows.filter(r=>r.disposition==='blocked'),conditions:rows.filter(r=>r.disposition==='conditional'),verified:rows.filter(r=>r.disposition==='verified')};
  }
  const opId=v=>norm(String(v??'').replace(/^(?:operation|op|process\s*step|工序|工步)[\s:#._-]*/i,'')).replace(/^0+(?=\d)/,'');
  function crossCheck(bundle){
    const f=[];const pfmea=bundle.pfmea||[],cp=bundle.controlPlan||[];const weak=v=>/\bvisual\b|\bvisually\b|目视|肉眼/i.test(String(v));
    if((pfmea.length&&!cp.length)||(cp.length&&!pfmea.length))f.push(finding('MISSING_COMPANION_DOCUMENT','high','Cross-document review is incomplete','Provide both PFMEA and Control Plan for this review scope.',[...pfmea,...cp],{blocking:false}));
    for(const row of pfmea){
      const severity=number(row.severity);if(!Number.isInteger(severity)||severity<1||severity>10){f.push(finding('INVALID_SEVERITY','high','PFMEA severity is invalid','Expected an integer from 1 to 10.',[row],{blocking:false}));continue;}
      const operation=cp.filter(c=>opId(c.operationId)===opId(row.operationId));
      if(!operation.length){f.push(finding('UNMATCHED_PROCESS_STEP',severity>=9?'critical':'warning','PFMEA operation has no Control Plan row',String(row.operationId),[row],{blocking:severity>=9}));continue;}
      const characteristic=norm(row.characteristic);
      let matched=characteristic?operation.filter(c=>norm(c.characteristic)===characteristic):operation;
      if(characteristic&&!matched.length){f.push(finding('MISSING_CHARACTERISTIC_CONTROL','critical','Required characteristic has no matching control',row.characteristic,[row,...operation],{blocking:true}));continue;}
      if(!characteristic&&operation.length>1)f.push(finding('MATCH_REVIEW_REQUIRED','warning','Characteristic match is ambiguous','PFMEA row lacks a characteristic; inspect every candidate Control Plan row.',[row,...operation],{blocking:false}));
      for(const c of matched){
        const pair=[row,c];
        if(!id(c.method))f.push(finding('MISSING_CONTROL','critical','Control method is missing',String(c.characteristic),pair,{blocking:true}));
        if(bool(row.specialCharacteristic)===true&&bool(c.specialCharacteristic)!==true)f.push(finding('SPECIAL_CHARACTERISTIC_NOT_CONTROLLED','critical','Special characteristic is not carried into the Control Plan',String(c.characteristic),pair,{blocking:true}));
        if(!id(c.reactionPlan))f.push(finding('MISSING_REACTION_PLAN',severity>=9||bool(row.specialCharacteristic)===true?'critical':'warning','Reaction plan is missing',String(c.characteristic),pair,{blocking:severity>=9||bool(row.specialCharacteristic)===true}));
        if(!id(c.frequency))f.push(finding('MISSING_FREQUENCY','warning','Control frequency is missing',String(c.characteristic),pair,{blocking:false}));
        if(weak(c.method))f.push(finding('WEAK_DETECTION_METHOD','warning','Visual-only control requires engineering review',String(c.method),pair,{blocking:false}));
        if(severity>=9&&(weak(c.method)||!id(c.method)))f.push(finding('HIGH_SEVERITY_WEAK_CONTROL','warning','High-severity mode has weak or absent detection',String(row.failureMode),pair,{blocking:false}));
      }
    }
    for(const c of cp)if(!pfmea.some(r=>opId(r.operationId)===opId(c.operationId)))f.push(finding('CONTROL_WITHOUT_PFMEA','warning','Control Plan operation has no PFMEA counterpart',String(c.operationId),[c],{blocking:false}));
    return f;
  }
  function calendarFor(p){
    const business=p.calendar==='business';const holidays=new Set(list(p.holidays));
    const epoch=v=>Date.parse(v+'T00:00:00Z')/86400000;
    const iso=n=>new Date(n*86400000).toISOString().slice(0,10);
    const working=n=>!business||(![0,6].includes(new Date(n*86400000).getUTCDay())&&!holidays.has(iso(n)));
    function align(date){let n=epoch(date),guard=0;while(!working(n)&&guard++<4000)n++;return iso(n);}
    function add(date,days){let n=epoch(align(date));for(let i=0;i<days;i++){n++;let guard=0;while(!working(n)&&guard++<4000)n++;}return iso(n);}
    function distance(a,b){let n=epoch(a),end=epoch(b),count=0,guard=0;if(end<n)return -distance(b,a);while(n<end&&guard++<40000){if(working(n))count++;n++;}return count;}
    return {add,align,distance,epoch,iso,working};
  }
  function schedule(bundle,overrides={}){
    const p=bundle.project||{},issues=[],tasks=(bundle.tasks||[]).map(t=>({...t,...(overrides[t.id]||{})}));
    if(!tasks.length)return {available:false,valid:false,findings:[],tasks:[],reason:'No task network imported.'};
    if(!validDate(p.asOf)||!validDate(p.startDate)||!validDate(p.sop))return {available:true,valid:false,findings:[finding('SCHEDULE_DATES_REQUIRED','high','Schedule dates are incomplete','Provide valid startDate, asOf and sop.',[p],{blocking:false})],tasks:[]};
    const cal=calendarFor(p),byId=new Map(),indegree=new Map(),successors=new Map();
    const overrideFields=new Set(['duration','remainingDays','costPerDay','fixedCost','notBefore','units']);
    for(const[key,values]of Object.entries(overrides)){if(!(bundle.tasks||[]).some(t=>t.id===key))issues.push(finding('UNKNOWN_SCENARIO_TASK','high','Scenario names an unknown task',key,[],{blocking:false}));if(!values||typeof values!=='object'||Array.isArray(values)||Object.keys(values).some(k=>!overrideFields.has(k)))issues.push(finding('UNSUPPORTED_OVERRIDE','high','Unsupported scenario override',key,[],{blocking:false}));}
    for(const t of tasks){if(!t.id||byId.has(t.id)){issues.push(finding('DUPLICATE_TASK','high','Task identity is missing or duplicated',t.id||'(blank)',[t],{blocking:false}));continue;}byId.set(t.id,t);indegree.set(t.id,0);successors.set(t.id,[]);}
    for(const t of tasks){
      const duration=number(t.remainingDays??t.duration);t.days=duration;
      if(duration==null||!Number.isInteger(duration)||duration<0||duration>10000)issues.push(finding('INVALID_DURATION','high','Task duration is invalid',`${t.id}: nonnegative integer days required.`,[t],{blocking:false}));
      for(const key of ['costPerDay','fixedCost','units'])if(t[key]!=null&&(number(t[key])==null||!Number.isFinite(number(t[key]))||number(t[key])<0))issues.push(finding('INVALID_TASK_COST','high','Task cost or resource demand is invalid',`${t.id}.${key}`,[t],{blocking:false}));
      if(t.notBefore&&!validDate(t.notBefore))issues.push(finding('INVALID_NOT_BEFORE','high','Invalid task constraint date',t.id,[t],{blocking:false}));
      if(t.actualFinish&&(!validDate(t.actualFinish)||t.actualFinish>p.asOf))issues.push(finding('INVALID_ACTUAL_FINISH','high','Actual completion cannot be future or malformed',t.id,[t],{blocking:false}));
      if(t.actualFinish&&validDate(t.actualFinish)&&t.actualFinish<p.startDate)issues.push(finding('ACTUAL_BEFORE_PROJECT_START','high','Actual completion precedes the project start',t.id,[t],{blocking:false}));
      t.links=[];
      for(const raw of list(t.predecessors)){
        const match=/^(.+?)(?::FS\+(\d+))?$/.exec(raw), pred=match?.[1],lag=Number(match?.[2]||0);
        if(!match||/:/.test(pred)||!byId.has(pred)){issues.push(finding('MISSING_PREDECESSOR','high','Invalid or missing predecessor',`${t.id} ← ${raw}`,[t],{blocking:false}));continue;}
        t.links.push({id:pred,lag});indegree.set(t.id,(indegree.get(t.id)||0)+1);successors.get(pred).push({id:t.id,lag});
      }
    }
    if(issues.length)return {available:true,valid:false,findings:issues,tasks:[]};
    const queue=[...indegree].filter(([,n])=>n===0).map(([key])=>key).sort(),order=[];
    while(queue.length){const key=queue.shift();order.push(key);for(const s of successors.get(key)){indegree.set(s.id,indegree.get(s.id)-1);if(indegree.get(s.id)===0){queue.push(s.id);queue.sort();}}}
    if(order.length!==tasks.length)return {available:true,valid:false,findings:[finding('SCHEDULE_CYCLE','high','Task network contains a cycle','Remove cyclic dependencies before interpreting schedule or cost.',tasks,{blocking:false})],tasks:[]};
    const origin=cal.align(p.startDate),asOf=cal.align(p.asOf),current=cal.distance(origin,asOf);
    if(Math.abs(cal.epoch(p.sop)-cal.epoch(p.startDate))>36500||Math.abs(cal.epoch(p.asOf)-cal.epoch(p.startDate))>36500)return {available:true,valid:false,findings:[finding('SCHEDULE_HORIZON','high','Schedule horizon exceeds the supported range','Use a project horizon under 100 years.',[p],{blocking:false})],tasks:[]};
    for(const key of order){const t=byId.get(key);const predecessorFinish=Math.max(0,...t.links.map(l=>byId.get(l.id).ef+l.lag));
      if(t.actualFinish){t.ef=cal.distance(origin,t.actualFinish);t.es=Math.max(0,t.ef-number(t.duration||0));if(predecessorFinish>t.es)issues.push(finding('ACTUAL_PRECEDENCE_CONFLICT','high','Actual dates contradict task precedence',t.id,[t],{blocking:false}));}
      else {const constraint=t.notBefore?cal.distance(origin,cal.align(t.notBefore)):0;t.es=Math.max(0,current,constraint,predecessorFinish);t.ef=t.es+t.days;}
      t.start=cal.add(origin,t.es);t.finish=t.actualFinish||cal.add(origin,t.ef);
      if(t.ef>36500)return {available:true,valid:false,findings:[finding('SCHEDULE_HORIZON','high','Task chain exceeds the supported horizon',t.id,[t],{blocking:false})],tasks:[]};
    }
    const finishIndex=Math.max(...tasks.map(t=>t.ef));
    for(const key of [...order].reverse()){const t=byId.get(key),next=successors.get(key);t.lf=next.length?Math.min(...next.map(s=>byId.get(s.id).ls-s.lag)):finishIndex;t.ls=t.lf-(t.actualFinish?Math.max(0,t.ef-t.es):t.days);t.float=Math.max(0,t.ls-t.es);t.critical=t.float===0;}
    const finish=cal.add(origin,finishIndex),slipDays=Math.max(0,Math.round(cal.epoch(finish)-cal.epoch(p.sop))),remainingDays=Math.max(0,finishIndex-current);
    const financial=['budget','spent','overheadPerDay','delayCostPerDay'];for(const key of financial)if(p[key]!=null&&(!Number.isFinite(number(p[key]))||number(p[key])<0))issues.push(finding('INVALID_FINANCIAL_INPUT','high','Invalid financial input',key,[p],{blocking:false}));
    const direct=tasks.filter(t=>!t.actualFinish).reduce((sum,t)=>sum+t.days*number(t.costPerDay||0)+number(t.fixedCost||0),0), overhead=remainingDays*number(p.overheadPerDay||0),spent=number(p.spent||0),eac=spent+direct+overhead,delayExposure=slipDays*number(p.delayCostPerDay||0);
    const overloads=[];
    for(const resource of bundle.resources||[]){const capacity=number(resource.capacity);if(!Number.isFinite(capacity)||capacity<0){issues.push(finding('INVALID_RESOURCE_CAPACITY','high','Resource capacity is invalid',resource.id,[resource],{blocking:false}));continue;}
      const assigned=tasks.filter(t=>t.resource===resource.id&&!t.actualFinish&&t.ef>t.es);const points=[...new Set(assigned.flatMap(t=>[t.es,t.ef]))].sort((a,b)=>a-b);
      for(let i=0;i<points.length-1;i++){const active=assigned.filter(t=>t.es<points[i+1]&&t.ef>points[i]),demand=active.reduce((sum,t)=>sum+number(t.units??1),0);if(demand>capacity){const item={resource:resource.id,from:cal.add(origin,points[i]),to:cal.add(origin,points[i+1]),demand,capacity,tasks:active.map(t=>t.id)};overloads.push(item);issues.push(finding('RESOURCE_OVERLOAD','warning','Concurrent demand exceeds resource capacity',`${resource.id}: ${demand}/${capacity} units from ${item.from} to ${item.to}. Not automatically leveled.`,active,{blocking:false}));}}
    }
    for(const t of tasks)if(t.resource&&!(bundle.resources||[]).some(r=>r.id===t.resource))issues.push(finding('UNDEFINED_RESOURCE','warning','Task resource has no capacity definition',t.resource,[t],{blocking:false}));
    const financialAssumptions=financial.filter(key=>p[key]==null||p[key]==='');
    if(financialAssumptions.length)issues.push(finding('FINANCIAL_INPUT_ASSUMPTION','warning','Missing cost inputs default to zero',financialAssumptions.join(', ')+'. Complete before commercial use.',[p],{blocking:false}));
    return {available:true,valid:!issues.some(i=>i.severity==='high'),findings:issues,tasks:order.map(key=>byId.get(key)),finish,slipDays,remainingDays,critical:tasks.filter(t=>t.critical).map(t=>t.id),direct,remainingDirect:direct,overhead,remainingOverhead:overhead,spent,eac,budget:number(p.budget||0),variance:eac-number(p.budget||0),budgetVariance:eac-number(p.budget||0),criticalTasks:tasks.filter(t=>t.critical).map(t=>t.id),totalFloat:Object.fromEntries(tasks.map(t=>[t.id,t.float])),financialAssumptions,delayExposure,overloads,calendar:p.calendar==='business'?'business':'calendar',totalFloatMeaning:'Network float to the forecast finish; calendar slip is measured against SOP. Resource overload is reported, not leveled.'};
  }
  function analyze(bundle,overrides={}){
    const schemaFindings=checkSchema(bundle),evidence=assessEvidence(bundle),quality=crossCheck(bundle),plan=schedule(bundle,overrides),findings=[...schemaFindings,...evidence.findings,...quality,...plan.findings];
    const knownBlocker=findings.some(f=>f.blocking===true);const incomplete=schemaFindings.some(f=>f.severity==='high'||f.severity==='critical')||quality.some(f=>['INVALID_SEVERITY','MATCH_REVIEW_REQUIRED'].includes(f.code))||(plan.available&&!plan.valid);
    const status=knownBlocker?'HOLD':incomplete||quality.some(f=>f.code==='MISSING_COMPANION_DOCUMENT')?'REVIEW_REQUIRED':evidence.conditions.length?'CONDITIONAL':'GO';
    const priority={critical:0,high:1,warning:2,info:3};findings.sort((a,b)=>(priority[a.severity]??4)-(priority[b.severity]??4));
    return {version:'3.0.0',status,project:bundle.project,evidence,plan,findings,counts:{critical:findings.filter(f=>f.severity==='critical').length,high:findings.filter(f=>f.severity==='high').length,warning:findings.filter(f=>f.severity==='warning').length},releaseAuthority:'Recommendation only. Review identities and approvals are declared input, not authenticated signatures.'};
  }
  function search(bundle,query,limit=8){
    const tokens=String(query).toLowerCase().match(/[\p{L}\p{N}_-]+/gu)||[];if(!tokens.length)return[];const chunks=[];
    for(const doc of bundle.documents||[]){const lines=String(doc.text||'').split(/\r?\n/);for(let i=0;i<lines.length;i+=5){const text=lines.slice(i,i+7).join('\n');chunks.push({text,source:{...doc.source,page:doc.page||doc.source?.page,line:(doc.line||1)+i},kind:'document',id:doc.id,name:doc.name});}}
    for(const type of ['evidence','requirements','pfmea','controlPlan','changes','tasks'])for(const row of bundle[type]||[])chunks.push({text:Object.entries(row).filter(([k])=>k!=='source').map(([k,v])=>`${k}: ${Array.isArray(v)?v.join('; '):v}`).join('\n'),source:row.source||{file:'declared input'},kind:type,id:row.id||row.operationId,name:row.name||row.failureMode||row.characteristic||row.id});
    return chunks.map(c=>({...c,score:tokens.reduce((sum,t)=>sum+(c.text.toLowerCase().includes(t)?1:0)+(String(c.id).toLowerCase()===t?3:0),0)})).filter(c=>c.score>0).sort((a,b)=>b.score-a.score).slice(0,limit);
  }
  const api={STAGES,TABLES,schema,required,fieldAliases,norm,id,list,bool,number,validDate,blank,parseCSV,inferKind,mapTable,normalizeJSON,mergeBundles,fromTable,checkSchema,assessEvidence,crossCheck,schedule,analyze,search,finding};
  if(typeof module==='object'&&module.exports)module.exports=api;else root.WorkbenchCore=api;
})(typeof globalThis!=='undefined'?globalThis:this);
