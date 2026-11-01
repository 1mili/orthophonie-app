import Stripe from "stripe";

const key = process.env.STRIPE_SECRET_KEY;
const isConfigured = !!key && !key.includes("replace_me");

export const stripe = isConfigured
  ? new Stripe(key!, { apiVersion: "2026-06-24.dahlia" })
  : null;

export const stripeConfigured = isConfigured;
