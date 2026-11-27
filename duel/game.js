/**
 * The Giggle Duel — rules, text, and link state.
 *
 * No server. A duel is a seed, who went first, and the move string.
 * Replaying those from the start rebuilds the bars, the log, and the winner.
 * The page keeps that replay in the URL hash.
 *
 * Check: node duel/check-duel.js
 */
(function (root, factory) {
  var api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.DUEL = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  var MAX_HP = 64;
  var MAX_ENERGY = 100;
  var START_ENERGY = 24;
  var REGEN = 18;
  var PRESSURE_ROUND = 12;
  var PRESSURE_DAMAGE = 8;
  var HARD_ROUND = 26;
  var HARD_DAMAGE = 16;
  var MAX_MOVES = 48;
  var MAX_CUSTOM = 80;

  var PLAYERS = {
    karlos: {
      id: "karlos",
      name: "Karlos",
      epithet: "The Deadpan",
      mark: "\u263E",
      side: "his",
      subject: "he"
    },
    sara: {
      id: "sara",
      name: "Sara",
      epithet: "The Instigator",
      mark: "\u2665",
      side: "her",
      subject: "she"
    }
  };

  var MOVES = [
    {
      id: "tickle",
      name: "Tickle attack",
      emoji: "\uD83E\uDD2D",
      cost: 10,
      blurb: "Go for the ribs.",
      kind: "attack",
      miss: 0.1,
      dmg: [13, 18],
      crit: 0.22,
      critBonus: 8
    },
    {
      id: "pillow",
      name: "Pillow smack",
      emoji: "\uD83D\uDECF",
      cost: 16,
      blurb: "A soft, serious hit.",
      kind: "attack",
      miss: 0.16,
      dmg: [18, 26],
      crit: 0.16,
      critBonus: 10
    },
    {
      id: "tease",
      name: "Cheeky tease",
      emoji: "\uD83D\uDE0F",
      cost: 12,
      blurb: "Lower their defence.",
      kind: "attack",
      miss: 0.1,
      dmg: [7, 11],
      crit: 0.12,
      critBonus: 6,
      fluster: true
    },
    {
      id: "sweet",
      name: "Sweet talk",
      emoji: "\uD83D\uDC96",
      cost: 14,
      blurb: "Skip their turn, or crack their guard.",
      kind: "attack",
      miss: 0.12,
      dmg: [4, 8],
      crit: 0.08,
      critBonus: 4,
      charm: 0.5
    },
    {
      id: "fort",
      name: "Pillow fort",
      emoji: "\uD83C\uDFF0",
      cost: 8,
      blurb: "Soften the next hit.",
      kind: "fort"
    },
    {
      id: "cuddle",
      name: "Cuddle recharge",
      emoji: "\uD83E\uDD17",
      cost: 0,
      blurb: "Restore energy. A little composure, too.",
      kind: "cuddle",
      gain: 36,
      heal: 3
    }
  ];

  var SIGNATURES = {
    sara: {
      id: "signature",
      name: "The Voice Note",
      emoji: "\uD83C\uDF99",
      cost: 100,
      spendAll: true,
      blurb: "Sara's finisher. Unfair timing.",
      kind: "attack",
      miss: 0.06,
      dmg: [34, 44],
      crit: 0.24,
      critBonus: 14,
      charm: 0.4
    },
    karlos: {
      id: "signature",
      name: "The Quiet Line",
      emoji: "\uD83C\uDF19",
      cost: 100,
      spendAll: true,
      blurb: "Karlos's finisher. It gets through pillows.",
      kind: "attack",
      miss: 0.06,
      dmg: [32, 42],
      crit: 0.28,
      critBonus: 12,
      ignoreFort: true,
      fluster: true
    }
  };

  var PASS = {
    id: "pass",
    name: "Catch your breath",
    emoji: "\uD83D\uDE2E\u200D\uD83D\uDCA8",
    cost: 0,
    blurb: "Too smitten to answer this turn.",
    kind: "pass"
  };

  var CODES = {
    tickle: "t",
    pillow: "p",
    tease: "c",
    sweet: "w",
    fort: "f",
    cuddle: "r",
    signature: "x",
    pass: "z"
  };

  var BY_CODE = {};
  Object.keys(CODES).forEach(function (id) {
    BY_CODE[CODES[id]] = id;
  });

  var FORFEITS = [
    { id: "film", text: "The winner picks the next film. No sighing, no notes." },
    { id: "laugh", text: "The loser sends a voice note of their real, unedited laugh." },
    { id: "kiss", text: "A forehead kiss is owed, payable the next time you share a room." },
    { id: "note", text: "The loser writes three true lines about what they like, and means them." },
    { id: "dance", text: "The loser owes a ten-second silly dance on the next call." }
  ];

  var FORFEIT_IDS = {};
  FORFEITS.forEach(function (item) {
    FORFEIT_IDS[item.id] = item;
  });

  function other(id) {
    return id === "karlos" ? "sara" : "karlos";
  }

  function player(id) {
    return PLAYERS[id];
  }

  function fill(template, actorId) {
    var actor = PLAYERS[actorId];
    var foe = PLAYERS[other(actorId)];
    return template
      .replace(/\{A\}/g, actor.name)
      .replace(/\{B\}/g, foe.name)
      .replace(/\{S\}/g, actor.side)
      .replace(/\{T\}/g, foe.side);
  }

  function pick(roll, list) {
    var index = Math.floor(roll * list.length);
    if (index >= list.length) index = list.length - 1;
    if (index < 0) index = 0;
    return list[index];
  }

  function mulberry32(seed) {
    var a = seed >>> 0;
    return {
      next: function () {
        a |= 0;
        a = (a + 0x6d2b79f5) | 0;
        var t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      },
      state: function () {
        return a >>> 0;
      }
    };
  }

  function blankFighter() {
    return {
      resistance: MAX_HP,
      energy: START_ENERGY,
      fort: 0,
      fluster: 0,
      stun: 0
    };
  }

  function clone(state) {
    return JSON.parse(JSON.stringify(state));
  }

  function moveDef(actorId, moveId) {
    if (moveId === "pass") return PASS;
    if (moveId === "signature") return SIGNATURES[actorId];
    for (var i = 0; i < MOVES.length; i++) {
      if (MOVES[i].id === moveId) return MOVES[i];
    }
    return null;
  }

  function catalog(actorId) {
    return MOVES.concat([SIGNATURES[actorId]]);
  }

  function pressureDamage(round) {
    if (round >= HARD_ROUND) return HARD_DAMAGE;
    if (round >= PRESSURE_ROUND) return PRESSURE_DAMAGE;
    return 0;
  }

  function winSentence(winnerId, loserId) {
    return PLAYERS[loserId].name + " can't hold it. The giggle meter hits zero. " + PLAYERS[winnerId].name + " wins the duel.";
  }

  function pushLog(state, entry) {
    entry.seq = state.moves.length;
    state.log.push(entry);
  }

  function beginTurn(state, id) {
    state.round += 1;
    state.turn = id;
    var fighter = state.players[id];
    fighter.energy = Math.min(MAX_ENERGY, fighter.energy + REGEN);
    var chip = pressureDamage(state.round);
    if (!chip) return;
    fighter.resistance = Math.max(0, fighter.resistance - chip);
    var ko = fighter.resistance === 0;
    var text = fill("{A} has been holding a straight face for too long. {B} hears the giggle escape.", id);
    if (ko) text += " " + winSentence(other(id), id);
    pushLog(state, {
      type: "pressure",
      actor: id,
      move: "",
      name: "Can't hold it",
      emoji: "\uD83E\uDD2D",
      outcome: "ok",
      amount: chip,
      heal: false,
      raw: chip,
      text: text,
      opp: [],
      self: [],
      broke: [],
      mitigated: false,
      through: false,
      ko: ko
    });
    if (ko) {
      state.winner = other(id);
      state.over = true;
    }
  }

  function create(options) {
    var opts = options || {};
    var seed = opts.seed >>> 0;
    if (!seed) throw new Error("seed required");
    var first = opts.first === "sara" ? "sara" : "karlos";
    var state = {
      v: 1,
      seed: seed,
      rand: seed >>> 0,
      first: first,
      flip: !!opts.flip,
      round: 0,
      turn: first,
      moves: [],
      log: [],
      winner: null,
      over: false,
      forfeit: null,
      players: {
        karlos: blankFighter(),
        sara: blankFighter()
      }
    };
    beginTurn(state, first);
    return state;
  }

  function isLegal(state, moveId) {
    if (!state || state.over || state.winner) return false;
    if (state.moves.length >= MAX_MOVES) return false;
    var me = state.players[state.turn];
    if (!me) return false;
    if (me.stun) return moveId === "pass";
    if (moveId === "pass") return false;
    var spec = moveDef(state.turn, moveId);
    if (!spec) return false;
    if (spec.spendAll) return me.energy >= MAX_ENERGY;
    return me.energy >= spec.cost;
  }

  function legalMoves(state) {
    if (!state || state.over) return [];
    var me = state.players[state.turn];
    if (me && me.stun) return ["pass"];
    var list = [];
    catalog(state.turn).forEach(function (spec) {
      if (isLegal(state, spec.id)) list.push(spec.id);
    });
    return list;
  }

  function draw(rng) {
    return {
      miss: rng.next(),
      power: rng.next(),
      crit: rng.next(),
      effect: rng.next(),
      text: rng.next()
    };
  }

  function rolledDamage(spec, power) {
    var min = spec.dmg[0];
    var span = spec.dmg[1] - min;
    return min + Math.min(span, Math.floor(power * (span + 1)));
  }

  function deal(defender, raw, spec) {
    var amount = raw;
    var broke = [];
    var through = false;
    if (defender.fluster) {
      amount = amount * 1.35;
      defender.fluster = 0;
      broke.push("fluster");
    }
    if (defender.fort && spec.ignoreFort) {
      defender.fort = 0;
      through = true;
      broke.push("fort");
    } else if (defender.fort) {
      amount = amount * 0.28;
      defender.fort = 0;
      broke.push("fort");
    }
    amount = Math.max(0, Math.round(amount));
    defender.resistance = Math.max(0, defender.resistance - amount);
    return {
      amount: amount,
      broke: broke,
      through: through,
      mitigated: !through && broke.indexOf("fort") !== -1
    };
  }

  function attackText(spec, actorId, outcome, stunned) {
    var bank;
    if (spec.id === "signature" && actorId === "sara") {
      bank = outcome === "miss" ? [
        "Sara sends the voice note. Karlos's phone is face-down and innocent. The note waits.",
        "Sara's voice note crosses the sea and lands in a pocket. Karlos missed it. Rude of the pocket."
      ] : outcome === "crit" ? [
        "Sara says his name like that. Karlos's giggle meter never stood a chance.",
        "The voice note crits in the fondest way. Karlos has to mute, and Sara knows."
      ] : stunned ? [
        "Sara's voice note starts with a laugh. Karlos is finished, and too smitten for a reply.",
        "Sara sends it softly. Karlos lasts four seconds, then forgets whose turn it was."
      ] : [
        "Sara sends the voice note. Karlos lasts four seconds, then none.",
        "The note opens on Sara's laugh. Karlos hears it and loses the thread."
      ];
    } else if (spec.id === "signature") {
      bank = outcome === "miss" ? [
        "Karlos delivers the line just as Sara sneezes. The moment walks into a door.",
        "The quiet line leaves Karlos just as the call hiccups. Sara misses it. The ocean is rude."
      ] : outcome === "crit" ? [
        "Karlos drops the line and almost smiles. Sara is not prepared for the almost.",
        "He says it once. Sara laughs so hard the call pixelates, and Karlos looks pleased."
      ] : [
        "Karlos goes quiet, then says one line. Sara's pillows are suddenly decorative.",
        "One sentence, perfectly timed. Sara hears Karlos and forgets the score."
      ];
    } else if (spec.id === "tickle") {
      bank = outcome === "miss" ? [
        "{B} catches {A}'s hands and looks terribly pleased.",
        "{A} goes for the ribs. {B} saw it coming and will be smug about this."
      ] : outcome === "crit" ? [
        "{B} makes a sound that will be brought up later. {A} looks delighted.",
        "Critical tickle. {B} folds, and {A} is fond about it in the most unbearable way."
      ] : [
        "{A} finds the exact rib. {B} negotiates with a laugh and loses.",
        "{B} lasts a heroic half-second. {A}'s fingers are not impressed."
      ];
    } else if (spec.id === "pillow") {
      bank = outcome === "miss" ? [
        "{A} commits to the swing. The pillow hits a lamp. {B} sends sympathies to the lamp.",
        "{B} ducks. {A}'s pillow takes the scenic route across the room."
      ] : outcome === "crit" ? [
        "Direct hit. {B} vanishes into the bedding and comes back already giggling at {A}.",
        "{A} finds the angle. {B}'s composure leaves the chat."
      ] : [
        "The pillow lands. {B}'s hair files a complaint with {A}.",
        "{A} swings the pillow like a closing argument. {B} feels it."
      ];
    } else if (spec.id === "tease") {
      bank = outcome === "miss" ? [
        "{B} sips something and refuses to give {A} the satisfaction.",
        "{A} lines up a perfect tease. {B} just smiles, immune for one whole second."
      ] : outcome === "crit" ? [
        "{A} mentions the 2 a.m. thing. {B}'s ears file a full confession.",
        "The tease lands too well. {B} is flustered, and {A} clocks it immediately."
      ] : [
        "{A} mentions the thing {B} said at 2 a.m. The ears give {B} away.",
        "{A} raises an eyebrow over the call. {B} walks straight into it."
      ];
    } else {
      bank = outcome === "miss" ? [
        "{B} raises an eyebrow. {A}'s sweet talk bounces off. Points for trying.",
        "{A} tries honey. {B} is wise to {A} today."
      ] : stunned ? [
        "{A} goes soft on purpose. {B} forgets the plan, the score, and whose turn it is.",
        "Sweet talk, unfairly delivered. {B} is too smitten to answer {A} this round."
      ] : outcome === "crit" ? [
        "{A} says one gentle thing. {B}'s defence develops a very cute crack.",
        "It was supposed to be a small line. {B} smiles at {A} at entirely the wrong time."
      ] : [
        "It doesn't stop {B}, but {A} has them smiling at the wrong time.",
        "{A} says something gentle. {B}'s guard slips half an inch."
      ];
    }
    return bank;
  }

  function plainText(spec, actorId, rolls) {
    var line = rolls.text;
    if (spec.kind === "fort") {
      return fill(pick(line, [
        "{A} builds a pillow fort with serious focus. {B} may proceed, unwisely.",
        "A wall of pillows. {A} looks safe and slightly smug. {B} can still try."
      ]), actorId);
    }
    if (spec.kind === "cuddle") {
      return fill(pick(line, [
        "{A} wraps up in a blanket on {S} side of the call. {B} watches the energy come back. Legal, and rude.",
        "A tactical cuddle. {A} recharges while {B} pretends not to find it cute."
      ]), actorId);
    }
    return fill(pick(line, [
      "{A} tries to take a turn and just laughs. {B} waits, terribly pleased.",
      "{A} needs a second. {B}'s sweet talk is still in the room."
    ]), actorId);
  }

  function apply(state, moveId) {
    if (!isLegal(state, moveId)) {
      var error = new Error("illegal move " + moveId);
      error.code = "ILLEGAL";
      throw error;
    }
    var next = clone(state);
    var actorId = next.turn;
    var spec = moveDef(actorId, moveId);
    var actor = next.players[actorId];
    var defender = next.players[other(actorId)];
    var rng = mulberry32(next.rand >>> 0);
    var rolls = draw(rng);
    next.rand = rng.state();
    next.moves.push(moveId);

    if (spec.spendAll) actor.energy = 0;
    else actor.energy = Math.max(0, actor.energy - spec.cost);

    var entry = {
      type: "move",
      actor: actorId,
      move: moveId,
      name: spec.name,
      emoji: spec.emoji,
      outcome: "ok",
      amount: 0,
      heal: false,
      raw: null,
      text: "",
      opp: [],
      self: [],
      mitigated: false,
      through: false,
      broke: [],
      ko: false
    };

    if (spec.kind === "pass") {
      actor.stun = 0;
      entry.text = plainText(spec, actorId, rolls);
    } else if (spec.kind === "fort") {
      actor.fort = 1;
      entry.self = ["fort"];
      entry.text = plainText(spec, actorId, rolls);
    } else if (spec.kind === "cuddle") {
      var energyBefore = actor.energy;
      var hpBefore = actor.resistance;
      actor.energy = Math.min(MAX_ENERGY, actor.energy + spec.gain);
      actor.resistance = Math.min(MAX_HP, actor.resistance + spec.heal);
      entry.heal = true;
      entry.amount = actor.resistance - hpBefore;
      entry.raw = actor.energy - energyBefore;
      entry.text = plainText(spec, actorId, rolls);
    } else {
      var missed = rolls.miss < spec.miss;
      if (missed) {
        entry.outcome = "miss";
        entry.text = fill(pick(rolls.text, attackText(spec, actorId, "miss", false)), actorId);
      } else {
        var raw = rolledDamage(spec, rolls.power);
        var crit = rolls.crit < spec.crit;
        if (crit) {
          raw += spec.critBonus;
          entry.outcome = "crit";
        } else {
          entry.outcome = "hit";
        }
        var hit = deal(defender, raw, spec);
        entry.raw = raw;
        entry.amount = hit.amount;
        entry.mitigated = hit.mitigated;
        entry.through = hit.through;
        entry.broke = hit.broke;
        var stunned = false;
        if (spec.charm && rolls.effect < spec.charm && defender.resistance > 0) {
          defender.stun = 1;
          stunned = true;
          entry.opp.push("stun");
        } else if (spec.fluster && defender.resistance > 0) {
          defender.fluster = 1;
          entry.opp.push("fluster");
        } else if (spec.charm && defender.resistance > 0) {
          defender.fluster = 1;
          entry.opp.push("fluster");
        }
        entry.text = fill(pick(rolls.text, attackText(spec, actorId, entry.outcome, stunned)), actorId);
        if (defender.resistance === 0) {
          entry.ko = true;
          entry.text += " " + winSentence(actorId, other(actorId));
          next.winner = actorId;
          next.over = true;
        }
      }
    }

    pushLog(next, entry);
    if (!next.over) beginTurn(next, other(actorId));
    return next;
  }

  function cleanCustom(text) {
    var cleaned = String(text || "").replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim();
    if (cleaned.length > MAX_CUSTOM) cleaned = cleaned.slice(0, MAX_CUSTOM).trim();
    return cleaned;
  }

  function setForfeit(state, id, custom) {
    if (!state || !state.over || !state.winner) return state;
    var next = clone(state);
    if (id === "custom") {
      var text = cleanCustom(custom);
      next.forfeit = text ? { id: "custom", text: text } : null;
      return next;
    }
    if (!FORFEIT_IDS[id]) {
      next.forfeit = null;
      return next;
    }
    next.forfeit = { id: id, text: FORFEIT_IDS[id].text };
    return next;
  }

  function forfeitText(forfeit) {
    if (!forfeit) return "";
    if (forfeit.id === "custom") return cleanCustom(forfeit.text);
    if (FORFEIT_IDS[forfeit.id]) return FORFEIT_IDS[forfeit.id].text;
    return "";
  }

  function pack(state) {
    var query = new URLSearchParams();
    query.set("v", "1");
    query.set("s", (state.seed >>> 0).toString(36));
    query.set("f", state.first === "sara" ? "s" : "k");
    if (state.moves.length) {
      query.set("m", state.moves.map(function (id) { return CODES[id]; }).join(""));
    }
    if (state.flip) query.set("flip", "1");
    if (state.forfeit && state.forfeit.id) {
      query.set("p", state.forfeit.id);
      if (state.forfeit.id === "custom") query.set("c", forfeitText(state.forfeit));
    }
    return "#" + query.toString();
  }

  function readHash(hash) {
    var raw = String(hash || "").replace(/^#/, "");
    if (!raw || raw === "start") return { screen: "start" };
    var params;
    try {
      params = new URLSearchParams(raw);
    } catch (err) {
      return { screen: "error" };
    }
    if (params.get("v") && params.get("v") !== "1") return { screen: "error" };
    var seedText = params.get("s") || "";
    if (!/^[0-9a-z]+$/i.test(seedText)) return { screen: "error" };
    var seed = parseInt(seedText, 36);
    if (!seed || seed < 1 || seed > 0x7fffffff) return { screen: "error" };
    var firstCode = params.get("f");
    if (firstCode !== "k" && firstCode !== "s") return { screen: "error" };
    var moveText = params.get("m") || "";
    if (moveText.length > MAX_MOVES) return { screen: "error" };
    if (moveText && !/^[tpcwfrxz]+$/.test(moveText)) return { screen: "error" };
    var flip = params.get("flip") === "1";
    var forfeitId = params.get("p");
    var custom = params.get("c");
    if (forfeitId && forfeitId !== "custom" && !FORFEIT_IDS[forfeitId]) return { screen: "error" };
    return {
      screen: "play",
      seed: seed,
      first: firstCode === "s" ? "sara" : "karlos",
      moves: moveText,
      flip: flip,
      forfeitId: forfeitId,
      custom: custom
    };
  }

  function unpack(hash) {
    var read = readHash(hash);
    if (read.screen !== "play") return read;
    var state;
    try {
      state = create({ seed: read.seed, first: read.first, flip: read.flip });
      for (var i = 0; i < read.moves.length; i++) {
        state = apply(state, BY_CODE[read.moves.charAt(i)]);
      }
    } catch (err) {
      return { screen: "error" };
    }
    if (read.moves.length !== state.moves.length) return { screen: "error" };
    if (state.over && read.forfeitId) {
      state = setForfeit(state, read.forfeitId, read.custom);
    }
    return { screen: "play", state: state };
  }

  return {
    title: "The Giggle Duel",
    tagline: "Sara versus Karlos. Two countries, one call, zero straight faces.",
    startNote: "Karlos goes first, unless you flip for it. After each move, send the link.",
    MAX_HP: MAX_HP,
    MAX_ENERGY: MAX_ENERGY,
    START_ENERGY: START_ENERGY,
    REGEN: REGEN,
    MAX_CUSTOM: MAX_CUSTOM,
    PRESSURE_ROUND: PRESSURE_ROUND,
    players: PLAYERS,
    moves: MOVES,
    signatures: SIGNATURES,
    forfeits: FORFEITS,
    other: other,
    player: player,
    catalog: catalog,
    moveDef: moveDef,
    create: create,
    apply: apply,
    isLegal: isLegal,
    legalMoves: legalMoves,
    setForfeit: setForfeit,
    forfeitText: forfeitText,
    cleanCustom: cleanCustom,
    pack: pack,
    unpack: unpack,
    rng: mulberry32
  };
});
