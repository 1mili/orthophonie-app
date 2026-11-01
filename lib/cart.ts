import { cookies } from "next/headers";
import { nanoid } from "nanoid";
import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { cartItems, products } from "@/lib/db/schema";

const CART_COOKIE = "ortho_cart";

// Safe to call from Server Actions / Route Handlers (allowed to set cookies).
export async function getOrCreateCartSessionId(): Promise<string> {
  const store = await cookies();
  let sid = store.get(CART_COOKIE)?.value;
  if (!sid) {
    sid = nanoid(24);
    store.set(CART_COOKIE, sid, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
  }
  return sid;
}

// Safe to call from Server Components during render (read-only, no cookie writes).
async function peekCartSessionId(): Promise<string | null> {
  const store = await cookies();
  return store.get(CART_COOKIE)?.value ?? null;
}

export async function getCart() {
  const sid = await peekCartSessionId();
  if (!sid) return { items: [], total: 0 };

  const rows = await db
    .select({
      id: cartItems.id,
      quantity: cartItems.quantity,
      product: products,
    })
    .from(cartItems)
    .innerJoin(products, eq(cartItems.productId, products.id))
    .where(eq(cartItems.sessionId, sid));

  const total = rows.reduce((sum, r) => sum + r.product.priceCents * r.quantity, 0);
  return { items: rows, total };
}

export async function addToCart(productId: number, quantity = 1) {
  const sid = await getOrCreateCartSessionId();
  const existing = await db.query.cartItems.findFirst({
    where: and(eq(cartItems.sessionId, sid), eq(cartItems.productId, productId)),
  });
  if (existing) {
    await db
      .update(cartItems)
      .set({ quantity: existing.quantity + quantity })
      .where(eq(cartItems.id, existing.id));
  } else {
    await db.insert(cartItems).values({ sessionId: sid, productId, quantity });
  }
}

export async function removeFromCart(cartItemId: number) {
  const sid = await getOrCreateCartSessionId();
  await db
    .delete(cartItems)
    .where(and(eq(cartItems.id, cartItemId), eq(cartItems.sessionId, sid)));
}

export async function updateCartQuantity(cartItemId: number, quantity: number) {
  const sid = await getOrCreateCartSessionId();
  if (quantity <= 0) return removeFromCart(cartItemId);
  await db
    .update(cartItems)
    .set({ quantity })
    .where(and(eq(cartItems.id, cartItemId), eq(cartItems.sessionId, sid)));
}

export async function clearCart() {
  const sid = await getOrCreateCartSessionId();
  await db.delete(cartItems).where(eq(cartItems.sessionId, sid));
}
