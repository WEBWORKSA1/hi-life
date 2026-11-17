# Hi.Life

The free life-upgrade toolkit: a 2-minute **Life Score**, 16 more private calculators (retirement & FIRE with a 1,000-scenario stress test, years to freedom, am I on track, how long will my money last, budget, net worth, debt payoff, compound interest, emergency fund, life insurance, home affordability, salary, calories & BMI, sleep, habits, life in weeks), 14 plain-English guides, curated videos, daily news, and a free **Life Upgrade Plan** that turns high-intent visitors into scored leads.

Static Jekyll site. Hosted free on GitHub Pages from `main` (root).

- `RESEARCH.md`: concept, revenue model, a 40-site visit log (what each site does and what Hi.Life adopted), AdSense checklist, risks
- `PROMPTS.md`: phase-by-phase prompts to rebuild or extend the site

## How it is built

| Path | What it holds |
| --- | --- |
| `*.html` (root) | Pages. Front matter sets title, description, `tool: true` for calculators, `faq:` for FAQ schema |
| `guides/*.md` | Guides in Markdown. Copy one to add a guide, then add a row to `_data/guides.yml` |
| `_layouts/` | `default.html` (owner bar, header, AdSense, schema, footer) and `guide.html` |
| `assets/js/config.js` | Encoded form inbox, AdSense slot IDs, payment links, contest settings |
| `assets/js/site.js` | Forms + lead scoring, attribution, self-updating widgets, search, video loader |
| `assets/js/tools.js` | All 17 interactive tools, CSV export, stress test |
| `_data/methods.yml` | Formula, assumptions and sources shown under every tool and on `methodology.html` |
| `assets/data/*.json` | Tips, quotes, observances, news |
| `automation/` | Daily news refresh (GitHub Actions) |
| `sitemap.xml`, `search.json` | Generated automatically by Jekyll from all pages |

Every page writes a relative `<base href>`, so the same files work at `https://webworksa1.github.io/hi-life/` and at `https://hi.life/`.

## Self-updating parts

- **Embeds:** any tool works inside other sites with `?embed=1`; codes on `embed.html`.
- **Every visit (browser):** upgrade-of-the-day tip, quote of the day, next life observance ribbon (rolls into next year by itself), dates, copyright year, contest countdown.
- **Daily (GitHub Actions, after step 5):** fresh Money, Health and Career headlines on `news.html` and the home page. Until then, trusted-source links show instead.
- **On every push:** Jekyll rebuilds pages, sitemap, search index and cache-busting asset versions.

## One-time setup checklist

1. **Publish from main.** Settings → Pages → Build and deployment → *Deploy from a branch* → `main` / `(root)` → Save.
2. **Custom domain** (required for AdSense approval): Settings → Pages → Custom domain `hi.life` → Save. At the registrar set A records to `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153` and a `www` CNAME to `webworksa1.github.io`. Tick *Enforce HTTPS* once the certificate is issued.
3. **Forms:** submit any form once. FormSubmit sends a one-time activation email to the site inbox; click *Activate*. The address is stored encoded in `assets/js/config.js` and never appears in page source.
4. **AdSense:** add `hi.life` in AdSense, keep `ads.txt` at the root, turn on Auto ads, enable Google's consent message for EEA/UK/Switzerland. After approval, paste slot IDs into `adSlots` in `config.js`.
5. **Automation:** Add file → Create new file → `.github/workflows/update-news.yml`, paste the contents of `automation/update-news.yml`, commit. Then Actions → *Update life news* → Run workflow.
6. **Payments:** paste PayPal / Stripe / Buy Me a Coffee links into `donate` in `config.js`. Until then the Support page collects pledges.

## Trademark & copyright

Original content © Hi.Life. Hi.Life is independent and not affiliated with any company named Hi-Life, HiLife or High Life. Third-party names are trademarks of their owners, used for identification only. Embedded videos remain the property of their creators. Full disclosure: `legal.html`.

Website, domain, sponsorship, advertising and partnership enquiries: https://web.works/contact
