'use client';
import { useEffect } from 'react';
import { useMutation } from '@apollo/client';
import { CHECKOUT } from '../../../graphql/mutations';
import { useParams } from 'next/navigation';

export default function CheckoutPage() {
  const { bookingId } = useParams();
  const [checkout, { loading, error }] = useMutation(CHECKOUT);

  useEffect(() => {
    const process = async () => {
      try {
        const res = await checkout({
          variables: {
            bookingId,
            method: 'VNPay'
          }
        });
        const url = res.data.checkout.payUrl;
        if (url) {
          window.location.href = url;
        }
      } catch (err) {
        console.error('Checkout failed:', err);
      }
    };

    process();
  }, [bookingId, checkout]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        {loading && <p className="text-blue-600">Redirecting to VNPay...</p>}
        {error && <p className="text-red-600">Checkout failed: {error.message}</p>}
      </div>
    </div>
  );
}
