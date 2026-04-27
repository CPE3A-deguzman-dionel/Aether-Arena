import { useState, useRef, useEffect } from 'react';
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
import { upgradeWeapon } from './game/WeaponSystem';
import { upgradeMeleeWeapon } from './game/MeleeWeaponSystem';
import { GameCanvas } from './components/GameCanvas';
import { MainMenu } from './components/MainMenu';
import { EnemyAlmanac } from './components/EnemyAlmanac';
import { HUD } from './components/HUD';
import { LevelUpModal } from './components/LevelUpModal';
import { SkillCardModal } from './components/SkillCardModal';
import { WeaponShop } from './components/WeaponShop';
import { GameOverScreen } from './components/GameOverScreen';
import { WaveClearBanner } from './components/WaveClearBanner';
import { DevPanel } from './components/DevPanel';
import { KeyBindingsMenu } from './components/KeyBindingsMenu';
import { PauseMenu } from './components/PauseMenu';
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

  // Prevent context menu globally
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };
    document.addEventListener('contextmenu', handleContextMenu);
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, []);
  const [gameState, setGameState] = useState<GameState>('MENU');
  const [showAlmanac, setShowAlmanac] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showPause, setShowPause] = useState(false);
  const [stats, setStats] = useState<PlayerStats | null>(null);
  const [wave, setWave] = useState<number>(1);
  const [weapon, setWeapon] = useState<Weapon | null>(null);
  const [meleeWeapon, setMeleeWeapon] = useState<MeleeWeapon | null>(null);
  const [energyRatio, setEnergyRatio] = useState<number>(1);
  const [consumableCooldowns, setConsumableCooldowns] = useState<number[]>([0, 0, 0]);
  const [showDevMode, setShowDevMode] = useState(false);
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
    setGameState('PLAYING');
  };

  const handleOpenAlmanac = () => {
    setShowAlmanac(true);
  };

  const handleCloseAlmanac = () => {
    setShowAlmanac(false);
  };

  const handleOpenSettings = () => {
    setShowSettings(true);
  };

  const handleCloseSettings = () => {
    setShowSettings(false);
  };

  const handlePause = () => {
    setShowPause(true);
  };

  const handleResume = () => {
    setShowPause(false);
  };

  const handleQuit = () => {
    setShowPause(false);
    setGameState('MENU');
  };

  const handleAllocateStat = (stat: StatType) => {
    if (engineRef.current) {
      engineRef.current.player.allocateStat(stat);
      setStats({
        ...engineRef.current.player.stats
      });
    }
  };
  const handleResetAllocations = () => {
    if (engineRef.current) {
      engineRef.current.player.resetAllocations();
      setStats({
        ...engineRef.current.player.stats
      });
    }
  };
  const handleLevelUpContinue = () => {
    if (engineRef.current) {
      engineRef.current.player.confirmAllocations();
    }
    if (stats && stats.level % 5 === 0) {
      generateSkillOptions();
      setGameState('SKILL_SELECT');
    } else {
      resumeGame();
    }
  };

  // Dev mode handlers
  const handleToggleGodMode = () => {
    if (engineRef.current) {
      engineRef.current.toggleGodMode();
    }
  };

  const handleToggleUnlimitedEnergy = () => {
    if (engineRef.current) {
      engineRef.current.toggleUnlimitedEnergy();
    }
  };

  const handleRemoveAllEntities = () => {
    if (engineRef.current) {
      engineRef.current.removeAllEntities();
    }
  };

  const handleClearWave = () => {
    if (engineRef.current) {
      engineRef.current.removeAllEntities();
      handleNextWave();
    }
  };

  const handleSpawnBoss = (type: EnemyType) => {
    if (engineRef.current) {
      engineRef.current.spawnBoss(type);
    }
  };

  const handleEquipWeapon = (weapon: Weapon) => {
    if (engineRef.current) {
      engineRef.current.player.weapon = weapon;
      engineRef.current.player.weaponInventory = [weapon];
      setWeapon(weapon);
    }
  };

  const handleEquipMeleeWeapon = (weapon: MeleeWeapon) => {
    if (engineRef.current) {
      engineRef.current.player.meleeWeapon = weapon;
      engineRef.current.player.meleeWeaponInventory = [weapon];
      setMeleeWeapon(weapon);
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

  const handleUseConsumable = (slotIndex: number) => {
    if (engineRef.current) {
      const player = (engineRef.current as any).player;
      if (player && player.useConsumable(slotIndex)) {
        setStats({ ...player.stats });
      }
    }
  };

  const handleBuyConsumable = (consumable: any, slotIndex: number) => {
    if (engineRef.current && stats) {
      const player = (engineRef.current as any).player;
      if (player && stats.gold >= consumable.cost) {
        player.equipConsumable(slotIndex, consumable);
        player.stats.gold -= consumable.cost;
        setStats({ ...player.stats });
      }
    }
  };

  // Update consumable cooldowns every second
  useEffect(() => {
    const interval = setInterval(() => {
      if (engineRef.current && stats) {
        const player = (engineRef.current as any).player;
        if (player) {
          const newCooldowns = stats.consumableSlots.map((_, i) => player.getConsumableCooldown(i));
          setConsumableCooldowns(newCooldowns);
        }
      }
    }, 100);
    return () => clearInterval(interval);
  }, [stats]);
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
      <MainMenu onStartSinglePlayer={handleStartGame} onOpenAlmanac={handleOpenAlmanac} onOpenSettings={handleOpenSettings} />
      }

      {showAlmanac && <EnemyAlmanac onClose={handleCloseAlmanac} />}

      {showSettings && <KeyBindingsMenu onClose={handleCloseSettings} />}

      {showPause && <PauseMenu onResume={handleResume} onQuit={handleQuit} onSettings={handleOpenSettings} />}

      {(gameState === 'PLAYING' ||
      gameState === 'WAVE_CLEAR' ||
      gameState === 'LEVEL_UP' ||
      gameState === 'SKILL_SELECT') &&
      stats &&
      <>
      <HUD
        stats={stats}
        wave={wave}
        weapon={weapon}
        meleeWeapon={meleeWeapon}
        energyRatio={energyRatio}
        bossInfo={bossInfo}
        showWave={gameState !== 'WAVE_CLEAR'}
        onUseConsumable={handleUseConsumable}
        consumableCooldowns={consumableCooldowns}
        onPause={handlePause} />
      {showDevMode && (
        <DevPanel
          onToggleGodMode={handleToggleGodMode}
          onToggleUnlimitedEnergy={handleToggleUnlimitedEnergy}
          onRemoveAllEntities={handleRemoveAllEntities}
          onClearWave={handleClearWave}
          onSpawnBoss={handleSpawnBoss}
          onEquipWeapon={handleEquipWeapon}
          onEquipMeleeWeapon={handleEquipMeleeWeapon}
          godMode={engineRef.current?.godMode || false}
          unlimitedEnergy={engineRef.current?.unlimitedEnergy || false}
          currentWeapon={weapon}
          currentMeleeWeapon={meleeWeapon}
        />
      )}
      <button
        onClick={() => setShowDevMode(!showDevMode)}
        className="absolute bottom-4 right-4 bg-black/80 border border-red-500 text-red-500 px-3 py-1 rounded text-xs font-bold z-50 pointer-events-auto"
      >
        {showDevMode ? 'Hide Dev' : 'Dev'}
      </button>
      </>
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
        onContinue={handleCloseShop}
        onBuyConsumable={handleBuyConsumable} />

      }

      {gameState === 'LEVEL_UP' && stats &&
      <LevelUpModal
        stats={stats}
        onAllocate={handleAllocateStat}
        onReset={handleResetAllocations}
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