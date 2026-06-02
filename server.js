const http = require("node:http");
const { readFile } = require("node:fs/promises");
const { extname, join } = require("node:path");

const PORT = Number(process.env.PORT || 5177);
const ROOT = __dirname;

const sources = [
  {
    name: "中国新闻网 国际新闻",
    category: "World politics",
    url: "https://www.chinanews.com.cn/rss/world.xml",
    keywords: ["政府", "总统", "总理", "外交", "大使", "议会", "选举", "中美", "国际", "管控", "出口"],
  },
  {
    name: "中国新闻网 财经新闻",
    category: "China economy",
    url: "https://www.chinanews.com.cn/rss/finance.xml",
    keywords: ["中国", "经济", "金融", "财政", "消费", "投资", "外贸", "企业", "市场", "产业"],
  },
  {
    name: "人民网 国际频道",
    category: "World politics",
    url: "http://www.people.com.cn/rss/world.xml",
    keywords: ["政府", "外交", "总统", "国际", "欧洲", "美国", "联合国", "中方"],
  },
];

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
};

const staticFiles = new Set(["/index.html", "/styles.css", "/app.js"]);

function createAppServer() {
  return http.createServer(async (req, res) => {
    try {
      const url = new URL(req.url, `http://${req.headers.host}`);
      if (url.pathname === "/api/news") {
        await handleNews(res);
        return;
      }
      await serveStatic(url.pathname, res);
    } catch (error) {
      writeJSON(res, 500, { error: error.message || "server error" });
    }
  });
}

function startServer(port = PORT, host = "127.0.0.1") {
  const server = createAppServer();
  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, host, () => {
      server.off("error", reject);
      const address = server.address();
      const actualPort = typeof address === "object" && address ? address.port : port;
      resolve({
        server,
        url: `http://${host}:${actualPort}`,
      });
    });
  });
}

if (require.main === module) {
  startServer()
    .then(({ url }) => {
      console.log(`Chinese Tutor listening on ${url}`);
    })
    .catch((error) => {
      console.error(error);
      process.exitCode = 1;
    });
}

async function handleNews(res) {
  const groups = await Promise.allSettled(sources.map(readSource));
  const items = groups
    .filter((result) => result.status === "fulfilled")
    .flatMap((result) => result.value)
    .filter((item) => countHanzi(item.text) >= 20);

  if (!items.length) {
    writeJSON(res, 502, { error: "no newspaper text could be parsed" });
    return;
  }

  const index = Math.floor(Math.random() * items.length);
  writeJSON(res, 200, items[index]);
}

async function readSource(source) {
  const response = await fetchWithTimeout(source.url, {
    headers: {
      "User-Agent": "ChineseTutor/1.0 Mandarin learning reader",
      Accept: "application/rss+xml, application/xml, text/xml, */*",
    },
  });
  if (!response.ok) {
    throw new Error(`${source.name} returned ${response.status}`);
  }

  const xml = await response.text();
  return parseRSS(xml)
    .map((item) => ({
      title: item.title,
      link: item.link,
      source: source.name,
      category: source.category,
      publishedAt: item.pubDate,
      text: normalizeText(`${item.title}。${item.description}`),
      translation: "",
    }))
    .filter((item) => matchesTopic(item.text, source.keywords))
    .slice(0, 8);
}

async function fetchWithTimeout(url, options = {}, timeoutMs = 8000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

function parseRSS(xml) {
  const itemMatches = xml.match(/<item\b[\s\S]*?<\/item>/gi) || [];
  return itemMatches.map((itemXML) => ({
    title: extractTag(itemXML, "title"),
    link: extractTag(itemXML, "link"),
    description: extractTag(itemXML, "description"),
    pubDate: extractTag(itemXML, "pubDate"),
  }));
}

function extractTag(xml, tag) {
  const match = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return decodeEntities(stripHTML(stripCDATA(match?.[1] || ""))).trim();
}

function stripCDATA(value) {
  return value.replace(/^<!\[CDATA\[/, "").replace(/\]\]>$/, "");
}

function stripHTML(value) {
  return value.replace(/<[^>]+>/g, "");
}

function decodeEntities(value) {
  return value
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function normalizeText(value) {
  return value.replace(/\s+/g, "").replace(/[�]/g, "").slice(0, 220);
}

function matchesTopic(text, keywords) {
  return keywords.some((keyword) => text.includes(keyword));
}

function countHanzi(value) {
  return Array.from(value).filter((char) => /\p{Script=Han}/u.test(char)).length;
}

async function serveStatic(pathname, res) {
  const requestPath = pathname === "/" ? "/index.html" : pathname;
  if (!staticFiles.has(requestPath)) {
    writeJSON(res, 404, { error: "not found" });
    return;
  }

  const filePath = join(ROOT, requestPath);
  const content = await readFile(filePath);
  res.writeHead(200, { "Content-Type": mimeTypes[extname(filePath)] || "application/octet-stream" });
  res.end(content);
}

function writeJSON(res, status, payload) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(payload));
}

module.exports = {
  createAppServer,
  startServer,
};
