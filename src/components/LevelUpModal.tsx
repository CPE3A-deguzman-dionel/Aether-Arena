import React from 'react';
import { motion } from 'framer-motion';
import { PlayerStats, StatType } from '../game/types';
import { Target, Shield, Zap, Heart, Crosshair } from 'lucide-react';
interface LevelUpModalProps {
  stats: PlayerStats;
  onAllocate: (stat: StatType) => void;
  onReset: () => void;
  onContinue: () => void;
}
export const LevelUpModal: React.FC<LevelUpModalProps> = ({
  stats,
  onAllocate,
  onReset,
  onContinue
}) => {
  const statConfig: {
    type: StatType;
    icon: React.ReactNode;
    label: string;
    value: number;
    increase: string;
    color: string;
  }[] = [
  {
    type: 'ATK',
    icon: <Target size={24} />,
    label: 'Attack',
    value: stats.atk,
    increase: '+2',
    color: '#ff4444'
  },
  {
    type: 'DEF',
    icon: <Shield size={24} />,
    label: 'Defense',
    value: stats.def,
    increase: '+5',
    color: '#4444ff'
  },
  {
    type: 'SPD',
    icon: <Zap size={24} />,
    label: 'Speed',
    value: stats.spd,
    increase: '+3',
    color: '#ffff44'
  },
  {
    type: 'HP',
    icon: <Heart size={24} />,
    label: 'Max HP',
    value: stats.maxHp,
    increase: '+20',
    color: '#ff44ff'
  },
  {
    type: 'CRIT',
    icon: <Crosshair size={24} />,
    label: 'Crit Chance',
    value: stats.crit,
    increase: '+2%',
    color: '#ff8800'
  },
  {
    type: 'MAX_ENERGY',
    icon: <Zap size={24} />,
    label: 'Max Energy',
    value: stats.maxEnergy,
    increase: '+10',
    color: '#00ffff'
  },
  {
    type: 'ENERGY_REGEN',
    icon: <Zap size={24} />,
    label: 'Energy Regen',
    value: stats.energyRegen,
    increase: '+2/s',
    color: '#00ccff'
  },
  {
    type: 'HEALTH_REGEN',
    icon: <Heart size={24} />,
    label: 'Health Regen',
    value: stats.healthRegen,
    increase: '+1/s',
    color: '#00ff88'
  }];

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-[#1a120b]/95 backdrop-blur-md z-50">
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
        className="bg-[#2a1b10] border-2 border-[#d4af37] rounded-lg p-8 max-w-4xl w-full shadow-[0_0_50px_rgba(0,0,0,0.8)] relative overflow-hidden">
        
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/old-wall.png')]" />

        <div className="text-center mb-8 relative z-10">
          <h2 className="text-5xl font-cinzel font-bold text-[#d4af37] mb-3 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            LEVEL UP!
          </h2>
          <p className="text-[#e8d5b5] font-cinzel text-lg">
            Thou hast reached Level {stats.level}
          </p>
          <div className="mt-4 inline-block bg-[#1a120b] border-2 border-[#d4af37] rounded px-6 py-2 text-[#d4af37] font-cinzel font-bold text-lg shadow-inner">
            Points Available: {stats.statPoints}
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-8 relative z-10">
          {statConfig.map((stat) =>
          <motion.button
            key={stat.type}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onAllocate(stat.type)}
            disabled={stats.statPoints <= 0}
            className="relative bg-[#1a120b]/90 border-2 border-[#5c3a21] rounded-lg p-4 shadow-lg transition-all hover:border-[#d4af37] disabled:opacity-50 disabled:cursor-not-allowed group">
            
            <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-20 transition-opacity" style={{ backgroundColor: stat.color }} />
            
            <div className="relative z-10 flex flex-col items-center gap-2">
              <div className="text-3xl" style={{ color: stat.color }}>
                {stat.icon}
              </div>
              <span className="font-cinzel font-bold text-sm text-[#e8d5b5] text-center">
                {stat.label}
              </span>
              <span className="text-[#d4af37] font-bold text-xl">
                {stat.value}
              </span>
              <div className="mt-2 bg-[#8b2500] group-hover:bg-[#a52a2a] text-[#e8d5b5] border border-[#d4af37] px-3 py-1 rounded text-sm font-bold transition-colors">
                {stat.increase}
              </div>
            </div>
          </motion.button>
          )}
        </div>

        <div className="flex gap-4 relative z-10">
          <button
            onClick={onReset}
            disabled={stats.statPoints === 1}
            className="flex-1 py-4 rounded font-cinzel font-bold text-xl tracking-wider transition-colors disabled:bg-[#1a120b] disabled:text-[#5c3a21] disabled:border-[#5c3a21] disabled:cursor-not-allowed bg-[#8b2500] hover:bg-[#a52a2a] text-[#e8d5b5] border-2 border-[#d4af37] shadow-[0_4px_10px_rgba(0,0,0,0.5)]">
            RESET
          </button>
          <button
            onClick={onContinue}
            disabled={stats.statPoints > 0}
            className="flex-1 py-4 rounded font-cinzel font-bold text-xl tracking-wider transition-colors disabled:bg-[#1a120b] disabled:text-[#5c3a21] disabled:border-[#5c3a21] disabled:cursor-not-allowed bg-[#d4af37] hover:bg-[#ffdf73] text-[#1a120b] border-2 border-[#d4af37] shadow-[0_4px_10px_rgba(0,0,0,0.5)]">
            
            {stats.statPoints > 0 ? 'ALLOCATE POINTS' : 'CONTINUE JOURNEY'}
          </button>
        </div>
      </motion.div>
    </div>);

};