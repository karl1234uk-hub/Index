/**
 * Rules check for The Giggle Duel.
 *
 *   node duel/check-duel.js
 */
"use strict";

var duel = require("./game.js");
var errors = [];

function fail(msg) {
  errors.push(msg);
}

function assert(cond, msg) {
  if (!cond) fail(msg);
}

function fresh(seed, first, flip) {
  return duel.create({ seed: seed, first: first || "karlos", flip: !!flip });
}

function findSeed(limit, pred) {
  var seed;
  for (seed = 1; seed <= limit; seed++) {
    var state = fresh(seed);
    if (pred(state, seed)) return seed;
  }
  return 0;
}

function sameFighters(a, b) {
  return JSON.stringify(a.players) === JSON.stringify(b.players) &&
    a.turn === b.turn &&
    a.winner === b.winner &&
    a.over === b.over &&
    a.rand === b.rand &&
    a.round === b.round &&
    a.seed === b.seed &&
    a.first === b.first &&
    a.flip === b.flip &&
    JSON.stringify(a.forfeit) === JSON.stringify(b.forfeit) &&
    JSON.stringify(a.moves) === JSON.stringify(b.moves) &&
    JSON.stringify(a.log) === JSON.stringify(b.log);
}

function bothNames(text) {
  return text.indexOf("Karlos") !== -1 && text.indexOf("Sara") !== -1;
}

function play(state, policy, decide) {
  var guard = 0;
  while (!state.over && guard < 60) {
    var legal = duel.legalMoves(state);
    if (!legal.length) {
      fail("no legal moves on round " + state.round);
      return state;
    }
    var pool = legal.filter(function (id) { return policy(id); });
    if (!pool.length) pool = legal;
    state = duel.apply(state, decide(state, pool, guard));
    guard += 1;
  }
  return state;
}

var opening = fresh(1);
assert(opening.turn === "karlos", "Karlos goes first by default");
assert(opening.players.karlos.resistance === duel.MAX_HP, "Karlos starts at full resistance");
assert(opening.players.sara.resistance === duel.MAX_HP, "Sara starts at full resistance");
assert(opening.players.karlos.energy === duel.START_ENERGY + duel.REGEN, "first turn includes regen");
assert(opening.players.sara.energy === duel.START_ENERGY, "Sara's energy waits for her turn");
assert(opening.moves.length === 0, "a new duel has no moves");
assert(!opening.over && !opening.winner, "a new duel is not over");
assert(duel.legalMoves(opening).indexOf("signature") === -1, "signature stays locked below full energy");
assert(duel.legalMoves(opening).indexOf("cuddle") !== -1, "cuddle is always affordable");
assert(duel.catalog("sara").length === 7, "Sara has 6 moves plus a finisher");
assert(duel.catalog("karlos").length === 7, "Karlos has 6 moves plus a finisher");
assert(duel.signatures.sara.name !== duel.signatures.karlos.name, "finishers have different names");
assert(duel.signatures.sara.ignoreFort !== true, "Sara's finisher can be pillowed");
assert(duel.signatures.karlos.ignoreFort === true, "Karlos's finisher gets through a pillow fort");
assert(duel.moves.length === 6, "six shared moves");

var saraFirst = fresh(2, "sara", true);
assert(saraFirst.turn === "sara" && saraFirst.flip, "a coin flip can put Sara first");
assert(saraFirst.players.sara.energy === duel.START_ENERGY + duel.REGEN, "Sara regens when she starts");

var names = duel.moves.map(function (move) { return move.name; }).sort();
assert(names.join("|") === [
  "Cheeky tease",
  "Cuddle recharge",
  "Pillow fort",
  "Pillow smack",
  "Sweet talk",
  "Tickle attack"
].join("|"), "shared move list drifted");

assert(duel.unpack("").screen === "start", "empty hash is the start screen");
assert(duel.unpack("#start").screen === "start", "#start is the start screen");
assert(duel.unpack("#nope").screen === "error", "junk hash is an error");
assert(duel.unpack("#v=2&s=1&f=k").screen === "error", "unknown version is an error");
assert(duel.unpack(duel.pack(opening) + "x").screen === "error", "signature before it is earned is an error");

