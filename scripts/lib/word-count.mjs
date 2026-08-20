function stripFrontmatter(markdown) {
  return markdown.replace(/^---\s*\n[\s\S]*?\n---\s*(?:\n|$)/, "");
}

function stripFaqAuthoringBlock(markdown) {
  const lines = markdown.split("\n");
  const output = [];
  let inFaq = false;

  for (const line of lines) {
    if (/^\*\*FAQ:\*\*\s*$/i.test(line.trim())) {
      inFaq = true;
      continue;
    }
    if (
      inFaq &&
      (/^---\s*$/.test(line) ||
        /^\*\*(?:Contextual CTA|Depth|Redirects to):\*\*/i.test(line))
    ) {
      inFaq = false;
    }
    if (!inFaq) output.push(line);
  }

  return output.join("\n");
}

export function textForBodyWordCount(markdown) {
  return stripFaqAuthoringBlock(stripFrontmatter(String(markdown)))
    .replace(/^(?:```|~~~)[^\n]*\n[\s\S]*?^(?:```|~~~)\s*$/gm, " ")
    .replace(/^\*\*(?:Contextual CTA|Depth|Redirects to):\*\*.*$/gim, " ")
    .replace(/<!--([\s\S]*?)-->/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/https?:\/\/\S+/g, " ");
}

export function countBodyWords(markdown) {
  return (
    textForBodyWordCount(markdown).match(
      /[\p{L}\p{N}]+(?:[’'-][\p{L}\p{N}]+)*/gu,
    )?.length || 0
  );
}
