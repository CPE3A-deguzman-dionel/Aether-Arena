import React from 'react';
import { motion } from 'framer-motion';
import { PlayerStats } from '../game/types';
import { Skull, RotateCcw, Home } from 'lucide-react';
interface GameOverScreenProps {
  stats: PlayerStats;
  wave: number;
  onRestart: () => void;
  onMenu: () => void;
}
export const GameOverScreen: React.FC<GameOverScreenProps> = ({
  stats,
  wave,
  onRestart,
  onMenu
}) => {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-[#1a0505]/95 backdrop-blur-md z-50">
      <div className="absolute inset-0 opacity-5 pointer-events-none mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/old-wall.png')]" />
      <motion.div
        initial={{
          scale: 0.9,
          opacity: 0
        }}
        animate={{
          scale: 1,
          opacity: 1
        }}
        className="bg-[#2a0808] border-2 border-red-900 rounded-lg p-12 max-w-md w-full text-center shadow-[0_0_80px_rgba(220,38,38,0.3)] relative overflow-hidden">
        
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/old-wall.png')]" />

        <Skull className="w-24 h-24 text-red-600 mx-auto mb-8 relative z-10 drop-shadow-[0_0_15px_rgba(220,38,38,0.8)]" />
        <h2 className="text-6xl font-cinzel font-black text-red-600 mb-4 relative z-10 drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)]">
          YOU DIED
        </h2>
        <p className="text-[#e8d5b5]/70 font-cinzel italic text-xl mb-10 relative z-10">
          ~ The floating isles claim another soul ~
        </p>

        <div className="bg-[#1a0505] rounded border border-red-900/50 p-6 mb-10 space-y-5 relative z-10 shadow-inner">
          <div className="flex justify-between items-center border-b border-red-900/30 pb-3">
            <span className="text-[#e8d5b5]/50 font-cinzel font-bold tracking-wider">
              WAVES SURVIVED
            </span>
            <span className="text-3xl font-cinzel font-bold text-[#e8d5b5]">
              {wave - 1}
            </span>
          </div>
          <div className="flex justify-between items-center border-b border-red-900/30 pb-3">
            <span className="text-[#e8d5b5]/50 font-cinzel font-bold tracking-wider">
              LEVEL REACHED
            </span>
            <span className="text-2xl font-cinzel font-bold text-[#d4af37]">
              {stats.level}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[#e8d5b5]/50 font-cinzel font-bold tracking-wider">
              GOLD EARNED
            </span>
            <span className="text-2xl font-cinzel font-bold text-[#d4af37]">
              {stats.gold}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-4 relative z-10">
          <button
            onClick={onRestart}
            className="w-full py-4 bg-red-800 hover:bg-red-700 text-[#e8d5b5] font-cinzel font-bold text-xl rounded border-2 border-red-600 flex items-center justify-center gap-3 transition-colors shadow-[0_4px_10px_rgba(0,0,0,0.5)]">
            
            <RotateCcw size={24} /> TRY AGAIN
          </button>
          <button
            onClick={onMenu}
            className="w-full py-4 bg-[#1a0505] hover:bg-[#2a0808] text-[#e8d5b5]/70 font-cinzel font-bold text-xl rounded border border-red-900/50 flex items-center justify-center gap-3 transition-colors">
            
            <Home size={24} /> MAIN MENU
          </button>
        </div>
      </motion.div>
    </div>);

};