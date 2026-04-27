import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Weapon, MeleeWeapon, PlayerStats, Consumable } from '../game/types';
import { WEAPONS, getUpgradeCost } from '../game/WeaponSystem';
import { MELEE_WEAPONS, getMeleeUpgradeCost } from '../game/MeleeWeaponSystem';
import { CONSUMABLES } from '../data/consumableData';
import { Coins, ArrowUpCircle, ShoppingCart, X } from 'lucide-react';
interface WeaponShopProps {
  stats: PlayerStats;
  currentWeapon: Weapon;
  currentMeleeWeapon: MeleeWeapon;
  onBuy: (weapon: Weapon) => void;
  onBuyMelee: (weapon: MeleeWeapon) => void;
  onUpgrade: () => void;
  onUpgradeMelee: () => void;
  onContinue: () => void;
  onBuyConsumable: (consumable: Consumable, slotIndex: number) => void;
}
export const WeaponShop: React.FC<WeaponShopProps> = ({
  stats,
  currentWeapon,
  currentMeleeWeapon,
  onBuy,
  onBuyMelee,
  onUpgrade,
  onUpgradeMelee,
  onContinue,
  onBuyConsumable
}) => {
  const [activeTab, setActiveTab] = useState<'RANGED' | 'MELEE' | 'CONSUMABLES'>('RANGED');
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onContinue();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onContinue]);
  const upgradeCost = getUpgradeCost(currentWeapon);
  const canUpgrade = stats.gold >= upgradeCost && currentWeapon.level < 5;
  const meleeUpgradeCost = getMeleeUpgradeCost(currentMeleeWeapon);
  const canUpgradeMelee =
  stats.gold >= meleeUpgradeCost && currentMeleeWeapon.level < 5;
  const physicalWeapons = WEAPONS.filter((w) => w.category === 'Physical');
  const arcaneWeapons = WEAPONS.filter((w) => w.category === 'Arcane');
  const physicalMelee = MELEE_WEAPONS.filter((w) => w.category === 'Physical');
  const arcaneMelee = MELEE_WEAPONS.filter((w) => w.category === 'Arcane');
  const renderWeaponCard = (weapon: Weapon) => {
    const isOwned = currentWeapon.id === weapon.id;
    const canBuy = stats.gold >= weapon.cost && !isOwned;
    return (
      <div
        key={weapon.id}
        className="bg-slate-950 border rounded-xl p-4 flex flex-col"
        style={{
          borderColor: isOwned ? weapon.color : '#1e293b'
        }}>
        
        <div className="flex justify-between items-start mb-3">
          <div>
            <div
              className="text-[10px] font-bold tracking-widest"
              style={{
                color: weapon.color
              }}>
              
              {weapon.rarity.toUpperCase()}
            </div>
            <h4 className="text-md font-bold text-white leading-tight">
              {weapon.name}
            </h4>
          </div>
          <div className="flex items-center gap-1 text-amber-400 font-bold text-sm">
            <Coins size={14} /> {weapon.cost}
          </div>
        </div>

        <div className="space-y-1 text-xs mb-3">
          <div className="flex justify-between">
            <span className="text-slate-500">DMG</span>
            <span className="text-slate-300">{weapon.damage}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Rate</span>
            <span className="text-slate-300">{weapon.fireRate}/s</span>
          </div>
        </div>

        <div className="text-[10px] text-slate-400 italic mb-4 flex-grow">
          {weapon.specialDescription}
        </div>

        <button
          onClick={() => onBuy(weapon)}
          disabled={!canBuy}
          className={`w-full py-2 rounded font-cinzel font-bold text-sm flex items-center justify-center gap-2 transition-colors border ${isOwned ? 'bg-[#1a120b] border-[#5c3a21] text-[#8b7355]' : canBuy ? 'bg-[#8b2500] hover:bg-[#a52a2a] border-[#d4af37] text-[#e8d5b5]' : 'bg-[#1a120b] border-[#5c3a21] text-[#5c3a21] cursor-not-allowed'}`}>
          
          {isOwned ?
          'EQUIPPED' :

          <>
              <ShoppingCart size={16} /> BUY
            </>
          }
        </button>
      </div>);

  };
  const renderMeleeCard = (weapon: MeleeWeapon) => {
    const isOwned = currentMeleeWeapon.id === weapon.id;
    const canBuy = stats.gold >= weapon.cost && !isOwned;
    return (
      <div
        key={weapon.id}
        className="bg-slate-950 border rounded-xl p-4 flex flex-col"
        style={{
          borderColor: isOwned ? weapon.color : '#1e293b'
        }}>

        <div className="flex justify-between items-start mb-3">
          <div>
            <div
              className="text-[10px] font-bold tracking-widest"
              style={{
                color: weapon.color
              }}>

              {weapon.rarity.toUpperCase()}
            </div>
            <h4 className="text-md font-bold text-white leading-tight">
              {weapon.name}
            </h4>
          </div>
          <div className="flex items-center gap-1 text-amber-400 font-bold text-sm">
            <Coins size={14} /> {weapon.cost}
          </div>
        </div>

        <div className="space-y-1 text-xs mb-3">
          <div className="flex justify-between">
            <span className="text-slate-500">DMG</span>
            <span className="text-slate-300">{weapon.damage}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Speed</span>
            <span className="text-slate-300">{weapon.attackSpeed}/s</span>
          </div>
        </div>

        <div className="text-[10px] text-slate-400 italic mb-4 flex-grow">
          {weapon.specialDescription}
        </div>

        <button
          onClick={() => onBuyMelee(weapon)}
          disabled={!canBuy}
          className={`w-full py-2 rounded font-cinzel font-bold text-sm flex items-center justify-center gap-2 transition-colors border ${isOwned ? 'bg-[#1a120b] border-[#5c3a21] text-[#8b7355]' : canBuy ? 'bg-[#8b2500] hover:bg-[#a52a2a] border-[#d4af37] text-[#e8d5b5]' : 'bg-[#1a120b] border-[#5c3a21] text-[#5c3a21] cursor-not-allowed'}`}>

          {isOwned ?
          'EQUIPPED' :

          <>
              <ShoppingCart size={16} /> BUY
            </>
          }
        </button>
      </div>);

  };

  const renderConsumableCard = (consumable: Consumable, slotIndex: number) => {
    const isEquipped = stats.consumableSlots[slotIndex]?.consumable?.id === consumable.id;
    const canBuy = stats.gold >= consumable.cost && !isEquipped;
    return (
      <div
        key={consumable.id}
        className="bg-slate-950 border rounded-xl p-4 flex flex-col"
        style={{
          borderColor: isEquipped ? '#d4af37' : '#1e293b'
        }}>

        <div className="flex justify-between items-start mb-3">
          <div>
            <div className="text-3xl mb-2">{consumable.icon}</div>
            <h4 className="text-md font-bold text-white leading-tight">
              {consumable.name}
            </h4>
          </div>
          <div className="flex items-center gap-1 text-amber-400 font-bold text-sm">
            <Coins size={14} /> {consumable.cost}
          </div>
        </div>

        <div className="space-y-1 text-xs mb-3">
          <div className="flex justify-between">
            <span className="text-slate-500">Effect</span>
            <span className="text-slate-300">{consumable.effect.toUpperCase()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Value</span>
            <span className="text-slate-300">{consumable.value}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Cooldown</span>
            <span className="text-slate-300">{consumable.cooldown}s</span>
          </div>
        </div>

        <div className="text-[10px] text-slate-400 italic mb-4 flex-grow">
          {consumable.description}
        </div>

        <button
          onClick={() => onBuyConsumable(consumable, slotIndex)}
          disabled={!canBuy}
          className={`w-full py-2 rounded font-cinzel font-bold text-sm flex items-center justify-center gap-2 transition-colors border ${isEquipped ? 'bg-[#1a120b] border-[#5c3a21] text-[#8b7355]' : canBuy ? 'bg-[#8b2500] hover:bg-[#a52a2a] border-[#d4af37] text-[#e8d5b5]' : 'bg-[#1a120b] border-[#5c3a21] text-[#5c3a21] cursor-not-allowed'}`}>

          {isEquipped ?
          `SLOT ${slotIndex + 1}` :

          <>
              <ShoppingCart size={16} /> BUY
            </>
          }
        </button>
      </div>);
  };
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-[#1a120b]/90 backdrop-blur-md z-50 p-8">
      <motion.div
        initial={{
          scale: 0.95,
          opacity: 0
        }}
        animate={{
          scale: 1,
          opacity: 1
        }}
        className="bg-[#2a1b10] border-2 border-[#d4af37] rounded-xl w-full max-w-6xl h-full max-h-[850px] flex flex-col overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)] relative">
        
        {/* Parchment texture overlay */}
        <div className="absolute inset-0 opacity-10 pointer-events-none mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/old-wall.png')]" />

        {/* Header */}
        <div className="p-6 border-b-2 border-[#5c3a21] flex justify-between items-center bg-[#1a120b]/50 shrink-0 relative z-10">
          <div>
            <h2 className="text-4xl font-cinzel font-bold text-[#d4af37] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              THE MERCHANT
            </h2>
            <p className="text-[#e8d5b5]/70 text-sm mt-1 font-cinzel italic">
              ~ Spend thy gold wisely ~
            </p>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 bg-[#1a120b] px-5 py-3 rounded border-2 border-[#5c3a21] shadow-inner">
              <Coins className="text-[#d4af37]" size={28} />
              <span className="text-[#d4af37] font-bold text-3xl font-cinzel">
                {stats.gold}
              </span>
            </div>
            <button
              onClick={onContinue}
              className="text-[#e8d5b5]/50 hover:text-[#d4af37] transition-colors p-2"
              title="Close Shop (ESC)">
              
              <X size={32} />
            </button>
          </div>
        </div>

        <div className="flex-grow flex p-6 gap-6 overflow-hidden relative z-10">
          {/* Current Weapon Panel */}
          <div className="w-1/3 bg-[#1a120b] rounded-lg border-2 border-[#5c3a21] p-6 flex flex-col shadow-inner">
            <div className="flex gap-2 mb-4 border-b border-[#5c3a21] pb-2">
              <button
                onClick={() => setActiveTab('RANGED')}
                className={activeTab === 'RANGED' ? 'flex-1 text-center font-cinzel font-bold tracking-widest text-sm py-2 rounded transition-colors bg-[#2a1b10] text-[#d4af37] border border-[#d4af37]' : 'flex-1 text-center font-cinzel font-bold tracking-widest text-sm py-2 rounded transition-colors text-[#8b7355] hover:text-[#e8d5b5]'}>
                RANGED
              </button>
              <button
                onClick={() => setActiveTab('MELEE')}
                className={activeTab === 'MELEE' ? 'flex-1 text-center font-cinzel font-bold tracking-widest text-sm py-2 rounded transition-colors bg-[#2a1b10] text-[#d4af37] border border-[#d4af37]' : 'flex-1 text-center font-cinzel font-bold tracking-widest text-sm py-2 rounded transition-colors text-[#8b7355] hover:text-[#e8d5b5]'}>
                MELEE
              </button>
              <button
                onClick={() => setActiveTab('CONSUMABLES')}
                className={activeTab === 'CONSUMABLES' ? 'flex-1 text-center font-cinzel font-bold tracking-widest text-sm py-2 rounded transition-colors bg-[#2a1b10] text-[#d4af37] border border-[#d4af37]' : 'flex-1 text-center font-cinzel font-bold tracking-widest text-sm py-2 rounded transition-colors text-[#8b7355] hover:text-[#e8d5b5]'}>
                CONSUMABLES
              </button>
            </div>

            {activeTab === 'RANGED' ?
            <>
                <div
                className="flex-grow border-2 rounded-lg p-6 flex flex-col items-center justify-center text-center bg-[#2a1b10] relative overflow-hidden"
                style={{
                  borderColor: currentWeapon.color
                }}>

                  <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/old-wall.png')]" />
                  <div
                  className="text-sm font-cinzel font-bold tracking-widest mb-3 relative z-10"
                  style={{
                    color: currentWeapon.color
                  }}>

                    {currentWeapon.rarity.toUpperCase()}
                  </div>
                  <h4 className="text-3xl font-cinzel font-bold text-[#e8d5b5] mb-2 relative z-10 drop-shadow-md">
                    {currentWeapon.name}
                  </h4>
                  <div className="text-[#d4af37] mb-8 font-cinzel font-bold relative z-10">
                    Level {currentWeapon.level}
                  </div>

                  <div className="w-full space-y-3 text-sm relative z-10">
                    <div className="flex justify-between border-b border-[#5c3a21]/50 pb-1">
                      <span className="text-[#e8d5b5]/70 font-cinzel">
                        Damage
                      </span>
                      <span className="text-[#d4af37] font-bold">
                        {currentWeapon.damage}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-[#5c3a21]/50 pb-1">
                      <span className="text-[#e8d5b5]/70 font-cinzel">
                        Fire Rate
                      </span>
                      <span className="text-[#d4af37] font-bold">
                        {currentWeapon.fireRate}/s
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-[#5c3a21]/50 pb-1">
                      <span className="text-[#e8d5b5]/70 font-cinzel">
                        Projectiles
                      </span>
                      <span className="text-[#d4af37] font-bold">
                        {currentWeapon.projectileCount}
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-[#1a120b] rounded border border-[#5c3a21] text-sm text-[#e8d5b5]/80 italic relative z-10">
                    "{currentWeapon.specialDescription}"
                  </div>
                </div>

                <button
                onClick={onUpgrade}
                disabled={!canUpgrade}
                className={`mt-6 w-full py-4 rounded font-cinzel font-bold text-lg flex items-center justify-center gap-3 transition-colors shrink-0 border-2 ${canUpgrade ? 'bg-[#8b2500] hover:bg-[#a52a2a] border-[#d4af37] text-[#e8d5b5] shadow-[0_4px_10px_rgba(0,0,0,0.5)]' : 'bg-[#1a120b] border-[#5c3a21] text-[#5c3a21] cursor-not-allowed'}`}>

                  <ArrowUpCircle size={24} />
                  {currentWeapon.level >= 5 ?
                'MAX LEVEL' :
                `UPGRADE (${upgradeCost} G)`}
                </button>
              </> :

            activeTab === 'MELEE' ?
            <>
                <div
                className="flex-grow border-2 rounded-lg p-6 flex flex-col items-center justify-center text-center bg-[#2a1b10] relative overflow-hidden"
                style={{
                  borderColor: currentMeleeWeapon.color
                }}>

                  <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/old-wall.png')]" />
                  <div
                  className="text-sm font-cinzel font-bold tracking-widest mb-3 relative z-10"
                  style={{
                    color: currentMeleeWeapon.color
                  }}>

                    {currentMeleeWeapon.rarity.toUpperCase()}
                  </div>
                  <h4 className="text-3xl font-cinzel font-bold text-[#e8d5b5] mb-2 relative z-10 drop-shadow-md">
                    {currentMeleeWeapon.name}
                  </h4>
                  <div className="text-[#d4af37] mb-8 font-cinzel font-bold relative z-10">
                    Level {currentMeleeWeapon.level}
                  </div>

                  <div className="w-full space-y-3 text-sm relative z-10">
                    <div className="flex justify-between border-b border-[#5c3a21]/50 pb-1">
                      <span className="text-[#e8d5b5]/70 font-cinzel">
                        Damage
                      </span>
                      <span className="text-[#d4af37] font-bold">
                        {currentMeleeWeapon.damage}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-[#5c3a21]/50 pb-1">
                      <span className="text-[#e8d5b5]/70 font-cinzel">
                        Attack Speed
                      </span>
                      <span className="text-[#d4af37] font-bold">
                        {currentMeleeWeapon.attackSpeed}/s
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-[#5c3a21]/50 pb-1">
                      <span className="text-[#e8d5b5]/70 font-cinzel">
                        Range
                      </span>
                      <span className="text-[#d4af37] font-bold">
                        {currentMeleeWeapon.range}
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-[#1a120b] rounded border border-[#5c3a21] text-sm text-[#e8d5b5]/80 italic relative z-10">
                    "{currentMeleeWeapon.specialDescription}"
                  </div>
                </div>

                <button
                onClick={onUpgradeMelee}
                disabled={!canUpgradeMelee}
                className={`mt-6 w-full py-4 rounded font-cinzel font-bold text-lg flex items-center justify-center gap-3 transition-colors shrink-0 border-2 ${canUpgradeMelee ? 'bg-[#8b2500] hover:bg-[#a52a2a] border-[#d4af37] text-[#e8d5b5] shadow-[0_4px_10px_rgba(0,0,0,0.5)]' : 'bg-[#1a120b] border-[#5c3a21] text-[#5c3a21] cursor-not-allowed'}`}>

                  <ArrowUpCircle size={24} />
                  {currentMeleeWeapon.level >= 5 ?
                'MAX LEVEL' :
                `UPGRADE (${meleeUpgradeCost} G)`}
                </button>
              </> :

            <>
                <div className="flex-grow border-2 rounded-lg p-6 flex flex-col items-center justify-center text-center bg-[#2a1b10] relative overflow-hidden border-[#d4af37]">
                  <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/old-wall.png')]" />
                  <h4 className="text-3xl font-cinzel font-bold text-[#e8d5b5] mb-6 relative z-10 drop-shadow-md">
                    CONSUMABLES
                  </h4>
                  <div className="w-full space-y-4 relative z-10">
                    {stats.consumableSlots.map((slot, index) => (
                      <div key={index} className="bg-[#1a120b] rounded border border-[#5c3a21] p-4">
                        <div className="text-[#d4af37] font-cinzel font-bold mb-2">SLOT {index + 1}</div>
                        {slot.consumable ? (
                          <div>
                            <div className="text-4xl mb-2">{slot.consumable.icon}</div>
                            <div className="text-white font-bold">{slot.consumable.name}</div>
                            <div className="text-xs text-[#e8d5b5]/70 mt-1">{slot.consumable.description}</div>
                          </div>
                        ) : (
                          <div className="text-[#5c3a21] italic">Empty</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            }
          </div>

          {/* Shop Grid */}
          <div className="w-2/3 flex flex-col overflow-hidden">
            <div className="overflow-y-auto pr-4 custom-scrollbar h-full">
              {activeTab === 'RANGED' ?
              <>
                  <div className="mb-8">
                    <h3 className="text-[#e8d5b5] font-cinzel font-bold tracking-widest text-xl mb-4 flex items-center gap-3 border-b-2 border-[#5c3a21] pb-2">
                      <span className="text-[#d4af37]">🏹</span>
                      PHYSICAL RANGED
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      {physicalWeapons.map(renderWeaponCard)}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-[#e8d5b5] font-cinzel font-bold tracking-widest text-xl mb-4 flex items-center gap-3 border-b-2 border-[#5c3a21] pb-2">
                      <span className="text-[#4169e1]">✧</span>
                      ARCANE RANGED
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      {arcaneWeapons.map(renderWeaponCard)}
                    </div>
                  </div>
                </> :

              activeTab === 'MELEE' ?
              <>
                  <div className="mb-8">
                    <h3 className="text-[#e8d5b5] font-cinzel font-bold tracking-widest text-xl mb-4 flex items-center gap-3 border-b-2 border-[#5c3a21] pb-2">
                      <span className="text-[#d4af37]">⚔</span>
                      PHYSICAL MELEE
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      {physicalMelee.map(renderMeleeCard)}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-[#e8d5b5] font-cinzel font-bold tracking-widest text-xl mb-4 flex items-center gap-3 border-b-2 border-[#5c3a21] pb-2">
                      <span className="text-[#4169e1]">✧</span>
                      ARCANE MELEE
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      {arcaneMelee.map(renderMeleeCard)}
                    </div>
                  </div>
                </> :

              <>
                  <div>
                    <h3 className="text-[#e8d5b5] font-cinzel font-bold tracking-widest text-xl mb-4 flex items-center gap-3 border-b-2 border-[#5c3a21] pb-2">
                      <span className="text-[#d4af37]">🧪</span>
                      CONSUMABLES
                    </h3>
                    <div className="grid grid-cols-3 gap-4">
                      {CONSUMABLES.map((consumable, index) => renderConsumableCard(consumable, index))}
                    </div>
                  </div>
                </>
              }
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t-2 border-[#5c3a21] bg-[#1a120b]/50 flex justify-end shrink-0 relative z-10">
          <button
            onClick={onContinue}
            className="px-10 py-4 bg-[#d4af37] text-[#1a120b] font-cinzel font-bold text-xl rounded hover:bg-[#ffdf73] transition-colors shadow-[0_4px_10px_rgba(0,0,0,0.5)]">
            
            CLOSE SHOP
          </button>
        </div>
      </motion.div>
    </div>);

};