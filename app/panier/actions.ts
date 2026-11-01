"use server";

import { revalidatePath } from "next/cache";
import { addToCart, removeFromCart, updateCartQuantity } from "@/lib/cart";

export async function addToCartAction(formData: FormData) {
  const productId = Number(formData.get("productId"));
  await addToCart(productId, 1);
  revalidatePath("/panier");
  revalidatePath("/boutique");
}

export async function removeFromCartAction(formData: FormData) {
  const cartItemId = Number(formData.get("cartItemId"));
  await removeFromCart(cartItemId);
  revalidatePath("/panier");
}

export async function updateQuantityAction(formData: FormData) {
  const cartItemId = Number(formData.get("cartItemId"));
  const quantity = Number(formData.get("quantity"));
  await updateCartQuantity(cartItemId, quantity);
  revalidatePath("/panier");
}
