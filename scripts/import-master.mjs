import fs from "node:fs";
import path from "node:path";
import {
  authoringField,
  bodyFromMasterBlock,
  nextStepField,
  parseFaq,
  renderGeneratedMarkdown,
} from "./lib/content-import.mjs";
import { countBodyWords } from "./lib/word-count.mjs";

const source = path.resolve(process.argv[2] || "docs/launch-content-master.md");
const outputDir = path.resolve("src/content/pages");
const searchOutput = path.resolve("src/generated/search-index.json");
const sitemapOutput = path.resolve("src/generated/sitemap-pages.json");
const launchDate = "2026-08-19";
const minimumCorePages = 200;
// Navigational entry points. These are how crawlers reach everything else, so they
// stay indexable regardless of body length; a short hub is not the thin-content
// problem the depth hold exists to solve. They still owe real depth — see
// docs/CONTENT_DEPTH_STANDARD.md — but they must never be dropped from the index.
const structuralRoutes = new Set(["/", "/features/"]);

if (!fs.existsSync(source))
  throw new Error(`Master brief not found: ${source}`);
const raw = fs.readFileSync(source, "utf8").replace(/\r\n/g, "\n");
const lines = raw.split("\n");

function clusterFor(number) {
  if (number <= 20) return "product";
  if (number <= 50) return "maintenance";
  if (number <= 80) return "appliances";
  if (number <= 105) return "inventory-warranty";
  if (number <= 130) return "records-emergency";
  if (number <= 155) return "household-operations";
  if (number <= 180) return "tools";
  return "printables";
}

function normalizeRoute(value) {
  if (value === "/") return "/";
  return `/${value.replace(/^\/+|\/+$/g, "")}/`;
}

function idFor(route, prefix = "") {
  return `${prefix}${route === "/" ? "home" : route.replace(/^\/+|\/+$/g, "").replaceAll("/", "--")}`;
}

