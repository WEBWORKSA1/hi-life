# Hi.Life — Phase-by-Phase Build Prompts

Use these prompts in order (with Claude or any capable AI builder) to rebuild, extend or clone this site. Each phase is self-contained: paste the **Global context** block first, then the phase prompt.

---

## Global context (paste before every phase)

> You are building **Hi.Life** (domain: hi.life), a free "life-upgrade toolkit" covering six areas: Money, Health, Career, Home, Relationships, Mind. Static site on **GitHub Pages (free plan, main branch, root)** using Jekyll with one shared layout. Vanilla HTML/CSS/JS only, no build step, no frameworks, mobile-first, WCAG AA, Core Web Vitals friendly.
>
> Non-negotiables:
> - Brand is always written **"Hi.Life"** (with the dot). Never "HiLife" or "Hi-Life". No third-party logos or trade dress. Include a trademark/copyright disclosure stating no affiliation with any company named Hi-Life/HiLife/High Life.
> - Top of **every** page: a full-width bar linking to `https://web.works/contact` with the text "Contact, if you are interested in this website / domain name / Sponsorship / Advertisement / Partnership". The text must not show the URL.
> - All forms submit to **one** inbox through FormSubmit (AJAX endpoint, with a hidden-form fallback). The address is stored only as an XOR-encoded, reversed char-code array in `assets/js/config.js` and decoded at send time. The email address must never appear in HTML, visible text or plain JS.
> - Google AdSense: `<meta name="google-adsense-account" content="ca-pub-6620975821265271">` and `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6620975821265271" crossorigin="anonymous"></script>` in the `<head>` of every content page; `ads.txt` at root with `google.com, pub-6620975821265271, DIRECT, f08c47fec0942fa0`. Named ad slots (`in-content`, `sidebar`, `home-mid`, `tool-result`) render only when slot IDs are set in config.
> - Every page uses a relative `<base href>` so the same files work at `https://<user>.github.io/hi-life/` and at `https://hi.life/`.

---

## Phase 1 — Strategy & research

> Research at least 35 leading sites across personal finance tools (NerdWallet, Bankrate, SmartAsset, Calculator.net, Omni), retirement (Boldin, Empower, Fidelity, Vanguard), insurance (Policygenius, Northwestern Mutual), health (Healthline, Mayo Clinic, Sleep Foundation, MyFitnessPal), mind/habits (Headspace, Calm, James Clear, Wait But Why), career (The Muse, Glassdoor) and video (TED). For each, list the feature, form, content pattern or design element worth adopting. Then write `RESEARCH.md` with: the chosen concept and why it beats 3 alternatives (table with search demand, RPM, lead value, repeat visits), the full revenue model, the benchmark table, an AdSense approval checklist and a risk table.

## Phase 2 — Design system & shell

