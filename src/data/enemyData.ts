import { EnemyType } from '../game/types';

export interface EnemyInfo {
  id: EnemyType;
  name: string;
  description: string;
  skills: string[];
  hp: string;
  damage: string;
  speed: string;
  special: string;
  icon: string;
  color: string;
  appearsAt: string;
}

export const ENEMY_DATA: EnemyInfo[] = [
  {
    id: 'Slime',
    name: 'Slime',
    description: 'A basic gelatinous creature that attacks in swarms. Weak individually but dangerous in numbers.',
    skills: ['Basic melee attack', 'Bounces when moving'],
    hp: 'Low',
    damage: 'Low',
    speed: 'Medium',
    special: 'None',
    icon: '🟢',
    color: '#4ade80',
    appearsAt: 'Wave 1'
  },
  {
    id: 'Mage',
    name: 'Mage',
    description: 'A spellcaster who deflects incoming projectiles with a magical barrier. Deflect their attack or use melee.',
    skills: ['Projectile deflection', 'Ranged magic attack'],
    hp: 'Medium',
    damage: 'Medium',
    speed: 'Medium',
    special: 'Deflects projectiles with magic circle',
    icon: '🔮',
    color: '#ffdbac',
    appearsAt: 'Wave 3'
  },
  {
    id: 'Golem',
    name: 'Golem',
    description: 'A massive stone construct that slows nearby enemies and reflects damage back to attackers.',
    skills: ['Slow aura (12 units)', '30% damage reflection'],
    hp: 'High',
    damage: 'Medium',
    speed: 'Slow',
    special: 'Slows player by 50% in aura',
    icon: '🗿',
    color: '#6b7280',
    appearsAt: 'Wave 3'
  },
  {
    id: 'Bomber',
    name: 'Bomber',
    description: 'A suicidal skeleton that rushes toward enemies and explodes on contact.',
    skills: ['Explosive suicide attack', 'Fast movement'],
    hp: 'Very Low',
    damage: 'High',
    speed: 'Fast',
    special: 'Self-destructs on contact',
    icon: '💣',
    color: '#f5f5dc',
    appearsAt: 'Wave 2'
  },
  {
    id: 'Healer',
    name: 'Healer',
    description: 'A priest who heals nearby allies. Does not deal damage but supports other enemies. Priority target to eliminate quickly.',
    skills: ['Heal nearby allies'],
    hp: 'Low',
    damage: 'None',
    speed: 'Slow',
    special: '8 unit heal aura',
    icon: '✨',
    color: '#ffffff',
    appearsAt: 'Wave 4'
  },
  {
    id: 'Bard',
    name: 'Bard',
    description: 'A musical performer who inspires nearby allies to move faster with enchanting melodies.',
    skills: ['Speed buff aura (40%)', 'Ranged attack'],
    hp: 'Medium',
    damage: 'Medium',
    speed: 'Medium',
    special: '8 unit speed buff aura',
    icon: '🎵',
    color: '#9333ea',
    appearsAt: 'Wave 6'
  },
  {
    id: 'Boss_Golem',
    name: 'Ancient Stone Guardian',
    description: 'A massive golem with 4 floating stone blocks orbiting around it. Has a massive slow aura covering 80% of the arena. Features 3 distinct attack phases.',
    skills: ['Massive slow aura', 'Orbiting blocks', 'Projectile barrage', 'Golem summon', 'Phase-based immunity'],
    hp: 'Extreme',
    damage: 'Very High',
    speed: 'Rooted',
    special: '3-phase fight with block destruction mechanic',
    icon: '🏔️',
    color: '#6b7280',
    appearsAt: 'Wave 5'
  },
  {
    id: 'Boss_Void',
    name: 'Void Lord',
    description: 'A being from the void that manipulates space and time. Teleports and attacks with dark energy.',
    skills: ['Teleportation', 'Void bolts', 'Time dilation'],
    hp: 'Very High',
    damage: 'Very High',
    speed: 'Variable',
    special: 'Teleports during combat',
    icon: '🌑',
    color: '#1a1a2e',
    appearsAt: 'Wave 10'
  },
  {
    id: 'Boss_Chimera',
    name: 'Chimera',
    description: 'A horrific fusion of multiple creatures. Combines abilities from various enemy types.',
    skills: ['Multi-attack', 'Poison', 'Flight', 'Summon'],
    hp: 'Extreme',
    damage: 'Extreme',
    speed: 'Fast',
    special: 'Combines multiple enemy abilities',
    icon: '🐉',
    color: '#8b0000',
    appearsAt: 'Wave 15'
  }
];
