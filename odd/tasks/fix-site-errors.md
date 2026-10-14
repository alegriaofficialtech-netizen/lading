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

- [x] **W1 — SEO repair.** DONE `39f6716`. Removed the four `alegria.pe` canonicals.
      Distinct title + meta for datos/marketing/desarrollo, derived from each page's own
      hero copy. `index.html` reduced to one `<h1>` (demoted two hero slides to `<h2>`;
      safe because `.hero-h1` is styled by class). *Verified: 9 unique titles, 0 canonicals,
      h1=1 on every page.*
- [x] **W2 — CSS source of truth.** DONE `38d9a8a`. Extracted ~74 KB of inline `<style>`
      into `css/ia.css`, `css/datos.css`, `css/marketing.css`, byte-for-byte (SHA256
      matched pre-extraction). Fixed the nested `@media` in `css/iiot.css` — the imbalance
      was an extra opening brace at EOF, not a stray close. Bumped `iiot.css` to `?v=12`
      so the fix is not masked by cache. *Verified: brace delta 0 everywhere, no nested
      `@media`.*
- [x] **W3 — script.js coverage.** DONE `fcfd361`. Added to the 5 pages missing it, after
      confirming all 9 `init*` functions early-return on a missing target. *Verified: 9 of
      9 pages load it.* Note: those 5 pages have no hamburger/`.reveal` markup, so the
      script mostly no-ops there — parity restored, not features added.
- [x] **W4 — Orphan fragments.** DONE `dd24456`. Deleted `contact.html`, `projects.html`,
      `new_services.html`, `why_choose.html` — no doctype/head/body, 0 references, content
      already inlined in `index.html`. Recoverable via `git checkout`. *Verified: 9 pages
      remain, link baseline moved 136 → 124, 0 broken.*
- [x] **W5 — Accessibility.** DONE `fcfd361`. 6 FAQ `<div>` → `<button>` with
      `aria-expanded`/`aria-controls`; button CSS reset + `:focus-visible` in
      `landing-web.css`; 5 missing `alt` added (all 5 judged decorative — lightbox
      duplicates or permanently hidden modals); meta descriptions added to `servicio-iiot`
      and `proyecto-reservas`; IA leftover copy removed from the marketing CTA.
- [x] **W5b — Heading hierarchy.** DONE `061fd4d`. Added the `h3` selectors grouped with
      their `h4` twins (`X h3, X h4`) BEFORE promoting, since those headings are styled
      only by descendant tag selectors. Then promoted 49 card headings (12/21/16).
      *Verified: no `h2 → h4` jump remains on the three pages; every promoted heading has
      a covering rule; tag balance OK.* Remaining jumps on the other 6 pages come from
      hero/section structure and need an editorial decision, not a tag swap.
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
| W1 SEO repair | Done | `39f6716` |
| W2 CSS source of truth | Done | `38d9a8a` |
| W4 Orphan fragments | Done | `dd24456` |
| W5 Accessibility | Done | `fcfd361` |
| W5b Heading hierarchy | Done | `061fd4d` |
| W6 Newsletter | Blocked — needs product decision | — |

All work is on branch `fix/site-errors`, not yet pushed. Working tree clean.

## Known-baseline commands (regression gate)

```powershell
cd C:\Users\elcra\Desktop\MP
# titles: 9 unique, none equal
Get-ChildItem *.html | ForEach-Object { (Select-String -Path $_.Name -Pattern '<title>(.*?)</title>').Matches.Groups[1].Value }
# must be: 0 canonicals, 0 imgs without alt
Select-String -Path *.html -Pattern 'rel="canonical"'
Select-String -Path *.html -Pattern '<img(?![^>]*\salt=)[^>]*>'
# every page: desc=1 h1=1
Get-ChildItem *.html | ForEach-Object { "{0} desc={1} h1={2}" -f $_.Name,(Select-String -Path $_.Name -Pattern 'name=\"description\"').Count,(Select-String -Path $_.Name -Pattern '<h1').Count }
# css brace balance: all delta=0
Get-ChildItem css\*.css | ForEach-Object { $t=Get-Content $_.FullName -Raw; "{0} delta={1}" -f $_.Name,(([regex]::Matches($t,'\{')).Count-([regex]::Matches($t,'\}')).Count) }
# encoding: U+FFFD=0 everywhere; BOM expected only on servicio-desarrollo.html and servicio-paginas-web.html
# links: links=124 broken=0
```

## Repo hazards (not part of this feature)

- `C:\Users\elcra` — the entire home directory — is itself a git repo pointing at
  `https://github.com/crack2116/elcra.git`, with 0 commits and no `.gitignore`. A
  `git add .` from home would stage the whole user profile. MP is now a nested repo.
- `core.autocrlf=true` with no `.gitattributes`: `git restore` silently rewrites LF-only
  files as CRLF. Recover exact bytes with read-only `git show HEAD:<path>` piped through
  `cmd /c` redirection.
- Encoding is not uniform: `servicio-desarrollo.html` and `servicio-paginas-web.html`
  carry a UTF-8 BOM; the other 7 pages do not. Line endings are mixed in
  `index.html` and `servicio-desarrollo.html`.

## Next step

W6 — resolve the newsletter. It currently validates an address, toasts "Suscripción
exitosa", and delivers nothing. Needs a decision: real endpoint, WhatsApp handoff, or
removing the success claim.