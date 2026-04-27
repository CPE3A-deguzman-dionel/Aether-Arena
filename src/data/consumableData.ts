import { Consumable } from '../game/types';

export const CONSUMABLES: Consumable[] = [
  {
    id: 'healing_flask',
    name: 'Healing Flask',
    description: 'Restores 50 HP on use',
    cost: 20,
    cooldown: 10,
    icon: '🧪',
    effect: 'heal',
    value: 50
  },
  {
    id: 'energy_flask',
    name: 'Energy Flask',
    description: 'Restores 50 Energy on use',
    cost: 20,
    cooldown: 10,
    icon: '⚡',
    effect: 'energy',
    value: 50
  },
  {
    id: 'speed_vial',
    name: 'Speed Vial',
    description: 'Grants 50% speed boost for 5 seconds',
    cost: 40,
    cooldown: 30,
    icon: '💨',
    effect: 'speed',
    value: 50
  }
];
