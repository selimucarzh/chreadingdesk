# Chinese Tutor

Chinese Tutor is a local Mandarin reading desk for intermediate learners. It fetches Chinese news passages, provides Hanzi and pinyin reading support, translates passages into English, and shows character-level study details such as stroke order, tone-marked pinyin, and English meanings.

## Purpose

The project is designed to help a Mandarin learner practice with real Chinese text while keeping character lookup fast. A learner can read a passage, compare it with pinyin and English, click any Hanzi character, and inspect its pronunciation, meaning, and stroke-order diagram on the right side of the screen.

The app currently supports two reading modes:

- `New Text`: loads parsed online Chinese newspaper/RSS passages about world politics and the Chinese economy.
- `HSK4-5 Text`: loads built-in daily-life passages written around HSK 4-5 vocabulary and sentence patterns.

## Tech Stack

- HTML5 for the app structure.
- CSS3 for the responsive two-pane reading interface.
- Vanilla JavaScript for all client-side interaction.
- Node.js built-in `http` server for local hosting and server-side RSS parsing.
- Browser `fetch` API for translation, pinyin/stroke assets, and local API calls.
- [`pinyin-pro`](https://github.com/zh-lx/pinyin-pro) from jsDelivr for pinyin generation.
- [`hanzi-writer-data`](https://github.com/chanind/hanzi-writer-data) from jsDelivr for Hanzi stroke-order path data.

No build step or package installation is required.

## Translation Engine

English translation is provided through the public MyMemory Translation API:

- MyMemory API endpoint: <https://api.mymemory.translated.net/get>
- Language pair used by the app: `zh-CN|en`

If the translation request fails, the app keeps a built-in English translation for HSK4-5 passages or displays a fallback message for online news.

## Parsed Online Sources

The local Node server parses Chinese RSS feeds and filters items by topic keywords related to world politics, international relations, finance, markets, trade, and the Chinese economy.

Current sources:

- China News Service world news RSS: <https://www.chinanews.com.cn/rss/world.xml>
- China News Service finance news RSS: <https://www.chinanews.com.cn/rss/finance.xml>
- People.com.cn world news RSS: <http://www.people.com.cn/rss/world.xml>

The server exposes parsed reading passages through:

```text
GET /api/news
```

Each response includes:

- article title
- source name
- category
- published date
- article link
- shortened Chinese reading text

## Run Locally

```bash
cd "/home/noqac901/Desktop/Chinese Tutor"
node server.js
```

Open:

```text
http://127.0.0.1:5177
```

## Features

- Fetches Chinese news text from online RSS sources.
- Shows Hanzi and matching pinyin.
- Highlights the matching pinyin token when a Hanzi character is selected.
- Shows English translation for the current passage.
- Shows Hanzi stroke order using SVG path data.
- Shows selected character pinyin, tone, meaning, and details.
- Includes HSK4-5 daily-life reading passages.
- Shows matching HSK4-5 vocabulary from the current passage.
- Falls back to built-in texts when online sources are unavailable.

## Project Structure

```text
index.html    Main app shell
styles.css    Responsive UI styling
app.js        Client-side reading, pinyin, translation, and character logic
server.js     Local Node server and RSS parser
README.md     Project documentation
```

## Notes

This is a learning tool, not a production translation system. The dictionary and vocabulary lists are intentionally lightweight and can be expanded over time with a fuller Chinese-English lexical database.
