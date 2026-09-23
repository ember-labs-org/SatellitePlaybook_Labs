# Satellite data for coal mine methane — interactive playbook (v4, experimental)

A self-contained interactive guide to choosing and interpreting satellite methane
data for coal mines. Built for Ember's coal mine methane programme.

**Live site:** enable GitHub Pages (below) and the app is served from `index.html`.

## Publish on GitHub Pages

1. Create a new repository (e.g. `satellite-playbook`) and upload the contents
   of this folder (`index.html`, `.nojekyll`, `README.md`).
2. In the repository: **Settings → Pages → Build and deployment**
   - Source: *Deploy from a branch*
   - Branch: `main`, folder `/ (root)` → **Save**
3. Wait ~1 minute. The app is live at
   `https://<username>.github.io/<repository>/`

To update: replace `index.html` with a newer build and commit.

### Custom domain (optional)
Add a `CNAME` DNS record pointing e.g. `playbook.ember-energy.org` to
`<username>.github.io`, then enter that domain in the Pages settings.
GitHub issues the HTTPS certificate automatically.

## Notes
- Everything is client-side; there is no backend. All map tiles (satellite
  imagery, streets/labels) load directly from third-party tile services in the
  visitor's browser.
- `.nojekyll` disables GitHub's Jekyll processing — keep it.
- This is the **experimental preview build**. Before a public launch, replace
  the unofficial satellite tile endpoint with a keyed provider and complete the
  attribution/fact-check docs (see project productionisation checklist).

## Data & credits (preview)
Plume detections and rasters: Carbon Mapper (Tanager-1) and NASA-JPL EMIT via
the Carbon Mapper data portal. Mine asset data: Global Energy Monitor, Global
Coal Mine Tracker (v1.0.2, May 2026). Basemap imagery © Google (preview
endpoint); streets & labels © Esri. Country comparison data: East et al. (2025),
Shen et al. (2023), Worden et al. (2022).
