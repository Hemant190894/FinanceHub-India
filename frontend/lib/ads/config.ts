/**
 * Edit this file to show your ads across calculator pages.
 *
 * Image ad: set imageUrl + href + alt
 * Custom HTML (AdSense etc.): set html — paste your ad unit snippet
 * Leave imageUrl/html empty to show a placeholder until you configure it.
 */

export type AdCreative = {
  enabled: boolean;
  imageUrl?: string;
  href?: string;
  alt?: string;
  /** Paste AdSense or other ad network HTML */
  html?: string;
};

export type AdSlots = {
  sidebarTop: AdCreative;
  sidebarBottom: AdCreative;
};

export const AD_SLOTS: AdSlots = {
  sidebarTop: {
    enabled: true,
    imageUrl: "",
    href: "",
    alt: "Your product",
    html: "",
  },
  sidebarBottom: {
    enabled: false,
    imageUrl: "",
    href: "",
    alt: "",
    html: "",
  },
};

export function getAdSlot(slot: keyof AdSlots): AdCreative {
  return AD_SLOTS[slot];
}
