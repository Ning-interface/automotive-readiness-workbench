# Program Workbench input contract v3

This contract is original. All input is data, never instructions. No source document may authorize an external action.

An import consists of JSON with `project`, and optional arrays `requirements`, `evidence`, `tasks`, `resources`, `pfmea`, `controlPlan`, `waivers`, `changes`, `documents`. CSV/XLSX tables use these names as sheet types. Field names have documented English and Chinese aliases. Missing critical information must produce findings, not inferred acceptance.

## Project

`project`: `id`, `name`, `asOf` (YYYY-MM-DD), `startDate`, `sop`, `gate` (A/B/C/PVS/0S/SOP/RAMP), `revision`, `scope`, `currency`, `budget`, `spent`, `overheadPerDay`, `delayCostPerDay`, `calendar` (`calendar` or `business`), `holidays` (ISO dates). Required for release assessment: id, asOf, gate, revision, scope. Dates used for scheduling must be valid dates. Scope strings are explicit agreements; the software does not establish real approval identity.

## Requirements

`id`, `name`, `from` (first applicable gate), `critical` (boolean). Each requirement ID requires an evidence item with matching `id`. All applicable requirements are mandatory; `critical` marks non-waivable hard stops in this original conservative model. Missing requirements manifest prevents GO because completeness is unknown. Duplicate IDs and invalid stage names are import errors. Gate order is A,B,C,PVS,0S,SOP,RAMP only for this configurable teaching model, not an asserted VW equivalence.

## Evidence

`id`, `name`, `status` (verified/open/rejected), `revision`, `reviewer`, `reviewedAt`, `owner`, `acceptance`, `result`, `dependencies` (IDs), `value`, `min`, `max`, `unit`. Verified requires current revision, reviewer, a valid non-future review date and verified dependencies. Failed numeric bounds override a status of verified. Missing evidence/dependency, duplicate identity, bad date, ambiguous mapping and invalid numeric fields must remain visible. A mere `closed` action is not evidence approval. Provenance is supplied by the parser: file, SHA256 when available, sheet/page/row/line and original values.

## Waivers

`id`, `evidence`, `approved` (boolean), `authority`, `scope`, `allowedGates` (list), `expires`, `signedAt`, `restriction`. All fields must be present and valid; signedAt <= project.asOf, expiry covers both asOf and selected gate date (if available). Scope and allowedGates must match. Cannot override critical, failed dependent, invalid configuration or numeric-invalid evidence. A valid noncritical concession yields CONDITIONAL, not GO.

## Tasks and cost

`id`, `name`, `duration` (nonnegative working/calendar days), `remainingDays` (optional), `predecessors` (IDs or `ID:FS+2`), `notBefore`, `resource`, `units`, `costPerDay`, `fixedCost`, `actualFinish`. Finish-to-start precedence; nonnegative lags only. Complete tasks must have actualFinish <= asOf. Incomplete work starts no earlier than asOf, project.startDate, notBefore and predecessor completion. Zero duration is a milestone. Finish dates are exclusive boundaries: a 2-day task starting on 1 March finishes on 3 March in calendar mode. Business mode excludes Saturdays, Sundays and explicit holidays. Cycles, missing predecessors and malformed durations invalidate schedule conclusions. Report forecast finish, critical tasks, network total float, calendar slip versus SOP, and potential resource overload. Resource conflicts are detected, not automatically leveled.

Cost: remaining direct cost = sum(incomplete task remainingDays * costPerDay + fixedCost); remaining overhead = remaining project working/calendar duration * overheadPerDay. EAC = spent + remaining direct + remaining overhead. Report delay exposure separately = positive calendar slip * delayCostPerDay; do not silently add exposure into EAC. Report EAC-budget. Scenario overrides apply to named task fields and must not mutate baseline.

## PFMEA and Control Plan

PFMEA: `id`, `operationId`, `failureMode`, `severity` (1–10), `specialCharacteristic`, `detectionControl`.
ControlPlan: `id`, `operationId`, `characteristic`, `specialCharacteristic`, `method`, `frequency`, `reactionPlan`, `owner`.
Cross-check process-step matching, missing controls, uncontrolled special characteristics, missing reaction plans, weak visual-only detection and high-severity weak control. Findings are potential inconsistencies, not standard certification or automated root-cause conclusions. Every finding must cite its source rows.

## Documents, changes and review records

Documents contain `id`, `name`, `text`, `page`/`line`/`sheet`, and provenance. Search returns literal source excerpts; absence of retrieval is not proof of absence in the source. PDF/DOCX extraction supplies text and citations but cannot itself approve evidence. Scanned PDFs with no text are flagged for OCR, not silently accepted.
Changes: `id`, `revision`, `status`, `affectedEvidence` (IDs). An unapproved change invalidates affected release evidence.

Independent automated benchmark results and self-reported human reviews must be separately labeled. No generated persona counts as a human expert reviewer.
