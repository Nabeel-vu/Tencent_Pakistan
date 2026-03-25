import datetime as dt
import hashlib
import html
import json
import pathlib
import re
import urllib.request
from urllib.parse import quote


ROOT = pathlib.Path(__file__).resolve().parents[1]
NEWS_DIR = ROOT / "news"
BASE_URL = "https://tencent.pk"
NEWS_SECTION_ID = "91088"
PAGE_LANG = "en"
SERVICE = "PUBGMOBILE"
API_BASE = (
    "https://publicfaas.vasdgame.com/hw/backendapi/"
    "?namespace=Faas&useSign=1&service=pubgmobile&pdr_appid=3157&env=prod&cluster=sg"
)


def api_request(fn: str, body: dict) -> dict:
    payload = {
        "userId": "1",
        "sectionType": "3",
        "contentPlat": "h5",
        "type": ["3", "4", "5", "6"],
        "lang": [PAGE_LANG],
    }
    payload.update(body)
    raw = json.dumps(payload, separators=(",", ":"))
    sign_base = f"service={SERVICE}&fn={fn.upper()}&body={raw}"
    sign = hashlib.md5(sign_base.encode("utf-8")).hexdigest()
    url = f"{API_BASE}&fn={fn}&sign={sign}"
    req = urllib.request.Request(
        url,
        data=raw.encode("utf-8"),
        headers={
            "Content-Type": "application/json",
            "X-PANDORA-ENV": "PROD",
            "User-Agent": "Mozilla/5.0",
        },
    )
    with urllib.request.urlopen(req, timeout=30) as response:
        data = json.load(response)
    if data.get("code") != 0 or data.get("data", {}).get("code") != 0:
        raise RuntimeError(f"Unexpected API response for {fn}: {data}")
    return data["data"]["data"]


def get_listing(limit: int = 12) -> list[dict]:
    data = api_request(
        "getPubgmSection",
        {
            "sortBy": "timeDesc",
            "offset": 0,
            "limit": limit,
            "sectionId": [NEWS_SECTION_ID],
            "use_default_lang": False,
        },
    )
    return data.get("list", [])


def get_detail(item: dict) -> dict:
    data = api_request(
        "getPostDetailsPGC",
        {
            "groupId": item["groupId"],
            "postId": item["_id"],
            "use_default_lang": False,
        },
    )
    return data.get("post", {})


def slugify(value: str) -> str:
    value = value.lower()
    value = re.sub(r"[^a-z0-9]+", "-", value)
    return value.strip("-") or "news-item"


def strip_tags(value: str) -> str:
    value = re.sub(r"<script.*?</script>", "", value, flags=re.I | re.S)
    value = re.sub(r"<style.*?</style>", "", value, flags=re.I | re.S)
    value = re.sub(r"<[^>]+>", " ", value)
    value = html.unescape(value)
    value = re.sub(r"\s+", " ", value).strip()
    return value


def sanitize_html(value: str) -> str:
    value = re.sub(r"<script.*?</script>", "", value, flags=re.I | re.S)
    value = re.sub(r"<style.*?</style>", "", value, flags=re.I | re.S)
    value = re.sub(r"<iframe.*?</iframe>", "", value, flags=re.I | re.S)
    value = re.sub(r"\son\w+\s*=\s*\"[^\"]*\"", "", value, flags=re.I)
    value = re.sub(r"\son\w+\s*=\s*'[^']*'", "", value, flags=re.I)
    value = re.sub(r"\sstyle\s*=\s*\"[^\"]*\"", "", value, flags=re.I)
    value = re.sub(r"\sstyle\s*=\s*'[^']*'", "", value, flags=re.I)
    value = re.sub(r"\s(width|height|class|id)\s*=\s*\"[^\"]*\"", "", value, flags=re.I)
    value = re.sub(r"\s(width|height|class|id)\s*=\s*'[^']*'", "", value, flags=re.I)
    value = re.sub(r"\shref\s*=\s*\"[^\"]*\"", "", value, flags=re.I)
    value = re.sub(r"\shref\s*=\s*'[^']*'", "", value, flags=re.I)
    value = re.sub(r"javascript:", "", value, flags=re.I)
    value = re.sub(
        r"<a\s+([^>]*href=['\"]https?://[^'\"]+['\"][^>]*)>",
        r'<a \1 rel="noopener noreferrer" target="_blank">',
        value,
        flags=re.I,
    )
    value = re.sub(r"<span[^>]*>", "", value, flags=re.I)
    value = re.sub(r"</span>", "", value, flags=re.I)
    return value


