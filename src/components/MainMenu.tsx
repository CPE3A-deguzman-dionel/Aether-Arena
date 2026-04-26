import React from 'react';
import { motion } from 'framer-motion';
import { Swords, Users, Settings } from 'lucide-react';
interface MainMenuProps {
  onStartSinglePlayer: () => void;
}
export const MainMenu: React.FC<MainMenuProps> = ({ onStartSinglePlayer }) => {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#1a120b]/90 backdrop-blur-md z-50">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.1)_0%,transparent_70%)] pointer-events-none" />

      <motion.div
        initial={{
          y: -50,
          opacity: 0
        }}
        animate={{
          y: 0,
          opacity: 1
        }}
        className="text-center mb-16 relative">
        
        <div className="absolute -inset-10 bg-[#d4af37] opacity-20 blur-[100px] rounded-full pointer-events-none" />
        <h1 className="text-7xl font-cinzel font-black text-transparent bg-clip-text bg-gradient-to-b from-[#ffdf73] to-[#b8860b] drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)]">
          AETHER ARENA
        </h1>
        <p className="text-[#e8d5b5] mt-6 text-2xl tracking-[0.3em] font-cinzel italic opacity-80">
          ~ SURVIVE THE FLOATING ISLES ~
        </p>
      </motion.div>

      <div className="flex flex-col gap-5 w-80">
        <motion.button
          whileHover={{
            scale: 1.05
          }}
          whileTap={{
            scale: 0.95
          }}
          onClick={onStartSinglePlayer}
          className="relative group overflow-hidden rounded bg-[#2a1b10] border-2 border-[#d4af37] p-5 text-[#d4af37] font-cinzel font-bold text-xl tracking-wider hover:bg-[#3a2210] transition-colors flex items-center justify-center gap-4 shadow-[0_4px_15px_rgba(0,0,0,0.5)]">
          
          <div className="absolute inset-0 bg-gradient-to-r from-[#d4af37]/0 via-[#d4af37]/20 to-[#d4af37]/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
          <Swords size={24} />
          SINGLE PLAYER
        </motion.button>

        <motion.button
          whileHover={{
            scale: 1.02
          }}
          className="relative rounded bg-[#1a120b] border-2 border-[#5c3a21] p-5 text-[#8b7355] font-cinzel font-bold text-xl tracking-wider cursor-not-allowed flex items-center justify-center gap-4">
          
          <Users size={24} />
          MULTIPLAYER
          <span className="absolute -top-3 -right-3 bg-[#8b2500] text-[#e8d5b5] border border-[#d4af37] text-xs px-3 py-1 rounded-full font-sans font-bold shadow-lg">
            COMING SOON
          </span>
        </motion.button>

        <motion.button
          whileHover={{
            scale: 1.05
          }}
          whileTap={{
            scale: 0.95
          }}
          className="rounded bg-[#2a1b10] border-2 border-[#5c3a21] p-5 text-[#e8d5b5] font-cinzel font-bold text-xl tracking-wider hover:bg-[#3a2210] hover:border-[#d4af37]/50 transition-colors flex items-center justify-center gap-4 shadow-[0_4px_15px_rgba(0,0,0,0.5)]">
          
          <Settings size={24} />
          SETTINGS
        </motion.button>
      </div>
    </div>);

};