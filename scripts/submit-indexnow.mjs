// IndexNow submission is opt-in. Use --initial-full once at launch or pass explicit --url values.
const HOST = "familyboard.win";
const ORIGIN = `https://${HOST}`;
const KEY = "06049c9105ef4f959d905baefcd0b0be";
const KEY_LOCATION = `${ORIGIN}/${KEY}.txt`;
const ENDPOINT = "https://api.indexnow.org/indexnow";

const args = process.argv.slice(2);
const initialFull = args.includes("--initial-full");
const dryRun = args.includes("--dry-run");
const explicitUrls = args
  .map((arg, index) => (arg === "--url" ? args[index + 1] : null))
  .filter(Boolean);

if (!initialFull && explicitUrls.length === 0) {
  throw new Error(
    "Refusing implicit bulk submission. Use --initial-full once or pass one or more --url <https://familyboard.win/...> values.",
  );
}

async function fetchText(url) {
  const response = await fetch(url, {
    redirect: "follow",
    signal: AbortSignal.timeout(20000),
    headers: { "user-agent": "FamilyBoard-IndexNow/1.0" },
  });
  const text = await response.text();
  if (!response.ok) throw new Error(`Fetch ${url} failed (${response.status}).`);
  return text;
}

const locs = (xml) =>
  [...xml.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/gi)].map((match) =>
    match[1].replaceAll("&amp;", "&"),
  );

async function sitemapUrls(url, seen = new Set()) {
  if (seen.has(url)) return [];
  seen.add(url);
  const xml = await fetchText(url);
  const found = locs(xml);
  if (/<sitemapindex\b/i.test(xml)) {
    const children = await Promise.all(found.map((child) => sitemapUrls(child, seen)));
    return [...new Set(children.flat())];
  }
  if (!/<urlset\b/i.test(xml)) throw new Error(`${url} is not a sitemap document.`);
  return [...new Set(found)];
}

const candidates = initialFull
  ? await sitemapUrls(`${ORIGIN}/sitemap-index.xml`)
  : explicitUrls;
const urlList = [...new Set(candidates.map((value) => new URL(value).href))];

for (const url of urlList) {
  if (new URL(url).hostname !== HOST) throw new Error(`URL is outside ${HOST}: ${url}`);
}
if (urlList.length === 0) throw new Error("No URLs were found for submission.");
if (urlList.length > 10000) throw new Error(`IndexNow maximum is 10,000 URLs; found ${urlList.length}.`);

const payload = { host: HOST, key: KEY, keyLocation: KEY_LOCATION, urlList };
if (dryRun) {
  console.log(JSON.stringify({
    mode: "dry-run",
    endpoint: ENDPOINT,
    host: HOST,
    keyLocation: KEY_LOCATION,
    urlCount: urlList.length,
    sample: urlList.slice(0, 5),
  }, null, 2));
  process.exit(0);
}

const keyResponse = await fetch(KEY_LOCATION, {
  signal: AbortSignal.timeout(20000),
  headers: { "user-agent": "FamilyBoard-IndexNow/1.0" },
});
const keyBody = (await keyResponse.text()).trim();
if (!keyResponse.ok || keyBody !== KEY) {
  throw new Error(`Public IndexNow key verification failed (${keyResponse.status}).`);
}

const response = await fetch(ENDPOINT, {
  method: "POST",
  signal: AbortSignal.timeout(30000),
  headers: {
    "content-type": "application/json; charset=utf-8",
    "user-agent": "FamilyBoard-IndexNow/1.0",
  },
  body: JSON.stringify(payload),
});
const responseBody = (await response.text()).trim();
const accepted = response.status === 200 || response.status === 202;
console.log(JSON.stringify({
  mode: initialFull ? "initial-full" : "explicit-urls",
  endpoint: ENDPOINT,
  status: response.status,
  accepted,
  urlCount: urlList.length,
  keyLocation: KEY_LOCATION,
  response: responseBody || null,
}, null, 2));
if (!accepted) process.exitCode = 2;
