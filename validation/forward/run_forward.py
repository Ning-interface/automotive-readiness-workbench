from pathlib import Path
import hashlib
import json
import os
import subprocess
import sys

root=Path(__file__).parent.resolve()
repo=root.parent/'automotive-interface-workflow-toolkit'
node=Path('C:/Users/Admin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe')
env={**os.environ,'WORKBENCH_PYTHON':sys.executable}
specs=[
 ('json',['valid.json'],[],0,'GO'),
 ('csv',['project.csv','requirements.csv','evidence.csv','tasks.csv'],[],0,'GO'),
 ('docs',['valid.json','evidence.pdf','evidence.docx'],['--query','FORWARD'],0,'REVIEW_REQUIRED'),
 ('structured-docx',['project-no-evidence.json','structured-evidence.docx'],['--query','Pressure'],0,'GO'),
 ('open-docs',['open.json','evidence.pdf','evidence.docx'],['--query','IGNORE'],0,'HOLD'),
 ('paragraph-docx',['open.json','paragraph-only.docx'],['--query','THIRD'],0,'HOLD'),
 ('image-only',['valid.json','image-only.pdf'],[],0,'GO'),
 ('invalid',['invalid.json'],[],0,'HOLD'),
 ('malformed-json',['malformed.json'],[],-1,None),
 ('malformed-csv',['evidence-malformed.csv'],['--kind','evidence'],-1,None),
]
results=[]
for name,files,options,expected_exit,expected_status in specs:
    out=root/'final'/name
    args=[str(node),'cli.js']
    for file in files:
        args.extend(['--file',str(root/file)])
    args.extend(['--out',str(out),*options])
    done=subprocess.run(args,cwd=repo,env=env,capture_output=True,text=True)
    item={'case':name,'command':args,'exit':done.returncode,'stdout':done.stdout,'stderr':done.stderr,
          'checks':{'expected_exit':(done.returncode!=0 if expected_exit==-1 else done.returncode==expected_exit)}}
    if done.returncode==0:
        analysis=json.loads((out/'analysis.json').read_text(encoding='utf-8'))
        item['status']=analysis['status']
        item['checks']['expected_status']=analysis['status']==expected_status
        item['findings']=[{'code':f['code'],'severity':f['severity'],'locations':f.get('locations',[])} for f in analysis['findings']]
        plan=analysis.get('plan',{})
        item['plan']={k:plan.get(k) for k in ['valid','finish','eac','remainingDirect','remainingOverhead','totalFloat','delayExposure']}
        if name in ('json','csv','structured-docx'):
            item['checks']['hand_calculated_schedule_and_cost']=plan.get('finish')=='2026-10-18' and plan.get('eac')==2050
        if name=='invalid':
            codes={f['code'] for f in analysis['findings']}
            item['checks']['bad_numbers_and_duration_visible']={'INVALID_ACCEPTANCE_DATA','INVALID_NUMBER','INVALID_DURATION'}<=codes
            item['checks']['invalid_schedule_suppressed']=not plan.get('valid') and plan.get('finish') is None
        if name=='image-only':
            item['checks']['ocr_limit_in_all_reports']=all('OCR/manual review required' in (out/file).read_text(encoding='utf-8') for file in ['analysis.json','review.md','review.html'])
        if name in ('docs','open-docs','paragraph-docx','structured-docx'):
            retrieval=json.loads((out/'retrieval.json').read_text(encoding='utf-8'))
            item['retrieval']=retrieval
            item['checks']['retrieval_hashes_match_actual_files']=all(r['source']['sha256']==hashlib.sha256((root/r['source']['file']).read_bytes()).hexdigest() for r in retrieval)
            if name=='docs':
                item['checks']['two_pdf_pages_and_docx_table_found']=set(r['source'].get('page') for r in retrieval if r['source']['file']=='evidence.pdf')=={1,2} and any(r['source'].get('table')==1 for r in retrieval)
                unclassified=[f for f in analysis['findings'] if f['code']=='UNCLASSIFIED_TABLE']
                item['checks']['ambiguous_docx_finding_cites_original_table']=bool(unclassified) and all(any(loc.get('file')=='evidence.docx' and loc.get('table')==1 and loc.get('sha256')==hashlib.sha256((root/'evidence.docx').read_bytes()).hexdigest() for loc in f.get('locations',[])) for f in unclassified)
    item['pass']=all(item['checks'].values())
    results.append(item)
    print(name,done.returncode,item.get('status','rejected'),'PASS' if item['pass'] else 'FAIL')
report={'kind':'Independent automated forward test; synthetic data, no human expert validation','results':results,'all_expected_checks_pass':all(r['pass'] for r in results)}
(root/'forward-results.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
print('Expected behavior checks:',sum(r['pass'] for r in results),'/',len(results))
