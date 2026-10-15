'use strict';
// Release builder: generated deliverables remain separate from authoritative source.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
function copy(from,to){fs.mkdirSync(path.dirname(to),{recursive:true});fs.cpSync(from,to,{recursive:true});}
function build(output){
  const src=__dirname,skill=path.join(src,'skills/automotive-readiness-review');
  for(const name of ['cli.js','workbench-core.js','file-import.js','workbench-report.js'])copy(path.join(src,name),path.join(skill,'scripts',name));
  for(const name of ['vendor','tools','third-party'])copy(path.join(src,name),path.join(skill,'scripts',name));
  for(const name of ['IMPORT-CONTRACT.md','THIRD_PARTY_NOTICES.md'])copy(path.join(src,name),path.join(skill,'references',name==='IMPORT-CONTRACT.md'?'input-contract.md':name));
  const manifest={schema:'packaged-skill-integrity-v1',algorithm:'SHA256',files:{}};
  function hashes(dir,prefix=''){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const key=prefix+entry.name;if(entry.isDirectory())hashes(path.join(dir,entry.name),key+'/');else if(!key.endsWith('integrity-manifest.json'))manifest.files[key]=crypto.createHash('sha256').update(fs.readFileSync(path.join(dir,entry.name))).digest('hex');}}
  hashes(skill);fs.writeFileSync(path.join(skill,'integrity-manifest.json'),JSON.stringify(manifest,null,2));
  fs.mkdirSync(output,{recursive:true});const target=path.join(output,'github-pages-source');
  const sourceFiles=['index.html','styles.css','workbench.css','data.js','engine.js','app.js','workbench-core.js','file-import.js','workbench-sample.js','workbench-report.js','workbench-ui.js','validation-results.js','cli.js','server.js','README.md','IMPORT-CONTRACT.md','THIRD_PARTY_NOTICES.md','VALIDATION.md','package.json','package-output.js','engine.test.js','workbench.test.js','render.test.js','server.test.js','cli.test.js','evaluate-suite.js','.gitignore'];
  for(const name of [...sourceFiles,'vendor','tools','third-party','test-fixtures','validation','skills'])copy(path.join(src,name),path.join(target,name));
  copy(skill,path.join(output,'automotive-readiness-review'));
  fs.writeFileSync(path.join(output,'program-input-example.json'),JSON.stringify(require('./workbench-sample.js').sample(),null,2));
  let html=fs.readFileSync(path.join(src,'index.html'),'utf8');
  html=html.replace(/<link rel="stylesheet" href="([^"]+)">/g,(_,file)=>'<style>\n'+fs.readFileSync(path.join(src,file),'utf8').replace(/@import\s+url\([^;]+;/g,'')+'\n</style>');
  const scripts=[];
  html=html.replace(/<script src="([^"]+)" defer><\/script>/g,(_,file)=>{scripts.push('<script>\n'+fs.readFileSync(path.join(src,file),'utf8').replace(/<\/script/gi,'<\\/script')+'\n</script>');return '';});
  html=html.replace('</body>',()=>scripts.join('\n')+'\n</body>');
  html+='\n<!-- Bundled SheetJS Community Edition 0.20.3 license:\n'+fs.readFileSync(path.join(src,'vendor/SHEETJS-LICENSE.txt'),'utf8').replace(/-->/g,'-- >')+'\n-->\n';
  fs.writeFileSync(path.join(output,'Automotive-Readiness-Workbench-v3.html'),html);
  for(const name of ['README.md','IMPORT-CONTRACT.md','THIRD_PARTY_NOTICES.md','VALIDATION.md'])copy(path.join(src,name),path.join(output,name));
  console.log(JSON.stringify({sourceDirectory:target,offlineHtml:path.join(output,'Automotive-Readiness-Workbench-v3.html'),skillDirectory:path.join(output,'automotive-readiness-review'),sourceFiles:sourceFiles.length},null,2));
}
if(require.main===module){if(!process.argv[2])throw Error('Provide output directory');build(path.resolve(process.argv[2]));}
module.exports={build};