var roundTrip = duel.unpack(duel.pack(opening));
assert(roundTrip.screen === "play" && sameFighters(roundTrip.state, opening), "opening pack/unpack matches");

var tickleSeed = findSeed(4000, function (state) {
  var next = duel.apply(state, "tickle");
  return next.log[0].outcome === "hit";
});
var critSeed = findSeed(4000, function (state) {
  var next = duel.apply(state, "tickle");
  return next.log[0].outcome === "crit";
});
var missSeed = findSeed(4000, function (state) {
  var next = duel.apply(state, "tickle");
  return next.log[0].outcome === "miss";
});
assert(tickleSeed && critSeed && missSeed, "tickle can hit, crit, and miss");

var hit = duel.apply(fresh(tickleSeed), "tickle");
var hitLog = hit.log[0];
assert(hitLog.actor === "karlos", "log names the mover");
assert(hitLog.amount >= 13 && hitLog.amount <= 18, "a plain tickle stays in range, got " + hitLog.amount);
assert(hit.players.sara.resistance === duel.MAX_HP - hitLog.amount, "resistance drops by the dealt amount");
assert(hit.players.karlos.energy === opening.players.karlos.energy - 10, "tickle spends its cost");
assert(hit.turn === "sara", "turn passes after a hit");
assert(hit.players.sara.energy === duel.START_ENERGY + duel.REGEN, "Sara regens when her turn starts");
assert(bothNames(hitLog.text), "hit text names Sara and Karlos");

var crit = duel.apply(fresh(critSeed), "tickle");
assert(crit.log[0].amount >= 21 && crit.log[0].amount <= 26, "a crit tickle adds the bonus, got " + crit.log[0].amount);
assert(bothNames(crit.log[0].text), "crit text names them both");

var missed = duel.apply(fresh(missSeed), "tickle");
assert(missed.players.sara.resistance === duel.MAX_HP, "a miss deals no damage");
assert(missed.players.karlos.energy === opening.players.karlos.energy - 10, "a miss still spends energy");
assert(bothNames(missed.log[0].text), "miss text names them both");

var fortSeed = findSeed(4000, function (state) {
  state.players.sara.fort = 1;
  var next = duel.apply(state, "tickle");
  return next.log[0].outcome === "hit";
});
assert(fortSeed, "found a tickle that hits a fort");
var fortified = fresh(fortSeed);
fortified.players.sara.fort = 1;
var bare = duel.apply(fresh(fortSeed), "tickle");
var blocked = duel.apply(fortified, "tickle");
assert(blocked.log[0].mitigated, "fort mitigates");
assert(blocked.log[0].broke.indexOf("fort") !== -1, "fort is spent on a hit");
assert(blocked.players.sara.fort === 0, "fort comes down after the hit");
assert(blocked.log[0].amount === Math.round(blocked.log[0].raw * 0.28), "fort keeps 28% of the hit");
assert(blocked.log[0].amount < bare.log[0].amount, "a fort hit hurts less than the open hit");

var missFortSeed = findSeed(4000, function (state) {
  state.players.sara.fort = 1;
  return duel.apply(state, "tickle").log[0].outcome === "miss";
});
assert(missFortSeed, "found a tickle that misses a fort");
var stillFort = fresh(missFortSeed);
stillFort.players.sara.fort = 1;
stillFort = duel.apply(stillFort, "tickle");
assert(stillFort.players.sara.fort === 1, "a miss leaves the pillow fort standing");
assert(stillFort.players.sara.resistance === duel.MAX_HP, "a missed fort takes no damage");

var flusterSeed = findSeed(4000, function (state) {
  state.players.sara.fluster = 1;
  return duel.apply(state, "tickle").log[0].outcome === "hit";
});
assert(flusterSeed, "found a tickle against fluster");
var flustered = fresh(flusterSeed);
flustered.players.sara.fluster = 1;
flustered = duel.apply(flustered, "tickle");
assert(flustered.log[0].amount === Math.round(flustered.log[0].raw * 1.35), "fluster multiplies the hit");
assert(flustered.players.sara.fluster === 0, "fluster is spent on the hit");
assert(flustered.log[0].amount > duel.apply(fresh(flusterSeed), "tickle").log[0].amount, "fluster hurts more");

