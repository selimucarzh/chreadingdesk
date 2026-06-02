const { execFileSync } = require("node:child_process");
const { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } = require("node:fs");
const { dirname, join, resolve } = require("node:path");

const [, , zipPathArg, outputPathArg = "data/yomitan-cc-cedict.json"] = process.argv;

if (!zipPathArg) {
  console.error("Usage: node tools/import-yomitan-cc-cedict.js <CC-CEDICT.zip> [output.json]");
  process.exit(1);
}

const zipPath = resolve(zipPathArg);
const outputPath = resolve(outputPathArg);
const dictionarySource = createDictionarySource(zipPath);
const index = dictionarySource.readJSON("index.json");
const bankFiles = dictionarySource.listFiles().filter((file) => /^term_bank_\d+\.json$/.test(file));

const entries = {};
let entryCount = 0;
let maxTermLength = 0;

for (const file of bankFiles.sort(compareBankNames)) {
  const bank = dictionarySource.readJSON(file);
  for (const row of bank) {
    const [term, reading, , , , glossary] = row;
    if (!term || !containsHanzi(term)) {
      continue;
    }

    const definitions = glossary
      .flatMap(extractGlossaryText)
      .map((definition) => definition.replace(/\s+/g, " ").trim())
      .filter(Boolean)
      .slice(0, 4);

    if (!definitions.length) {
      continue;
    }

    const normalizedEntry = {
      reading: reading || "",
      definitions,
    };

    if (!entries[term]) {
      entries[term] = [];
    }
    if (!hasDuplicateEntry(entries[term], normalizedEntry)) {
      entries[term].push(normalizedEntry);
      entryCount += 1;
      maxTermLength = Math.max(maxTermLength, Array.from(term).length);
    }
  }
}

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(
  outputPath,
  JSON.stringify({
    source: {
      title: index.title,
      revision: index.revision,
      url: index.url,
      importedAt: new Date().toISOString(),
    },
    entryCount,
    maxTermLength,
    entries,
  })
);

console.log(`Imported ${entryCount} CC-CEDICT entries from ${bankFiles.length} Yomitan term banks.`);
console.log(`Wrote ${outputPath}`);

function createDictionarySource(path) {
  if (!existsSync(path)) {
    throw new Error(`Dictionary path does not exist: ${path}`);
  }

  if (statSync(path).isDirectory()) {
    return {
      listFiles: () => readdirSync(path),
      readJSON: (fileName) => JSON.parse(readFileSync(join(path, fileName), "utf8")),
    };
  }

  return {
    listFiles: () =>
      execFileSync("unzip", ["-Z1", path], { encoding: "utf8" })
        .split(/\r?\n/)
        .filter(Boolean),
    readJSON: (fileName) =>
      JSON.parse(execFileSync("unzip", ["-p", path, fileName], { encoding: "utf8", maxBuffer: 128 * 1024 * 1024 })),
  };
}

function compareBankNames(left, right) {
  return Number(left.match(/\d+/)?.[0] || 0) - Number(right.match(/\d+/)?.[0] || 0);
}

function extractGlossaryText(value) {
  if (typeof value === "string") {
    return [value];
  }
  if (Array.isArray(value)) {
    return value.flatMap(extractGlossaryText);
  }
  if (!value || typeof value !== "object") {
    return [];
  }
  if (value.type === "structured-content") {
    return extractListItemText(value.content);
  }
  return extractListItemText(value);
}

function extractListItemText(value) {
  if (Array.isArray(value)) {
    return value.flatMap(extractListItemText);
  }
  if (!value || typeof value !== "object") {
    return [];
  }
  if (value.tag === "li") {
    return [extractInlineText(value.content)];
  }
  return extractListItemText(value.content);
}

function extractInlineText(value) {
  if (typeof value === "string") {
    return value;
  }
  if (Array.isArray(value)) {
    return value.map(extractInlineText).join("");
  }
  if (!value || typeof value !== "object") {
    return "";
  }
  return extractInlineText(value.content);
}

function hasDuplicateEntry(existingEntries, entry) {
  return existingEntries.some(
    (existing) => existing.reading === entry.reading && existing.definitions.join("\n") === entry.definitions.join("\n")
  );
}

function containsHanzi(value) {
  return /\p{Script=Han}/u.test(value);
}
