/* quiz.js — מנוע חידונים גנרי + מחולל שאלות הכרזת פתיחה */
var Quiz = (function(){
  function run(cfg){
    // cfg: {el, next(), title}
    var box = document.getElementById(cfg.el);
    var score = 0, total = 0, current = null;

    function render(){
      current = cfg.next();
      total++;
      var html = '';
      if(current.handStr){
        html += '<div id="qz-hand"></div>';
      }
      html += '<div class="quiz-q">'+current.q+'</div>';
      html += '<div class="quiz-opts">';
      current.opts.forEach(function(o,i){
        html += '<button class="quiz-opt" data-i="'+i+'">'+o+'</button>';
      });
      html += '</div>';
      html += '<div class="quiz-explain" id="qz-explain"></div>';
      html += '<div class="quiz-next"><button class="btn btn-green" id="qz-next" style="display:none">שאלה הבאה ←</button></div>';
      html += '<div class="quiz-score" id="qz-score">ניקוד: '+score+' מתוך '+(total-1)+'</div>';
      box.innerHTML = html;
      if(current.handStr){
        Bridge.renderHand(Bridge.parseHand(current.handStr), document.getElementById('qz-hand'));
      }
      box.querySelectorAll('.quiz-opt').forEach(function(btn){
        btn.addEventListener('click', function(){ answer(parseInt(btn.dataset.i,10)); });
      });
      document.getElementById('qz-next').addEventListener('click', render);
    }

    function answer(i){
      var opts = box.querySelectorAll('.quiz-opt');
      opts.forEach(function(b){ b.disabled = true; });
      opts[current.correct].classList.add('correct');
      if(i === current.correct){ score++; }
      else { opts[i].classList.add('wrong'); }
      var ex = document.getElementById('qz-explain');
      ex.innerHTML = '<strong>'+(i===current.correct?'נכון! ':'התשובה הנכונה: '+current.opts[current.correct]+'. ')+'</strong>'+current.explain;
      ex.classList.add('show');
      document.getElementById('qz-next').style.display='inline-block';
      document.getElementById('qz-score').textContent = 'ניקוד: '+score+' מתוך '+total;
    }
    render();
  }

  /* מחולל שאלות פתיחה לפי כללי הכרזה טבעית (5-card majors, 15-17 NT) */
  function openingFor(hand){
    var p = Bridge.hcp(hand);
    if(p >= 15 && p <= 17 && Bridge.isBalanced(hand)) return '1NT';
    if(p < 12) return 'Pass';
    var s = hand.S.length, h = hand.H.length, d = hand.D.length, c = hand.C.length;
    if(s >= 5 && s >= h) return '1♠';
    if(h >= 5) return '1♥';
    if(d >= c) return '1♦';
    return '1♣';
  }
  function explainOpening(hand, bid){
    var p = Bridge.hcp(hand);
    var sh = Bridge.shape(hand);
    var base = 'ביד '+p+' נק\' גבוהות, חלוקה <span dir="ltr">'+sh.join('-')+'</span> (ספייד-הארט-דיאמונד-קלאב). ';
    var why = {
      'Pass':'עם פחות מ-12 נקודות אין פתיחה.',
      '1NT':'יד מאוזנת עם 15-17 נקודות: פתיחת 1NT מתארת את היד במדויק.',
      '1♠':'חמישייה בספייד (או שוויון עם הארט): פותחים בסדרת המייג\'ור הארוכה.',
      '1♥':'חמישייה בהארט ללא חמישייה בכירה גבוהה ממנה: פותחים 1♥.',
      '1♦':'ללא חמישייה במייג\'ור: פותחים במיינור הארוך (או 1♦ כשהם שווים באורך 4+).',
      '1♣':'ללא חמישייה במייג\'ור והקלאב ארוך מהדיאמונד: פותחים 1♣.'
    };
    return base + (why[bid]||'');
  }
  function genOpeningQuestion(){
    var hand, bid, tries=0;
    do { hand = Bridge.dealHand(); bid = openingFor(hand); tries++; }
    while(bid==='Pass' && Math.random()<0.7 && tries<20); // פחות שאלות Pass משעממות
    var handStr = ['S','H','D','C'].map(function(s){return hand[s].join('');}).join('.');
    var opts = ['Pass','1♣','1♦','1♥','1♠','1NT'];
    return {
      handStr: handStr,
      q: 'אתה המחלק (Dealer). מה הכרזת הפתיחה הנכונה?',
      opts: opts,
      correct: opts.indexOf(bid),
      explain: explainOpening(hand, bid)
    };
  }
  function genHcpQuestion(){
    var hand = Bridge.dealHand();
    var p = Bridge.hcp(hand);
    var handStr = ['S','H','D','C'].map(function(s){return hand[s].join('');}).join('.');
    var opts = [], correctIdx;
    var offsets = [-2,-1,0,1];
    offsets = offsets.sort(function(){return Math.random()-0.5;});
    var vals = offsets.map(function(o){return Math.max(0,p+o);});
    // הבטח ייחודיות
    vals = vals.filter(function(v,i){return vals.indexOf(v)===i;});
    if(vals.indexOf(p)<0) vals.push(p);
    vals.sort(function(a,b){return a-b;});
    correctIdx = vals.indexOf(p);
    return {
      handStr: handStr,
      q: 'כמה נקודות גבוהות (HCP) יש ביד הזו? (A=4, K=3, Q=2, J=1)',
      opts: vals.map(String),
      correct: correctIdx,
      explain: 'ספירה: אס=4, מלך=3, מלכה=2, נסיך=1. סך הכל ביד: '+p+' נקודות.'
    };
  }
  return {run:run, genOpeningQuestion:genOpeningQuestion, genHcpQuestion:genHcpQuestion, openingFor:openingFor};
})();
