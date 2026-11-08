# HAMSKY — Personal Portfolio

A fully static personal portfolio for **Muhammad Ilham Mauridha** (HAMSKY), an Information Technology student at UIN Ar-Raniry Banda Aceh.

Built with HTML5, CSS3, and vanilla JavaScript. No framework, build step, or backend is required.

## Run locally

From this directory:

```bash
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000/
```

A local server is recommended so relative assets, the manifest, and JavaScript behave the same way they will when deployed.

## Project structure

```text
.
├── index.html
├── css/
│   ├── styles.css
│   ├── sections.css
│   ├── sections-extra.css
│   └── responsive.css
├── js/
│   ├── boot.js
│   ├── gallery-data.js
│   └── main.js
├── assets/
│   └── images/
│       ├── icon-192.png
│       ├── icon-512.png
│       ├── logo-hamsky.jpg
│       ├── og-cover.png
│       ├── og-cover.svg
│       ├── profile/
│       ├── projects/
│       └── achievements/
├── tests/
│   └── browser-check.html
├── .well-known/
│   └── security.txt
├── favicon.ico
├── favicon.svg
├── site.webmanifest
├── robots.txt
├── _headers
├── .htaccess
├── SECURITY.md
└── .nojekyll
```

`js/boot.js` switches the `no-js` class to `js` before the page renders. It is a separate file so the Content Security Policy can disallow inline scripts.

## Editing content

Most page content is in `index.html`:

- Hero and profile introduction
- About and identity details
- Skills and tools
- Project cards
- Esports achievements
- Education timeline
- Contact links
- Footer

Project detail modal content lives in the `projects` object inside `js/main.js`.

## Profile photo

The profile photo is stored at:

```text
assets/images/profile/profile.jpg
```

The current markup expects this exact path:

```html
<img src="assets/images/profile/profile.jpg" alt="Muhammad Ilham Mauridha — HAMSKY" width="1122" height="1402">
```

The image is displayed inside a square frame using `object-fit: cover`. A portrait-oriented photo works best.

To replace it:

1. Export an optimized `.jpg`, `.png`, or `.webp` image, ideally around `1200 × 1500`.
2. Replace `assets/images/profile/profile.jpg`.
3. If the filename or extension changes, update the `src`, `width`, and `height` in `index.html`.
4. Update the `alt` text if needed.

The header and footer logo is `assets/images/logo-hamsky.jpg`, displayed at `44 × 44` px with a rounded frame. Replace that file to change the mark.

The original abstract placeholder is still available at `assets/images/profile/profile-placeholder.svg` but is no longer used.

## Adding esports photos

The galleries are generated from `js/gallery-data.js`.

Each item has this shape:

```js
{
  src: "assets/images/achievements/mobile-legends/img_0930-web.jpg",
  alt: "Mobile Legends championship photo 1",
  caption: "Mobile Legends — photo 01",
  width: 1600,
  height: 1600
}
```

The `width` and `height` values are the real dimensions of the optimized file. They let the browser reserve the correct space and display each photo at its original aspect ratio.

Steps:

1. Put the original photo in the matching folder:
   - `assets/images/achievements/mobile-legends/`
   - `assets/images/achievements/pubg-mobile/`
2. Generate an optimized copy named `<name>-web.jpg` (maximum edge 1600 px, JPEG quality 86). Keep the original file; only the `-web.jpg` copy is referenced by the site.
3. Add an entry to the matching array in `js/gallery-data.js` with the correct `src`, `alt`, `caption`, `width`, and `height` of the optimized file.

The gallery uses a responsive masonry layout, so portrait, landscape, and square photos keep their natural ratios. It shows three columns above 1080 px, two columns from 541 to 1080 px, and one column at 520 px and below. Do not add invented tournament names, dates, or outcomes.

## Contact form

The form sends messages to **ilhammauridhaa@gmail.com** through **FormSubmit**, a static-site form
relay:

```text
https://formsubmit.co/ajax/ilhammauridhaa@gmail.com
```

`js/main.js` validates the fields, then sends them with `fetch`. On success the visitor sees a
"Message sent" confirmation. If the request fails, a `mailto:` draft link is shown as a fallback.

