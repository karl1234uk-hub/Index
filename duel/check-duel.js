/**
 * Rules check for the Giggle Duel.
 *
 *   node duel/check-duel.js
 */
"use strict";

var fs = require("fs");
var path = require("path");
var duel = require("./duel.js");

var errors = [];

function fail(msg) {
  errors.push(msg);
}

function sameState(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

var names = ["Karlos", "Sara"];
var banned = [
  "kiss", "sexy", "babe", "honey", "darling", "naked", "flirt", "romantic",
  "gorgeous", "beautiful", "moan", "cuddle", "love", "horny", "vampire",
  "spell", "magic", "lips", "crush"
];

if (duel.players.karlos.name !== "Karlos" || duel.players.sara.name !== "Sara") {
  fail("players must be Karlos and Sara");
}
if (duel.MAX_HP !== 100 || duel.MAX_ENERGY !== 5) fail("unexpected bars");

var fresh = duel.newGame(7);
if (!fresh) fail("newGame rejected a valid seed");
if (!fresh || fresh.turn !== "karlos") fail("Karlos does not go first");
if (!fresh || fresh.hp.karlos !== 100 || fresh.hp.sara !== 100) fail("resistance does not start full");
if (!fresh || fresh.energy.karlos !== 2 || fresh.energy.sara !== 2) fail("energy does not start at 2");
if (!fresh || fresh.winner || fresh.forfeit || fresh.log.length) fail("new game is not clean");
if (duel.newGame(1.5) !== null) fail("fractional seed should fail");
if (duel.newGame(-1) !== null) fail("negative seed should fail");

function idsOf(player) {
  return duel.movesFor(player).map(function (move) { return move.id; });
}
var saraIds = idsOf("sara").join(",");
var karlosIds = idsOf("karlos").join(",");
if (saraIds !== "tickle,pillow,tease,sweet,fort,snack,blitz") fail("Sara's move list: " + saraIds);
if (karlosIds !== "tickle,pillow,tease,sweet,fort,snack,barrage") fail("Karlos's move list: " + karlosIds);
if (duel.canUse(fresh, "barrage") || duel.canUse(fresh, "blitz")) fail("finisher is open on a fresh bar");

var costs = { tickle: 0, tease: 0, pillow: 1, sweet: 1, fort: 1, snack: 2, blitz: 5, barrage: 5 };
Object.keys(costs).forEach(function (id) {
  if (duel.MOVES[id].cost !== costs[id]) fail(id + " cost");
});

var broke = duel.newGame(3);
broke.energy.karlos = 0;
var before = JSON.stringify(broke);
if (duel.applyMove(broke, "pillow") !== null) fail("pillow spent energy Karlos did not have");
if (duel.applyMove(broke, "snack") !== null) fail("snack spent energy Karlos did not have");
if (JSON.stringify(broke) !== before) fail("a rejected move mutated state");
var poked = duel.applyMove(broke, "tickle");
if (!poked) fail("free tickle should work at 0 energy");
if (poked && poked.hp.karlos !== broke.hp.karlos && poked.log[0].outcome !== "miss") {
  fail("tickle damaged the attacker");
}

var finisher = duel.newGame(4);
finisher.energy.karlos = 5;
finisher.energy.sara = 5;
if (!duel.canUse(finisher, "barrage")) fail("Karlos's finisher stays locked at full energy");
if (duel.canUse(finisher, "blitz")) fail("Karlos can use Sara's finisher");
finisher.energy.karlos = 4;
if (duel.canUse(finisher, "barrage")) fail("finisher unlocked before the bar was full");
finisher.turn = "sara";
finisher.energy.sara = 5;
if (!duel.canUse(finisher, "blitz")) fail("Sara's finisher stays locked at full energy");
if (duel.canUse(finisher, "barrage")) fail("Sara can use Karlos's finisher");

function firstHit(moveId, setup) {
  var seed;
  for (seed = 1; seed <= 120; seed++) {
    var state = duel.newGame(seed);
    setup(state);
    var next = duel.applyMove(state, moveId);
    if (next && next.log[0].outcome !== "miss" && next.log[0].outcome !== "collapse") return { seed: seed, state: state, next: next };
  }
  return null;
}

var tickleHit = firstHit("tickle", function () {});
if (!tickleHit) fail("tickle never landed");
else {
  if (tickleHit.next.energy.karlos !== Math.min(5, tickleHit.state.energy.karlos + 1)) fail("tickle did not build energy");
  if (tickleHit.next.hp.sara >= 100) fail("tickle hit for nothing");
  if (tickleHit.next.turn !== "sara") fail("turn did not pass to Sara");
}

var misses = 0;
var crits = 0;
var hits = 0;
var seedScan;
for (seedScan = 1; seedScan <= 150; seedScan++) {
  var rolled = duel.applyMove(duel.newGame(seedScan), "tickle");
  if (!rolled) fail("tickle rejected");
  else if (rolled.log[0].outcome === "miss") {
    misses += 1;
    if (rolled.hp.sara !== 100) fail("a miss still dealt damage");
    if (rolled.energy.karlos !== 2) fail("a miss built energy");
  } else if (rolled.log[0].outcome === "crit") crits += 1;
  else hits += 1;
  var again = duel.applyMove(duel.newGame(seedScan), "tickle");
  if (!again || !sameState(rolled, again)) fail("same seed was not deterministic");
}
if (misses < 1) fail("tickle never missed");
if (crits < 1) fail("tickle never crit");
if (hits < 1) fail("tickle never hit normally");

function compareHits(moveId, tweak, expect) {
  var found = 0;
  var seed;
  for (seed = 1; seed <= 100 && found < 3; seed++) {
    var plain = duel.newGame(seed);
    var changed = duel.newGame(seed);
    tweak(changed);
    if (moveId === "blitz" || moveId === "barrage") {
      plain.turn = moveId === "blitz" ? "sara" : "karlos";
      changed.turn = plain.turn;
      plain.energy[plain.turn] = 5;
      changed.energy[changed.turn] = 5;
    }
    var a = duel.applyMove(plain, moveId);
    var b = duel.applyMove(changed, moveId);
    if (!a || !b) {
      fail(moveId + " could not resolve");
      return;
    }
    if (a.log[0].outcome === "miss") {
      if (b.log[0].outcome !== "miss") fail(moveId + " miss diverged at " + seed);
      continue;
    }
    found += 1;
    expect(a, b, seed);
  }
  if (found < 1) fail("no clean hit for " + moveId);
}

compareHits("pillow", function (state) { state.fort.sara = true; }, function (open, blocked, seed) {
  if (blocked.hp.sara < open.hp.sara) fail("fort increased pillow damage at " + seed);
  if (blocked.hp.sara === open.hp.sara && open.log[0].amount > 0) fail("fort did not soften the pillow at " + seed);
  if (blocked.fort.sara) fail("fort was not spent");
});

compareHits("pillow", function (state) { state.guard.sara = true; }, function (open, lowered, seed) {
  if (lowered.hp.sara >= open.hp.sara) fail("guard did not worsen the hit at " + seed);
  if (lowered.guard.sara) fail("guard was not spent");
});

compareHits("barrage", function (state) { state.fort.sara = true; }, function (open, blocked, seed) {
  if (open.hp.sara !== blocked.hp.sara) fail("Pillow Barrage should smash through a fort at " + seed);
  if (blocked.fort.sara) fail("barrage left the fort standing");
});

compareHits("blitz", function (state) { state.fort.karlos = true; }, function (open, blocked, seed) {
  if (blocked.hp.karlos <= open.hp.karlos) fail("Tickle Blitz was not softened by the fort at " + seed);
  if (blocked.fort.karlos) fail("blitz left the fort standing");
});

var sweetKinds = { skip: 0, guard: 0, miss: 0 };
for (seedScan = 1; seedScan <= 160; seedScan++) {
  var sweet = duel.newGame(seedScan);
  sweet.energy.karlos = 3;
  var told = duel.applyMove(sweet, "sweet");
  if (!told) fail("sweet talk rejected");
  else sweetKinds[told.log[0].outcome] += 1;
}
if (!sweetKinds.skip || !sweetKinds.guard || !sweetKinds.miss) {
  fail("sweet talk outcomes missing: " + JSON.stringify(sweetKinds));
}

var skipped = null;
for (seedScan = 1; seedScan <= 80; seedScan++) {
  var setup = duel.newGame(seedScan);
  setup.energy.karlos = 3;
  var cast = duel.applyMove(setup, "sweet");
  if (cast && cast.log[0].outcome === "skip" && !cast.winner) {
    skipped = cast;
    break;
  }
}
if (!skipped) fail("never produced a skip");
else {
  if (!skipped.skip.sara || skipped.turn !== "sara") fail("skip did not stick to Sara");
  if (duel.applyMove(skipped, "tickle") !== null) fail("Sara acted while saying aww");
  var passed = duel.passTurn(skipped);
  if (!passed || passed.turn !== "karlos" || passed.skip.sara) fail("pass did not hand the turn back");
  if (passed.hp.sara !== skipped.hp.sara || passed.energy.sara !== skipped.energy.sara) fail("passing changed the bars");
  if (duel.passTurn(passed) !== null) fail("pass worked when nobody was saying aww");
}

var healed = null;
for (seedScan = 1; seedScan <= 40; seedScan++) {
  var hungry = duel.newGame(seedScan);
  hungry.hp.karlos = 40;
  var snacked = duel.applyMove(hungry, "snack");
  if (snacked && snacked.log[0].outcome === "heal") {
    healed = { before: hungry, after: snacked };
    break;
  }
}
if (!healed) fail("snack never healed");
else if (healed.after.hp.karlos <= 40 || healed.after.hp.karlos > 100) fail("heal left the bar");

var stuffed = null;
for (seedScan = 1; seedScan <= 40; seedScan++) {
  var full = duel.newGame(seedScan);
  var snackedFull = duel.applyMove(full, "snack");
  if (snackedFull && snackedFull.log[0].outcome === "stuffed") {
    stuffed = snackedFull;
    break;
  }
}
if (!stuffed) fail("a full bar never turned a snack into crumbs");
else if (stuffed.hp.karlos !== 100) fail("stuffed snack changed resistance");

var doomed = duel.newGame(9);
doomed.hp.sara = 1;
var ending = duel.applyMove(doomed, "pillow");
if (!ending || ending.winner !== "karlos" || ending.hp.sara !== 0) fail("a last point of resistance did not end it");
if (ending && ending.hp.karlos <= 0) fail("winner was knocked out too");
if (ending && duel.canUse(ending, "tickle")) fail("the duel accepted a move after it ended");

var described = ending && duel.describe(ending.log[ending.log.length - 1], true);
if (!described || described.text.indexOf("Karlos wins") === -1 || described.text.indexOf("Sara") === -1) {
  fail("the winning line forgot a name");
}
if (described && described.text.indexOf("{") !== -1) fail("a template leaked");

Object.keys(duel.LINES).forEach(function (moveId) {
  var table = duel.LINES[moveId];
  Object.keys(table).forEach(function (outcome) {
    table[outcome].forEach(function (line, index) {
      if (line.indexOf("{a}") === -1) fail(moveId + " " + outcome + " line " + index + " has no actor");
      if (moveId === "blitz" && line.toLowerCase().indexOf("blitz") === -1) fail("Tickle Blitz line forgot its name");
      if (moveId === "barrage" && line.toLowerCase().indexOf("barrage") === -1) fail("Pillow Barrage line forgot its name");
      var needsTarget = moveId !== "fort" && moveId !== "snack" && moveId !== "pass";
      if (needsTarget && line.indexOf("{b}") === -1) fail(moveId + " line missing the other name");
      var sample = duel.describe({
        actor: moveId === "blitz" ? "sara" : "karlos",
        move: moveId,
        outcome: outcome,
        amount: 12,
        extra: "",
        line: index
      }, false);
      if (sample.text.indexOf("{") !== -1) fail("unfilled template");
      names.forEach(function (person) {
        if (sample.text.indexOf(person) === -1 && line.indexOf(person === "Karlos" ? "{a}" : "{b}") !== -1 && moveId !== "blitz") {
          /* names are filled from {a}/{b}; presence is checked below */
        }
      });
      if (sample.text.indexOf("Karlos") === -1 && sample.text.indexOf("Sara") === -1) fail("flavour named nobody");
    });
  });
});

var long = duel.newGame(2);
long.hp.karlos = 500;
long.hp.sara = 500;
var steps = 0;
while (steps < 20 && long && !long.winner) {
  if (long.skip[long.turn]) long = duel.passTurn(long);
  else long = duel.applyMove(long, long.energy[long.turn] >= 1 ? "sweet" : "tickle");
  steps += 1;
  if (long && long.log.length > 8) fail("battle log grew past 8");
}
if (!long || long.log.length !== 8) fail("battle log did not settle at 8, got " + (long && long.log.length));

var round = duel.newGame(11);
var guardSteps = 0;
while (round && !round.winner && guardSteps < 12) {
  var back = duel.decode(duel.encode(round));
  if (!back || !sameState(back, round)) fail("link state drifted on turn " + guardSteps);
  if (round.skip[round.turn]) round = duel.passTurn(round);
  else {
    var preference = ["pillow", "tickle", "tease", "sweet", "fort"];
    var pick = null;
    preference.forEach(function (id) {
      if (!pick && duel.canUse(round, id)) pick = id;
    });
    round = duel.applyMove(round, pick);
  }
  guardSteps += 1;
}

for (seedScan = 1; seedScan <= 24; seedScan++) {
  var bout = duel.newGame(seedScan);
  var plays = 0;
  while (bout && !bout.winner && plays < 60) {
    if (bout.hp.karlos < 0 || bout.hp.sara < 0) fail("resistance went negative");
    if (bout.energy.karlos < 0 || bout.energy.sara < 0 || bout.energy.karlos > 5 || bout.energy.sara > 5) {
      fail("energy left the bar");
    }
    var echoed = duel.decode(duel.encode(bout));
    if (!echoed || echoed.turn !== bout.turn || echoed.hp.sara !== bout.hp.sara || echoed.seed !== bout.seed) {
      fail("live link failed on seed " + seedScan);
    }
    if (bout.skip[bout.turn]) bout = duel.passTurn(bout);
    else {
      var order = ["blitz", "barrage", "pillow", "tickle", "tease", "sweet"];
      var choice = null;
      order.forEach(function (id) {
        if (!choice && duel.canUse(bout, id)) choice = id;
      });
      if (!choice) {
        fail("a turn had no move");
        break;
      }
      bout = duel.applyMove(bout, choice);
    }
    plays += 1;
  }
  if (!bout || !bout.winner) fail("seed " + seedScan + " had no winner after " + plays + " moves");
  else {
    var loser = duel.otherId(bout.winner);
    if (bout.hp[loser] !== 0) fail("loser still had resistance");
    if (bout.hp[bout.winner] <= 0) fail("winner had no resistance left");
    var prize = duel.setForfeit(bout, "dance");
    if (!prize || prize.forfeit.id !== "dance") fail("preset forfeit rejected");
    if (duel.setForfeit(prize, "hat")) fail("forfeit could be changed");
    var custom = duel.setForfeit(bout, { custom: "  Do the penguin waddle, twice  " });
    if (!custom || custom.forfeit.text !== "Do the penguin waddle, twice") fail("custom forfeit was not cleaned");
    if (!sameState(duel.decode(duel.encode(custom)), custom)) fail("forfeit link did not round-trip");
    if (duel.setForfeit(bout, { custom: "no" })) fail("tiny forfeit accepted");
    if (duel.setForfeit(bout, { custom: new Array(82).join("a") })) fail("long forfeit accepted");
    if (duel.setForfeit(duel.newGame(1), "dance")) fail("forfeit before a winner");
  }
}

["", "start", "v=2", "nope", "v=1&t=karlos"].forEach(function (bad) {
  if (duel.decode(bad) !== null) fail("accepted a bad link: " + bad);
});
var tampered = duel.encode(duel.newGame(1)).replace("hk=100", "hk=140");
if (duel.decode(tampered) !== null) fail("accepted resistance over 100");
var bothDown = duel.encode(duel.newGame(1)).replace("hk=100", "hk=0").replace("hs=100", "hs=0");
if (duel.decode(bothDown) !== null) fail("accepted a double knockout");

var page = fs.readFileSync(path.join(__dirname, "index.html"), "utf8");
var ui = fs.readFileSync(path.join(__dirname, "play.js"), "utf8");
var rules = fs.readFileSync(path.join(__dirname, "duel.js"), "utf8");
if (page.indexOf('src="duel.js"') === -1 || page.indexOf('src="play.js"') === -1) fail("page does not load the duel");
if (page.indexOf("viewport") === -1) fail("page is missing a viewport");
if (ui.indexOf("Send the link to ") === -1) fail("handoff does not say to send the link");
if (ui.indexOf("Copy link") === -1) fail("missing Copy link");
if (ui.indexOf("navigator.share") === -1) fail("missing Web Share");
if (ui.indexOf("Rematch") === -1) fail("missing Rematch");

[page, ui, rules].forEach(function (src, index) {
  var lower = src.toLowerCase();
  banned.forEach(function (word) {
    var re = new RegExp("\\b" + word + "\\b", "i");
    if (re.test(lower)) fail("banned word “" + word + "” in file " + index);
  });
});

if (errors.length) {
  console.error("DUEL CHECK FAILED (" + errors.length + ")");
  errors.forEach(function (err) { console.error(" - " + err); });
  process.exit(1);
}

console.log("Sara: " + duel.movesFor("sara").map(function (move) {
  return move.name + " (" + (move.cost === 0 ? "free" : move.cost + " energy") + ")";
}).join(", "));
console.log("Karlos: " + duel.movesFor("karlos").map(function (move) {
  return move.name + " (" + (move.cost === 0 ? "free" : move.cost + " energy") + ")";
}).join(", "));
console.log("seeds 1–24 all end, links round-trip, forfeits stick");
