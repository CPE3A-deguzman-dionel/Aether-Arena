import React from 'react';
import { EnemyType, Weapon, MeleeWeapon } from '../game/types';
import { WEAPONS } from '../game/WeaponSystem';
import { MELEE_WEAPONS } from '../game/MeleeWeaponSystem';

interface DevPanelProps {
  onToggleGodMode: () => void;
  onToggleUnlimitedEnergy: () => void;
  onRemoveAllEntities: () => void;
  onClearWave: () => void;
  onSpawnBoss: (type: EnemyType) => void;
  onEquipWeapon: (weapon: Weapon) => void;
  onEquipMeleeWeapon: (weapon: MeleeWeapon) => void;
  godMode: boolean;
  unlimitedEnergy: boolean;
  currentWeapon: Weapon | null;
  currentMeleeWeapon: MeleeWeapon | null;
}

export const DevPanel: React.FC<DevPanelProps> = ({
  onToggleGodMode,
  onToggleUnlimitedEnergy,
  onRemoveAllEntities,
  onClearWave,
  onSpawnBoss,
  onEquipWeapon,
  onEquipMeleeWeapon,
  godMode,
  unlimitedEnergy,
  currentWeapon,
  currentMeleeWeapon
}) => {
  return (
    <div className="absolute bottom-16 right-4 bg-black/90 border border-red-500 rounded p-2 z-50 pointer-events-auto max-w-[200px]">
      <h3 className="text-red-500 font-bold mb-2 text-xs">DEV</h3>
      <div className="grid grid-cols-2 gap-1">
        <button
          onClick={onToggleGodMode}
          className={`px-2 py-1 rounded text-[10px] font-bold transition-colors ${
            godMode ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-300'
          }`}
        >
          God (Shift+G)
        </button>
        <button
          onClick={onToggleUnlimitedEnergy}
          className={`px-2 py-1 rounded text-[10px] font-bold transition-colors ${
            unlimitedEnergy ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-300'
          }`}
        >
          Energy (Shift+U)
        </button>
        <button
          onClick={onRemoveAllEntities}
          className="px-2 py-1 rounded text-[10px] font-bold bg-red-600 text-white hover:bg-red-700 transition-colors"
        >
          Clear (Shift+R)
        </button>
        <button
          onClick={onClearWave}
          className="px-2 py-1 rounded text-[10px] font-bold bg-orange-600 text-white hover:bg-orange-700 transition-colors"
        >
          Next Wave
        </button>
        <button
          onClick={() => onSpawnBoss('Boss_Golem')}
          className="px-2 py-1 rounded text-[10px] font-bold bg-purple-600 text-white hover:bg-purple-700 transition-colors"
        >
          Golem (Shift+1)
        </button>
        <button
          onClick={() => onSpawnBoss('Boss_Void')}
          className="px-2 py-1 rounded text-[10px] font-bold bg-purple-600 text-white hover:bg-purple-700 transition-colors"
        >
          Void (Shift+2)
        </button>
        <button
          onClick={() => onSpawnBoss('Boss_Chimera')}
          className="px-2 py-1 rounded text-[10px] font-bold bg-purple-600 text-white hover:bg-purple-700 transition-colors"
        >
          Chimera (Shift+3)
        </button>
      </div>
      <div className="border-t border-gray-600 pt-1 mt-1">
        <select
          onChange={(e) => {
            const weapon = WEAPONS.find(w => w.id === e.target.value);
            if (weapon) {
              onEquipWeapon(weapon);
              e.target.blur();
            }
          }}
          value={currentWeapon?.id || ''}
          className="w-full bg-gray-800 text-gray-300 text-[10px] rounded px-1 py-1 mt-1 cursor-pointer"
        >
          <option value="">Ranged</option>
          {WEAPONS.map((weapon) => (
            <option key={weapon.id} value={weapon.id}>
              {weapon.name}
            </option>
          ))}
        </select>
        <select
          onChange={(e) => {
            const weapon = MELEE_WEAPONS.find(w => w.id === e.target.value);
            if (weapon) {
              onEquipMeleeWeapon(weapon);
              e.target.blur();
            }
          }}
          value={currentMeleeWeapon?.id || ''}
          className="w-full bg-gray-800 text-gray-300 text-[10px] rounded px-1 py-1 mt-1 cursor-pointer"
        >
          <option value="">Melee</option>
          {MELEE_WEAPONS.map((weapon) => (
            <option key={weapon.id} value={weapon.id}>
              {weapon.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
