#!/usr/bin/env node
/**
 * Fetches CLDR annotations (emoji short names) and converts emoji-icons.ts
 * from emojis: ['😀', '😃'] to emojis: [{ icon: '😀', name: 'grinning face' }, ...]
 * Run from project root: node scripts/merge-cldr-names.mjs
 */

import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const EMOJI_ICONS_PATH = join(ROOT, "src", "components", "chat", "customEmojiPicker", "emoji-icons.ts");
const CLDR_URL = "https://raw.githubusercontent.com/unicode-org/cldr-json/main/cldr-json/cldr-annotations-full/annotations/en/annotations.json";

async function fetchCldr() {
  const res = await fetch(CLDR_URL);
  if (!res.ok) throw new Error(`CLDR fetch failed: ${res.status}`);
  const data = await res.json();
  const annotations = data?.annotations?.annotations ?? {};
  const nameMap = new Map();
  for (const [char, entry] of Object.entries(annotations)) {
    const name = entry?.tts?.[0];
    if (typeof name === "string") nameMap.set(char, name);
  }
  return nameMap;
}

function escapeForTs(str) {
  return str.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}

function parseEmojiArray(arrContent) {
  const icons = [];
  let s = arrContent.trim();
  while (s.length) {
    s = s.replace(/^\s*,\s*/, "").trim();
    if (s[0] !== "'") break;
    let e = 1;
    while (e < s.length) {
      if (s[e] === "\\") e += 2;
      else if (s[e] === "'") break;
      else e++;
    }
    const icon = s.slice(1, e).replace(/\\'/g, "'");
    icons.push(icon);
    s = s.slice(e + 1);
  }
  return icons;
}

function convertLineSimple(line, nameMap) {
  const m = line.match(/emojis: \[(.*)\]/s);
  if (!m) return line;
  const arrContent = m[1];
  const icons = parseEmojiArray(arrContent);
  if (icons.length === 0) return line;
  const items = icons.map((icon) => {
    const name = nameMap.get(icon) || "Emoji";
    return `{ icon: '${escapeForTs(icon)}', name: '${escapeForTs(name)}' }`;
  }).join(", ");
  return line.replace(/emojis: \[.*\]/s, `emojis: [${items}]`);
}

async function main() {
  console.log("Fetching CLDR annotations...");
  const nameMap = await fetchCldr();
  console.log("Loaded", nameMap.size, "emoji names");

  let content = readFileSync(EMOJI_ICONS_PATH, "utf8");
  const lines = content.split("\n");
  const out = lines.map((line) => convertLineSimple(line, nameMap));
  writeFileSync(EMOJI_ICONS_PATH, out.join("\n"), "utf8");
  console.log("Updated", EMOJI_ICONS_PATH);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