### One-time activation

FormSubmit requires the inbox owner to confirm the address before messages are delivered:

1. Open the deployed site and submit one test message.
2. Check **ilhammauridhaa@gmail.com** (including spam) for an email from FormSubmit.
3. Click the activation link in that email.
4. Submit another test message to confirm delivery.

Until the activation link is clicked, messages are **not** delivered. To use a different form
service later, change `FORM_ENDPOINT` at the top of `js/main.js` and update `connect-src` /
`form-action` in the CSP (`index.html`, `_headers`, `.htaccess`).

The form also has a hidden `_honey` honeypot field and an `action` fallback for visitors without
JavaScript. FormSubmit receives the message; this site does not store it.

## Testing

With the local server running, open:

```text
http://localhost:8000/tests/browser-check.html
```

The page loads the portfolio at desktop, tablet, and mobile widths and checks:

- Required sections and metadata
- Gallery rendering and all achievement photos
- Desktop/mobile navigation
- Horizontal overflow at `1440`, `1024`, `981`, `768`, `390`, and `320` pixels
- Lightbox and project modal behavior
- Form validation, field limits, email delivery, and `mailto:` fallback
- Social and email links
- Image alt attributes and `© HAMSKY` watermarks
- Right-click/drag protection on gallery images
- Security meta tags, external boot script, `noopener` links, and security files

The suite currently runs 72 assertions. The responsive layout has also been audited at 29 widths from 320 to 1920 px with no horizontal overflow.

For a headless run from this environment:

```bash
"/mnt/c/Program Files/Google/Chrome/Application/chrome.exe" \
  --headless=new \
  --disable-gpu \
  --no-first-run \
  --window-size=1600,1200 \
  --user-data-dir="C:\temp\chrome-hamsky-tests" \
  --virtual-time-budget=25000 \
  --dump-dom \
  "http://127.0.0.1:8000/tests/browser-check.html" \
  > /tmp/hamsky-tests-dom.html
```

## Deployment

The site can be hosted on any static host, including GitHub Pages, Netlify, Cloudflare Pages, or a standard web server.

For GitHub Pages:

1. Push the contents of this directory to the repository.
2. Enable Pages for the branch/root.
3. Keep `.nojekyll` so files and folders starting with underscores are served correctly.

Before publishing, update the Open Graph and Twitter image URLs in `index.html` to absolute URLs for the final domain. Social platforms generally require absolute image URLs for previews.

## Security

This is a fully static site with no backend, database, login, or cookies of its own. Visitors cannot change the files on the server; changing the live site requires access to the hosting account or the source repository. Browser developer tools can only alter a visitor's own local view.

Included protections:

- Content Security Policy in `index.html` (meta), `_headers`, and `.htaccess`
- `X-Frame-Options: DENY` and `frame-ancestors 'none'` against clickjacking
- `X-Content-Type-Options: nosniff`
- Referrer, Permissions, and Cross-Origin-Opener policies
- HTTPS redirect and HSTS
- Directory listing disabled and dotfiles denied
- `rel="noopener noreferrer"` on external links
- `maxlength` limits and `encodeURIComponent` on contact input

Host support:

- **Netlify / Cloudflare Pages** read `_headers`.
- **Apache / LiteSpeed** read `.htaccess`.
- **GitHub Pages** ignores both files. The CSP meta tag still applies, but response headers require a proxy such as Cloudflare.

See `SECURITY.md` for the full model and deployment checklist. To report an issue, email **ilhammauridhaa@gmail.com**; details are also in `.well-known/security.txt`.

## Notes

- HAMSKY is an online identity, not a legal name.
- Mudimesra.com is presented as an independent analysis only. The site does not claim that Muhammad Ilham Mauridha developed or owns it.
- Skill cards describe areas currently being learned, not professional proficiency percentages.
- Achievement photos carry a visible `© HAMSKY` mark in the gallery and lightbox, and
  right-click/drag saving is disabled. This deters casual reuse only — screenshots are handled
  by the operating system and cannot be blocked, detected, or traced to an Instagram username by
  a website.
- Achievement galleries use real event photos. Project card images are abstract SVG illustrations, not AI-generated faces or fake achievement photos.
