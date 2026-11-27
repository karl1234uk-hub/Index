(function () {
  "use strict";

  var D = window.DUEL;
  var app = document.getElementById("app");
  var busy = false;
  var shownKey = null;

  function other(id) {
    return D.other(id);
  }

  function el(tag, className) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    return node;
  }

  function gameKey(state) {
    return state.seed + ":" + state.moves.join(",");
  }

  function storageGet(key) {
    try { return sessionStorage.getItem(key); } catch (err) { return null; }
  }

  function storageSet(key, value) {
    try { sessionStorage.setItem(key, value); } catch (err) {}
  }

  function storageClear() {
    try {
      sessionStorage.removeItem("duel-key");
      sessionStorage.removeItem("duel-as");
    } catch (err) {}
  }

  function viewer(state) {
    var key = gameKey(state);
    var stored = history.state || {};
    if (stored.as && stored.key === key) return stored.as;
    if (storageGet("duel-key") === key) return storageGet("duel-as");
    return null;
  }

  function showHandoff(state) {
    var who = viewer(state);
    if (!who) return false;
    if (state.over) return who === state.winner;
    return who !== state.turn;
  }

  function randomSeed() {
    var buf = new Uint32Array(1);
    if (window.crypto && crypto.getRandomValues) {
      crypto.getRandomValues(buf);
      var value = buf[0] & 0x7fffffff;
      return value || 1;
    }
    return 1 + Math.floor(Math.random() * 0x7ffffffe);
  }

  function reduceMotion() {
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function scrollTop() {
    window.scrollTo(0, 0);
  }

  function hearts() {
    var sky = document.getElementById("hearts");
    if (!sky || sky.childNodes.length || reduceMotion()) return;
    var marks = ["\u2665", "\u2665", "\u2726", "\u2661"];
    var i;
    for (i = 0; i < 14; i++) {
      var heart = document.createElement("span");
      heart.className = "heart";
      heart.textContent = marks[i % marks.length];
      heart.style.left = Math.random() * 100 + "%";
      heart.style.fontSize = 10 + Math.random() * 14 + "px";
      heart.style.animationDuration = 11 + Math.random() * 12 + "s";
      heart.style.animationDelay = -Math.random() * 16 + "s";
      heart.style.color = i % 2 ? "#f0c2aa" : "#f3b4c0";
      sky.appendChild(heart);
    }
  }

  function commit(state, actor, replace) {
    var hash = D.pack(state);
    var data = { view: "play", as: actor || null, key: gameKey(state) };
    if (replace) history.replaceState(data, "", hash);
    else history.pushState(data, "", hash);
    if (actor) {
      storageSet("duel-key", data.key);
      storageSet("duel-as", actor);
    }
    render();
  }

  function begin(first, flip) {
    storageClear();
    var state = D.create({ seed: randomSeed(), first: first, flip: !!flip });
    history.pushState({ view: "play", as: null, key: gameKey(state) }, "", D.pack(state));
    render();
  }

  function restart() {
    storageClear();
    history.pushState({ view: "start" }, "", "#start");
    render();
  }

  function latest(state) {
    if (!state.moves.length) return [];
    return state.log.filter(function (entry) {
      return entry.seq === state.moves.length;
    });
  }

  function moveEntry(entries) {
    var i;
    for (i = 0; i < entries.length; i++) {
      if (entries[i].type === "move") return entries[i];
    }
    return entries[0] || null;
  }

  function statLine(entry) {
    if (!entry) return "";
    if (entry.type === "pressure") return "\u2212" + entry.amount + " resistance \u00b7 a giggle slipped out";
    if (entry.move === "cuddle") {
      var bits = [];
      if (entry.amount) bits.push("+" + entry.amount + " resistance");
      if (entry.raw) bits.push("+" + entry.raw + " energy");
      return bits.length ? bits.join(" \u00b7 ") : "Already cosy, and still worth it";
    }
    if (entry.move === "fort") return "The next hit lands softer";
    if (entry.move === "pass") return "Turn skipped";
    if (entry.outcome === "miss") return "Miss";
    var parts = [];
    if (entry.outcome === "crit") parts.push("Critical");
    if (entry.through) parts.push("Straight through the fort");
    else if (entry.mitigated) parts.push("The pillow fort caught most of it");
    parts.push("\u2212" + entry.amount + " resistance");
    if (entry.opp && entry.opp.indexOf("stun") !== -1) parts.push("Smitten");
    else if (entry.opp && entry.opp.indexOf("fluster") !== -1) parts.push("Flustered");
    return parts.join(" \u00b7 ");
  }

  function faceFor(id, hp) {
    var ratio = hp / D.MAX_HP;
    if (hp <= 0) return "\uD83E\uDEE0";
    if (ratio < 0.34) return id === "sara" ? "\uD83D\uDE06" : "\uD83D\uDE02";
    if (ratio < 0.67) return id === "sara" ? "\uD83E\uDD2D" : "\uD83D\uDE0F";
    return id === "sara" ? "\uD83D\uDE0C" : "\uD83D\uDE42";
  }

  function welcome(state) {
    var first = D.players[state.first];
    var second = D.players[other(state.first)];
    if (state.flip) {
      return "The coin picked " + first.name + ". " + second.name + " is already smiling on the other end.";
    }
    return "The call connects. " + first.name + ", " + second.name + " is already smiling.";
  }

  function floatersFor(entry) {
    var banks = {
      tickle: ["\uD83E\uDD2D", "\u2728", "\uD83D\uDE06"],
      pillow: ["\uD83D\uDECF", "\uD83D\uDCA8", "\uD83D\uDE02"],
      tease: ["\uD83D\uDE0F", "\u2728", "\uD83D\uDC42"],
      sweet: ["\uD83D\uDC96", "\u2728", "\uD83D\uDE18"],
      fort: ["\uD83C\uDFF0", "\uD83D\uDECF", "\u2728"],
      cuddle: ["\uD83E\uDD17", "\uD83D\uDC96", "\u2728"],
      pass: ["\uD83D\uDC96", "\uD83D\uDE04", "\u2728"],
      pressure: ["\uD83E\uDD2D", "\u2728", "\uD83E\uDEE7"]
    };
    if (!entry) return ["\u2728", "\u2665"];
    if (entry.move === "signature") {
      return entry.actor === "sara"
        ? ["\uD83C\uDF99", "\uD83D\uDC96", "\u2728"]
        : ["\uD83C\uDF19", "\u2728", "\uD83D\uDE0F"];
    }
    return banks[entry.move] || banks[entry.type] || ["\u2728", "\u2665"];
  }

  function resultBlock(state, animate) {
    var box = el("section", "result");
    box.setAttribute("aria-live", "polite");
    var entries = latest(state);
    var lead = moveEntry(entries);
    var fx = el("div", "fx");
    var emoji = el("div", "fx-emoji" + (animate && lead ? " do-pop" : ""));
    emoji.textContent = lead ? lead.emoji : "\uD83D\uDC95";
    fx.appendChild(emoji);
    if (animate && lead && !reduceMotion()) {
      var bank = floatersFor(lead);
      var s;
      for (s = 0; s < bank.length; s++) {
        var spark = el("span", "spark");
        spark.textContent = bank[s];
        spark.style.setProperty("--dx", (s === 0 ? -54 : s === 1 ? 48 : 8) + "px");
        spark.style.setProperty("--dy", (-36 - s * 16) + "px");
        spark.style.animationDelay = s * 0.05 + "s";
        fx.appendChild(spark);
      }
    }
    box.appendChild(fx);
    if (!lead) {
      var hello = el("p", "flavour");
      hello.textContent = welcome(state);
      box.appendChild(hello);
      return box;
    }
    entries.forEach(function (entry) {
      var beat = el("p", "beat");
      beat.textContent = D.players[entry.actor].name + " \u00b7 " + entry.name;
      var line = el("p", "flavour");
      line.textContent = entry.text;
      var stat = el("p", "stat");
      stat.textContent = statLine(entry);
      box.appendChild(beat);
      box.appendChild(line);
      if (stat.textContent) box.appendChild(stat);
    });
    return box;
  }

  function meter(label, aria, value, max, kind) {
    var wrap = el("div", "meter");
    wrap.setAttribute("role", "meter");
    wrap.setAttribute("aria-label", aria);
    wrap.setAttribute("aria-valuemin", "0");
    wrap.setAttribute("aria-valuemax", String(max));
    wrap.setAttribute("aria-valuenow", String(value));
    var row = el("div", "meter-row");
    var name = el("span", "meter-name");
    name.textContent = label;
    var num = el("span", "meter-num");
    num.textContent = String(value);
    row.appendChild(name);
    row.appendChild(num);
    var track = el("div", "track");
    var fill = el("div", "fill " + kind);
    var pct = max ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;
    fill.style.width = pct + "%";
    if (kind === "hp" && value > 0 && value / max <= 0.3) fill.classList.add("is-low");
    track.appendChild(fill);
    wrap.appendChild(row);
    wrap.appendChild(track);
    return wrap;
  }

  function chipsFor(id, fighter) {
    var row = el("div", "chips");
    function add(text) {
      var chip = el("span", "chip");
      chip.textContent = text;
      row.appendChild(chip);
    }
    if (fighter.fort) add("Pillow fort");
    if (fighter.fluster) add("Flustered");
    if (fighter.stun) add("Smitten");
    if (fighter.energy >= D.MAX_ENERGY) add("Signature ready");
    return row;
  }

  function fighters(state) {
    var grid = el("div", "fighters");
    ["karlos", "sara"].forEach(function (id) {
      var fighter = state.players[id];
      var person = D.players[id];
      var card = el("section", "fighter " + id);
      if (!state.over && state.turn === id) card.classList.add("is-turn");
      if (state.over && state.winner === id) card.classList.add("is-win");
      if (fighter.resistance <= 0) card.classList.add("is-out");
      var who = el("p", "who");
      who.textContent = person.name;
      var face = el("div", "face");
      face.textContent = faceFor(id, fighter.resistance);
      face.setAttribute("aria-hidden", "true");
      card.appendChild(who);
      card.appendChild(face);
      card.appendChild(meter(
        "Resistance",
        person.name + " resistance, giggle meter",
        fighter.resistance,
        D.MAX_HP,
        "hp"
      ));
      card.appendChild(meter(
        "Energy",
        person.name + " energy",
        fighter.energy,
        D.MAX_ENERGY,
        "energy"
      ));
      card.appendChild(chipsFor(id, fighter));
      grid.appendChild(card);
    });
    return grid;
  }

  function banner(state, locked) {
    var whoId = state.over ? state.winner : state.turn;
    var who = D.players[whoId];
    var box = el("div", "banner");
    box.setAttribute("role", "status");
    var mark = el("span", "mark");
    mark.setAttribute("aria-hidden", "true");
    mark.textContent = who.mark;
    var turn = el("p", "turn");
    turn.textContent = state.over ? who.name + " wins" : who.name + "'s turn";
    var epithet = el("p", "epithet");
    if (state.over) epithet.textContent = D.players[other(state.winner)].name + " cracked first";
    else if (!state.moves.length && state.flip) epithet.textContent = "The coin said " + D.players[state.first].name;
    else epithet.textContent = who.epithet;
    box.appendChild(mark);
    box.appendChild(turn);
    box.appendChild(epithet);
    if (!locked && !state.over) {
      var yours = el("p", "yours");
      var me = state.players[state.turn];
      yours.textContent = me.stun ? "Too smitten to answer" : "Your move";
      box.appendChild(yours);
    }
    return box;
  }

  function copyLink(button, doneLabel) {
    var url = location.href;
    var previous = button.textContent;
    var done = function () {
      button.textContent = doneLabel || "Copied";
      button.classList.add("is-done");
      setTimeout(function () {
        button.textContent = previous;
        button.classList.remove("is-done");
      }, 1800);
    };
    var fallback = function () {
      var field = document.querySelector(".linkbox");
      if (field) {
        field.focus();
        field.select();
      }
      button.textContent = "Press and hold the link";
    };
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(url).then(done, function () {
        try {
          var area = document.createElement("textarea");
          area.value = url;
          area.setAttribute("readonly", "");
          area.style.position = "fixed";
          area.style.left = "-9999px";
          document.body.appendChild(area);
          area.select();
          var ok = document.execCommand("copy");
          document.body.removeChild(area);
          if (ok) done();
          else fallback();
        } catch (err) {
          fallback();
        }
      });
      return;
    }
    fallback();
  }

  function shareLink(toName, over) {
    if (!navigator.share) return;
    var text = over
      ? toName + ", the giggle duel is decided."
      : toName + ", it's your turn in the giggle duel.";
    navigator.share({ title: D.title, text: text, url: location.href }).catch(function () {});
  }

  function linkField() {
    var field = el("input", "linkbox");
    field.type = "text";
    field.readOnly = true;
    field.value = location.href;
    field.setAttribute("aria-label", "Link to this moment");
    field.addEventListener("focus", function () { field.select(); });
    return field;
  }

  function handoff(toName, over, forfeitReady) {
    var box = el("div", "handoff");
    var shout = el("p", "shout");
    shout.textContent = "Send the link to " + toName;
    var ask = el("p", "ask");
    ask.textContent = over
      ? (forfeitReady ? "The forfeit rides along with it." : "Pick a forfeit above, then send this.")
      : "Your move is made. Theirs is next.";
    var copy = el("button", "primary");
    copy.type = "button";
    copy.textContent = "Copy link";
    copy.addEventListener("click", function () { copyLink(copy); });
    box.appendChild(shout);
    box.appendChild(ask);
    box.appendChild(copy);
    if (navigator.share) {
      var share = el("button", "ghost");
      share.type = "button";
      share.textContent = "Share to " + toName;
      share.addEventListener("click", function () { shareLink(toName, over); });
      box.appendChild(share);
    }
    box.appendChild(linkField());
    var hint = el("p", "hint");
    hint.textContent = over
      ? toName + " opens this and sees how it ended. The link is the whole game."
      : toName + " opens this link and takes a turn. The link is the whole game.";
    box.appendChild(hint);
    return box;
  }

  function costLabel(spec, state) {
    if (spec.spendAll) return D.isLegal(state, spec.id) ? "READY" : "FULL";
    if (!spec.cost) return "FREE";
    return String(spec.cost);
  }

  function moveButton(state, spec) {
    var legal = D.isLegal(state, spec.id);
    var button = el("button", "choice" + (spec.spendAll ? " is-signature" : ""));
    button.type = "button";
    button.disabled = !legal;
    var cost = costLabel(spec, state);
    button.setAttribute("aria-label", spec.name + (spec.spendAll ? ", signature, " + cost : ", costs " + cost + " energy"));
    var emo = el("span", "emo");
    emo.setAttribute("aria-hidden", "true");
    emo.textContent = spec.emoji;
    var copy = el("span", "copy");
    var name = el("span", "move-name");
    name.textContent = spec.name;
    var blurb = el("span", "blurb");
    blurb.textContent = spec.blurb;
    var price = el("span", "cost");
    price.textContent = cost;
    copy.appendChild(name);
    copy.appendChild(blurb);
    button.appendChild(emo);
    button.appendChild(copy);
    button.appendChild(price);
    if (legal) button.addEventListener("click", function () { choose(spec.id); });
    return button;
  }

  function moveList(state) {
    var wrap = el("div", "moves");
    var head = el("p", "moves-head");
    var me = state.players[state.turn];
    head.textContent = me.stun ? "Nothing to do but giggle" : "Pick a move";
    wrap.appendChild(head);
    if (me.stun) {
      wrap.appendChild(moveButton(state, D.moveDef(state.turn, "pass")));
      return wrap;
    }
    D.catalog(state.turn).forEach(function (spec) {
      wrap.appendChild(moveButton(state, spec));
    });
    return wrap;
  }

  function logList(state) {
    if (!state.log.length) return null;
    var details = el("details", "sofar");
    var summary = el("summary");
    summary.textContent = "Battle log \u00b7 " + state.log.length;
    details.appendChild(summary);
    var list = el("ol");
    state.log.forEach(function (entry) {
      var item = el("li");
      var who = el("span", "who-line");
      who.textContent = D.players[entry.actor].name + " \u00b7 " + entry.name;
      item.appendChild(who);
      item.appendChild(document.createTextNode(entry.text));
      list.appendChild(item);
    });
    details.appendChild(list);
    return details;
  }

  function footer(label) {
    var foot = el("footer");
    var again = el("button", "texty");
    again.type = "button";
    again.textContent = label || "Start over";
    again.addEventListener("click", restart);
    var sign = el("p", "sign");
    sign.textContent = "pass the link, keep the pillows";
    foot.appendChild(again);
    foot.appendChild(sign);
    return foot;
  }

  function forfeitCard(text) {
    var card = el("p", "forfeit-card");
    card.textContent = text;
    return card;
  }

  function forfeitEditor(state) {
    var box = el("section", "forfeit");
    var title = el("h2");
    title.textContent = "Name " + D.players[other(state.winner)].name + "'s forfeit";
    box.appendChild(title);
    var hint = el("p", "tiny");
    hint.textContent = "Pick one, or write a gentle line. Then send the link.";
    box.appendChild(hint);
    var presets = el("div", "presets");
    D.forfeits.forEach(function (item) {
      var button = el("button", "preset" + (state.forfeit && state.forfeit.id === item.id ? " is-on" : ""));
      button.type = "button";
      button.setAttribute("aria-pressed", state.forfeit && state.forfeit.id === item.id ? "true" : "false");
      button.textContent = item.text;
      button.addEventListener("click", function () { chooseForfeit(item.id); });
      presets.appendChild(button);
    });
    box.appendChild(presets);
    var composer = el("div", "composer");
    var field = el("input", "field");
    field.type = "text";
    field.maxLength = D.MAX_CUSTOM;
    field.placeholder = "Or write a gentle one\u2026";
    field.setAttribute("aria-label", "Custom forfeit");
    field.autocomplete = "off";
    if (state.forfeit && state.forfeit.id === "custom") field.value = state.forfeit.text;
    var use = el("button", "ghost");
    use.type = "button";
    use.textContent = "Use this line";
    use.addEventListener("click", function () { chooseForfeit("custom", field.value); });
    field.addEventListener("keydown", function (event) {
      if (event.key === "Enter") chooseForfeit("custom", field.value);
    });
    composer.appendChild(field);
    composer.appendChild(use);
    box.appendChild(composer);
    if (state.forfeit && state.forfeit.id === "custom") box.appendChild(forfeitCard(state.forfeit.text));
    var fine = el("p", "tiny");
    fine.textContent = "Payable in affection, at a time that suits you both.";
    box.appendChild(fine);
    return box;
  }

  function forfeitReadout(state) {
    var box = el("section", "forfeit");
    var title = el("h2");
    title.textContent = "The forfeit";
    box.appendChild(title);
    if (state.forfeit && state.forfeit.text) {
      box.appendChild(forfeitCard(state.forfeit.text));
    } else {
      var waiting = el("p", "tiny");
      waiting.textContent = D.players[state.winner].name + " names it on the phone that landed the last move. It will show up in this link.";
      box.appendChild(waiting);
    }
    var fine = el("p", "tiny");
    fine.textContent = "Payable in affection, at a time that suits you both.";
    box.appendChild(fine);
    return box;
  }

  function renderStart() {
    document.body.className = "is-start";
    document.title = D.title;
    app.innerHTML = "";
    var card = el("section", "card start-card");
    var kicker = el("p", "eyebrow");
    kicker.textContent = "Sara  \u00b7  Karlos";
    var title = el("h1", "display");
    var top = el("span", "line");
    top.textContent = "The Giggle";
    var bottom = el("span", "line");
    bottom.textContent = "Duel";
    title.appendChild(top);
    title.appendChild(bottom);
    var line = el("p", "tagline");
    line.textContent = D.tagline;
    card.appendChild(kicker);
    card.appendChild(title);
    card.appendChild(line);
    var steps = el("div", "steps");
    ["1 \u00b7 Pick a move", "2 \u00b7 Send the link", "3 \u00b7 They take theirs"].forEach(function (text) {
      var step = el("span", "step");
      step.textContent = text;
      steps.appendChild(step);
    });
    card.appendChild(steps);
    var go = el("button", "primary");
    go.type = "button";
    go.textContent = "Start \u2014 Karlos goes first";
    go.addEventListener("click", function () { begin("karlos", false); });
    var flip = el("button", "ghost");
    flip.type = "button";
    flip.textContent = "Flip a coin";
    flip.addEventListener("click", function () {
      begin(randomSeed() % 2 ? "sara" : "karlos", true);
    });
    card.appendChild(go);
    card.appendChild(flip);
    var note = el("p", "note");
    note.textContent = "Resistance is the giggle meter. Energy pays for moves, and a full bar unlocks a signature. " + D.startNote;
    card.appendChild(note);
    app.appendChild(card);
    scrollTop();
  }

  function renderError() {
    document.body.className = "is-start";
    document.title = D.title;
    app.innerHTML = "";
    var card = el("section", "card start-card");
    var title = el("h1", "display");
    var top = el("span", "line");
    top.textContent = "Lost in the";
    var bottom = el("span", "line");
    bottom.textContent = "pillows";
    title.appendChild(top);
    title.appendChild(bottom);
    var line = el("p", "tagline");
    line.textContent = "This link doesn't match a duel. Start a new one and send a fresh link.";
    var go = el("button", "primary");
    go.type = "button";
    go.textContent = "Start a new duel";
    go.addEventListener("click", restart);
    card.appendChild(title);
    card.appendChild(line);
    card.appendChild(go);
    app.appendChild(card);
    scrollTop();
  }

  function renderWin(state) {
    var winner = D.players[state.winner];
    var loser = D.players[other(state.winner)];
    var mine = viewer(state) === state.winner;
    document.body.className = "is-over turn-" + state.winner;
    document.title = winner.name + " wins \u00b7 " + D.title;
    app.innerHTML = "";
    var card = el("article", "card");
    var word = el("p", "wordmark");
    word.textContent = D.title;
    card.appendChild(word);
    var seal = el("div", "seal");
    seal.setAttribute("aria-hidden", "true");
    seal.textContent = winner.mark;
    card.appendChild(seal);
    var heading = el("h1", "winner-name");
    heading.textContent = winner.name + " wins";
    var sub = el("p", "subhead");
    sub.textContent = loser.name + " cracked first. The giggle meter hit zero.";
    card.appendChild(heading);
    card.appendChild(sub);
    card.appendChild(resultBlock(state, shownKey !== gameKey(state)));
    if (mine) {
      card.appendChild(forfeitEditor(state));
      card.appendChild(handoff(loser.name, true, !!(state.forfeit && state.forfeit.text)));
    } else {
      card.appendChild(forfeitReadout(state));
    }
    card.appendChild(fighters(state));
    var again = el("button", "primary");
    again.type = "button";
    again.textContent = "Rematch";
    again.addEventListener("click", restart);
    card.appendChild(again);
    var logged = logList(state);
    if (logged) card.appendChild(logged);
    card.appendChild(footer("Start over"));
    app.appendChild(card);
    scrollTop();
  }

  function renderPlay(state) {
    var locked = showHandoff(state);
    var who = D.players[state.turn];
    document.body.className = "turn-" + state.turn + (locked ? " is-locked" : " is-playing");
    document.title = who.name + "'s turn \u00b7 " + D.title;
    app.innerHTML = "";
    var card = el("article", "card");
    var word = el("p", "wordmark");
    word.textContent = D.title;
    card.appendChild(word);
    card.appendChild(banner(state, locked));
    card.appendChild(resultBlock(state, shownKey !== gameKey(state)));
    if (locked) card.appendChild(handoff(who.name, false));
    card.appendChild(fighters(state));
    if (!locked) {
      card.appendChild(moveList(state));
      if (!state.moves.length) {
        var tip = el("p", "tiny");
        tip.textContent = "Energy refills a little when a turn begins. Fill the bar to unlock a signature move.";
        card.appendChild(tip);
      }
    }
    var logged = logList(state);
    if (logged) card.appendChild(logged);
    card.appendChild(footer("Start over"));
    app.appendChild(card);
    scrollTop();
  }

  function choose(moveId) {
    if (busy) return;
    var resolved = D.unpack(location.hash);
    if (!resolved || resolved.screen !== "play" || resolved.state.over) return;
    var state = resolved.state;
    if (showHandoff(state) || !D.isLegal(state, moveId)) return;
    busy = true;
    var actor = state.turn;
    var next = D.apply(state, moveId);
    commit(next, actor, false);
    busy = false;
  }

  function chooseForfeit(id, custom) {
    if (busy) return;
    var resolved = D.unpack(location.hash);
    if (!resolved || resolved.screen !== "play" || !resolved.state.over) return;
    if (viewer(resolved.state) !== resolved.state.winner) return;
    var next = D.setForfeit(resolved.state, id, custom);
    if (JSON.stringify(next.forfeit) === JSON.stringify(resolved.state.forfeit)) return;
    busy = true;
    commit(next, resolved.state.winner, true);
    busy = false;
  }

  function render() {
    if (!D) return;
    var resolved = D.unpack(location.hash);
    var key = resolved.state ? gameKey(resolved.state) : "";
    if (resolved.screen === "start") renderStart();
    else if (resolved.screen === "error" || !resolved.state) renderError();
    else if (resolved.state.over) renderWin(resolved.state);
    else renderPlay(resolved.state);
    shownKey = key;
  }

  window.addEventListener("popstate", render);
  window.addEventListener("hashchange", render);
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  hearts();
  render();
})();
