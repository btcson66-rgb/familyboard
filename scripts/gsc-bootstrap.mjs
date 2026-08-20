import { readFile } from "node:fs/promises";

const apply = process.argv.includes("--apply");
const siteUrl = "sc-domain:familyboard.win";
const sitemapUrl = "https://familyboard.win/sitemap-index.xml";
const clientPath = process.env.GSC_OAUTH_CLIENT_PATH;
const tokenPath = process.env.GSC_OAUTH_TOKEN_PATH;

if (!clientPath || !tokenPath) {
  throw new Error(
    "Set GSC_OAUTH_CLIENT_PATH and GSC_OAUTH_TOKEN_PATH. Credentials are never stored in this repository.",
  );
}

const clientFile = JSON.parse(await readFile(clientPath, "utf8"));
const tokenFile = JSON.parse(await readFile(tokenPath, "utf8"));
const client = clientFile.installed || clientFile.web;

if (!client?.client_id || !client?.client_secret || !tokenFile.refresh_token) {
  throw new Error("OAuth client or refresh token is incomplete.");
}

const tokenResponse = await fetch(
  client.token_uri || "https://oauth2.googleapis.com/token",
  {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: client.client_id,
      client_secret: client.client_secret,
      refresh_token: tokenFile.refresh_token,
      grant_type: "refresh_token",
    }),
  },
);
const tokenJson = await tokenResponse.json();
if (!tokenResponse.ok)
  throw new Error(
    `OAuth refresh failed (${tokenResponse.status}): ${tokenJson.error_description || tokenJson.error}`,
  );

const headers = { authorization: `Bearer ${tokenJson.access_token}` };
const endpoint = (suffix = "") =>
  `https://www.googleapis.com/webmasters/v3/sites${suffix}`;
const getJson = async (url, options = {}) => {
  const response = await fetch(url, {
    ...options,
    headers: { ...headers, ...options.headers },
  });
  const text = await response.text();
  let json;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = text;
  }
  return { response, json };
};

const listSites = async () => {
  const { response, json } = await getJson(endpoint());
  if (!response.ok)
    throw new Error(
      `Search Console sites.list failed (${response.status}): ${json?.error?.message || json}`,
    );
  return json.siteEntry || [];
};

let sites = await listSites();
let entry = sites.find((candidate) => candidate.siteUrl === siteUrl);
console.log(`PROPERTY ${entry ? "ACCESSIBLE" : "MISSING"} ${siteUrl}`);

if (!entry && apply) {
  const { response, json } = await getJson(
    endpoint(`/${encodeURIComponent(siteUrl)}`),
    { method: "PUT" },
  );
  console.log(
    `ADD_PROPERTY ${response.status} ${response.ok ? "PASS" : "FAIL"}`,
  );
  if (!response.ok) console.error(json?.error?.message || json);
  sites = await listSites();
  entry = sites.find((candidate) => candidate.siteUrl === siteUrl);
}

if (entry) {
  console.log(`PERMISSION ${entry.permissionLevel}`);
  if (apply) {
    const sitemapEndpoint = endpoint(
      `/${encodeURIComponent(siteUrl)}/sitemaps/${encodeURIComponent(sitemapUrl)}`,
    );
    const submit = await getJson(sitemapEndpoint, { method: "PUT" });
    console.log(
      `SUBMIT_SITEMAP ${submit.response.status} ${submit.response.ok ? "PASS" : "FAIL"}`,
    );
    if (!submit.response.ok)
      console.error(submit.json?.error?.message || submit.json);
    const status = await getJson(sitemapEndpoint);
    console.log(
      `SITEMAP_READBACK ${status.response.status} ${status.response.ok ? "PASS" : "FAIL"}`,
    );
    if (status.response.ok) {
      console.log(
        JSON.stringify(
          {
            path: status.json.path,
            lastSubmitted: status.json.lastSubmitted || null,
            lastDownloaded: status.json.lastDownloaded || null,
            isPending: status.json.isPending ?? null,
            warnings: status.json.warnings || 0,
            errors: status.json.errors || 0,
          },
          null,
          2,
        ),
      );
    } else console.error(status.json?.error?.message || status.json);
  }
} else if (!apply) {
  console.log(
    "DRY_RUN Use --apply to attempt property addition after Google ownership is available.",
  );
} else {
  console.log(
    "BLOCKED Search Console ownership verification is required before sitemap submission.",
  );
  process.exitCode = 2;
}
