import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig!,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  const supabase = createRouteHandlerClient({ cookies });

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    const { data: empresa } = await supabase
      .from("empresas")
      .insert({
        nombre: session.customer_details?.name,
        stripe_customer_id: session.customer as string,
        plan: session.mode,
      })
      .select()
      .single();

    await supabase.auth.admin.createUser({
      email: session.customer_details?.email!,
      email_confirm: true,
      password: crypto.randomUUID(),
      user_metadata: { empresa_id: empresa.id },
    });
  }

  return NextResponse.json({ received: true });
}
