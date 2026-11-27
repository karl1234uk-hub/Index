/**
 * The Giggle Duel — rules, text, and link state.
 *
 * No server. encode() / decode() round-trip the whole duel into a URL hash.
 * Karlos goes first. Resistance falls when someone cracks up. Energy fills
 * when a tickle, tease, pillow, or compliment lands, and a full bar unlocks
 * that player's finisher.
 *
 * Check: node duel/check-duel.js
 */
(function (root, factory) {
  var api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.DUEL = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  var MAX_HP = 100;
  var MAX_ENERGY = 5;
  var LOG_CAP = 8;

  var players = {
    karlos: { id: "karlos", name: "Karlos", epithet: "Pillow captain", mark: "🪶" },
    sara: { id: "sara", name: "Sara", epithet: "Tickle menace", mark: "🤭" }
  };

  var MOVES = {
    tickle: {
      id: "tickle",
      name: "Tickle attack",
      emoji: "🤭",
      cost: 0,
      kind: "attack",
      blurb: "A giggle with a tax. Builds energy when it lands.",
      dmgMin: 9,
      dmgMax: 14,
      miss: 0.12,
      crit: 0.18,
      energyOnHit: 1
    },
    pillow: {
      id: "pillow",
      name: "Pillow smack",
      emoji: "🪶",
      cost: 1,
      kind: "attack",
      blurb: "The classic. Loud, fluffy, harder to ignore.",
      dmgMin: 16,
      dmgMax: 24,
      miss: 0.14,
      crit: 0.16,
      energyOnHit: 1
    },
    tease: {
      id: "tease",
      name: "Cheeky tease",
      emoji: "😛",
      cost: 0,
      kind: "attack",
      blurb: "A tiny joke. Sometimes they laugh their guard down.",
      dmgMin: 6,
      dmgMax: 11,
      miss: 0.1,
      crit: 0.12,
      energyOnHit: 1,
      guardChance: 0.45
    },
    sweet: {
      id: "sweet",
      name: "Sweet talk",
      emoji: "🌼",
      cost: 1,
      kind: "sweet",
      blurb: "A sincere compliment. They aww, or drop their guard.",
      miss: 0.08
    },
    fort: {
      id: "fort",
      name: "Pillow fort",
      emoji: "🏰",
      cost: 1,
      kind: "fort",
      blurb: "Hide under the cushions. The next hit is smaller.",
      miss: 0.08
    },
    snack: {
      id: "snack",
      name: "Snack break",
      emoji: "🍪",
      cost: 2,
      kind: "heal",
      blurb: "A biscuit and a breather. Resistance comes back.",
      healMin: 18,
      healMax: 28,
      miss: 0.1
    },
    blitz: {
      id: "blitz",
      name: "Tickle Blitz",
      emoji: "🤭",
      who: "sara",
      cost: 5,
      kind: "finisher",
      blurb: "Every ticklish spot, one after another.",
      dmgMin: 28,
      dmgMax: 36,
      miss: 0.05,
      crit: 0.22,
      fortPierce: true
    },
    barrage: {
      id: "barrage",
      name: "Pillow Barrage",
      emoji: "🪶",
      who: "karlos",
      cost: 5,
      kind: "finisher",
      blurb: "Every pillow, all at once.",
      dmgMin: 26,
      dmgMax: 34,
      miss: 0.06,
      crit: 0.18,
      fortBreak: true,
      skipChance: 0.4
    }
  };

  var ORDER = ["tickle", "pillow", "tease", "sweet", "fort", "snack"];

  var FORFEITS = [
    { id: "dance", label: "Do a ridiculous dance on the next call" },
    { id: "voice", label: "Send a voice note of your most dramatic gasp" },
    { id: "hat", label: "Wear the silliest hat you own for the whole next call" },
    { id: "commentary", label: "Narrate the defeat like a sports commentator" },
    { id: "jumps", label: "Ten star jumps, counted out loud, no negotiating" },
    { id: "snackpick", label: "The winner picks the next snack, and you show it on camera" },
    { id: "title", label: "Answer to “Giggle Champion” until the next duel" },
    { id: "song", label: "Sing one chorus badly on purpose. The winner names the song" }
  ];

  var LINES = {
    tickle: {
      hit: [
        "{a} launches a tickle attack. {b} lasts four seconds, then snorts. −{n} resistance.",
        "{a} wiggles ruthless fingers at the camera. {b} giggles early and loses {n} resistance.",
        "{a} finds the ticklish spot at {b}'s side. {b} folds in half. −{n} resistance."
      ],
      crit: [
        "Critical giggles. {a} finds the exact spot and {b} cannot get a word out. −{n} resistance.",
        "{b} tries to stay composed. {a}'s tickle ends that plan in spectacular fashion. −{n} resistance."
      ],
      miss: [
        "{a} goes for a tickle. {b} squirms aside and a cushion takes the hit.",
        "{a} wiggles with total confidence. {b} is bundled in a blanket. Nothing lands."
      ]
    },
    pillow: {
      hit: [
        "{a} swings a pillow at the camera. {b}, in another country, flinches anyway. −{n} resistance.",
        "Whump. {a}'s pillow smack is mostly mime and entirely unfair. {b} loses {n} resistance.",
        "{a} delivers a fluffy blow. {b}'s straight face does not survive. −{n} resistance."
      ],
      crit: [
        "Critical smack. {a} puts every silly ounce into the pillow. {b} disappears in imaginary feathers. −{n} resistance.",
        "The pillow connects like a cartoon. {b} is outrage and giggles. −{n} resistance, courtesy of {a}."
      ],
      miss: [
        "{a} hurls a pillow and it bumps the lamp. {b} awards no points from across the distance.",
        "{a} swings, misses, and spins the chair. {b} applauds, which is worse."
      ]
    },
    tease: {
      hit: [
        "{a} tells {b} they laugh like a boiling kettle. {b} tries not to prove it. −{n} resistance.",
        "{a} does an impression of {b}'s serious face. {b} cracks. −{n} resistance.",
        "{a} accuses {b} of stealing the good biscuit. {b} walks right into it. −{n} resistance."
      ],
      crit: [
        "Critical tease. {a} is so accurate that {b} has to mute the call. −{n} resistance.",
        "{a}'s joke lands so cleanly that {b} snorts mid-sentence. −{n} resistance."
      ],
      miss: [
        "{a} sets up a joke and the punchline trips over itself. {b} offers a polite nod.",
        "{a} teases {b}. {b} has already heard that one. No giggles today."
      ]
    },
    sweet: {
      skip: [
        "{a} tells {b} they have the best laugh in any time zone. {b} goes fully aww and will skip a turn.",
        "{a} says, \u201cYou make ordinary days feel like a win.\u201d {b} is busy saying aww.",
        "A sincere compliment from {a}. {b}'s turn dissolves into one long aww."
      ],
      guard: [
        "{a} tells {b} they are braver than they let on. {b} lets out an aww and drops their guard.",
        "{a} says, \u201cYou always remember the small things.\u201d {b}'s guard goes down."
      ],
      miss: [
        "{a} reaches for a compliment and lands on, \u201cYou have excellent elbows.\u201d {b} is confused, not moved.",
        "{a}'s sweet talk arrives while {b} is chewing. The aww never starts."
      ]
    },
    fort: {
      fort: [
        "{a} builds a pillow fort and peers out, already pleased with the architecture.",
        "Cushions up. {a} is fortified and slightly hard to see.",
        "{a} stacks every spare pillow. The fort is ridiculous and, annoyingly, sound."
      ],
      collapse: [
        "{a} starts a pillow fort. It avalanches inward. {a} is the fort now.",
        "The fort gives up immediately. {a} sits in the ruins, nodding as if this was the plan."
      ]
    },
    snack: {
      heal: [
        "{a} calls a snack break and comes back with {n} more resistance. There are crumbs.",
        "Emergency biscuit. {a} regains {n} resistance and a sugar moustache.",
        "{a} returns from the cupboard looking unbothered. +{n} resistance."
      ],
      stuffed: [
        "{a} eats a biscuit at full resistance. It heals nothing and still counts as a win.",
        "{a} did not need a snack. {a} has one anyway. Resistance stays put."
      ],
      miss: [
        "{a} opens the snack tin. The tin is empty and very loud about it.",
        "{a}'s snack break is just staring into the cupboard, betrayed."
      ]
    },
    blitz: {
      hit: [
        "{a} unleashes Tickle Blitz. {b} is a lost cause of laughter. −{n} resistance.",
        "No warning, both hands. {a}'s Tickle Blitz wrecks {b}'s straight face. −{n} resistance."
      ],
      crit: [
        "Critical Tickle Blitz. {b} laughs so hard the call wobbles. −{n} resistance, and {a} looks delighted."
      ],
      miss: [
        "{a} winds up Tickle Blitz and sneezes instead. {b} is spared and delighted."
      ]
    },
    barrage: {
      hit: [
        "{a} calls Pillow Barrage and dumps every pillow in the room. {b} takes −{n} resistance.",
        "Pillow Barrage. {a} does not ration. {b} is buried in fluff and giggles. −{n} resistance."
      ],
      crit: [
        "Critical barrage. Somewhere, a cushion felt that. {b} loses {n} resistance to {a}."
      ],
      miss: [
        "{a} launches Pillow Barrage and the pile tips the wrong way. {b} scores a clean miss."
      ]
    },
    pass: {
      pass: [
        "{a} is still saying aww, so this turn drifts past.",
        "{a} means to pick a move and produces another aww instead."
      ]
    }
  };

  var KICKERS = {
    hit: "It lands",
    crit: "Critical giggles",
    miss: "Whiff",
    skip: "Aww",
    guard: "Guard down",
    fort: "Fort up",
    heal: "Snack time",
    stuffed: "Already composed",
    pass: "Still saying aww",
    collapse: "Fort down"
  };

  var OUTCOMES = {
    hit: 1, crit: 1, miss: 1, skip: 1, guard: 1, fort: 1, heal: 1, stuffed: 1, pass: 1, collapse: 1
  };

  function otherId(id) {
    return id === "karlos" ? "sara" : "karlos";
  }

  function nameOf(id) {
    return players[id] ? players[id].name : "";
  }

  function Rng(seed) {
    this.seed = seed >>> 0;
  }

  Rng.prototype.next = function () {
    var a = (this.seed + 0x6D2B79F5) | 0;
    var t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    this.seed = a >>> 0;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  Rng.prototype.chance = function (p) {
    return this.next() < p;
  };

  Rng.prototype.int = function (n) {
    return Math.floor(this.next() * n);
  };

  function clone(state) {
    return {
      turn: state.turn,
      hp: { karlos: state.hp.karlos, sara: state.hp.sara },
      energy: { karlos: state.energy.karlos, sara: state.energy.sara },
      fort: { karlos: !!state.fort.karlos, sara: !!state.fort.sara },
      guard: { karlos: !!state.guard.karlos, sara: !!state.guard.sara },
      skip: { karlos: !!state.skip.karlos, sara: !!state.skip.sara },
      winner: state.winner || null,
      forfeit: state.forfeit ? {
        kind: state.forfeit.kind,
        id: state.forfeit.id || "",
        text: state.forfeit.text || ""
      } : null,
      log: state.log.map(function (entry) {
        return {
          actor: entry.actor,
          move: entry.move,
          outcome: entry.outcome,
          amount: entry.amount,
          extra: entry.extra || "",
          line: entry.line
        };
      }),
      seed: state.seed >>> 0
    };
  }

  function newGame(seed) {
    var n;
    if (seed === undefined || seed === null) {
      n = (Math.floor(Math.random() * 4294967296)) >>> 0;
    } else {
      n = Number(seed);
      if (!isFinite(n) || n < 0 || n > 4294967295 || Math.floor(n) !== n) return null;
      n = n >>> 0;
    }
    return {
      turn: "karlos",
      hp: { karlos: MAX_HP, sara: MAX_HP },
      energy: { karlos: 2, sara: 2 },
      fort: { karlos: false, sara: false },
      guard: { karlos: false, sara: false },
      skip: { karlos: false, sara: false },
      winner: null,
      forfeit: null,
      log: [],
      seed: n
    };
  }

  function canUse(state, moveId) {
    if (!state || state.winner || state.forfeit) return false;
    var move = MOVES[moveId];
    if (!move) return false;
    if (state.turn !== "karlos" && state.turn !== "sara") return false;
    if (state.skip[state.turn]) return false;
    if (move.who && move.who !== state.turn) return false;
    if (state.energy[state.turn] < move.cost) return false;
    if (move.kind === "finisher" && state.energy[state.turn] !== MAX_ENERGY) return false;
    return true;
  }

  function movesFor(playerId) {
    if (playerId !== "karlos" && playerId !== "sara") return [];
    var ids = ORDER.slice();
    ids.push(playerId === "sara" ? "blitz" : "barrage");
    return ids.map(function (id) { return MOVES[id]; });
  }

  function pushLog(state, entry) {
    state.log.push(entry);
    if (state.log.length > LOG_CAP) state.log = state.log.slice(state.log.length - LOG_CAP);
  }

  function finishIfDown(state, actor, target) {
    if (state.hp[target] > 0) {
      state.turn = target;
      return;
    }
    state.hp[target] = 0;
    state.winner = actor;
    state.skip[target] = false;
    state.guard[target] = false;
  }

  function applyMove(state, moveId) {
    if (!canUse(state, moveId)) return null;
    var move = MOVES[moveId];
    var next = clone(state);
    var actor = next.turn;
    var target = otherId(actor);
    var rng = new Rng(next.seed);
    next.energy[actor] -= move.cost;

    var outcome = "hit";
    var amount = 0;
    var extra = "";

    if (move.kind === "attack" || move.kind === "finisher") {
      if (rng.chance(move.miss)) {
        outcome = "miss";
      } else {
        var crit = rng.chance(move.crit);
        var roll = move.dmgMin + rng.int(move.dmgMax - move.dmgMin + 1);
        var damage = crit ? Math.round(roll * 1.5) : roll;
        if (next.guard[target]) {
          damage = Math.round(damage * 1.35);
          next.guard[target] = false;
        }
        if (next.fort[target]) {
          if (move.fortBreak) {
            damage = damage;
          } else if (move.fortPierce) {
            damage = Math.round(damage * 0.72);
          } else {
            damage = Math.round(damage * 0.45);
          }
          next.fort[target] = false;
        }
        if (damage < 0) damage = 0;
        amount = damage;
        next.hp[target] = Math.max(0, next.hp[target] - damage);
        outcome = crit ? "crit" : "hit";
        if (move.energyOnHit) {
          next.energy[actor] = Math.min(MAX_ENERGY, next.energy[actor] + move.energyOnHit);
        }
        if (next.hp[target] > 0 && move.guardChance && rng.chance(move.guardChance)) {
          next.guard[target] = true;
          extra = "guard";
        }
        if (next.hp[target] > 0 && move.skipChance && rng.chance(move.skipChance)) {
          next.skip[target] = true;
          extra = "skip";
        }
      }
    } else if (move.kind === "sweet") {
      if (rng.chance(move.miss)) {
        outcome = "miss";
      } else {
        var skip = rng.chance(0.55);
        var chip = 3 + rng.int(4);
        if (next.fort[target]) {
          chip = Math.round(chip * 0.45);
          next.fort[target] = false;
        }
        amount = chip;
        next.hp[target] = Math.max(0, next.hp[target] - chip);
        next.energy[actor] = Math.min(MAX_ENERGY, next.energy[actor] + 1);
        if (next.hp[target] > 0) {
          if (skip) next.skip[target] = true;
          else next.guard[target] = true;
        }
        outcome = skip ? "skip" : "guard";
      }
    } else if (move.kind === "fort") {
      if (rng.chance(move.miss)) {
        outcome = "collapse";
        next.fort[actor] = false;
      } else {
        outcome = "fort";
        next.fort[actor] = true;
      }
    } else if (move.kind === "heal") {
      if (rng.chance(move.miss)) {
        outcome = "miss";
      } else {
        var heal = move.healMin + rng.int(move.healMax - move.healMin + 1);
        var gained = Math.min(heal, MAX_HP - next.hp[actor]);
        if (gained < 0) gained = 0;
        next.hp[actor] += gained;
        amount = gained;
        outcome = gained > 0 ? "heal" : "stuffed";
      }
    } else {
      return null;
    }

    if (next.energy[actor] < 0 || next.energy[actor] > MAX_ENERGY) return null;

    var pool = (LINES[move.id] && LINES[move.id][outcome]) || ["{a} does something silly."];
    var line = rng.int(pool.length);
    pushLog(next, {
      actor: actor,
      move: move.id,
      outcome: outcome,
      amount: amount,
      extra: extra,
      line: line
    });
    if (move.kind === "attack" || move.kind === "finisher" || move.kind === "sweet") {
      finishIfDown(next, actor, target);
    } else {
      next.turn = target;
    }
    next.seed = rng.seed >>> 0;
    return next;
  }

  function passTurn(state) {
    if (!state || state.winner || state.forfeit) return null;
    if (state.turn !== "karlos" && state.turn !== "sara") return null;
    if (!state.skip[state.turn]) return null;
    var next = clone(state);
    var actor = next.turn;
    var rng = new Rng(next.seed);
    next.skip[actor] = false;
    var line = rng.int(LINES.pass.pass.length);
    pushLog(next, {
      actor: actor,
      move: "pass",
      outcome: "pass",
      amount: 0,
      extra: "",
      line: line
    });
    next.turn = otherId(actor);
    next.seed = rng.seed >>> 0;
    return next;
  }

  function cleanCustom(text) {
    if (typeof text !== "string") return null;
    var cleaned = text.replace(/[\u0000-\u001f<>]/g, " ").replace(/\s+/g, " ").trim();
    if (cleaned.length < 3 || cleaned.length > 80) return null;
    return cleaned;
  }

  function presetById(id) {
    for (var i = 0; i < FORFEITS.length; i++) {
      if (FORFEITS[i].id === id) return FORFEITS[i];
    }
    return null;
  }

  function setForfeit(state, choice) {
    if (!state || !state.winner || state.forfeit) return null;
    var next = clone(state);
    if (typeof choice === "string") {
      if (!presetById(choice)) return null;
      next.forfeit = { kind: "preset", id: choice, text: "" };
      return next;
    }
    if (choice && typeof choice.custom === "string") {
      var custom = cleanCustom(choice.custom);
      if (!custom) return null;
      next.forfeit = { kind: "custom", id: "", text: custom };
      return next;
    }
    return null;
  }

  function forfeitText(state) {
    if (!state || !state.forfeit) return "";
    if (state.forfeit.kind === "custom") return state.forfeit.text || "";
    var preset = presetById(state.forfeit.id);
    return preset ? preset.label : "";
  }

  function fill(template, actor, target, amount) {
    return String(template)
      .split("{a}").join(nameOf(actor))
      .split("{b}").join(nameOf(target))
      .split("{n}").join(String(amount));
  }

  function deltaFor(entry) {
    var n = entry.amount;
    var base;
    if (entry.outcome === "hit" || entry.outcome === "crit") {
      base = n > 0 ? "\u2212" + n + " resistance" : "The fort ate it";
    } else if (entry.outcome === "heal") base = "+" + n + " resistance";
    else if (entry.outcome === "stuffed") base = "Already at full resistance";
    else if (entry.outcome === "skip") base = "Skips a turn";
    else if (entry.outcome === "guard") base = "Guard lowered";
    else if (entry.outcome === "fort") base = "Next hit is cushioned";
    else if (entry.outcome === "collapse") base = "The fort fell down";
    else if (entry.outcome === "pass") base = "Turn skipped";
    else if (entry.outcome === "miss") base = "No effect";
    else base = "";
    if ((entry.outcome === "skip" || entry.outcome === "guard") && n > 0) {
      base += " \u00b7 \u2212" + n;
    }
    if (entry.extra === "skip") base += " \u00b7 next turn skipped";
    if (entry.extra === "guard") base += " \u00b7 guard down";
    return base;
  }

  function describe(entry, lethal) {
    var table = LINES[entry.move] || LINES.pass;
    var pool = table[entry.outcome] || ["{a} does something silly."];
    var idx = Math.abs(entry.line | 0) % pool.length;
    var actor = entry.actor;
    var target = otherId(actor);
    var text = fill(pool[idx], actor, target, entry.amount);
    if (entry.extra === "guard") text += " " + nameOf(target) + "'s guard drops.";
    if (entry.extra === "skip") text += " " + nameOf(target) + " will need a moment to dig out.";
    if (lethal) text += " " + nameOf(target) + " cracks up completely. " + nameOf(actor) + " wins the duel.";
    var move = MOVES[entry.move];
    return {
      emoji: move ? move.emoji : "🌼",
      kicker: KICKERS[entry.outcome] || "Move",
      text: text,
      delta: deltaFor(entry),
      amount: entry.amount,
      outcome: entry.outcome,
      extra: entry.extra || "",
      actor: actor,
      target: target,
      moveName: move ? move.name : "Pass"
    };
  }

  function encodeLog(log) {
    return log.map(function (entry) {
      return [
        entry.actor,
        entry.move,
        entry.outcome,
        String(entry.amount),
        entry.extra || "",
        String(entry.line)
      ].join(",");
    }).join("|");
  }

  function encode(state) {
    var params = new URLSearchParams();
    params.set("v", "1");
    params.set("t", state.turn);
    params.set("hk", String(state.hp.karlos));
    params.set("hs", String(state.hp.sara));
    params.set("ek", String(state.energy.karlos));
    params.set("es", String(state.energy.sara));
    params.set("fk", state.fort.karlos ? "1" : "0");
    params.set("fs", state.fort.sara ? "1" : "0");
    params.set("gk", state.guard.karlos ? "1" : "0");
    params.set("gs", state.guard.sara ? "1" : "0");
    params.set("sk", state.skip.karlos ? "1" : "0");
    params.set("ss", state.skip.sara ? "1" : "0");
    params.set("n", String(state.seed >>> 0));
    params.set("w", state.winner || "");
    if (!state.forfeit) params.set("f", "");
    else if (state.forfeit.kind === "preset") params.set("f", "p:" + state.forfeit.id);
    else params.set("f", "c:" + (state.forfeit.text || ""));
    params.set("l", encodeLog(state.log || []));
    return params.toString();
  }

  function readInt(value, min, max) {
    if (typeof value !== "string" || !/^\d+$/.test(value)) return null;
    var n = Number(value);
    if (!isFinite(n) || n < min || n > max) return null;
    return n;
  }

  function readBool(value) {
    if (value === "1") return true;
    if (value === "0") return false;
    return null;
  }

  function readPlayer(value, allowEmpty) {
    if (allowEmpty && value === "") return "";
    if (value === "karlos" || value === "sara") return value;
    return null;
  }

  function outcomeFits(move, outcome) {
    if (move === "pass") return outcome === "pass";
    if (move === "fort") return outcome === "fort" || outcome === "collapse";
    if (move === "snack") return outcome === "miss" || outcome === "heal" || outcome === "stuffed";
    if (move === "sweet") return outcome === "miss" || outcome === "skip" || outcome === "guard";
    if (move === "tickle" || move === "pillow" || move === "tease" || move === "blitz" || move === "barrage") {
      return outcome === "hit" || outcome === "crit" || outcome === "miss";
    }
    return false;
  }

  function decodeLog(raw) {
    if (raw === "") return [];
    var parts = raw.split("|");
    if (parts.length > LOG_CAP) return null;
    var log = [];
    for (var i = 0; i < parts.length; i++) {
      var bits = parts[i].split(",");
      if (bits.length !== 6) return null;
      var actor = readPlayer(bits[0], false);
      var move = bits[1];
      var outcome = bits[2];
      var amount = readInt(bits[3], 0, MAX_HP);
      var extra = bits[4];
      var line = readInt(bits[5], 0, 20);
      if (!actor || amount === null || line === null) return null;
      if (!MOVES[move] && move !== "pass") return null;
      if (!OUTCOMES[outcome] || !outcomeFits(move, outcome)) return null;
      if (extra !== "" && extra !== "guard" && extra !== "skip") return null;
      if (move === "blitz" && actor !== "sara") return null;
      if (move === "barrage" && actor !== "karlos") return null;
      if ((outcome === "hit" || outcome === "crit" || outcome === "miss") && extra === "skip" && move !== "barrage") {
        return null;
      }
      if (extra === "guard" && move !== "tease") return null;
      log.push({ actor: actor, move: move, outcome: outcome, amount: amount, extra: extra, line: line });
    }
    return log;
  }

  function decode(raw) {
    if (!raw || typeof raw !== "string") return null;
    if (raw.charAt(0) === "#") raw = raw.slice(1);
    if (!raw || raw === "start") return null;
    var params;
    try {
      params = new URLSearchParams(raw);
    } catch (err) {
      return null;
    }
    var keys = ["v", "t", "hk", "hs", "ek", "es", "fk", "fs", "gk", "gs", "sk", "ss", "n", "w", "f", "l"];
    for (var i = 0; i < keys.length; i++) {
      if (params.get(keys[i]) === null) return null;
    }
    if (params.get("v") !== "1") return null;
    var turn = readPlayer(params.get("t"), false);
    var hk = readInt(params.get("hk"), 0, MAX_HP);
    var hs = readInt(params.get("hs"), 0, MAX_HP);
    var ek = readInt(params.get("ek"), 0, MAX_ENERGY);
    var es = readInt(params.get("es"), 0, MAX_ENERGY);
    var fk = readBool(params.get("fk"));
    var fs = readBool(params.get("fs"));
    var gk = readBool(params.get("gk"));
    var gs = readBool(params.get("gs"));
    var sk = readBool(params.get("sk"));
    var ss = readBool(params.get("ss"));
    var seed = readInt(params.get("n"), 0, 4294967295);
    var winnerRaw = readPlayer(params.get("w"), true);
    if (!turn || hk === null || hs === null || ek === null || es === null) return null;
    if (fk === null || fs === null || gk === null || gs === null || sk === null || ss === null) return null;
    if (seed === null || winnerRaw === null) return null;
    var log = decodeLog(params.get("l"));
    if (!log) return null;

    var forfeit = null;
    var f = params.get("f");
    if (f) {
      if (f.slice(0, 2) === "p:" && presetById(f.slice(2))) {
        forfeit = { kind: "preset", id: f.slice(2), text: "" };
      } else if (f.slice(0, 2) === "c:") {
        var custom = cleanCustom(f.slice(2));
        if (!custom || custom !== f.slice(2)) return null;
        forfeit = { kind: "custom", id: "", text: custom };
      } else return null;
    }

    var winner = winnerRaw || null;
    if ((hk === 0 && hs === 0) || (hk === 0 && hs === 0)) return null;
    if (winner === "karlos") {
      if (hs !== 0 || hk === 0) return null;
    } else if (winner === "sara") {
      if (hk !== 0 || hs === 0) return null;
    } else if (hk === 0 || hs === 0) return null;
    if (forfeit && !winner) return null;
    if ((hk === 0 && hs === 0)) return null;

    return {
      turn: turn,
      hp: { karlos: hk, sara: hs },
      energy: { karlos: ek, sara: es },
      fort: { karlos: fk, sara: fs },
      guard: { karlos: gk, sara: gs },
      skip: { karlos: sk, sara: ss },
      winner: winner,
      forfeit: forfeit,
      log: log,
      seed: seed >>> 0
    };
  }

  return {
    MAX_HP: MAX_HP,
    MAX_ENERGY: MAX_ENERGY,
    players: players,
    MOVES: MOVES,
    FORFEITS: FORFEITS,
    LINES: LINES,
    newGame: newGame,
    canUse: canUse,
    movesFor: movesFor,
    applyMove: applyMove,
    passTurn: passTurn,
    setForfeit: setForfeit,
    forfeitText: forfeitText,
    encode: encode,
    decode: decode,
    describe: describe,
    otherId: otherId
  };
});
