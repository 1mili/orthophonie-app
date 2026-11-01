"use server";

import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { getCart, clearCart } from "@/lib/cart";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { orders, orderItems } from "@/lib/db/schema";
import { stripe, stripeConfigured } from "@/lib/stripe";
import { sendConfirmationEmail } from "@/lib/notifications";
import { checkoutSchema, firstZodError } from "@/lib/validation";

export type CheckoutState = { error?: string };

export async function checkout(
  _prevState: CheckoutState,
  formData: FormData
): Promise<CheckoutState> {
  const parsed = checkoutSchema.safeParse({
    customerName: formData.get("customerName"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    address: formData.get("address"),
  });
  if (!parsed.success) return { error: firstZodError(parsed.error) };
  const { customerName, email, phone, address } = parsed.data;

  const { items, total } = await getCart();
  if (items.length === 0) {
    return { error: "Votre panier est vide." };
  }

  const session = await getSession();

  const [order] = await db
    .insert(orders)
    .values({
      parentId: session?.userId,
      customerName,
      email,
      phone,
      address,
      totalCents: total,
      status: "pending",
    })
    .returning();

  await db.insert(orderItems).values(
    items.map((item) => ({
      orderId: order.id,
      productId: item.product.id,
      productName: item.product.name,
      unitPriceCents: item.product.priceCents,
      quantity: item.quantity,
    }))
  );

  // Attempt Stripe Checkout if configured; otherwise fall back to
  // "payment on delivery" so the flow stays fully testable without live keys.
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  if (stripeConfigured && stripe) {
    try {
      const checkoutSession = await stripe.checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card"],
        customer_email: email,
        line_items: items.map((item) => ({
          price_data: {
            currency: "usd",
            product_data: { name: item.product.name },
            unit_amount: item.product.priceCents,
          },
          quantity: item.quantity,
        })),
        success_url: `${baseUrl}/commande/confirmation?order=${order.id}`,
        cancel_url: `${baseUrl}/panier`,
        metadata: { orderId: String(order.id) },
      });

      await db
        .update(orders)
        .set({ stripeSessionId: checkoutSession.id })
        .where(eq(orders.id, order.id));

      if (checkoutSession.url) {
        await clearCart();
        redirect(checkoutSession.url);
      }
    } catch (err) {
      console.error("[stripe:error]", err);
      // fall through to non-Stripe confirmation below
    }
  } else {
    console.log("[stripe:mock] Mode simulation paiement — commande #" + order.id);
  }

  await sendConfirmationEmail({
    to: email,
    parentName: customerName,
    date: new Date().toLocaleDateString("fr-FR"),
    time: "",
    service: `Commande #${order.id}`,
  });

  await clearCart();
  redirect(`/commande/confirmation?order=${order.id}`);
}
