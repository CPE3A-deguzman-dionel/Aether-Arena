import { useState, useRef } from 'react';
import {
  GameState,
  PlayerStats,
  Weapon,
  MeleeWeapon,
  Skill,
  StatType,
  EnemyType
} from './game/types';
import { GameEngine } from './game/GameEngine';
import { WEAPONS, upgradeWeapon } from './game/WeaponSystem';
import { MELEE_WEAPONS, upgradeMeleeWeapon } from './game/MeleeWeaponSystem';
import { GameCanvas } from './components/GameCanvas';
import { MainMenu } from './components/MainMenu';
import { HUD } from './components/HUD';
import { LevelUpModal } from './components/LevelUpModal';
import { SkillCardModal } from './components/SkillCardModal';
import { WeaponShop } from './components/WeaponShop';
import { GameOverScreen } from './components/GameOverScreen';
import { WaveClearBanner } from './components/WaveClearBanner';
// Placeholder Skills
const ALL_SKILLS: Skill[] = [
{
  id: 's1',
  name: 'Multishot',
  description: 'Fire an additional projectile',
  rarity: 'Rare',
  icon: '🏹'
},
{
  id: 's2',
  name: 'Vampirism',
  description: 'Heal 1 HP on kill',
  rarity: 'Epic',
  icon: '🦇'
},
{
  id: 's3',
  name: 'Swiftness',
  description: 'Increase movement speed by 20%',
  rarity: 'Uncommon',
  icon: '⚡'
},
{
  id: 's4',
  name: 'Juggernaut',
  description: 'Increase Max HP by 50',
  rarity: 'Rare',
  icon: '🛡️'
},
{
  id: 's5',
  name: 'Critical Surge',
  description: 'Crit chance +10%',
  rarity: 'Epic',
  icon: '💥'
},
{
  id: 's6',
  name: 'Blade Dancer',
  description: 'Melee attack speed +20%',
  rarity: 'Rare',
  icon: '⚔️'
},
{
  id: 's7',
  name: 'Heavy Strikes',
  description: 'Melee damage +25%',
  rarity: 'Epic',
  icon: '🔨'
}];

