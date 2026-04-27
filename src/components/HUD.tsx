import React from 'react';
import { PlayerStats, Weapon, MeleeWeapon } from '../game/types';
import {
  Heart,
  Coins,
  Shield,
  Zap,
  Target,
  Skull,
  MousePointer2,
  Crosshair,
  Keyboard,
  Pause } from
'lucide-react';
interface HUDProps {
  stats: PlayerStats;
  wave: number;
  weapon: Weapon | null;
  meleeWeapon?: MeleeWeapon | null;
  energyRatio: number;
  bossInfo?: {
    name: string;
    hp: number;
    maxHp: number;
  } | null;
  showWave?: boolean;
  onUseConsumable?: (slotIndex: number) => void;
  consumableCooldowns?: number[];
  onPause?: () => void;
}
export const HUD: React.FC<HUDProps> = ({
  stats,
  wave,
  weapon,
  meleeWeapon,
  energyRatio,
  bossInfo,
  showWave = true,
  onUseConsumable,
  consumableCooldowns = [0, 0, 0],
  onPause
}) => {
  const hpPercent = stats.hp / stats.maxHp * 100;
  const expPercent = stats.exp / stats.maxExp * 100;
  return (
    <div className="absolute inset-0 pointer-events-none p-6 flex flex-col justify-between z-10">
      {/* Wave/Boss Name - Absolute Centered */}
      {showWave !== false && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2">
          {bossInfo ? (
            <div className="w-96 bg-[#2a1b10]/90 border-2 border-red-900/50 rounded-lg p-3 backdrop-blur-sm shadow-[0_0_20px_rgba(220,38,38,0.3)]">
              <div className="flex justify-center items-center gap-2 mb-2">
                <Skull className="text-red-500" size={18} />
                <span className="text-red-500 font-cinzel font-bold tracking-widest text-lg">
                  {bossInfo.name}
                </span>
                <Skull className="text-red-500" size={18} />
              </div>
              <div className="h-4 bg-[#1a120b] rounded-full overflow-hidden border border-red-900/50">
                <div
                  className="h-full bg-gradient-to-r from-red-900 via-red-600 to-red-500 transition-all duration-200"
                  style={{ width: `${Math.max(0, (bossInfo.hp / bossInfo.maxHp) * 100)}%` }} />
              </div>
            </div>
          ) : (
            <div className="text-[#d4af37] font-cinzel font-bold text-3xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              WAVE {wave}
            </div>
          )}
        </div>
      )}

      {/* Top Bar */}
      <div className="flex justify-between items-start">
        {/* Stacked Bars */}
        <div className="flex flex-col gap-2 w-72">

        {/* Pause Button */}
        {onPause && (
          <button
            onClick={onPause}
            className="pointer-events-auto p-3 bg-[#2a1b10]/90 border-2 border-[#5c3a21] rounded-lg hover:border-[#d4af37] transition-colors"
          >
            <Pause size={24} className="text-[#e8d5b5]" />
          </button>
        )}
          {/* Health Bar */}
          <div className="bg-[#2a1b10]/90 border-2 border-[#5c3a21] rounded-lg p-2 backdrop-blur-sm shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2 text-red-500 font-bold font-cinzel text-sm">
                <Heart size={14} fill="currentColor" />
                HP
              </div>
              <div className="flex items-center gap-2 text-xs text-[#00ff88] font-bold">
                <Heart size={10} /> {stats.healthRegen}/s
              </div>
            </div>
            <div className="h-3 bg-[#1a120b] rounded-full overflow-hidden border border-[#3a2210]">
              <div
                className="h-full bg-gradient-to-r from-red-800 to-red-500 transition-all duration-200"
                style={{
                  width: `${Math.max(0, hpPercent)}%`
                }} />
            </div>
            <div className="text-xs text-red-400 font-bold mt-1 text-right">
              {Math.ceil(stats.hp)} / {stats.maxHp}
            </div>
          </div>

          {/* EXP Bar */}
          <div className="bg-[#2a1b10]/75 border-2 border-[#5c3a21]/60 rounded-lg p-2 backdrop-blur-sm shadow-[0_2px_8px_rgba(0,0,0,0.4)]">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2 text-[#d4af37] font-bold font-cinzel text-sm">
                <div className="bg-[#d4af37] text-[#1a120b] font-bold rounded-full w-5 h-5 flex items-center justify-center text-xs">
                  {stats.level}
                </div>
                EXP
              </div>
            </div>
            <div className="h-2 bg-[#1a120b] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#8b6b22] to-[#d4af37] transition-all duration-200"
                style={{ width: `${expPercent}%` }} />
            </div>
            <div className="text-xs text-[#d4af37] font-bold mt-1 text-right">
              {stats.exp} / {stats.maxExp}
            </div>
          </div>

          {/* Energy Bar */}
          <div className="bg-[#2a1b10]/90 border-2 border-[#5c3a21] rounded-lg p-2 backdrop-blur-sm shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2 text-[#00bfff] font-bold font-cinzel text-sm">
                <Zap size={14} />
                ENERGY
              </div>
              <div className="flex items-center gap-2 text-xs text-[#00bfff] font-bold">
                <Zap size={10} /> {stats.energyRegen}/s
              </div>
            </div>
            <div className="h-3 bg-[#1a120b] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 transition-all duration-100"
                style={{
                  width: `${Math.max(0, energyRatio * 100)}%`
                }} />
            </div>
            <div className="text-xs text-[#00bfff] font-bold mt-1 text-right">
              {Math.ceil(stats.energy)} / {stats.maxEnergy}
            </div>
          </div>

          {/* Other Attributes */}
          <div className="bg-[#2a1b10]/75 border-2 border-[#5c3a21]/60 rounded-lg p-2 backdrop-blur-sm shadow-[0_2px_8px_rgba(0,0,0,0.4)]">
            <div className="grid grid-cols-4 gap-2 text-xs">
              <div className="flex items-center justify-center gap-1 text-[#8b7355] font-bold">
                <Target size={10} /> ATK
              </div>
              <div className="flex items-center justify-center gap-1 text-[#8b7355] font-bold">
                <Shield size={10} /> DEF
              </div>
              <div className="flex items-center justify-center gap-1 text-[#8b7355] font-bold">
                <Zap size={10} /> SPD
              </div>
              <div className="flex items-center justify-center gap-1 text-[#8b7355] font-bold">
                <Crosshair size={10} /> CRIT
              </div>
              <div className="flex items-center justify-center text-[#d4af37] font-bold">
                {stats.atk}
              </div>
              <div className="flex items-center justify-center text-[#d4af37] font-bold">
                {stats.def}
              </div>
              <div className="flex items-center justify-center text-[#d4af37] font-bold">
                {stats.spd}
              </div>
              <div className="flex items-center justify-center text-[#d4af37] font-bold">
                {stats.crit}%
              </div>
            </div>
          </div>
        </div>

        {/* Gold */}
        <div className="bg-[#2a1b10]/90 border-2 border-[#5c3a21] rounded-lg p-3 backdrop-blur-sm flex items-center gap-3 shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
          <Coins className="text-[#d4af37]" size={24} />
          <span className="text-[#d4af37] font-bold text-xl font-cinzel">
            {stats.gold}
          </span>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="flex justify-between items-end">
        {/* Consumables (above weapons) */}
        <div className="flex gap-3 mb-2">
          {stats.consumableSlots.map((slot, index) => (
            <button
              key={index}
              onClick={() => onUseConsumable?.(index)}
              disabled={!slot.consumable || consumableCooldowns[index] > 0}
              className={`relative bg-[#2a1b10]/90 border-2 rounded-lg p-2 backdrop-blur-sm flex items-center gap-2 shadow-[0_4px_12px_rgba(0,0,0,0.5)] w-16 h-16 pointer-events-auto transition-all ${
                slot.consumable && consumableCooldowns[index] <= 0
                  ? 'border-[#5c3a21] hover:border-[#d4af37]'
                  : 'border-[#5c3a21]/30 opacity-50 cursor-not-allowed'
              }`}
            >
              <div className="absolute top-1 left-1 text-xs text-[#d4af37] font-bold font-cinzel">
                {index + 1}
              </div>
              <div className="text-2xl">
                {slot.consumable ? slot.consumable.icon : '—'}
              </div>
              {slot.consumable && consumableCooldowns[index] > 0 && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded">
                  <span className="text-white text-xs font-bold">
                    {Math.ceil(consumableCooldowns[index])}s
                  </span>
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Weapons (compact, dash/melee style) */}
        <div className="flex gap-6 items-end">
          {meleeWeapon && (
            <div
              className="bg-[#2a1b10]/90 border-2 rounded-lg p-2 backdrop-blur-sm flex items-center gap-3 shadow-[0_4px_12px_rgba(0,0,0,0.5)] w-44"
              style={{ borderColor: meleeWeapon.color }}>
              <div className="flex flex-col leading-tight">
                <div className="flex items-center gap-2 text-xs text-[#e8d5b5]/70 font-bold">
                  <MousePointer2 size={12} className="text-[#d4af37]" /> RMB
                </div>
                <div className="font-cinzel font-bold text-sm" style={{ color: meleeWeapon.color }}>
                  {meleeWeapon.name}
                </div>
                <div className="text-xs text-[#d4af37]">15⚡</div>
              </div>
            </div>
          )}

          <div className="bg-[#2a1b10]/90 border-2 border-[#d4af37] rounded-lg p-2 backdrop-blur-sm flex items-center gap-3 shadow-[0_4px_12px_rgba(0,0,0,0.5)] w-36">
            <div className="flex flex-col leading-tight">
              <div className="flex items-center gap-2 text-xs text-[#e8d5b5]/70 font-bold">
                <Keyboard size={12} className="text-[#d4af37]" /> Space
              </div>
              <div className="font-cinzel font-bold text-sm text-[#d4af37]">
                Dash
              </div>
              <div className="text-xs text-[#d4af37]">25⚡</div>
            </div>
          </div>

          {weapon && (
            <div
              className="bg-[#2a1b10]/90 border-2 rounded-lg p-2 backdrop-blur-sm flex items-center gap-3 shadow-[0_4px_12px_rgba(0,0,0,0.5)] w-44"
              style={{ borderColor: weapon.color }}>
              <div className="flex flex-col leading-tight">
                <div className="flex items-center gap-2 text-xs text-[#e8d5b5]/70 font-bold">
                  <MousePointer2 size={12} className="text-[#d4af37]" /> LMB
                </div>
                <div className="font-cinzel font-bold text-sm" style={{ color: weapon.color }}>
                  {weapon.name}
                </div>
                <div className="text-xs text-[#d4af37]">2⚡</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>);

};