def format_date(value: str) -> str:
    date = dt.datetime.fromisoformat(value.replace("Z", "+00:00"))
    return date.strftime("%Y-%m-%d")


def build_source_url(item: dict) -> str:
    return (
        "https://www.pubgmobile.com/en-US/news-detail.shtml"
        f"?gid={quote(item['groupId'])}&pid={quote(item['_id'])}&from=news"
    )


def build_summary(detail_html: str, title: str) -> str:
    text = strip_tags(detail_html)
    if text:
        return text[:200].rstrip() + ("..." if len(text) > 200 else "")
    return f"Read the latest official PUBG Mobile announcement: {title}."


def get_detail_html(detail: dict) -> str:
    content = detail.get("content", "")
    if isinstance(content, dict):
        return content.get("content", "")
    if isinstance(content, str):
        return content
    return ""


def render_listing(items: list[dict]) -> str:
    cards = []
    for item in items:
        image_html = ""
        if item["image"]:
            image_html = (
                f'<img src="{html.escape(item["image"])}" '
                f'alt="{html.escape(item["title"])}" loading="lazy">'
            )
        cards.append(
            f"""
        <article class="announcement-card">
          <a class="news-card-link" href="/news/{item['slug']}/">
            {image_html}
            <p class="news-card-date">{html.escape(item["date"])}</p>
            <h2>{html.escape(item["title"])}</h2>
            <p>{html.escape(item["summary"])}</p>
            <span class="lnk-btn">Read Article</span>
          </a>
        </article>
            """.strip()
        )

    cards_html = "\n".join(cards)
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="robots" content="index,follow">
  <title>PUBG Mobile News in Pakistan | Tencent PK</title>
  <meta name="description" content="Read the latest PUBG Mobile updates, patch notes, announcements, and event news curated from official PUBG Mobile sources.">
  <link rel="canonical" href="{BASE_URL}/news/">
  <meta property="og:title" content="PUBG Mobile News in Pakistan | Tencent PK">
  <meta property="og:description" content="Read the latest PUBG Mobile updates, patch notes, announcements, and event news curated from official PUBG Mobile sources.">
  <meta property="og:type" content="website">
  <meta property="og:url" content="{BASE_URL}/news/">
  <meta property="og:image" content="{BASE_URL}/static/images/Tencent-logo.webp">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="PUBG Mobile News in Pakistan | Tencent PK">
  <meta name="twitter:description" content="Read the latest PUBG Mobile updates, patch notes, announcements, and event news curated from official PUBG Mobile sources.">
  <meta name="twitter:image" content="{BASE_URL}/static/images/Tencent-logo.webp">
  <link rel="stylesheet" href="/style.min.css">
  <link rel="stylesheet" href="/containers.min.css">
  <style>
    .news-page {{
      max-width: 1100px;
      margin: 0 auto;
      padding: 30px 20px 50px;
    }}
    .news-intro {{
      margin-bottom: 25px;
      line-height: 1.7;
    }}
    .news-grid {{
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 20px;
    }}
    .news-card-link {{
      display: block;
      color: inherit;
      text-decoration: none;
    }}
    .announcement-card {{
      background: #262626;
      border: 1px solid #3a3a3a;
      border-radius: 12px;
      padding: 18px;
      height: 100%;
    }}
    .announcement-card img {{
      width: 100%;
      height: auto;
      border-radius: 8px;
      margin-bottom: 12px;
    }}
    .news-card-date {{
      color: #bbb;
      font-size: 13px;
      margin: 0 0 8px;
    }}
    .announcement-card h2 {{
      font-size: 22px;
      margin: 0 0 10px;
    }}
    .announcement-card p {{
      color: #ddd;
      line-height: 1.6;
    }}
    .announcement-card .lnk-btn {{
      margin-left: 0;
      margin-top: 10px;
    }}
  </style>
