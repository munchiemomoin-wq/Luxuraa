'use client';

import { useStore } from '@/store/useStore';
import { Instagram, Twitter, Facebook, Mail, MapPin, Phone } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export function Footer() {
  const { brands, categories, goHome, navigateTo, setFilter } = useStore();

  return (
    <footer className="bg-charcoal text-white mt-auto">
      {/* Gold accent */}
      <div className="h-[1px] gold-shimmer" />

      {/* Newsletter */}
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="text-center sm:text-left">
              <h3 className="text-lg font-light tracking-wider">Join <span className="text-gradient-gold">Luxuraa</span></h3>
              <p className="text-white/50 text-xs mt-1 tracking-wider">
                Subscribe for exclusive access to new arrivals and private sales
              </p>
            </div>
            <div className="flex w-full sm:w-auto">
              <input
                type="email"
                placeholder="YOUR EMAIL"
                className="flex-1 sm:w-72 h-10 px-4 bg-white/5 border border-white/10 text-xs tracking-wider uppercase focus:outline-none focus:border-gold/50 placeholder:text-white/30"
              />
              <button className="h-10 px-6 bg-gold text-white text-xs tracking-[0.15em] uppercase hover:bg-gold-dark transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 py-12 lg:py-16">
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="col-span-2 sm:col-span-2 lg:col-span-1">
            <button onClick={goHome} className="inline-block">
              <h2 className="text-xl font-light tracking-[0.3em] uppercase mb-4">
                <span className="text-gradient-gold font-medium">Luxuraa</span>
              </h2>
            </button>
            <p className="text-white/40 text-xs leading-relaxed mb-6 max-w-xs">
              The definitive destination for authentic luxury fashion and accessories 
              from the world&apos;s most prestigious fashion houses.
            </p>
            <div className="flex items-center gap-3">
              <a href="#" className="w-8 h-8 border border-white/10 flex items-center justify-center hover:border-gold/50 hover:text-gold transition-colors">
                <Instagram className="h-3.5 w-3.5" />
              </a>
              <a href="#" className="w-8 h-8 border border-white/10 flex items-center justify-center hover:border-gold/50 hover:text-gold transition-colors">
                <Twitter className="h-3.5 w-3.5" />
              </a>
              <a href="#" className="w-8 h-8 border border-white/10 flex items-center justify-center hover:border-gold/50 hover:text-gold transition-colors">
                <Facebook className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>

          {/* Shop Column */}
          <div>
            <h4 className="text-xs tracking-[0.2em] uppercase font-medium mb-4 text-gold">Shop</h4>
            <ul className="space-y-2.5">
              {categories.map((cat) => (
                <li key={cat.id}>
                  <button
                    onClick={() => {
                      setFilter('categoryId', cat.id);
                      navigateTo('category', cat.id);
                    }}
                    className="text-white/40 text-xs tracking-wider uppercase hover:text-white transition-colors"
                  >
                    {cat.name}
                  </button>
                  <ul className="pl-3 mt-1 space-y-1">
                    {cat.subCategories.slice(0, 4).map((sub) => (
                      <li key={sub.id}>
                        <button
                          onClick={() => {
                            setFilter('categoryId', cat.id);
                            setFilter('subCategoryId', sub.id);
                            navigateTo('category', cat.id);
                          }}
                          className="text-white/25 text-[10px] tracking-wider uppercase hover:text-white transition-colors"
                        >
                          {sub.name}
                        </button>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
              <li>
                <button
                  onClick={() => navigateTo('shop')}
                  className="text-white/40 text-xs tracking-wider uppercase hover:text-white transition-colors"
                >
                  All Products
                </button>
              </li>
            </ul>
          </div>

          {/* Brands Column */}
          <div>
            <h4 className="text-xs tracking-[0.2em] uppercase font-medium mb-4 text-gold">Brands</h4>
            <ul className="space-y-2.5">
              {brands.slice(0, 6).map((brand) => (
                <li key={brand.id}>
                  <button
                    onClick={() => {
                      setFilter('brandId', brand.id);
                      navigateTo('brand', brand.id);
                    }}
                    className="text-white/40 text-xs tracking-wider uppercase hover:text-white transition-colors"
                  >
                    {brand.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service Column */}
          <div>
            <h4 className="text-xs tracking-[0.2em] uppercase font-medium mb-4 text-gold">Customer Service</h4>
            <ul className="space-y-2.5">
              {['Contact Us', 'Shipping Info', 'Returns & Exchanges', 'Authentication', 'Size Guide', 'FAQ'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-white/40 text-xs tracking-wider uppercase hover:text-white transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-white/30 text-xs tracking-wider">
              &copy; {new Date().getFullYear()} Luxuraa. All rights reserved. | luxuraa.in
            </p>
            <div className="flex items-center gap-6">
              {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((item) => (
                <a key={item} href="#" className="text-white/30 text-[10px] tracking-wider uppercase hover:text-white/60 transition-colors">
                  {item}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
