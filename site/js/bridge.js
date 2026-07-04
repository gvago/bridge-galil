/* bridge.js — לב מערכת התרגול: חפיסה, ידיים, נקודות, רנדור */
var Bridge = (function(){
  var SUITS = ['S','H','D','C'];
  var SUIT_SYM = {S:'♠',H:'♥',D:'♦',C:'♣'};
  var SUIT_CLS = {S:'suit-s',H:'suit-h',D:'suit-d',C:'suit-c'};
  var RANKS = ['A','K','Q','J','T','9','8','7','6','5','4','3','2'];
  var HCP = {A:4,K:3,Q:2,J:1};

  function newDeck(){
    var d=[];
    SUITS.forEach(function(s){RANKS.forEach(function(r){d.push(s+r);});});
    return d;
  }
  function shuffle(a){
    for(var i=a.length-1;i>0;i--){
      var j=Math.floor(Math.random()*(i+1)),t=a[i];a[i]=a[j];a[j]=t;
    }
    return a;
  }
  // hand = {S:['A','K',...],H:[...],D:[...],C:[...]}
  function dealHand(){
    var cards = shuffle(newDeck()).slice(0,13);
    var h={S:[],H:[],D:[],C:[]};
    cards.forEach(function(c){h[c[0]].push(c[1]);});
    SUITS.forEach(function(s){
      h[s].sort(function(a,b){return RANKS.indexOf(a)-RANKS.indexOf(b);});
    });
    return h;
  }
  function hcp(hand){
    var p=0;
    SUITS.forEach(function(s){hand[s].forEach(function(r){p+=HCP[r]||0;});});
    return p;
  }
  function distPoints(hand){
    // נקודות חלוקה: קלף בודד 2, חוסר 3, דאבלטון 1
    var p=0;
    SUITS.forEach(function(s){
      var n=hand[s].length;
      if(n===0)p+=3; else if(n===1)p+=2; else if(n===2)p+=1;
    });
    return p;
  }
  function shape(hand){
    return SUITS.map(function(s){return hand[s].length;});
  }
  function isBalanced(hand){
    var sh=shape(hand).slice().sort(function(a,b){return b-a;}).join('');
    return ['4333','4432','5332'].indexOf(sh)>=0;
  }
  function longestSuit(hand){
    var best='S';
    SUITS.forEach(function(s){if(hand[s].length>hand[best].length)best=s;});
    return best;
  }
  function renderHand(hand,el){
    var html='';
    SUITS.forEach(function(s){
      html+='<div class="suit-row"><span class="suit-sym '+SUIT_CLS[s]+'">'+SUIT_SYM[s]+'</span>'+
        '<span class="'+SUIT_CLS[s]+'">'+(hand[s].length?hand[s].join(' '):'—')+'</span></div>';
    });
    el.innerHTML='<div class="hand">'+html+'</div>';
  }
  function parseHand(str){
    // "AKQ3.T92.QJ4.873" בסדר S.H.D.C
    var parts=str.split('.');
    return {S:parts[0].split(''),H:parts[1].split(''),D:parts[2].split(''),C:parts[3].split('')};
  }
  return {SUITS:SUITS,SUIT_SYM:SUIT_SYM,dealHand:dealHand,hcp:hcp,distPoints:distPoints,
          shape:shape,isBalanced:isBalanced,longestSuit:longestSuit,
          renderHand:renderHand,parseHand:parseHand};
})();
