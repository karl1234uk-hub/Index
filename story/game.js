(function () {
  "use strict";

  var STORY = window.STORY;
  var app = document.getElementById("app");
  var players = STORY.players;

  function otherId(id) {
    return id === "karlos" ? "sara" : "karlos";
  }

  function possessive(name) {
    return name + "'s";
  }

  function el(tag, className) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    return node;
  }

  function appendRich(parent, text) {
    var re = /\*([^*]+)\*/g;
    var last = 0;
    var match;
    while ((match = re.exec(text))) {
      if (match.index > last) {
        parent.appendChild(document.createTextNode(text.slice(last, match.index)));
      }
      var em = document.createElement("em");
      em.textContent = match[1];
      parent.appendChild(em);
      last = match.index + match[0].length;
    }
    if (last < text.length) parent.appendChild(document.createTextNode(text.slice(last)));
  }

  function parsePath(raw) {
    if (!raw) return [];
    var parts = raw.split(",");
    var path = [];
    for (var i = 0; i < parts.length; i++) {
      if (!/^[0-2]$/.test(parts[i])) return null;
      path.push(Number(parts[i]));
    }
    return path;
  }

  function walk(path) {
    var id = STORY.start;
    var recaps = [];
    for (var i = 0; i < path.length; i++) {
      var scene = STORY.scenes[id];
      if (!scene || scene.ending || !scene.choices || !scene.choices[path[i]]) return null;
      var choice = scene.choices[path[i]];
      recaps.push({ who: scene.turn, text: choice.recap });
      id = choice.to;
    }
    if (!STORY.scenes[id]) return null;
    return { id: id, scene: STORY.scenes[id], recaps: recaps };
  }

  function hashFor(id, path) {
    var scene = STORY.scenes[id];
    var query = "s=" + encodeURIComponent(id);
    if (path.length) query += "&p=" + path.join(",");
    query += "&t=" + (scene.ending ? "end" : scene.turn);
    return "#" + query;
  }

  function resolve() {
    var raw = (location.hash || "").replace(/^#/, "");
    if (!raw || raw === "start") return { screen: "start" };
    var params;
    try {
      params = new URLSearchParams(raw);
    } catch (err) {
      return { screen: "error" };
    }
    var path = parsePath(params.get("p"));
    if (!path) return { screen: "error" };
    var walked = walk(path);
    if (!walked || walked.id !== params.get("s")) return { screen: "error" };
    var turn = params.get("t");
    if (walked.scene.ending) {
      if (turn && turn !== "end") return { screen: "error" };
    } else if (turn !== walked.scene.turn) {
      return { screen: "error" };
    }
    return {
      screen: "play",
      id: walked.id,
      scene: walked.scene,
      recaps: walked.recaps,
      path: path
    };
  }

  function storageGet(key) {
    try { return sessionStorage.getItem(key); } catch (err) { return null; }
  }

  function storageSet(key, value) {
    try { sessionStorage.setItem(key, value); } catch (err) {}
  }

  function storageClear() {
    try {
      sessionStorage.removeItem("oln-lock");
      sessionStorage.removeItem("oln-as");
    } catch (err) {}
  }

  function actorId() {
    var state = history.state || {};
    if (state.as) return state.as;
    if (storageGet("oln-lock") === location.hash) return storageGet("oln-as");
    return null;
  }

  function isLocked(resolved) {
    if (!resolved || resolved.screen !== "play" || resolved.scene.ending) return false;
    var as = actorId();
    if (!as || as === resolved.scene.turn) return false;
    var state = history.state || {};
    return !!(state.locked || storageGet("oln-lock") === location.hash);
  }

  function scrollTop() {
    window.scrollTo(0, 0);
  }

  function setTitle(text) {
    document.title = text;
  }

  function rain() {
    var sky = document.getElementById("rain");
    if (!sky || sky.childNodes.length) return;
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    var i;
    for (i = 0; i < 18; i++) {
      var drop = document.createElement("span");
      drop.className = "drop";
      drop.style.left = Math.random() * 100 + "%";
      drop.style.animationDuration = 7 + Math.random() * 8 + "s";
      drop.style.animationDelay = -Math.random() * 12 + "s";
      drop.style.height = 10 + Math.random() * 16 + "px";
      drop.style.opacity = String(0.15 + Math.random() * 0.35);
      sky.appendChild(drop);
    }
  }

  function recapList(recaps) {
    if (!recaps || !recaps.length) return null;
    var details = el("details", "sofar");
    var summary = el("summary");
    summary.textContent = "Story so far \u00b7 " + recaps.length + (recaps.length === 1 ? " move" : " moves");
    details.appendChild(summary);
    var list = el("ol");
    recaps.forEach(function (item) {
      var li = el("li");
      var who = el("span", "who");
      who.textContent = players[item.who].name;
      li.appendChild(who);
      li.appendChild(document.createTextNode(item.text));
      list.appendChild(li);
    });
    details.appendChild(list);
    return details;
  }

  function footer(restartLabel) {
    var foot = el("footer");
    var again = el("button", "texty");
    again.type = "button";
    again.textContent = restartLabel || "Start over";
    again.addEventListener("click", function () {
      storageClear();
      history.pushState({ view: "start" }, "", "#start");
      render();
    });
    foot.appendChild(again);
    var sign = el("p", "sign");
    sign.textContent = "pass the night between you";
    foot.appendChild(sign);
    return foot;
  }

  function copyLink(button) {
    var url = location.href;
    var done = function () {
      var old = button.textContent;
      button.textContent = "Copied";
      button.classList.add("is-done");
      setTimeout(function () {
        button.textContent = old;
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

  function shareLink(toName) {
    if (!navigator.share) return;
    navigator.share({
      title: STORY.title,
      text: toName + ", it's your turn.",
      url: location.href
    }).catch(function () {});
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

  function renderStart() {
    document.body.className = "is-start";
    setTitle(STORY.title);
    app.innerHTML = "";
    var card = el("section", "card start-card");
    var kicker = el("p", "eyebrow");
    kicker.textContent = "Karlos  \u00b7  Sara";
    card.appendChild(kicker);
    var h1 = el("h1", "display");
    h1.textContent = STORY.title;
    card.appendChild(h1);
    var line = el("p", "tagline");
    line.textContent = STORY.tagline;
    card.appendChild(line);
    var go = el("button", "primary");
    go.type = "button";
    go.textContent = "Start a new story";
    go.addEventListener("click", function () {
      storageClear();
      history.pushState({ view: "play", locked: false }, "", hashFor(STORY.start, []));
      render();
    });
    card.appendChild(go);
    var note = el("p", "note");
    note.textContent = STORY.startNote;
    card.appendChild(note);
    app.appendChild(card);
    scrollTop();
  }

  function renderError() {
    document.body.className = "is-start";
    setTitle(STORY.title);
    app.innerHTML = "";
    var card = el("section", "card start-card");
    var h1 = el("h1", "display small-display");
    h1.textContent = "Lost in the rain";
    card.appendChild(h1);
    var line = el("p", "tagline");
    line.textContent = "This link doesn't lead anywhere in the night. Start again and send a fresh one.";
    card.appendChild(line);
    var go = el("button", "primary");
    go.type = "button";
    go.textContent = "Start a new story";
    go.addEventListener("click", function () {
      storageClear();
      history.pushState({ view: "start" }, "", "#start");
      render();
    });
    card.appendChild(go);
    app.appendChild(card);
    scrollTop();
  }

  function renderEnding(resolved) {
    var scene = resolved.scene;
    var sender = actorId();
    if (sender && !players[sender]) sender = null;
    document.body.className = "is-ending";
    setTitle(scene.title + " \u00b7 " + STORY.title);
    app.innerHTML = "";

    var wrap = el("article", "card");
    if (sender) {
      var sent = el("div", "handoff");
      var shout = el("p", "shout");
      shout.textContent = "Your move is made.";
      sent.appendChild(shout);
      var ask = el("p", "ask");
      ask.textContent = "Send the ending to " + players[otherId(sender)].name + ".";
      sent.appendChild(ask);
      wrap.appendChild(sent);
    }

    var seal = el("div", "seal");
    seal.setAttribute("aria-hidden", "true");
    seal.textContent = "\u2766";
    wrap.appendChild(seal);
    var tone = el("p", "tone");
    tone.textContent = STORY.tones[scene.ending] || scene.ending;
    wrap.appendChild(tone);
    var kicker = el("p", "kicker");
    kicker.textContent = scene.kicker;
    wrap.appendChild(kicker);
    var h1 = el("h1");
    h1.textContent = scene.title;
    wrap.appendChild(h1);
    scene.body.forEach(function (para) {
      var p = el("p");
      appendRich(p, para);
      wrap.appendChild(p);
    });

    var sofar = recapList(resolved.recaps);
    if (sofar) wrap.appendChild(sofar);

    var actions = el("div", "actions");
    var copy = el("button", "primary");
    copy.type = "button";
    copy.textContent = "Copy link";
    copy.addEventListener("click", function () { copyLink(copy); });
    actions.appendChild(copy);
    if (navigator.share && sender) {
      var share = el("button", "ghost");
      share.type = "button";
      var toName = players[otherId(sender)].name;
      share.textContent = "Send to " + toName;
      share.addEventListener("click", function () { shareLink(toName); });
      actions.appendChild(share);
    }
    actions.appendChild(linkField());
    wrap.appendChild(actions);

    var again = el("button", "primary restart");
    again.type = "button";
    again.textContent = "Start another night";
    again.addEventListener("click", function () {
      storageClear();
      history.pushState({ view: "start" }, "", "#start");
      render();
    });
    wrap.appendChild(again);
    var sign = el("p", "sign");
    sign.textContent = "pass the night between you";
    wrap.appendChild(sign);
    app.appendChild(wrap);
    scrollTop();
  }

  function renderPlay(resolved) {
    var scene = resolved.scene;
    var locked = isLocked(resolved);
    var who = players[scene.turn];
    var bodyClass = "turn-" + scene.turn + (locked ? " is-locked" : " is-playing");
    document.body.className = bodyClass;
    setTitle(possessive(who.name) + " turn \u00b7 " + STORY.title);
    app.innerHTML = "";

    var wrap = el("article", "card");
    var top = el("p", "wordmark");
    top.textContent = STORY.title;
    wrap.appendChild(top);

    if (locked) {
      var sent = el("div", "handoff");
      var shout = el("p", "shout");
      shout.textContent = "Your move is made.";
      sent.appendChild(shout);
      var ask = el("p", "ask");
      ask.textContent = "Send the link to " + who.name + ".";
      sent.appendChild(ask);
      var copy = el("button", "primary");
      copy.type = "button";
      copy.textContent = "Copy link";
      copy.addEventListener("click", function () { copyLink(copy); });
      sent.appendChild(copy);
      if (navigator.share) {
        var share = el("button", "ghost");
        share.type = "button";
        share.textContent = "Send to " + who.name;
        share.addEventListener("click", function () { shareLink(who.name); });
        sent.appendChild(share);
      }
      sent.appendChild(linkField());
      var hint = el("p", "hint");
      hint.textContent = who.name + " will open on this scene. The choice is " + (scene.turn === "sara" ? "hers" : "his") + ".";
      sent.appendChild(hint);
      wrap.appendChild(sent);
    }

    var banner = el("div", "banner");
    banner.setAttribute("role", "status");
    var mark = el("span", "mark");
    mark.setAttribute("aria-hidden", "true");
    mark.textContent = who.mark;
    banner.appendChild(mark);
    var turn = el("p", "turn");
    turn.textContent = possessive(who.name) + " turn";
    banner.appendChild(turn);
    var epithet = el("p", "epithet");
    epithet.textContent = who.epithet;
    banner.appendChild(epithet);
    if (!locked) {
      var yours = el("p", "yours");
      yours.textContent = "Your move.";
      banner.appendChild(yours);
    }
    wrap.appendChild(banner);

    var kicker = el("p", "kicker");
    kicker.textContent = scene.kicker;
    wrap.appendChild(kicker);
    var h1 = el("h1");
    h1.textContent = scene.title;
    wrap.appendChild(h1);
    scene.body.forEach(function (para) {
      var p = el("p");
      appendRich(p, para);
      wrap.appendChild(p);
    });

    var sofar = recapList(resolved.recaps);
    if (sofar) wrap.appendChild(sofar);

    if (!locked) {
      var choices = el("div", "choices");
      scene.choices.forEach(function (choice, index) {
        var button = el("button", "choice");
        button.type = "button";
        var num = el("span", "num");
        num.textContent = index < 9 ? "0" + (index + 1) : String(index + 1);
        var label = el("span", "label");
        label.textContent = choice.label;
        button.appendChild(num);
        button.appendChild(label);
        button.addEventListener("click", function () { choose(index); });
        choices.appendChild(button);
      });
      wrap.appendChild(choices);
    }

    wrap.appendChild(footer("Start over"));
    app.appendChild(wrap);
    scrollTop();
  }

  var choosing = false;
  function choose(index) {
    if (choosing) return;
    var resolved = resolve();
    if (resolved.screen !== "play" || resolved.scene.ending || isLocked(resolved)) return;
    var choice = resolved.scene.choices[index];
    if (!choice) return;
    choosing = true;
    var path = resolved.path.concat(index);
    var hash = hashFor(choice.to, path);
    history.pushState({
      view: "play",
      locked: true,
      as: resolved.scene.turn
    }, "", hash);
    storageSet("oln-lock", hash);
    storageSet("oln-as", resolved.scene.turn);
    render();
    choosing = false;
  }

  function render() {
    var resolved = resolve();
    if (resolved.screen === "start") renderStart();
    else if (resolved.screen === "error") renderError();
    else if (resolved.scene.ending) renderEnding(resolved);
    else renderPlay(resolved);
  }

  window.addEventListener("popstate", render);
  window.addEventListener("hashchange", render);
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";

  rain();
  render();
})();
