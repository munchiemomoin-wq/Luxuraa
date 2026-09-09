'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { X, CreditCard, Lock, Truck, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

declare global {
  interface Window {
    Razorpay: any;
  }
}

const SHIPPING_THRESHOLD = 10000;
const SHIPPING_COST = 199;

export function CheckoutDrawer() {
  const {
    cart,
    isCartOpen,
    setCartOpen,
    removeFromCart,
    updateCartQuantity,
    getCartTotal,
    getCartCount,
  } = useStore();

  const [isCheckout, setIsCheckout] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
  });

  const total = getCartTotal();
  const count = getCartCount();
  const shipping = total >= SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const grandTotal = total + shipping;

  // Load Razorpay script
  useEffect(() => {
    if (isCheckout && !scriptLoaded) {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => setScriptLoaded(true);
      script.onerror = () => toast.error('Failed to load payment gateway');
      document.body.appendChild(script);
    }
  }, [isCheckout, scriptLoaded]);

  const handlePayment = async () => {
    if (!customerInfo.name || !customerInfo.email || !customerInfo.phone) {
      toast.error('Please fill in all details');
      return;
    }

    if (!scriptLoaded || !window.Razorpay) {
      toast.error('Payment gateway not loaded. Please refresh and try again.');
      return;
    }

    setIsProcessing(true);

    try {
      // Create order on server
      const orderRes = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: grandTotal }),
      });

      if (!orderRes.ok) {
        const errData = await orderRes.json();
        throw new Error(errData.error || 'Failed to create order');
      }

      const orderData = await orderRes.json();

      // Build product description
      const description = cart
        .slice(0, 3)
        .map((item) => item.product.name)
        .join(', ') + (cart.length > 3 ? ` +${cart.length - 3} more` : '');

      // Open Razorpay checkout
      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Luxuraa',
        description: description,
        image: '/logo.png',
        order_id: orderData.orderId,
        prefill: {
          name: customerInfo.name,
          email: customerInfo.email,
          contact: customerInfo.phone,
        },
        theme: {
          color: '#1a1a2e',
        },
        handler: async (response: any) => {
          try {
            // Verify payment on server
            const verifyRes = await fetch('/api/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            if (verifyRes.ok) {
              toast.success('Payment successful! Order confirmed.', { duration: 5000 });
              // Clear cart and close
              useStore.setState({ cart: [], isCartOpen: false });
              setIsCheckout(false);
              setIsProcessing(false);
            } else {
              toast.error('Payment verification failed. Please contact support.');
              setIsProcessing(false);
            }
          } catch {
            toast.error('Payment verification failed. Please contact support.');
            setIsProcessing(false);
          }
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
            toast.info('Payment cancelled');
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error: any) {
      toast.error(error.message || 'Payment failed. Please try again.');
      setIsProcessing(false);
    }
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-[70]"
            onClick={() => { setCartOpen(false); setIsCheckout(false); }}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed inset-y-0 right-0 w-full max-w-md bg-background shadow-2xl z-[70] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h2 className="text-lg tracking-[0.15em] uppercase font-light">
                  {isCheckout ? 'Checkout' : 'Shopping Bag'}
                </h2>
                <p className="text-xs text-warm-gray mt-1">{count} item{count !== 1 ? 's' : ''}</p>
              </div>
              <button
                onClick={() => { setCartOpen(false); setIsCheckout(false); }}
                className="p-2 hover:text-gold transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <CreditCard className="h-16 w-16 text-muted-foreground/20 mb-4" />
                  <p className="text-warm-gray text-sm mb-4">Your shopping bag is empty</p>
                  <Button
                    variant="outline"
                    className="tracking-wider uppercase text-xs"
                    onClick={() => setCartOpen(false)}
                  >
                    Continue Shopping
                  </Button>
                </div>
              ) : isCheckout ? (
                /* Checkout Form */
                <div className="space-y-5">
                  {/* Back to cart */}
                  <button
                    onClick={() => setIsCheckout(false)}
                    className="text-xs text-gold hover:text-gold-dark transition-colors tracking-wider uppercase"
                  >
                    &larr; Back to bag
                  </button>

                  {/* Customer Details */}
                  <div className="space-y-4">
                    <h3 className="text-sm tracking-[0.15em] uppercase font-medium">Contact Details</h3>
                    <input
                      type="text"
                      placeholder="Full Name *"
                      value={customerInfo.name}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                      className="w-full border border-border px-4 py-3 text-sm bg-transparent focus:border-gold focus:outline-none transition-colors"
                    />
                    <input
                      type="email"
                      placeholder="Email Address *"
                      value={customerInfo.email}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                      className="w-full border border-border px-4 py-3 text-sm bg-transparent focus:border-gold focus:outline-none transition-colors"
                    />
                    <input
                      type="tel"
                      placeholder="Phone Number *"
                      value={customerInfo.phone}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                      className="w-full border border-border px-4 py-3 text-sm bg-transparent focus:border-gold focus:outline-none transition-colors"
                    />
                  </div>

                  <Separator />

                  {/* Order Summary */}
                  <div className="space-y-3">
                    <h3 className="text-sm tracking-[0.15em] uppercase font-medium">Order Summary</h3>
                    {cart.map((item) => (
                      <div key={`${item.product.id}-${item.variant.id}`} className="flex justify-between text-sm">
                        <span className="text-warm-gray truncate max-w-[200px]">
                          {item.product.name} × {item.quantity}
                        </span>
                        <span className="font-medium ml-2">
                          ₹{((item.variant.price || item.product.price) * item.quantity).toLocaleString('en-IN')}
                        </span>
                      </div>
                    ))}
                    <div className="flex justify-between text-sm pt-2">
                      <span className="text-warm-gray">Subtotal</span>
                      <span className="font-medium">₹{total.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-warm-gray">Shipping</span>
                      <span className={shipping === 0 ? 'text-green-600 font-medium' : 'font-medium'}>
                        {shipping === 0 ? 'FREE' : `₹${shipping.toLocaleString('en-IN')}`}
                      </span>
                    </div>
                    {shipping === 0 && (
                      <p className="text-[10px] text-green-600 flex items-center gap-1">
                        <Truck className="h-3 w-3" />
                        Complimentary shipping on orders over ₹10,000
                      </p>
                    )}
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-sm tracking-wider uppercase font-medium">Total</span>
                      <span className="text-lg font-medium">₹{grandTotal.toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  <Separator />

                  {/* Trust signals */}
                  <div className="space-y-2 py-2">
                    <div className="flex items-center gap-2 text-xs text-warm-gray">
                      <ShieldCheck className="h-3.5 w-3.5 text-green-600" />
                      100% Secure Payment with Razorpay
                    </div>
                    <div className="flex items-center gap-2 text-xs text-warm-gray">
                      <Lock className="h-3.5 w-3.5 text-gold" />
                      SSL Encrypted &amp; PCI DSS Compliant
                    </div>
                  </div>
                </div>
              ) : (
                /* Cart Items */
                <div className="space-y-6">
                  {cart.map((item) => (
                    <div key={`${item.product.id}-${item.variant.id}`} className="flex gap-4">
                      <div className="w-20 h-24 bg-secondary rounded-sm overflow-hidden flex-shrink-0">
                        {(() => {
                          try {
                            const images = JSON.parse(item.product.images);
                            return (
                              <img
                                src={images[0]}
                                alt={item.product.name}
                                className="w-full h-full object-cover"
                              />
                            );
                          } catch {
                            return null;
                          }
                        })()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-warm-gray tracking-wider uppercase">{item.product.brand.name}</p>
                        <p className="text-sm font-medium mt-0.5 truncate">{item.product.name}</p>
                        <p className="text-xs text-warm-gray mt-1">{item.variant.name}</p>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center border">
                            <button
                              onClick={() => updateCartQuantity(item.product.id, item.variant.id, item.quantity - 1)}
                              className="p-1 hover:bg-secondary transition-colors"
                            >
                              <span className="text-xs">−</span>
                            </button>
                            <span className="px-3 text-xs">{item.quantity}</span>
                            <button
                              onClick={() => updateCartQuantity(item.product.id, item.variant.id, item.quantity + 1)}
                              className="p-1 hover:bg-secondary transition-colors"
                            >
                              <span className="text-xs">+</span>
                            </button>
                          </div>
                          <span className="text-sm font-medium">
                            ₹{(item.variant.price || item.product.price).toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.product.id, item.variant.id)}
                        className="p-1 self-start text-warm-gray hover:text-destructive transition-colors"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {cart.length > 0 && (
              <div className="border-t p-6 space-y-4">
                {!isCheckout ? (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-warm-gray uppercase tracking-wider">Subtotal</span>
                      <span className="text-lg font-medium">₹{total.toLocaleString('en-IN')}</span>
                    </div>
                    <p className="text-xs text-warm-gray">Shipping calculated at checkout</p>
                    <Button
                      onClick={() => setIsCheckout(true)}
                      className="w-full tracking-wider uppercase text-sm h-12 bg-charcoal hover:bg-charcoal/90 rounded-none"
                    >
                      <CreditCard className="mr-2 h-4 w-4" />
                      Proceed to Checkout
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={handlePayment}
                    disabled={isProcessing || !scriptLoaded}
                    className="w-full tracking-wider uppercase text-sm h-12 bg-gold hover:bg-gold-dark text-white rounded-none"
                  >
                    <Lock className="mr-2 h-4 w-4" />
                    {isProcessing ? 'Processing...' : `Pay ₹${grandTotal.toLocaleString('en-IN')}`}
                  </Button>
                )}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
