#!/usr/bin/env node
/**
 * plan-prune.mjs — 決定哪些頁面該保留、該 noindex、該合併。
 *
 * 為什麼要砍
 * ----------
 * 這個站的 200 頁英文是從一份主稿批次產生的（repo README 自己寫明
 * 「200 purpose-specific English launch pages」，由 scripts/import-master.mjs
 * 從 docs/launch-content-master.md 產生）。繁中首頁列出數百個連結，
 * 而且大量同題重複——植物照護交接、信件包裹交接、CSV 匯入、瀏覽器資料清理、
 * 紀錄找回演練都各有兩篇幾乎同題的教學。
 *
 * 這正是 2026 年 3 月核心更新點名的 scaled content abuse 樣態。
 * GSC 顯示 76 頁有曝光，平均第 40~60 名——Google 收了，但完全不認為該排前面。
 *
 * 砍頁不是為了砍而砍。少數高品質頁面的整站品質訊號，
 * 比大量中等頁面好，而演算法壓制要 3~6 個月才恢復。
 *
 * 這支腳本做什麼
 * --------------
 * 讀 GSC 的網頁報表 ＋ 掃描內容目錄，把每個 URL 分成四類：
 *   KEEP     有曝光或屬於核心路徑 → 留在索引
 *   NOINDEX  三個月零曝光，或屬於產品操作教學 → 對搜尋沒價值
 *   MERGE    與另一頁同題（slug 高度重疊）→ 留強的，弱的 301
 *   REVIEW   人工判斷
 *
 * 用法
 * ----
 *   node scripts/plan-prune.mjs --gsc gsc/網頁.csv --content src/content --out prune-plan
 *
 * 輸出
 * ----
 *   prune-plan/keep.txt        保留清單
 *   prune-plan/noindex.txt     要加 noindex 的路徑
 *   prune-plan/merge.csv       建議合併的組合（from → to）
 *   prune-plan/redirects.txt   Cloudflare Pages / Netlify 的 _redirects 片段
 *   prune-plan/PLAN.md         人看的說明
 *
 * Node 18+，零相依。腳本只產生計畫，不會改任何檔案。
 */

import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const argv = process.argv.slice(2);
const flag = (n, d = null) => {
  const i = argv.indexOf(`--${n}`);
  return i === -1 ? d : argv[i + 1];
};
const GSC = flag("gsc", "gsc/網頁.csv");
const CONTENT = flag("content", "src/content");
const OUT = flag("out", "prune-plan");
const POLICY = flag("policy");
const REVIEWED_MERGES = flag("reviewed-merges");
const MIN_IMPR = Number(flag("min-impr", 1));

