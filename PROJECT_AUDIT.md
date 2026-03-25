# Tencent.pk Project Audit

Date: 2026-03-25

## Scope

This audit is based on the full repository in its current state. The project is a static website with:

- Main landing page: `index.html`
- Urdu landing page: `ur/index.html`
- News page: `news/index.html`
- Static legal/content pages under `static-page/`
- Client-side logic in `script.js` and `structuredData.js`
- Static assets only; no backend application code is present

## Executive Summary

The site is operationally simple, but it has several high-risk issues:

1. Security headers are effectively not configured.
2. The news page allows arbitrary external URLs to be loaded in an iframe via query parameters.
3. The primary conversion flow is manual WhatsApp redirection rather than a controlled checkout/order system.
4. Aggressive anti-user JavaScript blocks inspection, right-click, and keyboard shortcuts, which hurts trust, accessibility, debugging, and conversion quality.
5. Structured data is inaccurate and includes placeholder business data and offer URLs that do not exist.
6. SEO foundations exist, but the implementation is inconsistent and weak for scalable organic growth.

## Positives

- Core pages have title and description tags.
- Main English and Urdu pages include canonical and hreflang tags: `index.html:56`, `ur/index.html:24`
- A sitemap and robots file exist: `sitemap.xml`, `robots.txt`
- Images use modern formats in key product blocks.
- Package imagery uses `loading="lazy"` on the main page.

## Top Priority Findings

### 1. Broken `_headers` file means security and caching headers are likely not applied

Severity: Critical

Evidence:

- `_headers:1`
- `_headers:2`
- `_headers:3`

Issue:

The `_headers` file appears to contain only an opening comment plus header-like text:

- `/*`
- `X-Robots-Tag: index, follow`
- `Cache-Control: public, max-age=86400, must-revalidate`

There is no route declaration and no valid header block syntax. On hosts like Netlify, this means the file does not configure headers as intended.

Impact:

- No `Content-Security-Policy`
- No `X-Frame-Options` or `frame-ancestors` protection
- No `Referrer-Policy`
- No `Permissions-Policy`
- No `X-Content-Type-Options`
- Cache behavior is not explicitly controlled

Recommendation:

- Replace `_headers` with valid host-specific syntax.
- Add a restrictive CSP and explicit security headers.
- Set sensible static asset caching and shorter HTML caching.

### 2. Arbitrary external URL loading on `/news/`

Severity: Critical

Evidence:

- `script.js:178`
- `news/index.html:165`

Issue:

The homepage builds a news URL using `?url=...`, and the news page directly assigns that query parameter to the iframe source:

- redirect builder in `script.js`
- `iframe.src = url` in `news/index.html:165`

Impact:

- Users can be sent to `https://tencent.pk/news/?url=<any-external-site>`
- This can be abused for phishing, trust hijacking, and malware framing attempts
- The page becomes an open framing surface under your domain

Recommendation:

- Do not accept arbitrary `url` parameters.
- Store allowed article IDs only, then resolve them against a strict allowlist.
- If external content must be shown, open it off-site with a clear outbound warning instead of framing it.

### 3. Transaction flow is not a real checkout system

Severity: Critical

Evidence:

- `script.js:42`
- `index.html:261`

Issue:

The main purchase flow sends users to WhatsApp with a prefilled message. There is no backend validation, order record, payment status tracking, fraud control, inventory logic, or auditable fulfillment flow in this repository.

Impact:

- No reliable order lifecycle
- No server-side validation of player ID, package, or pricing
- No analytics quality for completed conversions
- Poor scalability for support, refunds, disputes, and reconciliation

Recommendation:

- If this is a real commerce operation, move ordering and payment confirmation to a backend-backed flow.
- Keep WhatsApp as support, not as the primary checkout mechanism.

### 4. Anti-debug / anti-user JavaScript is harmful

Severity: High

Evidence:

- `script.js:63`
- `script.js:86`
- `script.js:91`

Issue:

The site:

- wipes the page when DevTools is detected
- redirects users away after countdown
- disables right-click
- blocks `F12`, `Ctrl+Shift+I`, `Ctrl+U`, `Ctrl+S`

Impact:

- Damages trust on a payment-oriented site
- Breaks accessibility and standard browser behavior
- Interferes with QA, support, SEO debugging, and legitimate user workflows
- Can trigger false positives on small screens or docked devtools

Recommendation:

- Remove this logic entirely.
- Protect the site with real security controls, not client-side obstruction.

### 5. Inaccurate and potentially harmful structured data

Severity: High

Evidence:

- `structuredData.js:53`
- `structuredData.js:56`
- `structuredData.js:63`

Issue:

Structured data contains:

- placeholder address: `Your Business Address`
- offer URLs like `https://tencent.pk/60-uc` that do not exist
- pricing that does not match the landing page pricing

Examples:

