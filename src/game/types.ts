export type GameState =
'MENU' |
'PLAYING' |
'WAVE_CLEAR' |
'SHOP' |
'LEVEL_UP' |
'SKILL_SELECT' |
'GAME_OVER';

export type Rarity = 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary';
export type EnemyType =
'Slime' |
'Mage' |
'Golem' |
'Bomber' |
'Boss_Golem' |
'Boss_Void' |
'Boss_Chimera';
export type StatType = 'ATK' | 'DEF' | 'SPD' | 'HP' | 'CRIT';
export type WeaponCategory = 'Physical' | 'Arcane';

export interface PlayerStats {
  hp: number;
  maxHp: number;
  atk: number;
  def: number;
  spd: number;
  crit: number;
  level: number;
  exp: number;
  maxExp: number;
  gold: number;
  statPoints: number;
}

export interface Weapon {
  id: string;
  name: string;
  rarity: Rarity;
  category: WeaponCategory;
  damage: number;
  fireRate: number; // shots per second
  projectileCount: number;
  projectileSpeed: number;
  level: number;
  cost: number;
  color: string;
  specialAttribute: string;
  specialDescription: string;
  spread?: number;
  knockback?: number;
}

export interface MeleeWeapon {
  id: string;
  name: string;
  rarity: Rarity;
  category: WeaponCategory;
  damage: number;
  attackSpeed: number; // attacks per second
  range: number; // melee range in world units
  arcAngle: number; // swing arc in radians
  level: number;
  cost: number;
  color: string;
  specialAttribute: string;
  specialDescription: string;
  knockback?: number;
  stunChance?: number;
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  rarity: Rarity;
  icon: string;
}

export interface BossInfo {
  name: string;
  hp: number;
  maxHp: number;
}

export interface GameCallbacks {
  onStateChange: (state: GameState) => void;
  onPlayerUpdate: (stats: PlayerStats) => void;
  onWaveUpdate: (wave: number) => void;
  onWeaponUpdate: (weapon: Weapon) => void;
  onMeleeWeaponUpdate: (weapon: MeleeWeapon) => void;
  onDashCooldown: (cooldownRatio: number) => void;
  onMeleeCooldown: (cooldownRatio: number) => void;
  onBossUpdate: (boss: BossInfo | null) => void;
}