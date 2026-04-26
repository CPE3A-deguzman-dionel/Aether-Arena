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
  Swords } from
'lucide-react';
interface HUDProps {
  stats: PlayerStats;
  wave: number;
  weapon: Weapon | null;
  meleeWeapon?: MeleeWeapon | null;
  dashCooldownRatio: number;
  meleeCooldownRatio: number;
  bossInfo?: {
    name: string;
    hp: number;
    maxHp: number;
  } | null;
  showWave?: boolean;
}
export const HUD: React.FC<HUDProps> = ({
  stats,
  wave,
  weapon,
  meleeWeapon,
  dashCooldownRatio,
  meleeCooldownRatio,
  bossInfo,
  showWave = true
}) => {
  const hpPercent = stats.hp / stats.maxHp * 100;
  const expPercent = stats.exp / stats.maxExp * 100;
  return (
    <div className="absolute inset-0 pointer-events-none p-6 flex flex-col justify-between z-10">
      {/* Top Bar */}
      <div className="flex justify-between items-start">
        {/* Health & Stats */}
        <div className="flex flex-col gap-2 w-64">
          <div className="bg-[#2a1b10]/90 border-2 border-[#5c3a21] rounded-lg p-3 backdrop-blur-sm shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
            <div className="flex justify-between items-center mb-1">
              <div className="flex items-center gap-2 text-red-500 font-bold font-cinzel">
                <Heart size={18} fill="currentColor" />
                {Math.ceil(stats.hp)} / {stats.maxHp}
              </div>
            </div>
            <div className="h-4 bg-[#1a120b] rounded-full overflow-hidden border border-[#3a2210]">
              <div
                className="h-full bg-gradient-to-r from-red-800 to-red-500 transition-all duration-200"
                style={{
                  width: `${Math.max(0, hpPercent)}%`
                }} />
            </div>

            <div className="flex justify-between mt-3 text-xs text-[#d4af37] font-bold">
              <div className="flex items-center gap-1" title="Attack">
                <Target size={12} /> {stats.atk}
              </div>
              <div className="flex items-center gap-1" title="Defense">
                <Shield size={12} /> {stats.def}
              </div>
              <div className="flex items-center gap-1" title="Speed">
                <Zap size={12} /> {stats.spd}
              </div>
            </div>
          </div>

          {/* Level & EXP (moved below HP) */}
          <div className="bg-[#2a1b10]/75 border-2 border-[#5c3a21]/60 rounded-lg p-2 backdrop-blur-sm shadow-[0_2px_8px_rgba(0,0,0,0.4)] mt-0">
            <div className="flex items-center gap-3">
              <div className="bg-[#d4af37] text-[#1a120b] font-bold rounded-full w-8 h-8 flex items-center justify-center shrink-0 font-cinzel">
                {stats.level}
              </div>
              <div className="w-full">
                <div className="h-2 bg-[#1a120b] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#8b6b22] to-[#d4af37] transition-all duration-200"
                    style={{ width: `${expPercent}%` }} />
                </div>
                <div className="text-xs text-[#d4af37] font-bold mt-1">EXP</div>
              </div>
            </div>
          </div>
        </div>

        {/* Center: Boss Bar or Wave */}
        <div className="flex flex-col items-center w-96">
          {bossInfo ? (
            <div className="w-full bg-[#2a1b10]/90 border-2 border-red-900/50 rounded-lg p-3 backdrop-blur-sm shadow-[0_0_20px_rgba(220,38,38,0.3)]">
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
            showWave !== false && (
              <div className="text-[#d4af37] font-cinzel font-bold text-3xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                WAVE {wave}
              </div>
            )
          )}
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
        {/* Dash & Melee Cooldowns */}
        <div className="flex flex-col gap-2">
          <div className="bg-[#2a1b10]/90 border-2 border-[#5c3a21] rounded-lg p-3 backdrop-blur-sm flex items-center gap-3 shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
            <div className="text-[#e8d5b5] font-bold text-sm flex items-center gap-2">
              <span className="px-2 py-1 bg-[#1a120b] rounded border border-[#5c3a21] text-xs text-[#d4af37]">
                SPACE
              </span>{' '}
              DASH
            </div>
            <div className="w-24 h-2 bg-[#1a120b] rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-100 ${dashCooldownRatio === 0 ? 'bg-[#d4af37]' : 'bg-[#5c3a21]'}`}
                style={{
                  width: `${(1 - dashCooldownRatio) * 100}%`
                }} />
              
            </div>
          </div>

          <div className="bg-[#2a1b10]/90 border-2 border-[#5c3a21] rounded-lg p-3 backdrop-blur-sm flex items-center gap-3 shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
            <div className="text-[#e8d5b5] font-bold text-sm flex items-center gap-2">
              <span className="px-2 py-1 bg-[#1a120b] rounded border border-[#5c3a21] text-xs text-[#d4af37]">
                RMB
              </span>{' '}
              MELEE
            </div>
            <div className="w-24 h-2 bg-[#1a120b] rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-100 ${meleeCooldownRatio === 0 ? 'bg-[#c0392b]' : 'bg-[#5c3a21]'}`}
                style={{
                  width: `${(1 - meleeCooldownRatio) * 100}%`
                }} />
              
            </div>
          </div>
        </div>

        {/* Weapons (compact, dash/melee style) */}
        <div className="flex gap-3 items-end">
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
                <div className="text-xs text-[#d4af37]">{meleeWeapon.damage} dmg • {meleeWeapon.attackSpeed}/s</div>
              </div>
            </div>
          )}

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
                <div className="text-xs text-[#d4af37]">{weapon.damage} dmg • {weapon.fireRate}/s</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>);

};