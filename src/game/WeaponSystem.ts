import { Weapon, Rarity } from './types';

export const RARITY_COLORS: Record<Rarity, string> = {
  Common: '#9ca3af', // Gray
  Uncommon: '#22c55e', // Green
  Rare: '#3b82f6', // Blue
  Epic: '#a855f7', // Purple
  Legendary: '#f59e0b' // Orange
};

export const WEAPONS: Weapon[] = [
// PHYSICAL WEAPONS
{
  id: 'w_daggers',
  name: 'Throwing Daggers',
  category: 'Physical',
  rarity: 'Common',
  damage: 3,
  fireRate: 5,
  projectileCount: 1,
  projectileSpeed: 18,
  level: 1,
  cost: 60,
  color: RARITY_COLORS.Common,
  specialAttribute: 'rapid_fire',
  specialDescription: 'Fastest attack speed, no reload delay.',
  spread: 0.05
},
{
  id: 'w_blowgun',
  name: "Alchemist's Blowgun",
  category: 'Physical',
  rarity: 'Common',
  damage: 5,
  fireRate: 3,
  projectileCount: 1,
  projectileSpeed: 40,
  level: 1,
  cost: 80,
  color: RARITY_COLORS.Common,
  specialAttribute: 'high_velocity',
  specialDescription: 'Darts travel 2x faster.',
  spread: 0.02
},
{
  id: 'w_longbow',
  name: 'Elven Longbow',
  category: 'Physical',
  rarity: 'Uncommon',
  damage: 12,
  fireRate: 1.8,
  projectileCount: 1,
  projectileSpeed: 30,
  level: 1,
  cost: 200,
  color: RARITY_COLORS.Uncommon,
  specialAttribute: 'high_accuracy',
  specialDescription: 'Zero spread, +15% critical hit chance.',
  spread: 0
},
{
  id: 'w_blunderbuss',
  name: 'Dwarven Blunderbuss',
  category: 'Physical',
  rarity: 'Rare',
  damage: 7,
  fireRate: 0.8,
  projectileCount: 5,
  projectileSpeed: 12,
  level: 1,
  cost: 350,
  color: RARITY_COLORS.Rare,
  specialAttribute: 'spread_knockback',
  specialDescription: 'Fires a 5-pellet cone with heavy knockback.',
  spread: 0.4,
  knockback: 5
},

// ARCANE WEAPONS
{
  id: 'w_wand',
  name: "Apprentice's Wand",
  category: 'Arcane',
  rarity: 'Uncommon',
  damage: 9,
  fireRate: 1.5,
  projectileCount: 1,
  projectileSpeed: 15,
  level: 1,
  cost: 180,
  color: RARITY_COLORS.Uncommon,
  specialAttribute: 'chain_reaction',
  specialDescription: 'Magic bolts jump to 1 additional nearby enemy.',
  spread: 0.1
},
{
  id: 'w_scepter',
  name: 'Glacial Scepter',
  category: 'Arcane',
  rarity: 'Rare',
  damage: 11,
  fireRate: 1.2,
  projectileCount: 1,
  projectileSpeed: 14,
  level: 1,
  cost: 400,
  color: RARITY_COLORS.Rare,
  specialAttribute: 'freeze_stack',
  specialDescription: 'Hits apply Chill. 3 stacks freeze enemy for 1.5s.',
  spread: 0.05
},
{
  id: 'w_grimoire',
  name: 'Void Grimoire',
  category: 'Arcane',
  rarity: 'Epic',
  damage: 22,
  fireRate: 0.6,
  projectileCount: 1,
  projectileSpeed: 6,
  level: 1,
  cost: 800,
  color: RARITY_COLORS.Epic,
  specialAttribute: 'gravity_pull',
  specialDescription: 'Slow orb pulls nearby enemies toward its center.',
  spread: 0
},
{
  id: 'w_relic',
  name: "Druid's Relic",
  category: 'Arcane',
  rarity: 'Epic',
  damage: 18,
  fireRate: 0.8,
  projectileCount: 1,
  projectileSpeed: 16,
  level: 1,
  cost: 900,
  color: RARITY_COLORS.Epic,
  specialAttribute: 'life_siphon',
  specialDescription: '15% of damage dealt is returned as HP.',
  spread: 0.1
}];


export const getUpgradeCost = (weapon: Weapon): number => {
  const multipliers: Record<Rarity, number> = {
    Common: 1,
    Uncommon: 1.5,
    Rare: 2,
    Epic: 3,
    Legendary: 5
  };
  return Math.floor(50 * weapon.level * multipliers[weapon.rarity]);
};

export const upgradeWeapon = (weapon: Weapon): Weapon => {
  return {
    ...weapon,
    level: weapon.level + 1,
    damage: Math.floor(weapon.damage * 1.2)
  };
};