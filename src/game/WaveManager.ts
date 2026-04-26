import * as THREE from 'three';
import { EnemyType } from './types';
import { Enemy } from './Enemy';
import { Boss } from './Boss';
import { DIFFICULTY_ENEMY_COUNT_MULT, WAVE_HEALTH_MULT } from './Balance';

export class WaveManager {
  public currentWave: number = 1;
  public enemiesRemainingToSpawn: EnemyType[] = [];
  public activeEnemies: Enemy[] = [];

  private spawnTimer: number = 0;
  private spawnInterval: number = 1.0;
  private isBossWave: boolean = false;

  public startWave(wave: number) {
    this.currentWave = wave;
    this.enemiesRemainingToSpawn = [];
    this.isBossWave = false;

    if (wave === 5) {
      this.enemiesRemainingToSpawn.push('Boss_Golem');
      this.isBossWave = true;
    } else if (wave === 10) {
      this.enemiesRemainingToSpawn.push('Boss_Void');
      this.isBossWave = true;
    } else if (wave === 15) {
      this.enemiesRemainingToSpawn.push('Boss_Chimera');
      this.isBossWave = true;
    } else {
        // Generate wave composition (scaled by difficulty multiplier)
        const baseSlimes = 5 + Math.floor(wave * 1.5);
        const baseMages = wave >= 2 ? Math.floor(wave * 1.2) : 0;
        const baseGolems = wave >= 3 ? Math.floor(wave * 0.5) : 0;
        const baseBombers = wave >= 2 ? Math.floor(wave * 0.2) : 0;

        const numSlimes = Math.max(1, Math.ceil(baseSlimes * DIFFICULTY_ENEMY_COUNT_MULT));
        const numMages = Math.max(0, Math.ceil(baseMages * DIFFICULTY_ENEMY_COUNT_MULT));
        const numGolems = Math.max(0, Math.ceil(baseGolems * DIFFICULTY_ENEMY_COUNT_MULT));
        const numBombers = Math.max(0, Math.ceil(baseBombers * DIFFICULTY_ENEMY_COUNT_MULT));

      for (let i = 0; i < numSlimes; i++)
      this.enemiesRemainingToSpawn.push('Slime');
      for (let i = 0; i < numMages; i++)
      this.enemiesRemainingToSpawn.push('Mage');
      for (let i = 0; i < numGolems; i++)
      this.enemiesRemainingToSpawn.push('Golem');
      for (let i = 0; i < numBombers; i++)
      this.enemiesRemainingToSpawn.push('Bomber');

      // Shuffle
      this.enemiesRemainingToSpawn.sort(() => Math.random() - 0.5);
    }

      this.spawnInterval = Math.max(0.12, 1.0 - wave * 0.06);
  }

  public update(dt: number, scene: THREE.Scene): Enemy | null {
    if (this.enemiesRemainingToSpawn.length > 0) {
      this.spawnTimer -= dt;
      if (this.spawnTimer <= 0) {
        this.spawnTimer = this.spawnInterval;
        const type = this.enemiesRemainingToSpawn.pop()!;

        // Spawn at random edge of arena (radius 40)
        const angle = Math.random() * Math.PI * 2;
        const pos = new THREE.Vector3(
          Math.cos(angle) * 40,
          0,
          Math.sin(angle) * 40
        );

            const waveMultiplier = Math.pow(WAVE_HEALTH_MULT, this.currentWave - 1);

        let enemy: Enemy;
        if (type.startsWith('Boss_')) {
          enemy = new Boss(scene, type, pos, waveMultiplier);
        } else {
          enemy = new Enemy(scene, type, pos, waveMultiplier);
        }

        this.activeEnemies.push(enemy);
        return enemy;
      }
    }
    return null;
  }

  public isWaveComplete(): boolean {
    return (
      this.enemiesRemainingToSpawn.length === 0 &&
      this.activeEnemies.length === 0);

  }
}