</head>
<body>
  <main class="news-page">
    <p><a href="/" class="lnk-btn">Back to Home</a></p>
    <h1>PUBG Mobile News in Pakistan</h1>
    <p class="news-intro">
      This page automatically republishes the latest official PUBG Mobile announcements into crawlable pages on Tencent.pk.
      Each article links back to its original official source.
    </p>
    <section class="news-grid">
      {cards_html}
    </section>
  </main>
</body>
</html>
"""


def render_article(item: dict) -> str:
    image_html = ""
    if item["image"]:
        image_html = (
            f'<p><img src="{html.escape(item["image"])}" '
            f'alt="{html.escape(item["title"])}" loading="lazy"></p>'
        )
    article_schema = {
        "@context": "https://schema.org",
        "@type": "NewsArticle",
        "headline": item["title"],
        "datePublished": item["date"],
        "dateModified": item["date"],
        "image": [item["image"]] if item["image"] else [],
        "mainEntityOfPage": f"{BASE_URL}/news/{item['slug']}/",
        "author": {"@type": "Organization", "name": "Tencent PK"},
        "publisher": {
            "@type": "Organization",
            "name": "Tencent PK",
            "logo": {
                "@type": "ImageObject",
                "url": f"{BASE_URL}/logo.webp",
            },
        },
        "description": item["summary"],
    }
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="robots" content="index,follow">
  <title>{html.escape(item["title"])} | Tencent PK</title>
  <meta name="description" content="{html.escape(item["summary"])}">
  <link rel="canonical" href="{BASE_URL}/news/{item['slug']}/">
  <meta property="og:title" content="{html.escape(item["title"])} | Tencent PK">
  <meta property="og:description" content="{html.escape(item["summary"])}">
  <meta property="og:type" content="article">
  <meta property="og:url" content="{BASE_URL}/news/{item['slug']}/">
  <meta property="og:image" content="{html.escape(item["image"] or f"{BASE_URL}/static/images/Tencent-logo.webp")}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="{html.escape(item["title"])} | Tencent PK">
  <meta name="twitter:description" content="{html.escape(item["summary"])}">
  <meta name="twitter:image" content="{html.escape(item["image"] or f"{BASE_URL}/static/images/Tencent-logo.webp")}">
  <link rel="stylesheet" href="/style.min.css">
  <script type="application/ld+json">{json.dumps(article_schema, ensure_ascii=False)}</script>
  <style>
    .article-page {{
      max-width: 860px;
      margin: 0 auto;
      padding: 30px 20px 50px;
      line-height: 1.7;
    }}
    .article-date {{
      color: #bbb;
      margin-top: -5px;
    }}
    .article-card {{
      background: #262626;
      border: 1px solid #3a3a3a;
      border-radius: 12px;
      padding: 24px;
    }}
    .article-card img {{
      max-width: 100%;
      height: auto;
      border-radius: 10px;
    }}
    .article-body {{
      color: #e7e7e7;
    }}
    .article-body p {{
      margin-bottom: 16px;
    }}
    .article-body a {{
      color: #ffcc00;
    }}
    .article-actions {{
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
      margin-bottom: 20px;
    }}
  </style>
</head>
<body>
  <main class="article-page">
    <div class="article-actions">
      <a href="/news/" class="lnk-btn">All News</a>
      <a href="/" class="lnk-btn">Home</a>
      <a href="{html.escape(item["source_url"])}" class="lnk-btn" target="_blank" rel="noopener noreferrer">Official Source</a>
    </div>
    <article class="article-card">
      <h1>{html.escape(item["title"])}</h1>
      <p class="article-date">Published: {html.escape(item["date"])}</p>
      {image_html}
      <div class="article-body">
        {item["content_html"]}
      </div>
      <p>This article is automatically generated from an official PUBG Mobile announcement feed and links to the original source above.</p>
    </article>
  </main>
</body>
</html>
"""


