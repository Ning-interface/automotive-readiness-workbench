(function (root) {
  'use strict';
  const stages = [
    { id: 'A', name: 'A-sample review', lane: 'Sample maturity', focus: 'Concept feasibility', offset: -260, mla: 'ML0–ML2 context', intent: 'Confirm the requirement baseline and functional feasibility before committing the next development loop.', deliverables: ['Agreed specification and use cases', 'Functional prototype observations', 'Feasibility risks and sourcing assumptions'], authority: 'Engineering lead · program lead' },
    { id: 'B', name: 'B-sample review', lane: 'Sample maturity', focus: 'Design & validation', offset: -170, mla: 'ML3–ML4 context', intent: 'Review design convergence, validation coverage and the industrialization plan before the next hardware iteration.', deliverables: ['Design revision and DFMEA', 'DVP coverage and open failures', 'Tooling plan and change baseline'], authority: 'Engineering · quality · industrialization' },
    { id: 'C', name: 'C-sample review', lane: 'Sample maturity', focus: 'Production-intent evidence', offset: -95, mla: 'ML5–ML6 context', intent: 'Establish what production-intent samples actually prove, including tool, process, revision and traceability conditions.', deliverables: ['Production-intent build genealogy', 'Validation results and deviations', 'Measurement capability and change approval'], authority: 'Engineering · supplier quality · manufacturing' },
    { id: 'PVS', name: 'PVS build review', lane: 'Vehicle launch', focus: 'Production trial readiness', offset: -55, mla: 'Project-specific alignment', intent: 'Check the part supply, manufacturing process and capacity evidence required for the planned vehicle trial build.', deliverables: ['Build quantity and rate commitment', 'Logistics and part readiness', 'Approved restrictions for trial use'], authority: 'Plant launch · quality · logistics' },
    { id: '0S', name: '0S build review', lane: 'Vehicle launch', focus: 'Zero-series readiness', offset: -31, mla: 'Project-specific alignment', intent: 'Challenge remaining release gaps and confirm that the planned zero-series build has adequate product and process evidence.', deliverables: ['Product/process approval status', 'EOL and traceability records', 'Remaining deviations and containment'], authority: 'Plant quality · engineering · customer quality' },
    { id: 'SOP', name: 'SOP readiness review', lane: 'Vehicle launch', focus: 'Series release', offset: 0, mla: 'ML6 / handover context', intent: 'Confirm the evidence and decision ownership for series production, including approved changes and demonstrated delivery capability.', deliverables: ['Applicable product and process approvals', 'Validated capacity and supply plan', 'No unresolved mandatory release blockers'], authority: 'Designated release authorities · steering committee' },
    { id: 'RAMP', name: 'Ramp & handover', lane: 'Series operation', focus: 'Stable delivery', offset: 42, mla: 'ML7 context', intent: 'Transfer an evidence-backed operating baseline to series teams, with residual issues, ownership and requalification planning.', deliverables: ['Stable yield and delivery trend', 'Residual issue ownership', 'Operations handover and requalification plan'], authority: 'Operations · quality · program lead' }
  ];
  const sources = [
    { id: 'S1', publisher: 'Volkswagen Group / IATF', title: 'Volkswagen Group Customer Specific Requirements', edition: 'March 2022 · listed by IATF at review', url: 'https://www.iatfglobaloversight.org/wp/wp-content/uploads/2022/03/Volkswagen-Group-Customer-Specific-Requirements_March-2022-1.pdf', scope: 'QPN-I maturity assurance; documented change approval or waiver before production; product approval references.', application: 'Evidence traceability, release ownership and change-control checks. Public CSR principles, not a reproduced internal checklist.' },
    { id: 'S2', publisher: 'Volkswagen Sachsen', title: 'E-Mobility Strategy of Volkswagen Saxony', edition: '10 September 2021 · historical public presentation', url: 'https://uploads.vw-mms.de/system/production/files/cws/036/609/file/039e67420c8dab32ba3f07856438e5e6885c2fd2/2021_09_10-Presentation-UBS_final.pdf?1683708304=', scope: 'Public launch roadmap showing VFF, PVS, 0S and SOP on page 9.', application: 'Vehicle milestone vocabulary. The example dates and gate criteria in this portfolio are independently authored.' },
    { id: 'S3', publisher: 'VDA QMC', title: 'Maturity Level Assurance for New Parts', edition: '3rd revised edition · June 2022 · publisher overview', url: 'https://webshop.vda.de/QMC/de/maturity-level-assurance_062022', scope: 'Product/process maturity, cooperation across the supply chain, and sample-stage definitions.', application: 'Separate product, process and project maturity; review evidence at agreed milestones. No licensed question catalogue is reproduced.' },
    { id: 'S4', publisher: 'VDA QMC', title: 'Glossary: A-, B-, C-, D-samples', edition: 'Public glossary · references June 2022 volume', url: 'https://www.vda-qmc-learning.de/module/glossar/glossardetails.php?currentlanguage=en&id=334', scope: 'Sample designations express component maturity during product development.', application: 'A/B/C sample maturity is a separate track from PVS/0S/SOP vehicle milestones.' },
    { id: 'S5', publisher: 'QuantumScape / SEC', title: 'Annual report: technical glossary', edition: '2026 annual report · battery industry example', url: 'https://www.sec.gov/Archives/edgar/data/1811414/000119312526174000/qs_ars_2026.pdf', scope: 'Successive sample stages and iterations; sample specifications agreed with the OEM.', application: 'An illustrative battery qualification reference. Its sample conventions are not presented as universal VW rules.' }
  ];
  function record(id, domain, title, from, critical, owner, acceptance, result, status, document, detail, dependencies) {
    return { id, domain, title, from, critical, owner, acceptance, result, status, document, detail, dependencies: dependencies || [], revision: 'R3', reviewedRevision: status === 'verified' ? 'R3' : null, reviewer: status === 'verified' ? 'Independent quality reviewer' : null, reviewedAt: status === 'verified' ? '2027-03-10' : null };
  }
  const records = [
    record('EV-01', 'Requirements', 'Requirement & interface baseline', 'A', true, 'Systems engineering', 'Customer and supplier acceptance of the same revision; all mandatory interfaces assigned.', '48/48 requirements allocated; interface freeze signed.', 'verified', 'SPEC-E42-R3', 'The baseline fixes enclosure geometry, seal interfaces, leak-test conditions and material scope. Four changes from R2 are explicitly allocated to validation owners.'),
    record('EV-02', 'Product', 'Functional feasibility & package fit', 'A', false, 'Product engineering', 'Prototype fits the agreed package; installation and service interfaces assessed.', '12 prototype assemblies reviewed; no open package conflicts.', 'verified', 'FIT-012-R3', 'A-sample observations establish functional feasibility only. They do not demonstrate series-process capability or authorize a vehicle release.'),
    record('EV-03', 'Product', 'DFMEA & validation coverage', 'B', true, 'Design quality', 'Safety-relevant failure modes have validation coverage and assigned prevention/detection controls.', '17/20 validation items passed; remaining seal tests assigned.', 'verified', 'DFMEA-042-R3', 'Coverage is accepted as a planning baseline. This record confirms coverage, not completion; actual test acceptance is controlled separately by EV-04.', ['EV-01']),
    record('EV-04', 'Validation', 'Seal durability after thermal cycling', 'C', true, 'Validation lead', 'All 30 production-intent units meet the agreed ≤0.50 mbar/min leak criterion after the specified test sequence.', '4/30 units exceeded the limit; worst result 0.82 mbar/min.', 'rejected', 'DVP-017-R3', 'Failure clustered around the revised seal track. Design and process contributors remain under investigation. A passed dimensional check cannot substitute for the failed durability test.', ['EV-03']),
    record('EV-05', 'Process', 'Tooling, measurement & process baseline', 'C', true, 'Manufacturing engineering', 'Series-intent tool revision and measurement method documented; study acceptance agreed in the project.', 'Tool T03 identified; gauge R&R 8.4% against the example ≤10% criterion.', 'verified', 'MSA-T03-R3', 'The acceptance threshold is an explicit portfolio assumption. The measurement study uses the same gauge, operators and fixture configuration as the planned build.'),
    record('EV-06', 'Traceability', 'Part-to-process genealogy', 'C', true, 'Manufacturing quality', 'Every trial unit traceable to tool, material lot, process recipe and test result.', '120/120 records reconciled; no missing lot or recipe IDs.', 'verified', 'TRACE-120-R3', 'Build genealogy distinguishes sample maturity from the process conditions used to manufacture each unit. Reworked units retain their original and rework histories.'),
    record('EV-07', 'Change', 'ECN-024 change authorization', 'C', true, 'Change control board', 'Recorded approval or a valid, scoped authorization before use of the changed production configuration.', 'Seal-track R3 proposed; customer disposition not yet recorded.', 'open', 'ECN-024-R3', 'The proposed tool insert change affects EV-04 validation and EV-09 product/process submission. A closed action or submitted email is not approval.', ['EV-01']),
    record('EV-08', 'Capacity', 'Demonstrated good-parts capacity', 'PVS', false, 'Plant launch lead', 'Demonstrated good output ≥1,000 parts/day for the nominated shift pattern and planned mix.', '1,080 good parts/day; 8% headroom over the example demand.', 'verified', 'RUN-2D-008-R3', 'Demonstration records 16 scheduled hours/day × 78 gross parts/hour × 90% availability × 96.2% first-pass yield. Conservatively rounded good output is 1,080/day. No double-counting of rework or overtime.', ['EV-05']),
    record('EV-09', 'Approval', 'Product & process approval dossier', '0S', true, 'Supplier quality', 'Applicable product/process approval accepted by the designated customer authority.', 'Submission prepared; validation closure and change approval outstanding.', 'open', 'PPA-042-R3', 'This dossier is a simulated PPA/PPF-style evidence index. It is not an official BeOn record, PPAP warrant or OEM approval.', ['EV-04', 'EV-07']),
    record('EV-10', 'Logistics', 'Packaging & delivery readiness', 'PVS', false, 'Logistics lead', 'Pack-out, transport trial and line-side replenishment support the agreed build window.', 'Transport trial accepted; two-day buffer and replenishment trigger defined.', 'verified', 'LOG-006-R3', 'Capacity is checked at the customer-consumption point. The plan identifies transit time, protective packaging and a trigger for expedited replenishment.'),
    record('EV-11', 'Containment', 'EOL detection & containment boundary', '0S', true, 'Plant quality', 'Detection method challenged with known defects; quarantine and release ownership defined.', 'Challenge set detected; trial lots segregated with controlled release.', 'verified', 'EOL-011-R3', 'Containment limits exposure while investigation continues. It does not clear an unresolved product-validation failure or authorize unrestricted series use.'),
    record('EV-12', 'Handover', 'Series ownership & stabilization', 'RAMP', false, 'Operations manager', 'Sustained delivery and quality trend accepted; residual items and requalification ownership transferred.', 'Series trend not available at this review.', 'open', 'HANDOVER-001-R3', 'The handover pack defines operations ownership, escalation thresholds, residual actions and the agreed requalification plan. SOP does not automatically close the program.')
  ];
  const issues = [
    { id: 'R-01', severity: 'Critical', title: 'Seal durability outside acceptance', evidence: 'EV-04', impact: 'C-sample acceptance and 0S release cannot be supported by the current results.', owner: 'Validation lead', due: '2027-03-15', escalation: 'Engineering director + customer quality', action: 'Complete controlled insert trial and repeat the affected durability sequence.', closure: 'EV-04 passes on the approved revision; independent quality review recorded.', cost: 42000 },
    { id: 'R-02', severity: 'Critical', title: 'Unapproved seal-track configuration', evidence: 'EV-07', impact: 'Planned tooling change cannot enter the released production baseline.', owner: 'Change control board', due: '2027-03-13', escalation: 'Customer change authority', action: 'Submit the full impact assessment and obtain documented disposition.', closure: 'ECN-024 approved for the defined revision and scope; downstream evidence revalidated.', cost: 12000 },
    { id: 'R-03', severity: 'High', title: 'Approval dossier depends on two open items', evidence: 'EV-09', impact: 'No complete product/process approval basis for the selected build.', owner: 'Supplier quality', due: '2027-03-18', escalation: 'Program steering committee', action: 'Close EV-04 and EV-07, then resubmit the dossier with traceable evidence.', closure: 'Customer approval recorded against the correct revision.', cost: 0 }
  ];
  const change = {
    id: 'ECN-024', title: 'Seal-track insert revision', baseline: 'Tool T03 / seal track R2', proposed: 'Tool T03 / seal track R3', trigger: 'Leak excursion after thermal cycling', affected: ['EV-04', 'EV-05', 'EV-06', 'EV-09', 'EV-11'], material: 'No material change proposed', software: 'No software change in this enclosure scope', cost: 42000, leadDays: 6,
    controls: ['Segregate R2 and R3 builds and preserve genealogy.', 'Repeat affected validation on the approved configuration.', 'Review gauge, control plan and EOL challenge coverage.', 'Obtain written change disposition before production use.', 'Reconfirm product/process approval applicability.']
  };
  function addDays(date, days) { const d = new Date(date + 'T00:00:00Z'); d.setUTCDate(d.getUTCDate() + days); return d.toISOString().slice(0, 10); }
  function program(id) {
    const p = {
      id, code: 'E42', title: 'Battery enclosure industrialization', scope: 'Aluminum enclosure · EU vehicle program', customer: 'Example European OEM', site: 'Example Plant EU-01', revision: 'R3', asOf: '2027-03-12', sop: '2027-04-12', gate: '0S', sample: 'C1', decisionScope: 'Zero-series build', snapshot: 'baseline', records: structuredClone(records), issues: structuredClone(issues), changes: [structuredClone(change)], waivers: [],
      brief: 'Protect the build decision while recovering the seal-validation and change-approval path.',
      options: [
        { id: 'release', name: 'Release as planned', timing: 'No planned slip', cost: 0, assessment: 'Not supportable', rationale: 'Unresolved mandatory validation and configuration approval prevent this route.' },
        { id: 'recover', name: 'Hold affected scope; recover', timing: '+9 days to build release', cost: 54000, assessment: 'Recommended', rationale: 'Contain affected lots, validate R3 and obtain change disposition. Forecast build release on 21 March leaves 22 calendar days before the SOP target; this window is not validated critical-path float.' },
        { id: 'delay', name: 'Rebaseline the launch', timing: '+14 days to SOP', cost: 98000, assessment: 'Contingency', rationale: 'Invoke if repeat validation or customer disposition misses 21 March; obtain a steering decision rather than silently consume all float.' }
      ],
      recoveryPlan: [
        { task: 'Customer change disposition', owner: 'Change authority', start: '2027-03-13', finish: '2027-03-13', predecessor: 'Impact assessment complete', evidence: 'EV-07' },
        { task: 'Controlled tool-insert modification', owner: 'Tooling engineering', start: '2027-03-13', finish: '2027-03-18', predecessor: 'Change disposition; no production use before approval', evidence: 'EV-05' },
        { task: 'Repeat affected validation', owner: 'Validation lead', start: '2027-03-19', finish: '2027-03-20', predecessor: 'Tool configuration and genealogy confirmed', evidence: 'EV-04' },
        { task: 'Dossier review & build-release decision', owner: 'Customer quality', start: '2027-03-21', finish: '2027-03-21', predecessor: 'EV-04 and EV-07 independently accepted', evidence: 'EV-09' }
      ],
      costBasis: 'Recovery: €42,000 tool modification + €12,000 validation = €54,000. Launch-delay alternative: 14 days × €7,000/day = €98,000. Independent illustrative option costs, not additive or contracted damages.',
      narrative: [
        { title: 'Evidence before confidence', text: 'A verified coverage plan and capable gauge do not erase the failed durability result. The gate remains held on the rejected product evidence.' },
        { title: 'Configuration before closure', text: 'A successful R3 trial is usable only with an approved change and traceability to that configuration. Each dependent approval must be rechecked.' },
        { title: 'Escalation with a decision', text: 'Steering is asked to fund a €54k recovery route with a dated contingency, rather than receive an unranked action list.' }
      ]
    };
    if (id === 'capacity') {
      p.code = 'E42-CAP'; p.title = 'Trial-build capacity concession'; p.gate = 'PVS'; p.sample = 'C0'; p.asOf = '2027-02-16'; p.decisionScope = 'PVS trial build · maximum 800 parts/day';
      p.brief = 'Allow a bounded trial build while the full series-capacity gap is recovered.';
      p.records.forEach(r => { if (['EV-04', 'EV-07', 'EV-09'].includes(r.id)) Object.assign(r, { status: 'verified', reviewedRevision: 'R3', reviewer: 'Independent quality reviewer', reviewedAt: '2027-02-15', result: r.id === 'EV-04' ? '30/30 units passed the agreed sequence; worst leak 0.36 mbar/min.' : r.id === 'EV-07' ? 'ECN-024 approved for R3; applicability confirmed.' : 'Applicable R3 product/process approval recorded.' }); else if(r.status === 'verified') r.reviewedAt = '2027-02-15'; });
      Object.assign(p.records.find(r => r.id === 'EV-03'), { result: '20/20 validation items passed; coverage baseline reconciled.' });
      Object.assign(p.records.find(r => r.id === 'EV-08'), { status: 'open', result: '850 good parts/day demonstrated vs 1,000/day series demand.', reviewedRevision: null, reviewer: null, reviewedAt: null, detail: 'The trial requires 800/day. A signed trial-build concession allows that scope only while the bottleneck is recovered; the 1,000/day series target remains unmet.' });
      p.waivers = [{ id: 'DEV-007', evidence: 'EV-08', approved: true, authority: 'Customer launch quality + plant manager', scope: p.decisionScope, allowedGates: ['PVS'], expires: '2027-03-01', restriction: 'Trial use only; maximum 800 parts/day; daily output review; no extension to SOP.', signedAt: '2027-02-15' }];
      p.issues = [{ id: 'R-04', severity: 'High', title: 'Series capacity remains below demand', evidence: 'EV-08', impact: 'PVS is supported within the signed 800/day boundary; SOP is not authorized by this concession.', owner: 'Plant launch lead', due: '2027-02-26', escalation: 'Plant manager + purchasing', action: 'Recover fixture availability and repeat the capacity demonstration.', closure: 'Demonstrate ≥1,000 good parts/day under the nominated conditions.', cost: 18000 }];
      p.options = [
        { id: 'release', name: 'Commit full series volume', timing: 'No planned slip', cost: 0, assessment: 'Not supportable', rationale: 'Demonstrated output is 150/day short of the series demand.' },
        { id: 'recover', name: 'Bound the PVS build', timing: 'PVS retained', cost: 18000, assessment: 'Recommended', rationale: 'Use signed DEV-007 at ≤800/day through 1 March. Recover the constraint and repeat capacity verification by 26 February.' },
        { id: 'delay', name: 'Defer the trial build', timing: '+7 days', cost: 33000, assessment: 'Contingency', rationale: 'Use if the approved quantity, expiry or containment conditions cannot be met.' }
      ];
      p.recoveryPlan = [
        { task: 'Confirm bottleneck & recovery scope', owner: 'Industrial engineering', start: '2027-02-17', finish: '2027-02-18', predecessor: 'Capacity run data reviewed', evidence: 'EV-08' },
        { task: 'Recover fixture availability', owner: 'Plant maintenance', start: '2027-02-19', finish: '2027-02-23', predecessor: 'Recovery scope approved', evidence: 'EV-05' },
        { task: 'Repeat nominated-mix capacity run', owner: 'Plant launch lead', start: '2027-02-24', finish: '2027-02-25', predecessor: 'Fixture acceptance complete', evidence: 'EV-08' },
        { task: 'Independently accept series rate', owner: 'Plant quality + customer launch', start: '2027-02-26', finish: '2027-02-26', predecessor: 'Demonstration meets ≥1,000 good parts/day', evidence: 'EV-08' }
      ];
      p.costBasis = 'Recovery: €18,000 fixture intervention. Trial-delay alternative: €12,000 logistics replanning + €21,000 standby exposure = €33,000. These are separate illustrative choices, not invoiced costs.';
      p.narrative = [{ title: 'Scope is part of the decision', text: 'An 850/day line can support an 800/day trial, but cannot support a 1,000/day series commitment. The concession is tied to a quantity, gate and expiry.' }, { title: 'No automatic series release', text: 'PVS authorization is not inherited by 0S or SOP. Advancing the gate without capacity evidence returns HOLD.' }, { title: 'Commercial exposure is explicit', text: 'The example €18k recovery budget is compared with €33k trial delay exposure; neither amount is a real customer cost.' }];
    }
    if (id === 'ready') {
      p.code = 'E42-SOP'; p.title = 'Series-production release review'; p.gate = 'SOP'; p.sample = 'C2'; p.asOf = '2027-04-12'; p.decisionScope = 'Series production · nominated mix and shifts'; p.brief = 'Confirm the release basis and carry residual operating ownership into ramp-up.';
      p.records.forEach(r => Object.assign(r, { status: 'verified', reviewedRevision: 'R3', reviewer: 'Independent quality reviewer', reviewedAt: '2027-04-10' }));
      Object.assign(p.records.find(r => r.id === 'EV-03'), { result: '20/20 validation items passed; coverage baseline reconciled.' });
      Object.assign(p.records.find(r => r.id === 'EV-04'), { result: '30/30 units passed; worst leak 0.36 mbar/min on approved R3.' });
      Object.assign(p.records.find(r => r.id === 'EV-07'), { result: 'ECN-024 approved for R3; dependent records revalidated.' });
      Object.assign(p.records.find(r => r.id === 'EV-09'), { result: 'Applicable product/process approval recorded against R3.' });
      Object.assign(p.records.find(r => r.id === 'EV-12'), { result: 'Ramp ownership and review cadence accepted; sustained series trend remains a ramp-stage deliverable.', status: 'open', reviewedRevision: null, reviewer: null, reviewedAt: null });
      p.issues = [];
      p.recoveryPlan = [
        { task: 'Start nominated series scope', owner: 'Plant launch lead', start: '2027-04-12', finish: '2027-04-12', predecessor: 'SOP release by designated authorities', evidence: 'EV-09' },
        { task: 'Collect sustained operating trend', owner: 'Operations manager', start: '2027-04-13', finish: '2027-05-20', predecessor: 'Released series baseline', evidence: 'EV-12' },
        { task: 'Handover and residual-risk acceptance', owner: 'Operations + program lead', start: '2027-05-24', finish: '2027-05-24', predecessor: 'Sustained trend independently accepted', evidence: 'EV-12' }
      ];
      p.costBasis = 'SOP release: no incremental recovery budget in this snapshot. Additional containment example: €18,000. Unjustified 7-day delay example: 7 × €7,000/day = €49,000. Case assumptions only.';
      p.options = [
        { id: 'release', name: 'Release nominated series scope', timing: 'SOP retained', cost: 0, assessment: 'Recommended', rationale: 'All applicable SOP criteria have verified evidence on R3. Daily ramp reviews continue; the future handover gate is still open.' },
        { id: 'recover', name: 'Apply additional containment', timing: 'No slip', cost: 18000, assessment: 'Not required by evidence', rationale: 'Retain as a response if the released baseline, yield or delivery evidence changes.' },
        { id: 'delay', name: 'Defer series release', timing: '+7 days', cost: 49000, assessment: 'Not justified by current evidence', rationale: 'No unresolved SOP blocker in this snapshot. A new change would reopen the relevant evidence.' }
      ];
      p.narrative = [{ title: 'GO has a boundary', text: 'The recommendation applies to R3, the nominated mix and the demonstrated shift pattern. It is not a blanket authorization for future changes.' }, { title: 'SOP is not project closure', text: 'The ramp handover remains open until the agreed sustained operating evidence is reviewed.' }, { title: 'Keep the control loop alive', text: 'Operations owns daily yield and delivery monitoring; the program team retains escalation responsibility until handover.' }];
    }
    if (id === 'ready' || id === 'capacity') {
      p.records.find(r => r.id === 'EV-04').detail = 'The original seal-track risk was followed through a controlled production-intent build. Repeat-test results and R3 build genealogy were independently reconciled. Acceptance is limited to the agreed test sequence, population and configuration.';
      p.records.find(r => r.id === 'EV-07').detail = 'The R3 change disposition is recorded for the defined seal-track scope. Associated validation, traceability and approval records must refer to the same released configuration.';
    }
    p.gates = stages.map(s => ({ ...s, date: addDays(p.sop, s.offset) }));
    return p;
  }
  function recover(p) {
    const copy = structuredClone(p); copy.snapshot = 'recovery';
    if (p.id === 'sealing') {
      copy.asOf = '2027-03-21';
      for (const id of ['EV-04', 'EV-07', 'EV-09']) Object.assign(copy.records.find(r => r.id === id), { status: 'verified', reviewedRevision: 'R3', reviewer: 'Independent quality reviewer', reviewedAt: '2027-03-21' });
      copy.records.find(r => r.id === 'EV-04').result = '30/30 units passed; worst leak 0.36 mbar/min on approved R3.';
      copy.records.find(r => r.id === 'EV-04').detail = 'The original failure clustered at the seal-track interface. The controlled R3 repeat build and validation were independently reconciled; acceptance applies to the agreed test sequence and population, not an unrestricted lifetime claim.';
      copy.records.find(r => r.id === 'EV-07').result = 'ECN-024 approved for R3; affected evidence revalidated.';
      copy.records.find(r => r.id === 'EV-07').detail = 'The R3 disposition is recorded for the defined scope. A later R4 change cannot inherit this approval or its dependent evidence.';
      copy.records.find(r => r.id === 'EV-09').result = 'R3 product/process approval recorded after EV-04 and EV-07 closure.';
      copy.records.find(r => r.id === 'EV-03').result = '20/20 validation items passed; coverage baseline reconciled.';
    } else if (p.id === 'capacity') {
      copy.asOf = '2027-02-26'; copy.waivers = [];
      Object.assign(copy.records.find(r => r.id === 'EV-08'), { status: 'verified', reviewedRevision: 'R3', reviewer: 'Plant quality + customer launch', reviewedAt: '2027-02-26', result: '1,080 good parts/day demonstrated; 8% headroom to series demand.', detail: 'The repeated demonstration includes the agreed shift pattern, production mix and measurement conditions. The trial concession is no longer needed.' });
    }
    return copy;
  }
  const api = { stages, sources, program, recover, addDays };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.ProgramData = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
