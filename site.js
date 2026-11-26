// Naia website: text size + motion settings (like the app) and a quiet sea.
(function () {
  var root = document.documentElement;
  root.classList.add("js");
  function get(k, d) { try { return localStorage.getItem("naia." + k) || d; } catch (e) { return d; } }
  function set(k, v) { try { localStorage.setItem("naia." + k, v); } catch (e) {} }


  function apply() {
    var size = get("size", "normal");
    var motion = get("motion3", (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) ? "still" : "moving");
    root.dataset.size = size;
    root.classList.remove("moving", "still", "nosea");
    root.classList.add(motion === "off" ? "nosea" : motion);
    document.querySelectorAll("[data-set]").forEach(function (b) {
      var k = b.dataset.set, v = b.dataset.val;
      b.setAttribute("aria-pressed", String((k === "size" ? size : motion) === v));
    });
  }

  // Sea: a few bubbles and fish. Positions are fixed so "Still" looks the same each time.
  function sea() {
    var s = document.querySelector(".sea");
    if (!s) return;
    var B = [[8,6,22,0,70],[17,10,26,-6,35],[29,5,19,-12,82],[46,8,30,-3,55],[63,12,24,-15,25],[74,6,21,-9,66],[86,9,28,-1,44],[93,5,18,-18,15]];
    B.forEach(function (b) {
      var e = document.createElement("i");
      e.className = "bubble";
      e.style.cssText = "left:" + b[0] + "%;width:" + b[1] + "px;height:" + b[1] + "px;--t:" + b[2] + "s;--d:" + b[3] + "s;--y:" + b[4] + "%";
      s.appendChild(e);
    });
    var F = [[22,90,-10,12,18],[58,120,-50,48,12],[78,140,-95,70,14]];
    F.forEach(function (f) {
      var e = document.createElement("span");
      e.className = "fish";
      e.style.cssText = "top:" + f[0] + "%;--t:" + f[1] + "s;--d:" + f[2] + "s;--x:" + f[3] + "%;width:" + f[4] * 2 + "px";
      e.innerHTML = '<svg viewBox="0 0 40 16" fill="currentColor" aria-hidden="true" style="transform:scaleX(-1)"><path d="M2 8c6-7 18-7 26 0-8 7-20 7-26 0zM28 8l10-6v12z"/></svg>';
      s.appendChild(e);
    });
  }
  // scroll: progress line, depth gauge, deeper sea
  var tick = false;
  function onScroll() {
    tick = false;
    var max = document.documentElement.scrollHeight - innerHeight;
    var p = max > 0 ? Math.min(1, Math.max(0, scrollY / max)) : 0;
    root.style.setProperty("--p", p.toFixed(4));
    root.style.setProperty("--deep", Math.min(1, p * 1.15).toFixed(3));
    var n = document.getElementById("depthNum");
    if (n) n.textContent = Math.round(p * 1000) + " m";
  }
  addEventListener("scroll", function () { if (!tick) { tick = true; requestAnimationFrame(onScroll); } }, { passive: true });
  addEventListener("resize", onScroll);
  function reveal() {
    var els = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) { els.forEach(function (e) { e.classList.add("in"); }); return; }
    var io = new IntersectionObserver(function (es) { es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } }); }, { rootMargin: "0px 0px -8% 0px" });
    els.forEach(function (e) { io.observe(e); });
  }

  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-set]");
    if (b) { set(b.dataset.set === "motion" ? "motion3" : b.dataset.set, b.dataset.val); apply(); return; }
    var mb = e.target.closest("#menuBtn"), mn = document.getElementById("mnav");
    if (mb && mn) { if (mn.hidden || !mn.classList.contains("open")) window.__menu(true); else window.__menu(false); return; }
    if (mn && !mn.hidden && (e.target.closest("#mnav a") || !e.target.closest("#mnav"))) { window.__menu(false); }
    if (e.target.closest(".opensettings")) { if (mn) window.__menu(false); var sp = document.getElementById("settings"); if (sp) { sp.hidden = false; var sb = document.getElementById("settingsBtn"); if (sb) sb.setAttribute("aria-expanded", "true"); } return; }
    var t = e.target.closest("#settingsBtn");
    var p = document.getElementById("settings");
    if (t && p) { var open = p.hidden; p.hidden = !open; t.setAttribute("aria-expanded", String(open)); return; }
    if (p && !p.hidden && !e.target.closest("#settings")) { p.hidden = true; document.getElementById("settingsBtn").setAttribute("aria-expanded", "false"); }
  });
  document.addEventListener("keydown", function (e) {
    var p = document.getElementById("settings");
    if (e.key === "Escape" && p && !p.hidden) { p.hidden = true; var t = document.getElementById("settingsBtn"); t.setAttribute("aria-expanded", "false"); t.focus(); }
  });

  apply();
  document.addEventListener("DOMContentLoaded", function () { sea(); apply(); reveal(); onScroll(); });
})();
// store buttons: the app isn't live yet, so tapping explains that and offers a launch email
document.addEventListener("click", function (e) {
  var b = e.target.closest(".store");
  var pops = document.querySelectorAll(".storepop");
  if (!b) { if (!e.target.closest(".storepop")) pops.forEach(function (p) { p.hidden = true; }); return; }
  var wrap = b.closest(".stores"), pop = wrap && wrap.nextElementSibling;
  if (!pop || !pop.classList.contains("storepop")) return;
  var same = !pop.hidden && pop.dataset.for === b.dataset.store;
  pops.forEach(function (p) { p.hidden = true; });
  if (same) return;
  pop.dataset.for = b.dataset.store;
  pop.hidden = false;
  pop.classList.remove("pop-in"); void pop.offsetWidth; pop.classList.add("pop-in");
});
// launch list: send the email to info.thenaiaclub@icloud.com through FormSubmit.
// Uses a normal form post into a hidden frame (no background request that can hang).
document.addEventListener("submit", function (e) {
  var f = e.target.closest(".wl");
  if (!f) return;
  e.preventDefault();
  var box = f.closest(".storepop"), msg = box.querySelector(".wl-msg"), btn = f.querySelector("button");
  var email = f.email.value.trim();
  if (f._honey.value) return;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { msg.textContent = "That email doesn’t look right. Can you check it?"; msg.className = "wl-msg err"; f.email.focus(); return; }
  btn.disabled = true; btn.textContent = "Sending…"; msg.textContent = ""; msg.className = "wl-msg";
  var done = false;
  function finish(ok) {
    if (done) return; done = true;
    if (ok === false) {
      btn.disabled = false; btn.textContent = "Notify me";
      msg.innerHTML = "Couldn’t sign you up just now. Please try again, or follow <a href=\"https://instagram.com/thenaiaclub\" target=\"_blank\" rel=\"noopener\">@thenaiaclub</a>.";
      msg.className = "wl-msg err"; done = false; return;
    }
    f.hidden = true; box.querySelector(".sp-s").hidden = true;
    box.querySelector(".sp-t").textContent = "You’re on the list";
    msg.textContent = "Check your inbox for a little hello from us."; msg.className = "wl-msg ok";
  }
  // MailerLite: adds the email to the "Launch list" group; MailerLite then sends the welcome email.
  var ML = "https://assets.mailerlite.com/jsonp/2826894/forms/205211427578840594/subscribe";
  var body = new URLSearchParams(); body.append("fields[email]", email); body.append("ml-submit", "1"); body.append("anticsrf", "true");
  fetch(ML, { method: "POST", body: body, headers: { "Accept": "application/json" } })
    .then(function (r) { return r.json(); })
    .then(function (j) { finish(!(j && j.success === false)); })
    .catch(function () {
      // the browser blocked reading the answer: send again without reading it
      try { fetch(ML, { method: "POST", mode: "no-cors", body: body, keepalive: true }).then(function () { finish(true); }, function () { finish(false); }); } catch (x) { finish(false); }
    });
  setTimeout(function () { if (!done) finish(true); }, 6000);
});
// jumping to a section from the menu: show everything at once, no fade-in
(function () {
  function jump() { document.documentElement.classList.add("jumped"); document.querySelectorAll(".reveal").forEach(function (e) { e.classList.add("in"); }); }
  if (location.hash) jump();
  addEventListener("hashchange", jump);
  document.addEventListener("click", function (e) { var a = e.target.closest('a[href*="#"]'); if (a) jump(); }, true);
})();
// smooth FAQ open/close + fade on changing text
(function () {
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.addEventListener("click", function (e) {
    var s = e.target.closest("summary"); if (!s || reduce) return;
    var d = s.parentElement, a = d.querySelector(".a"); if (!a || !a.animate) return;
    e.preventDefault();
    if (d.open) {
      var h = a.offsetHeight;
      a.animate([{ height: h + "px", opacity: 1 }, { height: "0px", opacity: 0 }], { duration: 260, easing: "cubic-bezier(.4,0,.2,1)" }).onfinish = function () { d.open = false; };
    } else {
      d.open = true; var h2 = a.offsetHeight;
      a.animate([{ height: "0px", opacity: 0 }, { height: h2 + "px", opacity: 1 }], { duration: 300, easing: "cubic-bezier(.2,.8,.2,1)" });
    }
  });
  function fade(el) { if (!el) return; el.classList.remove("fadein"); void el.offsetWidth; el.classList.add("fadein"); }
  document.addEventListener("click", function (e) {
    if (e.target.closest(".goal")) setTimeout(function () { fade(document.querySelector(".goalout")); }, 0);
    if (e.target.closest(".bub") || e.target.closest(".treset")) setTimeout(function () { var r = document.querySelector("#tryit .tresult.done"); if (r) fade(r); }, 0);
  });
})();

