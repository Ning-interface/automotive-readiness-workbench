from pathlib import Path
import hashlib
import json
import os
import subprocess
import sys

root=Path(__file__).parent.resolve()
workspace=root.parent.parent
node=Path('C:/Users/Admin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe')
env={**os.environ,'WORKBENCH_PYTHON':sys.executable}
packages={
 'deliverable':workspace/'outputs/v3/automotive-readiness-review',
 'isolated-copy':root/'isolated-skill',
}
specs=[
 ('csv-pdf',['project.csv','requirements.csv','evidence.csv','tasks.csv','evidence.pdf'],'FORWARD','GO'),
 ('structured-docx',['project-no-evidence.json','structured-evidence.docx'],'Pressure','GO'),
 ('ambiguous-docx',['valid.json','evidence.docx'],'FORWARD','REVIEW_REQUIRED'),
]
results=[]
for package_name,package in packages.items():
    for name,files,query,status in specs:
        out=root/'packaged'/package_name/name
        args=[str(node),str(package/'scripts/cli.js')]
        for file in files:
            args.extend(['--file',str(root/file)])
        args.extend(['--out',str(out),'--query',query])
        done=subprocess.run(args,cwd=root,env=env,capture_output=True,text=True)
        result={'package':package_name,'case':name,'cwd':str(root),'command':args,'exit':done.returncode,'stdout':done.stdout,'stderr':done.stderr,'checks':{'success':done.returncode==0}}
        if done.returncode==0:
            analysis=json.loads((out/'analysis.json').read_text(encoding='utf-8'))
            retrieval=json.loads((out/'retrieval.json').read_text(encoding='utf-8'))
            result['checks'].update({'status':analysis['status']==status,'eac':analysis['plan']['eac']==2050,'finish':analysis['plan']['finish']=='2026-10-18','all_retrieval_hashes':all(r['source']['sha256']==hashlib.sha256((root/r['source']['file']).read_bytes()).hexdigest() for r in retrieval)})
            result['status']=analysis['status']
            result['retrieval']=retrieval
            if name=='csv-pdf':
                pdf=[r for r in retrieval if r['source']['file']=='evidence.pdf']
                result['checks']['literal_pdf_pages']=set(r['source'].get('page') for r in pdf)=={1,2} and any('FORWARD PDF PAGE TWO: EV-02 independent evidence remains open.' in r['text'] for r in pdf)
            elif name=='structured-docx':
                source=analysis['evidence']['rows'][0]['source']
                result['checks']['structured_docx_source']=source.get('file')=='structured-evidence.docx' and source.get('table')==1 and source.get('row')==2 and source.get('sha256')==hashlib.sha256((root/'structured-evidence.docx').read_bytes()).hexdigest()
            else:
                findings=[f for f in analysis['findings'] if f['code']=='UNCLASSIFIED_TABLE']
                result['checks']['ambiguous_table_cited']=bool(findings) and all(any(loc.get('file')=='evidence.docx' and loc.get('table')==1 and loc.get('sha256')==hashlib.sha256((root/'evidence.docx').read_bytes()).hexdigest() for loc in f.get('locations',[])) for f in findings)
        result['pass']=all(result['checks'].values())
        results.append(result)
        print(package_name,name,'PASS' if result['pass'] else 'FAIL')
report={'kind':'Independent automated forward validation; synthetic data, not practitioner review','results':results,'all_pass':all(r['pass'] for r in results),'runtime_note':'Node and Python are provided runtimes. Python pypdf/python-docx are external declared dependencies; all JS/import/report/extractor source is inside the copied Skill.'}
(root/'packaged-skill-results.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
print('Passed',sum(r['pass'] for r in results),'of',len(results))
