import { MeleeWeapon, Rarity } from './types';
import { RARITY_COLORS } from './WeaponSystem';

export const MELEE_WEAPONS: MeleeWeapon[] = [
// PHYSICAL MELEE
{
  id: 'm_greatsword',
  name: 'Runic Greatsword',
  category: 'Physical',
  rarity: 'Uncommon',
  damage: 15,
  attackSpeed: 1.0,
  range: 3.5,
  arcAngle: Math.PI, // 180 degrees
  level: 1,
  cost: 150,
  color: RARITY_COLORS.Uncommon,
  specialAttribute: 'sweeping_cleave',
  specialDescription: 'Wide 180° arc with high knockback.',
  knockback: 8
},
{
  id: 'm_daggers',
  name: 'Shadow Daggers',
  category: 'Physical',
  rarity: 'Rare',
  damage: 8,
  attackSpeed: 2.5,
  range: 1.8,
  arcAngle: Math.PI / 3, // 60 degrees
  level: 1,
  cost: 300,
  color: RARITY_COLORS.Rare,
  specialAttribute: 'backstab',
  specialDescription: 'Deals 2.5x damage when hitting enemies from behind.'
},
{
  id: 'm_warhammer',
  name: "Titan's Warhammer",
  category: 'Physical',
  rarity: 'Epic',
  damage: 25,
  attackSpeed: 0.6,
  range: 2.8,
  arcAngle: Math.PI / 2, // 90 degrees
  level: 1,
  cost: 600,
  color: RARITY_COLORS.Epic,
  specialAttribute: 'stun',
  specialDescription: '15% chance to stun enemies for 1 second.',
  stunChance: 0.15,
  knockback: 5
},

// ARCANE MELEE
{
  id: 'm_rapier',
  name: 'Plasma Rapier',
  category: 'Arcane',
  rarity: 'Uncommon',
  damage: 12,
  attackSpeed: 2.0,
  range: 2.5,
  arcAngle: Math.PI / 4, // 45 degrees
  level: 1,
  cost: 180,
  color: RARITY_COLORS.Uncommon,
  specialAttribute: 'static_charge',
  specialDescription:
  'Hits apply a spark that explodes for AoE damage after 2s. Every 3rd hit lunges.'
},
{
  id: 'm_flail',
  name: 'Astral Flail',
  category: 'Arcane',
  rarity: 'Rare',
  damage: 15,
  attackSpeed: 1.2,
  range: 4.5,
  arcAngle: Math.PI * 0.75, // 135 degrees
  level: 1,
  cost: 350,
  color: RARITY_COLORS.Rare,
  specialAttribute: 'orbit',
  specialDescription:
  'Orb has a chance to circle the player, damaging nearby enemies.'
},
{
  id: 'm_scythe',
  name: 'Vampiric Scythe',
  category: 'Arcane',
  rarity: 'Epic',
  damage: 20,
  attackSpeed: 1.5,
  range: 3.8,
  arcAngle: Math.PI * 1.2, // 216 degrees
  level: 1,
  cost: 700,
  color: RARITY_COLORS.Epic,
  specialAttribute: 'blood_harvest',
  specialDescription: 'Every 5th kill restores HP.'
}];


export const getMeleeUpgradeCost = (weapon: MeleeWeapon): number => {
  const multipliers: Record<Rarity, number> = {
    Common: 1,
    Uncommon: 1.5,
    Rare: 2,
    Epic: 3,
    Legendary: 5
  };
  return Math.floor(50 * weapon.level * multipliers[weapon.rarity]);
};

export const upgradeMeleeWeapon = (weapon: MeleeWeapon): MeleeWeapon => {
  return {
    ...weapon,
    level: weapon.level + 1,
    damage: Math.floor(weapon.damage * 1.2),
    attackSpeed: weapon.attackSpeed * 1.1,
    range: weapon.range * 1.05
  };
};