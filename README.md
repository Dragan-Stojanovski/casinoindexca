# CasinoIndexCA

Static, multi-page site for a Canadian casino-review / consumer-auditing portal.
Clean futuristic white theme. No build step, no frameworks — just HTML, one CSS
design system, and one vanilla JS module. Deploys to GitHub Pages as-is.

## Structure

```
casinoindexca/
├── index.html                 # Home: hero, live metrics, region-switchable operator matrix
├── about.html                 # Authority: who we are + independence
├── methodology.html           # Authority: the Safety Index scoring model
├── responsible-gambling.html  # Authority: RG resources + ConnexOntario
├── contact.html               # Contact form (wire to a form handler)
├── privacy.html               # Legal template (review with counsel)
├── terms.html                 # Legal template (review with counsel)
├── 404.html                   # GitHub Pages custom 404
├── robots.txt
├── sitemap.xml
├── CNAME                      # custom domain (edit or delete)
├── .nojekyll
└── assets/
    ├── css/styles.css         # design system (CSS custom properties)
    ├── js/main.js             # region switcher + mobile nav
    └── img/                   # logos / imagery
```

## Regional compliance switcher

The header toggle (Canada RoC / Ontario) drives every element tagged
`data-region-view="roc|on"`. Ontario mode hides dollar figures, bonuses and
free-spin credits and shows licensing, registration numbers, Interac options and
verified payout times instead — in line with AGCO advertising standards. The
choice persists via `localStorage` and carries across pages. To auto-default
Ontario visitors, feed a server-side geo-IP result into `setRegion()`.

## Before you publish

- Replace placeholder operators (Northlane / Maple Royale / Vault7) and the
  `iGO-CA-0000000` registration numbers with **real, verified** data.
- Treat the dashboard metrics as your own index output; wire them to real data.
- Add named editors/credentials on the About page (E-E-A-T).
- Paste JSON-LD (Organization / Review / FAQ) where the HTML comments mark.
- Point the contact form `action` at a real handler.
- Have privacy.html and terms.html reviewed by a lawyer.

## Deploy (GitHub Pages)

1. Push the contents of `casinoindexca/` to a repo.
2. Settings → Pages → deploy from branch (root).
3. Edit or remove `CNAME` for your domain.
