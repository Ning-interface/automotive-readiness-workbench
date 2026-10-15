# Automotive Readiness Workbench · v3

[Live workbench](https://ning-interface.github.io/automotive-readiness-workbench/) · [Validation evidence](VALIDATION.md) · [Tool-backed Skill](skills/automotive-readiness-review/SKILL.md)

A local, file-driven automotive program review tool and reusable tool-backed AI Skill. Independently authored by Ning . The original reference playbook remains available; it is explicitly synthetic, not a claimed CATL or VW delivery.

## What changed

1. Real inputs: CSV, JSON and XLSX parsing, Chinese/English header aliases, leading-header discovery, explicit mapping, source values and locations. PDF/DOCX text and tables through a local Python extractor. Extracted text never automatically becomes approved evidence.
2. Calculated exposure: finish-to-start dependencies, lags, critical tasks, float, business/calendar days and holidays, remaining costs, EAC, budget variance and separate delay exposure. Scenarios propagate without overwriting baseline. Resource overload is detected, not leveled.
3. Inspectable validation: unit/integration tests, frozen independent AI holdouts, retained initial failures and a review ledger bound to dataset hashes. Actual industry-practitioner validation remains pending.

## Start

Node.js 20+ is recommended; release tests ran on Node.js 24. No npm installation is required: the browser XLSX reader is vendored with its license.

```sh
node server.js
```

Open http://127.0.0.1:8766. The server binds only to localhost. CSV/JSON/XLSX are parsed in-browser. PDF/DOCX use the same-origin local extraction endpoint, not a cloud upload. Python needs pypdf and python-docx; the standalone Python XLSX extractor additionally needs openpyxl. Set WORKBENCH_PYTHON to select Python. Runtime installation is the user's responsibility; a Codex bundled runtime is autodetected when present.

The single-file offline HTML supports CSV/JSON/XLSX/TXT/MD directly. For PDF/DOCX, start the local server or run the extractor and import its JSON. Scanned PDFs need external OCR/manual review; there is no built-in OCR.

```sh
python tools/extract.py validation.pdf --out extracted-validation.json
node cli.js --file project.json --file evidence.xlsx --file validation.pdf --out review-output --query "seal EV-02"
node cli.js --file project.json --out scenario-review --scenario overrides.json
node --test engine.test.js workbench.test.js render.test.js server.test.js cli.test.js
```

The CLI exports normalized data, mapping review, computed analysis, literal retrieval, and MD/HTML reports. `--mapping mapping.json` accepts entries keyed by `filename/sheet` or sheet name, with `{ "kind": "evidence", "columns": { "id": 0 } }`. Column indices are zero-based; -1 deliberately disables automatic mapping.

## Use the workbench

- Import one table per register, then inspect every table type and required-column mapping. Unknown tables require classification or an explicit Ignore decision.
- Provide project scope, dates, revision and an applicable requirements manifest. Missing requirements never yield GO. All applicable requirements are mandatory; critical controls concession eligibility.
- Enter acceptance limits and actual results. A numeric failure overrides a typed verified label. Declared reviewers and dates are inputs, not authenticated signatures.
- Change task durations/costs in Readiness analysis; inspect propagated dates, the cost bridge and baseline comparison.
- Search literal cited excerpts. No semantic/LLM retrieval, generated root cause or cloud model is embedded.
- Save a complete workspace to retain parsed source records, mappings, project/task overrides, activity and declared reviews. This JSON contains source content and must be treated as sensitive. Import a workspace alone to restore it. Export a normalized bundle separately for interchange.
- Review declarations are bound to the current dataset/scenario SHA256 when Web Crypto is available. They are local, unsigned, unauthenticated and not tamper-proof. No localStorage persistence or server-side data retention is used.

Read IMPORT-CONTRACT.md before applying real customer data. Finish dates are exclusive boundaries; EAC excludes separately reported delay exposure. Missing financial inputs default to zero with an explicit warning. Constraints are FS only; this is not an enterprise scheduling-suite replacement.

## Three upstream integrations

- quality-docs-validator: independently adapted six cross-document check concepts, stronger operation-plus-characteristic matching, Unicode IDs, explicit booleans and original-row citations.
- Quality-Engineering-Skills: gate → deliverable → owner → evidence → gap workflow; a self-contained AI Skill with executable local tools. Outdated/inconsistent normative tables were excluded.
- QualityMind-RAG: fingerprints, structured/document routing and cited excerpts, independently implemented without its cloud stack. Retrieval here is lexical, not equivalent to semantic RAG.

Exact commits, adaptation boundaries and licenses are in THIRD_PARTY_NOTICES.md. No endorsement, OEM approval or standards compliance is implied.

## Packaged Skill

skills/automotive-readiness-review contains SKILL.md, metadata, references, CLI/parser/report sources, extractor, vendored XLSX reader and licenses. It can be added to a compatible AI host's skills directory; nothing is automatically installed. The host supplies AI reasoning. The browser alone is not an autonomous agent.

Example: `Use $automotive-readiness-review to review this workbook and validation report, check mappings and prepare a cited readiness memo.`

## Validation and limits

See VALIDATION.md and the raw evaluation bundle. Independent AI tests are not human expert approval. Real-project accuracy, reviewer agreement, time savings, enterprise integration, identity/signature authentication, resource leveling, OCR and actual OEM applicability remain outside validated scope.

Reference pages distinguish A/B/C component sample maturity from PVS/0S/SOP vehicle milestones and VDA maturity assurance. Configure their relationship for the actual customer/project; no universal VW mapping is claimed. Public sources are retained in Method & sources.

All reference evidence is synthetic. Never upload employer/customer confidential records to public GitHub. This is an independent project; the original automotive-interface-workflow-toolkit repository remains unchanged. GitHub Pages hosts the browser-only workbench; Python extraction still runs locally and is not a server feature provided by Pages.
