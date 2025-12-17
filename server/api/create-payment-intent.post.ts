import { readBody } from "h3"; // Nuxt server helpers
import Stripe from "stripe";

// Server API that creates a PaymentIntent using the Stripe SDK and runtime config
export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const amount = body?.amount ?? 5000; // amount in smallest currency unit (e.g. cents)
  const currency = body?.currency ?? "eur";

  const config = useRuntimeConfig();
  const secret = config?.stripe?.secretKey || process.env.STRIPE_SECRET_KEY;
  if (!secret) {
    throw createError({
      statusCode: 500,
      statusMessage: "Stripe secret key not configured",
    });
  }

  const stripe = new Stripe(secret);

  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency,
    automatic_payment_methods: { enabled: true },
  });

  return { clientSecret: paymentIntent.client_secret };
});
