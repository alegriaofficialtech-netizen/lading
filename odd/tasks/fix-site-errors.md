# Fix site errors — MP / ALEGRIA static site

## Objective

Eliminate every verified defect in the ALEGRIA static site (canonical URLs, duplicate
titles/meta, duplicated CSS, orphaned pages, missing scripts, accessibility gaps) and
stop the newsletter form from reporting success it never delivers.

## Problem

The site was built page-by-page by hand with no source of truth, no build step and no
review pass. Copy-paste forking produced SEO damage that is currently costing organic
visibility, and a signup form that silently discards leads. Last content edit was
2026-08-21; nothing has been verified end-to-end since.

## Why it matters

- 4 of 9 pages declare `rel="canonical"` pointing at `https://alegria.pe/` — a
  different domain from the site's own `alegriatech.com`. This instructs search engines
  to drop those pages and consolidate onto a foreign host.
- 3 pages share the exact same `<title>` and `<meta description>`.
- `index.html` ships 3 `<h1>` elements.
- The newsletter form validates input, shows "Suscripción exitosa", and discards it.
  Every subscriber is told they are registered and no record exists anywhere.

## Verified defects (parent-checked, 2026-10-14)

| # | Defect | Evidence | Severity |
|---|--------|----------|----------|
| 1 | Canonical → wrong domain | `index.html:8`, `servicio-apps.html:8`, `servicio-desarrollo.html:8`, `servicio-paginas-web.html:8` → `https://alegria.pe/` | Critical |
| 2 | 3 identical `<title>` | `servicio-ia.html:6`, `servicio-datos.html:6`, `servicio-marketing.html:6` | Critical |
| 3 | 3 identical meta description | same three files, line 7 | High |
| 4 | Home title on servicio page | `servicio-desarrollo.html:6` | High |
| 5 | 3 `<h1>` on one page | `index.html` | High |
| 6 | Nested `@media` parse error | `css/ia.css:865-866`, `css/iiot.css:687-688` | High |
| 7 | Orphaned stylesheet | `css/ia.css` (923 lines) referenced by 0 pages | High |
| 8 | Duplicated inline CSS | ~2 476 lines pasted into `servicio-ia/datos/marketing` `<head>` | High |
| 9 | Orphan fragments | `contact.html`, `projects.html`, `new_services.html`, `why_choose.html` — no doctype/head/body, unlinked | Medium |
| 10 | Missing shared script | only 4 of 9 pages load `js/script.js`; 5 pages ship without mobile menu | Medium |
| 11 | Fake newsletter success | `js/script.js:167-182` | High |
| 12 | Keyboard-inaccessible FAQ | `servicio-paginas-web.html:414-434` — clickable `<div>` | Medium |
| 13 | `<img>` without `alt` | `servicio-datos.html:1305`, `servicio-desarrollo.html:555`, `servicio-ia.html:1194`, `servicio-marketing.html:1532`, `servicio-paginas-web.html:615` | Medium |
| 14 | 27 inline `onclick` handlers | across 9 pages | Low |
| 15 | Heading level skips (h2→h4) | `servicio-ia.html`, `servicio-datos.html`, `servicio-marketing.html` | Low |

### Verified as NOT a defect

- **Home carousel does not crash.** `index.html` has 3 `.hero-slide` (118, 144, 174) and
  3 matching `.dot` buttons (207-209). An earlier audit claimed a `TypeError` at t+12s;
  this was wrong and was not actioned.
- **File encoding is clean.** Zero U+FFFD replacement characters in the audited files.
- **Routing is intact.** 136 internal `.html` links and all css/js/image references
  resolve; 0 broken.

## Scope

Authorized: the 9 real HTML pages, `css/`, `js/script.js`, and the 4 orphan fragments.

Out of scope: backend/hosting setup, form backend selection (see W6), image optimisation,
adding a build step.

## Tasks

- [ ] **W1 — SEO repair.** Remove the four `alegria.pe` canonicals (or repoint to the
      real domain). Write distinct `<title>` and `<meta description>` for
      `servicio-datos`, `servicio-marketing`, `servicio-desarrollo`. Reduce `index.html`
      to a single `<h1>`. *Check: no duplicate titles across the 9 pages; 0 canonicals
      pointing off-domain.*
- [ ] **W2 — CSS source of truth.** Link `css/ia.css` from the three pages that inline a
      copy of it; delete the duplicated `<style>` blocks. Fix the nested `@media` in
      `css/ia.css` and `css/iiot.css`. *Check: no `<style>` block in any page carries the
      `IA PAGE` payload; pages render identically.*
- [ ] **W3 — script.js coverage.** Add `<script src="js/script.js" defer></script>` to the
      5 pages missing it, after confirming every `init*` function no-ops safely when its
      target element is absent. *Check: mobile menu opens on all 9 pages.*
- [ ] **W4 — Orphan fragments.** Resolve `contact.html`, `projects.html`,
      `new_services.html`, `why_choose.html` — their content already exists inlined in
      `index.html`. *Check: no unreferenced `.html` files remain.*
- [ ] **W5 — Accessibility.** FAQ `<div>` → `<button aria-expanded>`; add the 5 missing
      `alt` attributes; reduce inline `onclick` where it is a real control. *Check: FAQ
      operable by keyboard.*
- [ ] **W6 — Newsletter honesty.** BLOCKED on product decision: the form must either
      deliver to a real endpoint, redirect to WhatsApp, or stop claiming success.

## Acceptance criteria

1. No two pages share a `<title>`.
2. No `rel="canonical"` points outside the site's own domain.
3. `css/ia.css` is referenced by the pages that need it; no page duplicates it inline.
4. Every real page loads `js/script.js`.
5. The newsletter never displays a success message that no backend confirmed.

## Verification

Static checks only — the site has no test runner and no build. Verification is
script-based: title/canonical uniqueness scan, link-integrity scan (136 links, 0 broken
baseline), `@media` nesting scan, and `alt`-attribute scan. Report each command with its
observed output.

## Progress

| Task | Status | Commit |
|------|--------|--------|
| Repo setup | Done | `f65d71f`, `90474fd` |
| W1 | Pending | — |

## Next step

Execute W1 on branch `fix/site-errors`.