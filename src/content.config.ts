import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const pageSchema = z.object({
  title: z.string(),
  description: z.string(),
  route: z.string(),
  primaryIntent: z.string().default(""),
  primaryKeyword: z.string().default(""),
  cluster: z.enum([
    "product",
    "maintenance",
    "appliances",
    "inventory-warranty",
    "records-emergency",
    "household-operations",
    "tools",
    "printables",
    "support",
  ]),
  pageType: z.enum(["content", "tool", "printable", "support"]),
  indexable: z.boolean().default(true),
  publishedAt: z.coerce.date(),
  lastReviewedAt: z.coerce.date(),
  related: z.array(z.string()).default([]),
  contentVersion: z.number().int().positive().default(1),
  faq: z
    .array(z.object({ question: z.string(), answer: z.string() }))
    .default([]),
});

const pages = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/pages" }),
  schema: pageSchema,
});

const pagesZhTw = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/pages-zh-tw" }),
  schema: pageSchema.extend({
    locale: z.literal("zh-TW").default("zh-TW"),
    alternateRoute: z.string(),
  }),
});

export const collections = { pages, pagesZhTw };