export function App() {
  const engineRef = useRef<GameEngine | null>(null);
  const [gameState, setGameState] = useState<GameState>('MENU');
  const [stats, setStats] = useState<PlayerStats | null>(null);
  const [wave, setWave] = useState<number>(1);
  const [weapon, setWeapon] = useState<Weapon | null>(null);
  const [meleeWeapon, setMeleeWeapon] = useState<MeleeWeapon | null>(null);
  const [energyRatio, setEnergyRatio] = useState<number>(1);
  const [showDevMode, setShowDevMode] = useState<boolean>(false);
  const [skillOptions, setSkillOptions] = useState<Skill[]>([]);
  const [bossInfo, setBossInfo] = useState<{
    name: string;
    hp: number;
    maxHp: number;
  } | null>(null);
  // Callbacks from GameEngine
  const callbacks = useRef({
    onStateChange: (state: GameState) => setGameState(state),
    onPlayerUpdate: (newStats: PlayerStats) =>
    setStats({
      ...newStats
    }),
    onWaveUpdate: (newWave: number) => setWave(newWave),
    onWeaponUpdate: (newWeapon: Weapon) =>
    setWeapon({
      ...newWeapon
    }),
    onMeleeWeaponUpdate: (newMeleeWeapon: MeleeWeapon) =>
    setMeleeWeapon({
      ...newMeleeWeapon
    }),
    onEnergyUpdate: (ratio: number) => setEnergyRatio(ratio),
    onBossUpdate: (
    boss: {
      name: string;
      hp: number;
      maxHp: number;
    } | null) =>
    setBossInfo(boss)
  }).current;
  // Handlers
  const handleStartGame = () => {
    if (engineRef.current) {
      engineRef.current.startGame();
    }
  };
  const handleAllocateStat = (stat: StatType) => {
    if (engineRef.current) {
      engineRef.current.player.allocateStat(stat);
      setStats({
        ...engineRef.current.player.stats
      });
    }
  };
  const handleLevelUpContinue = () => {
    if (stats && stats.level % 5 === 0) {
      generateSkillOptions();
      setGameState('SKILL_SELECT');
    } else {
      resumeGame();
    }
  };
  const generateSkillOptions = () => {
    const shuffled = [...ALL_SKILLS].sort(() => 0.5 - Math.random());
    setSkillOptions(shuffled.slice(0, 3));
  };
  const handleSkillSelect = (skill: Skill) => {
    if (engineRef.current) {
      engineRef.current.player.applySkill(skill.id);
      // Handle melee specific skills that modify weapon stats directly
      if (skill.id === 's6') {
        engineRef.current.player.meleeWeapon.attackSpeed *= 1.2;
        setMeleeWeapon({
          ...engineRef.current.player.meleeWeapon
        });
      } else if (skill.id === 's7') {
        engineRef.current.player.meleeWeapon.damage *= 1.25;
        setMeleeWeapon({
          ...engineRef.current.player.meleeWeapon
        });
      }
      setStats({
        ...engineRef.current.player.stats
      });
    }
    resumeGame();
  };
  const resumeGame = () => {
    if (engineRef.current) {
      engineRef.current.setState('PLAYING');
      setGameState('PLAYING');
    }
  };
  const handleBuyWeapon = (newWeapon: Weapon) => {
    if (engineRef.current && stats && stats.gold >= newWeapon.cost) {
      engineRef.current.player.stats.gold -= newWeapon.cost;
      engineRef.current.player.weapon = {
        ...newWeapon
      };
      setStats({
        ...engineRef.current.player.stats
      });
      setWeapon({
        ...newWeapon
      });
    }
  };
  const handleBuyMeleeWeapon = (newWeapon: MeleeWeapon) => {
    if (engineRef.current && stats && stats.gold >= newWeapon.cost) {
      engineRef.current.player.stats.gold -= newWeapon.cost;
      engineRef.current.player.meleeWeapon = {
        ...newWeapon
      };
      setStats({
        ...engineRef.current.player.stats
      });
      setMeleeWeapon({
        ...newWeapon
      });
    }
  };
  const handleEquipWeapon = (newWeapon: Weapon) => {
    if (engineRef.current) {
      engineRef.current.player.weapon = { ...newWeapon };
      setWeapon({ ...newWeapon });
    }
  };
  const handleEquipMeleeWeapon = (newWeapon: MeleeWeapon) => {
    if (engineRef.current) {
      engineRef.current.player.meleeWeapon = { ...newWeapon };
      setMeleeWeapon({ ...newWeapon });
    }
  };
  const handleSpawnEnemy = (type: EnemyType) => {
    if (engineRef.current) {
      engineRef.current.spawnEnemy(type);
    }
  };
  const handleUpgradeWeapon = () => {
    if (engineRef.current && stats && weapon) {
      const cost = Math.floor(
        50 * weapon.level * (weapon.rarity === 'Common' ? 1 : 2)
      ); // Simplified cost
      if (stats.gold >= cost && weapon.level < 5) {
        engineRef.current.player.stats.gold -= cost;
        const upgraded = upgradeWeapon(weapon);
        engineRef.current.player.weapon = upgraded;
        setStats({
          ...engineRef.current.player.stats
        });
        setWeapon({ ...upgraded });
      }
    }
  };
  const handleUpgradeMeleeWeapon = () => {
    if (engineRef.current && stats && meleeWeapon) {
      const cost = Math.floor(
        50 * meleeWeapon.level * (meleeWeapon.rarity === 'Common' ? 1 : 2)
      );
      if (stats.gold >= cost && meleeWeapon.level < 5) {
        engineRef.current.player.stats.gold -= cost;
        const upgraded = upgradeMeleeWeapon(meleeWeapon);
        engineRef.current.player.meleeWeapon = upgraded;
        setStats({
          ...engineRef.current.player.stats
        });
        setMeleeWeapon({ ...upgraded });
      }
    }
  };
  const handleNextWave = () => {
    if (engineRef.current) {
      engineRef.current.startNextWave();
      setGameState('PLAYING');
    }
  };
  const handleOpenShop = () => {
    if (engineRef.current) {
      engineRef.current.setState('SHOP');
    }
    setGameState('SHOP');
  };
  const handleCloseShop = () => {
    if (engineRef.current) {
      engineRef.current.setState('WAVE_CLEAR');
    }
    setGameState('WAVE_CLEAR');
  };
  const handleRestart = () => {
    window.location.reload(); // Simple restart for framework
  };
  return (
    <div 
      className="relative w-full h-screen overflow-hidden text-[#e8d5b5] font-sans select-none"
      style={{
        backgroundImage: 'url(/background-v2.png.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundColor: '#1a120b'
      }}
    >
      {/* 3D Canvas Layer */}
      <GameCanvas callbacks={callbacks} engineRef={engineRef} />

      {/* UI Layer */}
      {gameState === 'MENU' &&
      <MainMenu onStartSinglePlayer={handleStartGame} />
      }

      {(gameState === 'PLAYING' ||
      gameState === 'WAVE_CLEAR' ||
      gameState === 'LEVEL_UP' ||
      gameState === 'SKILL_SELECT') &&
      stats &&
      <HUD
        stats={stats}
        wave={wave}
        weapon={weapon}
        meleeWeapon={meleeWeapon}
        energyRatio={energyRatio}
        bossInfo={bossInfo}
        showWave={gameState !== 'WAVE_CLEAR'} />

      }
      {gameState === 'PLAYING' &&
      <div className="absolute top-6 right-6 z-30 pointer-events-auto">
        <button
          onClick={() => setShowDevMode((prev) => !prev)}
          className="px-4 py-2 rounded-lg bg-[#111827]/90 border border-[#374151] text-sm text-[#e8d5b5] hover:bg-[#1f2937] transition-colors"
        >
          {showDevMode ? 'Hide Dev Mode' : 'Show Dev Mode'}
        </button>
      </div>
      }

      {showDevMode && gameState === 'PLAYING' && stats && weapon && meleeWeapon &&
      <div className="absolute bottom-6 left-6 z-30 w-[320px] p-4 rounded-2xl bg-[#111827]/95 border border-[#374151] text-sm text-[#e8d5b5] shadow-xl pointer-events-auto">
        <div className="flex items-center justify-between mb-3">
          <div className="font-bold text-[#d4af37]">DEV MODE</div>
          <button
            onClick={() => setShowDevMode(false)}
            className="text-[#9ca3af] hover:text-[#fbbf24]"
          >
            Close
          </button>
        </div>
        <div className="space-y-3">
          <div>
            <div className="text-xs uppercase text-[#6b7280] mb-1">Equip Weapon</div>
            <div className="grid grid-cols-2 gap-2">
              {WEAPONS.slice(0, 4).map((w) => (
                <button
                  key={w.id}
                  onClick={() => handleEquipWeapon(w)}
                  className="rounded-lg border border-[#374151] px-2 py-2 bg-[#1f2937] hover:bg-[#111827]"
                >
                  {w.name}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="text-xs uppercase text-[#6b7280] mb-1">Equip Melee</div>
            <div className="grid grid-cols-2 gap-2">
              {MELEE_WEAPONS.slice(0, 4).map((w) => (
                <button
                  key={w.id}
                  onClick={() => handleEquipMeleeWeapon(w)}
                  className="rounded-lg border border-[#374151] px-2 py-2 bg-[#1f2937] hover:bg-[#111827]"
                >
                  {w.name}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="text-xs uppercase text-[#6b7280] mb-1">Spawn Enemy</div>
            <div className="grid grid-cols-2 gap-2">
              {(['Slime', 'Mage', 'Golem', 'Bomber'] as EnemyType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => handleSpawnEnemy(type)}
                  className="rounded-lg border border-[#374151] px-2 py-2 bg-[#1f2937] hover:bg-[#111827]"
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
          <div className="text-xs text-[#9ca3af]">Note: Mage barrier only allows reflected enemy projectiles to damage them. Use RMB melee to bounce their shots back.</div>
        </div>
      </div>
      }

      {gameState === 'WAVE_CLEAR' &&
      <WaveClearBanner
        wave={wave}
        onNextWave={handleNextWave}
        onOpenShop={handleOpenShop} />

      }

      {gameState === 'SHOP' && stats && weapon && meleeWeapon &&
      <WeaponShop
        stats={stats}
        currentWeapon={weapon}
        currentMeleeWeapon={meleeWeapon}
        onBuy={handleBuyWeapon}
        onBuyMelee={handleBuyMeleeWeapon}
        onUpgrade={handleUpgradeWeapon}
        onUpgradeMelee={handleUpgradeMeleeWeapon}
        onContinue={handleCloseShop} />

      }

      {gameState === 'LEVEL_UP' && stats &&
      <LevelUpModal
        stats={stats}
        onAllocate={handleAllocateStat}
        onContinue={handleLevelUpContinue} />

      }

      {gameState === 'SKILL_SELECT' &&
      <SkillCardModal
        skills={skillOptions}
        onSelect={handleSkillSelect}
        onReroll={generateSkillOptions} />

      }

      {gameState === 'GAME_OVER' && stats &&
      <GameOverScreen
        stats={stats}
        wave={wave}
        onRestart={handleRestart}
        onMenu={handleRestart} />

      }
    </div>);

}