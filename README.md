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
- Electron for the Windows desktop app shell.
- Electron Builder for creating a Windows installer.
- Browser `fetch` API for translation, pinyin/stroke assets, and local API calls.
- [`pinyin-pro`](https://github.com/zh-lx/pinyin-pro) from jsDelivr for pinyin generation.
- [`hanzi-writer-data`](https://github.com/chanind/hanzi-writer-data) from jsDelivr for Hanzi stroke-order path data.

The browser-only local server mode has no build step. The Windows desktop app requires installing npm dev dependencies before packaging.

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
- South China Morning Post People & Culture RSS, filtered to Trending China links: <https://www.scmp.com/rss/318202/feed/>

SCMP publishes this feed in English. The local server parses the current Trending China RSS items, translates the selected English summary into simplified Chinese for Hanzi/pinyin reading, and keeps the original English summary as the translation panel text.

The server exposes parsed reading passages through:

```text
GET /api/news
GET /api/news?source=scmp
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

## Run as a Desktop App

Install the Electron dependencies once:

```bash
cd "/home/noqac901/Desktop/Chinese Tutor"
npm install
```

Start the desktop app in development:

```bash
npm start
```

When the app opens, Electron starts the local parser server inside the app and loads the reading desk from that local address. The app then connects to the online Chinese RSS sources through `GET /api/news`, and translation, pinyin, and stroke-order assets continue to load from their online services.

## Build a Windows Installer

On a Windows machine, run:

```bash
npm run dist:win
```

The installer is created in:

```text
dist/
```

The Windows installer uses NSIS, creates a Start Menu shortcut, and creates a desktop shortcut named `Chinese Tutor`. The installed app runs without a separate terminal window.

The repository also includes a GitHub Actions workflow at `.github/workflows/build-windows.yml`. Push the project to GitHub or run the workflow manually, then download the `Chinese-Tutor-Windows-Installer` artifact from the workflow run. That artifact contains the Windows installer.

When building from Linux, NSIS installer generation requires Wine. If Wine is not installed, build a downloadable portable Windows package instead:

```bash
npm run dist:win:portable
```

That command creates:

```text
dist/Chinese Tutor-1.0.0-win.zip
```

Unzip it on Windows and run `Chinese Tutor.exe`.

## Features

- Fetches Chinese news text from online RSS sources.
- Fetches SCMP Trending China RSS items through the `SCMP Trending` button.
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
main.js       Electron desktop app entry point
package.json  Electron and Windows installer configuration
README.md     Project documentation
```

## Notes

This is a learning tool, not a production translation system. The dictionary and vocabulary lists are intentionally lightweight and can be expanded over time with a fuller Chinese-English lexical database.
