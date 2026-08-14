/* table.js — שולחן משחק מלא: מכרז ← משחק ← סיכום. משתמש ב-Bidder + DDS worker.
   BridgeTable.start({el, deal?, dealer?, userSeat:2(S), scenario?, onDone?}) */
var BridgeTable = (function(){
  var SEATS=['N','E','S','W'], SEAT_HE={N:'צפון',E:'מזרח',S:'דרום',W:'מערב'};
  var SUIT_SYM={S:'♠',H:'♥',D:'♦',C:'♣'}, RANKS='AKQJT98765432';
  var STRAIN_HE={C:'♣',D:'♦',H:'♥',S:'♠',NT:'ללא שליט'};
  var RANK_DISP={T:'10'};

  var worker=null, pending={}, mid=0;
  function dds(msg){
    if(!worker){
      worker=new Worker(window.TABLE_WORKER_PATH||'../js/dds-worker.js',{type:'module'});
      worker.onmessage=function(e){
        var p=pending[e.data.id]; delete pending[e.data.id];
        if(p) e.data.ok ? p.res(e.data.result) : p.rej(new Error(e.data.error));
      };
    }
    return new Promise(function(res,rej){ msg.id=++mid; pending[msg.id]={res:res,rej:rej}; worker.postMessage(msg); });
  }

  function fullDeal(rng){
    rng = rng || Math.random;
    var deck=[]; SEATS.forEach(function(_,i){}); ['S','H','D','C'].forEach(function(s){RANKS.split('').forEach(function(r){deck.push(s+r);});});
    for(var i=deck.length-1;i>0;i--){var j=Math.floor(rng()*(i+1)),t=deck[i];deck[i]=deck[j];deck[j]=t;}
    return SEATS.map(function(_,k){
      var h={S:[],H:[],D:[],C:[]};
      deck.slice(k*13,(k+1)*13).forEach(function(c){h[c[0]].push(c[1]);});
      ['S','H','D','C'].forEach(function(s){h[s].sort(function(a,b){return RANKS.indexOf(a)-RANKS.indexOf(b);});});
      return h;
    });
  }
  function pbnOf(hands){
    return 'N:'+hands.map(function(h){
      return ['S','H','D','C'].map(function(s){return h[s].join('');}).join('.');
    }).join(' ');
  }

  /* ---------- state ---------- */
  var T=null;

  function start(cfg){
    var hands = cfg.deal ? cfg.deal.map(function(s){return Bridge.parseHand(s);}) : fullDeal();
    T={
      el:document.getElementById(cfg.el),
      hands:hands, userSeat:(cfg.userSeat!=null?cfg.userSeat:2),
      dealer:(cfg.dealer!=null?cfg.dealer:2),
      scenario:cfg.scenario||null, onDone:cfg.onDone||null,
      gradeBids:cfg.gradeBids!==false,
      phase:'bid', auction:[], turn:null,
      contract:null, declarer:null, dummy:null, trump:null,
      trick:[], tricksNS:0, tricksEW:0, played:0, ledger:[],
      mistakes:[], lastHint:null, pauseHint:null, busy:false
    };
    T.turn=T.dealer;
    render();
    if(T.turn!==T.userSeat) setTimeout(botBid,600);
  }

  /* ---------- bidding ---------- */
  function legalBid(bid){
    var last=null; T.auction.forEach(function(a){if(a.bid!=='P')last=a.bid;});
    return bid==='P' || Bidder.higher(bid,last);
  }
  function auctionDone(){
    if(T.auction.length<4) return false;
    var t=T.auction.slice(-3).every(function(a){return a.bid==='P';});
    return t;
  }
  function botBid(){
    if(T.phase!=='bid'||T.pauseHint) return;
    var r=Bidder.suggest(T.hands[T.turn], T.auction, T.turn);
    applyBid(r.bid, null);
  }
  function userBid(bid){
    if(T.phase!=='bid'||T.turn!==T.userSeat||T.pauseHint||!legalBid(bid)) return;
    /* משוב: מה המנוע היה מכריז. gradeBids=false בשיעורי קונבנציות שהמנוע לא מכיר */
    var fb=null;
    if(T.gradeBids){
      var best=Bidder.suggest(T.hands[T.userSeat], T.auction, T.userSeat);
      if(best.bid!==bid){
        fb={kind:'bid', chose:bid, best:best.bid, why:best.why};
        T.mistakes.push(fb);
      }
    }
    applyBid(bid, fb);
  }
  function applyBid(bid, feedback){
    T.auction.push({seat:T.turn, bid:bid});
    if(feedback) T.pauseHint=feedback; else if(T.turn===T.userSeat) T.lastHint=null;
    if(auctionDone()){
      var contractBid=null, dbl='';
      T.auction.forEach(function(a){ if(a.bid!=='P') contractBid=a; });
      if(!contractBid){ T.phase='done'; T.result={passed:true}; render(); return; }
      var st=Bidder.parse(contractBid.bid).st;
      /* הכרוז: הראשון בזוגיות שהכריז את הסדרה */
      var side=contractBid.seat%2;
      for(var i=0;i<T.auction.length;i++){
        var a=T.auction[i];
        if(a.bid!=='P' && a.seat%2===side && Bidder.parse(a.bid).st===st){ T.declarer=a.seat; break; }
      }
      T.contract=contractBid.bid;
      T.trump=st;
      T.dummy=(T.declarer+2)%4;
      T.phase='play';
      T.turn=(T.declarer+1)%4; /* מוביל = שמאלו של הכרוז */
      /* ponytail: הסבר חד-פעמי כשהמשתמש כרוז — מלמד את כלל שתי הידיים במקום להפתיע */
      if(T.declarer===T.userSeat) T.pauseHint={kind:'info', best:null,
        why:'אתה הכרוז! השותף פורש את הדומם ואתה מנהל את שתי הידיים — שלך ושלו. זה לב משחק הכרוז בברידג\': לתכנן את שתי הידיים כיחידה אחת. היד הפעילה מסומנת בזהב.'};
      render();
      setTimeout(nextIfBot,700);
      return;
    }
    T.turn=(T.turn+1)%4;
    render();
    if(T.turn!==T.userSeat) setTimeout(botBid,550);
  }

  /* ---------- play ---------- */
  function userControls(seat){
    /* המשתמש משחק את היד שלו; אם הוא הכרוז — גם את הדומם. הדומם של בוט משוחק ע"י הבוט. */
    if(seat===T.userSeat) return T.userSeat!==T.dummy || T.declarer===T.userSeat;
    if(T.declarer===T.userSeat && seat===T.dummy) return true;
    return false;
  }
  function legalCards(seat){
    var h=T.hands[seat], led=T.trick.length?T.trick[0].card[0]:null;
    if(led && h[led].length) return h[led].map(function(r){return led+r;});
    var out=[]; ['S','H','D','C'].forEach(function(s){h[s].forEach(function(r){out.push(s+r);});});
    return out;
  }
  function remainPBN(){
    /* PBN של הקלפים שנותרו, מהמוביל הנוכחי של הלקיחה */
    var first=T.trick.length?T.trick[0].seat:T.turn;
    return {
      trump:{S:0,H:1,D:2,C:3,NT:4}[T.trump],
      first:first,
      currentTrickSuit:T.trick.map(function(t){return {S:0,H:1,D:2,C:3}[t.card[0]];}),
      currentTrickRank:T.trick.map(function(t){return t.card[1]==='T'?10:('AKQJ'.indexOf(t.card[1])>=0?{A:14,K:13,Q:12,J:11}[t.card[1]]:+t.card[1]);}),
      remainCards:pbnOf(T.hands)
    };
  }
  function solveNow(){
    var d=remainPBN();
    while(d.currentTrickSuit.length<3){d.currentTrickSuit.push(0);d.currentTrickRank.push(0);}
    return dds({op:'solve', deal:d});
  }
  function cardScore(sol, card){
    var sIdx={S:0,H:1,D:2,C:3}[card[0]];
    var rVal=card[1]==='T'?10:({A:14,K:13,Q:12,J:11}[card[1]]||+card[1]);
    for(var i=0;i<sol.cards;i++){
      if(sol.suit[i]===sIdx && (sol.rank[i]===rVal || (sol.equals[i] & (1<<rVal)))) return sol.score[i];
    }
    return null;
  }
  function botPlay(){
    if(T.phase!=='play'||T.busy) return;
    T.busy=true;
    solveNow().then(function(sol){
      /* הבוט משחק את הקלף האופטימלי */
      var best=null, bs=-1;
      for(var i=0;i<sol.cards;i++){ if(sol.score[i]>bs){bs=sol.score[i];best=i;} }
      var suit=['S','H','D','C'][sol.suit[best]];
      var rank=sol.rank[best]===10?'T':({14:'A',13:'K',12:'Q',11:'J'}[sol.rank[best]]||String(sol.rank[best]));
      T.busy=false;
      playCard(T.turn, suit+rank, null);
    }).catch(function(e){
      /* fallback: קלף חוקי ראשון */
      T.busy=false;
      playCard(T.turn, legalCards(T.turn)[0], null);
    });
  }
  function userPlay(card){
    if(T.phase!=='play'||T.busy||T.pauseHint||!userControls(T.turn)) return;
    if(legalCards(T.turn).indexOf(card)<0) return;
    T.busy=true;
    var seat=T.turn;
    solveNow().then(function(sol){
      var chosen=cardScore(sol,card), bestIdx=0;
      for(var i=0;i<sol.cards;i++){ if(sol.score[i]>sol.score[bestIdx]) bestIdx=i; }
      var bestScore=sol.score[bestIdx], fb=null;
      if(chosen!=null && bestScore-chosen>0){
        var bSuit=['S','H','D','C'][sol.suit[bestIdx]];
        var bRank=sol.rank[bestIdx]===10?'T':({14:'A',13:'K',12:'Q',11:'J'}[sol.rank[bestIdx]]||String(sol.rank[bestIdx]));
        fb={kind:'play', chose:card, best:bSuit+bRank, cost:bestScore-chosen, trick:T.played+1,
            why:'במצב הזה הקלף '+disp(bSuit+bRank)+' משאיר לקו שלך '+bestScore+' לקיחות במשחק מדויק, והבחירה שלך מוותרת על '+(bestScore-chosen)+' מהן. '+
                (bestScore-chosen>=2?'זו טעות משמעותית — שווה לעצור ולחשוב מה השתנה. ':'')+
                'שימו לב לסדרת הקלף המומלץ: לרוב הסיבה היא שמירת כניסה, עקיפה נכונה או אי-בזבוז קלף גבוה.'};
        T.mistakes.push(fb);
      }
      T.busy=false;
      playCard(seat, card, fb);
    }).catch(function(){ T.busy=false; playCard(seat, card, null); });
  }
  function playCard(seat, card, feedback){
    var h=T.hands[seat][card[0]];
    var ix=h.indexOf(card[1]); if(ix<0) return;
    h.splice(ix,1);
    T.trick.push({seat:seat,card:card});
    /* משוב = עצירת ביניים (overlay); הבוטים מחכים עד "הבנתי" */
    if(feedback) T.pauseHint=feedback; else if(userControls(seat)) T.lastHint=null;
    if(T.trick.length===4){
      var winner=trickWinner();
      if(winner%2===0)T.tricksNS++; else T.tricksEW++;
      T.ledger.push(T.trick.slice());
      T.trick=[];
      T.played++;
      T.turn=winner;
      if(T.played===13){ finish(); return; }
    } else {
      T.turn=(T.turn+1)%4;
    }
    render();
    setTimeout(nextIfBot,650);
  }
  function trickWinner(){
    var led=T.trick[0].card[0], best=T.trick[0];
    T.trick.forEach(function(t){
      var s=t.card[0], bs=best.card[0];
      var tr=T.trump!=='NT'?T.trump:null;
      if(tr && s===tr && bs!==tr){ best=t; return; }
      if(s===bs && RANKS.indexOf(t.card[1])<RANKS.indexOf(best.card[1])) best=t;
    });
    return best.seat;
  }
  function nextIfBot(){
    if(T.phase!=='play'||T.pauseHint) return;
    if(!userControls(T.turn)) botPlay();
  }
  function finish(){
    T.phase='done';
    var lvl=+T.contract[0], need=6+lvl;
    var declNS=T.declarer%2===0, got=declNS?T.tricksNS:T.tricksEW;
    T.result={made:got>=need, got:got, need:need, over:got-need};
    render();
    if(T.onDone) T.onDone({contract:T.contract, declarer:T.declarer, made:T.result.made,
      got:got, need:need, mistakes:T.mistakes});
  }

  /* ---------- render ---------- */
  function disp(card){ return '<span class="tc-mini '+(card[0]==='H'||card[0]==='D'?'red':'blk')+'">'+SUIT_SYM[card[0]]+(RANK_DISP[card[1]]||card[1])+'</span>'; }
  function bidHe(b){ if(b==='P') return 'עבור'; var p=Bidder.parse(b); return '<span dir="ltr">'+p.lvl+(p.st==='NT'?'NT':SUIT_SYM[p.st])+'</span>'; }

  function handHTML(seat){
    var h=T.hands[seat], open = seat===T.userSeat || (T.phase!=='bid' && seat===T.dummy) || T.phase==='done';
    var canAct = T.phase==='play' && T.turn===seat && userControls(seat) && !T.busy;
    var legal = canAct ? legalCards(seat) : [];
    var html='<div class="tbl-hand'+(open?'':' closed')+(canAct?' active':'')+'" data-seat="'+seat+'">';
    if(!open){
      /* ponytail: יד סגורה = גב קלף אחד + מונה. 13 גבים מוערמים = גובה מבוזבז במובייל */
      var n=h.S.length+h.H.length+h.D.length+h.C.length;
      html+='<span class="tc back"></span><span class="closed-count">'+n+'</span>';
    } else {
      ['S','H','D','C'].forEach(function(s){
        h[s].forEach(function(r){
          var c=s+r, ok=legal.indexOf(c)>=0;
          html+='<button class="tc face '+(s==='H'||s==='D'?'red':'blk')+(ok?' playable':'')+'"'+
            (ok?' data-card="'+c+'"':' disabled')+'><b>'+(RANK_DISP[r]||r)+'</b><span class="s">'+SUIT_SYM[s]+'</span></button>';
        });
      });
    }
    return html+'</div>';
  }

  function render(){
    var el=T.el, html='<div class="btable">';
    /* פס עליון: חוזה/תור */
    html+='<div class="tbl-status">';
    if(T.phase==='bid') html+= T.turn===T.userSeat?'<strong>תורך להכריז</strong>':'תור '+SEAT_HE[SEATS[T.turn]]+'...';
    else if(T.phase==='play'){
      html+='<span class="chip">'+bidHe(T.contract)+'</span> כרוז: '+SEAT_HE[SEATS[T.declarer]]+
        ' <span class="chip" dir="ltr">'+T.tricksNS+' : '+T.tricksEW+'</span>';
      var who = userControls(T.turn)&&!T.busy ? '<strong>תורך לשחק'+(T.turn===T.dummy?' — מהדומם (אתה מנהל את שתי הידיים)':'')+'</strong>'
                                              : 'תור '+SEAT_HE[SEATS[T.turn]]+'...';
      html+='<br>'+who;
    } else if(T.result && T.result.passed) html+='<strong>כולם עברו — אין משחק.</strong>';
    else if(T.result) html+='<strong>'+(T.result.made?'החוזה בוצע! ':'החוזה נפל. ')+'</strong> לקחת '+T.result.got+' מתוך '+T.result.need+' נדרשות.';
    html+='</div>';

    /* השולחן */
    html+='<div class="tbl-grid">';
    html+='<div class="tbl-seat tbl-N"><div class="tbl-label">'+seatLabel(0)+'</div>'+handHTML(0)+'</div>';
    html+='<div class="tbl-seat tbl-W"><div class="tbl-label">'+seatLabel(3)+'</div>'+handHTML(3)+'</div>';
    html+='<div class="tbl-center">'+centerHTML()+'</div>';
    html+='<div class="tbl-seat tbl-E"><div class="tbl-label">'+seatLabel(1)+'</div>'+handHTML(1)+'</div>';
    html+='<div class="tbl-seat tbl-S"><div class="tbl-label">'+seatLabel(2)+'</div>'+handHTML(2)+'</div>';
    html+='</div>';

    /* קופסת הכרזות */
    if(T.phase==='bid' && T.turn===T.userSeat) html+=bidBoxHTML();

    /* משוב עצירה: שכבת ביניים על השולחן — המשחק מחכה ל"הבנתי" */
    if(T.pauseHint){
      var ph=T.pauseHint;
      html+='<div class="tbl-overlay"><div class="tbl-overlay-box">'+
        (ph.kind==='info' ? '<div class="ov-title">🃏 רגע חשוב</div><p>'+ph.why+'</p>'
          : '<div class="ov-title">💡 '+(ph.kind==='bid'?'הכרזה':'לקיחה '+(ph.trick||T.played+1))+': אפשר היה טוב יותר</div>'+
            '<p><strong>'+(ph.kind==='bid'
              ? 'הכרזת '+bidHe(ph.chose)+'; ההכרזה המומלצת: '+bidHe(ph.best)+'.'
              : 'שיחקת '+disp(ph.chose)+'; הקלף המומלץ: '+disp(ph.best)+'.')+'</strong></p>'+
            '<p>'+ph.why+'</p><p class="ov-note">ההחלטה שלך נשארת — ממשיכים ממנה. הערה זו תופיע גם בסיכום.</p>')+
        '<button class="btn btn-gold" id="ov-ok">הבנתי, ממשיכים ←</button></div></div>';
    }

    if(T.phase==='done') html+=doneHTML();
    html+='</div>';
    el.innerHTML=html;

    /* wiring */
    var ok=document.getElementById('ov-ok');
    if(ok) ok.addEventListener('click',function(){
      T.pauseHint=null; render();
      setTimeout(function(){ if(T.phase==='bid'){ if(T.turn!==T.userSeat) botBid(); } else nextIfBot(); },300);
    });
    el.querySelectorAll('.tc.playable').forEach(function(b){
      b.addEventListener('click',function(){userPlay(b.dataset.card);});
    });
    el.querySelectorAll('.bb-bid[data-bid]').forEach(function(b){
      b.addEventListener('click',function(){userBid(b.dataset.bid);});
    });
    el.querySelectorAll('.bb-lvl').forEach(function(b){
      b.addEventListener('click',function(){T.bidLvl=+b.dataset.lvl;render();});
    });
  }
  function seatLabel(seat){
    var tag=seat===T.userSeat?' (אתה)':(T.phase!=='bid'&&seat===T.dummy?' (דומם)':'');
    var bids=T.auction.filter(function(a){return a.seat===seat;});
    var lastB=T.phase==='bid'&&bids.length?' · '+bidHe(bids[bids.length-1].bid):'';
    var isTurn=T.phase!=='done'&&T.turn===seat;
    return '<span class="'+(isTurn?'turn-on':'')+'">'+(isTurn?'<span class="turn-dot"></span>':'')+SEAT_HE[SEATS[seat]]+tag+lastB+'</span>';
  }
  function centerHTML(){
    if(T.phase==='bid'){
      var SHORT={N:'צפ',E:'מז',S:'דר',W:'מע'};
      var rows=T.auction.slice(-8).map(function(a){return '<span class="au-item">'+SHORT[SEATS[a.seat]]+': '+bidHe(a.bid)+'</span>';}).join(' ');
      return '<div class="au-log">'+(rows||'המכרז מתחיל...')+'</div>';
    }
    var cards=T.trick.map(function(t){return '<div class="ct-card ct-'+SEATS[t.seat]+'">'+disp(t.card)+'</div>';}).join('');
    var pips='<div class="trick-pips">'+'●'.repeat(T.played)+'○'.repeat(13-T.played)+'</div>';
    return '<div class="ct-area">'+cards+'</div>'+pips;
  }
  function bidBoxHTML(){
    /* ponytail: קופסה דו-שלבית (גובה→סדרה) — 2 שורות במקום 7; סטנדרט מובייל */
    var last=null; T.auction.forEach(function(a){if(a.bid!=='P')last=a.bid;});
    var lvls=[]; for(var l=1;l<=7;l++){ if(['C','D','H','S','NT'].some(function(st){return Bidder.higher(l+st,last);})) lvls.push(l); }
    if(T.bidLvl==null || lvls.indexOf(T.bidLvl)<0) T.bidLvl=lvls[0];
    var html='<div class="bidbox"><div class="bb-title">בחר הכרזה: גובה, ואז סדרה</div><div class="bb-row bb-lvls">';
    for(var l=1;l<=7;l++){
      var on=lvls.indexOf(l)>=0;
      html+='<button class="bb-bid bb-lvl'+(l===T.bidLvl?' sel':'')+'" data-lvl="'+l+'"'+(on?'':' disabled')+'>'+l+'</button>';
    }
    html+='</div><div class="bb-row bb-strains">';
    ['C','D','H','S','NT'].forEach(function(st){
      var b=T.bidLvl+st, on=Bidder.higher(b,last);
      html+='<button class="bb-bid'+(st==='H'||st==='D'?' red':'')+'" data-bid="'+b+'"'+(on?'':' disabled')+'>'+T.bidLvl+(st==='NT'?'NT':SUIT_SYM[st])+'</button>';
    });
    html+='</div><button class="bb-bid bb-pass" data-bid="P">עבור</button></div>';
    return html;
  }
  function doneHTML(){
    var h='<div class="tbl-summary"><h3>סיכום התרגול</h3>';
    if(!T.mistakes.length) h+='<p>✔️ משחק מושלם — אף החלטה לא הייתה טובה יותר!</p>';
    else {
      h+='<p>נקודות לשיפור ('+T.mistakes.length+'):</p><ul>';
      T.mistakes.forEach(function(m){
        h+='<li>'+(m.kind==='bid'?'הכרזה: בחרת '+bidHe(m.chose)+', מומלץ '+bidHe(m.best):'לקיחה '+(m.trick||'?')+': בחרת '+disp(m.chose)+', מומלץ '+disp(m.best))+' — '+m.why+'</li>';
      });
      h+='</ul>';
    }
    h+='<button class="btn btn-green" onclick="location.reload()">חלוקה חדשה</button></div>';
    return h;
  }

  return {start:start};
})();
