function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function yamlDoubleQuoted(value) {
  return JSON.stringify(String(value));
}

export function authoringField(block, label) {
  const match = block.match(
    new RegExp(`^\\*\\*${escapeRegExp(label)}:\\*\\*\\s*(.*)$`, "im"),
  );
  const value = (match?.[1] || "").trim();
  return /^`[^`]*`$/.test(value) ? value.slice(1, -1).trim() : value;
}

// The master uses two spellings of the same next-step marker: **Contextual CTA:**
// on guide and tool blocks, and a bare **CTA:** on the printable blocks. Both must
// be lifted into the rendered callout, or the bare one prints as literal body text.
export function nextStepField(block) {
  return (
    authoringField(block, "Contextual CTA") || authoringField(block, "CTA")
  );
}

export function parseFaq(block) {
  const lines = String(block).split("\n");
  const start = lines.findIndex((line) => /^\*\*FAQ:\*\*\s*$/i.test(line.trim()));
  if (start < 0) return [];

  const faq = [];
  let current = null;
  let answerStarted = false;

  const finish = () => {
    if (!current) return;
    current.question = current.question.trim().replace(/\s+/g, " ");
    current.answer = current.answer.trim().replace(/\s+/g, " ");
    if (!current.question || !current.answer) {
      throw new Error("Each FAQ entry requires both a question and an answer");
    }
    faq.push(current);
    current = null;
    answerStarted = false;
  };

  for (const line of lines.slice(start + 1)) {
    if (
      /^---\s*$/.test(line) ||
      /^\*\*(?:Contextual CTA|CTA|Depth|Redirects to):\*\*/i.test(line) ||
      /^#\s+/.test(line)
    ) {
      break;
    }
    const question = line.match(/^\s*-\s*Q:\s*(.*)$/i);
    if (question) {
      finish();
      current = { question: question[1], answer: "" };
      continue;
    }
    const answer = line.match(/^\s+A:\s*(.*)$/i);
    if (answer) {
      if (!current) throw new Error("FAQ answer found before its question");
      current.answer = answer[1];
      answerStarted = true;
      continue;
    }
    if (!current || !line.trim()) continue;
    if (answerStarted) current.answer += ` ${line.trim()}`;
    else current.question += ` ${line.trim()}`;
  }
  finish();
  return faq;
}

export function bodyFromMasterBlock(block) {
  const offset = block.search(/^# /m);
  if (offset < 0) return "";
  const lines = block
    .slice(offset)
    .split(/\n---\n\s*(?=# (?:CLUSTER|PART))/)[0]
    .split("\n");
  const body = [];
  let inFaq = false;

  for (const line of lines) {
    if (/^\*\*FAQ:\*\*\s*$/i.test(line.trim())) {
      inFaq = true;
      continue;
    }
    if (
      inFaq &&
      (/^---\s*$/.test(line) ||
        /^\*\*(?:Contextual CTA|CTA|Depth|Redirects to):\*\*/i.test(line))
    ) {
      inFaq = false;
    }
    if (inFaq) continue;
    if (/^\*\*(?:Contextual CTA|CTA|Depth|Redirects to):\*\*.*$/i.test(line))
      continue;
    body.push(line);
  }

  return body.join("\n").replace(/\n---\s*$/s, "").trim();
}

export function renderGeneratedMarkdown(record, launchDate) {
  const frontmatter = [
    "---",
    `title: ${yamlDoubleQuoted(record.title)}`,
    `description: ${yamlDoubleQuoted(record.description)}`,
    `route: ${yamlDoubleQuoted(record.route)}`,
    `primaryIntent: ${yamlDoubleQuoted(record.primaryIntent)}`,
    `primaryKeyword: ${yamlDoubleQuoted(record.primaryKeyword)}`,
    `cluster: ${yamlDoubleQuoted(record.cluster)}`,
    `pageType: ${yamlDoubleQuoted(record.pageType)}`,
    `indexable: ${record.indexable}`,
    `depthVerified: ${Boolean(record.depthVerified)}`,
    `publishedAt: ${yamlDoubleQuoted(record.publishedAt || launchDate)}`,
    `lastReviewedAt: ${yamlDoubleQuoted(record.lastReviewedAt || launchDate)}`,
    ...(record.nextStep
      ? [`nextStep: ${yamlDoubleQuoted(record.nextStep)}`]
      : []),
    ...(record.redirectTo
      ? [`redirectTo: ${yamlDoubleQuoted(record.redirectTo)}`]
      : []),
    ...(record.related.length
      ? ["related:", ...record.related.map((item) => `  - ${yamlDoubleQuoted(item)}`)]
      : ["related: []"]),
    ...(record.faq.length
      ? [
          "faq:",
          ...record.faq.flatMap((item) => [
            `  - question: ${yamlDoubleQuoted(item.question)}`,
            `    answer: ${yamlDoubleQuoted(item.answer)}`,
          ]),
        ]
      : ["faq: []"]),
    `contentVersion: ${record.contentVersion || 1}`,
    "---",
    "",
  ].join("\n");
  const body = record.redirectTo ? "" : record.body.trim();
  return `${frontmatter}${body ? `${body}\n` : ""}`;
}
