export function createRedirectStub(target: string) {
  return {
    canonicalPath: target,
    indexable: false as const,
    robots: "noindex,follow" as const,
    publicIntegrationsEnabled: false as const,
    refreshContent: `0; url=${target}`,
    heading: "This page has moved",
    linkHref: target,
  };
}
