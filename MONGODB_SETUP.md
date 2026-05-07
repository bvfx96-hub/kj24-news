# MongoDB Admin API Setup

1. Install Node.js on the machine or hosting server.
   - If PowerShell shows `npm is not recognized`, install Node.js LTS from the official site: https://nodejs.org/en/download
   - Run the Windows `.msi` installer with default options.
   - Close and reopen VS Code/PowerShell after install.
   - Verify:

```powershell
node -v
npm -v
```

2. Copy `.env.example` to `.env`.
3. Set your MongoDB connection:

```env
PORT=3000
SITE_URL=http://localhost:3000
MONGODB_URI=mongodb://127.0.0.1:27017
MONGODB_DB=khabri_junction
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-5.2
AUTOMATION_ENABLED=false
GOOGLE_NEWS_QUERY=Chhattisgarh Durg Bhilai Raipur Bilaspur sports astrology
```

For MongoDB Atlas, replace `MONGODB_URI` with your Atlas connection string.

4. Install dependencies:

```bash
cd "E:\KJ NEWS\2026-05-06\doctype-html-html-lang-en-head"
npm install
```

5. Start the API server:

```bash
npm start
```

6. Open the site through the API server for easiest testing:

```text
http://localhost:3000/index.html
http://localhost:3000/admin.html
```

The static `file://` preview can also call the API at `http://localhost:3000` when the server is running.

## News API

- `GET /api/news`
- `GET /api/news/:id`
- `POST /api/news`
- `PUT /api/news/:id`
- `DELETE /api/news/:id`

## AI Automation

- `GET /api/automation`
- `PUT /api/automation`
- `POST /api/automation/run`

The server checks Google News RSS every 30 minutes when automation is enabled in `admin.html`.
It generates Hindi title, summary and full body with OpenAI, auto selects category/city, saves review drafts into MongoDB, and prevents duplicates with `duplicateKey`, `sourceUrl`, and `slug`.

To use it:

1. Add your OpenAI key in `.env` as `OPENAI_API_KEY`.
2. Start MongoDB.
3. Start the API server with `npm start`.
4. Open `http://localhost:3000/admin.html`.
5. Login and use the `AI Automation` section to enable/disable or run once.
6. Review AI drafts in `News Updates`, then click `Publish`, `Breaking`, `Trend`, or `Top`.

Published articles are available as slug URLs:

```text
http://localhost:3000/news/article-slug
```

Google News sitemap:

```text
http://localhost:3000/news-sitemap.xml
```

Each news document stores:

```json
{
  "title": "News title",
  "summary": "Short summary",
  "body": "Full news body",
  "category": "DURG",
  "city": "durg",
  "image": "https://example.com/image.jpg",
  "createdAt": "2026-05-07T00:00:00.000Z",
  "status": "published",
  "breaking": false,
  "featured": false,
  "trending": false,
  "language": "en",
  "slug": "news-title-slug",
  "categorySlug": "durg",
  "categoryPage": "durg.html",
  "metaTitle": "SEO title",
  "metaDescription": "SEO description"
}
```