// menu: smooth slide open/close as an overlay
window.__menu = function (open) {
  var mn = document.getElementById("mnav"), mb = document.getElementById("menuBtn"), root = document.documentElement;
  if (!mn) return;
  clearTimeout(mn._t);
  if (open) { mn.hidden = false; void mn.offsetWidth; mn.classList.add("open"); root.classList.add("menu-open"); }
  else { mn.classList.remove("open"); root.classList.remove("menu-open"); mn._t = setTimeout(function () { mn.hidden = true; }, 340); }
  if (mb) mb.setAttribute("aria-expanded", String(open));
};
// soft fade when leaving to another page
document.addEventListener("click", function (e) {
  var a = e.target.closest("a[href]"); if (!a || a.target || e.metaKey || e.ctrlKey) return;
  var u = new URL(a.href, location.href);
  if (u.origin !== location.origin || (u.pathname === location.pathname && u.hash) || /^mailto:|^tel:/.test(a.getAttribute("href"))) return;
  if (document.startViewTransition || (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches)) return;
  e.preventDefault(); document.documentElement.classList.add("leaving"); setTimeout(function () { location.href = a.href; }, 220);
});
addEventListener("pageshow", function () { document.documentElement.classList.remove("leaving"); });
// ===== smooth travel for every link that goes somewhere on the site =====
(function () {
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  function norm(p) { return p.replace(/index\.html$/, ""); }
  function ease(t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function glide(el) {
    var head = document.querySelector("header.site"), off = head ? head.offsetHeight + 12 : 0;
    var from = scrollY, to = Math.max(0, el.getBoundingClientRect().top + scrollY - off), d = to - from;
    if (reduce || Math.abs(d) < 4) { scrollTo(0, to); return; }
    var dur = Math.min(1100, 450 + Math.abs(d) * .12), t0 = null;
    document.documentElement.style.scrollBehavior = "auto";
    (function step(ts) { if (t0 === null) t0 = ts; var t = Math.min(1, (ts - t0) / dur); scrollTo(0, from + d * ease(t)); if (t < 1) requestAnimationFrame(step); else { document.documentElement.style.scrollBehavior = ""; var fix = el.getBoundingClientRect().top - off; if (Math.abs(fix) > 6 && !el._fixed) { el._fixed = 1; glide(el); setTimeout(function(){ el._fixed = 0; }, 1500); } } })(performance.now());
    requestAnimationFrame(function s(ts) { });
  }
  window.__glide = glide;
  // same-page links (incl. "index.html#…" while already on the home page)
  document.addEventListener("click", function (e) {
    var a = e.target.closest("a[href]"); if (!a || e.defaultPrevented && !a.closest("#mnav")) {}
    if (!a || a.target || e.metaKey || e.ctrlKey || e.shiftKey) return;
    var u = new URL(a.href, location.href);
    if (u.origin !== location.origin || norm(u.pathname) !== norm(location.pathname) || !u.hash) return;
    var el = document.getElementById(decodeURIComponent(u.hash.slice(1))); if (!el) return;
    e.preventDefault(); e.stopImmediatePropagation();
    if (window.__menu) window.__menu(false);
    history.pushState(null, "", u.hash);
    document.querySelectorAll(".reveal").forEach(function (r) { r.classList.add("in"); });
    setTimeout(function () { glide(el); }, a.closest("#mnav") ? 180 : 0);
  }, true);
  // arriving from another page with #section: fade in at the top, then glide down
  if (location.hash && document.getElementById(location.hash.slice(1))) {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    scrollTo(0, 0);
    addEventListener("load", function () { document.querySelectorAll(".reveal").forEach(function (r) { r.classList.add("in"); }); document.querySelectorAll("img[loading=lazy]").forEach(function (i) { i.loading = "eager"; }); setTimeout(function () { var el = document.getElementById(location.hash.slice(1)); if (el) glide(el); }, 350); });
  }
})();
