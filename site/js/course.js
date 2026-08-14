/* course.js — מסלול הלימוד: נתוני שלבים, התקדמות (localStorage), נגן שיעור.
   ponytail: תוכן חלק 1 (מפגשים 1-7) מחובר; שאר המפגשים נוספים כנתונים בלבד, בלי קוד חדש. */
var Course = (function(){
  var LS='bg-course';

  /* ---------- מחוללי חלוקות מותנות (rejection sampling) ---------- */
  function dealUntil(cond){
    for(var i=0;i<5000;i++){
      var deck=[]; ['S','H','D','C'].forEach(function(s){'AKQJT98765432'.split('').forEach(function(r){deck.push(s+r);});});
      for(var k=deck.length-1;k>0;k--){var j=Math.floor(Math.random()*(k+1)),t=deck[k];deck[k]=deck[j];deck[j]=t;}
      var hands=[0,1,2,3].map(function(q){
        var h={S:[],H:[],D:[],C:[]};
        deck.slice(q*13,(q+1)*13).forEach(function(c){h[c[0]].push(c[1]);});
        ['S','H','D','C'].forEach(function(s){h[s].sort(function(a,b){return 'AKQJT98765432'.indexOf(a)-'AKQJT98765432'.indexOf(b);});});
        return h;
      });
      if(cond(hands)) return hands.map(function(h){
        return ['S','H','D','C'].map(function(s){return h[s].join('');}).join('.');
      });
    }
    return null; /* fallback: חלוקה אקראית */
  }
  var G={
    /* המשתמש (דרום) פותח 1NT */
    user1NT: function(){ return dealUntil(function(h){
      var p=Bridge.hcp(h[2]); return p>=15&&p<=17&&Bridge.isBalanced(h[2]);
    });},
    /* המשתמש פותח 1♠/1♥ */
    userMajor: function(){ return dealUntil(function(h){
      var p=Bridge.hcp(h[2]); return p>=12&&p<=18&&(h[2].S.length>=5||h[2].H.length>=5);
    });},
    /* המשתמש פותח במיינור */
    userMinor: function(){ return dealUntil(function(h){
      var p=Bridge.hcp(h[2]); return p>=12&&p<=17&&h[2].S.length<5&&h[2].H.length<5&&!(p>=15&&Bridge.isBalanced(h[2]));
    });},
    /* השותף (צפון) פותח מייג'ור, למשתמש יש תמיכה */
    partnerMajorFit: function(){ return dealUntil(function(h){
      var pn=Bridge.hcp(h[0]), ps=Bridge.hcp(h[2]);
      var maj=h[0].S.length>=5?'S':(h[0].H.length>=5?'H':null);
      return maj && pn>=12&&pn<=16 && ps>=6&&ps<=11 && h[2][maj].length>=3 && !(pn>=15&&Bridge.isBalanced(h[0]));
    });},
    /* השותף פותח 1NT, למשתמש 8+ ורביעייה במייג'ור (סטיימן) */
    stayman: function(){ return dealUntil(function(h){
      var pn=Bridge.hcp(h[0]), ps=Bridge.hcp(h[2]);
      return pn>=15&&pn<=17&&Bridge.isBalanced(h[0]) && ps>=8&&ps<=13 && (h[2].H.length===4||h[2].S.length===4);
    });},
    /* חוזה NT פשוט למשתמש: הוא יהיה הכרוז */
    userStrongNT: function(){ return dealUntil(function(h){
      var p=Bridge.hcp(h[2]); return p>=15&&p<=17&&Bridge.isBalanced(h[2])&&Bridge.hcp(h[0])>=8&&Bridge.hcp(h[0])<=11;
    });},
    random: function(){ return null; }
  };

  /* ---------- שאלות חידון קבועות ---------- */
  function q(text,opts,correct,explain,hand){ return {q:text,opts:opts,correct:correct,explain:explain,handStr:hand||null}; }

  /* ---------- נתוני המסלול ---------- */
  var PARTS=[
    {id:1, title:'חלק 1: קורס מתחילים — יסודות הברידג\'', steps:[
      {id:'1.1', meet:'מפגשים 1-2', title:'מבנה המשחק, לקיחות ונקודות',
       theory:[
         '<h2>ארבעה שחקנים, שני צוותים</h2><p>בברידג\' יושבים ארבעה שחקנים בארבע רוחות: צפון, מזרח, דרום ומערב. צפון ודרום הם צוות אחד, מזרח ומערב צוות שני. כל שחקן מקבל 13 קלפים.</p>',
         '<h2>הלקיחה (Trick)</h2><p>כל סיבוב, כל שחקן שם קלף אחד — ביחד ארבעה קלפים = לקיחה אחת. חייבים <strong>לעקוב אחר הסדרה</strong> שהובלה אם יש לכם קלף ממנה. הקלף הגבוה ביותר בסדרת ההובלה זוכה — אלא אם מישהו חתך בשליט.</p>',
         '<h2>שליט (Trump) מול ללא שליט (NT)</h2><p>בחוזה עם שליט, סדרת השליט גוברת על כל השאר: אין לכם קלף בסדרה שהובלה? קלף שליט קטן זוכה גם על אס. בחוזה ללא שליט אין קסמים — הגבוה בסדרה זוכה, נקודה.</p>',
         '<h2>ספירת נקודות (HCP)</h2><p>הבסיס לכל הכרזה: <strong>אס = 4, מלך = 3, מלכה = 2, נסיך = 1</strong>. בחפיסה כולה 40 נקודות; יד ממוצעת מחזיקה 10.</p><div class="tip">💡 מהיום, כל יד שאתם מרימים — קודם כל סופרים נקודות. שזה ייעשה אוטומטי.</div>'
       ],
       quiz:{gen:'hcp', n:4},
       practice:{gen:'userStrongNT', dealer:2,
         intro:'שחקו יד ראשונה! אתם דרום. הכריזו לפי מה שלמדתם (עם יד מאוזנת של 15-17 נק\' פותחים 1NT), והמערכת תלווה אתכם קלף-קלף. מותר לטעות — כל טעות מקבלת הסבר.'}},
      {id:'1.2', meet:'מפגש 3', title:'פתיחות בגובה 1 — סדרות המייג\'ור',
       theory:[
         '<h2>מהו מייג\'ור ולמה הוא חשוב</h2><p>♠ ספייד ו-♥ הארט הן <strong>סדרות המייג\'ור</strong> — הן שוות יותר נקודות בחוזה. המטרה הראשונה של כל מכרז: לבדוק אם יש לצוות התאמה של 8+ קלפים במייג\'ור.</p>',
         '<h2>תנאי הפתיחה</h2><p>פותחים 1♠ או 1♥ עם: <strong>12+ נקודות</strong> וסדרה של <strong>5 קלפים לפחות</strong>. יש חמישייה בשתיהן? פותחים בארוכה יותר; שוות — פותחים 1♠.</p>',
         '<h2>אין 12? עוברים</h2><p>יד עם פחות מ-12 נקודות לא פותחת. "עבור" (Pass) היא הכרזה לגיטימית וחכמה — רוב הידיים לא פותחות.</p><div class="tip">💡 5 קלפים זה קו אדום: עם רביעייה בלבד במייג\'ור פותחים במיינור, לעולם לא במייג\'ור.</div>'
       ],
       quiz:{gen:'opening', n:5},
       practice:{gen:'userMajor', dealer:2,
         intro:'קיבלתם יד עם חמישייה במייג\'ור וכוח פתיחה. אתם המחלק — פתחו נכון, עקבו אחרי תגובת השותף, ושחקו את היד עד הסוף.'}},
      {id:'1.3', meet:'מפגש 4', title:'תגובות השותף לפתיחת מייג\'ור',
       theory:[
         '<h2>קודם כל: יש התאמה?</h2><p>השותף פתח 1♥ או 1♠ — הוא מבטיח חמישייה. יש לכם 3 קלפים בסדרתו? יש התאמה (5+3=8). עכשיו הכל שאלה של כוח.</p>',
         '<h2>סולם התמיכה</h2><p><strong>6-9 נק\':</strong> תמיכה בגובה 2 (למשל 1♥ ← 2♥).<br><strong>10-11 נק\':</strong> תמיכה מזמינה בגובה 3.<br><strong>12+ נק\':</strong> ישר לגיים — 4♥/4♠!</p>',
         '<h2>אין התאמה?</h2><p>עם 6+ נקודות מכריזים סדרה חדשה בגובה 1 ("אחד מעל אחד") או 1NT עם 6-9. עם פחות מ-6 — עוברים, גם אם זה מרגיש לא נעים.</p><div class="tip">💡 תמיכה מיידית בשותף היא ההכרזה הכי מדויקת בברידג\': היא מספרת גם על התאמה וגם על כוח, במכה אחת.</div>'
       ],
       quiz:{fixed:[
         q('השותף פתח 1♥. מה תכריזו עם היד הזו?',['עבור','2♥','3♥','4♥'],1,'9 נקודות ותמיכה שלישייה: תמיכה חלשה בגובה 2 (6-9 נק\').','K74.Q93.A852.762'),
         q('השותף פתח 1♠. ביד: 13 נק\' ו-4 קלפי ספייד. מה נכון?',['2♠','3♠','4♠','2NT'],2,'עם 12+ נקודות והתאמה מכריזים גיים ישירות: 4♠.'),
         q('השותף פתח 1♥ ולכם 4 נקודות בלבד עם שלישיית הארט. מה נכון?',['עבור','2♥','1NT','2♣'],0,'פחות מ-6 נקודות: עוברים. גם התאמה לא מצילה יד חלשה מדי.'),
         q('השותף פתח 1♥. בידכם 8 נק\' וארבעה קלפי ספייד (בלי התאמת הארט). מה תכריזו?',['עבור','1♠','2♠','1NT'],1,'"אחד מעל אחד": סדרה חדשה בגובה 1 עם 6+ נק\' — מחפשים התאמה שנייה.'),
         q('מהי התאמה (Fit)?',['7 קלפים משותפים','8 קלפים משותפים','9 קלפים משותפים','אותו מספר קלפים בשתי הידיים'],1,'התאמה = 8+ קלפים משותפים בסדרה אחת. חמישייה של הפותח + שלישייה שלכם = 8.')
       ]},
       practice:{gen:'partnerMajorFit', dealer:0,
         intro:'הפעם השותף (צפון) פותח. ספרו נקודות, בדקו התאמה, והשיבו לפי הסולם: 6-9 גובה 2, 10-11 גובה 3, 12+ גיים.'}},
      {id:'1.4', meet:'מפגש 5', title:'פתיחות במיינור — ♦ ו-♣',
       theory:[
         '<h2>ברירת המחדל של הפותח</h2><p>יש 12+ נקודות אבל אין חמישייה במייג\'ור? פותחים במיינור: <strong>1♦ עם דיאמונד ארוך או שווה לקלאב, אחרת 1♣</strong>. פתיחת מיינור אומרת "יש לי כוח פתיחה" — לא "יש לי סדרה ארוכה".</p>',
         '<h2>תפקיד המשיב: לחפש מייג\'ור</h2><p>מול 1♣/1♦, המשיב עם 6+ נקודות מכריז רביעייה במייג\'ור אם יש לו — בגובה 1. רק בלי מייג\'ור הוא תומך במיינור או מכריז NT.</p><div class="tip">💡 זוכרים את סדר העדיפויות: קודם מייג\'ור, אחר כך הכל. גם מול פתיחת מיינור, המטרה נשארת למצוא 8 קלפי מייג\'ור משותפים.</div>'
       ],
       quiz:{gen:'opening', n:5},
       practice:{gen:'userMinor', dealer:2,
         intro:'יד פתיחה בלי חמישייה במייג\'ור. פתחו במיינור הנכון ותנו למכרז להתגלגל.'}},
      {id:'1.5', meet:'מפגש 6', title:'פתיחת 1NT ותגובות טבעיות',
       theory:[
         '<h2>ההכרזה המדויקת במשחק</h2><p>1NT מתארת יד בטווח צר להפליא: <strong>15-17 נקודות, יד מאוזנת</strong> (4-3-3-3, 4-4-3-2 או 5-3-3-2). השותף יודע כמעט הכל אחרי הכרזה אחת.</p>',
         '<h2>המשיב מחשב: 25 = גיים</h2><p>כלל האצבע: לצוות צריך בערך 25 נקודות ל-3NT. לכן מול 15-17:<br><strong>0-7 נק\':</strong> עבור.<br><strong>8-9 נק\':</strong> 2NT — הזמנה ("יש לך 17? קדימה").<br><strong>10+ נק\':</strong> 3NT — גיים!</p><div class="tip">💡 המשיב הוא הקברניט מול 1NT: הוא יודע את הכוח המשותף, הפותח לא. ההחלטות שלו.</div>'
       ],
       quiz:{fixed:[
         q('איזו יד מתאימה לפתיחת 1NT?',['17 נק\' עם חמישיית הארט ושישיית קלאב','16 נק\' מאוזנת','12 נק\' מאוזנת','19 נק\' מאוזנת'],1,'1NT = 15-17 מאוזנת בדיוק. 12 חלשה מדי, 19 חזקה מדי, ויד עם שתי סדרות ארוכות אינה מאוזנת.'),
         q('השותף פתח 1NT ולכם 6 נקודות מאוזנות. מה נכון?',['עבור','2NT','3NT','2♣'],0,'6 + מקסימום 17 = 23. אין גיים באופק — עוברים ונשארים נמוך.'),
         q('השותף פתח 1NT ולכם 9 נקודות. מה נכון?',['עבור','2NT','3NT','4NT'],1,'8-9 נק\' = הזמנה 2NT: הפותח ישלים לגיים עם 16-17 ויעצור עם 15.'),
         q('השותף פתח 1NT ולכם 11 נקודות בלי מייג\'ור. מה נכון?',['2NT','3NT','עבור','2♦'],1,'10+ מול 15-17 מבטיח 25+: מכריזים 3NT ישירות.')
       ]},
       practice:{gen:'user1NT', dealer:2,
         intro:'יד מאוזנת 15-17. פתחו 1NT, תנו לשותף להחליט, ואז — הפרס: אתם משחקים את היד ככרוז.'}},
      {id:'1.6', meet:'מפגש 7', title:'קונבנציית סטיימן (2♣)',
       theory:[
         '<h2>הבעיה שסטיימן פותרת</h2><p>השותף פתח 1NT ולכם 8+ נקודות ורביעייה בהארט או בספייד. אולי לפותח יש גם רביעייה? התאמת 4-4 במייג\'ור שווה יותר מ-3NT — אבל איך מגלים?</p>',
         '<h2>המנגנון</h2><p>מכריזים <strong>2♣ — שאלה מלאכותית</strong> (לא קשורה לקלאב!): "שותף, יש לך רביעייה במייג\'ור?"<br>תשובות הפותח:<br><strong>2♦</strong> = אין לי.<br><strong>2♥</strong> = יש רביעיית הארט.<br><strong>2♠</strong> = יש רביעיית ספייד.</p>',
         '<h2>וההמשך?</h2><p>נמצאה התאמה 4-4: עם 8-9 מזמינים בגובה 3, עם 10+ מכריזים גיים במייג\'ור. אין התאמה: חוזרים ל-NT בגובה המתאים לכוח.</p><div class="tip">💡 תנאי כניסה לסטיימן: 8+ נקודות ורביעייה במייג\'ור אחד לפחות. בלי שניהם — מגיבים טבעי.</div>'
       ],
       quiz:{fixed:[
         q('השותף פתח 1NT. עם אילו ידיים נכריז 2♣ (סטיימן)?',['5 נק\' ורביעיית הארט','9 נק\' ורביעיית ספייד','10 נק\' בלי מייג\'ור','7 נק\' מאוזנות'],1,'סטיימן דורש 8+ נק\' ורביעייה במייג\'ור. 5 ו-7 חלשות מדי; בלי מייג\'ור אין מה לשאול.'),
         q('הכרזתם 2♣ והפותח ענה 2♦. מה זה אומר?',['יש לו רביעיית דיאמונד','אין לו רביעייה במייג\'ור','יש לו 17 נקודות','הוא רוצה לשחק 2♦'],1,'2♦ = תשובה שלילית: אין רביעייה באף מייג\'ור. גם היא מלאכותית לחלוטין.'),
         q('שאלתם סטיימן עם 11 נק\' ורביעיית הארט; הפותח ענה 2♥. מה עכשיו?',['3♥','4♥','3NT','עבור'],1,'נמצאה התאמת 4-4 ויש כוח לגיים (11+15=26): מכריזים 4♥.'),
         q('שאלתם סטיימן עם 8 נק\' ורביעיית ספייד; הפותח ענה 2♦. מה עכשיו?',['2♠','2NT','3NT','עבור'],1,'אין התאמה: חוזרים למסלול ה-NT עם הזמנה — 2NT (8-9 נק\').')
       ]},
       practice:{gen:'stayman', dealer:0,
         intro:'השותף פותח 1NT ולכם יד עם רביעייה במייג\'ור ו-8+ נקודות. הפעילו את סטיימן ומצאו (או שללו) את ההתאמה — ואז שחקו.'}}
    ]},
    {id:2, title:'חלק 2: קורס ביניים — הכרזות תחרותיות', steps:[]},
    {id:3, title:'חלק 3: קורס מתקדמים — חקירת סלאם וטכניקה', steps:[]},
    {id:4, title:'חלק 4: ברידג\' תחרותי', steps:[]}
  ];

  /* ---------- התקדמות ---------- */
  function prog(){ try{ return JSON.parse(localStorage.getItem(LS))||{}; }catch(e){ return {}; } }
  function save(p){ localStorage.setItem(LS, JSON.stringify(p)); }
  function markQuiz(id,score,total){ var p=prog(); p[id]=p[id]||{}; p[id].quiz=score+'/'+total; save(p); }
  function markDone(id){ var p=prog(); p[id]=p[id]||{}; p[id].done=true; save(p); }
  function findStep(id){
    for(var i=0;i<PARTS.length;i++){
      var s=PARTS[i].steps, ix=s.findIndex(function(x){return x.id===id;});
      if(ix>=0) return {part:PARTS[i], step:s[ix], next:s[ix+1]||null};
    }
    return null;
  }

  /* ---------- חידון קבוע/מחולל עם סיום ---------- */
  function runQuiz(el, cfg, onFinish){
    var box=document.getElementById(el), i=0, score=0;
    var total = cfg.fixed ? cfg.fixed.length : cfg.n;
    function next(){
      if(i>=total){
        box.innerHTML='<div class="quiz-q">סיימתם את החידון: '+score+' מתוך '+total+' ✔️</div>'+
          '<div class="quiz-next"><button class="btn btn-gold" id="qz-go">המשך לתרגול המעשי ←</button></div>';
        document.getElementById('qz-go').addEventListener('click',function(){ onFinish(score,total); });
        return;
      }
      var cur = cfg.fixed ? cfg.fixed[i] : (cfg.gen==='hcp'?Quiz.genHcpQuestion():Quiz.genOpeningQuestion());
      i++;
      var html='';
      if(cur.handStr) html+='<div id="qz-hand"></div>';
      html+='<div class="quiz-q">שאלה '+i+' מתוך '+total+': '+cur.q+'</div><div class="quiz-opts">';
      cur.opts.forEach(function(o,k){ html+='<button class="quiz-opt" data-i="'+k+'">'+o+'</button>'; });
      html+='</div><div class="quiz-explain" id="qz-explain"></div>'+
        '<div class="quiz-next"><button class="btn btn-green" id="qz-next" style="display:none">'+(i===total?'סיום החידון':'שאלה הבאה')+' ←</button></div>';
      box.innerHTML=html;
      if(cur.handStr) Bridge.renderHand(Bridge.parseHand(cur.handStr), document.getElementById('qz-hand'));
      box.querySelectorAll('.quiz-opt').forEach(function(btn){
        btn.addEventListener('click',function(){
          box.querySelectorAll('.quiz-opt').forEach(function(b){b.disabled=true;});
          box.querySelectorAll('.quiz-opt')[cur.correct].classList.add('correct');
          if(+btn.dataset.i===cur.correct) score++; else btn.classList.add('wrong');
          var ex=document.getElementById('qz-explain');
          ex.innerHTML='<strong>'+(+btn.dataset.i===cur.correct?'נכון! ':'התשובה הנכונה: '+cur.opts[cur.correct]+'. ')+'</strong>'+cur.explain;
          ex.classList.add('show');
          document.getElementById('qz-next').style.display='inline-block';
        });
      });
      document.getElementById('qz-next').addEventListener('click',next);
    }
    next();
  }

  return {PARTS:PARTS, G:G, prog:prog, markQuiz:markQuiz, markDone:markDone, findStep:findStep, runQuiz:runQuiz, dealUntil:dealUntil};
})();
