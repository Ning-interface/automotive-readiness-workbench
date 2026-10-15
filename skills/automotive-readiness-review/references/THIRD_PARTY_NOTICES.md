# Third-party provenance and adaptation notes

This original v3 implementation integrates selected workflow/rule/architecture ideas, not three upstream runtimes. Pins inspected on 2026-10-15. No endorsement, certification or official VW/CATL affiliation. Repository-owned MIT material does not license publisher-owned standards.

## quality-docs-validator

- Source: https://github.com/migmcc/quality-docs-validator/tree/6ec86dd400c454006a059de6c6feb57665d5bf6c
- Pin: 6ec86dd400c454006a059de6c6feb57665d5bf6c
- MIT, Copyright (c) 2026 Miguel Santos. Full notice: third-party/quality-docs-validator-LICENSE.txt.
- Inspected: parsers/excel.py, core/matching.py, modules/pfmea_control_plan.py, rule definitions and parser tests.
- Independently adapted: header discovery; unmatched operation, absent control, special-characteristic mismatch, missing reaction, weak visual detection and high-severity weak-control concepts.
- Changes: original JavaScript; Unicode IDs; operation-plus-characteristic matching; explicit ambiguous booleans; range validation; original physical rows, mapped cells and raw values. No upstream heuristic score is presented as compliance. Upstream runtime not included.
- The unmodified upstream examples/pfmea.xlsx is retained as test-fixtures/pfmea.xlsx solely for reproducible parser regression; the same MIT notice applies. It is not a real employer/customer dataset.

## Quality-Engineering-Skills

- Source: https://github.com/RBraga01/Quality-Engineering-Skills/tree/70df27cbd6a5ad6808499e934d2c72be4f8bef1e
- Pin: 70df27cbd6a5ad6808499e934d2c72be4f8bef1e
- MIT, Copyright (c) 2026 Ricardo Romão Marques Braga. Full notice: third-party/Quality-Engineering-Skills-LICENSE.txt.
- Inspected: APQP phase deliverables; PPAP checklist/checker; Control Plan builder; DVP workflow; root-cause chain validation; cross-skill audit.
- Independently adapted: gate-deliverable-owner-evidence-gap structure, cross-document traceability and separating instructions/references/tools.
- Changes: original executable Skill; explicit contract and deterministic calculations; no copied normative AP tables or publisher-owned forms. Older APQP/Control Plan references and inconsistent AP lookup rules were excluded. AIAG publishes APQP 3rd Edition and standalone Control Plan 1st Edition (2024); actual use still requires applicable licensed/customer requirements: https://www.aiag.org/training-and-resources/manuals

## QualityMind-RAG

- Source: https://github.com/vgandhi1/QualityMind-RAG/tree/fcb5cfaaf2610491cb75c746cee4bd383b24fedd
- Pin: fcb5cfaaf2610491cb75c746cee4bd383b24fedd
- MIT, Copyright (c) 2026 Vinay Gandhi. Full notice: third-party/QualityMind-RAG-LICENSE.txt.
- Inspected: cache, document, retrieval, routing and agent-validation services.
- Independently adapted: content SHA256, structured/document separation, bounded validators and excerpt/source separation.
- Changes: original local lexical retrieval; actual PDF-page/DOCX-section locations rather than approximate offsets; no generated SQL, cloud embedding, OpenAI/Pinecone/database dependency or upstream application code. Not a reproduction of semantic RAG.

## SheetJS Community Edition

- Unmodified vendor/xlsx.full.min.js, version 0.20.3, from https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js
- Apache License 2.0. Full upstream notice: vendor/SHEETJS-LICENSE.txt from https://cdn.sheetjs.com/xlsx-0.20.3/package/LICENSE
- Used to read existing XLSX. License appended to offline HTML and retained in source/Skill packages.

## Other runtime dependencies and rights

Python imports separately installed pypdf, python-docx and openpyxl; packages are not redistributed. Node built-ins supply the CLI/server. CPM, calendar, cost, disposition and reports are independently implemented. Complete upstream MIT notices are retained conservatively for concept/rule adaptations. ISO/IATF/AIAG/VDA publisher material remains separately licensed and is not reproduced or sublicensed.