function normalizeHeadingOrder(markdown) {
  let currentLevel = 0;
  return markdown
    .split("\n")
    .map((line) => {
      const match = line.match(/^(#{1,6})\s+(.+)$/);
      if (!match) return line;
      let level = match[1].length;
      if (currentLevel && level > currentLevel + 1) level = currentLevel + 1;
      currentLevel = level;
      return `${"#".repeat(level)} ${match[2]}`;
    })
    .join("\n");
}

const headingIndexes = [];
for (let i = 0; i < lines.length; i += 1) {
  if (/^## Page \d{3} — /.test(lines[i])) headingIndexes.push(i);
}

const records = headingIndexes.map((start, index) => {
  const endCandidates = [
    headingIndexes[index + 1],
    lines.findIndex((line, i) => i > start && line.startsWith("# PART III")),
    lines.findIndex(
      (line, i) => i > start && line.startsWith("# END OF MASTER CONTENT + BUILD BRIEF"),
    ),
  ].filter((candidate) => candidate >= 0);
  const end = endCandidates.length ? Math.min(...endCandidates) : lines.length;
  const heading = lines[start];
  const match = heading.match(/^## Page (\d{3}) — (.+)$/);
  const number = Number(match[1]);
  const name = match[2].trim();
  const block = lines.slice(start + 1, end < 0 ? lines.length : end).join("\n");
  const route = normalizeRoute(authoringField(block, "Slug"));
  const title = authoringField(block, "Title tag") || name;
  const description = authoringField(block, "Meta description");
  const primaryIntent = authoringField(block, "Primary intent");
  const primaryKeyword = authoringField(block, "Primary keyword concept");
  const redirectValue = authoringField(block, "Redirects to");
  const relatedRaw =
    block.match(/\*\*Suggested internal links:\*\*\s*([^\n]+)/i)?.[1] || "";
  const related = [...relatedRaw.matchAll(/`(\/[^`]+)`/g)].map((m) =>
    normalizeRoute(m[1]),
  );
  const cluster = authoringField(block, "Cluster") || clusterFor(number);
  const explicitPageType = authoringField(block, "Page type");
  return {
    id: `${String(number).padStart(3, "0")}-${idFor(route)}`,
    number,
    title,
    description,
    route,
    primaryIntent,
    primaryKeyword,
    cluster,
    pageType:
      explicitPageType ||
      (cluster === "tools"
        ? "tool"
        : cluster === "printables"
          ? "printable"
          : "content"),
    indexable: true,
    depthVerified: authoringField(block, "Depth").toLowerCase() === "verified",
    lastReviewedAt: authoringField(block, "Editorial review date") || launchDate,
    publishedAt: authoringField(block, "Published date") || launchDate,
    contentVersion: Number(authoringField(block, "Content version")) || 1,
    redirectTo: redirectValue ? normalizeRoute(redirectValue) : "",
    nextStep: nextStepField(block).replaceAll("`", ""),
    faq: parseFaq(block),
    related,
    body: bodyFromMasterBlock(block),
  };
});

const partThreeStart = lines.findIndex((line) => line.startsWith("# PART III"));
const partFourStart = lines.findIndex((line) => line.startsWith("# PART IV"));
const supportLines = lines.slice(partThreeStart, partFourStart);
const supportIndexes = [];
for (let i = 0; i < supportLines.length; i += 1) {
  if (/^## Supporting Page [A-Z]+ — /.test(supportLines[i]))
    supportIndexes.push(i);
}

const supportRecords = supportIndexes
  .map((start, index) => {
    const end = supportIndexes[index + 1] ?? supportLines.length;
    const heading = supportLines[start];
    const name = heading.replace(/^## Supporting Page [A-Z]+ — /, "").trim();
    const block = supportLines.slice(start + 1, end).join("\n");
    const route = normalizeRoute(authoringField(block, "Slug"));
    const title = authoringField(block, "Title tag") || name;
    const description =
      authoringField(block, "Meta description") ||
      `${name} for the free, local-first FamilyBoard household organizer.`;
    const indexable = !/No/i.test(authoringField(block, "Indexable"));
    const redirectValue = authoringField(block, "Redirects to");
    return {
      id: `support-${idFor(route)}`,
      title,
      description,
      route,
      primaryIntent: "support FamilyBoard users",
      primaryKeyword: "",
      cluster: "support",
      pageType: "support",
      indexable,
      depthVerified: false,
      contentVersion: Number(authoringField(block, "Content version")) || 1,
      redirectTo: redirectValue ? normalizeRoute(redirectValue) : "",
      nextStep: nextStepField(block).replaceAll("`", ""),
      faq: parseFaq(block),
      related: [],
      body: bodyFromMasterBlock(block),
    };
  })
  .filter((record) => record.route !== "/app/");

const currentReleaseNotes = `\n\n## Version 1.4.0 — August 20, 2026\n\nThis data-durability release adds a single household master-table CSV for bulk review and editing, with a blank template, pre-import preview, row-level validation, stable-ID merge and safe append modes. Every import first downloads a complete JSON safety snapshot, then commits valid rows in one local database transaction. The app also adds browser durable-storage controls, stale-backup reminders, localized file selectors and relationship-integrity checks. CSV is intended for spreadsheet workflows; JSON and encrypted JSON remain the complete disaster-recovery formats.\n\n## Version 1.3.0 — August 20, 2026\n\nThis interface and discoverability release adds a complete Traditional Chinese application at /zh-tw/app/, with localized onboarding, navigation, forms, dynamic status text, handoff, display and backup workflows sharing the same local database as the English interface. It also introduces the generated FamilyBoard brand mark, a clearer homepage and app visual hierarchy, direct-answer content blocks, Organization/WebSite/WebApplication structured data, bilingual app privacy monitoring and expanded desktop/mobile accessibility coverage.\n\n## Version 1.2.3 — August 20, 2026\n\nThis analytics activation release connects the dedicated FamilyBoard GA4 property and Web stream through a protected build variable while preserving the analytics-free private application boundary.`;

const supportEnhancements = {
  "/changelog/": `\n\n## Version 1.2.0 — August 20, 2026\n\nThis bilingual discovery release adds a Traditional Chinese (Taiwan) locale foundation and three independently written, indexable pages: the FamilyBoard introduction, a Taiwan-focused home-maintenance schedule guide and a working warranty-expiration calculator. Direct English/zh-TW pairs publish reciprocal hreflang and x-default links, localized navigation, in-language article and FAQ structured data, Taiwan-government sources, CJK-aware content inventory and desktop/mobile accessibility coverage. The live monitor now checks both locales and sitemap inclusion.\n\n## Version 1.1.0 — August 20, 2026\n\nThis reliability release adds a tested v1-to-v2 IndexedDB migration, migration history, metadata-only attachment records, authenticated backup metadata, validate-only backup summaries, restore-from-first-run, storage health, household member management, handoff profiles, maintenance history detail, tool copy/download/save-to-app actions, an explicit PWA update flow and pre-cached offline app assets. It also adds linting, full app-lifecycle E2E coverage, breadcrumb and article structured data, privacy-safe analytics events, complete URL inventory fields and six-route Lighthouse evidence. Public paid-product promotion was removed while the free product builds usage evidence.\n\n## Version 1.0.0 — August 19, 2026\n\nThe first production release adds the complete local-first household dashboard, assets, maintenance history, tasks, calendar events, warranty and subscription records, emergency contacts, document references, handoff and family display modes, versioned backup/restore, encrypted exports, offline support, 200 launch content pages, 25 working public tools and 20 printable resources. Known limitation: v1 uses one household in one browser and does not provide cloud sync or accounts.`,
  "/templates/": `\n\n## How to use a template well\n\nStart with the smallest set of fields needed for the household decision. Date the sheet, name the person responsible for reviewing it and avoid copying sensitive account or identity information into a document that will be displayed or stored openly. The digital app can connect a record to its asset and history; the printable version is useful for a temporary handoff, meeting or offline reference. Review the final sheet before sharing and destroy outdated sensitive copies appropriately.`,
};
for (const record of supportRecords) {
  if (record.route === "/changelog/") record.body += currentReleaseNotes;
  if (supportEnhancements[record.route])
    record.body += supportEnhancements[record.route];
}

const extraRecords = [
  {
    id: "support-editorial-policy",
    title: "Editorial Policy | FamilyBoard",
    description:
      "How FamilyBoard plans, edits, sources and corrects household-management content.",
    route: "/editorial-policy/",
    primaryIntent: "understand FamilyBoard editorial standards",
    primaryKeyword: "FamilyBoard editorial policy",
    cluster: "support",
    pageType: "support",
    indexable: true,
    related: ["/about/", "/contact/"],
    body: `# Editorial Policy\n\nFamilyBoard publishes practical household-organization content to support the software's main purpose: helping people keep home records, recurring responsibilities and maintenance information understandable.\n\n## How pages are prepared\n\nSome first-draft writing and content organization may be assisted by AI tools. Each launch page starts with a distinct user question supplied in the approved editorial plan and is checked for consistency, duplicate-content risk, unsupported claims, working links and product relevance before publication. Automation is not a reason to publish a page that adds no distinct value.\n\n## Safety and accuracy\n\nFor maintenance, safety, legal, medical, insurance or manufacturer-specific questions, FamilyBoard avoids presenting generic advice as authoritative when the correct answer depends on equipment, jurisdiction or professional guidance. Follow manufacturer documentation, official local guidance and qualified professionals where appropriate.\n\n## Corrections\n\nFound an error? [Send the page URL and a reliable supporting source](/contact/). We update review dates only after a meaningful editorial review.`,
  },
  {
    id: "support-affiliate-disclosure",
    title: "Affiliate Disclosure | FamilyBoard",
    description:
      "How contextual product recommendations and affiliate links support FamilyBoard without changing editorial advice.",
    route: "/affiliate-disclosure/",
    primaryIntent: "understand FamilyBoard affiliate relationships",
    primaryKeyword: "FamilyBoard affiliate disclosure",
    cluster: "support",
    pageType: "support",
    indexable: true,
    related: ["/editorial-policy/", "/privacy/"],
    body: `# Affiliate Disclosure\n\nFamilyBoard's app, public tools, guides and printables are free to use. Some public guides may eventually show a clearly labeled shopping category that directly supports the task on that page. If you follow an affiliate link and make a qualifying purchase, FamilyBoard may receive a commission, normally without adding to your price.\n\nThe recommendation module is disabled unless the deployed site has an approved affiliate tag. Preparing this disclosure and an unobtrusive placement does not mean that every retailer link earns a commission or that a brand sponsors FamilyBoard.\n\n## How affiliate links are labeled\n\nA commercial relationship is disclosed next to the recommendation, not hidden only on this page. The block is visually separate from the main instructions and cannot imitate navigation, a required download or an app control. Affiliate links use \`rel="sponsored nofollow noopener"\`.\n\nFor Amazon Associates links, FamilyBoard also displays the required identification: **“As an Amazon Associate I earn from qualifying purchases.”** Amazon's current requirements are available in its [Operating Agreement](https://affiliate-program.amazon.com/help/operating/agreement) and [affiliate-link disclosure guidance](https://affiliate-program.amazon.com/help/node/topic/GPXFHVYZMTGPUMPE). The FTC also explains that a material relationship should be clear, conspicuous and close to the recommendation in its [Endorsement Guides FAQ](https://www.ftc.gov/business-guidance/resources/ftcs-endorsement-guides-what-people-are-asking). Other rules may apply where a visitor lives.\n\n## Editorial independence\n\nA commission never determines maintenance intervals, safety guidance or which pages are published. FamilyBoard does not call a product “best” without a documented comparison method, criteria, limitations and evidence. A generic search or category link is described as a way to compare current listings, not as a product test. A recommendation block is omitted whenever it does not help the page's main job.\n\n## Product, price and compatibility checks\n\nAvailability, specifications, sellers, tax, delivery, returns and prices can change. Confirm the current listing, exact model number, manufacturer compatibility instructions and seller terms before buying. Filters, batteries, mounts and replacement parts must match the equipment and local safety requirements; appearing beside a guide is not a promise of compatibility.\n\n## Places where recommendations do not appear\n\nAffiliate recommendations never appear inside the private household app, family display or handoff views, generated results, downloads or print-only sheets. They also do not remove or restrict any free feature when ignored.\n\n## Data and third-party boundaries\n\nFollowing a retailer link leaves FamilyBoard and is then governed by that site's privacy, account, payment and return terms. Public analytics can record only the outbound product category, not household records or values entered into a tool. See the [privacy policy](/privacy/) for the complete boundary.\n\nReport a missing disclosure, irrelevant recommendation or compatibility error through the [contact page](/contact/) without including order, payment or household data. A future paid sponsorship, free sample or fixed placement fee would require its own page-level disclosure rather than being hidden under this general affiliate statement.`,
  },
  {
    id: "support-terms",
    title: "Terms of Use | FamilyBoard",
    description:
      "Terms for using the free FamilyBoard website, local-first app, tools and printables.",
    route: "/terms/",
    primaryIntent: "review FamilyBoard terms",
    primaryKeyword: "FamilyBoard terms",
    cluster: "support",
    pageType: "support",
    indexable: true,
    related: ["/privacy/", "/disclaimer/"],
    body: `# Terms of Use\n\nFamilyBoard is a free informational website and a local-first household organizer. Using the site means accepting the terms below. They are written plainly because a term nobody reads protects nobody.\n\n## What FamilyBoard provides, and what it does not\n\nFamilyBoard provides guides, calculators, generators, printable sheets and a browser-based app for keeping household records. It does not provide professional inspection, legal, medical, tax, insurance or trade services, and its output is not a certification, an inspection report or a compliance document. See the [disclaimer](/disclaimer/) for the limits of the information itself.\n\n## No account, and no service holding your data\n\nThere is no registration, no login and no server storing household records. Everything you enter into the app is written to your own browser's storage on your own device. Because there is no account, there is also nothing for FamilyBoard to suspend, recover or restore on your behalf.\n\n## Your data is your responsibility\n\nYou are responsible for keeping current exports and for protecting access to your device. Clearing site data, browser privacy modes, storage-eviction by the browser, device loss or device failure can each remove local records permanently. A browser profile is not an archival backup. The app can export plain JSON and password-encrypted JSON; keeping at least one durable copy elsewhere is your responsibility, not ours.\n\nIf you set a backup password and lose it, the encrypted file cannot be recovered. The encryption is performed in your browser and no key is escrowed anywhere.\n\n## Acceptable use\n\nDo not use the site to harm others, to interfere with its operation, to probe or attack systems without authorisation, to scrape it at a rate that degrades service for others, or to present FamilyBoard output as professional certification. Do not upload or transmit content you have no right to use.\n\n## Content, and what you may do with it\n\nThe written guides, page designs, code and branding are FamilyBoard's. You may print, save and use the generated checklists, schedules and printable sheets freely for your own household or workplace, including printing copies for family members, sitters or caregivers. Republishing the site's written guides wholesale as your own content is not permitted.\n\nAnything you type into a tool is yours; it never reaches us, so we claim no rights over it.\n\n## Third-party links and recommendations\n\nSome pages link to manufacturers, standards bodies, government agencies and retailers, and some links may be affiliate links, always labelled as such. FamilyBoard does not control those sites and is not responsible for their content, availability, terms or prices. See the [affiliate disclosure](/affiliate-disclosure/).\n\n## Availability and changes\n\nThe site is provided as-is and as-available, without warranty of any kind, and may change, break or be interrupted while defects are fixed and the product develops. Roadmap items are plans, not commitments to a delivery date. To the fullest extent permitted by applicable law, FamilyBoard is not liable for indirect or consequential loss, or for loss of data resulting from browser storage being cleared, evicted or lost.\n\nNothing here limits any right you have under consumer-protection law that cannot be limited by agreement.\n\n## Updates to these terms\n\nMaterial changes are recorded in the [changelog](/changelog/). Continuing to use the site after a change means accepting the updated terms. Questions go to the [contact page](/contact/).`,
  },
  {
    id: "support-disclaimer",
    title: "Household Information Disclaimer | FamilyBoard",
    description:
      "Limits of FamilyBoard household, maintenance, emergency, legal, insurance and safety information.",
    route: "/disclaimer/",
    primaryIntent: "understand the limits of household guidance",
    primaryKeyword: "household information disclaimer",
    cluster: "support",
    pageType: "support",
    indexable: true,
    related: ["/editorial-policy/", "/security/"],
    body: `# Household Information Disclaimer\n\nFamilyBoard organizes information; it does not replace manufacturer instructions, emergency services, licensed trades, legal advice, medical advice, insurance advice or local authority guidance.\n\nIntervals, compatibility and safe procedures vary by product, building, climate and jurisdiction. Verify the exact model and follow authoritative instructions. In an emergency, contact the appropriate local service. Generated tools and checklists are editable planning aids, not inspections or certifications.\n\n## Use records as a prompt to verify\n\nA reminder date, cost calculation or generated checklist can help a household remember a question, but it cannot inspect equipment, diagnose a condition or determine responsibility. Keep the source of each important instruction with the record, update facts when circumstances change and ask an appropriately qualified professional when consequences are significant. Product links and affiliate relationships do not change these limits.`,
  },
  {
    id: "support-search",
    title: "Search Household Guides and Tools | FamilyBoard",
    description:
      "Search FamilyBoard household guides, calculators, generators, checklists and templates.",
    route: "/search/",
    primaryIntent: "search FamilyBoard content",
    primaryKeyword: "search home management guides",
    cluster: "support",
    pageType: "support",
    indexable: true,
    related: ["/guides/", "/tools/"],
    body: `# Search FamilyBoard\n\nFind a guide, calculator, generator, checklist or printable by the household job you need to complete.`,
  },
  {
    id: "guide-dehumidifier-maintenance-records",
    title: "Dehumidifier Maintenance Records | Filter, Drainage and Humidity Notes",
    description: "Keep a household record of dehumidifier filters, water collection, drainage, humidity observations and seasonal issues without turning notes into repair instructions.",
    route: "/guides/dehumidifier-maintenance-records/",
    primaryIntent: "organize dehumidifier maintenance and humidity observations",
    primaryKeyword: "dehumidifier maintenance records",
    cluster: "appliances",
    pageType: "content",
    indexable: true,
    depthVerified: true,
    publishedAt: "2026-08-29",
    lastReviewedAt: "2026-08-29",
    contentVersion: 1,
    related: ["/guides/hvac-filter-tracker/", "/guides/water-leak-response-home-records/", "/tools/appliance-maintenance-checklist-generator/"],
    nextStep: "Record the unit model, last filter check and drainage method, then choose the next manual-based review date.",
    faq: [
      { question: "What humidity number should every home use?", answer: "There is no universal promise. EPA commonly references about 30% to 50% relative humidity, but the building, season, measurement location and manual still matter." },
      { question: "How often should the filter be cleaned?", answer: "Follow the manufacturer instructions and record the actual condition; the tool does not impose a fixed interval." },
      { question: "What if the tank overflows or the floor is wet?", answer: "Stop unsafe operation, protect the area and use the manual, landlord, building or qualified-service process. The log does not diagnose the cause." },
    ],
    body: `# Dehumidifier Maintenance Records: Keep Seasonal Moisture Notes Together

In humid climates, a dehumidifier may run for long periods during rainy weather, after a storm or while laundry dries indoors. A useful household record is more than “cleaned.” It tells the next person which room the unit serves, whether it uses a tank or continuous drain, when the filter was checked and what was actually observed. FamilyBoard stores those observations locally in your browser. It does not measure humidity, diagnose refrigerant problems or replace an electrical inspection.

## Start with a neutral equipment record

Use a code such as \`DEHUM-01\` and record the room, model, filter reference, water collection method and the manual source. Keep a full serial number, address, purchase account and service conversation in the protected place where your household already stores them. A rental unit, condominium common-area unit and privately owned portable unit may have different people who can move it or authorize service.

## Record filter, tank and exterior checks separately

For each observation, write the date, visible dust, whether the manual allowed a safe external clean, whether the filter was dry before refitting and whether the tank or hose showed an issue. Emptying a tank, connecting a drain hose and confirming operation are different events; “cleaned” should not stand in for “drainage verified.” When the manual changes, add a new source code such as \`MANUAL-DEHUM-01\` rather than overwriting the old reference.

## Describe humidity as an observation, not a promise

EPA consumer guidance suggests using a humidity gauge and commonly references roughly 30% to 50% relative humidity for homes. That range is not a guarantee for every room, season or building. Record the reading, measuring location, time, windows and the dehumidifier mode. “Closet side, 68%, window open” is useful; “the machine removed all mold” is not a verified result. Moisture sources, ventilation and building leaks still need their own records.

## Escalate water, odor and electrical signals

If a tank fills unexpectedly fast, continuous drainage stops, water reaches the floor, a plug becomes unusually warm or a burning odor appears, stop unsafe operation and protect the area. Follow the manual, landlord or building process and contact a qualified service person when needed. The record can preserve where water was seen, when it started and who was contacted; it cannot identify a blocked hose, float, refrigerant or electrical cause.

## Run a seasonal handoff test

Before a rainy season, ask someone who did not create the record to find the filter source, drainage plan, latest humidity observation and escalation contact using \`DEHUM-01\`. If they only see “clean weekly” but cannot tell who handles a leak, add a role and next step. After a move, storm or change to continuous drainage, create a new event and keep the old timeline for comparison.

## Privacy and future recommendations

Humidity notes can reveal routines and room use. Remove names, addresses, access details and full serial numbers before sharing. A future page may show a clearly labeled humidity gauge, storage or replacement-filter category outside the private app. Such a recommendation cannot promise mold removal, safety or a repair result, and ignoring it must never restrict the free tool.`
  },
  {
    id: "guide-air-purifier-filter-log",
    title: "Air Purifier Filter Log | Room, CADR Context and Replacement History",
    description: "Track air purifier filter models, room placement, visible loading and replacement dates while keeping EPA's limits on filtration claims clear.",
    route: "/guides/air-purifier-filter-log/",
    primaryIntent: "organize air purifier filter replacement and room-use history",
    primaryKeyword: "air purifier filter replacement log",
    cluster: "appliances",
    pageType: "content",
    indexable: true,
    depthVerified: true,
    publishedAt: "2026-08-29",
    lastReviewedAt: "2026-08-29",
    contentVersion: 1,
    related: ["/guides/hvac-filter-tracker/", "/guides/computer-electronics-inventory/", "/tools/appliance-maintenance-checklist-generator/"],
    nextStep: "Record the filter package model, current room and last replacement date, then set a manual-based review reminder.",
    faq: [
      { question: "How often must an air purifier filter be replaced?", answer: "Use the manufacturer schedule and actual loading. EPA notes that all filters need regular replacement; 60 to 90 days is only a common reference." },
      { question: "Does a higher CADR guarantee clean air?", answer: "No. CADR, room size, doors, windows, pollution sources and run time all affect results, and no single cleaner removes every pollutant." },
      { question: "Can a purifier replace ventilation or source control?", answer: "No. Smoke, moisture, chemicals and other sources still need appropriate source control, ventilation, cleaning or qualified help." },
    ],
    body: `# Air Purifier Filter Log: Record Why a Filter Changed, Not Only That It Changed

An air purifier may move between a bedroom, living room, nursery or renovation area. Months later, a household often remembers only that a filter was “changed.” A better log preserves the filter code, room, approximate use, visible loading and the source used to choose a replacement. FamilyBoard organizes that history locally; it does not test air quality or make a medical claim.

## Save the model and source first

Use a neutral code such as \`AIR-01\` for the unit and \`FILTER-AIR-01\` for its source. Record the room, model, filter code, purchase source and manual version. Keep order accounts, addresses, serial-number photos, diagnoses and private household details outside a shared summary. If a model accepts more than one filter revision, add a new version instead of replacing the old one.

## Put CADR and room context beside the date

EPA guidance says portable-air-cleaner selection should consider whether the clean air delivery rate (CADR) is appropriate for the area. The result also depends on doors, windows, pollution sources and run time. Record “living room, windows closed, evening use” or “temporary study during renovation,” along with the reasoning for the choice. A log should preserve context, not promise that a particular CADR produces the same outcome for every person.

## Separate appearance, alerts and installation

At each check, note the date, visible dust, odor, warning light, airflow or noise change and which safe, manual-approved action occurred. EPA notes that all filters need regular replacement; 60 to 90 days is a common reference, not a universal schedule. A filter that looks clean can still be due, and a heavily loaded filter should not be called normal simply because the fan still runs. Do not turn a dirty filter into a motor diagnosis.

## A purifier does not remove every source

No single cleaner or filter removes every pollutant in a home. Smoke, cooking emissions, dampness, mold odor and chemical sources still require source control, ventilation, cleaning or qualified help. If a plug is hot, smoke appears, a burning smell starts or liquid enters the housing, stop unsafe operation and seek appropriate assistance rather than installing another filter and continuing.

## Test the handoff

Ask another household member to use \`AIR-01\` to find the current room, filter code, last replacement, next review reason and manual. If “purchased” and “installed and observed” are indistinguishable, split them into separate events. When the purifier moves rooms, renovation starts or the household changes brands, create a new version while keeping the historical timeline.

## Privacy and recommendations

Air-quality notes may reveal health-related routines or room use. Remove unnecessary personal details before sharing. A future page may display a clearly labeled filter or storage category outside the private app, with an affiliate disclosure when applicable. It cannot promise disease treatment, virus elimination, ventilation replacement or guaranteed safety.`
  },
  {
    id: "guide-solar-panel-maintenance-records",
    title: "Home Solar Panel Maintenance Records | Production, Inverter and Storm Notes",
    description: "Keep a handoff-ready record of home solar production, inverter alerts, shading and post-storm observations without giving high-voltage or roof-work DIY instructions.",
    route: "/guides/solar-panel-maintenance-records/",
    primaryIntent: "organize residential solar production and maintenance handoffs",
    primaryKeyword: "home solar panel maintenance records",
    cluster: "maintenance",
    pageType: "content",
    indexable: true,
    depthVerified: true,
    publishedAt: "2026-08-29",
    lastReviewedAt: "2026-08-29",
    contentVersion: 1,
    related: ["/guides/storm-preparation-home-checklist/", "/guides/home-improvement-receipts/", "/guides/contractor-records/"],
    nextStep: "Record the system code, latest production reading and inverter status, then confirm the owner, building and qualified-maintainer contacts.",
    faq: [
      { question: "Can I climb onto the roof to clean panels?", answer: "Do not treat roof, structural or energized electrical work as ordinary household work. Record safe-distance observations and use qualified professionals." },
      { question: "Does a 10% annual drop prove the system is broken?", answer: "No. DOE notes a larger year-to-year drop may indicate a maintenance issue, but weather, shading, outages and measurement context must be checked." },
      { question: "What should I do after storm damage?", answer: "Stay away, keep others out, record only safe-distance observations and contact the building, owner, insurer or qualified solar professional." },
    ],
    body: `# Home Solar Panel Maintenance Records: Separate Production Trends from Roof and Electrical Risk

A residential photovoltaic system can involve an owner, installer, utility documents, a condominium manager and a maintenance contractor. FamilyBoard helps a household locate the reading, alert, permission and next follow-up; it does not teach anyone to climb a roof or touch energized equipment. Department of Energy operations guidance treats preventive maintenance, performance confirmation and pre- and post-storm work as distinct parts of system care.

## Map the system and authority

Use a code such as \`PV-01\` for the roof area and record the system type, inverter model, installation year and protected document source. For a rental or shared roof, also record the roles for the owner, manager, installer and maintenance company, including who can authorize access. Keep the address, interconnection account, full warranty and payment documents in their protected location.

## Preserve the measurement context

When recording production, include the date, source (inverter app, meter or service report), unit, time period and weather note. Instantaneous power, daily energy and cumulative totals are different measures. For an annual comparison, keep the same source and note outages, shading, storms and service periods. “Lower today” is an observation, not a diagnosis of a panel or inverter.

## Keep inverter alerts separate

From a safe location, record an alert code, time, whether it cleared and the screen or app source. Do not open a cover, disconnect conductors or repeatedly reset a warning. Link \`INVERTER-ALERT-01\` to the manual or service case so a qualified person can interpret it. DOE resources describe inspecting and testing components as professional operations and maintenance, not a household repair checklist.

## Storm safety comes first

If a panel is loose, glass is broken, wiring is exposed, water is near equipment or the roof structure is damaged, stay away and keep others out. Record only what can be seen from a safe distance and notify the building, owner, insurer or qualified solar professional. Isolation, recommissioning and return to service must follow the appropriate professional process; “contractor notified” is not the same as “safe to re-energize.”

## Run an annual handoff

Ask another household member to find the latest production report, inverter alert, warranty source, storm contact and next review date using \`PV-01\`. If the answer is “the solar company knows,” add a source code and role. Roof work, tree growth, new shade, warranty transfer or a management change should create a new event while preserving historical readings.

## Privacy and future recommendations

Solar records can reveal an address, energy use, roof layout and financial contracts. Share only a redacted summary. A future page may show clearly labeled monitoring or document-storage categories outside the private app, with a nearby affiliate disclosure. No product recommendation can promise extra generation, replace electrical inspection or make storm damage safe.`
  },
];

const all = [...records, ...supportRecords, ...extraRecords];



for (const record of all) {
  record.faq ||= [];
  record.nextStep ||= "";
  record.redirectTo ||= "";
  record.depthVerified ||= false;
  // There used to be a publicOverrides map here that replaced title, description
  // and body for /pricing/, /roadmap/, /contact/ and
  // /features/free-home-management-app/ after the master had been parsed. It was
  // invisible: the master documents itself as the single source of truth, so a
  // rewrite of one of those four pages was silently discarded, and because the
  // override only replaced three fields a page could end up carrying a master FAQ
  // and Depth marker attached to override body text. That content now lives in the
  // master where it can be seen and edited. Do not reintroduce a second body source.
  record.related = record.related.map((route) =>
    route === "/pricing/" ? "/features/free-home-management-app/" : route,
  );
  record.body = record.body
    .replace(
      /## Future sync can be optional[\s\S]*?(?=\n## |\n\*\*Contextual CTA:|$)/,
      "## Portability works today\n\nExported backups let a household move its records without depending on an account or server. Keep a durable copy outside the browser and test restores periodically.\n",
    )
    .replace(
      /## No account does not mean no future sync[\s\S]*?(?=\n## |\n\*\*Contextual CTA:|$)/,
      "## No account means backups matter\n\nBecause there is no server account, the browser is not an archival copy. Export a backup after meaningful changes and keep it somewhere durable.\n",
    )
    .replace(
      /watch the roadmap for optional local Pro and sync features later\.?/gi,
      "review the changelog for reliability and accessibility improvements",
    )
    .replace(
      /A user who has already organized useful household records has a much clearer reason to consider a future paid local desktop edition or optional sync service than a visitor who has only seen a signup page\./g,
      "A user who has already organized useful household records can judge the product by its reliability, portability and day-to-day usefulness rather than by a signup promise.",
    )
    .replace(
      /## Future sync\n\nIf encrypted sync is added later, this policy must be updated before launch of that service\. The sync design should aim to minimize the provider's ability to read household content\./g,
      "## No cloud sync today\n\nFamilyBoard does not currently send household records to a sync service. Any future change to that boundary would require a policy and security review before release.",
    );
  record.body = normalizeHeadingOrder(record.body);
  record.wordCount = countBodyWords(record.body);
  // A content page earns the index by clearing the word floor AND carrying the
  // editorial sign-off. depthVerified is an extra requirement, not a bypass —
  // otherwise the marker alone could ship a 200-word page.
  record.heldUnderDepth =
    record.pageType === "content" &&
    !structuralRoutes.has(record.route) &&
    !record.redirectTo &&
    (record.wordCount < 500 || !record.depthVerified);
  if (record.redirectTo) record.indexable = false;
  else if (record.pageType === "content")
    record.indexable = !record.heldUnderDepth;
}
if (records.length < minimumCorePages)
  throw new Error(
    `Expected at least ${minimumCorePages} launch pages, found ${records.length}`,
  );
if (new Set(all.map((record) => record.route)).size !== all.length)
  throw new Error("Duplicate routes found in imported content");
const routeSet = new Set(all.map((record) => record.route));
for (const record of all.filter((item) => item.redirectTo)) {
  if (record.redirectTo === record.route)
    throw new Error(`Redirect cannot target itself: ${record.route}`);
  if (!routeSet.has(record.redirectTo))
    throw new Error(
      `Redirect target does not match an imported route: ${record.route} -> ${record.redirectTo}`,
    );
}

fs.rmSync(outputDir, { recursive: true, force: true });
fs.mkdirSync(outputDir, { recursive: true });
fs.mkdirSync(path.dirname(searchOutput), { recursive: true });

for (const record of all) {
  if (!record.body && !record.redirectTo)
    throw new Error(`No visible body for ${record.route}`);
  fs.writeFileSync(
    path.join(outputDir, `${record.id}.md`),
    renderGeneratedMarkdown(record, launchDate),
  );
}

const frontmatterValue = (markdown, key) =>
  (markdown.match(new RegExp(`^${key}:\\s*(.+)$`, "m"))?.[1] || "")
    .trim()
    .replace(/^"|"$/g, "")
    .replaceAll('\\"', '"');
const zhTwDir = path.resolve("src/content/pages-zh-tw");
const zhTwPages = fs.existsSync(zhTwDir)
  ? fs
      .readdirSync(zhTwDir)
      .filter((file) => file.endsWith(".md"))
      .map((file) => {
        const markdown = fs.readFileSync(path.join(zhTwDir, file), "utf8");
        const alternateRoute = frontmatterValue(markdown, "alternateRoute");
        return {
          route: normalizeRoute(frontmatterValue(markdown, "route")),
          alternateRoute: alternateRoute ? normalizeRoute(alternateRoute) : "",
          indexable: frontmatterValue(markdown, "indexable") !== "false",
          lastReviewedAt: frontmatterValue(markdown, "lastReviewedAt"),
          locale: "zh-TW",
        };
      })
  : [];
const zhTwByEnglishRoute = new Map(
  zhTwPages
    .filter((page) => page.alternateRoute)
    .map((page) => [page.alternateRoute, page.route]),
);
const sitemapPages = [
  ...all.map((record) => ({
    route: record.route,
    alternateRoute: zhTwByEnglishRoute.get(record.route) || "",
    indexable: record.indexable,
    lastReviewedAt: record.lastReviewedAt || launchDate,
    locale: "en",
    redirectTo: record.redirectTo,
  })),
  ...zhTwPages,
];
fs.writeFileSync(sitemapOutput, `${JSON.stringify(sitemapPages, null, 2)}\n`);

const search = all
  .filter((record) => record.indexable && !record.redirectTo)
  .map((record) => ({
    title: record.title,
    description: record.description,
    route: record.route,
    cluster: record.cluster,
    keywords: record.primaryKeyword,
    headings: [...record.body.matchAll(/^#{1,3}\s+(.+)$/gm)]
      .map((match) => match[1].replace(/[*_`]/g, ""))
      .join(" "),
  }));
fs.writeFileSync(searchOutput, `${JSON.stringify(search, null, 2)}\n`);
console.log(
  `Import: ${all.length} pages, ${all.filter((record) => record.pageType === "content" && record.indexable).length} indexable content pages, ${all.filter((record) => record.heldUnderDepth).length} held back as under-depth.`,
);
