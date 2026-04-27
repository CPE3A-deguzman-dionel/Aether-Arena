import React from 'react';
import { motion } from 'framer-motion';
import { X, Play, Home, Settings } from 'lucide-react';

interface PauseMenuProps {
  onResume: () => void;
  onQuit: () => void;
  onSettings: () => void;
}

export const PauseMenu: React.FC<PauseMenuProps> = ({ onResume, onQuit, onSettings }) => {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-[#1a120b]/90 backdrop-blur-md z-50">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.1)_0%,transparent_70%)] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="relative w-[400px] bg-[#1c140d] border-2 border-[#d4af37] rounded-lg shadow-2xl flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#5c3a21]">
          <h2 className="text-2xl font-cinzel font-bold text-[#d4af37] tracking-wider">
            PAUSED
          </h2>
          <button
            onClick={onResume}
            className="p-2 text-[#8b7355] hover:text-[#d4af37] transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Menu Options */}
        <div className="flex-1 p-4 space-y-3">
          <button
            onClick={onResume}
            className="w-full flex items-center justify-center gap-3 px-4 py-4 bg-[#2a1b10] border-2 border-[#d4af37] rounded text-[#d4af37] font-cinzel font-bold text-lg tracking-wider hover:bg-[#3a2210] transition-all"
          >
            <Play size={20} />
            RESUME
          </button>

          <button
            onClick={onSettings}
            className="w-full flex items-center justify-center gap-3 px-4 py-4 bg-[#1a120b] border-2 border-[#5c3a21] rounded text-[#e8d5b5] font-cinzel font-bold text-lg tracking-wider hover:bg-[#2a1b10] hover:border-[#d4af37]/50 transition-all"
          >
            <Settings size={20} />
            SETTINGS
          </button>

          <button
            onClick={onQuit}
            className="w-full flex items-center justify-center gap-3 px-4 py-4 bg-[#1a120b] border-2 border-[#5c3a21] rounded text-[#8b7355] font-cinzel font-bold text-lg tracking-wider hover:bg-[#2a1b10] hover:border-[#8b2500] hover:text-[#8b2500] transition-all"
          >
            <Home size={20} />
            QUIT TO MENU
          </button>
        </div>
      </motion.div>
    </div>
  );
};
