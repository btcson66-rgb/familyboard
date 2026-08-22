# FamilyBoard high-quality content growth roadmap

Status: active
Created: 2026-08-22
Owner: FamilyBoard web operations

## Outcome

Build FamilyBoard into the most useful bilingual, local-first household-operations library in its scope. The long-range capacity target is 500 distinct user jobs with an English and a Taiwan Traditional Chinese edition, or about 1,000 public URLs. The URL count is not a release target: a page ships only when it solves a distinct job and clears the quality gate below.

Google indexing, ranking, AdSense approval and revenue are separate outcomes. A built page, a sitemap URL or an IndexNow acceptance is not evidence of any of them.

## Starting point

- 216 English source pages exist, including content, working tools, printables, support pages and redirect stubs.
- After the 2026-08-22 trust-foundation batch, six indexable zh-TW content files exist.
- The private English and zh-TW App routes remain `noindex` and free of public analytics, advertising and affiliate modules.
- The next bottleneck is no longer English page depth. It is Taiwan-localized coverage, app education, additional genuinely working tools and measured discovery.

## Portfolio shape at maturity

| Distinct user-job cluster | Concept capacity | What earns a separate page |
| --- | ---: | --- |
| App onboarding, feature use and troubleshooting | 80 | A reproducible workflow, decision or failure mode tied to current product behavior |
| Home maintenance and household systems | 120 | A distinct system, dwelling context or maintenance decision with usable steps and sources |
| Inventory, warranties and household records | 90 | A different record-keeping decision, evidence set or lifecycle workflow |
| Household operations, handoff and preparedness | 90 | A concrete role, event or handoff scenario with a usable output |
| Working calculators and generators | 70 | A tested interactive result that saves real work and honestly states its limits |
| Printables, checklists and editable worksheets | 50 | A materially different worksheet with fields that match a real task |
| **Total** | **500** | Localized English and zh-TW editions can bring the library to about 1,000 URLs |

The capacities are planning boundaries, not quotas. If research cannot justify a distinct page, the unused capacity stays unused.

## Batch rule

Every optimization batch adds at most three public pages. A batch may instead improve existing pages, tools, navigation, analytics or quality gates without consuming all three slots.

Before authoring, each proposed page needs:

1. one primary user job stated as a question or action;
2. a clear reason it is not already answered by an existing page;
3. the real FamilyBoard feature or working public tool it connects to;
4. locale-specific terminology, examples and sources;
5. a practical artifact: steps, field list, worked example, decision table, checklist or functioning interaction;
6. a source plan for claims involving safety, law, money, product specifications or fixed intervals;
7. an honest statement of what the product or page cannot do.

## English and zh-TW are localized editions, not noun swaps

An hreflang pair should solve the same underlying job, but it does not need to be a literal translation.

- English editions use the terminology, units, institutions and examples appropriate to their intended markets.
- zh-TW editions use Taiwan Traditional Chinese, natural local search phrasing and Taiwan sources where jurisdiction or household context matters.
- Legal, safety, warranty, emergency and building-management claims are researched independently for each locale.
- A translated page does not earn publication if its examples, sources or calls to action are wrong for that audience.
- Page titles and descriptions are written from the locale's search intent; they are not mechanically translated metadata.

## Page quality gate

Every indexable page must pass all applicable checks:

- one self-canonical URL, one useful H1 and unique title and description;
- reciprocal hreflang only when the paired pages are true equivalents;
- no authoring instructions, placeholders, fake functionality or unsupported future promises;
- at least three non-repetitive FAQs when the page format benefits from them;
- a clear route to a working tool, the private App, a printable or another useful next step;
- source links for consequential factual claims, opened and checked during the current batch;
- no unsafe do-it-yourself instructions for electrical, gas, fire, structural, refrigerant or other hazardous work;
- no keyword-swapped sibling page whose useful sections would still read correctly after changing a noun;
- build, content audit, similarity audit, SEO/link/sitemap audit and representative browser checks all pass.

The repository's content-unit floors are internal thin-page alarms. They are not claims about a Google-preferred word count. A long page can still fail if it is repetitive or does not finish the user's task.

## Tool gate

A new tool page does not ship until the interaction itself exists and is tested. Its public copy must describe only implemented inputs, calculations, output and storage behavior.

Tool candidates are prioritized when they:

- reduce repeated household calculation or formatting work;
- run locally without sending user-entered values to a server;
- have deterministic rules that can be unit-tested;
- produce a useful result before any advertisement or recommendation;
- can be explained without pretending to make a professional, legal, insurance or safety decision.

## Monetization boundaries

- Advertising and affiliate recommendations stay out of `/app/`, `/zh-tw/app/`, handoff views and print output.
- Recommendation panels render only when a verified affiliate identifier is configured and the page has a matching task context.
- No empty ad boxes are shown while monetization is disabled.
- Product blocks must be clearly labelled, secondary to the useful answer and linked to the current affiliate disclosure.
- Compatibility, specifications, availability and price are verified by the shopper at the current listing; FamilyBoard does not publish stale hard-coded prices.
- Ad placement changes require explicit approval under the company AdSense risk rules.

## Measurement loop

Use GSC query and page data to choose which proven impressions deserve a better answer, and GA4 `tool_complete` to see which public tools people finish. Use `affiliate_outbound` only as a category-level signal. If the APIs return no data, record no data; do not replace it with estimates.

For every published batch, record:

- routes and locale;
- the user job and originality check;
- sources and review date;
- build, audit and browser evidence;
- deployment or PR state separately from local readiness;
- post-release GSC impressions/clicks and tool completions when enough time has elapsed.

Pages that do not earn impressions, engagement or a durable product role are candidates for improvement, consolidation or `noindex`, not automatic multiplication.

## Near-term sequence

1. **Trust foundation:** zh-TW privacy, contact and full App tutorial.
2. **Trust completion:** prioritize zh-TW security, affiliate disclosure and terms after checking whether each needs jurisdiction-specific wording.
3. **App workflow series:** one deep tutorial per real screen or cross-screen workflow, beginning with backup/restore, maintenance history and privacy-safe handoff.
4. **Working tool waves:** add tools in English/zh-TW pairs only after implementation and tests; use the third page slot for the supporting workflow when it adds distinct value.
5. **Evidence-led expansion:** after GSC begins returning queries, use real demand to reorder the backlog rather than publishing by calendar alone.

This roadmap should be revised when product behavior changes or analytics reveal a different bottleneck. It should not be revised merely to make the URL total grow faster.
