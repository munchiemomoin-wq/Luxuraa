'use client';

import { useStore } from '@/store/useStore';
import { X, Minus, Plus, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

export function CartDrawer() {
  const {
    cart,
    isCartOpen,
    setCartOpen,
    removeFromCart,
    updateCartQuantity,
    getCartTotal,
    getCartCount,
  } = useStore();

  const total = getCartTotal();
  const count = getCartCount();

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-[70]"
            onClick={() => setCartOpen(false)}
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
                <h2 className="text-lg tracking-[0.15em] uppercase font-light">Shopping Bag</h2>
                <p className="text-xs text-warm-gray mt-1">{count} item{count !== 1 ? 's' : ''}</p>
              </div>
              <button
                onClick={() => setCartOpen(false)}
                className="p-2 hover:text-gold transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <ShoppingBag className="h-16 w-16 text-muted-foreground/20 mb-4" />
                  <p className="text-warm-gray text-sm mb-4">Your shopping bag is empty</p>
                  <Button
                    variant="outline"
                    className="tracking-wider uppercase text-xs"
                    onClick={() => setCartOpen(false)}
                  >
                    Continue Shopping
                  </Button>
                </div>
              ) : (
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
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="px-3 text-xs">{item.quantity}</span>
                            <button
                              onClick={() => updateCartQuantity(item.product.id, item.variant.id, item.quantity + 1)}
                              className="p-1 hover:bg-secondary transition-colors"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                          <span className="text-sm font-medium">
                            ${(item.variant.price || item.product.price).toLocaleString()}
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
                <div className="flex items-center justify-between">
                  <span className="text-sm text-warm-gray uppercase tracking-wider">Subtotal</span>
                  <span className="text-lg font-medium">${total.toLocaleString()}</span>
                </div>
                <p className="text-xs text-warm-gray">Shipping calculated at checkout</p>
                <Button className="w-full tracking-wider uppercase text-sm h-12 bg-charcoal hover:bg-charcoal/90">
                  Proceed to Checkout
                </Button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
