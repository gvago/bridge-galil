/* analyze.js — שכבת ניתוח: PBN, קריאות ל-worker, רנדור טבלת DD ופר בעברית */
var Analyze = (function(){
  var worker = null, seq = 0, pending = {};
  function getWorker(){
    if(!worker){
      worker = new Worker('../js/dds-worker.js', {type:'module'});
      worker.onmessage = function(e){
        var cb = pending[e.data.id];
        delete pending[e.data.id];
        if(cb) cb(e.data);
      };
    }
    return worker;
  }
  function call(msg, cb){
    msg.id = ++seq;
    pending[msg.id] = cb;
    getWorker().postMessage(msg);
  }
  // deal (מ-Bridge/Tools: {N,E,S,W} עם מערכי דרגות) -> PBN "N:spades.hearts.dia.clubs ..."
  function dealToPbn(deal){
    function hand(h){ return ['S','H','D','C'].map(function(s){return h[s].join('');}).join('.'); }
    return 'N:'+['N','E','S','W'].map(function(p){return hand(deal[p]);}).join(' ');
  }
  var STRAIN_HE = ['♠ ספייד','♥ הארט','♦ דיאמונד','♣ קלאב','NT ללא שליט'];
  var SEATS_HE = ['צפון','מזרח','דרום','מערב'];
  function renderDDTable(res, el){
    var html = '<div style="overflow-x:auto"><table class="dd-table"><thead><tr><th>שליט</th>';
    SEATS_HE.forEach(function(s){ html += '<th>'+s+'</th>'; });
    html += '</tr></thead><tbody>';
    res.table.forEach(function(row, i){
      html += '<tr><td class="dd-strain">'+STRAIN_HE[i]+'</td>';
      row.forEach(function(tr){
        html += '<td'+(tr>=7?' class="dd-make"':'')+'>'+tr+'</td>';
      });
      html += '</tr>';
    });
    html += '</tbody></table></div>';
    var par = res.par;
    html += '<div class="dd-par"><strong>חוזה הפר (Par):</strong> <span dir="ltr">'+
      (par.contracts && par.contracts.length ? par.contracts.join(', ') : '—')+
      '</span> <span class="dd-par-score">(ניקוד: '+par.score+')</span></div>';
    el.innerHTML = html;
  }
  function explainBeginner(res){
    // מצא את החוזה הגבוה ביותר שניתן לביצוע לכל זוג
    var best = {ns:null, ew:null};
    var LEVELS = [7,8,9,10,11,12,13];
    res.table.forEach(function(row, strain){
      [[0,2,'ns'],[1,3,'ew']].forEach(function(pair){
        var tricks = Math.max(row[pair[0]], row[pair[1]]);
        if(tricks >= 7){
          var level = tricks - 6;
          var cur = best[pair[2]];
          if(!cur || level > cur.level) best[pair[2]] = {level: level, strain: strain, tricks: tricks};
        }
      });
    });
    var S = ['♠','♥','♦','♣','NT'];
    function fmt(b){ return b ? '<span dir="ltr">'+b.level+S[b.strain]+'</span> ('+b.tricks+' לקיחות)' : 'אין חוזה'; }
    return 'במשחק מושלם משני הצדדים: צפון-דרום יכולים לבצע לכל היותר '+fmt(best.ns)+
      ', ומזרח-מערב '+fmt(best.ew)+'. חוזה הפר הוא נקודת שיווי המשקל: התוצאה ההוגנת כששני הזוגות מכריזים ומשחקים בצורה מיטבית.';
  }
  return {call:call, dealToPbn:dealToPbn, renderDDTable:renderDDTable, explainBeginner:explainBeginner};
})();
