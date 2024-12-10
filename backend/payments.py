import stripe
import paypalrestsdk
from config import (
    STRIPE_SECRET_KEY,
    STRIPE_PUBLISHABLE_KEY,
    PAYPAL_CLIENT_ID,
    PAYPAL_CLIENT_SECRET
)

# Stripe setup
stripe.api_key = STRIPE_SECRET_KEY

# PayPal setup
paypalrestsdk.configure({
    "mode": "sandbox",  # Change to "live" in production
    "client_id": PAYPAL_CLIENT_ID,
    "client_secret": PAYPAL_CLIENT_SECRET
})

class PaymentService:
    @staticmethod
    def create_stripe_payment_intent(amount, currency='usd'):
        try:
            # Create payment intent for Stripe (including Apple Pay/Google Pay)
            intent = stripe.PaymentIntent.create(
                amount=amount,
                currency=currency,
                payment_method_types=['card', 'apple_pay', 'google_pay'],
                metadata={'integration_check': 'accept_a_payment'}
            )
            return {'client_secret': intent.client_secret}
        except Exception as e:
            print(f"Stripe payment error: {e}")
            return None

    @staticmethod
    def create_paypal_order(amount):
        try:
            payment = paypalrestsdk.Payment({
                "intent": "sale",
                "payer": {"payment_method": "paypal"},
                "transactions": [{
                    "amount": {
                        "total": str(amount),
                        "currency": "USD"
                    },
                    "description": "Payment for services"
                }],
                "redirect_urls": {
                    "return_url": "http://localhost:5000/api/payment/success",
                    "cancel_url": "http://localhost:5000/api/payment/cancel"
                }
            })
            
            if payment.create():
                return {'paypal_url': payment.links[1].href}
            else:
                print(f"PayPal payment error: {payment.error}")
                return None
        except Exception as e:
            print(f"PayPal payment error: {e}")
            return None