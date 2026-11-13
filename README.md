# Mindful Marketing Group website

| File | What it is |
| --- | --- |
| `index.html` | Home page with the application form |
| `contact.html` | Contact page with a message form |
| `privacy.html` | Privacy Policy |
| `terms.html` | Terms of Service |
| `404.html` | Shown when someone opens a link that doesn't exist |
| `config.js` | Settings: booking link, business email |
| `pages.css` | Styles for the extra pages |
| `logo.svg` | Logo and browser-tab icon |

## Before going live

1. In `config.js`, add your business email (`contactEmail`) and, when you have one, your Calendly link (`calendarUrl`).
2. In `terms.html`, replace `[your state]` under "Governing law".

## Getting form submissions (Netlify Forms, free)

1. Put the site on Netlify (drag this folder onto Netlify Drop, or connect the GitHub repo).
2. In Netlify, open the site and go to **Forms**, then click **Enable form detection**.
3. Deploy the site again so Netlify finds the two forms ("application" and "contact").
4. Under **Forms > Submission notifications**, add an email notification so each submission is emailed to you.
