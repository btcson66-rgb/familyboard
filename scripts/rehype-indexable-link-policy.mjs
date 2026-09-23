import { readFileSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const policy = JSON.parse(
  readFileSync(new URL('src/config/indexability-policy.json', root), 'utf8'),
);
const sitemapPages = JSON.parse(
  readFileSync(new URL('src/generated/sitemap-pages.json', root), 'utf8'),
);

const normalizeRoute = (value) => {
  try {
    const pathname = new URL(value, 'https://familyboard.win').pathname;
    return pathname === '/' ? '/' : `/${pathname.replace(/^\/+|\/+$/g, '')}/`;
  } catch {
    return '';
  }
};

const indexableRoutes = new Set(policy.indexableRoutes.map(normalizeRoute));
const knownRoutes = new Set(sitemapPages.map((page) => normalizeRoute(page.route)));
const allowedNoindexRoutes = new Set(['/app/', '/zh-tw/app/', '/search/', '/zh-tw/search/']);

const routeFromFile = (file) => {
  const route = file.data?.astro?.frontmatter?.route;
  if (route) return normalizeRoute(route);
  if (!file.path) return '';
  const source = readFileSync(file.path, 'utf8');
  return normalizeRoute(source.match(/^route:\s*["']?([^"'\r\n]+)["']?\s*$/m)?.[1] || '');
};

const shouldUnwrap = (href) => {
  if (typeof href !== 'string' || !href.startsWith('/') || href.startsWith('//')) return false;
  const route = normalizeRoute(href);
  return knownRoutes.has(route) && !indexableRoutes.has(route) && !allowedNoindexRoutes.has(route);
};

const rewriteChildren = (node) => {
  if (!Array.isArray(node.children)) return;
  const children = [];
  for (const child of node.children) {
    if (child.type === 'element' && child.tagName === 'a' && shouldUnwrap(child.properties?.href)) {
      children.push(...(child.children || []));
      continue;
    }
    rewriteChildren(child);
    children.push(child);
  }
  node.children = children;
};

export default function rehypeIndexableLinkPolicy() {
  return (tree, file) => {
    if (!indexableRoutes.has(routeFromFile(file))) return;
    rewriteChildren(tree);
  };
}
