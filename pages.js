/* Shared behavior for the inner pages */
(function () {
  var C = window.MMG_CONFIG || {};

  // Add "or email you@..." wherever a page asks for it
  if (C.contactEmail) {
    document.querySelectorAll("[data-email-sentence]").forEach(function (span) {
      span.textContent = " or email ";
      var a = document.createElement("a");
      a.href = "mailto:" + C.contactEmail; a.textContent = C.contactEmail;
      span.appendChild(a);
    });
  }

  // Section menu for Privacy and Terms, built from the headings
  var secs = Array.prototype.slice.call(document.querySelectorAll(".prose section[id]"));
  if (!secs.length) return;
  document.querySelectorAll("[data-toc]").forEach(function (ol) {
    secs.forEach(function (s) {
      var li = document.createElement("li"), a = document.createElement("a");
      a.href = "#" + s.id; a.textContent = s.querySelector("h2").textContent;
      li.appendChild(a); ol.appendChild(li);
    });
  });
  var mob = document.querySelector(".toc-mobile");
  if (mob) mob.addEventListener("click", function (e) { if (e.target.tagName === "A") mob.open = false; });

  // Highlight the section you're reading
  var links = document.querySelectorAll(".toc a");
  if (!("IntersectionObserver" in window)) return;
  var obs = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      links.forEach(function (a) { a.classList.toggle("active", a.getAttribute("href") === "#" + en.target.id); });
    });
  }, { rootMargin: "-25% 0px -65% 0px" });
  secs.forEach(function (s) { obs.observe(s); });
})();
