  (function () {
    var C = window.MMG_CONFIG || {};
    if (C.contactEmail) {
      var card = document.getElementById("emailCard");
      card.href = "mailto:" + C.contactEmail;
      document.getElementById("emailText").textContent = C.contactEmail;
      card.hidden = false;
    }

    var form = document.getElementById("contactForm");
    var btn = document.getElementById("sendBtn");
    var status = document.getElementById("formStatus");
    var SAVE_KEY = "mmg-contact";
    var messages = {
      name: "Enter your full name.",
      email: "Enter an email like name@company.com.",
      phone: "Enter a phone number with at least 7 digits, or leave it empty.",
      message: "Write a short message."
    };
    function fields() {
      return Array.prototype.filter.call(form.querySelectorAll("input, textarea"), function (i) {
        return i.name !== "bot-field" && i.type !== "radio";
      });
    }
    function valid(input) {
      var v = input.value.trim();
      if (!input.required && !v) return true;
      if (!v) return false;
      if (input.type === "email") return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      if (input.type === "tel") return v.replace(/\D/g, "").length >= 7;
      return true;
    }
    function mark(input, ok) {
      var label = input.closest("label");
      label.classList.toggle("invalid", !ok);
      label.querySelector(".err").textContent = ok ? "" : messages[input.name];
      input.setAttribute("aria-invalid", ok ? "false" : "true");
    }
    function save() {
      try {
        var o = {};
        new FormData(form).forEach(function (v, k) { if (k !== "bot-field") o[k] = v; });
        sessionStorage.setItem(SAVE_KEY, JSON.stringify(o));
      } catch (e) {}
    }

    // Bring back anything typed before tapping Terms or Privacy
    try {
      var saved = JSON.parse(sessionStorage.getItem(SAVE_KEY) || "{}");
      Object.keys(saved).forEach(function (k) {
        var el = form.elements.namedItem(k);
        if (el && k !== "bot-field") el.value = saved[k];
      });
    } catch (e) {}

    form.addEventListener("input", function (e) {
      save();
      var label = e.target.closest("label");
      if (label && label.classList.contains("invalid") && valid(e.target)) mark(e.target, true);
    });
    form.addEventListener("change", save);

    form.addEventListener("submit", async function (e) {
      e.preventDefault();
      status.textContent = "";
      var firstBad = null;
      fields().forEach(function (input) {
        var ok = valid(input); mark(input, ok);
        if (!ok && !firstBad) firstBad = input;
      });
      if (firstBad) { firstBad.focus(); return; }

      btn.disabled = true; btn.textContent = "Sending…";
      var ok = false;
      try { ok = await window.MMG_sendForm(form, "contact"); } catch (err) { ok = false; }
      if (!ok) {
        btn.disabled = false; btn.textContent = "Send message";
        status.innerHTML = 'Your message didn\'t send. Try again, or <a href="index.html#apply">book a call</a> instead.';
        return;
      }
      try { sessionStorage.removeItem(SAVE_KEY); } catch (e) {}
      document.getElementById("formWrap").hidden = true;
      document.getElementById("sentMsg").hidden = false;
    });
  })();
