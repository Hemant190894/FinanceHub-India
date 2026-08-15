/**
 * Edit this file to show your ads across calculator pages.
 *
 * leftPanel — tall banner on the left (desktop)
 * bottomLeft / bottomRight — two ad boxes below main content
 *
 * Image ad: imageUrl + href + alt
 * Custom HTML (AdSense): html field
 */

export type AdCreative = {
  enabled: boolean;
  imageUrl?: string;
  href?: string;
  alt?: string;
  html?: string;
};

export type AdSlots = {
  leftPanel: AdCreative;
  bottomLeft: AdCreative;
  bottomRight: AdCreative;
};

export const AD_SLOTS: AdSlots = {
  leftPanel: {
    enabled: false,
    imageUrl: "",
    href: "",
    alt: "Your product",
    html: "",
  },
  bottomLeft: {
    enabled: false,
    imageUrl: "",
    href: "",
    alt: "Your ad",
    html: "",
  },
  bottomRight: {
    enabled: false,
    imageUrl: "",
    href: "",
    alt: "Your ad",
    html: "",
  },
};

export function getAdSlot(slot: keyof AdSlots): AdCreative {
  return AD_SLOTS[slot];
}
