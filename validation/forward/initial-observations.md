# Independent forward test, initial observations

All fixtures are synthetic, not human engineering reviews. Test runner read public contracts and skill documentation, not core implementation.

Using bundled Node with WORKBENCH_PYTHON set to bundled Python from repository work/automotive-interface-workflow-toolkit:

- `node cli.js --file ../forward-eval/valid.json --file ../forward-eval/evidence.pdf --file ../forward-eval/evidence.docx --out ../forward-eval/json-docs --query FORWARD`: exit 1, `headers.filter is not a function`.
- `node cli.js --file ../forward-eval/valid.json --file ../forward-eval/evidence.docx --out ../forward-eval/docx --query FORWARD`: exit 1, same error.
- Same project plus PDF only: exit 0, GO, forecast 2026-10-18, EAC 2050; two page-specific excerpts returned.
- Valid JSON alone and four CSV tables: exit 0, GO, forecast 2026-10-18, EAC 2050. Hand calculation: 1000 spent + 750 remaining direct + 300 overhead.
- Invalid numeric value `12x`, instruction-like evidence text, negative duration: exit 0, HOLD, no schedule/cost conclusion; findings INVALID_ACCEPTANCE_DATA, INVALID_NUMBER, INVALID_DURATION.
- Malformed JSON: exit 1, parser error. Unterminated quoted CSV: exit 1, `Unterminated quoted CSV field.`
- Image-only PDF: exit 0, REVIEW_REQUIRED due to missing project/manifest. Normalized import warning explicitly requested OCR/manual review, but original analysis findings and MD/HTML reports omitted that warning.
- Direct `python tools/extract.py ../forward-eval/evidence.docx --out ../forward-eval/extract-docx.json`: exit 0; actual paragraphs and table extracted. Failed integration was after extraction.
- All three root third-party upstream license files were byte-identical to pinned cloned LICENSE files by SHA256.

Parent subsequently reported fixes for DOCX table import and extraction warning propagation; reruns are recorded separately.
