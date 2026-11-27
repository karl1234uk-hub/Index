/**
 * Walk every scene in story.js.
 * Fails if a choice points nowhere, a path loops, a scene is orphaned,
 * turns don't alternate, or any playthrough misses an ending / falls
 * outside 8–14 moves.
 *
 *   node story/check-story.js
 */
"use strict";

var story = require("./story.js");
var scenes = story.scenes;
var errors = [];

function fail(msg) {
  errors.push(msg);
}

var ids = Object.keys(scenes);
if (!scenes[story.start]) fail("start scene missing: " + story.start);

ids.forEach(function (id) {
  var scene = scenes[id];
  if (!scene || scene.id !== id) fail(id + ": id does not match its key");
  if (!scene.kicker || !scene.title) fail(id + ": missing kicker or title");
  if (!scene.body || !scene.body.length) fail(id + ": missing body");
  var blob = scene.body.join("\n");
  if (blob.indexOf("Karlos") === -1) fail(id + ": body never says Karlos");
  if (blob.indexOf("Sara") === -1) fail(id + ": body never says Sara");

  if (scene.ending) {
    if (!story.tones[scene.ending]) fail(id + ": unknown ending tone " + scene.ending);
    if (scene.choices && scene.choices.length) fail(id + ": ending has choices");
    if (scene.turn) fail(id + ": ending should not take a turn");
    return;
  }

  if (scene.turn !== "karlos" && scene.turn !== "sara") fail(id + ": bad turn");
  if (!scene.choices || scene.choices.length < 2 || scene.choices.length > 3) {
    fail(id + ": need 2–3 choices");
  }
  var seenTo = {};
  (scene.choices || []).forEach(function (choice, i) {
    if (!choice.label || !choice.recap || !choice.to) fail(id + " choice " + i + ": missing label, recap, or to");
    if (!scenes[choice.to]) fail(id + " choice " + i + " → missing scene " + choice.to);
    if (seenTo[choice.to]) fail(id + ": two choices lead to " + choice.to);
    seenTo[choice.to] = true;
    var next = scenes[choice.to];
    if (next && !next.ending && next.turn === scene.turn) {
      fail(id + " → " + choice.to + ": turn does not alternate");
    }
  });
});

var depthOf = {};
var reachable = {};
var queue = [{ id: story.start, depth: 0 }];
while (queue.length) {
  var cur = queue.shift();
  if (Object.prototype.hasOwnProperty.call(depthOf, cur.id)) {
    if (!scenes[cur.id].ending && depthOf[cur.id] !== cur.depth) {
      fail(cur.id + " reachable at depth " + depthOf[cur.id] + " and " + cur.depth);
    }
    continue;
  }
  depthOf[cur.id] = cur.depth;
  reachable[cur.id] = true;
  var scene = scenes[cur.id];
  if (!scene || scene.ending) continue;
  scene.choices.forEach(function (choice) {
    queue.push({ id: choice.to, depth: cur.depth + 1 });
  });
}

ids.forEach(function (id) {
  if (!reachable[id]) fail("unreachable scene: " + id);
});

var paths = 0;
var minMoves = Infinity;
var maxMoves = 0;
var endingHits = {};
var stack = [];

function walk(id, depth) {
  if (stack.indexOf(id) !== -1) {
    fail("cycle: " + stack.concat(id).join(" → "));
    return;
  }
  var scene = scenes[id];
  if (!scene) return;
  if (scene.ending) {
    paths += 1;
    if (depth < minMoves) minMoves = depth;
    if (depth > maxMoves) maxMoves = depth;
    if (depth < 8 || depth > 14) {
      fail("path of " + depth + " moves ends at " + id + " (" + stack.join(" → ") + ")");
    }
    endingHits[id] = (endingHits[id] || 0) + 1;
    return;
  }
  stack.push(id);
  scene.choices.forEach(function (choice) {
    walk(choice.to, depth + 1);
  });
  stack.pop();
}

walk(story.start, 0);

ids.forEach(function (id) {
  if (scenes[id].ending && !endingHits[id]) fail("ending never reached: " + id);
});

var tonesHit = {};
Object.keys(endingHits).forEach(function (id) {
  tonesHit[scenes[id].ending] = true;
});
["sweet", "dangerous", "bittersweet", "triumphant", "cheeky"].forEach(function (tone) {
  if (!tonesHit[tone]) fail("no ending with tone " + tone);
});

var endingCount = ids.filter(function (id) { return scenes[id].ending; }).length;
if (ids.length < 25 || ids.length > 35) fail("scene count " + ids.length + " is outside 25–35");
if (endingCount < 5) fail("only " + endingCount + " endings");
if (story.players.karlos.name !== "Karlos" || story.players.sara.name !== "Sara") {
  fail("player names must be Karlos and Sara");
}

if (errors.length) {
  console.error("STORY CHECK FAILED (" + errors.length + ")");
  errors.forEach(function (err) { console.error(" - " + err); });
  process.exit(1);
}

console.log("scenes: " + ids.length);
console.log("endings: " + endingCount);
console.log("paths: " + paths);
console.log("moves: " + minMoves + "–" + maxMoves);
Object.keys(endingHits).sort().forEach(function (id) {
  console.log("  " + id + " (" + scenes[id].ending + ") × " + endingHits[id]);
});
console.log("every choice lands, every path ends");
