import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-06-30.basil",
});

export async function POST(req: Request) {
  try {
    const { plan } = await req.json();

    const priceId =
      plan === "yearly"
        ? process.env.NEXT_PUBLIC_PRICE_YEARLY
        : process.env.NEXT_PUBLIC_PRICE_MONTHLY;

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId!, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/cancel`,
      automatic_tax: { enabled: true },
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (error: any) {
    console.error("Stripe Checkout Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
