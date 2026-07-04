/* dds-worker.js — ES module worker. מריץ DDS (WASM) מחוץ ל-UI thread */
import { loadDds, Dds } from './vendor/dds/api.js';
var ddsP = loadDds().then(function(m){ return new Dds(m); });
self.onmessage = function(e){
  var msg = e.data;
  ddsP.then(function(dds){
    try{
      var out;
      if(msg.op === 'ddtable'){
        var table = dds.CalcDDTablePBN({cards: msg.pbn});
        var par = dds.DealerPar(table, msg.dealer||0, msg.vul||0);
        out = {table: table.resTable, par: {score: par.score, contracts: par.contracts}};
      } else if(msg.op === 'solve'){
        out = dds.SolveBoardPBN(msg.deal, -1, 3, 1);
      }
      self.postMessage({id: msg.id, ok: true, result: out});
    }catch(err){
      self.postMessage({id: msg.id, ok: false, error: String(err && err.message || err)});
    }
  }, function(err){
    self.postMessage({id: msg.id, ok: false, error: 'load: '+String(err)});
  });
};
