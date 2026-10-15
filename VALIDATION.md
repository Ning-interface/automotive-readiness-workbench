# Release validation · v3 · 2026-10-15

These are small synthetic software tests, not industry certification, human expert validation or production accuracy estimates. Actual raw results and initial failures are retained in the delivery's validation directory.

## Evidence classes

| Class | Observed result | Interpretation |
| --- | --- | --- |
| Implementation/regression tests | 78/78 pass, including offline bundle execution, real XLSX, real PDF/DOCX CLI, HTTP boundary, mappings, citations, gate checks, CPM, cost and workspace restoration | Author-maintained tests; not independent approval |
| Independent AI round 1, 18 frozen cases | Initial raw 1/18; release raw 2/18; separate independent semantic adjudication accepts 18/18 | Generic diagnostic labels and two permitted conservative-status differences cause raw mismatches; do not claim raw 18/18 |
| Independent AI round 2, 16 new frozen cases | First blind run 15/16; repaired regression and release rerun 16/16 | One genuine waiver-expiry defect found and fixed; rerun is not a new blind pass |
| Independent real-file forward tests | 10 cases pass | CSV/JSON/PDF/DOCX CLI, hand-calculated finish/EAC, literal source citations, malformed inputs, OCR warnings and instruction-like document text |
| Independent packaged Skill tests | 6 cases pass | Invoked outside project root and from an isolated copied Skill; declared Node/Python dependencies remain necessary |
| Skill structural validator | Pass | Bundled skill-creator quick_validate.py; PyYAML installed only into work-local validation dependencies |
| Actual engineering-practitioner review | Pending | No invented reviewers or industry acceptance |
| Real-browser visual/layout QA | Not completed | Local preview was inaccessible to browser automation; DOM/template tests do not substitute for visual verification |

## Reproducible candidate

Final deterministic engine SHA256:

`71ccdcd4def824dedced06df614080c6eabbbf9020dbe2a6bc8eba5356f4479d`

Round 1 frozen fixture SHA256:

`4bf3510bb56ff3545859200ae1d31117269ebbf365cce85c2dd11b7ccd24c132`

Round 2 frozen fixture SHA256:

`393e38c65aeb1ef3dfac7c9318c2ccb63f81161153b7fb77152d6d24e936c2e2`

Both fixture suites and expected outcomes remained unchanged after their respective freezes. Initial, intermediate regression and final release artifacts are separate. Independent authors did not inspect engine implementation; they did read the public input contract. Generic-label adjudication is qualitative AI judgment, not additional independent human evidence. Newly added normalized-reimport and malformed-document hardening is covered by author-maintained regression tests, not these frozen holdouts.

## Proven findings repaired during testing

- DOCX raw-array tables were mistaken for a header-values function, failing import despite successful extraction. Parser repaired; real-file and unit regression added.
- OCR/no-text extraction limits were only visible in import metadata. They now appear as source-cited findings in JSON/MD/HTML reports.
- Unknown DOCX tables named the file but omitted structured source locations. Findings now cite the actual table and hash.
- A waiver could expire before known SOP while covering assessment day. SOP now requires coverage through the later of assessment, explicit gate date and known SOP target.
- Complete-workspace restore retains files/mappings/scenarios/reviews. Normalized interchange retains unresolved import limitations instead of silently clearing them. Malformed bundles are rejected without corrupting the active workspace.

## Re-run

Node 24.19.0 and Python 3.12 were used in this environment. Tests requiring document extraction need pypdf/python-docx; fixtures are synthetic. Existing upstream XLSX regression fixture is retained with its MIT license. No generated workbook is being passed off as a real client workbook.

```sh
node --test engine.test.js workbench.test.js render.test.js server.test.js cli.test.js
node evaluate-suite.js path/to/round2/cases.json path/to/new-results.json
```

Set PORTFOLIO_OFFLINE_HTML to the release HTML path to also run the packaged application test. Without this variable that one test is explicitly skipped. The reported 78/78 release run includes it, with zero skips. The minimal DOM harness checks templates and event wiring, not CSS, browser layout, accessibility conformance or browser-specific file handling. HTTP tests run a real same-process localhost server; CLI tests parse real PDF/DOCX bytes.

## Still outside the validated scope

Actual OEM/customer applicability; licensed normative FMEA AP calculations; OCR; semantic RAG; automatic resource leveling; enterprise data integrations; authenticated identities, signatures or tamper-proof audit; real industrial error rates/time savings. A user-entered reviewer name is not an authenticated approval. Lexical retrieval cannot establish technical truth or prove absence of evidence.

Use the in-app ledger for real practitioners to record dataset-bound findings, disagreement, manual/assisted review minutes, missed critical issues and false alarms. No fabricated industry reviewer, managerial seniority or company deployment claim is included.
