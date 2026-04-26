import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ShoppingCart } from 'lucide-react';
interface WaveClearBannerProps {
  wave: number;
  onNextWave: () => void;
  onOpenShop: () => void;
}
export const WaveClearBanner: React.FC<WaveClearBannerProps> = ({
  wave,
  onNextWave,
  onOpenShop
}) => {
  return (
    <div className="absolute inset-0 pointer-events-none z-40">
      {/* Top banner: non-interactive label */}
      <div className="absolute left-0 right-0 top-6 flex justify-center pointer-events-none z-40">
        <motion.div
          initial={{ y: -8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.35 }}
          className="bg-[#081024]/70 border border-[#2b2b2b]/30 rounded-xl px-6 py-2 shadow-lg">
          <div className="text-xl sm:text-2xl font-cinzel font-bold text-[#f8e8b0] tracking-wide">
            WAVE {wave} CLEARED
          </div>
        </motion.div>
      </div>

      {/* Bottom controls: interactive buttons, non-blocking elsewhere */}
      <div className="absolute left-0 right-0 bottom-8 flex justify-center pointer-events-none z-40">
        <div className="pointer-events-auto flex gap-4">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={onOpenShop}
            className="px-5 py-3 bg-transparent border-2 border-[#d4af37] text-[#d4af37] rounded-md font-bold hover:bg-[#2a1b10] transition-colors flex items-center gap-2">
            <ShoppingCart size={18} /> SHOP
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={onNextWave}
            className="px-5 py-3 bg-[#d97706] text-[#081024] rounded-md font-bold hover:bg-[#f59e0b] transition-colors flex items-center gap-2">
            NEXT WAVE <ArrowRight size={18} />
          </motion.button>
        </div>
      </div>
    </div>
  );
};