- `index.html` shows `60 UC` at `280 PKR`
- `structuredData.js` declares `60 UC` at `250`

Impact:

- Rich result eligibility risk
- Search engine distrust due to inconsistent merchant data
- Merchant/product data may be ignored or flagged

Recommendation:

- Remove invalid schema immediately or correct it fully.
- Only publish schema that matches actual page content and real URLs.

### 6. Third-party ad scripts on primary commerce pages create security, UX, and performance risk

Severity: High

Evidence:

- `index.html:293`
- `index.html:334`
- `index.html:339`
- `news/index.html:118`
- `news/index.html:144`

Issue:

The site loads multiple third-party ad scripts from ad networks on core pages, including the landing page and news page.

Impact:

- Slower load and layout instability
- Higher privacy exposure
- Additional supply-chain risk
- Lower trust during purchase intent
- Potential conflict with future CSP hardening

Recommendation:

- Remove ads from transactional pages.
- If ads remain, isolate them to non-transactional content pages and review each vendor carefully.

## Other Findings

### 7. Broken or placeholder social links

Severity: Medium

Evidence:

- `index.html:378`
- `index.html:380`
- `index.html:382`
- `index.html:384`
- `index.html:386`

Issue:

Footer social links use `href="#"`.

Impact:

- Poor UX
- Trust loss
- Crawl waste

Recommendation:

- Replace with real profile URLs or remove the icons.

### 8. Asset path case mismatch may break in production depending on host behavior

Severity: Medium

Evidence:

- `index.html:397`
- actual file in repo: `static/images/footer/Raast-Logo.png`

Issue:

The markup references `Raast-logo.png`, but the repository contains `Raast-Logo.png`.

Impact:

- Broken image risk on case-sensitive deployment targets/CDNs

Recommendation:

- Normalize asset file names and references.

### 9. Maintenance page stylesheet path is wrong

Severity: Medium

Evidence:

- `static-page/maintenance/index.html:15`

Issue:

The page references `style.min.css` relatively, which resolves to `static-page/maintenance/style.min.css`. That file does not exist in the repository.

Impact:

- Broken styling if the page is used

Recommendation:

- Use `/style.min.css` or `../../style.min.css`.

### 10. Inline scripts and styles reduce maintainability and make CSP harder

Severity: Medium

Evidence:

- `index.html:61`
- `index.html:283`
- `index.html:314`
- `index.html:332`
- `news/index.html:108`
- `news/index.html:134`
- `news/index.html:151`

Issue:

The project relies heavily on inline CSS and inline JS blocks.

Impact:

- Harder CSP deployment
- Harder reuse and testing
- More brittle page maintenance

Recommendation:

- Move inline code to external versioned assets.

### 11. Legal content appears outdated and inconsistent

Severity: Medium

Evidence:

- `static-page/terms/index.html:74`
- `static-page/privacy/index.html:101`
- `static-page/how-to-buy/index.html:100`

Issue:

- Terms page says `Version as of August 25, 2023`
- Privacy says `Last modified: August 2025`
- How-to-buy footer still says `2023`

Impact:

- Weak compliance posture
- Trust issues for payments and data handling

Recommendation:

- Review legal text with actual business entity, current dates, and actual data practices.

## SEO Audit

## What is already in place

- `robots.txt` exists and allows crawling.
- `sitemap.xml` exists.
- Main EN/UR pages have canonical and hreflang.
- Key pages have title and description tags.
- Open Graph and Twitter tags exist on several pages.

## SEO Issues

### A. Structured data is invalid/inconsistent

Severity: High

Evidence:

- `structuredData.js:53`
- `structuredData.js:56`
- `structuredData.js:63`

Impact:

- Rich result failures
- Merchant/product trust issues

### B. News content is not indexable as individual content assets

Severity: High

Evidence:

- `script.js:122`
- `script.js:178`
- `news/index.html:165`

Issue:

News is fetched client-side from a third-party endpoint and article detail is rendered through an iframe URL parameter. There are no dedicated crawlable article pages in the repository.

Impact:

- Weak topical authority
- No stable URLs for articles
- Minimal long-tail organic traffic potential

Recommendation:

- Generate first-party article pages with static HTML.
- Each article should have unique title, description, canonical, schema, and internal links.

### C. `meta keywords` is still present

Severity: Low

Evidence:

- `index.html:46`
- `static-page/how-to-buy/index.html:9`

Issue:

`meta keywords` is obsolete and ignored by modern search engines.

Recommendation:

- Remove it and focus on title, description, headings, content quality, internal linking, and schema accuracy.

### D. Over-optimized / repetitive copy on the homepage

Severity: Medium

Evidence:

- `index.html` introductory paragraphs repeat the same purchase intent phrases multiple times.

Issue:

The copy appears written primarily for keyword insertion rather than information gain.

Impact:

