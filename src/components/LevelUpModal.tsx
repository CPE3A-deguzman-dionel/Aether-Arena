import React from 'react';
import { motion } from 'framer-motion';
import { PlayerStats, StatType } from '../game/types';
import { Target, Shield, Zap, Heart, Crosshair } from 'lucide-react';
interface LevelUpModalProps {
  stats: PlayerStats;
  onAllocate: (stat: StatType) => void;
  onContinue: () => void;
}
export const LevelUpModal: React.FC<LevelUpModalProps> = ({
  stats,
  onAllocate,
  onContinue
}) => {
  const statConfig: {
    type: StatType;
    icon: React.ReactNode;
    label: string;
    value: number;
    increase: string;
  }[] = [
  {
    type: 'ATK',
    icon: <Target size={20} />,
    label: 'Attack',
    value: stats.atk,
    increase: '+5'
  },
  {
    type: 'DEF',
    icon: <Shield size={20} />,
    label: 'Defense',
    value: stats.def,
    increase: '+5'
  },
  {
    type: 'SPD',
    icon: <Zap size={20} />,
    label: 'Speed',
    value: stats.spd,
    increase: '+5'
  },
  {
    type: 'HP',
    icon: <Heart size={20} />,
    label: 'Max HP',
    value: stats.maxHp,
    increase: '+20'
  },
  {
    type: 'CRIT',
    icon: <Crosshair size={20} />,
    label: 'Crit Chance',
    value: stats.crit,
    increase: '+2%'
  }];

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-[#1a120b]/90 backdrop-blur-md z-50">
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
        className="bg-[#2a1b10] border-2 border-[#d4af37] rounded-lg p-10 max-w-md w-full shadow-[0_0_50px_rgba(0,0,0,0.8)] relative overflow-hidden">
        
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/old-wall.png')]" />

        <div className="text-center mb-10 relative z-10">
          <h2 className="text-5xl font-cinzel font-bold text-[#d4af37] mb-3 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            LEVEL UP!
          </h2>
          <p className="text-[#e8d5b5] font-cinzel text-lg">
            Thou hast reached Level {stats.level}
          </p>
          <div className="mt-6 inline-block bg-[#1a120b] border-2 border-[#d4af37] rounded px-6 py-2 text-[#d4af37] font-cinzel font-bold text-lg shadow-inner">
            Points Available: {stats.statPoints}
          </div>
        </div>

        <div className="space-y-4 mb-10 relative z-10">
          {statConfig.map((stat) =>
          <div
            key={stat.type}
            className="flex items-center justify-between bg-[#1a120b]/80 border border-[#5c3a21] rounded p-4 shadow-inner">
            
              <div className="flex items-center gap-4 text-[#e8d5b5]">
                <div className="text-[#d4af37]">{stat.icon}</div>
                <span className="font-cinzel font-bold w-28 text-lg">
                  {stat.label}
                </span>
                <span className="text-[#d4af37] font-bold text-lg">
                  {stat.value}
                </span>
              </div>
              <button
              onClick={() => onAllocate(stat.type)}
              disabled={stats.statPoints <= 0}
              className="bg-[#8b2500] hover:bg-[#a52a2a] disabled:bg-[#1a120b] disabled:text-[#5c3a21] disabled:border-[#5c3a21] text-[#e8d5b5] border border-[#d4af37] px-4 py-2 rounded font-bold transition-colors flex items-center gap-2 shadow-[0_2px_5px_rgba(0,0,0,0.5)]">
              
                {stat.increase}
              </button>
            </div>
          )}
        </div>

        <button
          onClick={onContinue}
          disabled={stats.statPoints > 0}
          className="w-full py-4 rounded font-cinzel font-bold text-xl tracking-wider transition-colors disabled:bg-[#1a120b] disabled:text-[#5c3a21] disabled:border-[#5c3a21] disabled:cursor-not-allowed bg-[#d4af37] hover:bg-[#ffdf73] text-[#1a120b] border-2 border-[#d4af37] shadow-[0_4px_10px_rgba(0,0,0,0.5)] relative z-10">
          
          {stats.statPoints > 0 ? 'ALLOCATE POINTS' : 'CONTINUE JOURNEY'}
        </button>
      </motion.div>
    </div>);

};