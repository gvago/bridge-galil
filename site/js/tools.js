/* tools.js — deal generator + daily challenge. נשען על bridge.js/quiz.js הקיימים */
var Tools = (function(){
  // ponytail: seeded PRNG (mulberry32) כדי שאתגר יומי יהיה זהה לכל הגולשים בלי שרת
  function mulberry32(a){
    return function(){
      a|=0; a=a+0x6D2B79F5|0;
      var t=Math.imul(a^a>>>15,1|a);
      t=t+Math.imul(t^t>>>7,61|t)^t;
      return ((t^t>>>14)>>>0)/4294967296;
    };
  }
  function seededDeal(rng){
    var SUITS=['S','H','D','C'], RANKS=['A','K','Q','J','T','9','8','7','6','5','4','3','2'];
    var deck=[];
    SUITS.forEach(function(s){RANKS.forEach(function(r){deck.push(s+r);});});
    for(var i=deck.length-1;i>0;i--){var j=Math.floor(rng()*(i+1)),t=deck[i];deck[i]=deck[j];deck[j]=t;}
    var hands=[{},{},{},{}];
    ['N','E','S','W'].forEach(function(_,hi){
      var h={S:[],H:[],D:[],C:[]};
      deck.slice(hi*13,(hi+1)*13).forEach(function(c){h[c[0]].push(c[1]);});
      SUITS.forEach(function(s){h[s].sort(function(a,b){return RANKS.indexOf(a)-RANKS.indexOf(b);});});
      hands[hi]=h;
    });
    return {N:hands[0],E:hands[1],S:hands[2],W:hands[3]};
  }
  function renderDeal(deal,el){
    var names={N:'צפון',E:'מזרח',S:'דרום',W:'מערב'};
    var uid='d'+(renderDeal._n=(renderDeal._n||0)+1); // ponytail: מונה גלובלי מונע כפילות id בין שני אזורי deal באותו עמוד
    var html='<div class="deal-grid">';
    ['N','E','W','S'].forEach(function(pos){ // ponytail: RTL grid: פריט ראשון=ימין, לכן E קודם כדי ש-W ייפול שמאלה כמוסכמת דיאגרמות ברידג'
      html+='<div class="deal-seat deal-'+pos+'"><div class="deal-name">'+names[pos]+
        ' <span class="deal-pts">('+Bridge.hcp(deal[pos])+' נק\')</span></div><div id="'+uid+'-h-'+pos+'"></div></div>';
    });
    html+='</div>';
    el.innerHTML=html;
    ['N','E','S','W'].forEach(function(pos){
      Bridge.renderHand(deal[pos],document.getElementById(uid+'-h-'+pos));
    });
  }
  function newRandomDeal(el){
    renderDeal(seededDeal(mulberry32((Math.random()*2**31)|0)),el);
  }
  function dailySeed(){
    var d=new Date();
    return d.getFullYear()*10000+(d.getMonth()+1)*100+d.getDate();
  }
  function dailyChallenge(elDeal,elQuiz){
    var rng=mulberry32(dailySeed());
    var deal=seededDeal(rng);
    // היד של דרום היא השאלה: מה פותחים?
    var south=deal.S;
    var bid=Quiz.openingFor(south);
    renderDeal(deal,elDeal);
    var opts=['Pass','1♣','1♦','1♥','1♠','1NT'];
    var box=document.getElementById(elQuiz);
    var html='<div class="quiz-q">אתגר יום '+new Date().toLocaleDateString('he-IL')+': אתה דרום והמחלק. מה הכרזת הפתיחה?</div><div class="quiz-opts">';
    opts.forEach(function(o,i){html+='<button class="quiz-opt" data-i="'+i+'">'+o+'</button>';});
    html+='</div><div class="quiz-explain" id="daily-explain"></div>';
    box.innerHTML=html;
    box.querySelectorAll('.quiz-opt').forEach(function(btn){
      btn.addEventListener('click',function(){
        box.querySelectorAll('.quiz-opt').forEach(function(b){b.disabled=true;});
        box.querySelectorAll('.quiz-opt')[opts.indexOf(bid)].classList.add('correct');
        if(parseInt(btn.dataset.i,10)!==opts.indexOf(bid))btn.classList.add('wrong');
        var ex=document.getElementById('daily-explain');
        var p=Bridge.hcp(south);
        ex.innerHTML='<strong>'+(parseInt(btn.dataset.i,10)===opts.indexOf(bid)?'נכון! ':'התשובה: '+bid+'. ')+'</strong>ליד של דרום '+p+' נק\' גבוהות. חזרו מחר לאתגר חדש!';
        ex.classList.add('show');
      });
    });
  }
  return {newRandomDeal:newRandomDeal,dailyChallenge:dailyChallenge,seededDeal:seededDeal,mulberry32:mulberry32,dailySeed:dailySeed};
})();
