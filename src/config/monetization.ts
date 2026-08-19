const affiliateTag = import.meta.env.PUBLIC_AMAZON_ASSOCIATES_TAG?.trim() || '';
const adsensePublisherId = import.meta.env.PUBLIC_ADSENSE_PUBLISHER_ID?.trim() || '';

export const monetization = {
  adsEnabled: false,
  affiliateEnabled: Boolean(affiliateTag),
  affiliateTag,
  adsensePublisherId,
  proCheckoutEnabled: false,
  syncCheckoutEnabled: false
} as const;

