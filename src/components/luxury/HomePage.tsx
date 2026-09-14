'use client';

import { useStore } from '@/store/useStore';
import { ArrowRight, Truck, Shield, RefreshCw, Star, Flame, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ProductCard } from './ProductCard';

export function HomePage() {
  const {
    brands,
    categories,
    products,
    navigateTo,
    setFilter,
  } = useStore();

  const featuredProducts = products.filter((p) => p.featured).slice(0, 8);
  const newArrivals = products.filter((p) => p.newArrival).slice(0, 4);
  const bestsellers = products.filter((p) => p.bestseller).slice(0, 4);

  // Offer of the Day: product with highest discount percentage
  const productsOnSale = products.filter((p) => p.compareAtPrice && p.compareAtPrice > p.price);
  const offerOfTheDay = productsOnSale.length > 0
    ? productsOnSale.sort((a, b) => {
        const dA = (a.compareAtPrice! - a.price) / a.compareAtPrice!;
        const dB = (b.compareAtPrice! - b.price) / b.compareAtPrice!;
        return dB - dA;
      })[0]
    : null;

  return (
    <div>
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-charcoal">
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal/80 via-charcoal/60 to-charcoal" />
        <img
          src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&q=80"
          alt="Luxury fashion"
          className="absolute inset-0 w-full h-full object-cover opacity-40"
        />
        <div className="relative z-10 text-center px-4 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <p className="text-gold text-xs tracking-[0.4em] uppercase mb-6">
              The World&apos;s Finest Luxury
            </p>
            <h2 className="text-4xl sm:text-5xl lg:text-7xl font-light text-white tracking-wide leading-tight mb-4">
              Discover Timeless
              <br />
              <span className="font-medium text-gradient-gold">Elegance</span>
            </h2>
            <p className="text-white/60 text-sm sm:text-base max-w-2xl mx-auto mt-6 mb-10 leading-relaxed">
              Curated collections from the most prestigious fashion houses. 
              Authentic luxury pieces that define sophistication and style.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                onClick={() => navigateTo('shop')}
                size="lg"
                className="bg-gold text-white hover:bg-gold-dark tracking-[0.2em] uppercase text-xs px-8 h-12 rounded-none"
              >
                Shop Collection
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                onClick={() => navigateTo('shop')}
                size="lg"
                className="border-white/30 text-white hover:bg-white/10 hover:text-white tracking-[0.2em] uppercase text-xs px-8 h-12 rounded-none"
              >
                Explore Brands
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Brand Marquee */}
      <section className="py-8 border-b border-t">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between gap-8 overflow-x-auto scrollbar-hide">
            {brands.map((brand) => (
              <button
                key={brand.id}
                onClick={() => {
                  setFilter('brandId', brand.id);
                  navigateTo('brand', brand.id);
                }}
                className="flex-shrink-0 text-warm-gray hover:text-foreground transition-colors"
              >
                <span className="text-sm sm:text-base tracking-[0.2em] uppercase font-light">
                  {brand.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Categories - Men & Women */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-gold text-xs tracking-[0.3em] uppercase mb-3">Explore</p>
            <h3 className="text-2xl sm:text-3xl font-light tracking-wide">Shop by Collection</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8">
            {categories.map((cat, index) => {
              const catImages: Record<string, string> = {
                men: 'https://images.unsplash.com/photo-1617137900204-4b4e3570e8e4?w=600',
                women: 'https://images.unsplash.com/photo-1483985333961-0f44e643276e?w=600',
              };
              const img = cat.image || catImages[cat.slug] || 'https://images.unsplash.com/photo-1441984904996-e2b8e4b3e0e4?w=600';
              return (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.15 }}
                  className="group relative overflow-hidden luxury-image-hover"
                >
                  <div className="aspect-[16/9] sm:aspect-[2/1]">
                    <img
                      src={img}
                      alt={cat.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="absolute inset-0 border border-white/10 group-hover:border-gold/40 transition-colors" />
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <p className="text-white text-lg tracking-[0.2em] uppercase font-light">{cat.name}</p>
                      <p className="text-white/50 text-xs mt-1">{cat._count.products} pieces</p>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {cat.subCategories.slice(0, 6).map((sub) => (
                          <button
                            key={sub.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              setFilter('categoryId', cat.id);
                              setFilter('subCategoryId', sub.id);
                              navigateTo('category', cat.id);
                            }}
                            className="text-[10px] text-white/70 hover:text-gold tracking-wider uppercase border border-white/20 hover:border-gold/50 px-2 py-1 transition-colors"
                          >
                            {sub.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setFilter('categoryId', cat.id);
                      setFilter('subCategoryId', '');
                      navigateTo('category', cat.id);
                    }}
                    className="absolute inset-0 z-10 cursor-pointer"
                    aria-label={`Shop ${cat.name}`}
                  />
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Offer of the Day */}
      {offerOfTheDay && (() => {
        let otdImages: string[] = [];
        try { otdImages = JSON.parse(offerOfTheDay.images); } catch { otdImages = []; }
        const otdDiscount = Math.round(((offerOfTheDay.compareAtPrice! - offerOfTheDay.price) / offerOfTheDay.compareAtPrice!) * 100);
        const savings = offerOfTheDay.compareAtPrice! - offerOfTheDay.price;
        return (
          <section className="py-16 lg:py-24 bg-charcoal relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gold rounded-full blur-[150px]" />
            </div>
            <div className="max-w-7xl mx-auto px-4 relative z-10">
              <div className="text-center mb-10">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                >
                  <p className="text-gold text-xs tracking-[0.3em] uppercase mb-3 flex items-center justify-center gap-2">
                    <Flame className="h-3.5 w-3.5" />
                    Don&apos;t Miss Out
                  </p>
                  <h3 className="text-2xl sm:text-3xl lg:text-4xl font-light tracking-wide text-white">
                    Offer of the <span className="text-gradient-gold">Day</span>
                  </h3>
                </motion.div>
              </div>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.15 }}
                className="max-w-5xl mx-auto"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                  {/* Product Image */}
                  <div
                    className="relative aspect-[3/4] max-h-[500px] overflow-hidden cursor-pointer group"
                    onClick={() => navigateTo('product', offerOfTheDay.id)}
                  >
                    <img
                      src={otdImages[0] || ''}
                      alt={offerOfTheDay.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute top-4 left-4 bg-destructive text-white px-4 py-2">
                      <p className="text-2xl font-bold">-{otdDiscount}%</p>
                      <p className="text-[10px] tracking-wider uppercase">OFF</p>
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="text-center lg:text-left space-y-5">
                    <p className="text-gold text-xs tracking-[0.2em] uppercase">
                      {offerOfTheDay.brand.name}
                    </p>
                    <h4 className="text-xl sm:text-2xl lg:text-3xl font-light text-white tracking-wide leading-snug">
                      {offerOfTheDay.name}
                    </h4>
                    {offerOfTheDay.description && (
                      <p className="text-white/50 text-sm leading-relaxed line-clamp-3">
                        {offerOfTheDay.description}
                      </p>
                    )}

                    {/* Pricing */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-center lg:justify-start gap-3">
                        <span className="text-3xl font-medium text-white">
                          ₹{offerOfTheDay.price.toLocaleString('en-IN')}
                        </span>
                        <span className="text-lg text-white/40 line-through">
                          MRP ₹{offerOfTheDay.compareAtPrice!.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <p className="text-gold text-sm font-medium">
                        You save ₹{savings.toLocaleString('en-IN')} ({otdDiscount}% off)
                      </p>
                    </div>

                    {/* Timer aesthetic */}
                    <div className="flex items-center justify-center lg:justify-start gap-2 text-white/30 text-xs tracking-wider uppercase">
                      <Clock className="h-3.5 w-3.5" />
                      <span>Limited time offer</span>
                    </div>

                    <Button
                      onClick={() => navigateTo('product', offerOfTheDay.id)}
                      className="bg-gold text-white hover:bg-gold-dark tracking-[0.2em] uppercase text-xs px-8 h-12 rounded-none"
                    >
                      View Offer
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            </div>
          </section>
        );
      })()}

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="py-16 lg:py-24 bg-cream">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-end justify-between mb-12">
              <div>
                <p className="text-gold text-xs tracking-[0.3em] uppercase mb-3">Curated Selection</p>
                <h3 className="text-2xl sm:text-3xl font-light tracking-wide">Featured Pieces</h3>
              </div>
              <Button
                variant="ghost"
                onClick={() => navigateTo('shop')}
                className="text-xs tracking-[0.15em] uppercase text-warm-gray hover:text-gold"
              >
                View All <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.slice(0, 4).map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* New Arrivals */}
      {newArrivals.length > 0 && (
        <section className="py-16 lg:py-24">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-end justify-between mb-12">
              <div>
                <p className="text-gold text-xs tracking-[0.3em] uppercase mb-3">Just Arrived</p>
                <h3 className="text-2xl sm:text-3xl font-light tracking-wide">New Collection</h3>
              </div>
              <Button
                variant="ghost"
                onClick={() => {
                  useStore.getState().setFilter('newArrival', true);
                  navigateTo('shop');
                }}
                className="text-xs tracking-[0.15em] uppercase text-warm-gray hover:text-gold"
              >
                View All <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {newArrivals.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Luxury Banner */}
      <section className="py-16 lg:py-24 bg-charcoal relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gold rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gold rounded-full blur-[120px]" />
        </div>
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <p className="text-gold text-xs tracking-[0.4em] uppercase mb-6">Our Promise</p>
          <h3 className="text-3xl sm:text-4xl lg:text-5xl font-light text-white tracking-wide leading-tight mb-6">
            Authenticity Guaranteed
            <br />
            <span className="text-gradient-gold">Every Piece, Every Time</span>
          </h3>
          <p className="text-white/50 text-sm max-w-2xl mx-auto mb-10 leading-relaxed">
            Every product undergoes rigorous authentication by our team of expert curators. 
            We partner directly with luxury houses and verified suppliers to ensure the 
            highest standards of quality and authenticity.
          </p>
        </div>
      </section>

      {/* Services */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Truck, title: 'Free Shipping', desc: 'Complimentary worldwide delivery on orders over ₹10,000' },
              { icon: Shield, title: 'Authenticity', desc: 'Every item verified by our expert authentication team' },
              { icon: RefreshCw, title: 'Easy Returns', desc: '14-day hassle-free returns with full refund guarantee' },
              { icon: Star, title: 'Premium Care', desc: 'Dedicated concierge service for all your luxury needs' },
            ].map((service, index) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-center p-6"
              >
                <div className="w-12 h-12 mx-auto mb-4 border border-gold/30 rounded-full flex items-center justify-center">
                  <service.icon className="h-5 w-5 text-gold" />
                </div>
                <h4 className="text-sm tracking-[0.15em] uppercase font-medium mb-2">{service.title}</h4>
                <p className="text-xs text-warm-gray leading-relaxed">{service.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
