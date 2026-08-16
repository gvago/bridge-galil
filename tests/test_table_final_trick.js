var fs = require('fs');
var path = require('path');
var vm = require('vm');
var assert = require('assert');

global.Bridge = require('../site/js/bridge.js');
global.Bidder = require('../site/js/bidder.js');

var tablePath = path.join(__dirname, '../site/js/table.js');
var source = fs.readFileSync(tablePath, 'utf8');
source = source.replace(
  'return {start:start, retry:retry};',
  'return {start:start, retry:retry, __test:{setState:function(s){T=s;}, getState:function(){return T;}, playCard:playCard, dismissFeedback:dismissFeedback}};'
);
assert(source.indexOf('__test:')>=0, 'test hook injection failed');

function hand(spades){ return {S:spades||[], H:[], D:[], C:[]}; }

function runCase(startingTricks, expectedMade, feedback){
  var timers=[];
  var done=null;
  var el={innerHTML:'', querySelectorAll:function(){return [];}};
  var sandbox={
    module:{exports:{}}, exports:{}, Bridge:global.Bridge, Bidder:global.Bidder,
    document:{getElementById:function(){return null;}, elementFromPoint:function(){return null;}},
    window:{}, Promise:Promise,
    setTimeout:function(fn){timers.push(fn); return timers.length;},
    console:console
  };
  vm.runInNewContext(source, sandbox, {filename:'table.js'});
  var table=sandbox.BridgeTable;
  var state={
    el:el, hands:[hand(),hand(),hand(),hand(['4'])], userSeat:2, dealer:2,
    scenario:null, onDone:function(r){done=r;}, gradeBids:false,
    phase:'play', auction:[], turn:3, contract:'4S', declarer:0, dummy:2, trump:'S',
    trick:[{seat:0,card:'SA'},{seat:1,card:'S2'},{seat:2,card:'S3'}],
    tricksNS:startingTricks, tricksEW:12-startingTricks, played:12, ledger:[],
    mistakes:[], lastHint:null, pauseHint:null, busy:false, result:null
  };
  table.__test.setState(state);
  table.__test.playCard(3,'S4',feedback||null);

  state=table.__test.getState();
  assert.strictEqual(state.phase,'play','result must wait while the fourth card is visible');
  assert.strictEqual((el.innerHTML.match(/ct-card/g)||[]).length,4,'all four cards must be rendered');
  assert(el.innerHTML.indexOf('♠4')>=0,'the last card must be visible');
  assert.strictEqual(timers.length,1,'result must be scheduled after the reveal');

  timers.shift()();
  state=table.__test.getState();
  if(feedback){
    assert.strictEqual(state.phase,'play','feedback must pause final scoring');
    assert.strictEqual(state.result,null,'feedback must remain visible before the result');
    assert.strictEqual(state.pendingFinish,true,'finish must wait for feedback dismissal');
    table.__test.dismissFeedback();
    state=table.__test.getState();
  }
  assert.strictEqual(state.phase,'done');
  assert.strictEqual(state.result.made,expectedMade);
  assert(done,'onDone must run after the reveal');
}

runCase(9,true);
runCase(8,false);
runCase(9,true,{kind:'play',chose:'S4',best:'S5',trick:13,why:'test'});
console.log('OK: final card stays visible before win, loss, and feedback results');
