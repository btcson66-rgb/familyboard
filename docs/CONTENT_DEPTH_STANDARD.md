# FamilyBoard Content Depth Standard

This is the quality bar every indexable English content page must meet before its master block is marked `**Depth:** verified`.

The reference page that already meets this bar is `src/content/pages-zh-tw/warranty-expiration-calculator.md`. Read it before writing anything.

## The failure this standard exists to fix

The 2026-08-19 launch library shipped 216 English pages averaging 187 words. The pages were written to avoid stating anything specific. A representative example from `/guides/refrigerator-maintenance-checklist/`:

> "Useful recurring records may include cleaning accessible surfaces and seals, checking the condition of replaceable filters if the model uses them... Do not invent a fixed universal interval when the appliance manual gives model-specific instructions."

A reader searching "refrigerator maintenance checklist" wants the checklist. This page promises one in the title and then explicitly declines to give one. That is worse than no page: it spends the reader's click and returns nothing.

The correct handling of uncertainty is to state the typical published figure, name who publishes it, and say what overrides it — not to withhold the figure.

Wrong: "Do not invent a fixed universal interval."
Right: "Manufacturers commonly specify condenser-coil cleaning every 6 to 12 months, and more often in homes with shedding pets. Your model's manual overrides this; check it for the coil location, because bottom-mounted coils on many modern units are cleaned differently from rear-mounted coils on older ones."

## Hard requirements per indexable content page

1. **Body length 700–1400 words.** Under 500 words the importer holds the page back from indexing automatically. Do not pad to hit a number; if a topic genuinely cannot support 700 words of substance, it should be merged into a sibling page via `**Redirects to:**` instead.
2. **The page must contain the thing its title promises.** A page titled "checklist" contains an actual itemised checklist. A page titled "calculator" explains the exact rule the calculator applies. A page titled "lifespan planning" contains lifespan figures.
3. **At least three concrete, checkable specifics.** An interval, a quantity, a lifespan range, a temperature, a cost range, a legal retention period, a document name, a named standard. Generic advice does not count.
4. **Sources named inline for any external factual claim**, as a real markdown link to a page you actually fetched and read. Prefer standards bodies, government agencies, manufacturers and trade associations (NFPA, EPA, ENERGY STAR, USFA, CPSC, IRS retention guidance, manufacturer support pages). Never link a page you have not opened. Never write "verified <date>" or any similar verification claim.
5. **Three to five FAQ entries** in the master `**FAQ:**` block, answering questions a real searcher types. Each answer 40–80 words and self-contained — it must make sense quoted alone, because that is how AI search surfaces it. No answer may be a deferral ("consult your manual") without also giving the typical figure.
6. **Scannable structure**: H2 sections, at least one list or table, no wall of prose.
7. **A `**Contextual CTA:**` line** naming the specific FamilyBoard action for this page (which record to create, which tool to open). One sentence. Keep that exact label in the master — the importer converts it into a rendered callout, so it must never be reworded to "Next step:" or anything else in the source.
8. **Honest product boundaries.** FamilyBoard stores records in the browser. Do not imply accounts, sync, cloud storage, reminders that fire when the browser is closed, or any capability the app does not have.

## Prohibited

- Restating the same paragraph across sibling pages with the noun swapped. Siblings must differ in their specifics, not only in their keyword.
- Filler transitions that carry no information ("In today's busy world", "It is important to note that").
- Safety-critical instructions the reader could be hurt following. For gas, electrical, roof, structural and combustion work, state that the task is professional-only and give the record-keeping angle instead. That is a real answer, not a hedge.
- Invented statistics, invented survey results, invented prices, invented model numbers.
- Medical, legal, tax or insurance advice stated as certainty. Retention periods and coverage rules vary; name the source and the jurisdiction.

## Cluster-specific guidance

**appliances** — Give each appliance its own real content: what actually fails on it, the maintenance items with typical published intervals, typical service lifespan range with the source, the symptoms that mean call-a-professional-now, and what to record. Refrigerator, washing machine, dryer and dishwasher pages must not be interchangeable.

**maintenance / seasonal** — Give the actual itemised list per period. Say plainly that climate changes the list, then give the list for cold-winter, hot-humid and mild climates rather than refusing to give one.

**records-emergency** — Highest reader stakes and highest ad value. Smoke alarm, CO alarm and fire extinguisher pages must carry real published guidance (NFPA test-monthly / replace-at-10-years for smoke alarms, and equivalents) with the source linked. Get these right or leave them non-indexable.

**inventory-warranty** — Insurance-facing. Explain what a claims adjuster actually asks for, what proof of purchase means in practice, and how photo and serial documentation is used. Name the retention-period sources.

**household-operations** — The weakest cluster for search demand and the most prone to sibling duplication. Prune aggressively before deepening; a merged page that answers well beats four that repeat each other.

**tools** — The interactive tool is the value, so these stay indexable. Still owe the reader the exact rule the tool applies (see the zh-TW warranty calculator page for the standard), the edge cases, and what the tool cannot determine.

**product / features** — These sell the app. Consolidate the keyword permutations (`private-`, `offline-`, `no-account-`, `local-first-` organizer are one page). Show real screenshots-in-words of what the record looks like, not adjectives.

## Definition of done for a page

The master block carries `**Depth:** verified` only when all of the following are true, checked by the writer:

- 700+ body words, every external claim linked to a source actually opened;
- the titled promise is delivered on the page;
- 3–5 FAQ entries present in the master block;
- no sentence would be equally true if the subject noun were swapped for a sibling page's noun;
- `npm.cmd run audit:content` passes with the page indexable.
