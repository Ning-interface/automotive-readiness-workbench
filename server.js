'use strict';
const http=require('node:http'),fs=require('node:fs/promises'),path=require('node:path'),cp=require('node:child_process');
const {pythonExecutable}=require('./cli.js');
const root=__dirname;
function createServer(){return http.createServer(async(req,res)=>{
  const json=(status,body)=>{res.writeHead(status,{'Content-Type':'application/json;charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(body));};
  try{
    const host=req.headers.host||'';
    if(!/^(127\.0\.0\.1|localhost)(:\d+)?$/.test(host)){json(403,{error:'Local host only'});return;}
    const url=new URL(req.url,'http://'+host);
    if(url.pathname==='/api/health'){json(200,{status:'ok',mode:'local',cloudAI:false});return;}
    if(url.pathname==='/api/extract'){
      if(req.method!=='POST'){json(405,{error:'POST required'});return;}
      if(req.headers.origin!=='http://'+host){json(403,{error:'Same-origin local requests only'});return;}
      if(!String(req.headers['content-type']||'').startsWith('application/json')){json(415,{error:'JSON required'});return;}
      let size=0;const chunks=[];
      for await(const chunk of req){size+=chunk.length;if(size>29*1024*1024){json(413,{error:'Request exceeds size limit'});return;}chunks.push(chunk);}
      const request=JSON.parse(Buffer.concat(chunks).toString('utf8'));
      if(typeof request.filename!=='string'||!request.contentBase64||!(/\.(pdf|docx|xlsx)$/i.test(request.filename))){json(400,{error:'A PDF, DOCX or XLSX file payload is required'});return;}
      const child=cp.execFile(pythonExecutable(),[path.join(root,'tools/extract.py'),'--stdin-json'],{encoding:'utf8',maxBuffer:40*1024*1024,timeout:60000},(error,stdout,stderr)=>{if(error){json(422,{error:(stderr||error.message).slice(0,1500)});return;}try{json(200,JSON.parse(stdout));}catch{json(500,{error:'Extractor returned invalid JSON'});}});
      child.stdin.end(JSON.stringify({filename:path.basename(request.filename),contentBase64:request.contentBase64}));return;
    }
    if(!['GET','HEAD'].includes(req.method)){json(405,{error:'Read-only static server'});return;}
    const decoded=decodeURIComponent(url.pathname),parts=decoded.split(/[\\/]/);
    if(parts.some(p=>p.startsWith('.')||p==='node_modules')){json(403,{error:'Hidden/internal path is not served'});return;}
    const file=path.resolve(root,'.'+(decoded==='/'?'/index.html':decoded));
    if(!file.startsWith(root+path.sep)||!['.html','.js','.css','.json','.md','.txt'].includes(path.extname(file))){json(404,{error:'Not found'});return;}
    let bytes;try{bytes=await fs.readFile(file);}catch{json(404,{error:'Not found'});return;}
    const type={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.md':'text/plain','.txt':'text/plain'}[path.extname(file)];
    res.writeHead(200,{'Content-Type':type+';charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer'});res.end(req.method==='HEAD'?undefined:bytes);
  }catch(error){json(400,{error:error.message});}
});}
if(require.main===module){const port=Number(process.env.PORT||8766);createServer().listen(port,'127.0.0.1',()=>console.log('Local: http://127.0.0.1:'+port));}
module.exports={createServer};
