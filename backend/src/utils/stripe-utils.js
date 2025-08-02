import Stripe from 'stripe';

export const createStripeCheckoutSession = async (payment, booking, userEmail) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  
  // ✅ Calculate proper amount and details
  const tour = booking.tour || booking.tourId;
  const passengerCount = booking.passengers?.length || 1;
  const unitPrice = payment.amount / 100 / passengerCount; // Convert back to dollars per person
  
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    customer_email: userEmail,
    line_items: [{
      price_data: {
        currency: 'usd',
        product_data: { 
          name: `Tour: ${tour?.title || `Booking ${booking._id}`}`,
          description: `Booking ID: ${booking._id} - ${passengerCount} passenger(s) - $${unitPrice.toFixed(2)} per person`
        },
        unit_amount: Math.round(unitPrice * 100), // Price per person in cents
      },
      quantity: passengerCount,
    }],
    mode: 'payment',
    // ✅ Success URL với bookingId để proper tracking
    success_url: `${process.env.FRONTEND_URL}/bookings/${booking._id}?payment=success&session_id={CHECKOUT_SESSION_ID}&payment_id=${payment._id}`,
    cancel_url: `${process.env.FRONTEND_URL}/bookings/${booking._id}?payment=cancelled`,
    metadata: {
      paymentId: payment._id.toString(),
      bookingId: booking._id.toString(),
      passengerCount: passengerCount.toString(),
    },
  });

  return session.url;
};