// ---------------------------------------------------------------- CSV
function parseCsv(text) {
  const rows = [];
  let row = [], field = "", inQ = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQ) {
      if (c === '"') { if (text[i + 1] === '"') { field += '"'; i++; } else inQ = false; }
      else field += c;
    } else if (c === '"') inQ = true;
    else if (c === ",") { row.push(field); field = ""; }
    else if (c === "\n") { row.push(field); rows.push(row); row = []; field = ""; }
    else if (c !== "\r") field += c;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  const head = rows.shift().map((h) => h.replace(/^\uFEFF/, "").trim());
  return rows.filter((r) => r.some((v) => v.trim()))
    .map((r) => Object.fromEntries(head.map((h, i) => [h, (r[i] ?? "").trim()])));
}
const col = (r, ...ns) => { for (const n of ns) if (r[n] !== undefined) return r[n]; return ""; };
const num = (v) => { const n = parseFloat(String(v).replace(/[,%]/g, "")); return Number.isFinite(n) ? n : 0; };
const pathOf = (u) => String(u).replace(/^https?:\/\/[^/]+/, "").split(/[?#]/)[0] || "/";

// ---------------------------------------------------------------- 規則
/**
 * 產品操作教學對搜尋沒有價值——它們是 App 文件，不是有人會搜的東西。
 * 這個站有超過一百頁這種：「FamilyBoard XXX 教學」「XXX tutorial」。
 */
const TUTORIAL = [
  /familyboard-.*-tutorial/i,
  /\/guides\/familyboard-/i,
  /-tutorial\/?$/i,
  /教學\/?$/,
];

/** 核心路徑：不管有沒有曝光都保留 */
const CORE = [
  /^\/$/, /^\/zh-tw\/?$/,
  /^\/(zh-tw\/)?(about|contact|privacy|terms|security|disclaimer|editorial-policy|affiliate-disclosure|pricing|roadmap|changelog)\/?$/,
  /^\/(zh-tw\/)?tools\/?$/, /^\/(zh-tw\/)?guides\/?$/,
  /^\/(zh-tw\/)?checklists\/?$/, /^\/(zh-tw\/)?templates\/?$/,
  /^\/(zh-tw\/)?features\/?$/,
];

/** 真的有輸入輸出的工具，優先保留 */
const REAL_TOOLS = [
  "warranty-expiration-calculator",
  "home-maintenance-schedule-generator",
  "household-subscription-cost-calculator",
  "annual-subscription-cost-calculator",
  "emergency-contact-sheet-generator",
  "appliance-age-calculator",
  "home-maintenance-cost-tracker",
];

const STOP = new Set(["zh", "tw", "en", "guides", "tools", "features", "checklists",
  "templates", "index", "the", "and", "for", "familyboard", "household", "home"]);
const toks = (p) => p.toLowerCase().split(/[/\-_.]+/).filter((t) => t && !STOP.has(t) && t.length > 2);

// ---------------------------------------------------------------- 載入
if (!fs.existsSync(GSC)) { console.error(`找不到 ${GSC}`); process.exit(1); }
const gsc = parseCsv(fs.readFileSync(GSC, "utf8")).map((r) => ({
  url: pathOf(col(r, "熱門網頁", "Top pages")),
  clicks: num(col(r, "點擊", "Clicks")),
  impr: num(col(r, "曝光", "Impressions")),
  pos: num(col(r, "排名", "Position")) || 999,
}));
const imprOf = new Map(gsc.map((r) => [r.url.replace(/\/$/, ""), r]));

// 掃描內容目錄推出所有 URL（GSC 只列有曝光的）
function walk(d, out = []) {
  if (!fs.existsSync(d)) return out;
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    if (e.name.startsWith(".") || e.name === "node_modules") continue;
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (/\.(md|mdx|astro)$/.test(e.name)) out.push(p);
  }
  return out;
}
const files = walk(CONTENT);
const routeFromFrontmatter = (file) => {
  const text = fs.readFileSync(file, "utf8");
  const frontmatter = text.match(/^---\s*\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/)?.[1] ?? "";
  const route = frontmatter.match(/^route:\s*["']?([^"'\r\n]+)["']?\s*$/m)?.[1]?.trim();
  if (!route) {
    console.error(`內容檔缺少 route frontmatter：${file}`);
    process.exitCode = 1;
    return null;
  }
  return route === "/" ? "/" : `/${route.replace(/^\/+|\/+$/g, "")}/`;
};
const fileUrls = files.map(routeFromFrontmatter).filter(Boolean);
if (process.exitCode) process.exit(process.exitCode);
const allUrls = [...new Set([...gsc.map((r) => r.url), ...fileUrls])];

console.log(`GSC 有曝光頁 ${gsc.length} | 內容檔 ${files.length} | 合計待分類 ${allUrls.length}\n`);

// ---------------------------------------------------------------- 分類
const keep = [], noindex = [];
for (const u of allUrls) {
  const g = imprOf.get(u.replace(/\/$/, ""));
  const impr = g?.impr ?? 0;
  const isCore = CORE.some((re) => re.test(u));
  const isTutorial = TUTORIAL.some((re) => re.test(u));
  const isRealTool = /^\/(?:zh-tw\/)?tools\//.test(u) && REAL_TOOLS.some((t) => u.includes(t));

  if (isCore || isRealTool) { keep.push({ u, impr, why: isCore ? "核心路徑" : "真工具" }); continue; }
  if (isTutorial) { noindex.push({ u, impr, why: "產品操作教學，搜尋無需求" }); continue; }
  if (impr >= MIN_IMPR) { keep.push({ u, impr, why: `有曝光 ${impr}` }); continue; }
  noindex.push({ u, impr, why: "三個月零曝光" });
}

// ---------------------------------------------------------------- 同題偵測
/**
 * 語系判定。跨語系「絕對不能」合併——/zh-tw/x 與 /x 是 hreflang 的一組，
 * 不是重複頁。把它們 301 在一起會毀掉整組語系設定。
 */
const localeOf = (u) => (/^\/zh-tw\//.test(u) ? "zh-tw" : "en");

const sig = new Map();
for (const { u } of [...keep, ...noindex]) {
  const t = toks(u).sort();
  if (t.length < 2) continue;
  const key = `${localeOf(u)}::${t.slice(0, 4).join("+")}`;  // 語系綁進 key
  if (!sig.has(key)) sig.set(key, []);
  sig.get(key).push(u);
}
const merges = [];
for (const [key, urls] of sig) {
  if (urls.length < 2) continue;
  const scored = urls.map((u) => ({ u, impr: imprOf.get(u.replace(/\/$/, ""))?.impr ?? 0 }))
    .sort((a, b) => b.impr - a.impr);
  const winner = scored[0];
  for (const loser of scored.slice(1)) {
    if (localeOf(loser.u) !== localeOf(winner.u)) continue;  // 保險：再擋一次
    merges.push({ from: loser.u, to: winner.u, key, from_impr: loser.impr, to_impr: winner.impr });
  }
}

let redirectMerges = merges;
let reviewSummary = "尚未提供人工複核檔；redirects.txt 仍是候選清單，不可直接部署。";
if (REVIEWED_MERGES) {
  if (!fs.existsSync(REVIEWED_MERGES)) {
    console.error(`找不到人工複核檔：${REVIEWED_MERGES}`);
    process.exit(1);
  }
  const reviewed = parseCsv(fs.readFileSync(REVIEWED_MERGES, "utf8"));
  const candidateKeys = new Set(merges.map(({ from, to }) => `${from}\n${to}`));
  const reviewedKeys = new Set(reviewed.map(({ from, to }) => `${from}\n${to}`));
  if (reviewed.length !== merges.length || reviewedKeys.size !== candidateKeys.size)
    throw new Error(`人工複核列數 ${reviewed.length} 與候選列數 ${merges.length} 不一致`);
  for (const key of candidateKeys)
    if (!reviewedKeys.has(key)) throw new Error(`人工複核缺少候選：${key.replace("\n", " -> ")}`);
  redirectMerges = reviewed
    .filter(({ decision }) => /^ACCEPT/i.test(decision))
    .map(({ from, to }) => merges.find((item) => item.from === from && item.to === to));
  reviewSummary = `已逐筆人工複核 ${reviewed.length} 組；接受 ${redirectMerges.length} 組，拒絕 ${reviewed.length - redirectMerges.length} 組。`;
}

// ---------------------------------------------------------------- 輸出
fs.mkdirSync(OUT, { recursive: true });
const w = (f, s) => fs.writeFileSync(path.join(OUT, f), s, "utf8");

w("keep.txt", keep.sort((a, b) => b.impr - a.impr).map((x) => `${x.u}\t${x.impr}\t${x.why}`).join("\n"));
w("noindex.txt", noindex.sort((a, b) => b.impr - a.impr).map((x) => `${x.u}\t${x.impr}\t${x.why}`).join("\n"));
w("merge.csv", "from,to,shared_tokens,from_impressions,to_impressions\n" +
  merges.map((m) => `${m.from},${m.to},${m.key},${m.from_impr},${m.to_impr}`).join("\n"));
w("redirects.txt",
  "# Cloudflare Pages / Netlify _redirects 片段\n" +
  "# GitHub Pages 做不了伺服器端 301，若仍在 GitHub Pages 上，先搬站再用這份。\n" +
  redirectMerges.map((m) => `${m.from}  ${m.to}  301`).join("\n"));

if (POLICY) {
  fs.mkdirSync(path.dirname(POLICY), { recursive: true });
  fs.writeFileSync(POLICY, `${JSON.stringify({
    version: 1,
    source: "2026-09-22 GSC page export plus repository content inventory",
    indexableRoutes: keep.map(({ u }) => u).sort(),
  }, null, 2)}\n`, "utf8");
}

const zhKeep = keep.filter((x) => x.u.startsWith("/zh-tw/")).length;
const enKeep = keep.length - zhKeep;
w("PLAN.md", `# 收斂計畫 — familyboard.win

腳本只產生計畫，沒有改任何檔案。逐項確認後再動手。

## 分類結果

| 類別 | 數量 | 說明 |
|---|---:|---|
| KEEP | ${keep.length} | 有曝光、核心路徑、或真的有輸入輸出的工具 |
| NOINDEX | ${noindex.length} | 產品操作教學，或三個月零曝光 |
| MERGE | ${merges.length} | slug 高度重疊，建議留強的、弱的 301 |

KEEP 之中繁中 ${zhKeep} 頁、其他 ${enKeep} 頁。

## MERGE 人工複核

${reviewSummary}

## 執行順序

1. **先做 NOINDEX。** 加 \`<meta name="robots" content="noindex,follow">\`
   並從 sitemap 移除。頁面保留可訪問——noindex 不是刪除，站內連結仍然有效。
2. **再做 MERGE。** 逐筆看 \`merge.csv\`，確認真的是同題才合併。
   腳本用 slug token 判斷，會有誤判，**不要盲目套用**。
   確認後把 \`redirects.txt\` 的內容放進 \`_redirects\`。
3. **最後檢查 KEEP。** 確認每一頁都真的值得留，
   特別是 \`/guides/\` 底下那些只有說明文字沒有實際工具的頁面。

## 為什麼不直接刪檔案

noindex + 保留頁面比刪除安全：
- 站內連結不會斷
- 如果判斷錯了，拿掉 noindex 就能回來
- 已經有外部連結指過來的頁面不會變 404

只有在確認頁面完全沒有價值、也沒有任何連結指過來時才刪。
`);

console.log(`KEEP ${keep.length} | NOINDEX ${noindex.length} | MERGE ${merges.length}`);
console.log(`\n輸出在 ${OUT}/，先讀 ${OUT}/PLAN.md`);
if (POLICY) console.log(`索引白名單已寫入 ${POLICY}`);
console.log(`\nMERGE 是用 slug token 推測的，會有誤判。逐筆確認後再套用，不要盲目執行。`);
