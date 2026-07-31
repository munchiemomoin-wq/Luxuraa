'use client';

import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { Lock, ArrowLeft, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export function AdminLogin() {
  const { loginAdmin, goHome } = useStore();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      toast.error('Please enter the admin password');
      return;
    }
    setIsLoading(true);
    const success = await loginAdmin(password);
    setIsLoading(false);
    if (!success) {
      toast.error('Incorrect password. Please try again.');
      setPassword('');
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md mx-auto px-4"
      >
        {/* Back button */}
        <button
          onClick={goHome}
          className="flex items-center gap-2 text-xs text-warm-gray hover:text-gold transition-colors tracking-wider uppercase mb-8"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Store
        </button>

        <div className="border p-8 sm:p-10">
          {/* Icon */}
          <div className="w-16 h-16 mx-auto mb-6 border border-gold/30 rounded-full flex items-center justify-center">
            <ShieldCheck className="h-7 w-7 text-gold" />
          </div>

          <div className="text-center mb-8">
            <h2 className="text-xl font-light tracking-wide mb-2">Admin Access</h2>
            <p className="text-xs text-warm-gray">
              Enter the admin password to manage products
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-gray">
                <Lock className="h-4 w-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                autoFocus
                className="w-full h-11 pl-10 pr-10 text-sm border bg-background focus:outline-none focus:ring-1 focus:ring-gold/30 rounded-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-warm-gray hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-charcoal hover:bg-charcoal/90 rounded-none tracking-[0.15em] uppercase text-xs"
            >
              {isLoading ? 'Verifying...' : 'Unlock Admin Panel'}
            </Button>
          </form>

          <p className="text-[10px] text-warm-gray text-center mt-6">
            Authorized personnel only. All access is logged.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
