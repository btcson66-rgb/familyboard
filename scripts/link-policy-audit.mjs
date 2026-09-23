import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const distDir = path.join(root, 'dist');
const policy = JSON.parse(await readFile(path.join(root, 'src', 'config', 'indexability-policy.json'), 'utf8'));
const normalizeRoute = (value) => {
  try {
    const pathname = new URL(value, 'https://familyboard.win').pathname;
    return pathname === '/' ? '/' : `/${pathname.replace(/^\/+|\/+$/g, '')}/`;
  } catch {
    return '';
  }
};
const indexableRoutes = new Set(policy.indexableRoutes.map(normalizeRoute));
const allowedNoindexRoutes = new Set(['/app/', '/zh-tw/app/', '/search/', '/zh-tw/search/']);

async function walk(dir) {
  const files = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...await walk(full));
    else files.push(full);
  }
  return files;
}

const routeFromHtml = (file) => {
  const relative = path.relative(distDir, file).replaceAll('\\', '/');
  if (relative === 'index.html') return '/';
  if (relative.endsWith('/index.html')) return `/${relative.slice(0, -'/index.html'.length)}/`;
  return `/${relative.replace(/\.html$/, '')}/`;
};

const htmlFiles = (await walk(distDir)).filter((file) => file.endsWith('.html'));
const htmlByRoute = new Map();
for (const file of htmlFiles) htmlByRoute.set(routeFromHtml(file), await readFile(file, 'utf8'));

const inbound = new Map([...indexableRoutes].map((route) => [route, new Set()]));
const violations = [];
const homepageTargets = new Set();

for (const source of indexableRoutes) {
  const html = htmlByRoute.get(source);
  if (!html) {
    violations.push(`${source} -> [missing built HTML]`);
    continue;
  }
  const hrefs = [...html.matchAll(/<a\b[^>]*\bhref=["']([^"']+)["'][^>]*>/gi)].map((match) => match[1]);
  for (const href of hrefs) {
    if (!href.startsWith('/') || href.startsWith('//')) continue;
    const target = normalizeRoute(href);
    if (!target) continue;
    if (source === '/zh-tw/') homepageTargets.add(target);
    if (indexableRoutes.has(target)) {
      if (target !== source) inbound.get(target)?.add(source);
      continue;
    }
    if (htmlByRoute.has(target) && !allowedNoindexRoutes.has(target)) {
      violations.push(`${source} -> ${target}`);
    }
  }
}

const orphans = [...inbound].filter(([, sources]) => sources.size === 0).map(([route]) => route);
if (homepageTargets.size > 60) violations.push(`/zh-tw/ -> [${homepageTargets.size} unique internal routes; maximum 60]`);
if (orphans.length) violations.push(`indexable routes without another indexable inbound: ${orphans.join(', ')}`);

if (violations.length) {
  console.error(`LINK_POLICY_FAIL (${violations.length})`);
  for (const violation of violations) console.error(`- ${violation}`);
  process.exitCode = 1;
} else {
  console.log(`Link policy PASS: indexable=${indexableRoutes.size}, forbidden edges=0, orphans=0, zh-TW home unique internal hrefs=${homepageTargets.size}`);
}
