// @ts-nocheck
// Next.js App Router route edge function for PayDunya webhooks
import { NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("[PayDunya Webhook] Received webhook event payload:", body);

    // Verify token or payload signature
    const { status, transaction_id, customer_email, tier, amount } = body;

    if (status === 'completed' && customer_email) {
      // Find the profile in Supabase database
      const { data: profile, error: findError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', customer_email)
        .single();

      if (profile && !findError) {
        const expiresAt = new Date();
        expiresAt.setMonth(expiresAt.getMonth() + 1); // 1 month subscription

        // Update profile subscription tier in db
        await supabase
          .from('profiles')
          .update({
            subscription_tier: tier || 'premium',
            subscription_expires_at: expiresAt.toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', profile.id);

        // Log payment in payments history table
        await supabase
          .from('subscription_payments')
          .insert({
            user_id: profile.id,
            tier: tier || 'premium',
            amount: amount || 29.00,
            currency: 'MAD',
            payment_method: 'paydunya',
            transaction_id: transaction_id || `paydunya-${Date.now()}`,
            status: 'paid',
            paid_at: new Date().toISOString(),
            expires_at: expiresAt.toISOString()
          });

        console.log(`[PayDunya Webhook] Successfully upgraded user ${customer_email} to ${tier}`);
      }
    }

    return NextResponse.json({ received: true, status: "processed" }, { status: 200 });

  } catch (error: any) {
    console.error("[PayDunya Webhook] Edge function error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
export async function GET() {
  return NextResponse.json({ error: "Method not allowed. Please use POST." }, { status: 405 });
}
