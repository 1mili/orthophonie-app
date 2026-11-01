import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { stripe } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  if (!stripe) {
    return NextResponse.json(
      { received: true, simulated: true, message: "Stripe not configured — simulation mode." },
      { status: 200 }
    );
  }

  const sig = req.headers.get("stripe-signature");
  const body = await req.text();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig!, webhookSecret!);
  } catch (err) {
    console.error("[stripe:webhook] signature verification failed", err);
    return NextResponse.json({ error: "invalid_signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as { id: string; metadata?: { orderId?: string } };
    const orderId = session.metadata?.orderId;
    if (orderId) {
      await db
        .update(orders)
        .set({ status: "processing", updatedAt: new Date() })
        .where(eq(orders.id, Number(orderId)));
    }
  }

  return NextResponse.json({ received: true });
}
