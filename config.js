/* ============================================================
   SITE SETTINGS — used by every page
   ============================================================ */
window.MMG_CONFIG = {
  // Your booking link, e.g. "https://calendly.com/your-name/strategy-call".
  // Leave empty and people are told you'll email them to set up a time.
  calendarUrl: "",

  // Your business email, shown on the Contact page, e.g. "hello@mindfulmarketinggroup.com".
  contactEmail: "",

  // Optional. Leave empty to use Netlify Forms (free, built into Netlify).
  // Only fill this in if you'd rather use Formspree, e.g. "https://formspree.io/f/abcdwxyz".
  formEndpoint: ""
};

/* Sends a form. Used by the application form and the contact form.
   Returns true if it was sent (or if the page is opened as a local file preview). */
window.MMG_sendForm = async function (form, formName) {
  const C = window.MMG_CONFIG;
  const data = new FormData(form);
  if (C.formEndpoint) {
    const res = await fetch(C.formEndpoint, { method: "POST", body: data, headers: { Accept: "application/json" } });
    return res.ok;
  }
  if (!/^https?:$/.test(location.protocol)) return true; // local preview: nothing to send to
  data.set("form-name", formName);
  const res = await fetch("/", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(data).toString()
  });
  return res.ok;
};

document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
});
