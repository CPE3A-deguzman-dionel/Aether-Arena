import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowLeft, ArrowRight, BookOpen } from 'lucide-react';
import { ENEMY_DATA } from '../data/enemyData';
import { EnemyPreview } from './EnemyPreview';

interface EnemyAlmanacProps {
  onClose: () => void;
}

export const EnemyAlmanac: React.FC<EnemyAlmanacProps> = ({ onClose }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const selectedEnemy = ENEMY_DATA[selectedIndex];

  const handleNext = () => {
    setSelectedIndex((prev) => (prev + 1) % ENEMY_DATA.length);
  };

  const handlePrev = () => {
    setSelectedIndex((prev) => (prev - 1 + ENEMY_DATA.length) % ENEMY_DATA.length);
  };

  const handleEnemyClick = (index: number) => {
    setSelectedIndex(index);
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-[#1a120b]/95 backdrop-blur-md z-50">
      {/* Custom Scrollbar Styles */}
      <style>
        {`
          .theme-scrollbar::-webkit-scrollbar {
            width: 8px;
          }
          .theme-scrollbar::-webkit-scrollbar-track {
            background: #1a120b;
            border-left: 1px solid #5c3a21;
          }
          .theme-scrollbar::-webkit-scrollbar-thumb {
            background: #5c3a21;
            border-radius: 4px;
          }
          .theme-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #d4af37;
          }
        `}
      </style>

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.1)_0%,transparent_70%)] pointer-events-none" />

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative w-[90vw] h-[90vh] max-w-6xl max-h-[800px] bg-[#2a1b10] border-4 border-[#d4af37] rounded-lg overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#1a120b] to-[#2a1b10] border-b-2 border-[#d4af37] p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookOpen className="text-[#d4af37]" size={28} />
            <h2 className="text-3xl font-cinzel font-bold text-[#d4af37]">ENEMY ALMANAC</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded bg-[#1a120b] border-2 border-[#5c3a21] text-[#e8d5b5] hover:border-[#d4af37] hover:text-[#d4af37] transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex h-[calc(100%-80px)]">
          {/* Enemy Grid */}
          <div className="w-1/3 border-r-2 border-[#5c3a21] p-4 overflow-y-auto theme-scrollbar">
            <div className="grid grid-cols-2 gap-4">
              {ENEMY_DATA.map((enemy, index) => (
                <motion.button
                  key={enemy.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleEnemyClick(index)}
                  className={`flex flex-col items-center transition-all p-2 rounded ${
                    selectedIndex === index ? 'bg-[#d4af37]/10' : 'hover:bg-[#1a120b]/50'
                  }`}
                >
                  {/* Image Container - Using relative positioning for the absolute child */}
                  <div 
                    className={`relative w-full aspect-square overflow-hidden rounded border-2 bg-[#1a120b] ${
                      selectedIndex === index ? 'border-[#d4af37]' : 'border-[#5c3a21]'
                    }`}
                  >
                    {/* The Fix: Massive 250% width/height, mathematically centered with top/left and translate */}
                    <EnemyPreview 
                      enemyType={enemy.id} 
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[250%] h-[250%] pointer-events-none" 
                    />
                  </div>
                  
                  {/* Text Below */}
                  <div className="text-center w-full mt-2">
                    <div className={`text-sm font-cinzel font-bold truncate uppercase tracking-wider ${
                      selectedIndex === index ? 'text-[#d4af37]' : 'text-[#e8d5b5]'
                    }`}>
                      {enemy.name}
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Enemy Details Pane */}
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="flex-1 p-8 overflow-y-auto theme-scrollbar"
            >
              {/* Enemy Header */}
              <div className="flex items-start gap-8 mb-8">
                {/* Stylized Profile Border */}
                <div className="relative w-48 h-48 shrink-0">
                  {/* The Golden Corner Bracket */}
                  <div className="absolute -top-3 -left-3 w-16 h-16 border-t-4 border-l-4 border-[#d4af37] rounded-tl-lg z-10" />
                  
                  {/* The Image Box - Made relative to hold the absolute canvas */}
                  <div className="relative w-full h-full bg-[#1a120b] rounded shadow-2xl border border-[#5c3a21] overflow-hidden">
                    {/* The Fix: Rendered at 200% resolution and centered perfectly */}
                    <EnemyPreview 
                      enemyType={selectedEnemy.id} 
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[200%]" 
                    />
                  </div>
                </div>

                <div className="flex-1 mt-2">
                  <h3 className="text-4xl font-cinzel font-bold text-[#d4af37] mb-3 tracking-wider uppercase">
                    {selectedEnemy.name}
                  </h3>
                  <p className="text-[#e8d5b5] text-lg leading-relaxed">
                    {selectedEnemy.description}
                  </p>
                  <div className="mt-4 inline-block px-4 py-1.5 bg-[#d4af37]/10 border border-[#d4af37]/50 rounded text-[#d4af37] text-sm font-bold tracking-widest uppercase">
                    {selectedEnemy.appearsAt}
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-[#1a120b] border border-[#5c3a21] rounded-lg p-4 shadow-inner">
                  <div className="text-[#8b7355] text-xs font-bold mb-1 uppercase tracking-wider">Health</div>
                  <div className="text-[#e8d5b5] text-xl font-bold">{selectedEnemy.hp}</div>
                </div>
                <div className="bg-[#1a120b] border border-[#5c3a21] rounded-lg p-4 shadow-inner">
                  <div className="text-[#8b7355] text-xs font-bold mb-1 uppercase tracking-wider">Damage</div>
                  <div className="text-[#e8d5b5] text-xl font-bold">{selectedEnemy.damage}</div>
                </div>
                <div className="bg-[#1a120b] border border-[#5c3a21] rounded-lg p-4 shadow-inner">
                  <div className="text-[#8b7355] text-xs font-bold mb-1 uppercase tracking-wider">Speed</div>
                  <div className="text-[#e8d5b5] text-xl font-bold">{selectedEnemy.speed}</div>
                </div>
                <div className="bg-[#1a120b] border border-[#5c3a21] rounded-lg p-4 shadow-inner">
                  <div className="text-[#8b7355] text-xs font-bold mb-1 uppercase tracking-wider">Special</div>
                  <div className="text-[#e8d5b5] text-xl font-bold">{selectedEnemy.special}</div>
                </div>
              </div>

              {/* Skills */}
              <div className="bg-[#1a120b] border border-[#5c3a21] rounded-lg p-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-[#d4af37]" />
                <h4 className="text-[#d4af37] font-cinzel font-bold text-xl mb-4 tracking-wider uppercase">Abilities</h4>
                <ul className="space-y-3">
                  {selectedEnemy.skills.map((skill, index) => (
                    <li key={index} className="flex items-start gap-3 text-[#e8d5b5] text-lg">
                      <span className="text-[#d4af37] mt-1.5 text-sm">♦</span>
                      <span>{skill}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Navigation */}
              <div className="flex justify-between items-center mt-8 pt-6 border-t border-[#5c3a21]/50">
                <button
                  onClick={handlePrev}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#1a120b] border border-[#5c3a21] rounded text-[#e8d5b5] hover:border-[#d4af37] hover:text-[#d4af37] transition-all group"
                >
                  <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                  Previous
                </button>
                <div className="text-[#8b7355] font-bold tracking-widest">
                  {selectedIndex + 1} / {ENEMY_DATA.length}
                </div>
                <button
                  onClick={handleNext}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#1a120b] border border-[#5c3a21] rounded text-[#e8d5b5] hover:border-[#d4af37] hover:text-[#d4af37] transition-all group"
                >
                  Next
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};