var bothSeed = findSeed(4000, function (state) {
  state.players.sara.fort = 1;
  state.players.sara.fluster = 1;
  return duel.apply(state, "pillow").log[0].outcome === "hit";
});
assert(bothSeed, "found a pillow against fort and fluster");
var layered = fresh(bothSeed);
layered.players.sara.fort = 1;
layered.players.sara.fluster = 1;
layered = duel.apply(layered, "pillow");
assert(layered.log[0].amount === Math.round(layered.log[0].raw * 1.35 * 0.28), "fluster applies, then the fort");
assert(layered.players.sara.fort === 0 && layered.players.sara.fluster === 0, "both statuses clear");

var charmSeed = findSeed(8000, function (state) {
  var next = duel.apply(state, "sweet");
  return next.log[0].opp.indexOf("stun") !== -1;
});
var guardSeed = findSeed(8000, function (state) {
  var next = duel.apply(state, "sweet");
  return next.log[0].outcome !== "miss" && next.log[0].opp.indexOf("fluster") !== -1;
});
assert(charmSeed && guardSeed, "sweet talk can smite or just fluster");
var charmed = duel.apply(fresh(charmSeed), "sweet");
assert(charmed.players.sara.stun === 1, "a charmed Sara has to skip");
assert(duel.legalMoves(charmed).join() === "pass", "a smitten player can only catch their breath");
assert(!duel.isLegal(charmed, "tickle"), "a smitten player cannot tickle");
var passed = duel.apply(charmed, "pass");
assert(passed.turn === "karlos", "the turn comes back after the skip");
assert(passed.players.sara.stun === 0, "the skip clears");
assert(bothNames(passed.log[1].text), "the skip line names them both");
assert(duel.legalMoves(passed).indexOf("tickle") !== -1, "Karlos can move again");

var teaseSeed = findSeed(4000, function (state) {
  return duel.apply(state, "tease").log[0].outcome !== "miss";
});
var teased = duel.apply(fresh(teaseSeed), "tease");
assert(teased.players.sara.fluster === 1, "a landed tease lowers defence");

var cuddleSpec = duel.moveDef("karlos", "cuddle");
var cuddled = fresh(3);
var energyBefore = cuddled.players.karlos.energy;
cuddled = duel.apply(cuddled, "cuddle");
assert(cuddled.players.karlos.energy === Math.min(duel.MAX_ENERGY, energyBefore + cuddleSpec.gain), "cuddle restores energy");
assert(cuddled.players.karlos.resistance === duel.MAX_HP, "cuddle does not push resistance past full");
assert(cuddled.log[0].amount === 0, "no composure restored when already full");
assert(cuddled.turn === "sara", "cuddle still ends the turn");
var hurt = fresh(3);
hurt.players.karlos.resistance = 10;
hurt.players.karlos.energy = 95;
hurt = duel.apply(hurt, "cuddle");
assert(hurt.players.karlos.resistance === 10 + cuddleSpec.heal, "cuddle gives a little resistance back");
assert(hurt.players.karlos.energy === 100, "cuddle caps energy at full");

var low = fresh(3);
low.players.karlos.energy = 7;
assert(duel.legalMoves(low).join() === "cuddle", "only cuddle is affordable at 7 energy");
assert(!duel.isLegal(low, "fort"), "fort is too expensive at 7 energy");

function signatureCase(seed, actor) {
  var state = fresh(seed, actor);
  state.players[actor].energy = 100;
  return state;
}

var saraSigHit = findSeed(6000, function (state) {
  var next = duel.apply(signatureCase(state.seed, "sara"), "signature");
  return next.log[0].actor === "sara" && next.log[0].outcome !== "miss";
});
var karlosSigHit = findSeed(6000, function (state) {
  var next = duel.apply(signatureCase(state.seed, "karlos"), "signature");
  return next.log[0].outcome !== "miss";
});
assert(saraSigHit && karlosSigHit, "both finishers can land");

var saraOpen = duel.apply(signatureCase(saraSigHit, "sara"), "signature");
var saraFort = signatureCase(saraSigHit, "sara");
saraFort.players.karlos.fort = 1;
saraFort = duel.apply(saraFort, "signature");
assert(saraOpen.players.sara.energy === 0, "Sara's finisher spends the full bar");
assert(saraFort.log[0].mitigated, "a pillow fort softens Sara's voice note");
assert(saraFort.log[0].amount < saraOpen.log[0].amount, "Sara's finisher hits harder in the open");
assert(saraFort.log[0].name === "The Voice Note", "Sara's signature is The Voice Note");

