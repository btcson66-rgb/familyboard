import { readFile } from "node:fs/promises";

const apply = process.argv.includes("--apply");
const clientPath = process.env.GA_OAUTH_CLIENT_PATH;
const tokenPath = process.env.GA_OAUTH_TOKEN_PATH;
const requestedAccount = process.env.GA_ACCOUNT_ID?.replace(/^accounts\//, "");

if (!clientPath || !tokenPath) {
  throw new Error("Set GA_OAUTH_CLIENT_PATH and GA_OAUTH_TOKEN_PATH. Credentials are never stored in this repository.");
}

const clientFile = JSON.parse(await readFile(clientPath, "utf8"));
const tokenFile = JSON.parse(await readFile(tokenPath, "utf8"));
const client = clientFile.installed || clientFile.web;
const tokenResponse = await fetch(client.token_uri || "https://oauth2.googleapis.com/token", {
  method: "POST",
  headers: { "content-type": "application/x-www-form-urlencoded" },
  body: new URLSearchParams({
    client_id: client.client_id,
    client_secret: client.client_secret,
    refresh_token: tokenFile.refresh_token,
    grant_type: "refresh_token",
  }),
});
const tokenJson = await tokenResponse.json();
if (!tokenResponse.ok) throw new Error(`OAuth refresh failed (${tokenResponse.status}): ${tokenJson.error_description || tokenJson.error}`);

const api = async (path, options = {}) => {
  const response = await fetch(`https://analyticsadmin.googleapis.com/v1beta/${path}`, {
    ...options,
    headers: {
      authorization: `Bearer ${tokenJson.access_token}`,
      "content-type": "application/json",
      ...options.headers,
    },
  });
  const text = await response.text();
  let json = null;
  try { json = text ? JSON.parse(text) : null; } catch { json = text; }
  return { response, json };
};

const summaries = await api("accountSummaries?pageSize=200");
if (!summaries.response.ok) throw new Error(`Analytics accountSummaries failed (${summaries.response.status}): ${summaries.json?.error?.message || summaries.json}`);

for (const account of summaries.json.accountSummaries || []) {
  console.log(`ACCOUNT ${account.account.replace("accounts/", "")} ${account.displayName}`);
  for (const property of account.propertySummaries || []) {
    console.log(`  PROPERTY ${property.property.replace("properties/", "")} ${property.displayName}`);
  }
}

const allProperties = (summaries.json.accountSummaries || []).flatMap((account) =>
  (account.propertySummaries || []).map((property) => ({ ...property, account: account.account })),
);
let familyBoard = allProperties.find((property) => property.displayName === "FamilyBoard");

if (!familyBoard && apply) {
  if (!requestedAccount) throw new Error("Set GA_ACCOUNT_ID before --apply so the property cannot be created in the wrong Analytics account.");
  const created = await api("properties", {
    method: "POST",
    body: JSON.stringify({
      parent: `accounts/${requestedAccount}`,
      displayName: "FamilyBoard",
      timeZone: "Asia/Taipei",
      currencyCode: "TWD",
    }),
  });
  console.log(`CREATE_PROPERTY ${created.response.status} ${created.response.ok ? "PASS" : "FAIL"}`);
  if (!created.response.ok) {
    console.error(created.json?.error?.message || created.json);
    process.exitCode = 2;
    process.exit();
  }
  familyBoard = { property: created.json.name, displayName: created.json.displayName };
}

if (!familyBoard) {
  console.log("PROPERTY MISSING FamilyBoard");
  console.log("DRY_RUN Reauthorize with analytics.edit, then set GA_ACCOUNT_ID and use --apply.");
  process.exit();
}

console.log(`PROPERTY ACCESSIBLE ${familyBoard.property}`);
const streams = await api(`${familyBoard.property}/dataStreams?pageSize=200`);
if (!streams.response.ok) throw new Error(`Analytics dataStreams.list failed (${streams.response.status}): ${streams.json?.error?.message || streams.json}`);
let stream = (streams.json.dataStreams || []).find((candidate) => candidate.displayName === "FamilyBoard Web");

if (!stream && apply) {
  const created = await api(`${familyBoard.property}/dataStreams`, {
    method: "POST",
    body: JSON.stringify({
      type: "WEB_DATA_STREAM",
      displayName: "FamilyBoard Web",
      webStreamData: { defaultUri: "https://familyboard.win/" },
    }),
  });
  console.log(`CREATE_STREAM ${created.response.status} ${created.response.ok ? "PASS" : "FAIL"}`);
  if (!created.response.ok) {
    console.error(created.json?.error?.message || created.json);
    process.exitCode = 2;
    process.exit();
  }
  stream = created.json;
}

if (stream) {
  console.log(`STREAM ACCESSIBLE ${stream.name} ${stream.displayName}`);
  console.log(`MEASUREMENT_ID ${stream.webStreamData?.measurementId || "MISSING"}`);
} else {
  console.log("STREAM MISSING FamilyBoard Web");
}