def write_sitemap(items: list[dict]) -> None:
    lines = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
        '        xmlns:xhtml="http://www.w3.org/1999/xhtml">',
        "",
        "  <url>",
        f"    <loc>{BASE_URL}/</loc>",
        "    <changefreq>daily</changefreq>",
        "    <priority>1.0</priority>",
        f'    <xhtml:link rel="alternate" hreflang="en" href="{BASE_URL}/"/>',
        f'    <xhtml:link rel="alternate" hreflang="ur" href="{BASE_URL}/ur/"/>',
        "  </url>",
        "",
        "  <url>",
        f"    <loc>{BASE_URL}/ur/</loc>",
        "    <changefreq>daily</changefreq>",
        "    <priority>0.9</priority>",
        f'    <xhtml:link rel="alternate" hreflang="ur" href="{BASE_URL}/ur/"/>',
        f'    <xhtml:link rel="alternate" hreflang="en" href="{BASE_URL}/"/>',
        "  </url>",
        "",
        "  <url>",
        f"    <loc>{BASE_URL}/static-page/terms/</loc>",
        "    <changefreq>monthly</changefreq>",
        "    <priority>0.5</priority>",
        "  </url>",
        "",
        "  <url>",
        f"    <loc>{BASE_URL}/static-page/privacy/</loc>",
        "    <changefreq>monthly</changefreq>",
        "    <priority>0.5</priority>",
        "  </url>",
        "",
        "  <url>",
        f"    <loc>{BASE_URL}/static-page/how-to-buy/</loc>",
        "    <changefreq>weekly</changefreq>",
        "    <priority>0.7</priority>",
        "  </url>",
        "",
        "  <url>",
        f"    <loc>{BASE_URL}/news/</loc>",
        "    <changefreq>daily</changefreq>",
        "    <priority>0.8</priority>",
        "  </url>",
        "",
    ]
    for item in items:
        lines.extend(
            [
                "  <url>",
                f"    <loc>{BASE_URL}/news/{item['slug']}/</loc>",
                "    <changefreq>weekly</changefreq>",
                "    <priority>0.7</priority>",
                "  </url>",
                "",
            ]
        )
    lines.append("</urlset>")
    (ROOT / "sitemap.xml").write_text("\n".join(lines), encoding="utf-8")


def main() -> None:
    NEWS_DIR.mkdir(exist_ok=True)
    items = []
    used_slugs = set()

    try:
        listing = get_listing(limit=12)
        for entry in listing:
            detail = get_detail(entry)
            content_html = sanitize_html(get_detail_html(detail))
            title = detail.get("title") or entry.get("title") or "PUBG Mobile News"
            date = format_date(detail.get("createTime") or entry.get("createTime"))
            image = ""
            if detail.get("contentImages"):
                image = detail["contentImages"][0]
            elif entry.get("contentImages"):
                image = entry["contentImages"][0]

            base_slug = slugify(f"{date}-{title}")
            slug = base_slug
            suffix = 2
            while slug in used_slugs:
                slug = f"{base_slug}-{suffix}"
                suffix += 1
            used_slugs.add(slug)

            article = {
                "slug": slug,
                "title": title,
                "date": date,
                "image": image,
                "source_url": build_source_url(entry),
                "summary": build_summary(content_html, title),
                "content_html": content_html or f"<p>{html.escape(build_summary('', title))}</p>",
            }
            items.append(article)
    except Exception as exc:
        cached_listing = NEWS_DIR / "news-data.json"
        cached_index = NEWS_DIR / "index.html"
        if cached_listing.exists() and cached_index.exists():
            print(f"Warning: news regeneration failed, keeping cached news. Reason: {exc}")
            return
        raise

    (NEWS_DIR / "news-data.json").write_text(
        json.dumps(items, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    (NEWS_DIR / "index.html").write_text(render_listing(items), encoding="utf-8")

    for item in items:
        article_dir = NEWS_DIR / item["slug"]
        article_dir.mkdir(exist_ok=True)
        (article_dir / "index.html").write_text(render_article(item), encoding="utf-8")

    write_sitemap(items)
    print(f"Generated {len(items)} news article pages.")


if __name__ == "__main__":
    main()
