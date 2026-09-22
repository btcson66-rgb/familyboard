import sitemapPages from '../generated/sitemap-pages.json';

type SitemapPage = {
  route: string;
  indexable: boolean;
  redirectTo?: string;
};

const normalizeRoute = (route: string) =>
  route === '/' ? '/' : `/${route.replace(/^\/+|\/+$/g, '')}/`;

const indexabilityByRoute = new Map(
  (sitemapPages as SitemapPage[]).map((page) => [normalizeRoute(page.route), page]),
);

export const isRouteIndexable = (route: string) => {
  const page = indexabilityByRoute.get(normalizeRoute(route));
  return page?.indexable === true && !page.redirectTo;
};
