  /* Settings (booking link, email) live in config.js */
  const CONFIG = window.MMG_CONFIG || {};

  /* ---------- Video ads: play only while on screen (saves data), never with sound ---------- */
  (function () {
    const vids = document.querySelectorAll(".ad-video");
    if (!vids.length) return;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !("IntersectionObserver" in window)) {
      // no autoplay: show play controls instead
      vids.forEach(function (v) { v.controls = true; v.preload = "metadata"; });
      return;
    }
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        const v = en.target;
        if (en.isIntersecting) { const p = v.play(); if (p && p.catch) p.catch(function () {}); }
        else v.pause();
      });
    }, { threshold: 0.25 });
    vids.forEach(function (v) { io.observe(v); });
  })();

  /* ---------- Preview calendar (shown while locked) ---------- */
  (function () {
    const cal = document.getElementById("cal");
    const now = new Date();
    const y = now.getFullYear(), m = now.getMonth();
    document.getElementById("calMonth").textContent =
      now.toLocaleString("en-US", { month: "long", year: "numeric" });
    ["S", "M", "T", "W", "T", "F", "S"].forEach(function (d) {
      const el = document.createElement("span"); el.className = "dow"; el.textContent = d; cal.appendChild(el);
    });
    const first = new Date(y, m, 1).getDay();
    const days = new Date(y, m + 1, 0).getDate();
    for (let i = 0; i < first; i++) cal.appendChild(document.createElement("span"));
    for (let d = 1; d <= days; d++) {
      const el = document.createElement("span");
      const dow = new Date(y, m, d).getDay();
      el.className = "d" + (d < now.getDate() ? " past" : (dow > 0 && dow < 6 ? " open" : ""));
      el.textContent = d;
      cal.appendChild(el);
    }
  })();

  /* ---------- Multi-step application ---------- */
  (function () {
    const form = document.getElementById("applyForm");
    const steps = Array.from(form.querySelectorAll("fieldset"));
    const backBtn = document.getElementById("backBtn");
    const nextBtn = document.getElementById("nextBtn");
    const stepLabel = document.getElementById("stepLabel");
    const barFill = document.getElementById("barFill");
    const status = document.getElementById("formStatus");
    let current = 0;

    const messages = {
      name: "Enter your full name.",
      email: "Enter an email like name@company.com.",
      phone: "Enter a phone number with at least 7 digits.",
      business: "Enter your business name.",
      need: "Choose what you need help with.",
      budget: "Choose a budget range.",
      goal: "Tell us what you'd like to change."
    };

    function fieldValid(input) {
      const v = input.value.trim();
      if (!input.required && !v) return true;
      if (!v) return false;
      if (input.type === "email") return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      if (input.type === "tel") return v.replace(/\D/g, "").length >= 7;
      return true;
    }

    function setError(input, ok) {
      const label = input.closest("label");
      label.classList.toggle("invalid", !ok);
      label.querySelector(".err").textContent = ok ? "" : (messages[input.name] || "Fill in this field.");
      input.setAttribute("aria-invalid", ok ? "false" : "true");
    }

    function validateStep(i) {
      let firstBad = null;
      steps[i].querySelectorAll("input, select, textarea").forEach(function (input) {
        const ok = fieldValid(input);
        setError(input, ok);
        if (!ok && !firstBad) firstBad = input;
      });
      if (firstBad) firstBad.focus();
      return !firstBad;
    }

    function show(i) {
      steps.forEach(function (s, n) { s.classList.toggle("active", n === i); });
      current = i;
      backBtn.hidden = i === 0;
      nextBtn.textContent = i === steps.length - 1 ? "Submit application" : "Continue";
      stepLabel.textContent = "Step " + (i + 1) + " of " + steps.length;
      barFill.style.width = ((i + 1) / steps.length * 100) + "%";
    }

    form.addEventListener("input", function (e) {
      const label = e.target.closest("label");
      if (label && label.classList.contains("invalid") && fieldValid(e.target)) setError(e.target, true);
    });

    backBtn.addEventListener("click", function () { status.textContent = ""; show(current - 1); });

    form.addEventListener("submit", async function (e) {
      e.preventDefault();
      status.textContent = "";
      if (!validateStep(current)) return;
      if (current < steps.length - 1) { show(current + 1); steps[current].querySelector("input, select, textarea").focus(); return; }

      nextBtn.disabled = true; nextBtn.textContent = "Sending…";
      try { await window.MMG_sendForm(form, "application"); } catch (err) {}
      // Open the calendar even if the answers didn't send: the booking is what matters,
      // and Calendly still collects their name and email.
      const fullName = form.elements.namedItem("name").value.trim();
      nextBtn.textContent = "Application sent";
      backBtn.hidden = true;
      document.getElementById("thanksTitle").textContent = "Thanks, " + fullName.split(" ")[0] + ". Pick a time for your call.";
      openCalendar(fullName, form.elements.namedItem("email").value.trim());
    });

    /* "Skip the questions" link: straight to the calendar */
    const skip = document.getElementById("skipToCal");
    if (skip) skip.addEventListener("click", function () {
      document.getElementById("thanksTitle").textContent = "Pick a time for your call";
      openCalendar(form.elements.namedItem("name").value.trim(), form.elements.namedItem("email").value.trim());
    });

    function openCalendar(fullName, email) {
      const card = document.getElementById("applyCard");
      const pane = document.getElementById("bookPane");
      card.classList.add("unlocked");
      pane.classList.remove("locked");
      document.getElementById("tabForm").className = "done";
      document.getElementById("tabBook").className = "on";

      const embed = document.getElementById("calEmbed");
      document.getElementById("cal").parentElement.style.display = "none";
      const intro = document.querySelector(".booked-msg p");
      let calUrl = null;
      try {
        const u = new URL(CONFIG.calendarUrl || "");
        if (u.protocol === "https:") {                  // only secure links are embedded
          if (fullName) u.searchParams.set("name", fullName);   // fills these in on Calendly
          if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) u.searchParams.set("email", email);
          u.searchParams.set("hide_gdpr_banner", "1");
          u.searchParams.set("embed_type", "Inline");
          if (location.hostname) u.searchParams.set("embed_domain", location.hostname);
          calUrl = u.href;
        }
      } catch (e) {}
      if (calUrl) {
        intro.textContent = "Your 30-minute strategy call is free. Choose a day and time below.";
        const frame = document.createElement("iframe");
        frame.src = calUrl;
        frame.title = "Book your call";
        frame.referrerPolicy = "strict-origin-when-cross-origin";
        embed.replaceChildren(frame);
      } else {
        intro.textContent = "We'll email you shortly to set up a time for your strategy call.";
        embed.innerHTML = '<div class="cal-placeholder"><strong>What happens next</strong>' +
          '<ol><li>We read your answers.</li><li>We email you with a few times that work.</li><li>We meet for 30 minutes and show you what we\'d do first.</li></ol>' +
          'Questions before then? <a href="contact.html">Send us a message</a>.</div>';
      }
      card.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
    }

    /* Remember answers in this tab, so tapping Terms or Privacy and coming back doesn't lose them */
    const SAVE_KEY = "mmg-application";
    function saveAnswers() {
      try {
        const o = {};
        new FormData(form).forEach(function (v, k) { if (k !== "bot-field") o[k] = v; });
        sessionStorage.setItem(SAVE_KEY, JSON.stringify(o));
      } catch (e) {}
    }
    try {
      const saved = JSON.parse(sessionStorage.getItem(SAVE_KEY) || "{}");
      Object.keys(saved).forEach(function (k) {
        const el = form.elements.namedItem(k);
        if (el && el.name !== "bot-field") el.value = saved[k];
      });
    } catch (e) {}
    form.addEventListener("input", saveAnswers);
    form.addEventListener("change", saveAnswers);
    form.addEventListener("submit", function () { setTimeout(function () {
      if (document.getElementById("applyCard").classList.contains("unlocked")) { try { sessionStorage.removeItem(SAVE_KEY); } catch (e) {} }
    }, 1500); });

    show(0);
  })();
