(function () {
  "use strict";

  var DUEL = window.DUEL;
  var app = document.getElementById("app");
  var players = DUEL.players;
  var busy = false;

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function otherName(id) {
    return players[DUEL.otherId(id)].name;
  }

  function storageGet(key) {
    try { return sessionStorage.getItem(key); } catch (err) { return null; }
  }

  function storageSet(key, value) {
    try { sessionStorage.setItem(key, value); } catch (err) {}
  }

  function storageClear() {
    try {
      sessionStorage.removeItem("duel-canon");
      sessionStorage.removeItem("duel-as");
    } catch (err) {}
  }

  function resolve() {
    var raw = (location.hash || "").replace(/^#/, "");
    if (!raw || raw === "start") return { screen: "start" };
    var state = DUEL.decode(raw);
    if (!state) return { screen: "error" };
    return { screen: "game", state: state };
  }

  function lockInfo(state) {
    if (!state) return null;
    var canon = DUEL.encode(state);
    var st = history.state || {};
    var as = null;
    if (st.locked && st.canon === canon) as = st.as;
    else if (storageGet("duel-canon") === canon) as = storageGet("duel-as");
    if (as !== "karlos" && as !== "sara") return null;
    return as;
  }

  function scrollTop() {
    window.scrollTo(0, 0);
  }

  function go(state, lockedAs) {
    var canon = DUEL.encode(state);
    var hash = "#" + canon;
    if (lockedAs) {
      history.pushState({ locked: true, as: lockedAs, canon: canon }, "", hash);
      storageSet("duel-canon", canon);
      storageSet("duel-as", lockedAs);
    } else {
      history.pushState({ locked: false }, "", hash);
      storageClear();
    }
    render();
  }

  function goStart() {
    storageClear();
    history.pushState({ locked: false, view: "start" }, "", "#start");
    render();
  }

  function copyLink(button) {
    var url = location.href;
    var previous = button.textContent;
    var done = function () {
      button.textContent = "Copied";
      button.classList.add("is-done");
      window.setTimeout(function () {
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

  function shareLink(toName, done) {
    if (!navigator.share) return;
    navigator.share({
      title: "The Giggle Duel",
      text: done ? toName + ", the giggle duel is over." : toName + ", it's your turn in the Giggle Duel.",
      url: location.href
    }).catch(function () {});
  }

  function linkField() {
    var field = el("input", "linkbox");
    field.type = "text";
    field.readOnly = true;
    field.value = location.href;
    field.setAttribute("aria-label", "Link to this moment in the duel");
    field.addEventListener("focus", function () { field.select(); });
    return field;
  }

  function sendPanel(sendTo, done) {
    var sent = el("div", "handoff");
    sent.setAttribute("role", "status");
    sent.appendChild(el("p", "shout", "Send the link to " + sendTo));
    sent.appendChild(el("p", "ask", done
      ? sendTo + " opens this link and sees the forfeit."
      : "The duel waits there. " + sendTo + " opens it and plays next."));
    var copy = el("button", "primary", "Copy link");
    copy.type = "button";
    copy.setAttribute("aria-label", "Copy link to send to " + sendTo);
    copy.addEventListener("click", function () { copyLink(copy); });
    sent.appendChild(copy);
    if (navigator.share) {
      var share = el("button", "ghost", "Share with " + sendTo);
      share.type = "button";
      share.addEventListener("click", function () { shareLink(sendTo, done); });
      sent.appendChild(share);
    }
    sent.appendChild(linkField());
    return sent;
  }

  function wordmark() {
    return el("p", "wordmark", "The Giggle Duel");
  }

  function meters(state) {
    var wrap = el("div", "meters");
    wrap.appendChild(fighter(state, "sara"));
    wrap.appendChild(el("p", "versus", "vs"));
    wrap.appendChild(fighter(state, "karlos"));
    return wrap;
  }

  function fighter(state, id) {
    var person = players[id];
    var hp = state.hp[id];
    var energy = state.energy[id];
    var classes = "fighter is-" + id;
    if (!state.winner && state.turn === id) classes += " is-turn";
    if (state.winner === id) classes += " is-winner";
    if (hp === 0) classes += " is-out";
    else if (hp <= 25) classes += " is-low";
    var box = el("section", classes);
    var head = el("div", "fighter-head");
    var mark = el("span", "mark", person.mark);
    mark.setAttribute("aria-hidden", "true");
    head.appendChild(mark);
    head.appendChild(el("h2", "who-name", person.name));
    box.appendChild(head);
    box.appendChild(el("p", "epithet", person.epithet));
    box.appendChild(el("p", "meter-kicker", "Resistance"));

    var bar = el("div", "bar");
    bar.setAttribute("role", "meter");
    bar.setAttribute("aria-label", person.name + " resistance");
    bar.setAttribute("aria-valuemin", "0");
    bar.setAttribute("aria-valuemax", String(DUEL.MAX_HP));
    bar.setAttribute("aria-valuenow", String(hp));
    var fill = el("div", "bar-fill");
    fill.style.width = hp + "%";
    bar.appendChild(fill);
    box.appendChild(bar);

    box.appendChild(el("p", "bar-label", hp === 0 ? "Cracked up" : String(hp)));

    var energyLabel = energy === DUEL.MAX_ENERGY ? "Energy full" : "Energy " + energy + " / " + DUEL.MAX_ENERGY;
    var pips = el("div", "pips");
    pips.setAttribute("role", "meter");
    pips.setAttribute("aria-label", person.name + " energy");
    pips.setAttribute("aria-valuemin", "0");
    pips.setAttribute("aria-valuemax", String(DUEL.MAX_ENERGY));
    pips.setAttribute("aria-valuenow", String(energy));
    pips.setAttribute("aria-valuetext", energyLabel);
    for (var i = 0; i < DUEL.MAX_ENERGY; i++) {
      pips.appendChild(el("span", "pip" + (i < energy ? " is-on" : "")));
    }
    box.appendChild(pips);
    box.appendChild(el("p", "bar-label", energyLabel));

    var badges = el("p", "badges");
    var bits = [];
    if (hp > 0 && hp <= 25) bits.push("Wobbling");
    if (state.fort[id]) bits.push("Pillow fort");
    if (state.guard[id]) bits.push("Guard down");
    if (state.skip[id]) bits.push("Saying aww");
    badges.textContent = bits.join(" · ");
    box.appendChild(badges);
    return box;
  }

  function resultCard(state) {
    if (!state.log.length) return null;
    var entry = state.log[state.log.length - 1];
    var lethal = !!state.winner && state.hp[DUEL.otherId(state.winner)] === 0;
    var told = DUEL.describe(entry, lethal);
    var card = el("div", "result" + (entry.outcome === "crit" ? " is-crit" : ""));
    card.setAttribute("role", "status");
    var burst = el("div", "burst");
    burst.setAttribute("aria-hidden", "true");
    for (var i = 0; i < 6; i++) {
      var flake = el("span", null, told.emoji);
      flake.style.left = (8 + i * 15) + "%";
      flake.style.animationDelay = (i * 0.07) + "s";
      burst.appendChild(flake);
    }
    card.appendChild(burst);
    var emoji = el("span", "big-emoji", told.emoji);
    emoji.setAttribute("aria-hidden", "true");
    card.appendChild(emoji);
    card.appendChild(el("p", "kicker", told.kicker));
    card.appendChild(el("p", "delta", told.delta));
    card.appendChild(el("p", "flavour", told.text));
    return card;
  }

  function battleLog(state) {
    if (!state.log.length) return null;
    var details = el("details", "log");
    details.appendChild(el("summary", null, "Battle log · " + state.log.length));
    var list = el("ol");
    state.log.forEach(function (entry, index) {
      var lethal = !!state.winner && index === state.log.length - 1;
      var told = DUEL.describe(entry, lethal);
      var item = el("li");
      item.appendChild(el("span", "who", players[entry.actor].name));
      item.appendChild(document.createTextNode(told.text));
      list.appendChild(item);
    });
    details.appendChild(list);
    return details;
  }

  function startOver(label) {
    var foot = el("footer");
    var again = el("button", "texty", label || "Start over");
    again.type = "button";
    again.addEventListener("click", function () {
      if (busy) return;
      goStart();
    });
    foot.appendChild(again);
    foot.appendChild(el("p", "sign", "keep a straight face"));
    return foot;
  }

  function costLine(state, move) {
    if (move.kind === "finisher") {
      var have = state.energy[state.turn];
      if (have === DUEL.MAX_ENERGY) return "Full bar · ready";
      return "Needs a full bar · " + have + " / " + DUEL.MAX_ENERGY;
    }
    if (move.cost === 0) return "Free";
    if (state.energy[state.turn] < move.cost) return move.cost + " energy · not enough yet";
    return move.cost === 1 ? "1 energy" : move.cost + " energy";
  }

  function orderedMoves(state) {
    var ready = [];
    var rest = [];
    DUEL.movesFor(state.turn).forEach(function (move) {
      if (move.kind === "finisher" && DUEL.canUse(state, move.id)) ready.push(move);
      else rest.push(move);
    });
    return ready.concat(rest);
  }

  function moveList(state) {
    var wrap = el("div", "moves");
    var ready = state.energy[state.turn] === DUEL.MAX_ENERGY;
    if (ready) wrap.appendChild(el("p", "ready-note", "Finisher unlocked."));
    orderedMoves(state).forEach(function (move) {
      var ok = DUEL.canUse(state, move.id);
      var button = el("button", "move" + (move.kind === "finisher" ? " is-finisher" : "") + (ok && move.kind === "finisher" ? " is-ready" : ""));
      button.type = "button";
      button.disabled = !ok;
      var icon = el("span", "move-emoji", move.emoji);
      icon.setAttribute("aria-hidden", "true");
      var body = el("span", "move-body");
      body.appendChild(el("span", "move-name", move.name));
      body.appendChild(el("span", "move-cost", costLine(state, move)));
      body.appendChild(el("span", "move-blurb", move.blurb));
      button.appendChild(icon);
      button.appendChild(body);
      button.addEventListener("click", function () { choose(move.id); });
      wrap.appendChild(button);
    });
    return wrap;
  }

  function turnBanner(state, locked) {
    var who = players[state.turn];
    var banner = el("div", "banner");
    banner.setAttribute("role", "status");
    var mark = el("span", "mark", who.mark);
    mark.setAttribute("aria-hidden", "true");
    banner.appendChild(mark);
    banner.appendChild(el("p", "turn", who.name + "'s turn"));
    banner.appendChild(el("p", "epithet", who.epithet));
    if (!locked) {
      var line = !state.log.length && state.turn === "karlos" ? "You go first." : "Your move.";
      banner.appendChild(el("p", "yours", line));
    }
    return banner;
  }

  function renderStart() {
    document.body.className = "is-start";
    document.title = "The Giggle Duel";
    app.innerHTML = "";
    var card = el("section", "card start-card");
    card.appendChild(el("p", "eyebrow", "Sara  ·  Karlos"));
    card.appendChild(el("h1", "display", "The Giggle Duel"));
    card.appendChild(el("p", "tagline", "A silly fight between two countries."));
    card.appendChild(el("p", "lede", "Tickles, pillows, terrible jokes, and the occasional biscuit. The last one still keeping a straight face wins."));
    var rules = el("ol", "rules");
    [
      "Karlos goes first. Pick a move, then send the link.",
      "Resistance drops when you crack up. Energy fills when a joke lands.",
      "A full energy bar unlocks your finisher."
    ].forEach(function (line) {
      rules.appendChild(el("li", null, line));
    });
    card.appendChild(rules);
    var startBtn = el("button", "primary", "Start the duel");
    startBtn.type = "button";
    startBtn.addEventListener("click", function () {
      if (busy) return;
      var state = DUEL.newGame();
      go(state, null);
    });
    card.appendChild(startBtn);
    card.appendChild(el("p", "note", "Nothing is stored on a server. The link is the whole duel."));
    card.appendChild(el("p", "sign", "keep a straight face"));
    app.appendChild(card);
    scrollTop();
  }

  function renderError() {
    document.body.className = "is-start";
    document.title = "The Giggle Duel";
    app.innerHTML = "";
    var card = el("section", "card start-card");
    card.appendChild(el("h1", "display small-display", "Link went fuzzy"));
    card.appendChild(el("p", "tagline", "This link doesn't hold a duel. Start a fresh one and send that instead."));
    var restart = el("button", "primary", "Start a new duel");
    restart.type = "button";
    restart.addEventListener("click", goStart);
    card.appendChild(restart);
    app.appendChild(card);
    scrollTop();
  }

  function winHeading(state) {
    var winner = players[state.winner];
    var loser = players[DUEL.otherId(state.winner)];
    var block = el("div", "win-head");
    var seal = el("div", "seal", winner.mark);
    seal.setAttribute("aria-hidden", "true");
    block.appendChild(seal);
    block.appendChild(el("p", "kicker", "Straight face broken"));
    block.appendChild(el("h1", null, winner.name + " wins"));
    block.appendChild(el("p", "lede", loser.name + " cracked up first."));
    return block;
  }

  function forfeitPicker(state) {
    var loser = players[DUEL.otherId(state.winner)];
    var box = el("div", "forfeits");
    box.appendChild(el("p", "kicker", "The forfeit"));
    box.appendChild(el("h2", "forfeit-title", "Pick " + loser.name + "'s forfeit"));
    box.appendChild(el("p", "hint", "Silly only. The sort of thing that starts the laughing again."));
    DUEL.FORFEITS.forEach(function (item) {
      var button = el("button", "choice", item.label);
      button.type = "button";
      button.addEventListener("click", function () { chooseForfeit(item.id); });
      box.appendChild(button);
    });
    var field = el("input", "forfeit-input");
    field.type = "text";
    field.maxLength = 80;
    field.placeholder = "Or write a silly forfeit";
    field.setAttribute("aria-label", "Write a silly forfeit");
    var count = el("p", "count", "0 / 80");
    var note = el("p", "hint warn");
    var use = el("button", "primary", "Use this forfeit");
    use.type = "button";
    use.disabled = true;
    var refresh = function () {
      var cleaned = field.value.replace(/\s+/g, " ").trim();
      count.textContent = cleaned.length + " / 80";
      use.disabled = cleaned.length < 3;
      note.textContent = "";
    };
    field.addEventListener("input", refresh);
    var submit = function () {
      var cleaned = field.value.replace(/\s+/g, " ").trim();
      if (cleaned.length < 3) {
        note.textContent = "Give it at least 3 characters.";
        return;
      }
      chooseForfeit({ custom: field.value });
    };
    use.addEventListener("click", submit);
    field.addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        event.preventDefault();
        submit();
      }
    });
    box.appendChild(field);
    box.appendChild(count);
    box.appendChild(note);
    box.appendChild(use);
    return box;
  }

  function forfeitCard(state) {
    var loser = players[DUEL.otherId(state.winner)];
    var box = el("div", "forfeit-done");
    box.appendChild(el("p", "kicker", loser.name + " has to"));
    box.appendChild(el("p", "forfeit-line", DUEL.forfeitText(state)));
    return box;
  }

  function rematchButton() {
    var again = el("button", "primary rematch", "Rematch");
    again.type = "button";
    again.addEventListener("click", function () {
      if (busy) return;
      goStart();
    });
    return again;
  }

  function renderGame(state) {
    var lockedAs = lockInfo(state);
    var locked = !!lockedAs;
    app.innerHTML = "";
    var card = el("article", "card");
    card.appendChild(wordmark());

    if (state.winner && state.forfeit) {
      document.body.className = "is-win" + (locked ? " is-locked" : "");
      document.title = players[state.winner].name + " wins · The Giggle Duel";
      if (locked) card.appendChild(sendPanel(otherName(lockedAs), true));
      card.appendChild(winHeading(state));
      card.appendChild(forfeitCard(state));
      var shown = resultCard(state);
      if (shown) card.appendChild(shown);
      card.appendChild(rematchButton());
      card.appendChild(meters(state));
      var doneLog = battleLog(state);
      if (doneLog) card.appendChild(doneLog);
      card.appendChild(startOver("Start over"));
      app.appendChild(card);
      scrollTop();
      return;
    }

    if (state.winner) {
      document.body.className = "is-win" + (locked ? " is-locked" : "");
      document.title = players[state.winner].name + " wins · The Giggle Duel";
      card.appendChild(winHeading(state));
      var blow = resultCard(state);
      if (blow) card.appendChild(blow);
      if (locked && lockedAs === state.winner) {
        card.appendChild(forfeitPicker(state));
      } else {
        var wait = el("div", "handoff");
        wait.setAttribute("role", "status");
        wait.appendChild(el("p", "shout", players[state.winner].name + " is choosing a forfeit"));
        wait.appendChild(el("p", "ask", "Wait for the next link. It will say what " + otherName(state.winner) + " has to do."));
        card.appendChild(wait);
        card.appendChild(rematchButton());
      }
      card.appendChild(meters(state));
      card.appendChild(startOver("Start over"));
      app.appendChild(card);
      scrollTop();
      return;
    }

    if (locked) {
      var sendTo = otherName(lockedAs);
      document.body.className = "turn-" + state.turn + " is-locked";
      document.title = "Send the link to " + sendTo + " · The Giggle Duel";
      card.appendChild(sendPanel(sendTo));
      var happened = resultCard(state);
      if (happened) card.appendChild(happened);
      card.appendChild(meters(state));
      var lockedLog = battleLog(state);
      if (lockedLog) card.appendChild(lockedLog);
      card.appendChild(startOver("Start over"));
      app.appendChild(card);
      scrollTop();
      return;
    }

    document.body.className = "turn-" + state.turn + " is-playing";
    document.title = players[state.turn].name + "'s turn · The Giggle Duel";
    card.appendChild(turnBanner(state, false));
    var last = resultCard(state);
    if (last) card.appendChild(last);
    card.appendChild(meters(state));

    if (state.skip[state.turn]) {
      var passBox = el("div", "handoff");
      passBox.appendChild(el("p", "shout", "Still saying aww"));
      passBox.appendChild(el("p", "ask", players[state.turn].name + " doesn't get a move this time."));
      var pass = el("button", "primary", "Pass the turn");
      pass.type = "button";
      pass.addEventListener("click", function () { choosePass(); });
      passBox.appendChild(pass);
      card.appendChild(passBox);
    } else {
      card.appendChild(el("p", "hint energy-hint", "Landing a tickle, tease, pillow, or compliment fills energy. The finisher spends a full bar."));
      card.appendChild(moveList(state));
    }

    var log = battleLog(state);
    if (log) card.appendChild(log);
    card.appendChild(startOver("Start over"));
    app.appendChild(card);
    scrollTop();
  }

  function choose(moveId) {
    if (busy) return;
    var resolved = resolve();
    if (resolved.screen !== "game" || lockInfo(resolved.state) || resolved.state.winner) return;
    if (!DUEL.canUse(resolved.state, moveId)) return;
    busy = true;
    var actor = resolved.state.turn;
    var next = DUEL.applyMove(resolved.state, moveId);
    if (!next) {
      busy = false;
      return;
    }
    go(next, actor);
    busy = false;
  }

  function choosePass() {
    if (busy) return;
    var resolved = resolve();
    if (resolved.screen !== "game" || lockInfo(resolved.state) || resolved.state.winner) return;
    busy = true;
    var actor = resolved.state.turn;
    var next = DUEL.passTurn(resolved.state);
    if (!next) {
      busy = false;
      return;
    }
    go(next, actor);
    busy = false;
  }

  function chooseForfeit(choice) {
    if (busy) return;
    var resolved = resolve();
    if (resolved.screen !== "game" || !resolved.state.winner || resolved.state.forfeit) return;
    if (lockInfo(resolved.state) !== resolved.state.winner) return;
    busy = true;
    var next = DUEL.setForfeit(resolved.state, choice);
    if (!next) {
      busy = false;
      var warn = document.querySelector(".warn");
      if (warn) warn.textContent = "Keep the forfeit between 3 and 80 characters.";
      return;
    }
    go(next, resolved.state.winner);
    busy = false;
  }

  function render() {
    var resolved = resolve();
    if (resolved.screen === "start") renderStart();
    else if (resolved.screen === "error") renderError();
    else renderGame(resolved.state);
  }

  window.addEventListener("popstate", render);
  window.addEventListener("hashchange", render);
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  render();
})();
