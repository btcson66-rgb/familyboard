import { describe, expect, it } from "vitest";
import { createRedirectStub } from "../src/lib/redirect-stub";

describe("consolidated-route redirect stub", () => {
  it("uses the target for canonical, refresh and the visible link without public integrations", () => {
    const stub = createRedirectStub("/features/home-organizer/");

    expect(stub).toEqual({
      canonicalPath: "/features/home-organizer/",
      indexable: false,
      robots: "noindex,follow",
      publicIntegrationsEnabled: false,
      refreshContent: "0; url=/features/home-organizer/",
      heading: "This page has moved",
      linkHref: "/features/home-organizer/",
    });
  });
});
