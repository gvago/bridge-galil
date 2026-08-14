/* bidder.js — מכריז טבעי מבוסס-כללים (מייג'ור חמישייה, 1NT 15-17, סטיימן).
   ponytail: מכסה את רמת שלב 1 של הקורס + שכל ישר; לא מנוע תחרותי. להרחיב כשמגיעים לשלב 2 (טרנספרים, וויק-טו). */
var Bidder = (function(){
  var STRAINS = ['C','D','H','S','NT'];

  function parse(b){ if(!b || b==='P') return null; return {lvl:+b[0], st:b.slice(1)}; }
  function val(b){ var p=parse(b); return p ? p.lvl*5 + STRAINS.indexOf(p.st) : -1; }
  function higher(bid, last){ return !last || val(bid) > val(last); }
  function minBid(st, last){
    for(var l=1;l<=7;l++){ var b=l+st; if(higher(b,last)) return b; }
    return null;
  }
  function suitLen(hand,s){ return hand[s].length; }

  /* מצב המכרז מנקודת מבטו של seat. auction = [{seat,bid}...], מושבים 0=N 1=E 2=S 3=W */
  function ctx(auction, me){
    var partner=(me+2)%4, c={me:[],partner:[],opp:[],last:null,opener:-1,openBid:null};
    auction.forEach(function(a){
      if(a.bid==='P') return;
      if(c.opener<0){ c.opener=a.seat; c.openBid=a.bid; }
      c.last=a.bid;
      if(a.seat===me) c.me.push(a.bid);
      else if(a.seat===partner) c.partner.push(a.bid);
      else c.opp.push(a.bid);
    });
    return c;
  }

  function opening(hand){
    var p = Bridge.hcp(hand);
    if(p >= 22) return {bid:'2C', why:'22+ נק\': פתיחת 2♣ מלאכותית ומחייבת — היד החזקה במשחק (מפגש 16).'};
    if(p >= 20 && p <= 21 && Bridge.isBalanced(hand))
      return {bid:'2NT', why:'יד מאוזנת חזקה מאוד (20-21 נק\'): פתיחת 2NT.'};
    if(p >= 15 && p <= 17 && Bridge.isBalanced(hand))
      return {bid:'1NT', why:'יד מאוזנת עם 15-17 נקודות: פתיחת 1NT מתארת את היד במדויק (מפגש 6).'};
    if(p >= 6 && p <= 10){
      var seven=null; ['S','H','D','C'].forEach(function(s){ if(!seven && hand[s].length>=7) seven=s; });
      if(seven) return {bid:'3'+seven, why:'סדרה שביעייה ויד חלשה: פתיחת מנע בגובה 3 — גוזלת מרחב הכרזה מהיריבים (מפגש 14).'};
      var six=null; ['S','H','D'].forEach(function(s){ if(!six && hand[s].length===6) six=s; });
      if(six) return {bid:'2'+six, why:'שישייה בדיוק ו-6-10 נק\': פתיחה חלשה בגובה 2 (מפגש 15).'};
    }
    if(p < 12) return {bid:'P', why:'עם פחות מ-12 נקודות אין פתיחה (מפגש 3).'};
    var s=suitLen(hand,'S'), h=suitLen(hand,'H'), d=suitLen(hand,'D'), c=suitLen(hand,'C');
    if(s>=5 && s>=h) return {bid:'1S', why:'12+ נק\' וחמישייה בספייד: פותחים בסדרת המייג\'ור הארוכה (מפגש 3).'};
    if(h>=5) return {bid:'1H', why:'12+ נק\' וחמישייה בהארט: פותחים במייג\'ור (מפגש 3).'};
    if(d>=c) return {bid:'1D', why:'ללא חמישייה במייג\'ור: פותחים במיינור הארוך יותר (מפגש 5).'};
    return {bid:'1C', why:'ללא חמישייה במייג\'ור והקלאב ארוך מהדיאמונד: פותחים 1♣ (מפגש 5).'};
  }

  /* תגובות לפתיחת שותף */
  function respond(hand, openBid, last){
    var p = Bridge.hcp(hand), o = parse(openBid);
    /* פתיחות מיוחדות בגובה 2-3 */
    if(o.st==='C' && o.lvl===2)
      return {bid:'2D', why:'מול 2♣ החזק: 2♦ תשובה אוטומטית (Waiting) — הפותח יתאר את ידו (מפגש 16).'};
    if(o.lvl===2 && o.st!=='NT'){ /* Weak Two */
      if(p>=15 && higher('2NT',last)) return {bid:'2NT', why:'מול פתיחה חלשה: 2NT שואל את הפותח על עוצמה (מפגש 15).'};
      if(suitLen(hand,o.st)>=3 && p>=8 && higher('3'+o.st,last)) return {bid:'3'+o.st, why:'העלאה חסומה: ממשיכים את ההפרעה עם התאמה (מפגש 15).'};
      return {bid:'P', why:'מול פתיחה חלשה, בלי יד חזקה או התאמה — עבור (מפגש 15).'};
    }
    if(o.lvl>=3) return p>=16 && suitLen(hand,o.st)>=2 && higher('4'+o.st,last)
      ? {bid:'4'+o.st, why:'מול פתיחת מנע: יד חזקה מאוד משלימה לגיים.'}
      : {bid:'P', why:'מול פתיחת מנע של השותף כמעט תמיד עוברים — היד שלו חלשה (מפגש 14).'};
    if(o.st==='NT' && o.lvl>=2){
      if(o.lvl>=3) return {bid:'P', why:'הפותח כבר בגיים: עבור.'};
      if(p>=5) return {bid:'3NT', why:'מול 2NT (20-21) מספיקות 5 נק\' לגיים: 3NT.'};
      return {bid:'P', why:'יד חלשה מדי גם מול 2NT: עבור.'};
    }
    if(o.st==='NT' && o.lvl===1){
      /* ג'קובי טרנספר לפני סטיימן: חמישייה במייג'ור */
      if(suitLen(hand,'H')>=5 && higher('2D',last))
        return {bid:'2D', why:'ג\'קובי טרנספר: 2♦ מורה לפותח להכריז 2♥ — החוזה ישוחק מהיד החזקה (מפגש 11).'};
      if(suitLen(hand,'S')>=5 && higher('2H',last))
        return {bid:'2H', why:'ג\'קובי טרנספר: 2♥ מורה לפותח להכריז 2♠ (מפגש 11).'};
      var m4 = suitLen(hand,'H')>=4 ? 'H' : (suitLen(hand,'S')>=4 ? 'S' : null);
      if(p>=8 && m4 && higher('2C',last))
        return {bid:'2C', why:'8+ נק\' ורביעייה במייג\'ור: סטיימן 2♣ — שואלים את הפותח אם יש לו רביעייה (מפגש 7).'};
      if(p>=10) return {bid:'3NT', why:'10+ נק\' מול 15-17: יש כוח לגיים — 3NT (מפגש 6).'};
      if(p>=8) return {bid:'2NT', why:'8-9 נק\': הזמנה ל-3NT — הפותח ימשיך עם מקסימום (מפגש 6).'};
      return {bid:'P', why:'עם פחות מ-8 נקודות מול 1NT נשארים נמוך: עבור (מפגש 6).'};
    }
    if(o.st==='H' || o.st==='S'){
      var fit = suitLen(hand, o.st) >= 3;
      if(fit){
        if(p>=12 && higher('4'+o.st,last)) return {bid:'4'+o.st, why:'התאמה (3+ קלפים) ו-12+ נק\': מכריזים גיים ישירות (מפגש 4).'};
        if(p>=10 && higher('3'+o.st,last)) return {bid:'3'+o.st, why:'התאמה ו-10-11 נק\': תמיכה מזמינה בגובה 3 (מפגש 4).'};
        if(p>=6 && higher('2'+o.st,last)) return {bid:'2'+o.st, why:'התאמה ו-6-9 נק\': תמיכה חלשה בגובה 2 (מפגש 4).'};
        return {bid:'P', why:'פחות מ-6 נקודות: עוברים גם עם התאמה (מפגש 4).'};
      }
      if(p<6) return {bid:'P', why:'פחות מ-6 נקודות וללא התאמה: עבור (מפגש 4).'};
      if(o.st==='H' && suitLen(hand,'S')>=4 && higher('1S',last))
        return {bid:'1S', why:'ללא התאמה בהארט אך עם 4+ ספייד ו-6+ נק\': מכריזים "1 מעל 1" (מפגש 4).'};
      if(p<=9) return {bid:'1NT', why:'6-9 נק\' ללא התאמה וללא סדרה נוחה בגובה 1: תגובת 1NT (מפגש 4).'};
      var suits=['C','D','H','S'].filter(function(s){return s!==o.st && suitLen(hand,s)>=4;});
      if(suits.length){ var b=minBid(suits[0],last); if(b) return {bid:b, why:'10+ נק\': מכריזים סדרה חדשה — הכרזה מחייבת (מפגש 4).'}; }
      return {bid:'2NT', why:'10-12 נק\' מאוזנות ללא התאמה: 2NT.'};
    }
    /* פתיחת מיינור */
    var hl=suitLen(hand,'H'), sl=suitLen(hand,'S');
    if(p>=6){
      if(hl>=4 && hl>=sl && higher('1H',last)) return {bid:'1H', why:'6+ נק\' ורביעייה בהארט: מחפשים התאמת מייג\'ור לפני הכל (מפגש 5).'};
      if(sl>=4 && higher('1S',last)) return {bid:'1S', why:'6+ נק\' ורביעייה בספייד: מחפשים התאמת מייג\'ור (מפגש 5).'};
    }
    if(p>=10 && suitLen(hand,o.st)>=5 && higher('3'+o.st,last)) return {bid:'3'+o.st, why:'תמיכה ארוכה במיינור ו-10+ נק\'.'};
    if(p>=6 && suitLen(hand,o.st)>=5 && higher('2'+o.st,last)) return {bid:'2'+o.st, why:'5+ קלפי תמיכה במיינור ו-6-9 נק\'.'};
    if(p>=13) return {bid:'3NT', why:'13+ נק\' מאוזנות ללא מייג\'ור: ישר לגיים 3NT.'};
    if(p>=6) return {bid:'1NT', why:'6-9 נק\' ללא רביעייה במייג\'ור: תגובת 1NT (מפגש 5).'};
    return {bid:'P', why:'פחות מ-6 נקודות: עבור.'};
  }

  /* הכרזה שנייה של הפותח */
  function rebid(hand, c){
    var p = Bridge.hcp(hand) + Bridge.distPoints(hand);
    var my = parse(c.me[0]), pr = parse(c.partner[c.partner.length-1]), last=c.last;
    if(!pr) return {bid:'P', why:'השותף עבר: אין סיבה להמשיך עם יד רגילה.'};
    /* אחרי פתיחת 2♣: תיאור היד */
    if(my.st==='C' && my.lvl===2){
      if(Bridge.isBalanced(hand)){ var nb2=minBid('NT',last); if(nb2) return {bid:nb2, why:'2♣ ואז NT: יד עצומה מאוזנת (מפגש 16).'}; }
      var lg=Bridge.longestSuit(hand); var lb=minBid(lg,last);
      if(lb) return {bid:lb, why:'2♣ ואז הסדרה האמיתית: יד עצומה לא מאוזנת (מפגש 16).'};
    }
    /* השלמת ג'קובי טרנספר */
    if(my.st==='NT' && my.lvl===1 && pr.lvl===2 && (pr.st==='D'||pr.st==='H')){
      var target = pr.st==='D' ? 'H' : 'S';
      var tb=minBid(target,last);
      if(tb) return {bid:tb, why:'השלמת הטרנספר: מכריזים את המייג\'ור שהשותף הראה (מפגש 11).'};
    }
    /* תשובה לסטיימן */
    if(my.st==='NT' && my.lvl===1 && pr.lvl===2 && pr.st==='C'){
      if(suitLen(hand,'H')>=4) return {bid:'2H', why:'תשובה לסטיימן: יש רביעייה בהארט (מפגש 7).'};
      if(suitLen(hand,'S')>=4) return {bid:'2S', why:'תשובה לסטיימן: יש רביעייה בספייד (מפגש 7).'};
      return {bid:'2D', why:'תשובה לסטיימן: 2♦ = אין רביעייה במייג\'ור (מפגש 7).'};
    }
    if(my.st==='NT' && pr.st==='NT' && pr.lvl===2)
      return Bridge.hcp(hand)>=16 ? {bid:'3NT', why:'מקסימום (16-17): מקבלים את ההזמנה (מפגש 6).'}
                                  : {bid:'P', why:'מינימום (15): מסרבים להזמנה (מפגש 6).'};
    /* השותף תמך בסדרה שלי */
    if((my.st==='H'||my.st==='S') && pr.st===my.st){
      if(pr.lvl>=4) return {bid:'P', why:'הגיים הוכרז: המכרז הסתיים.'};
      if(pr.lvl===3) return p>=14 ? {bid:'4'+my.st, why:'מול הזמנה (10-11): עם 14+ נק\' משלימים לגיים.'} : {bid:'P', why:'מול הזמנה: יד מינימלית נשארת בגובה 3.'};
      return p>=17 ? {bid:'3'+my.st, why:'מול תמיכה חלשה: 17+ נק\' מזמינות לגיים.'} : {bid:'P', why:'מול תמיכה חלשה (6-9) יד רגילה עוצרת: עבור.'};
    }
    /* השותף הכריז סדרה חדשה — תמיכה עם 4, אחרת סדרה/NT */
    if(pr.st!=='NT' && suitLen(hand,pr.st)>=4){
      var lvl = p>=19 ? Math.min(pr.lvl+2,4) : pr.lvl+1;
      var b = lvl+pr.st;
      if(higher(b,last)) return {bid:b, why:'התאמה של 4 קלפים לסדרת השותף: תומכים בגובה המתאים לכוח היד.'};
    }
    if(my.st!=='NT' && suitLen(hand,my.st)>=6){ var rb=minBid(my.st,last); if(rb) return {bid:rb, why:'סדרה שישייה: חוזרים על הסדרה.'}; }
    if(Bridge.isBalanced(hand)){ var nb=minBid('NT',last); if(nb && parse(nb).lvl<=2) return {bid:nb, why:'יד מאוזנת ללא התאמה: הכרזת NT זולה.'}; }
    var alt=['C','D','H','S'].filter(function(s){return s!==my.st && suitLen(hand,s)>=4;});
    if(alt.length){ var ab=minBid(alt[0],last); if(ab && parse(ab).lvl<=2) return {bid:ab, why:'מראים סדרה שנייה.'}; }
    return {bid:'P', why:'אין מה להוסיף: עבור.'};
  }

  /* תור שני של המשיב */
  function respond2(hand, c){
    var p = Bridge.hcp(hand);
    var pr = parse(c.partner[c.partner.length-1]), my=parse(c.me[0]), last=c.last;
    if(!pr) return {bid:'P', why:'עבור.'};
    if(pr.lvl>=4 || (pr.st==='NT'&&pr.lvl>=3)) return {bid:'P', why:'הגיים הוכרז: עבור.'};
    /* אחרי טרנספר שהושלם: החלטת גובה לפי כוח */
    if(my && my.lvl===2 && (my.st==='D'||my.st==='H') && c.partner[0] && parse(c.partner[0]).st==='NT' && c.me.length===1){
      var maj = my.st==='D' ? 'H' : 'S';
      if(pr.st===maj){
        if(p>=10 && higher('4'+maj,last)) return {bid:'4'+maj, why:'אחרי הטרנספר: עם כוח לגיים מכריזים 4 במייג\'ור (מפגש 11).'};
        if(p>=8 && higher('3'+maj,last)) return {bid:'3'+maj, why:'אחרי הטרנספר: 8-9 נק\' — הזמנה (מפגש 11).'};
        return {bid:'P', why:'יד חלשה: הטרנספר הסתיים, עוצרים בגובה 2 (מפגש 11).'};
      }
    }
    /* אחרי סטיימן */
    if(my && my.lvl===2 && my.st==='C' && c.me.length===1){
      var m = pr.st;
      if((m==='H'||m==='S') && suitLen(hand,m)>=4){
        if(p>=10) return {bid:'4'+m, why:'נמצאה התאמת מייג\'ור 4-4 וכוח לגיים: 4'+(m==='H'?'♥':'♠')+' (מפגש 7).'};
        return {bid:'3'+m, why:'התאמה 4-4 עם 8-9 נק\': הזמנה בגובה 3 (מפגש 7).'};
      }
      if(p>=10) return {bid:'3NT', why:'אין התאמת מייג\'ור: חוזרים ל-3NT עם כוח לגיים (מפגש 7).'};
      return {bid:'2NT', why:'אין התאמה: 2NT מזמין (מפגש 7).'};
    }
    /* השותף חזר על סדרתו / הכריז NT: התאמה מאוחרת או עצירה */
    if((pr.st==='H'||pr.st==='S') && suitLen(hand,pr.st)>=3 && p>=12 && higher('4'+pr.st,last))
      return {bid:'4'+pr.st, why:'התאמה מאוחרת וכוח לגיים: משלימים ל-4 במייג\'ור.'};
    if(pr.st==='NT' && p>=12 && higher('3NT',last)) return {bid:'3NT', why:'כוח משותף לגיים: 3NT.'};
    return {bid:'P', why:'הכוח המשותף מוגבל: עוצרים כאן.'};
  }

  /* אוברקול פשוט */
  function overcall(hand, c){
    var p = Bridge.hcp(hand);
    var best=null; ['S','H','D','C'].forEach(function(s){
      if(suitLen(hand,s)>=5 && (!best || suitLen(hand,s)>suitLen(hand,best))) best=s;
    });
    if(best && p>=8){
      var b=minBid(best,c.last);
      if(b && parse(b).lvl===1) return {bid:b, why:'סדרה טובה של 5+ קלפים ו-8+ נק\': אוברקול בגובה 1 (מפגש 12).'};
      if(b && parse(b).lvl===2 && p>=11 && suitLen(hand,best)>=5) return {bid:b, why:'אוברקול בגובה 2 דורש יד טובה יותר: 11+ נק\' וסדרה איכותית (מפגש 12).'};
    }
    return {bid:'P', why:'אין סדרה וכוח מתאימים להתערבות: עבור.'};
  }

  /* תמיכה באוברקול של השותף */
  function supportOvercall(hand, c){
    var pr = parse(c.partner[c.partner.length-1]);
    if(pr && pr.st!=='NT' && suitLen(hand,pr.st)>=3 && Bridge.hcp(hand)>=8){
      var b=minBid(pr.st,c.last);
      if(b && parse(b).lvl<=3) return {bid:b, why:'התאמה לאוברקול של השותף ו-8+ נק\': תומכים.'};
    }
    return {bid:'P', why:'עבור.'};
  }

  function suggest(hand, auction, me){
    var c = ctx(auction, me), r;
    if(c.opener<0) r = opening(hand);
    else if(c.opener===me) r = rebid(hand, c);
    else if(c.opener===(me+2)%4) r = c.me.length===0 ? respond(hand, c.openBid, c.last) : respond2(hand, c);
    else r = c.partner.length ? supportOvercall(hand, c) : (c.me.length ? {bid:'P', why:'עבור.'} : overcall(hand, c));
    if(r.bid!=='P' && !higher(r.bid, c.last)) r = {bid:'P', why:'ההכרזה המתאימה כבר אינה זמינה: עבור.'};
    /* ponytail: בלם גובה — המנוע לא מכריז מעל גיים */
    var pp=parse(r.bid);
    if(pp && (pp.lvl>4 || (pp.lvl===4 && pp.st==='NT'))) r={bid:'P', why:'עבור.'};
    return r;
  }

  return {suggest:suggest, parse:parse, higher:higher, val:val};
})();
if(typeof module!=='undefined') module.exports=Bidder;