var quietOpen = duel.apply(signatureCase(karlosSigHit, "karlos"), "signature");
var quietFort = signatureCase(karlosSigHit, "karlos");
quietFort.players.sara.fort = 1;
quietFort = duel.apply(quietFort, "signature");
assert(quietOpen.log[0].name === "The Quiet Line", "Karlos's signature is The Quiet Line");
assert(quietFort.log[0].through, "The Quiet Line goes through the fort");
assert(quietFort.log[0].amount === quietOpen.log[0].amount, "the fort does not cut Karlos's finisher");
assert(quietFort.players.sara.fort === 0, "the fort still comes down");
assert(quietOpen.players.karlos.energy === 0, "the finisher empties energy");

var almost = signatureCase(karlosSigHit, "karlos");
almost.players.karlos.energy = 99;
assert(!duel.isLegal(almost, "signature"), "99 energy is not a full bar");
var locked = false;
try {
  duel.apply(almost, "signature");
} catch (err) {
  locked = err.code === "ILLEGAL";
}
assert(locked, "using a locked finisher throws");

var koSeed = findSeed(4000, function (state) {
  state.players.sara.resistance = 12;
  return duel.apply(state, "pillow").log[0].outcome !== "miss";
});
assert(koSeed, "found a pillow that can end it");
var doomed = fresh(koSeed);
doomed.players.sara.resistance = 12;
var won = duel.apply(doomed, "pillow");
assert(won.over && won.winner === "karlos", "zero resistance wins the duel");
assert(won.players.sara.resistance === 0, "the giggle meter stops at zero");
assert(won.log[0].ko && bothNames(won.log[0].text), "the winning line names them both");
assert(duel.legalMoves(won).length === 0, "a finished duel has no moves");
var closed = false;
try {
  duel.apply(won, "tickle");
} catch (err) {
  closed = err.code === "ILLEGAL";
}
assert(closed, "no moves after the win");

var kissed = duel.setForfeit(won, "kiss");
assert(kissed.forfeit.id === "kiss", "winner can pick a forfeit");
assert(kissed.forfeit.text.indexOf("forehead kiss") !== -1, "kiss forfeit stays gentle");
var custom = duel.setForfeit(won, "custom", "  Say something sweet\nand mean it.  ");
assert(custom.forfeit.text === "Say something sweet and mean it.", "custom forfeits collapse whitespace");
var longText = new Array(120).join("a");
var trimmed = duel.setForfeit(won, "custom", longText);
assert(trimmed.forfeit.text.length <= duel.MAX_CUSTOM, "custom forfeits cap at 80 characters");
assert(duel.setForfeit(won, "custom", "   \n").forfeit === null, "an empty forfeit is cleared");
assert(duel.setForfeit(opening, "kiss") === opening, "no forfeit before someone wins");

var natural = play(fresh(42), function (id) {
  return id === "pillow" || id === "tickle" || id === "signature" || id === "tease";
}, function (state, pool, step) {
  return pool[(state.seed + step) % pool.length];
});
assert(natural.over, "a played duel reaches a winner without cheated hit points");
var linked = duel.setForfeit(natural, "kiss");
var packedWin = duel.unpack(duel.pack(linked));
assert(packedWin.screen === "play" && packedWin.state.forfeit && packedWin.state.forfeit.id === "kiss", "forfeit survives the link");
assert(sameFighters(packedWin.state, linked), "a finished duel rebuilds from the link");
var customLinked = duel.setForfeit(natural, "custom", "Sing while you make the tea.");
var customBack = duel.unpack(duel.pack(customLinked));
assert(customBack.screen === "play" && customBack.state.forfeit.text === "Sing while you make the tea.", "a written forfeit survives the link");
var emojiLinked = duel.setForfeit(natural, "custom", "Send a \uD83E\uDD70 before bed");
var emojiBack = duel.unpack(duel.pack(emojiLinked));
assert(emojiBack.screen === "play" && emojiBack.state.forfeit.text === "Send a \uD83E\uDD70 before bed", "emoji forfeits survive the link");

