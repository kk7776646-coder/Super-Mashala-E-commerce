/**
 * SUPER MASHALA & DRY FRUITS - CENTRALIZED IMAGE REGISTRY
 * 
 * IMPORTANT: All product, category, and banner images are centralized here.
 * To replace images with your actual product photography later:
 * 1. Drop your new JPG/PNG files into /public/assets/products/...
 * 2. Update the corresponding path in this file.
 * Frontend components NEVER hardcode image URLs!
 */

export const FALLBACK_PRODUCT_IMAGE = "/assets/icons/spice-icon.svg";

export const BRAND_ASSETS = {
  logo: "/assets/logo/super-mashala-logo.png",
  logoPng: "/assets/logo/super-mashala-logo.png",
  logoHorizontal: "/assets/logo/super-mashala-logo.png",
  logoSymbol: "/assets/logo/super-mashala-symbol.png",
  logoCompact: "/assets/logo/super-mashala-logo.png",
  logoFooter: "/assets/logo/super-mashala-logo.png",
  logoInvoice: "/assets/logo/super-mashala-logo.png",
  logoBadge: "/assets/logo/super-mashala-logo.png",
  icon: "/assets/logo/super-mashala-logo.png",
  heroBanner: "/assets/products/whole-spices/rai.png",
  aboutStory: "/assets/products/masala-powder/garam-masala.png",
  wholesaleBanner: "/assets/products/whole-spices/jira.png",
};

export const CATEGORY_IMAGES = {
  cat_masala_powder: "/assets/products/masala-powder/garam-masala.png",
  cat_whole_spices: "/assets/products/whole-spices/rai.png",
  cat_premium_spices: "/assets/products/premium-spices/elaichi.png",
  cat_dry_fruits: "/assets/icons/spice-icon.svg",
};

export const PRODUCT_IMAGES = {
  // CATEGORY A: MASALA POWDER
  p_garam_masala: {
    primary: "/assets/products/masala-powder/garam-masala.png",
    alt: "Garam Masala",
    fallback: FALLBACK_PRODUCT_IMAGE,
  },
  p_sabji_masala: {
    primary: "/assets/products/masala-powder/sabji-masala.png",
    alt: "Sabji Masala",
    fallback: FALLBACK_PRODUCT_IMAGE,
  },

  // CATEGORY B: WHOLE SPICES
  p_kafur: {
    primary: "/assets/products/whole-spices/kafur.png",
    alt: "Kafur",
    fallback: FALLBACK_PRODUCT_IMAGE,
  },
  p_rai: {
    primary: "/assets/products/whole-spices/rai.png",
    alt: "Rai",
    fallback: FALLBACK_PRODUCT_IMAGE,
  },
  p_jira: {
    primary: "/assets/products/whole-spices/jira.png",
    alt: "Jira (Jeera)",
    fallback: FALLBACK_PRODUCT_IMAGE,
  },
  p_methi: {
    primary: "/assets/products/whole-spices/methi.png",
    alt: "Methi",
    fallback: FALLBACK_PRODUCT_IMAGE,
  },
  p_saunf: {
    primary: "/assets/products/whole-spices/saunf.png",
    alt: "Saunf (Souf)",
    fallback: FALLBACK_PRODUCT_IMAGE,
  },
  p_ajwain: {
    primary: "/assets/products/whole-spices/ajwain.png",
    alt: "Ajwain",
    fallback: FALLBACK_PRODUCT_IMAGE,
  },
  p_panchforan: {
    primary: "/assets/products/whole-spices/panchforan.png",
    alt: "Panchforan",
    fallback: FALLBACK_PRODUCT_IMAGE,
  },
  p_tej_patta: {
    primary: "/assets/products/whole-spices/tej-patta.png",
    alt: "Tej Patta",
    fallback: FALLBACK_PRODUCT_IMAGE,
  },
  p_kali_mirch: {
    primary: "/assets/products/whole-spices/kali-mirch.png",
    alt: "Kali Mirch (Kala Miri)",
    fallback: FALLBACK_PRODUCT_IMAGE,
  },
  p_laung: {
    primary: "/assets/products/whole-spices/laung.png",
    alt: "Laung (Long)",
    fallback: FALLBACK_PRODUCT_IMAGE,
  },

  // CATEGORY C: PREMIUM SPICES
  p_elaichi: {
    primary: "/assets/products/premium-spices/elaichi.png",
    alt: "Elaichi (Chhoti Elaichi)",
    fallback: FALLBACK_PRODUCT_IMAGE,
  },
  p_khas_khas: {
    primary: "/assets/products/premium-spices/khas-khas.png",
    alt: "Khas Khas",
    fallback: FALLBACK_PRODUCT_IMAGE,
  },
  p_badi_elaichi: {
    primary: "/assets/products/premium-spices/badi-elaichi.png",
    alt: "Badi Elaichi",
    fallback: FALLBACK_PRODUCT_IMAGE,
  },
};

export const getProductImage = (productId) => {
  return PRODUCT_IMAGES[productId]?.primary || `/assets/products/whole-spices/${productId}.png` || FALLBACK_PRODUCT_IMAGE;
};
