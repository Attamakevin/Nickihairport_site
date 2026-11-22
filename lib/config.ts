export const SITE = {
  name: "Nicki Hairport",
  tagline: "Luxury Hair. Luxury Confidence.",
  description:
    "Dealers of all raw donor hair in Abuja. 100% premium raw donor hair, Vietnamese & Filipino hairs, wigs, bundles, extensions and professional hair installation.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "2348069848955",
  phoneDisplay: "0806 984 8955",
  email: "janenneka5@gmail.com",
  address: "Shop 89, Miracle Line, Nyanya Market, Abuja",
  instagram: "https://instagram.com/nicki_hairport",
  facebook: "https://facebook.com/Nickihairport",
  tiktok: "https://tiktok.com/@nickihairport",
};

export const whatsappLink = (text = "Hello Nicki Hairport, I'd like to make an enquiry.") =>
  `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(text)}`;

// Flat delivery fee in kobo. Set DELIVERY_FEE_NGN in env; 0 = confirmed after order via WhatsApp.
export const DELIVERY_FEE_KOBO = Math.max(0, Math.round(Number(process.env.DELIVERY_FEE_NGN ?? "0") * 100)) || 0;
