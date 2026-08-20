type SafeParameters = Record<string, string | number | boolean>;

declare global {
  interface Window {
    gtag?: (
      command: "event",
      name: string,
      parameters?: SafeParameters,
    ) => void;
  }
}

const allowedEvents = new Set(["tool_complete", "affiliate_outbound"]);

export function trackPublicEvent(
  name: string,
  parameters: SafeParameters = {},
) {
  if (location.pathname.startsWith("/app/") || !allowedEvents.has(name)) return;
  const safe = Object.fromEntries(
    Object.entries(parameters).filter(
      ([key, value]) =>
        ["tool_slug", "category"].includes(key) &&
        ["string", "number", "boolean"].includes(typeof value),
    ),
  );
  window.gtag?.("event", name, safe);
}

export function initPublicAnalytics() {
  if (location.pathname.startsWith("/app/")) return;
  window.addEventListener("familyboard:tool-completed", (event) => {
    const slug = (event as CustomEvent<{ slug?: string }>).detail?.slug;
    if (slug) trackPublicEvent("tool_complete", { tool_slug: slug });
  });
  document.addEventListener("click", (event) => {
    const link = (event.target as Element | null)?.closest<HTMLAnchorElement>(
      "a[data-affiliate-category]",
    );
    if (link?.dataset.affiliateCategory) {
      trackPublicEvent("affiliate_outbound", {
        category: link.dataset.affiliateCategory,
      });
    }
  });
}
