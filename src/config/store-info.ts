/**
 * Public, approved store information that may be sent to the AI model.
 * Do not put credentials, internal contacts, or private business data here.
 */
export const storeInfo = {
  company: "Meridian",
  about: null as string | null,
  contact: null as string | null,
  shippingPolicy: null as string | null,
  returnPolicy: null as string | null,
  faqs: [] as Array<{ question: string; answer: string }>,
};
