import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Settings, RotateCcw } from 'lucide-react';

interface KeyBindingsMenuProps {
  onClose: () => void;
}

interface KeyBindings {
  moveUp: string;
  moveDown: string;
  moveLeft: string;
  moveRight: string;
  rangedAttack: string;
  meleeAttack: string;
  dash: string;
  consumable1: string;
  consumable2: string;
  consumable3: string;
}

const DEFAULT_BINDINGS: KeyBindings = {
  moveUp: 'W',
  moveDown: 'S',
  moveLeft: 'A',
  moveRight: 'D',
  rangedAttack: 'LMB',
  meleeAttack: 'RMB',
  dash: 'SPACE',
  consumable1: '1',
  consumable2: '2',
  consumable3: '3',
};

export const KeyBindingsMenu: React.FC<KeyBindingsMenuProps> = ({ onClose }) => {
  const [bindings, setBindings] = useState<KeyBindings>(DEFAULT_BINDINGS);
  const [listeningFor, setListeningFor] = useState<keyof KeyBindings | null>(null);

  useEffect(() => {
    if (!listeningFor) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();

      if (e.key === 'Escape') {
        setListeningFor(null);
        return;
      }

      const key = e.key === ' ' ? 'SPACE' : e.key.toUpperCase();
      setBindings((prev) => ({ ...prev, [listeningFor]: key }));
      setListeningFor(null);
    };

    const handleMouseDown = (e: MouseEvent) => {
      e.preventDefault();

      if (e.button === 0) {
        setBindings((prev) => ({ ...prev, [listeningFor]: 'LMB' }));
        setListeningFor(null);
      } else if (e.button === 2) {
        setBindings((prev) => ({ ...prev, [listeningFor]: 'RMB' }));
        setListeningFor(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('mousedown', handleMouseDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mousedown', handleMouseDown);
    };
  }, [listeningFor]);

  const handleReset = () => {
    setBindings(DEFAULT_BINDINGS);
  };

  const startListening = (action: keyof KeyBindings) => {
    setListeningFor(action);
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-[#1a120b]/95 backdrop-blur-md z-50">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.1)_0%,transparent_70%)] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="relative w-[500px] max-h-[80vh] bg-[#1c140d] border-2 border-[#d4af37] rounded-lg shadow-2xl flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#5c3a21]">
          <div className="flex items-center gap-3">
            <Settings size={24} className="text-[#d4af37]" />
            <h2 className="text-2xl font-cinzel font-bold text-[#d4af37] tracking-wider">
              CONTROLS
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#8b7355] hover:text-[#d4af37] transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Key Bindings List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {Object.entries(bindings).map(([action, key]) => (
            <div
              key={action}
              className="flex items-center justify-between p-3 bg-[#1a120b] border border-[#5c3a21] rounded hover:border-[#d4af37]/50 transition-colors"
            >
              <span className="text-[#e8d5b5] font-cinzel font-bold uppercase tracking-wider">
                {action.replace(/([A-Z])/g, ' $1').trim()}
              </span>
              <button
                onClick={() => startListening(action as keyof KeyBindings)}
                className={`min-w-[100px] px-4 py-2 font-bold rounded border-2 transition-all ${
                  listeningFor === action
                    ? 'bg-[#d4af37]/20 border-[#d4af37] text-[#d4af37] animate-pulse'
                    : 'bg-[#1a120b] border-[#5c3a21] text-[#e8d5b5] hover:border-[#d4af37] hover:text-[#d4af37]'
                }`}
              >
                {listeningFor === action ? 'PRESS KEY...' : key}
              </button>
            </div>
          ))}
        </div>

        {/* Reset Button */}
        <div className="p-4 border-t border-[#5c3a21]">
          <button
            onClick={handleReset}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#1a120b] border-2 border-[#5c3a21] rounded text-[#e8d5b5] font-cinzel font-bold hover:border-[#d4af37] hover:text-[#d4af37] transition-all"
          >
            <RotateCcw size={18} />
            Reset to Defaults
          </button>
        </div>
      </motion.div>
    </div>
  );
};
