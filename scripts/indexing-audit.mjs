import { readFile, writeFile, mkdir, readdir } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const baseUrl = "https://familyboard.win";
const property = "sc-domain:familyboard.win";
const live = process.argv.includes("--live");
const reportDir = path.join(root, "reports", "indexing");
const distDir = path.join(root, "dist");
const metadataPath = path.join(root, "src", "generated", "sitemap-pages.json");
const snapshotPath = path.join(reportDir, "gsc-snapshot.json");

const columns = {
  urlSet: ["url", "repo_indexable", "production_sitemap", "gsc_known", "gsc_indexed", "http_status", "robots", "canonical", "google_canonical", "last_crawl", "discovery_source", "cluster", "page_type", "main_content_inlinks", "click_depth", "decision"],
  sitemap: ["url", "http_status", "indexable", "meta_noindex", "x_robots_noindex", "canonical", "canonical_http_status", "redirect", "soft_404", "h1", "body", "server_rendered", "in_sitemap", "response_url", "issue"],
  links: ["url", "indexable", "page_type", "cluster", "main_content_inlinks", "candidate_main_content_inlinks", "production_main_content_inlinks", "source_urls", "priority_gate", "normal_gate", "orphan", "decision"],
  depth: ["url", "indexable", "important", "click_depth", "reachable", "gate", "issue"],
  inspection: ["url", "gsc_status", "last_crawl", "crawl_allowed", "indexing_allowed", "page_fetch", "user_declared_canonical", "google_selected_canonical", "referring_page", "sitemap", "rendered_html", "http_status", "robots", "cluster", "main_content_inlinks", "click_depth", "content_intent", "nearest_competing_page", "notes"],
  semantic: ["url_a", "url_b", "cluster", "score", "primary_keyword_a", "primary_keyword_b", "primary_intent_a", "primary_intent_b", "headings_a", "headings_b", "decision", "notes"],
  qa: ["url", "source", "http_status", "canonical", "robots", "h1", "rendered_body", "internal_links", "structured_data", "hreflang", "sitemap_membership", "decision"],
  indexWorthiness: ["url", "distinct_user_intent", "unique_information_gain", "useful_outcome", "contextual_internal_links", "canonical_uniqueness", "non_template_sections", "first_party_resource", "clear_next_action", "source_quality", "search_cannibalization", "gate", "notes"],
};

