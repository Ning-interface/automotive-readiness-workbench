(function(root){
  'use strict';
  const W=typeof module==='object'&&module.exports?require('./workbench-core.js'):root.WorkbenchCore;
  // JSON must not silently turn an invalid numeric input (NaN/Infinity) into an absent limit.
  const stringify=value=>JSON.stringify(value,(_key,v)=>typeof v==='number'&&!Number.isFinite(v)?'#INVALID_NUMERIC_INPUT':v,2);
  function sheetRows(X,sheet){const range=X.utils.decode_range(sheet['!ref']||'A1');if(range.e.r>=50000||range.e.c>=200)throw new Error('Worksheet exceeds supported 50,000 rows / 200 columns. Partial import is not allowed.');const out=[];for(let r=0;r<=Math.min(range.e.r,50000);r++){const values=[];for(let c=0;c<=Math.min(range.e.c,200);c++){const cell=sheet[X.utils.encode_cell({r,c})];values.push(cell?cell.t==='d'?cell.v.toISOString().slice(0,10):cell.f?'='+cell.f:cell.v:'');}out.push({values,row:r+1,line:r+1});}return out;}
  function extractedEnvelope(envelope){return {name:envelope.source.file,sha256:envelope.source.sha256,tables:(envelope.tables||[]).map(t=>({...t,rows:t.rows.map((r,i)=>Array.isArray(r)?{values:r,row:i+1,line:i+1}:r),kind:W.inferKind(t.name,Array.isArray(t.rows[0])?t.rows[0]:t.rows[0]?.values||[]),mapping:{}})),documents:envelope.documents||[],warnings:envelope.warnings||[],bundle:envelope.bundle||null,source:envelope.source};}
  function parse(name,bytes,sha256,XLSX){
    const text=()=>new TextDecoder('utf-8',{fatal:true}).decode(bytes).replace(/^\ufeff/,'');const source={file:name,sha256};const file={name,sha256,tables:[],documents:[],warnings:[],source};
    const ext=name.split('.').pop().toLowerCase();
    if(ext==='json'){const raw=JSON.parse(text());if(raw.source&&Array.isArray(raw.tables)&&Array.isArray(raw.documents))return extractedEnvelope(raw);if(raw.format==='automotive-readiness-workspace-v1'){if(!Array.isArray(raw.files)||!raw.bundle)throw new Error('Invalid workspace snapshot');file.session=raw;file.bundle=raw.bundle;file.warnings.push('Restored local workspace; stored reviews and hashes are unauthenticated declarations.');}else file.bundle=raw;}
    else if(ext==='csv'){const rows=W.parseCSV(text());file.tables=[{name:name.replace(/\.csv$/i,''),rows,kind:W.inferKind(name,rows[0]?.values||[]),mapping:{},source}];}
    else if(ext==='xlsx'){
      if(!XLSX)throw new Error('The bundled XLSX reader is unavailable. Use the local extraction CLI.');
      const book=XLSX.read(bytes,{type:'array',cellDates:true,cellFormula:true});
      for(const name of book.SheetNames){const rows=sheetRows(XLSX,book.Sheets[name]);file.tables.push({name,rows,kind:W.inferKind(name,rows[0]?.values||[]),mapping:{},source:{...source,sheet:name}});if(rows.some(r=>r.values.some(v=>typeof v==='string'&&v.startsWith('='))))file.warnings.push(`${name}: formulas are retained as data, not evaluated.`);}
    }else if(['txt','md'].includes(ext))file.documents=[{id:name,name,text:text(),line:1,source}];
    else throw new Error(`${ext.toUpperCase()} requires the local PDF/DOCX extraction service or tools/extract.py. Import its extracted JSON output here.`);
    return file;
  }
  function assemble(files,projectOverrides={}){
    let bundle=W.blank();const mappings=[];
    for(const file of files){
      if(file.bundle)bundle=W.mergeBundles(bundle,W.normalizeJSON(file.bundle,file.source));
      for(let index=0;index<file.tables.length;index++){
        const table=file.tables[index];if(table.kind==='ignore'){mappings.push({file:file.name,index,table,parsed:null});continue;}if(!table.kind){bundle.importFindings.push(W.finding('UNCLASSIFIED_TABLE','high','Table needs a confirmed type',`${file.name} / ${table.name}`,[{source:table.source||{...file.source,sheet:table.name}}],{blocking:false}));mappings.push({file:file.name,index,table,parsed:null});continue;}
        const parsed=W.mapTable(table.kind,table.rows,table.source||{...file.source,sheet:table.name},table.mapping);bundle=W.mergeBundles(bundle,W.fromTable(parsed));mappings.push({file:file.name,index,table,parsed});
      }
      bundle.documents.push(...file.documents);
      for(const warning of file.warnings||[])bundle.importFindings.push(W.finding('SOURCE_EXTRACTION_WARNING','warning','Source extraction limitation',warning,[{source:file.source}],{blocking:false}));
      bundle.imports.push({file:file.name,sha256:file.sha256,tables:file.tables.length,documents:file.documents.length,warnings:file.warnings});
    }
    bundle.project={...bundle.project,...projectOverrides};
    return {bundle,mappings};
  }
  const api={parse,assemble,extractedEnvelope,sheetRows,stringify};if(typeof module==='object'&&module.exports)module.exports=api;else root.WorkbenchImport=api;
})(typeof globalThis!=='undefined'?globalThis:this);
