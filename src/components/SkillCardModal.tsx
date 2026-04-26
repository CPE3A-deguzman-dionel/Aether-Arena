import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Skill } from '../game/types';
import { RARITY_COLORS } from '../game/WeaponSystem';
import { RefreshCw } from 'lucide-react';
interface SkillCardModalProps {
  skills: Skill[];
  onSelect: (skill: Skill) => void;
  onReroll: () => void;
}
export const SkillCardModal: React.FC<SkillCardModalProps> = ({
  skills,
  onSelect,
  onReroll
}) => {
  const [hasRerolled, setHasRerolled] = useState(false);
  const handleReroll = () => {
    if (!hasRerolled) {
      setHasRerolled(true);
      onReroll();
    }
  };
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-[#1a120b]/95 backdrop-blur-md z-50">
      <div className="absolute inset-0 opacity-5 pointer-events-none mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/old-wall.png')]" />
      <div className="flex flex-col items-center max-w-5xl w-full px-8 relative z-10">
        <motion.div
          initial={{
            y: -20,
            opacity: 0
          }}
          animate={{
            y: 0,
            opacity: 1
          }}
          className="text-center mb-16">
          
          <h2 className="text-5xl font-cinzel font-bold text-[#d4af37] mb-4 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            CHOOSE THY BOON
          </h2>
          <p className="text-[#e8d5b5]/80 font-cinzel italic text-xl">
            ~ A permanent blessing for the trials ahead ~
          </p>
        </motion.div>

        <div className="flex gap-8 justify-center w-full mb-16">
          {skills.map((skill, index) =>
          <motion.div
            key={skill.id + index}
            initial={{
              scale: 0.8,
              opacity: 0,
              y: 50
            }}
            animate={{
              scale: 1,
              opacity: 1,
              y: 0
            }}
            transition={{
              delay: index * 0.1
            }}
            whileHover={{
              scale: 1.05,
              y: -10
            }}
            onClick={() => onSelect(skill)}
            className="relative w-72 h-[420px] rounded cursor-pointer group perspective-1000">
            
              <div
              className="absolute inset-0 rounded border-2 bg-[#2a1b10] p-8 flex flex-col items-center text-center transition-all duration-300 shadow-[0_10px_30px_rgba(0,0,0,0.8)] overflow-hidden"
              style={{
                borderColor: RARITY_COLORS[skill.rarity]
              }}>
              
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/old-wall.png')]" />

                <div
                className="text-sm font-cinzel font-bold tracking-widest mb-8 relative z-10"
                style={{
                  color: RARITY_COLORS[skill.rarity]
                }}>
                
                  {skill.rarity.toUpperCase()}
                </div>

                <div className="w-24 h-24 rounded-full bg-[#1a120b] border-2 border-[#5c3a21] flex items-center justify-center text-5xl mb-8 relative z-10 shadow-inner">
                  {skill.icon}
                </div>

                <h3 className="text-2xl font-cinzel font-bold text-[#e8d5b5] mb-4 relative z-10">
                  {skill.name}
                </h3>

                <p className="text-[#d4af37] text-sm leading-relaxed italic relative z-10">
                  "{skill.description}"
                </p>

                <div
                className="absolute bottom-0 left-0 w-full h-1/2 opacity-20 bg-gradient-to-t from-current to-transparent pointer-events-none"
                style={{
                  color: RARITY_COLORS[skill.rarity]
                }} />
              
              </div>
            </motion.div>
          )}
        </div>

        <motion.button
          initial={{
            opacity: 0
          }}
          animate={{
            opacity: 1
          }}
          transition={{
            delay: 0.5
          }}
          onClick={handleReroll}
          disabled={hasRerolled}
          className="flex items-center gap-3 px-8 py-4 rounded font-cinzel font-bold text-lg transition-colors border-2 shadow-[0_4px_10px_rgba(0,0,0,0.5)] disabled:bg-[#1a120b] disabled:border-[#5c3a21] disabled:text-[#5c3a21] bg-[#2a1b10] text-[#d4af37] hover:bg-[#3a2210] border-[#d4af37]">
          
          <RefreshCw size={20} />
          {hasRerolled ? 'FATE IS SEALED' : 'REROLL DESTINY (1 FREE)'}
        </motion.button>
      </div>
    </div>);

};