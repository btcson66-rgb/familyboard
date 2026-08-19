/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_GA4_MEASUREMENT_ID?: string;
  readonly PUBLIC_ADSENSE_PUBLISHER_ID?: string;
  readonly PUBLIC_AMAZON_ASSOCIATES_TAG?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

