# Security Policy

## What this site is

HAMSKY is a **fully static website**: HTML, CSS, vanilla JavaScript, and image files. It has no
backend, database, login, or cookies. The contact form sends its data to **FormSubmit**
(`https://formsubmit.co`), a third-party form relay, which forwards the message to the owner's
email inbox. No message data is stored on this site.

## What visitors can and cannot do

Visitors **cannot change the files on the server**. A browser can temporarily alter its own local
view through developer tools, but that never changes what other visitors receive. Editing the live
site requires access to the hosting account or the source repository.

Real protection therefore depends on deployment:

1. Serve the site over **HTTPS** only.
2. Use a strong, unique password for the hosting and repository accounts.
3. Enable **two-factor authentication** on GitHub and on the hosting provider.
4. Keep the repository private, or limit write access to trusted collaborators.
5. Review collaborators, deploy keys, and access tokens regularly.

## Protections included in this project

- **Content Security Policy (CSP)** in `index.html`, `_headers`, and `.htaccess`.
  Allows only same-origin scripts, blocks plugins (`object-src 'none'`), restricts form targets,
  allows form delivery only to FormSubmit, and only permits the Google Fonts domains needed by
  the design.
- **Clickjacking protection** through `X-Frame-Options: DENY` and `frame-ancestors 'none'`
  (`_headers` and `.htaccess`).
- **MIME sniffing protection** through `X-Content-Type-Options: nosniff`.
- **Referrer policy** set to `strict-origin-when-cross-origin`.
- **Permissions Policy** disabling camera, microphone, geolocation, payment, USB, Bluetooth,
  and serial access.
- **HTTPS redirect and HSTS** in `.htaccess` and `_headers`.
- **Directory listing disabled** and dotfiles denied in `.htaccess`.
- External links use `rel="noopener noreferrer"`.
- Contact input is encoded with `encodeURIComponent` before being placed in the `mailto:` fallback,
  sent to FormSubmit, and limited with `maxlength`; a hidden honeypot field filters basic bots.
- Achievement photos carry a visible `© HAMSKY` mark, and right-click/drag saving is disabled.
  This deters casual reuse only: screenshots are taken by the operating system and cannot be
  blocked or detected by a website.
- No third-party analytics, trackers, ads, or remote scripts.

## Host-specific notes

- **Netlify / Cloudflare Pages** read `_headers` automatically.
- **Apache / LiteSpeed** hosting reads `.htaccess`.
- **GitHub Pages** ignores both files. The CSP meta tag still applies, but response headers
  (`X-Frame-Options`, HSTS, `Permissions-Policy`) require a proxy such as Cloudflare.
- If the site is later moved behind another host, copy the header values from `_headers`.

## If third-party services are added

The CSP must be updated before adding analytics, embedded videos, forms, or a CMS. Prefer
self-hosted or reputable services, load them over HTTPS, and pin versions when possible.
If a backend is introduced, validate and sanitize all input on the server, add CSRF protection,
rate limiting, and authentication as appropriate.

## Reporting a vulnerability

If you find a security issue, please email **ilhammauridhaa@gmail.com** with a short description
and reproduction steps. Please do not publish the issue before it has been reviewed.
