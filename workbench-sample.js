(function(root){
  'use strict';
  function sample(){return {
    project:{id:'NPI-DEMO-03',name:'Battery enclosure · file-driven review',asOf:'2027-03-01',startDate:'2027-03-01',sop:'2027-03-07',gate:'SOP',revision:'R3',scope:'Nominated series build',currency:'EUR',budget:22000,spent:10000,overheadPerDay:200,delayCostPerDay:5000,calendar:'calendar',holidays:[]},
    requirements:[{id:'EV-01',name:'Requirements baseline',from:'A',critical:true},{id:'EV-02',name:'Seal durability acceptance',from:'C',critical:true},{id:'EV-03',name:'Product/process approval',from:'0S',critical:true},{id:'EV-04',name:'Series output capacity',from:'PVS',critical:false}],
    evidence:[
      {id:'EV-01',name:'Requirements baseline',status:'verified',revision:'R3',reviewer:'Example systems reviewer',reviewedAt:'2027-02-26',owner:'Systems engineering',acceptance:'All 48 allocated requirements accepted on R3',result:'48/48 accepted',dependencies:[]},
      {id:'EV-02',name:'Seal durability acceptance',status:'verified',revision:'R3',reviewer:'Example validation reviewer',reviewedAt:'2027-02-27',owner:'Validation',acceptance:'Leak ≤0.50 mbar/min after agreed thermal sequence',result:'Worst unit measured 0.82 mbar/min',value:0.82,max:0.5,unit:'mbar/min',dependencies:['EV-01']},
      {id:'EV-03',name:'Product/process approval',status:'open',revision:'R3',reviewer:'',reviewedAt:'',owner:'Supplier quality',acceptance:'Applicable customer disposition recorded',result:'Submission sent; approval not received',dependencies:['EV-02']},
      {id:'EV-04',name:'Series output capacity',status:'open',revision:'R3',reviewer:'',reviewedAt:'',owner:'Plant launch',acceptance:'1,000 good units/day for the nominated mix',result:'850/day supports the trial but not series demand',dependencies:[]}
    ],
    tasks:[
      {id:'T1',name:'Change disposition',duration:2,predecessors:[],costPerDay:1000,fixedCost:0},
      {id:'T2',name:'Tool recovery & repeat validation',duration:4,predecessors:['T1'],costPerDay:800,fixedCost:1000,resource:'VAL',units:1},
      {id:'T3',name:'Capacity demonstration',duration:3,predecessors:['T1'],costPerDay:600,fixedCost:0,resource:'VAL',units:1},
      {id:'T4',name:'Approval and release review',duration:1,predecessors:['T2','T3'],costPerDay:500,fixedCost:0}
    ],
    resources:[{id:'VAL',name:'Shared validation team',capacity:1}],
    pfmea:[
      {id:'F1',operationId:'Op 10',characteristic:'Seal flatness',failureMode:'Loss of seal integrity',severity:9,specialCharacteristic:true,detectionControl:'Dial gauge'},
      {id:'F2',operationId:'10',characteristic:'Seal width',failureMode:'Insufficient seal contact',severity:9,specialCharacteristic:true,detectionControl:'Dimensional measurement'},
      {id:'F3',operationId:'工序20',characteristic:'Surface cleanliness',failureMode:'Oil residue on sealing surface',severity:8,specialCharacteristic:false,detectionControl:'Visual'},
      {id:'F4',operationId:'工序30',characteristic:'Pack-out label',failureMode:'Wrong label applied',severity:7,specialCharacteristic:false,detectionControl:'Scanner'}
    ],
    controlPlan:[
      {id:'CP1',operationId:'10',characteristic:'Seal flatness',specialCharacteristic:false,method:'Dial gauge',frequency:'5/shift',reactionPlan:'',owner:'Plant quality'},
      {id:'CP2',operationId:'工序20',characteristic:'Surface cleanliness',specialCharacteristic:false,method:'Visual inspection',frequency:'Each unit',reactionPlan:'Segregate and clean before reinspection',owner:'Production'}
    ],
    waivers:[{id:'DEV-007',evidence:'EV-04',approved:true,authority:'Example plant + customer launch quality',scope:'PVS trial build ≤800/day',allowedGates:['PVS'],expires:'2027-03-02',signedAt:'2027-02-25',restriction:'Trial scope only; maximum 800/day; daily monitoring.'}],
    changes:[],
    documents:[{id:'DVP-MEMO',name:'Synthetic validation note',page:1,text:'EV-02: The R3 seal trial observed a worst leak rate of 0.82 mbar/min against an agreed maximum of 0.50.\nThe typed status in the register says verified; the numeric result contradicts acceptance.\nEV-03: The approval dossier remains submitted, not approved.\nThe example trial concession DEV-007 applies to PVS only and cannot authorize SOP.\nThese are deliberately seeded synthetic discrepancies for demonstration.'}]
  };}
  const api={sample};if(typeof module==='object'&&module.exports)module.exports=api;else root.WorkbenchSample=api;
})(typeof globalThis!=='undefined'?globalThis:this);