- Lower content quality signals
- Reduced trust and conversion quality

Recommendation:

- Reduce repetition.
- Add clear trust, fulfillment, payment, refund, support, and process information instead.

### E. News page lacks canonical strategy for query-string variants

Severity: Medium

Evidence:

- `news/index.html`

Issue:

The page can generate many query-string URLs but does not define a canonical for them.

Impact:

- Duplicate URL variants
- Crawl inefficiency

Recommendation:

- Replace query-param article rendering with static article routes.

### F. Thin static content pages

Severity: Medium

Evidence:

- `static-page/how-to-buy/index.html`

Issue:

This page has basic content but limited depth, no structured FAQ schema, and weak internal navigation.

Recommendation:

- Expand with real transactional guidance, FAQ schema, troubleshooting, payment timing, refund policy, and screenshots.

### G. Missing stronger trust and local business signals

Severity: Medium

Issue:

The site does not clearly publish a trustworthy business profile in crawlable markup and content.

Recommendation:

- Publish consistent business name, entity, contact details, support hours, and service coverage.
- If you cannot publish a real physical address, avoid fake address schema.

## Performance and UX Audit

### Main issues

- Too many third-party scripts on landing pages
- Ads competing with purchase intent
- Inline scripts/styles reducing cache efficiency
- Multiple remote assets from CDNs and ad networks
- Potential layout shift from injected scripts/widgets

### Good decisions already present

- Several product images are offered in AVIF/WebP
- Main JS is deferred
- Main package images are lazy-loaded

## Architecture Assessment

Current state:

- Static brochure/landing site
- Client-side enhancement only
- No backend order system
- No CMS
- No build system visible

This is acceptable for a lightweight marketing site, but weak for a real commerce workflow.

## Should You Convert This To A Web App?

Short answer:

- Not necessarily for the public marketing pages
- Yes, if you want reliable ordering, payment verification, support workflows, customer status, and scalable operations

### Keep as a static website if:

- WhatsApp/manual fulfillment is intentional
- Order volume is low
- You only need landing pages plus informational content
- You are not automating payment verification or delivery

### Convert to a web app if you want:

- Real checkout and payment confirmation
- Order history and status tracking
- Fraud checks and server-side validation
- Customer accounts
- Admin dashboard for order operations
- Inventory/package management
- Support ticketing
- Better analytics on funnel completion

### Recommended direction

Use a hybrid model:

1. Keep public landing/content pages statically rendered for speed and SEO.
2. Build a backend-backed order flow for checkout, payment verification, and fulfillment.
3. Add an internal admin panel instead of exposing complexity on the marketing pages.

This gives you:

- good SEO
- better reliability
- safer transactions
- lower operational overhead

## Improvement Plan

## Phase 1: Immediate fixes

1. Replace `_headers` with valid security and caching headers.
2. Remove arbitrary iframe URL loading on `/news/`.
3. Remove anti-debug and keyboard-blocking code from `script.js`.
4. Remove or correct invalid schema in `structuredData.js`.
5. Remove ads from `index.html`.
6. Fix broken/placeholder social links.
7. Fix wrong asset path casing and maintenance stylesheet path.

## Phase 2: SEO and trust foundation

1. Create a real business information block across the site.
2. Rewrite homepage copy for clarity, trust, and conversion.
3. Expand `static-page/how-to-buy/index.html` into a detailed help resource.
4. Add FAQ schema only where answers are visible on page.
5. Build proper article pages instead of iframe-based news.
6. Add internal linking between homepage, help, legal, and news content.

## Phase 3: Commerce maturity

1. Introduce a backend order API.
2. Store package catalog server-side.
3. Validate player IDs and prices server-side.
4. Integrate payment confirmation workflow.
5. Add order status page and admin dashboard.
6. Keep WhatsApp as support/escalation, not primary checkout.

## Phase 4: Engineering quality

1. Introduce a build pipeline for minification and asset versioning.
2. Separate source and generated assets cleanly.
3. Add automated link checking and HTML validation in CI.
4. Add Lighthouse and structured-data validation checks before deploy.
5. Centralize metadata generation across pages.

## Practical Recommendation

If the near-term goal is growth and credibility, do this first:

1. Fix security headers.
2. remove the anti-user JavaScript.
3. remove ads from purchase pages.
4. fix schema and trust signals.
5. redesign the order flow so WhatsApp is not the checkout.

If the medium-term goal is scale, convert only the order and admin parts into a web app. Keep the marketing/content surface statically rendered.

## Final Assessment

The current project is best described as a static sales landing site, not a proper commerce platform. It can continue as a website for lightweight lead generation, but it should not remain in its current form if you want:

- stronger SEO growth
- safer transactions
- higher trust
- better conversion measurement
- scalable operations

The highest-value next step is a hybrid rebuild: static SEO pages plus a backend-driven ordering workflow.
