# Mindful Marketing Group website

| File | What it is |
| --- | --- |
| `index.html` | Home page with the application form |
| `contact.html` | Contact page with a message form |
| `privacy.html` | Privacy Policy |
| `terms.html` | Terms of Service |
| `404.html` | Shown when someone opens a link that doesn't exist |
| `config.js` | Settings: booking link, business email |
| `home.css`, `home.js` | Look and behavior of the home page |
| `contact.js`, `pages.js` | Behavior of the contact, privacy and terms pages |
| `pages.css` | Styles for the extra pages |
| `_headers` | Security rules Netlify sends with every page |
| `logo.svg` | Logo and browser-tab icon |

## Before going live

1. In `config.js`, add your business email (`contactEmail`) and, when you have one, your Calendly link (`calendarUrl`).
2. In `terms.html`, replace `[your state]` under "Governing law".

## Getting form submissions (Netlify Forms, free)

1. Put the site on Netlify (drag this folder onto Netlify Drop, or connect the GitHub repo).
2. In Netlify, open the site and go to **Forms**, then click **Enable form detection**.
3. Deploy the site again so Netlify finds the two forms ("application" and "contact").
4. Under **Forms > Submission notifications**, add an email notification so each submission is emailed to you.

## Staying safe and avoiding surprise bills

- **Stay on Netlify's free plan, or keep auto recharge off on a paid plan.** If traffic ever uses up the monthly credits (for example, a bot attack), the site pauses until next month instead of charging you.
- **Bundle your changes.** Every update that goes live uses 15 of the free plan's 300 monthly credits, so make several changes at once instead of one at a time.
- **Turn on two-factor login for Netlify and GitHub.** Form submissions (names, emails, phone numbers) live in your Netlify account, so that login is what protects them.
- **Never put passwords or secret keys in these files.** The GitHub repo is public. Nothing secret is in it now.
- **Adding an outside tool later** (analytics, a chat widget, a different booking site)? Add its web address to the `Content-Security-Policy` line in `_headers`, or the browser will block it.
- **Getting spam through the forms?** In Netlify, turn on reCAPTCHA for the forms. A hidden spam trap is already built in.
