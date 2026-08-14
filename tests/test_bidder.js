/* test_bidder.js — בדיקת עשן: 500 מכרזים אקראיים חייבים להסתיים חוקית */
global.Bridge = require('../site/js/bridge.js');
var Bidder = require('../site/js/bidder.js');
var assert = require('assert');

function fullDeal(){
  var deck=[]; ['S','H','D','C'].forEach(function(s){'AKQJT98765432'.split('').forEach(function(r){deck.push(s+r);});});
  for(var i=deck.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1)),t=deck[i];deck[i]=deck[j];deck[j]=t;}
  return [0,1,2,3].map(function(k){
    var h={S:[],H:[],D:[],C:[]};
    deck.slice(k*13,(k+1)*13).forEach(function(c){h[c[0]].push(c[1]);});
    return h;
  });
}

for(var d=0; d<500; d++){
  var hands=fullDeal(), auction=[], seat=Math.floor(Math.random()*4), turns=0;
  function done(){
    if(auction.length<4) return false;
    var np=auction.filter(function(a){return a.bid!=='P';}).length;
    var t=auction.slice(-3).every(function(a){return a.bid==='P';});
    return t && (np>0 || auction.length===4);
  }
  while(!done()){
    var r=Bidder.suggest(hands[seat], auction, seat);
    assert(r && r.bid, 'no bid returned');
    assert(r.why && r.why.length>3, 'no explanation for '+r.bid);
    if(r.bid!=='P'){
      var last=null;
      auction.forEach(function(a){ if(a.bid!=='P') last=a.bid; });
      assert(Bidder.higher(r.bid,last), 'illegal bid '+r.bid+' over '+last+' at deal '+d);
    }
    auction.push({seat:seat, bid:r.bid});
    seat=(seat+1)%4;
    if(++turns>40) throw new Error('auction never ends: '+auction.map(function(a){return a.bid;}).join(' '));
  }
}
console.log('OK: 500 auctions, all legal, all terminated, all explained');