var mid = duel.apply(duel.apply(fresh(11), "tickle"), "pillow");
var rebuilt = duel.unpack(duel.pack(mid));
assert(rebuilt.screen === "play" && sameFighters(rebuilt.state, mid), "mid-duel link replays exactly");
var continuedA = duel.apply(mid, duel.legalMoves(mid)[0]);
var continuedB = duel.apply(rebuilt.state, duel.legalMoves(rebuilt.state)[0]);
assert(sameFighters(continuedA, continuedB), "the link and the original agree on the next move");
assert(duel.unpack(duel.pack(mid) + "&p=kiss").state.forfeit === null, "a forfeit on a live duel is ignored");
assert(duel.unpack(duel.pack(mid) + "&p=nope").screen === "error", "a bad forfeit id is an error");

var again = duel.apply(fresh(tickleSeed), "tickle");
assert(again.log[0].text === hit.log[0].text, "the same seed tells the same joke");

["tickle", "pillow", "tease", "sweet", "fort", "cuddle"].forEach(function (id) {
  var sample = duel.apply(fresh(tickleSeed), id);
  assert(bothNames(sample.log[0].text), id + " text names Sara and Karlos");
  assert(sample.log[0].emoji, id + " has an emoji");
});

var aggroTurns = [];
var aggroWins = { karlos: 0, sara: 0 };
var i;
for (i = 1; i <= 200; i++) {
  var decideRng = duel.rng(i * 997 + 13);
  var ended = play(fresh(i * 17 + 3, i % 2 ? "sara" : "karlos"), function (id) {
    return id === "pillow" || id === "tickle" || id === "signature" || id === "tease" || id === "sweet";
  }, function (state, pool) {
    return pool[Math.floor(decideRng.next() * pool.length)];
  });
  assert(ended.over, "aggro game " + i + " should end");
  if (!ended.over) continue;
  assert(ended.players[duel.other(ended.winner)].resistance === 0, "loser is at zero");
  assert(ended.moves.length <= 48, "aggro game ran too long");
  ended.log.forEach(function (entry) {
    if (!bothNames(entry.text)) fail("log line missing a name: " + entry.text);
    if (entry.actor !== "karlos" && entry.actor !== "sara") fail("bad actor");
  });
  ["karlos", "sara"].forEach(function (id) {
    var fighter = ended.players[id];
    if (fighter.resistance < 0 || fighter.resistance > duel.MAX_HP) fail(id + " resistance out of range");
    if (fighter.energy < 0 || fighter.energy > duel.MAX_ENERGY) fail(id + " energy out of range");
  });
  var replay = duel.unpack(duel.pack(ended));
  if (replay.screen !== "play" || !sameFighters(replay.state, ended)) fail("aggro replay drifted on seed " + ended.seed);
  aggroTurns.push(ended.moves.length);
  aggroWins[ended.winner] += 1;
}

var stall = play(fresh(99), function (id) {
  return id === "cuddle" || id === "fort";
}, function (state, pool, step) {
  return pool[step % pool.length];
});
assert(stall.over, "a pillow-and-cuddle stall still ends");
assert(stall.moves.length < 48, "stall ended before the move cap, took " + stall.moves.length);

function mean(values) {
  var sum = 0;
  values.forEach(function (value) { sum += value; });
  return values.length ? sum / values.length : 0;
}

if (aggroTurns.length) {
  var average = mean(aggroTurns);
  assert(average >= 4 && average <= 16, "aggressive duels should land around a short call, average " + average.toFixed(2));
  assert(aggroWins.karlos > 0 && aggroWins.sara > 0, "both players can win an aggressive duel");
}

if (errors.length) {
  console.error("DUEL CHECK FAILED (" + errors.length + ")");
  errors.forEach(function (err) { console.error(" - " + err); });
  process.exit(1);
}

console.log("moves: " + duel.moves.length + " shared");
console.log("sara finisher: " + duel.signatures.sara.name);
console.log("karlos finisher: " + duel.signatures.karlos.name);
console.log("aggressive duels: " + aggroTurns.length);
console.log("average moves: " + mean(aggroTurns).toFixed(2));
console.log("wins: Karlos " + aggroWins.karlos + ", Sara " + aggroWins.sara);
console.log("stall length: " + stall.moves.length);
console.log("every replay matches, every bar stays in range");
