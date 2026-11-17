#!/usr/bin/env python3
"""Refresh assets/data/news.json with fresh money, health and career headlines.
Runs daily from GitHub Actions (see update-news.yml). Standard library only."""
import json, re, sys, urllib.request, urllib.parse, html, email.utils, datetime, pathlib
import xml.etree.ElementTree as ET

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / 'assets' / 'data' / 'news.json'
QUERIES = {
    'Money': ['personal finance tips', 'retirement savings', 'mortgage rates', 'budgeting'],
    'Health': ['sleep health study', 'exercise health study', 'healthy eating research', 'mental health wellbeing'],
    'Career': ['job market workers', 'salary raise negotiation', 'remote work careers', 'side hustle income'],
}
BLOCK = re.compile(r'\b(crypto pump|casino|betting|onlyfans|xxx)\b', re.I)

def fetch(q):
    url = 'https://news.google.com/rss/search?' + urllib.parse.urlencode({'q': q + ' when:3d', 'hl': 'en-US', 'gl': 'US', 'ceid': 'US:en'})
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (HiLifeNewsBot)'})
    with urllib.request.urlopen(req, timeout=20) as r:
        return ET.fromstring(r.read())

def main():
    items, seen = [], set()
    for pillar, qs in QUERIES.items():
        for q in qs:
            try:
                root = fetch(q)
            except Exception as e:
                print('skip', q, e, file=sys.stderr)
                continue
            for it in root.iter('item'):
                title = html.unescape(it.findtext('title') or '').strip()
                link = (it.findtext('link') or '').strip()
                src = it.find('source')
                source = src.text.strip() if src is not None and src.text else ''
                if source and title.endswith(' - ' + source):
                    title = title[: -len(source) - 3]
                key = re.sub(r'\W+', '', title.lower())[:80]
                if not title or not link or key in seen or BLOCK.search(title):
                    continue
                seen.add(key)
                try:
                    dt = email.utils.parsedate_to_datetime(it.findtext('pubDate'))
                except Exception:
                    dt = datetime.datetime.now(datetime.timezone.utc)
                items.append({'title': title, 'url': link, 'source': source, 'pillar': pillar,
                              'date': dt.strftime('%b %d, %Y'), 'ts': int(dt.timestamp())})
    if len(items) < 10:
        print('Too few items; keeping existing file.')
        return
    items.sort(key=lambda x: -x['ts'])
    by = {}
    for i in items:
        by.setdefault(i['pillar'], [])
        if len(by[i['pillar']]) < 20:
            by[i['pillar']].append(i)
    out = sorted([i for v in by.values() for i in v], key=lambda x: -x['ts'])
    OUT.write_text(json.dumps(out, ensure_ascii=False, indent=1))
    print('wrote', len(out))

if __name__ == '__main__':
    main()