> Create `_config.yml`, `_layouts/default.html`, `_layouts/guide.html` and `assets/css/site.css`. Design: warm "sunrise" palette (ink #0f1b2d, paper #fffaf3, sun #ffb703, coral #ff5a4e, mint #16b8a6) with one colour per area (money mint, health coral, career blue, home amber, relationships pink, mind violet). Fonts: Sora for headings, Inter for body. Components: owner bar, sticky header with mega-menu of tools, burger menu under 980px, breadcrumbs, cards, pillar pills, buttons (sun/coral/ink/ghost), chips, panels, KPI tiles, progress bars, FAQ accordions, lead-CTA band, sticky lead bar, cookie notice, toast, footer with newsletter form, print styles and reduced-motion support. Add JSON-LD: Organization, WebSite+SearchAction, BreadcrumbList, Article, FAQPage, WebApplication.

## Phase 3 — Core JavaScript

> Write `assets/js/config.js` (encoded inbox, ad slot IDs, donation links, contest settings, toggles) and `assets/js/site.js`: base-safe in-page anchors; click-to-load YouTube (youtube-nocookie) with automatic fallback to a YouTube search link when a video ID is dead; nav + active state; self-updating date stamps; observance ribbon computed from a fixed-date list that rolls into next year; tip and quote of the day; saved Life Score widget; daily news rendering with trusted-source fallback; ad-slot filler; first-touch UTM/gclid attribution; FormSubmit sender with lead scoring (data-score), A/B/C grade in subject, Life Score attached, inline success or thank-you redirect; URL pre-fill; multi-step forms with progress and auto-advance; donation amount/frequency picker; contest countdown; share/copy/print/helpful votes; filter chips; guide table of contents; sticky lead bar after 40% scroll; site search over `search.json`; cookie notice.

## Phase 4 — Interactive tools (14)

> Build `assets/js/tools.js` and one page per tool, each with: hero, inputs panel (with currency selector where relevant), live results panel, "email me my results" capture, `tool-result` ad slot, lead CTA, 300–500 words of original explainer, 3 FAQs (with FAQ schema), related tools. Tools: Life Score quiz (12 questions, 6 areas, saves score, recommends weakest-area guide/tool/plan), Life in Weeks grid, Retirement & FIRE (projection chart, FIRE age, shortfall, required monthly saving), 50/30/20 Budget, Net Worth with private monthly snapshots, Debt Payoff (avalanche vs snowball vs minimums), Compound Interest (chart + yearly table), Emergency Fund (risk-adjusted months), Life Insurance (DIME), Home Affordability (28/36 and 25/33), Salary converter, Calories & BMI (Mifflin–St Jeor, metric/imperial), Sleep cycles, Habit tracker with streaks. All maths client-side; inputs remembered in localStorage.

## Phase 5 — Content (AdSense-grade)

> Write 14 original guides (700–900 words each, plain English, H2 structure, tables where useful, 2 FAQs, link to the matching tool and to the Life Upgrade Plan): emergency fund, budget that works, FIRE explained, net worth by age, get out of debt, start investing, life insurance basics, buy vs rent, raise your income, goals that stick, ten healthy habits, sleep better, 10-minute stress reset, stronger relationships. Health and money guides include "when to see a professional" and a not-advice note. Build `guides/index.html` with area filters and `_data/guides.yml` driving related-guide links.

## Phase 6 — Lead generation & monetisation pages

> Build `plan.html`: the Free Life Upgrade Plan — 4-step scored form (focus area → specific need + timeline → age/country/income/life stage/notes → name/email/optional phone/intro yes-no/consent), benefits column, "how it works", referral-fee disclosure, FAQ. Build `for-pros.html` (Pro Network application, scored), `advertise.html` (media kit request with budget scoring and a website/domain-acquisition option), `support.html` (one-time/monthly picker, allocation cards for operations, talent, prizes and promotion, pledge fallback form), `contests.html` (prize cards, countdown, entry form, official-rules summary, sponsor CTA), `careers.html` (roles + application form).

## Phase 7 — Trust, legal & utility pages

> Build About, Contact (form only, no email shown), Privacy (Google advertising-cookie wording with opt-out links, consent message note, local-storage explanation, one-professional sharing with consent, rights under GDPR/CCPA/PIPEDA/DPDP), Terms, Disclaimer (not advice, health emergency note, ad/referral disclosure), Editorial Policy, Trademark & Copyright Disclosure (no affiliation with Hi-Life/HiLife brands, nominative use, embedded media, DMCA process), Thank-you (message by form type), Search, 404. Add `sitemap.xml` and `search.json` generated by Liquid, `robots.txt`, `ads.txt`, `site.webmanifest`, logo/favicon/OG SVGs.

## Phase 8 — Automation (self-updating)

> Add `automation/fetch_news.py` (standard library only) that pulls fresh Money, Health and Career headlines from Google News RSS, de-duplicates, filters spam terms, keeps 20 per area and writes `assets/data/news.json`; and `automation/update-news.yml`, a daily GitHub Actions workflow that runs it and commits changes. In the browser: tip/quote of the day, observance ribbon, dates and copyright year update automatically.

## Phase 9 — QA & launch

> Check every internal link resolves, every JS file parses, no page contains the inbox address in plain text, all forms have labels and honeypots, Lighthouse ≥ 90 on mobile, and the site renders at 360px. Push to `main`, enable Pages (Deploy from branch → main → root), add the custom domain `hi.life` with the four GitHub A records and a `www` CNAME, enforce HTTPS, activate FormSubmit with the first submission, add the site in AdSense, turn on Auto ads and the EEA/UK consent message, submit `sitemap.xml` to Google Search Console.

## Phase 10 — Growth (after approval)

> Add display slot IDs to `config.js`; add payment links; recruit 10 professionals per high-value category for the Pro Network; launch the contest with a sponsor; publish 4 new guides a month targeting long-tail "how much / calculator / vs" queries; add country versions of the money tools (CA, UK, IN, AU); add PDF downloads of plans as lead magnets; A/B test the plan form's first step.
