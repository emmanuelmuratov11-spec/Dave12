/* 3D scroll effects for the home page.
   Skipped completely for people who turned on "reduce motion". */
(function () {
  var hero = document.querySelector(".hero");
  var apply = document.getElementById("apply");
  var finalCard = document.querySelector(".final-card");
  var floatCta = document.querySelector(".float-cta");

  /* ---------- Floating "Book your call" button (phones) ----------
     Shows after you scroll past the top, hides when the form or the last button is on screen. */
  function onScreen(el) {
    if (!el) return false;
    var r = el.getBoundingClientRect();
    return r.top < window.innerHeight && r.bottom > 0;
  }
  function updateFloat() {
    if (!floatCta || !hero) return;
    var show = hero.getBoundingClientRect().bottom < 0 && !onScreen(apply) && !onScreen(finalCard);
    if (show === floatCta.classList.contains("show")) return;
    floatCta.classList.toggle("show", show);
    if (show) { floatCta.removeAttribute("aria-hidden"); floatCta.removeAttribute("tabindex"); }
    else { floatCta.setAttribute("aria-hidden", "true"); floatCta.setAttribute("tabindex", "-1"); }
  }

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce || !("IntersectionObserver" in window)) {
    window.addEventListener("scroll", updateFloat, { passive: true });
    updateFloat();
    return;
  }

  document.documentElement.classList.add("motion");
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* ---------- Headline words flip up ---------- */
  var h1 = hero && hero.querySelector("h1");
  if (h1) {
    var text = h1.textContent.trim();
    h1.setAttribute("aria-label", text);
    h1.textContent = "";
    text.split(/\s+/).forEach(function (word, i, all) {
      var outer = document.createElement("span");
      outer.className = "w";
      outer.setAttribute("aria-hidden", "true");
      var inner = document.createElement("span");
      inner.textContent = word;
      inner.style.setProperty("--i", i);
      outer.appendChild(inner);
      h1.appendChild(outer);
      if (i < all.length - 1) h1.appendChild(document.createTextNode(" "));
    });
  }

  /* ---------- Flip-up reveals ---------- */
  [".block-head", ".steps li", ".bento .tile", ".apply-card", ".faq details"].forEach(function (sel) {
    document.querySelectorAll(sel).forEach(function (el) { el.setAttribute("data-reveal", ""); });
  });
  var io = new IntersectionObserver(function (entries) {
    var n = 0;   // things that appear together come in one after another
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      var el = en.target;
      el.style.setProperty("--d", (n++ * 0.09).toFixed(2) + "s");
      el.classList.add("in");
      io.unobserve(el);
      setTimeout(function () { el.style.removeProperty("--d"); }, 1600);
    });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
  document.querySelectorAll("[data-reveal]").forEach(function (el) { io.observe(el); });

  /* ---------- Service tiles tilt toward the cursor ---------- */
  if (finePointer) {
    document.querySelectorAll(".bento .tile:not([data-no-tilt])").forEach(function (t) {
      t.addEventListener("pointermove", function (e) {
        if (!t.classList.contains("in")) return;
        var r = t.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        t.classList.add("tilting");
        t.style.setProperty("--ry", ((x - 0.5) * 9).toFixed(2) + "deg");
        t.style.setProperty("--rx", ((0.5 - y) * 9).toFixed(2) + "deg");
        t.style.setProperty("--gx", (x * 100).toFixed(1) + "%");
        t.style.setProperty("--gy", (y * 100).toFixed(1) + "%");
      });
      t.addEventListener("pointerleave", function () {
        t.classList.remove("tilting");
        t.style.setProperty("--rx", "0deg");
        t.style.setProperty("--ry", "0deg");
      });
    });
  }

  /* ---------- Before/after slider: a one-time "drag me" hint ---------- */
  var cmp = document.querySelector(".compare");
  if (cmp && window.MMG_setCompare) {
    var hintIO = new IntersectionObserver(function (entries) {
      if (!entries[0].isIntersecting) return;
      hintIO.disconnect();
      setTimeout(function () {
        var start = performance.now(), dur = 1800;
        (function step(now) {
          if (cmp.dataset.touched) return;            // stop if they already grabbed it
          var t = Math.min(1, (now - start) / dur);
          window.MMG_setCompare(t < 1 ? 50 + Math.sin(t * Math.PI * 2) * 32 : 50);
          if (t < 1) requestAnimationFrame(step);
        })(start);
      }, 700);
    }, { threshold: 0.6 });
    hintIO.observe(cmp);
  }

  /* ---------- Ribbons: repeat the words so they can slide ---------- */
  var ribbons = document.querySelector(".ribbons");
  if (ribbons) {
    ribbons.querySelectorAll("ul").forEach(function (ul) {
      var items = Array.prototype.slice.call(ul.children);
      for (var k = 0; k < 4; k++) {
        items.forEach(function (li) {
          var c = li.cloneNode(true);
          c.setAttribute("aria-hidden", "true");
          ul.appendChild(c);
        });
      }
    });
  }

  /* ---------- Hero mouse tilt ---------- */
  var stage = document.querySelector(".stage");
  var tilt = { x: 0, y: 0, tx: 0, ty: 0 };
  if (stage && finePointer) {
    hero.addEventListener("pointermove", function (e) {
      var r = stage.getBoundingClientRect();
      tilt.tx = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / r.width));
      tilt.ty = Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height / 2)) / r.height));
      kick();
    });
    hero.addEventListener("pointerleave", function () { tilt.tx = 0; tilt.ty = 0; kick(); });
  }

  /* ---------- Everything tied to scrolling, once per frame ---------- */
  var bar = document.querySelector(".progress-bar");
  var ticking = false;
  function kick() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }
  function clamp01(v) { return Math.max(0, Math.min(1, v)); }

  function frame() {
    ticking = false;
    var vh = window.innerHeight;
    var de = document.documentElement;

    var max = de.scrollHeight - vh;
    if (bar) bar.style.setProperty("--p", max > 0 ? clamp01(window.scrollY / max).toFixed(4) : "0");

    if (stage && hero) {
      var hr = hero.getBoundingClientRect();
      var p = clamp01(-hr.top / hr.height);          // 0 at the top, 1 once the hero has scrolled away
      tilt.x += (tilt.tx - tilt.x) * 0.12;
      tilt.y += (tilt.ty - tilt.y) * 0.12;
      stage.style.setProperty("--rx", (8 - tilt.y * 10 + p * 24).toFixed(2) + "deg");
      stage.style.setProperty("--ry", (-12 + tilt.x * 18 + p * 8).toFixed(2) + "deg");
      stage.style.setProperty("--sy", (p * -50).toFixed(1) + "px");
      if (Math.abs(tilt.tx - tilt.x) > 0.002 || Math.abs(tilt.ty - tilt.y) > 0.002) kick();
    }

    if (ribbons) {
      var rr = ribbons.getBoundingClientRect();
      if (rr.bottom > 0 && rr.top < vh) ribbons.style.setProperty("--off", ((vh - rr.top) * 0.35).toFixed(1) + "px");
    }

    if (finalCard) {
      var fr = finalCard.getBoundingClientRect();
      finalCard.style.setProperty("--fp", clamp01((vh - fr.top) / (vh * 0.75)).toFixed(3));
    }

    updateFloat();
  }

  window.addEventListener("scroll", kick, { passive: true });
  window.addEventListener("resize", kick);
  kick();
})();
