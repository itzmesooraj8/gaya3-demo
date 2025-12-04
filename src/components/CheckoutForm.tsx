import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { createPaymentIntent } from '../services/payments';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

function CheckoutInner({ propertyId }: { propertyId: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const start = new Date().toISOString().slice(0,10);
      const end = new Date(Date.now() + 1000*60*60*24).toISOString().slice(0,10);
      const { client_secret } = await createPaymentIntent({ property_id: propertyId, start_date: start, end_date: end });

      if (!stripe || !elements) throw new Error('Stripe not loaded');

      const card = elements.getElement(CardElement);
      if (!card) throw new Error('Card element not found');

      const { error: stripeError } = await stripe.confirmCardPayment(client_secret, { payment_method: { card } });
      if (stripeError) {
        setError(stripeError.message || 'Payment failed');
      } else {
        // success — redirect or show confirmation
        window.location.href = '/booking-success';
      }
    } catch (err: any) {
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <CardElement />
      <button type="submit" disabled={loading}>{loading ? 'Processing…' : 'Pay'}</button>
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </form>
  );
}

export default function CheckoutForm({ propertyId }: { propertyId: string }) {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutInner propertyId={propertyId} />
    </Elements>
  );
}
