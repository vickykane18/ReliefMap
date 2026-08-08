# ReliefMap — Navbar Optimization Tasks

## Goal
Optimize the navbar across all pages: remove clutter that causes overlap/messy layout, remove the search option, and fix the date/time positioning.

## Tasks
- [x] Remove search form (`<form class="nav-search" id="searchForm">`) from `index.html`
- [x] Remove search form from `map.html`
- [x] Remove search form from `ai.html`
- [x] Remove search form from `analytics.html`
- [x] Remove search form from `news.html`
- [x] Remove search form from `profile.html`
- [x] Remove search form from `settings.html`
- [x] Remove search form from `contact.html`
- [x] Fix `css/navbar.css` — date/time (nav-center) positioning + responsive decluttering (right side)
- [x] Remove search JS from `js/layout.js` (dead `searchForm`/`globalSearch`/`searchList`/`SEARCH_ENTRIES` code removed entirely)
- [x] Verify pages load cleanly (backend serving + no console errors)

## Additional Completed
- [x] Theme pre-paint script added to all 9 themed pages (ai, analytics, contact, index, login, map, news, profile, settings) to prevent light/dark flash
- [x] `offline.html` intentionally skipped (uses inline dark styling, no theme system)
- [x] All JS files pass `node --check` (syntax valid)
- [x] Backend healthy: `/` returns status Running, `/aoi/stats` returns success:true
