import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import fs from 'node:fs';

const sitemapPages = JSON.parse(
  fs.readFileSync(new URL('./src/generated/sitemap-pages.json', import.meta.url), 'utf8')
);
const sitemapPageByRoute = new Map(sitemapPages.map((page) => [page.route, page]));
const systemRoutes = new Set(['/app/', '/zh-tw/app/', '/offline/']);
const normalizeRoute = (url) => {
  const pathname = new URL(url).pathname;
  return pathname === '/' ? '/' : `/${pathname.replace(/^\/+|\/+$/g, '')}/`;
};

export default defineConfig({
  site: 'https://familyboard.win',
  output: 'static',
  trailingSlash: 'always',
  integrations: [
    react(),
    sitemap({
      filter: (page) => {
        const route = normalizeRoute(page);
        const metadata = sitemapPageByRoute.get(route);
        return !systemRoutes.has(route) && metadata?.indexable === true && !metadata.redirectTo;
      },
      i18n: {
        defaultLocale: 'en',
        locales: { en: 'en', 'zh-tw': 'zh-TW' }
      },
      serialize: (item) => {
        const metadata = sitemapPageByRoute.get(normalizeRoute(item.url));
        if (!metadata) return undefined;
        const links = item.links ? [...item.links] : undefined;
        const english = links?.find((link) => link.lang === 'en');
        if (links && english && !links.some((link) => link.lang === 'x-default')) {
          links.push({ lang: 'x-default', url: english.url });
        }
        return {
          ...item,
          lastmod: new Date(`${metadata.lastReviewedAt}T00:00:00.000Z`).toISOString(),
          links
        };
      },
      namespaces: { xhtml: true, news: false, image: false, video: false }
    })
  ],
  build: {
    inlineStylesheets: 'auto'
  },
  vite: {
    build: {
      cssMinify: true
    }
  }
});