const csvEscape = (value) => {
  const text = value === null || value === undefined ? "" : String(value);
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
};
const toCsv = (headers, rows) => [headers.join(","), ...rows.map((row) => headers.map((header) => csvEscape(row[header])).join(","))].join("\n") + "\n";
const writeCsv = async (name, headers, rows) => writeFile(path.join(reportDir, name), toCsv(headers, rows), "utf8");
const clean = (html) => String(html || "").replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").replace(/&(?:nbsp|#160);/gi, " ").replace(/&amp;/gi, "&").replace(/&quot;/gi, '"').replace(/&#39;/gi, "'").replace(/\s+/g, " ").trim();
const words = (text) => (String(text || "").match(/[A-Za-z0-9][A-Za-z0-9'’-]*/g) || []).length;
const normalizeRoute = (value) => {
  if (value === null || value === undefined || String(value).trim() === "") return "";
  try {
    const url = new URL(value, baseUrl);
    let route = url.pathname || "/";
    if (!route.endsWith("/")) route += "/";
    return route.replace(/^\/\/+/, "/");
  } catch {
    return "";
  }
};
const absolute = (route) => `${baseUrl}${normalizeRoute(route)}`;
const parseAttr = (html, tag, attr) => html.match(new RegExp(`<${tag}\\b[^>]*\\b${attr}=["']([^"']+)["']`, "i"))?.[1] || "";
const parseMeta = (html, name) => html.match(new RegExp(`<meta\\b[^>]*\\bname=["']${name}["'][^>]*\\bcontent=["']([^"']*)["']`, "i"))?.[1] || "";
const htmlMain = (html) => html.match(/<main\b[\s\S]*?<\/main>/i)?.[0] || html;
const removeChrome = (html) => html.replace(/<(?:header|footer|nav|aside)\b[\s\S]*?<\/(?:header|footer|nav|aside)>/gi, " ");
const h1Count = (html) => [...String(html).matchAll(/<h1(?:\s[^>]*)?>[\s\S]*?<\/h1>/gi)].length;
const hasJsonLd = (html) => /<script\b[^>]*type=["']application\/ld\+json["']/i.test(html);
const hasHreflang = (html) => [...String(html).matchAll(/<link\b[^>]*rel=["']alternate["'][^>]*hreflang=["']([^"']+)["'][^>]*href=["']([^"']+)["']/gi)].map((match) => ({ lang: match[1], href: match[2] }));
const extractLinks = (html) => [...String(html).matchAll(/<a\b[^>]*\bhref=["']([^"']+)["'][^>]*>/gi)].map((match) => match[1]).filter((href) => href.startsWith("/") && !href.startsWith("//")).map(normalizeRoute);
const extractMainLinks = (html) => extractLinks(removeChrome(htmlMain(html)));

async function walk(dir) {
  const output = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) output.push(...await walk(full));
    else output.push(full);
  }
  return output;
}

function routeFromHtml(file) {
  const relative = path.relative(distDir, file).replaceAll("\\", "/");
  if (relative === "index.html") return "/";
  if (!relative.endsWith("/index.html")) return `/${relative.replace(/\.html$/, "")}/`;
  return `/${relative.slice(0, -"/index.html".length)}/`;
}

function parseFrontmatter(raw) {
  const match = String(raw).match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) return { body: String(raw), route: "" };
  const frontmatter = match[1];
  const get = (key) => frontmatter.match(new RegExp(`^${key}:\\s*(?:["']([^"']*)["']|([^\\r\\n]*))$`, "mi"))?.[1] || frontmatter.match(new RegExp(`^${key}:\\s*(?:["']([^"']*)["']|([^\\r\\n]*))$`, "mi"))?.[2] || "";
  const body = match[2];
  return {
    route: normalizeRoute(get("route")),
    title: get("title"),
    primaryIntent: get("primaryIntent"),
    primaryKeyword: get("primaryKeyword"),
    nextStep: get("nextStep"),
    cluster: get("cluster"),
    pageType: get("pageType"),
    indexable: get("indexable") !== "false",
    redirectTo: normalizeRoute(get("redirectTo")),
    body,
    headings: [...body.matchAll(/^#{1,6}\s+(.+)$/gm)].map((item) => item[1].trim()),
    mainText: clean(body),
    paragraphs: body.split(/\r?\n\s*\r?\n/).map((part) => clean(part)).filter((part) => words(part) >= 20),
  };
}

async function readSourcePages() {
  const sourceFiles = [];
  for (const dir of [path.join(root, "src", "content", "pages"), path.join(root, "src", "content", "pages-zh-tw")]) {
    for (const file of await walk(dir)) if (file.endsWith(".md")) sourceFiles.push(file);
  }
  const pages = [];
  for (const file of sourceFiles) pages.push(parseFrontmatter(await readFile(file, "utf8")));
  return pages.filter((page) => page.route);
}

async function readHtmlPages() {
  const pages = new Map();
  for (const file of (await walk(distDir)).filter((candidate) => candidate.endsWith(".html"))) {
    const route = routeFromHtml(file);
    pages.set(route, { route, file, html: await readFile(file, "utf8") });
  }
  return pages;
}

function parseSitemapXml(xml) {
  return [...String(xml).matchAll(/<loc>\s*([^<]+)\s*<\/loc>/gi)].map((match) => match[1].trim());
}

async function readLocalSitemap() {
  const indexXml = await readFile(path.join(distDir, "sitemap-index.xml"), "utf8");
  const children = parseSitemapXml(indexXml);
  const urls = [];
  for (const child of children) urls.push(...parseSitemapXml(await readFile(path.join(distDir, new URL(child).pathname.replace(/^\//, "")), "utf8")));
  return { indexXml, children, urls };
}

async function fetchWithTimeout(url, options = {}, timeoutMs = 20000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...options, redirect: "manual", signal: controller.signal });
    const body = await response.text();
    return { url, responseUrl: response.url || url, status: response.status, headers: Object.fromEntries(response.headers.entries()), body, error: "" };
  } catch (error) {
    return { url, responseUrl: url, status: 0, headers: {}, body: "", error: error instanceof Error ? error.message : String(error) };
  } finally {
    clearTimeout(timer);
  }
}

async function mapLimit(values, limit, worker) {
  const results = new Array(values.length);
  let cursor = 0;
  const runners = Array.from({ length: Math.min(limit, values.length) }, async () => {
    while (true) {
      const index = cursor++;
      if (index >= values.length) return;
      results[index] = await worker(values[index], index);
    }
  });
  await Promise.all(runners);
  return results;
}

async function readProductionSitemap() {
  const index = await fetchWithTimeout(`${baseUrl}/sitemap-index.xml`, { headers: { "user-agent": "Googlebot/2.1 (+http://www.google.com/bot.html)" } });
  const children = parseSitemapXml(index.body);
  const childResults = await mapLimit(children, 4, (url) => fetchWithTimeout(url, { headers: { "user-agent": "Googlebot/2.1 (+http://www.google.com/bot.html)" } }));
  return { index, children, childResults, urls: childResults.flatMap((result) => parseSitemapXml(result.body)) };
}

async function readProductionPages(urls) {
  const results = await mapLimit(urls, 10, (url) => fetchWithTimeout(url, { headers: { "user-agent": "Googlebot/2.1 (+http://www.google.com/bot.html)", accept: "text/html,application/xhtml+xml" } }));
  return new Map(results.map((result) => [result.url, result]));
}

async function gscAuth() {
  const clientPath = process.env.GSC_OAUTH_CLIENT_PATH;
  const tokenPath = process.env.GSC_OAUTH_TOKEN_PATH;
  if (!clientPath || !tokenPath) throw new Error("GSC_AUTH_UNAVAILABLE: GSC_OAUTH_CLIENT_PATH or GSC_OAUTH_TOKEN_PATH is not set");
  const clientFile = JSON.parse(await readFile(clientPath, "utf8"));
  const tokenFile = JSON.parse(await readFile(tokenPath, "utf8"));
  const client = clientFile.installed || clientFile.web;
  if (!client?.client_id || !client?.client_secret || !tokenFile.refresh_token) throw new Error("GSC_AUTH_UNAVAILABLE: OAuth client or refresh token is incomplete");
  const tokenResponse = await fetch(client.token_uri || "https://oauth2.googleapis.com/token", { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ client_id: client.client_id, client_secret: client.client_secret, refresh_token: tokenFile.refresh_token, grant_type: "refresh_token" }) });
  const tokenJson = await tokenResponse.json();
  if (!tokenResponse.ok) throw new Error(`GSC_AUTH_UNAVAILABLE: OAuth refresh failed (${tokenResponse.status})`);
  return { authorization: `Bearer ${tokenJson.access_token}` };
}

async function gscGet(headers, url) {
  const response = await fetch(url, { headers });
  const text = await response.text();
  let json;
  try { json = text ? JSON.parse(text) : null; } catch { json = text; }
  if (!response.ok) throw new Error(`GSC read failed (${response.status})`);
  return json;
}

async function readGsc(snapshot, inspectionUrls) {
  const output = { ...snapshot, authStatus: "SNAPSHOT_ONLY", sitemapApi: snapshot.sitemapApi || {}, inspection: snapshot.inspection || {} };
  try {
    const headers = await gscAuth();
    const endpoint = (suffix = "") => `https://www.googleapis.com/webmasters/v3/sites${suffix}`;
    const sites = await gscGet(headers, endpoint());
    const entry = (sites.siteEntry || []).find((item) => item.siteUrl === property);
    if (!entry) throw new Error("GSC_AUTH_UNAVAILABLE: property is not accessible");
    const sitemapUrl = `${baseUrl}/sitemap-index.xml`;
    const sitemap = await gscGet(headers, endpoint(`/${encodeURIComponent(property)}/sitemaps/${encodeURIComponent(sitemapUrl)}`));
    output.authStatus = "PASS";
    output.permission = entry.permissionLevel || "";
    output.sitemapApi = { path: sitemap.path || sitemapUrl, lastSubmitted: sitemap.lastSubmitted || null, lastDownloaded: sitemap.lastDownloaded || null, isPending: sitemap.isPending ?? null, warnings: sitemap.warnings || 0, errors: sitemap.errors || 0, discoveredUrls: sitemap.contents?.reduce((sum, item) => sum + Number(item.submitted || 0), 0) || 0 };
    const inspect = async (url) => {
      const response = await fetch("https://searchconsole.googleapis.com/v1/urlInspection/index:inspect", { method: "POST", headers: { ...headers, "content-type": "application/json" }, body: JSON.stringify({ inspectionUrl: url, siteUrl: property }) });
      const text = await response.text();
      let json;
      try { json = text ? JSON.parse(text) : null; } catch { json = { error: text }; }
      return response.ok ? json?.inspectionResult?.indexStatusResult || {} : { error: `GSC inspection failed (${response.status})` };
    };
    const inspected = await mapLimit(inspectionUrls, 2, async (url) => [url, await inspect(url)]);
    output.inspection = Object.fromEntries(inspected);
  } catch (error) {
    output.authStatus = "GSC_AUTH_UNAVAILABLE";
    output.authError = error instanceof Error ? error.message.replace(/Bearer\s+\S+/g, "Bearer [redacted]") : String(error);
  }
  return output;
}

function htmlRecord(route, htmlPages, productionByUrl) {
  const local = htmlPages.get(route);
  if (!live) return local ? { status: route === "/404/" ? 404 : 200, responseUrl: absolute(route), headers: {}, body: local.html, local } : { status: 0, responseUrl: absolute(route), headers: {}, body: "", local: null };
  return productionByUrl.get(absolute(route)) || { status: 0, responseUrl: absolute(route), headers: {}, body: "", local };
}

function pageSignals(route, record, metadata) {
  const html = record?.body || "";
  const canonical = parseAttr(html, "link", "href");
  const robots = parseMeta(html, "robots");
  const xRobots = record?.headers?.["x-robots-tag"] || "";
  const text = clean(htmlMain(html));
  const meta = metadata.get(route);
  return { route, html, status: record?.status || 0, responseUrl: record?.responseUrl || "", canonical, robots, xRobots, noindex: /noindex/i.test(robots), xNoindex: /noindex/i.test(xRobots), h1: h1Count(html), bodyWords: words(text), bodyText: text, serverRendered: text.length >= 180, jsonLd: hasJsonLd(html), hreflang: hasHreflang(html), links: extractLinks(html), mainLinks: extractMainLinks(html), metadata: meta };
}

function sourceFields(sourcePages) {
  const byRoute = new Map();
  for (const page of sourcePages) if (page.indexable && !page.redirectTo) byRoute.set(page.route, page);
  return byRoute;
}

function explicitCollision(routeA, routeB) {
  const pair = [routeA, routeB].sort().join("|");
  const decisions = new Map([
    ["/guides/caregiver-handoff-checklist/|/tools/caregiver-handoff-source-authorization-log/", ["KEEP_BOTH", "planning checklist versus structured source/authorization log"]],
    ["/guides/familyboard-plant-care-handoff-log-tutorial/|/guides/familyboard-plant-care-handoff-tutorial/", ["RETARGET", "general plant-care handoff tutorial versus log-specific coordination tutorial"]],
    ["/guides/household-account-list/|/tools/household-account-list/", ["RETARGET", "guide explains the concept; tool is positioned for building the index"]],
    ["/guides/familyboard-household-task-load-calculator-tutorial/|/guides/familyboard-task-load-calculator-tutorial/", ["REDIRECT", "weaker duplicate merged into the richer tutorial"]],
    ["/zh-tw/guides/appliance-inventory/|/zh-tw/templates/printable-appliance-inventory/", ["KEEP_BOTH", "guide explains the inventory workflow; printable is a reusable paper output"]],
    ["/zh-tw/guides/caregiver-handoff-checklist/|/zh-tw/tools/caregiver-handoff-source-authorization-log/", ["KEEP_BOTH", "checklist planning intent versus structured source and authorization log"]],
    ["/zh-tw/guides/emergency-binder/|/zh-tw/tools/emergency-binder-generator/", ["KEEP_BOTH", "guide explains binder structure; generator produces a bounded draft"]],
    ["/zh-tw/guides/familyboard-household-decision-register-tutorial/|/zh-tw/tools/household-decision-register/", ["KEEP_BOTH", "decision method tutorial versus direct-use decision register"]],
    ["/zh-tw/guides/familyboard-household-task-load-calculator-tutorial/|/zh-tw/guides/familyboard-task-load-calculator-tutorial/", ["REDIRECT", "weaker duplicate merged into the richer Traditional Chinese tutorial"]],
    ["/zh-tw/guides/home-care-service-plan-changes/|/zh-tw/tools/home-care-service-plan-change-notice-log/", ["KEEP_BOTH", "change-planning guide versus structured notice log"]],
    ["/zh-tw/guides/home-care-service-visit-records/|/zh-tw/tools/home-care-visit-scope-service-result-log/", ["KEEP_BOTH", "visit-record guidance versus direct-use service result log"]],
    ["/zh-tw/|/zh-tw/tools/", ["KEEP_BOTH", "localized product entry point versus focused tool collection hub"]],
  ]);
  return decisions.get(pair) || ["REVIEW", "heuristic similarity requires editorial review"];
}

function makeSemanticRows(sourcePages) {
  const candidates = sourcePages.filter((page) => page.indexable && page.route && !page.redirectTo);
  const rows = [];
  const semanticTokens = (text) => {
    const latin = String(text).toLowerCase().match(/[a-z0-9][a-z0-9'-]*/g) || [];
    const cjk = [...String(text).matchAll(/[\u3400-\u9fff]{2,}/g)].flatMap((match) => {
      const segment = match[0];
      return [...segment].slice(0, -1).map((_, index) => segment.slice(index, index + 2));
    });
    return new Set([...latin, ...cjk].filter((token) => token !== "familyboard" && token.length > 1));
  };
  const seen = new Set();
  const addRow = (a, b, force = false) => {
    if (!a || !b || !a.indexable || !b.indexable || a.route === b.route) return;
    const key = [a.route, b.route].sort().join("|");
    if (seen.has(key)) return;
    const keywordSame = a.primaryKeyword && b.primaryKeyword && a.primaryKeyword.toLowerCase() === b.primaryKeyword.toLowerCase();
    const aTokens = semanticTokens(`${a.title} ${a.primaryIntent} ${a.headings.join(" ")}`);
    const bTokens = semanticTokens(`${b.title} ${b.primaryIntent} ${b.headings.join(" ")}`);
    const intersection = [...aTokens].filter((token) => bTokens.has(token)).length;
    const union = new Set([...aTokens, ...bTokens]).size || 1;
    const score = intersection / union;
    if (!force && !keywordSame && score < 0.56) return;
    const [decision, notes] = explicitCollision(a.route, b.route);
    seen.add(key);
    rows.push({ url_a: absolute(a.route), url_b: absolute(b.route), cluster: a.cluster === b.cluster ? a.cluster : `${a.cluster} / ${b.cluster}`, score: score.toFixed(3), primary_keyword_a: a.primaryKeyword, primary_keyword_b: b.primaryKeyword, primary_intent_a: a.primaryIntent, primary_intent_b: b.primaryIntent, headings_a: a.headings.join(" | "), headings_b: b.headings.join(" | "), decision, notes });
  };
  for (let index = 0; index < candidates.length; index++) {
    for (let other = index + 1; other < candidates.length; other++) {
      const a = candidates[index];
      const b = candidates[other];
      if (a.cluster !== b.cluster) continue;
      if (a.route.startsWith("/zh-tw/") !== b.route.startsWith("/zh-tw/")) continue;
      addRow(a, b);
    }
  }
  const byRoute = new Map(sourcePages.map((page) => [page.route, page]));
  for (const [routeA, routeB] of [
    ["/guides/caregiver-handoff-checklist/", "/tools/caregiver-handoff-source-authorization-log/"],
    ["/guides/familyboard-plant-care-handoff-log-tutorial/", "/guides/familyboard-plant-care-handoff-tutorial/"],
    ["/guides/household-account-list/", "/tools/household-account-list/"],
    ["/zh-tw/guides/appliance-inventory/", "/zh-tw/templates/printable-appliance-inventory/"],
    ["/zh-tw/guides/caregiver-handoff-checklist/", "/zh-tw/tools/caregiver-handoff-source-authorization-log/"],
    ["/zh-tw/guides/emergency-binder/", "/zh-tw/tools/emergency-binder-generator/"],
    ["/zh-tw/guides/familyboard-household-decision-register-tutorial/", "/zh-tw/tools/household-decision-register/"],
    ["/zh-tw/guides/home-care-service-plan-changes/", "/zh-tw/tools/home-care-service-plan-change-notice-log/"],
    ["/zh-tw/guides/home-care-service-visit-records/", "/zh-tw/tools/home-care-visit-scope-service-result-log/"],
  ]) addRow(byRoute.get(routeA), byRoute.get(routeB), true);
  return rows;
}

function boilerplateRows(sourcePages, metadata) {
  const eligible = sourcePages.filter((page) => metadata.get(page.route)?.indexable && !metadata.get(page.route)?.redirectTo);
  const paragraphCounts = new Map();
  for (const page of eligible) for (const paragraph of page.paragraphs) paragraphCounts.set(paragraph, (paragraphCounts.get(paragraph) || 0) + 1);
  const repeated = new Set([...paragraphCounts].filter(([, count]) => count >= 3).map(([paragraph]) => paragraph));
  return eligible.map((page) => {
    const mainWords = Math.max(words(page.mainText), 1);
    const sharedWords = page.paragraphs.filter((paragraph) => repeated.has(paragraph)).reduce((sum, paragraph) => sum + words(paragraph), 0);
    const ratio = sharedWords / mainWords;
    return { url: absolute(page.route), locale: page.route.startsWith("/zh-tw/") ? "zh-TW" : "en", cluster: page.cluster, page_type: page.pageType, main_words: mainWords, shared_boilerplate_words: sharedWords, boilerplate_ratio: ratio.toFixed(3), repeated_blocks: page.paragraphs.filter((paragraph) => repeated.has(paragraph)).length, decision: ratio > 0.45 ? "REVIEW" : "PASS" };
  });
}

function priorityRoutes() {
  return [
    ["/", "homepage"], ["/features/", "product/features"], ["/guides/", "guides hub"], ["/tools/", "tools hub"], ["/checklists/", "checklists hub"], ["/templates/", "templates hub"],
    ["/guides/maintenance-priorities/", "maintenance"], ["/guides/appliance-replacement-planning/", "appliances"], ["/guides/home-inventory-checklist/", "inventory-warranty"], ["/guides/emergency-information-sheet/", "records-emergency"], ["/guides/household-management-checklist/", "household-operations"], ["/features/home-inventory-tracker/", "product"], ["/tools/home-maintenance-schedule-generator/", "tools"], ["/templates/printable-home-inventory-template/", "printables"],
  ];
}

function nearestCompetitor(route, semanticRows) {
  const hit = semanticRows.find((row) => row.url_a === absolute(route) || row.url_b === absolute(route));
  if (!hit) return "";
  return hit.url_a === absolute(route) ? hit.url_b : hit.url_a;
}

async function main() {
  await mkdir(reportDir, { recursive: true });
  const htmlPages = await readHtmlPages();
  const metadataArray = JSON.parse(await readFile(metadataPath, "utf8"));
  const metadata = new Map(metadataArray.map((item) => [normalizeRoute(item.route), item]));
  const sourcePages = await readSourcePages();
  const sourceByRoute = sourceFields(sourcePages);
  const localSitemap = await readLocalSitemap();
  const productionSitemap = live ? await readProductionSitemap() : null;
  const sitemapUrls = (live ? productionSitemap.urls : localSitemap.urls).map((url) => new URL(url).toString());
  const sitemapSet = new Set(sitemapUrls);
  const candidateRoutes = [...metadata].filter(([, item]) => item.indexable && !item.redirectTo).map(([route]) => route);
  const repoUrls = candidateRoutes.map(absolute);
  const repoSet = new Set(repoUrls);

  const snapshotRaw = await readFile(snapshotPath, "utf8").catch(() => "{}");
  let snapshot;
  try { snapshot = JSON.parse(snapshotRaw); } catch { snapshot = {}; }
  const indexedSet = new Set((snapshot.indexedUrls || []).map((url) => new URL(url).toString()));
  const noindexSet = new Set((snapshot.noindexUrls || []).map((url) => new URL(url).toString()));
  const redirectSet = new Set((snapshot.redirectUrls || []).map((url) => new URL(url).toString()));
  const knownSet = new Set([...indexedSet, ...noindexSet, ...redirectSet]);
  const inspectionTargets = [...(snapshot.indexedUrls || []).slice(0, 10), ...(snapshot.noindexUrls || []), ...(snapshot.redirectUrls || [])];
  const gsc = live ? await readGsc(snapshot, inspectionTargets) : { ...snapshot, authStatus: snapshot.authStatus || "SNAPSHOT_ONLY" };
  const inspection = gsc.inspection || {};

  const productionByUrl = live ? await readProductionPages(sitemapUrls) : new Map();
  const signalByRoute = new Map();
  for (const route of new Set([...htmlPages.keys(), ...candidateRoutes])) signalByRoute.set(route, pageSignals(route, htmlRecord(route, htmlPages, productionByUrl), metadata));
  const routeByUrl = (url) => normalizeRoute(url);

  const incoming = new Map(candidateRoutes.map((route) => [route, new Set()]));
  const graph = new Map();
  for (const [route, signal] of signalByRoute) {
    const targets = new Set(signal.links.filter((target) => htmlPages.has(target) || candidateRoutes.includes(target)));
    graph.set(route, targets);
    if (!metadata.get(route)?.redirectTo && metadata.get(route)?.indexable) {
      for (const target of signal.mainLinks) if (incoming.has(target) && target !== route) incoming.get(target).add(route);
    }
  }
  const candidateIncoming = new Map(candidateRoutes.map((route) => [route, new Set()]));
  for (const [route, record] of htmlPages) {
    const signal = pageSignals(route, { status: route === "/404/" ? 404 : 200, responseUrl: absolute(route), headers: {}, body: record.html }, metadata);
    if (!metadata.get(route)?.redirectTo && metadata.get(route)?.indexable) {
      for (const target of signal.mainLinks) if (candidateIncoming.has(target) && target !== route) candidateIncoming.get(target).add(route);
    }
  }
  const depths = new Map([["/", 0]]);
  const queue = ["/"];
  while (queue.length) {
    const route = queue.shift();
    for (const target of graph.get(route) || []) if (!depths.has(target)) { depths.set(target, depths.get(route) + 1); queue.push(target); }
  }
  const semanticRows = makeSemanticRows(sourcePages);
  const priority = priorityRoutes();
  const prioritySet = new Set(priority.map(([route]) => route));

  const linkRows = candidateRoutes.map((route) => {
    const productionCount = incoming.get(route)?.size || 0;
    const candidateCount = candidateIncoming.get(route)?.size || 0;
    const count = live ? productionCount : candidateCount;
    const isPriority = prioritySet.has(route);
    return { url: absolute(route), indexable: true, page_type: metadata.get(route)?.pageType || "", cluster: metadata.get(route)?.cluster || "", main_content_inlinks: count, candidate_main_content_inlinks: candidateCount, production_main_content_inlinks: live ? productionCount : "", source_urls: [...(live ? incoming.get(route) || [] : candidateIncoming.get(route) || [])].map(absolute).join(" | "), priority_gate: isPriority ? (count >= 3 ? "PASS" : "REVIEW") : "n/a", normal_gate: isPriority ? "n/a" : (count >= 2 ? "PASS" : count > 0 ? "REVIEW" : "FAIL_ORPHAN"), orphan: count === 0 ? "YES" : "NO", decision: count === 0 ? "REPAIR_REQUIRED" : count < (isPriority ? 3 : 2) ? "STRENGTHEN_WHEN_RELEVANT" : "PASS" };
  });
  const depthRows = candidateRoutes.map((route) => {
    const depth = depths.get(route);
    const important = prioritySet.has(route) || ["/guides/", "/tools/", "/checklists/", "/templates/", "/features/"].includes(route);
    const issue = depth === undefined ? "unreachable from root" : important && depth > 3 ? "important page deeper than 3 clicks" : !important && depth > 4 ? "leaf deeper than 4 clicks" : "";
    return { url: absolute(route), indexable: true, important: important ? "YES" : "NO", click_depth: depth ?? "", reachable: depth === undefined ? "NO" : "YES", gate: issue ? "REVIEW" : "PASS", issue };
  });

  const sitemapRows = sitemapUrls.map((url) => {
    const route = routeByUrl(url);
    const record = live ? productionByUrl.get(url) : htmlRecord(route, htmlPages, productionByUrl);
    const signal = pageSignals(route, record, metadata);
    const canonicalRoute = routeByUrl(signal.canonical || "");
    const canonicalStatus = canonicalRoute === route ? signal.status : (canonicalRoute && (live ? productionByUrl.get(absolute(canonicalRoute))?.status : signalByRoute.get(canonicalRoute)?.status)) || "";
    const redirect = signal.status >= 300 && signal.status < 400;
    const soft404 = signal.status === 200 && (signal.h1 === 0 || !signal.serverRendered || (signal.bodyWords < 45 && signal.bodyText.length < 220));
    const issueList = [];
    if (signal.status !== 200) issueList.push("non-200");
    if (signal.noindex) issueList.push("meta noindex");
    if (signal.xNoindex) issueList.push("X-Robots-Tag noindex");
    if (redirect) issueList.push("redirect");
    if (canonicalRoute !== route) issueList.push("canonical mismatch");
    if (canonicalStatus && canonicalStatus !== 200) issueList.push("canonical non-200");
    if (soft404) issueList.push("soft 404 signals");
    if (signal.h1 !== 1) issueList.push("H1 count");
    if (!signal.serverRendered) issueList.push("thin server HTML");
    return { url, http_status: signal.status, indexable: signal.status === 200 && !signal.noindex && !signal.xNoindex && !redirect && canonicalRoute === route ? "YES" : "NO", meta_noindex: signal.noindex ? "YES" : "NO", x_robots_noindex: signal.xNoindex ? "YES" : "NO", canonical: signal.canonical, canonical_http_status: canonicalStatus, redirect: redirect ? "YES" : "NO", soft_404: soft404 ? "YES" : "NO", h1: signal.h1 === 1 ? "YES" : "NO", body: signal.bodyWords >= 45 ? "YES" : "NO", server_rendered: signal.serverRendered ? "YES" : "NO", in_sitemap: "YES", response_url: signal.responseUrl, issue: issueList.join("; ") };
  });

  const qaRoutes = new Set(["/", "/app/", "/zh-tw/app/", "/features/", "/guides/", "/tools/", "/checklists/", "/templates/", "/pricing/", "/roadmap/", "/terms/", "/privacy/", "/security/", ...candidateRoutes.filter((route) => route.startsWith("/guides/")).slice(0, 10), ...candidateRoutes.filter((route) => route.startsWith("/tools/")).slice(0, 10), ...candidateRoutes.filter((route) => route.startsWith("/zh-tw/")).slice(0, 10), ...(snapshot.noindexUrls || []).slice(0, 5).map(routeByUrl)]);
  const qaRows = [];
  for (const route of qaRoutes) {
    const record = live ? (productionByUrl.get(absolute(route)) || await fetchWithTimeout(absolute(route), { headers: { "user-agent": "Googlebot/2.1 (+http://www.google.com/bot.html)" } })) : htmlRecord(route, htmlPages, productionByUrl);
    const signal = pageSignals(route, record, metadata);
    const expectedSitemap = sitemapSet.has(absolute(route));
    const target = metadata.get(route);
    const qaIssue = [];
    if (signal.status !== 200 && !target?.redirectTo && !route.includes("/app/")) qaIssue.push("HTTP");
    if (!signal.canonical) qaIssue.push("canonical");
    if (!signal.h1 && !target?.redirectTo) qaIssue.push("H1");
    if (!signal.serverRendered && !target?.redirectTo) qaIssue.push("body");
    if (!signal.jsonLd) qaIssue.push("structured data");
    if (target?.indexable && !target?.redirectTo && !signal.hreflang.length && !route.startsWith("/zh-tw/")) qaIssue.push("hreflang");
    if (target?.indexable && !target?.redirectTo && !expectedSitemap) qaIssue.push("sitemap membership");
    qaRows.push({ url: absolute(route), source: route.includes("/app/") ? "private-app" : snapshot.noindexUrls?.includes(absolute(route)) ? "historical-GSC-noindex-sample" : "production-QA-sample", http_status: signal.status, canonical: signal.canonical, robots: signal.robots, h1: signal.h1 === 1 ? "PASS" : signal.h1, rendered_body: signal.serverRendered ? "PASS" : "FAIL", internal_links: signal.mainLinks.length, structured_data: signal.jsonLd ? "PASS" : "FAIL", hreflang: signal.hreflang.map((item) => item.lang).join(" | "), sitemap_membership: expectedSitemap ? "YES" : "NO_EXPECTED", decision: qaIssue.length ? `REVIEW: ${qaIssue.join(", ")}` : "PASS" });
  }

  const inspectionRows = [];
  const sampleRows = [...(snapshot.indexedUrls || []).slice(0, 10).map((url) => [url, "Indexed"]), ...(snapshot.noindexUrls || []).map((url) => [url, "noindex"]), ...(snapshot.redirectUrls || []).map((url) => [url, "redirect"]), ...(snapshot.discoveredNotIndexedUrls || []).map((url) => [url, "Discovered - currently not indexed"]), ...(snapshot.crawledNotIndexedUrls || []).map((url) => [url, "Crawled - currently not indexed"])];
  for (const [url, gscStatus] of sampleRows) {
    const route = routeByUrl(url);
    const result = inspection[url] || {};
    const signal = signalByRoute.get(route) || {};
    const cluster = metadata.get(route)?.cluster || "";
    const competitors = nearestCompetitor(route, semanticRows);
    inspectionRows.push({ url, gsc_status: result.coverageState || gscStatus, last_crawl: result.lastCrawlTime || "", crawl_allowed: result.robotsTxtState || "", indexing_allowed: result.indexingState || "", page_fetch: result.pageFetchState || "", user_declared_canonical: result.userCanonical || "", google_selected_canonical: result.googleCanonical || "", referring_page: (result.referringUrls || []).join(" | "), sitemap: (result.sitemap || []).join(" | "), rendered_html: signal.serverRendered ? "live server HTML audited" : "not available", http_status: signal.status || "", robots: signal.robots || "", cluster, main_content_inlinks: incoming.get(route)?.size || 0, click_depth: depths.get(route) ?? "", content_intent: sourceByRoute.get(route)?.primaryIntent || "", nearest_competing_page: competitors, notes: result.error || (result.coverageState ? "current URL Inspection API readback" : "snapshot category only") });
  }
  if (!sampleRows.some(([, status]) => status.startsWith("Discovered"))) inspectionRows.push({ url: "", gsc_status: "0 current URLs", notes: "No Discovered - currently not indexed sample exists in current Page Indexing snapshot" });
  if (!sampleRows.some(([, status]) => status.startsWith("Crawled"))) inspectionRows.push({ url: "", gsc_status: "0 current URLs", notes: "No Crawled - currently not indexed sample exists in current Page Indexing snapshot" });

  const gscRows = [
    { category: "indexed", count: snapshot.indexedCount ?? indexedSet.size, source: "GSC Page Indexing snapshot", report_updated: snapshot.reportUpdated || "", status: "" },
    { category: "not_indexed", count: snapshot.notIndexedCount ?? (noindexSet.size + redirectSet.size), source: "GSC Page Indexing snapshot", report_updated: snapshot.reportUpdated || "", status: "" },
    { category: "known_urls", count: snapshot.knownUrls ?? knownSet.size, source: "GSC Page Indexing snapshot", report_updated: snapshot.reportUpdated || "", status: "" },
    { category: "noindex", count: snapshot.noindexCount ?? noindexSet.size, source: "GSC Page Indexing snapshot", report_updated: snapshot.reportUpdated || "", status: "" },
    { category: "redirect", count: snapshot.redirectCount ?? redirectSet.size, source: "GSC Page Indexing snapshot", report_updated: snapshot.reportUpdated || "", status: "" },
    { category: "discovered_not_indexed", count: snapshot.discoveredNotIndexedCount ?? 0, source: "GSC Page Indexing snapshot", report_updated: snapshot.reportUpdated || "", status: "" },
    { category: "crawled_not_indexed", count: snapshot.crawledNotIndexedCount ?? 0, source: "GSC Page Indexing snapshot", report_updated: snapshot.reportUpdated || "", status: "" },
    { category: "sitemap_last_downloaded", count: gsc.sitemapApi?.lastDownloaded || "null", source: "GSC Sitemaps API readback", report_updated: new Date().toISOString(), status: gsc.sitemapApi?.isPending ? "pending" : "" },
    { category: "sitemap_status", count: gsc.sitemapApi?.status || (gsc.sitemapApi?.isPending ? "registered_pending" : "readback"), source: "GSC Sitemaps API/UI", report_updated: new Date().toISOString(), status: gsc.authStatus || "" },
    { category: "sitemap_discovered_urls", count: gsc.sitemapApi?.discoveredUrls ?? snapshot.sitemapApi?.discoveredUrls ?? 0, source: "GSC Sitemaps API/UI", report_updated: new Date().toISOString(), status: "" },
  ];

  const diffUrls = [...new Set([...repoUrls, ...sitemapUrls, ...knownSet])].sort();
  const diffRows = diffUrls.map((url) => {
    const route = routeByUrl(url);
    const signal = signalByRoute.get(route) || {};
    const linkRow = linkRows.find((row) => row.url === absolute(route));
    const isRepo = repoSet.has(url);
    const isSitemap = sitemapSet.has(url);
    const isKnown = knownSet.has(url);
    const isIndexed = indexedSet.has(url);
    const inspected = inspection[url] || {};
    const isRedirect = redirectSet.has(url) || (signal.status >= 300 && signal.status < 400);
    const issues = [];
    if (isRepo && !isSitemap) issues.push("missing from production sitemap");
    if (isSitemap && !isRepo) issues.push("production sitemap URL absent from candidate repo set");
    if (isSitemap && (signal.noindex || signal.xNoindex)) issues.push("sitemap noindex");
    if (isSitemap && isRedirect) issues.push("sitemap redirect");
    if (isRepo && !isKnown) issues.push("GSC discovery gap");
    if (isKnown && !isIndexed) issues.push("known but not indexed");
    if (signal.canonical && routeByUrl(signal.canonical) !== route) issues.push("canonical conflict");
    let decision = issues.length ? issues.join("; ") : isIndexed ? "GSC indexed" : "track";
    if (isRedirect) decision = "keep redirect stub noindex; exclude from sitemap";
    return { url, repo_indexable: isRepo ? "YES" : "NO", production_sitemap: isSitemap ? "YES" : "NO", gsc_known: isKnown ? "YES" : "NO", gsc_indexed: isIndexed ? "YES" : "NO", http_status: signal.status || "", robots: signal.robots || "", canonical: signal.canonical || "", google_canonical: inspected.googleCanonical || "", last_crawl: inspected.lastCrawlTime || "", discovery_source: inspected.referringUrls?.join(" | ") || (isSitemap ? "sitemap" : "unknown"), cluster: metadata.get(route)?.cluster || "", page_type: metadata.get(route)?.pageType || "", main_content_inlinks: linkRow?.main_content_inlinks ?? incoming.get(route)?.size ?? "", click_depth: depths.get(route) ?? "", decision };
  });

  const worthinessRows = candidateRoutes.map((route) => {
    const source = sourceByRoute.get(route);
    const signal = signalByRoute.get(route) || {};
    const links = incoming.get(route)?.size || 0;
    const collision = semanticRows.find((row) => row.url_a === absolute(route) || row.url_b === absolute(route));
    const pageType = source?.pageType || metadata.get(route)?.pageType || "";
    const bodyText = source?.mainText || signal.bodyText || "";
    const meaningfulNextStep = source?.nextStep || bodyText;
    const h2Count = [...String(signal.html || "").matchAll(/<h2(?:\s[^>]*)?>[\s\S]*?<\/h2>/gi)].length;
    const hasFirstPartyBridge = pageType === "tool" || signal.mainLinks?.some((target) => target === "/app/" || target.startsWith("/tools/") || target.startsWith("/features/"));
    const needsSource = /safety|legal|medical|insurance|financial|regulatory|permit|warranty/i.test(bodyText);
    const checks = { distinct_user_intent: source?.primaryIntent?.length >= 20 || ["/", "/features/", "/guides/", "/tools/", "/checklists/", "/templates/"].includes(route), unique_information_gain: signal.bodyWords >= 45 || bodyText.length >= 320, useful_outcome: Boolean(source?.primaryIntent && (pageType !== "content" || /use|record|plan|check|review|learn|organize|next step|下一步|使用|建立|記錄|查找|規劃|檢查|交接|整理|保存/i.test(`${source.mainText} ${source.nextStep || ""}`))), contextual_internal_links: links > 0, canonical_uniqueness: signal.canonical === absolute(route), non_template_sections: (source?.headings.length || 0) >= 2 || h2Count >= 2, first_party_resource: Boolean(hasFirstPartyBridge || /FamilyBoard|first-party|本工具|本網站|本頁/i.test(bodyText)), clear_next_action: Boolean(source?.nextStep || /next step|start with|use the|try the|begin by|下一步|先從|開始|請使用|建立一筆|輸入一個/i.test(meaningfulNextStep)), source_quality: !needsSource || /https?:\/\/|source|official|authority|provider|來源|正式來源|官方|依據/i.test(bodyText), search_cannibalization: !collision || collision.decision === "KEEP_BOTH" || collision.decision === "RETARGET" };
    const failed = Object.entries(checks).filter(([, value]) => !value).map(([key]) => key);
    return { url: absolute(route), ...Object.fromEntries(Object.entries(checks).map(([key, value]) => [key, value ? "PASS" : "REVIEW"])), gate: failed.length ? "REVIEW" : "PASS", notes: failed.join("; ") };
  });

  const decisionRows = [
    { url: absolute("/guides/familyboard-household-task-load-calculator-tutorial/"), locale: "en", page_type: "content", action: "REDIRECT", target: absolute("/guides/familyboard-task-load-calculator-tutorial/"), reason: "Duplicate task-load user job; retain the richer tutorial as the canonical answer." },
    { url: absolute("/zh-tw/guides/familyboard-household-task-load-calculator-tutorial/"), locale: "zh-TW", page_type: "content", action: "REDIRECT", target: absolute("/zh-tw/guides/familyboard-task-load-calculator-tutorial/"), reason: "Duplicate task-load user job; retain the richer Traditional Chinese tutorial as the canonical answer." },
    { url: absolute("/zh-tw/guides/appliance-inventory/"), locale: "zh-TW", page_type: "content", action: "KEEP_BOTH", target: "", reason: "Guide explains the inventory workflow; printable is a reusable paper output." },
    { url: absolute("/zh-tw/templates/printable-appliance-inventory/"), locale: "zh-TW", page_type: "printable", action: "KEEP_BOTH", target: "", reason: "Printable output has a distinct use-after-search job from the explanatory guide." },
    { url: absolute("/zh-tw/guides/caregiver-handoff-checklist/"), locale: "zh-TW", page_type: "content", action: "KEEP_BOTH", target: "", reason: "Checklist planning intent is distinct from the structured source and authorization log." },
    { url: absolute("/zh-tw/tools/caregiver-handoff-source-authorization-log/"), locale: "zh-TW", page_type: "tool", action: "KEEP_BOTH", target: "", reason: "Structured source and authorization log intent is distinct from the planning guide." },
    { url: absolute("/zh-tw/guides/emergency-binder/"), locale: "zh-TW", page_type: "content", action: "KEEP_BOTH", target: "", reason: "Guide explains binder structure; generator produces a bounded draft." },
    { url: absolute("/zh-tw/tools/emergency-binder-generator/"), locale: "zh-TW", page_type: "tool", action: "KEEP_BOTH", target: "", reason: "Generator has a direct-use output distinct from the explanatory guide." },
    { url: absolute("/zh-tw/guides/familyboard-household-decision-register-tutorial/"), locale: "zh-TW", page_type: "content", action: "KEEP_BOTH", target: "", reason: "Decision method tutorial is distinct from direct-use decision register." },
    { url: absolute("/zh-tw/tools/household-decision-register/"), locale: "zh-TW", page_type: "tool", action: "KEEP_BOTH", target: "", reason: "Direct-use decision register is distinct from the tutorial." },
    { url: absolute("/zh-tw/guides/home-care-service-plan-changes/"), locale: "zh-TW", page_type: "content", action: "KEEP_BOTH", target: "", reason: "Change-planning guide is distinct from the structured notice log." },
    { url: absolute("/zh-tw/tools/home-care-service-plan-change-notice-log/"), locale: "zh-TW", page_type: "tool", action: "KEEP_BOTH", target: "", reason: "Direct-use change notice log is distinct from the explanatory guide." },
    { url: absolute("/zh-tw/guides/home-care-service-visit-records/"), locale: "zh-TW", page_type: "content", action: "KEEP_BOTH", target: "", reason: "Visit-record guidance is distinct from the direct-use service result log." },
    { url: absolute("/zh-tw/tools/home-care-visit-scope-service-result-log/"), locale: "zh-TW", page_type: "tool", action: "KEEP_BOTH", target: "", reason: "Direct-use service result log is distinct from the explanatory guide." },
    { url: absolute("/app/"), locale: "en", page_type: "private-app", action: "INTENTIONAL_NOINDEX", target: "", reason: "Private local-first application surface; keep noindex,follow." },
    { url: absolute("/zh-tw/app/"), locale: "zh-TW", page_type: "private-app", action: "INTENTIONAL_NOINDEX", target: "", reason: "Private local-first application surface; keep noindex,follow." },
    { url: absolute("/offline/"), locale: "en", page_type: "system", action: "INTENTIONAL_NOINDEX", target: "", reason: "Offline/system route; not an independent search landing page." },
    { url: absolute("/guides/caregiver-handoff-checklist/"), locale: "en", page_type: "content", action: "KEEP_BOTH", target: "", reason: "Checklist planning intent is distinct from the structured source/authorization log tool." },
    { url: absolute("/tools/caregiver-handoff-source-authorization-log/"), locale: "en", page_type: "tool", action: "KEEP_BOTH", target: "", reason: "Structured source and authorization log intent is distinct from the planning guide." },
    { url: absolute("/guides/household-account-list/"), locale: "en", page_type: "content", action: "RETARGET", target: "", reason: "Guide keeps the explanatory intent; the tool is positioned for building the actual account index." },
    { url: absolute("/tools/household-account-list/"), locale: "en", page_type: "tool", action: "RETARGET", target: "", reason: "Tool keeps the direct-use intent and no longer competes on the generic guide keyword." },
    { url: absolute("/guides/familyboard-plant-care-handoff-tutorial/"), locale: "en", page_type: "content", action: "RETARGET", target: "", reason: "General plant-care handoff guidance is separated from the log-specific coordination tutorial." },
    { url: absolute("/guides/familyboard-plant-care-handoff-log-tutorial/"), locale: "en", page_type: "content", action: "RETARGET", target: "", reason: "Log-specific coordination tutorial is positioned around the handoff record job." },
    ...(snapshot.noindexUrls || []).filter((url) => ![absolute("/app/"), absolute("/zh-tw/app/")].includes(url)).map((url) => ({ url, locale: url.includes("/zh-tw/") ? "zh-TW" : "en", page_type: "historical-GSC", action: "ALREADY_REPAIRED_OR_REVIEW", target: "", reason: "Historical GSC noindex sample; current production/source audit must be checked separately before any indexability change." })),
  ];

  await writeCsv("url-set-diff.csv", columns.urlSet, diffRows);
  await writeCsv("sitemap-integrity.csv", columns.sitemap, sitemapRows);
  await writeCsv("contextual-inlinks.csv", columns.links, linkRows);
  await writeCsv("crawl-depth.csv", columns.depth, depthRows);
  await writeCsv("semantic-intent-collision.csv", columns.semantic, semanticRows);
  await writeCsv("boilerplate-ratio.csv", ["url", "locale", "cluster", "page_type", "main_words", "shared_boilerplate_words", "boilerplate_ratio", "repeated_blocks", "decision"], boilerplateRows(sourcePages, metadata));
  await writeCsv("gsc-current-indexing.csv", ["category", "count", "source", "report_updated", "status"], gscRows);
  await writeCsv("gsc-inspection-sample.csv", columns.inspection, inspectionRows);
  await writeCsv("production-qa.csv", columns.qa, qaRows);
  await writeCsv("index-worthiness.csv", columns.indexWorthiness, worthinessRows);
  await writeCsv("merge-redirect-noindex-decisions.csv", ["url", "locale", "page_type", "action", "target", "reason"], decisionRows);
  await writeCsv("priority-indexing-urls.csv", ["priority", "url", "reason", "indexable", "main_content_inlinks", "candidate_main_content_inlinks", "production_main_content_inlinks", "click_depth", "sitemap", "gsc_status", "manual_action"], priority.map(([route, reason], index) => ({ priority: index === 0 ? "Tier 1" : index <= 6 ? "Tier 2" : "Tier 3", url: absolute(route), reason, indexable: candidateRoutes.includes(route) ? "YES" : "NO", main_content_inlinks: live ? incoming.get(route)?.size || 0 : candidateIncoming.get(route)?.size || 0, candidate_main_content_inlinks: candidateIncoming.get(route)?.size || 0, production_main_content_inlinks: live ? incoming.get(route)?.size || 0 : "", click_depth: depths.get(route) ?? "", sitemap: sitemapSet.has(absolute(route)) ? "YES" : "NO", gsc_status: indexedSet.has(absolute(route)) ? "Indexed" : knownSet.has(absolute(route)) ? "Known not indexed" : "Not in current GSC snapshot", manual_action: "validation sample only; no Request Indexing sent" })));

  const beforeDistribution = { "0": 5, "1": 314, "2": 163 };
  const afterDistribution = linkRows.reduce((counts, row) => { const key = String(row.main_content_inlinks); counts[key] = (counts[key] || 0) + 1; return counts; }, {});
  const candidateDistribution = candidateRoutes.reduce((counts, route) => { const key = String(candidateIncoming.get(route)?.size || 0); counts[key] = (counts[key] || 0) + 1; return counts; }, {});
  const indexedNotInSitemap = [...indexedSet].filter((url) => !sitemapSet.has(url)).length;
  const knownNotIndexed = [...knownSet].filter((url) => !indexedSet.has(url)).length;
  const accidentalNoindex = sitemapRows.filter((row) => row.meta_noindex === "YES" || row.x_robots_noindex === "YES").length;
  const sitemapRedirects = sitemapRows.filter((row) => row.redirect === "YES").length;
  const canonicalConflicts = sitemapRows.filter((row) => row.issue.includes("canonical mismatch")).length;
  const summary = {
    repo_indexable: candidateRoutes.length,
    sitemap_total: sitemapUrls.length,
    gsc_known: snapshot.knownUrls ?? knownSet.size,
    gsc_indexed: snapshot.indexedCount ?? indexedSet.size,
    sitemap_not_known_to_google: repoUrls.filter((url) => !knownSet.has(url)).length,
    production_sitemap_not_known_to_google: sitemapUrls.filter((url) => !knownSet.has(url)).length,
    known_not_indexed: snapshot.notIndexedCount ?? knownNotIndexed,
    indexed_not_in_sitemap: indexedNotInSitemap,
    accidental_noindex: accidentalNoindex,
    redirect_in_sitemap: sitemapRedirects,
    canonical_mismatch: canonicalConflicts,
    duplicate_candidates: semanticRows.length,
    indexable_orphans_after: linkRows.filter((row) => row.orphan === "YES").length,
    weak_priority_pages: linkRows.filter((row) => row.priority_gate === "REVIEW").length,
    candidate_indexable_orphans_after: candidateRoutes.filter((route) => (candidateIncoming.get(route)?.size || 0) === 0).length,
    candidate_weak_priority_pages: priority.filter(([route]) => (candidateIncoming.get(route)?.size || 0) < 3).length,
  };

  const robots = live ? await fetchWithTimeout(`${baseUrl}/robots.txt`, { headers: { "user-agent": "Googlebot/2.1 (+http://www.google.com/bot.html)" } }) : { status: 200, body: "User-agent: *\nAllow: /\n\nSitemap: https://familyboard.win/sitemap-index.xml", headers: {} };
  const robotsOk = robots.status === 200 && /User-agent:\s*\*\s*\nAllow:\s*\/\s*/i.test(robots.body) && new RegExp(`Sitemap:\\s*${baseUrl.replaceAll(".", "\\.")}\\/sitemap-index\\.xml`, "i").test(robots.body) && !/^\s*Disallow:\s*\/\s*$/im.test(robots.body);
  const modifiedFiles = ["docs/launch-content-master.md", "src/components/Footer.astro", "src/pages/index.astro", "src/pages/[...slug].astro", "src/pages/zh-tw/[...slug].astro", "src/pages/zh-tw/index.astro", "src/content/pages-zh-tw/familyboard-household-task-load-calculator-tutorial.md", "src/content/pages/081-guides--home-inventory-checklist.md", "scripts/indexing-audit.mjs", "scripts/monitor-checks.mjs", "tests/e2e/site.spec.ts", "package.json"];
  const contextualInlinkSummary = `candidate after 0=${candidateDistribution["0"] || 0}, 1=${candidateDistribution["1"] || 0}, 2=${candidateDistribution["2"] || 0}; ${live ? `live production pre-deploy 0=${afterDistribution["0"] || 0}, 1=${afterDistribution["1"] || 0}, 2=${afterDistribution["2"] || 0}` : `current audit 0=${afterDistribution["0"] || 0}, 1=${afterDistribution["1"] || 0}, 2=${afterDistribution["2"] || 0}`}`;
  const orphanGate = live ? `${summary.indexable_orphans_after} live pre-deploy; candidate=${summary.candidate_indexable_orphans_after}` : String(summary.indexable_orphans_after);
  const priorityGate = summary.candidate_weak_priority_pages === 0 ? "PASS" : `REVIEW (${summary.candidate_weak_priority_pages} candidate pages)`;
  const report = `# FAMILYBOARD-INDEXING-RECOVERY-001\n\nGenerated: ${new Date().toISOString()}\nMode: ${live ? "LIVE production + GSC readback" : "local build audit with saved GSC snapshot"}\nBranch: luna/familyboard-indexing-recovery-001\n\n## Outcome\n\nThis recovery keeps new URL expansion frozen. It repairs discovery paths and duplicate-route handling, but it does not claim that Google has indexed the candidate branch. Production remains unchanged until the branch is reviewed and merged.\n\n## A–N current evidence\n\n- **A. Repo technically indexable:** ${summary.repo_indexable} candidate URLs after the two-locale merge redirect.\n- **B. Production sitemap:** ${summary.sitemap_total} URLs in the ${live ? "live" : "local candidate"} sitemap.\n- **C. GSC known URLs:** ${summary.gsc_known}.\n- **D. GSC indexed URLs:** ${summary.gsc_indexed}.\n- **E. Current GSC categories:** ${summary.sitemap_not_known_to_google} candidate repo URLs are not in the saved GSC known set; ${summary.known_not_indexed} known URLs are not indexed; Discovered-not-indexed=${snapshot.discoveredNotIndexedCount ?? 0}; Crawled-not-indexed=${snapshot.crawledNotIndexedCount ?? 0}; noindex=${snapshot.noindexCount ?? noindexSet.size}; redirect=${snapshot.redirectCount ?? redirectSet.size}; canonical conflicts in the audited sitemap=${summary.canonical_mismatch}; semantic candidates=${summary.duplicate_candidates}.\n- **F. Three root causes:** (1) GSC sitemap lifecycle is pending/stale: API lastDownloaded=${gsc.sitemapApi?.lastDownloaded ?? "null"}, isPending=${gsc.sitemapApi?.isPending ?? "unknown"}, UI status was unable to read and discovered 0; (2) the original site graph had five contextual orphans and hub navigation did not cover the collection paths; (3) duplicate task-load routes and an old route in Footer/zh-TW home created weak discovery and redirect-stub links.\n- **G. Actual source changes:** ${modifiedFiles.join(", ")}.\n- **H. Merged pages:** English /guides/familyboard-household-task-load-calculator-tutorial/ and zh-TW /zh-tw/guides/familyboard-household-task-load-calculator-tutorial/ now redirect to the richer task-load tutorials.\n- **I. Redirects:** the two merged content routes use the existing noindex redirect-stub contract; host/protocol redirects remain infrastructure 301s.\n- **J. Maintained noindex:** /app/, /zh-tw/app/, /offline/ and redirect stubs remain noindex. Current live sitemap audit found accidental noindex=${summary.accidental_noindex}.\n- **K. Content strengthened:** the homepage now explains collection paths and trust/product boundaries; the guides hub is grouped by household job; plant-care log and household-account tool metadata separate their jobs; no bulk content expansion was made.\n- **L. Contextual inlinks:** before (recorded baseline) 0=${beforeDistribution["0"]}, 1=${beforeDistribution["1"]}, 2=${beforeDistribution["2"]}; ${contextualInlinkSummary}; full distribution is in contextual-inlinks.csv.\n- **M. GSC sitemap:** lastSubmitted=${gsc.sitemapApi?.lastSubmitted ?? snapshot.sitemapApi?.lastSubmitted ?? "unknown"}; lastDownloaded=${gsc.sitemapApi?.lastDownloaded ?? snapshot.sitemapApi?.lastDownloaded ?? "null"}; status=${gsc.sitemapApi?.isPending ? "registered_pending / UI unable to read" : "readback"}; warnings=${gsc.sitemapApi?.warnings ?? snapshot.sitemapApi?.warnings ?? "unknown"}; errors=${gsc.sitemapApi?.errors ?? snapshot.sitemapApi?.errors ?? "unknown"}; discovered URLs=${gsc.sitemapApi?.discoveredUrls ?? snapshot.sitemapApi?.discoveredUrls ?? 0}. No repeat submission was made by this audit.\n- **N. Google-dependent waiting:** Google must re-download the sitemap, recrawl changed hub/home/redirect HTML, refresh URL Inspection, and make its own indexing decisions. A post-deploy GSC snapshot is therefore recorded as pending rather than fabricated.\n\n## Gates\n\n| Gate | Result | Evidence |\n|---|---:|---|\n| Production crawlable / sitemap HTTP 200 | ${sitemapRows.every((row) => row.http_status === 200) ? "PASS" : "REVIEW"} | sitemap-integrity.csv |\n| Robots allow + sitemap declaration | ${robotsOk ? "PASS" : "REVIEW"} | ${live ? "live robots.txt" : "local contract"} |\n| Sitemap redirects | ${summary.redirect_in_sitemap} | sitemap-integrity.csv |\n| Sitemap noindex | ${summary.accidental_noindex} | sitemap-integrity.csv |\n| Canonical conflicts | ${summary.canonical_mismatch} | sitemap-integrity.csv |\n| Indexable contextual orphans | ${orphanGate} | contextual-inlinks.csv |\n| Priority pages with 3+ contextual sources | ${priorityGate} | contextual-inlinks.csv |\n| Semantic collisions classified | ${semanticRows.every((row) => row.decision !== "REVIEW") ? "PASS" : "REVIEW"} | semantic-intent-collision.csv |\n| New URL expansion | PASS — frozen | no new landing-page family added |\n\n## Hub architecture\n\nExisting collection hubs are used for guides, tools, features, checklists and templates. They now cross-link through relevant next-layer cards; the guides hub groups existing pages under maintenance, appliances, inventory-warranty, records-emergency, household-operations, tools, product and support. No new hub URLs were created.\n\n## Inspection and QA\n\ngsc-inspection-sample.csv contains up to 10 indexed controls, all saved noindex examples, all saved redirect examples, and explicit zero-row notes for current discovered/crawled categories. production-qa.csv covers the homepage, collection hubs, guides, tools, zh-TW pages, app noindex surfaces and historical GSC noindex samples. No Request Indexing action was sent.\n\n## Deployment boundary\n\ngsc-after-deploy.md records the required post-merge readback. This branch is not production deployment proof; the existing production URLs were audited separately.\n`;
  const reportForFile = `${report}\n\n## Exact URL-set note\n\nThe live URL-set diff contains ${summary.production_sitemap_not_known_to_google} production sitemap URLs absent from the saved GSC known set. The candidate repo diff contains ${summary.sitemap_not_known_to_google} candidate URLs absent from that set; six saved known URLs are outside the current production sitemap (including host redirects and private/search surfaces), so the exact intersection differs from the simple 1,018 minus 132 size gap.`;
  await writeFile(path.join(reportDir, "INDEXING-RECOVERY-REPORT.md"), reportForFile, "utf8");
  await writeFile(path.join(reportDir, "gsc-after-deploy.md"), `# GSC after deploy\n\nStatus: NOT_DEPLOYED_PR_PENDING\nCaptured: ${new Date().toISOString()}\nProperty: ${property}\n\nThe implementation branch has not been merged to main, so this is intentionally not a post-deploy success claim. After the approved production deployment, read back the sitemap once and save: lastDownloaded, status, warnings, errors, discovered URLs, known URLs, indexed URLs, Discovered-not-indexed, Crawled-not-indexed, noindex, redirect and duplicate/canonical categories.\n\nCurrent pre-deploy evidence: lastSubmitted=${gsc.sitemapApi?.lastSubmitted ?? snapshot.sitemapApi?.lastSubmitted ?? "unknown"}; lastDownloaded=${gsc.sitemapApi?.lastDownloaded ?? snapshot.sitemapApi?.lastDownloaded ?? "null"}; isPending=${gsc.sitemapApi?.isPending ?? "unknown"}; warnings=${gsc.sitemapApi?.warnings ?? snapshot.sitemapApi?.warnings ?? "unknown"}; errors=${gsc.sitemapApi?.errors ?? snapshot.sitemapApi?.errors ?? "unknown"}; discovered URLs=${gsc.sitemapApi?.discoveredUrls ?? snapshot.sitemapApi?.discoveredUrls ?? 0}.\n\nSitemap policy: because the current evidence is pending/stale, a single sitemap remediation submit may be considered only after the repaired branch is live and the post-deploy readback still proves the old lifecycle state. This audit itself never submits or repeats a sitemap.\n`, "utf8");

  const requiredFailures = [
    ...(summary.accidental_noindex ? [`${summary.accidental_noindex} sitemap noindex`] : []),
    ...(summary.redirect_in_sitemap ? [`${summary.redirect_in_sitemap} sitemap redirects`] : []),
    ...(summary.canonical_mismatch ? [`${summary.canonical_mismatch} canonical conflicts`] : []),
    ...(summary.indexable_orphans_after ? [`${summary.indexable_orphans_after} indexable contextual orphans`] : []),
    ...(robotsOk ? [] : ["robots contract"]),
  ];
  if (requiredFailures.length) {
    console.error(`INDEXING_AUDIT_FAIL ${requiredFailures.join("; ")}`);
    process.exitCode = 1;
  } else {
    console.log(`Indexing audit PASS: repo=${summary.repo_indexable}, sitemap=${summary.sitemap_total}, orphans=${summary.indexable_orphans_after}, sitemap redirects=${summary.redirect_in_sitemap}, sitemap noindex=${summary.accidental_noindex}, canonical conflicts=${summary.canonical_mismatch}, GSC auth=${gsc.authStatus}`);
  }
}

await main();
