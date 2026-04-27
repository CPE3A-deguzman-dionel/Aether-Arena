import * as THREE from 'three';
import { Player } from './Player';
import { Enemy } from './Enemy';
import { Boss } from './Boss';
import { Projectile } from './Projectile';
import { LootItem } from './LootSystem';
import { WaveManager } from './WaveManager';
import { InputManager } from './InputManager';
import { GameCallbacks, GameState, EnemyType } from './types';
// const DIFFICULTY_ENEMY_COUNT_MULT = 1.0;
import { WAVE_HEALTH_MULT } from './Balance';

export class GameEngine {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private clock: THREE.Clock;

  public player: Player;
  private input: InputManager;
  private waveManager: WaveManager;

  private enemies: Enemy[] = [];
  private projectiles: Projectile[] = [];
  private loot: LootItem[] = [];

  private callbacks: GameCallbacks;
  private state: GameState = 'MENU';
  private animationFrameId: number = 0;
  private raycaster: THREE.Raycaster = new THREE.Raycaster();
  private groundPlane: THREE.Plane = new THREE.Plane(
    new THREE.Vector3(0, 1, 0),
    0
  );

  // Dev mode
  public devMode: boolean = true;
  public godMode: boolean = false;
  public unlimitedEnergy: boolean = false;

  constructor(canvas: HTMLCanvasElement, callbacks: GameCallbacks) {
    this.callbacks = callbacks;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x1a0a2e); // Dark purple outside
    this.scene.fog = new THREE.FogExp2(0x1a0a2e, 0.015);

    this.camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 30, 20);
    this.camera.lookAt(0, 0, 0);

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    // Handle WebGL context loss on alt-tab
    canvas.addEventListener('webglcontextlost', (event) => {
      event.preventDefault();
      console.log('WebGL context lost');
    }, false);
    
    canvas.addEventListener('webglcontextrestored', () => {
      console.log('WebGL context restored');
      // Force a re-render when context is restored
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      // Restart the game loop if it was stopped
      if (this.state === 'PLAYING' || this.state === 'WAVE_CLEAR') {
        this.loop();
      }
    }, false);
    
    // Handle page visibility (alt-tab)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        // Tab is hidden, pause the game loop
        cancelAnimationFrame(this.animationFrameId);
        console.log('Game paused (tab hidden)');
      } else {
        // Tab is visible again, resume the game loop
        if (this.state === 'PLAYING' || this.state === 'WAVE_CLEAR') {
          this.clock.getDelta(); // Reset delta to prevent large time jump
          this.loop();
          console.log('Game resumed (tab visible)');
        }
      }
    });

    this.clock = new THREE.Clock();
    this.input = new InputManager(canvas);

    // Dev mode keyboard shortcuts
    window.addEventListener('keydown', this.handleDevKeys);

    // Setup Arena
    this.setupArena();

    this.player = new Player(this.scene);
    this.waveManager = new WaveManager();

    window.addEventListener('resize', this.onWindowResize);

    this.callbacks.onPlayerUpdate(this.player.stats);
    this.callbacks.onWeaponUpdate(this.player.weapon);
    this.callbacks.onMeleeWeaponUpdate(this.player.meleeWeapon);

    // Start the game loop
    this.loop();
  }

  private setupArena() {
    // Ambient Light
    this.scene.add(new THREE.AmbientLight(0xffffff, 0.4));

    // Directional Light
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(20, 40, 20);
    this.scene.add(dirLight);

    // Arena Platform
    const geometry = new THREE.PlaneGeometry(100, 100);
    
    // Create ground texture
    const groundCanvas = document.createElement('canvas');
    groundCanvas.width = 512;
    groundCanvas.height = 512;
    const groundCtx = groundCanvas.getContext('2d');
    
    if (!groundCtx) return;
    
    // Base ground color
    groundCtx.fillStyle = '#3d2914';
    groundCtx.fillRect(0, 0, 512, 512);
    
    // Add noise/texture
    for (let i = 0; i < 5000; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const size = Math.random() * 3 + 1;
      groundCtx.fillStyle = Math.random() > 0.5 ? '#4a3520' : '#2d1f0f';
      groundCtx.fillRect(x, y, size, size);
    }
    
    const groundTexture = new THREE.CanvasTexture(groundCanvas);
    groundTexture.wrapS = THREE.RepeatWrapping;
    groundTexture.wrapT = THREE.RepeatWrapping;
    groundTexture.repeat.set(2, 2);
    
    const material = new THREE.MeshStandardMaterial({
      map: groundTexture,
      side: THREE.DoubleSide,
      roughness: 0.9,
      metalness: 0.1
    });
    const platform = new THREE.Mesh(geometry, material);
    platform.rotation.x = -Math.PI / 2;
    platform.position.y = -0.5;
    this.scene.add(platform);

    // Visual border line (not physical walls)
    const arenaSize = 100;
    const borderGeometry = new THREE.EdgesGeometry(new THREE.BoxGeometry(arenaSize, 0.1, arenaSize));
    const borderMaterial = new THREE.LineBasicMaterial({ color: 0xd4af37, linewidth: 2 });
    const border = new THREE.LineSegments(borderGeometry, borderMaterial);
    border.position.y = -0.4;
    this.scene.add(border);
  }

  public startGame() {
    this.input.reset();
    this.state = 'PLAYING';
    this.callbacks.onStateChange('PLAYING');
    this.waveManager.startWave(1);
    this.callbacks.onWaveUpdate(1);
    this.clock.start();
  }

  // Dev mode methods
  private handleDevKeys = (e: KeyboardEvent) => {
    // Only activate dev keys if dev mode is enabled and Shift is held
    if (!this.devMode || !e.shiftKey) return;

    switch (e.code) {
      case 'KeyG':
        this.toggleGodMode();
        console.log('God Mode:', this.godMode);
        break;
      case 'KeyU':
        this.toggleUnlimitedEnergy();
        console.log('Unlimited Energy:', this.unlimitedEnergy);
        break;
      case 'KeyR':
        this.removeAllEntities();
        console.log('Removed all entities');
        break;
      case 'Digit1':
        this.spawnBoss('Boss_Golem');
        console.log('Spawned Golem Boss');
        break;
      case 'Digit2':
        this.spawnBoss('Boss_Void');
        console.log('Spawned Void Boss');
        break;
      case 'Digit3':
        this.spawnBoss('Boss_Chimera');
        console.log('Spawned Chimera Boss');
        break;
    }
  };

  public toggleGodMode() {
    this.godMode = !this.godMode;
  }

  public toggleUnlimitedEnergy() {
    this.unlimitedEnergy = !this.unlimitedEnergy;
    this.player.unlimitedEnergy = this.unlimitedEnergy;
    console.log('Unlimited Energy toggled to:', this.unlimitedEnergy);
  }

  public removeAllEntities() {
    for (const enemy of this.enemies) {
      this.scene.remove(enemy.mesh);
    }
    this.enemies = [];
    for (const proj of this.projectiles) {
      this.scene.remove(proj.mesh);
    }
    this.projectiles = [];
    for (const loot of this.loot) {
      this.scene.remove(loot.mesh);
    }
    this.loot = [];
  }

  public spawnBoss(bossType: EnemyType) {
    const boss = new Boss(this.scene, bossType, new THREE.Vector3(0, 0, -20), 1);
    this.enemies.push(boss);
  }

  public setState(newState: GameState) {
    this.state = newState;
    this.callbacks.onStateChange(newState);
    if (newState === 'PLAYING') {
      this.clock.getDelta(); // Reset delta
    }
  }

  public startNextWave() {
    const nextWave = this.waveManager.currentWave + 1;
    this.waveManager.startWave(nextWave);
    this.callbacks.onWaveUpdate(nextWave);
    this.setState('PLAYING');
  }

  public spawnEnemy(type: EnemyType) {
    const angle = Math.random() * Math.PI * 2;
    const pos = new THREE.Vector3(
      Math.cos(angle) * 30,
      0,
      Math.sin(angle) * 30
    );
    const waveMultiplier = this.waveManager.currentWave; // Linear scaling based on current wave
    let enemy: Enemy;
    if (type.startsWith('Boss_')) {
      enemy = new Boss(this.scene, type, pos, waveMultiplier);
    } else {
      enemy = new Enemy(this.scene, type, pos, waveMultiplier);
    }
    this.enemies.push(enemy);
    this.waveManager.activeEnemies.push(enemy);
    return enemy;
  }

  private onWindowResize = () => {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  };

  private loop = () => {
    this.animationFrameId = requestAnimationFrame(this.loop);

    if (this.state === 'PLAYING' || this.state === 'WAVE_CLEAR') {
      const dt = Math.min(this.clock.getDelta(), 0.1); // Cap dt
      this.update(dt);
    } else {
      this.clock.getDelta(); // Keep clock ticking to avoid huge dt on resume
      // Reset mouse state when paused/in menus to prevent stuck inputs
      this.input.isMouseDown = false;
      this.input.isRightMouseDown = false;
    }

    this.renderer.render(this.scene, this.camera);
  };

  private update(dt: number) {
    // 1. Player Input & Movement
    const moveDir = new THREE.Vector3(0, 0, 0);
    if (this.input.keys['KeyW']) moveDir.z -= 1;
    if (this.input.keys['KeyS']) moveDir.z += 1;
    if (this.input.keys['KeyA']) moveDir.x -= 1;
    if (this.input.keys['KeyD']) moveDir.x += 1;

    if (this.input.keys['Space']) {
      this.player.dash(moveDir);
      this.input.keys['Space'] = false; // Prevent hold
    }

    // Handle consumable hotkeys (1, 2, 3)
    for (const slotIndex of this.input.consumableKeys) {
      if (this.player.useConsumable(slotIndex)) {
        this.callbacks.onPlayerUpdate(this.player.stats);
      }
    }
    this.input.consumableKeys = []; // Clear processed keys

    // Mouse Look
    this.raycaster.setFromCamera(this.input.mousePos, this.camera);
    const target = new THREE.Vector3();
    this.raycaster.ray.intersectPlane(this.groundPlane, target);

    // Check for Golem slow aura
    let inGolemAura = false;
    for (const enemy of this.enemies) {
      if (enemy.type === 'Golem' && enemy.active) {
        const distToPlayer = this.player.mesh.position.distanceTo(enemy.mesh.position);
        if (distToPlayer < enemy.slowAuraRadius) {
          inGolemAura = true;
          break;
        }
      }
      // Boss Golem Phase 2 and Phase 3 aura slow effect
      if (enemy.type === 'Boss_Golem' && ((enemy as any).phase === 2 || (enemy as any).phase === 3) && enemy.active) {
        const distToPlayer = this.player.mesh.position.distanceTo(enemy.mesh.position);
        if (distToPlayer < 100) { // Aura covers entire map
          inGolemAura = true;
          break;
        }
      }
    }
    this.player.setSlowEffect(inGolemAura ? 0.5 : 0);

    this.player.update(dt, moveDir, target);
    this.callbacks.onEnergyUpdate(this.player.getEnergyRatio());
    this.callbacks.onPlayerUpdate(this.player.stats);

    // Camera follow
    this.camera.position.x = THREE.MathUtils.lerp(
      this.camera.position.x,
      this.player.mesh.position.x,
      5 * dt
    );
    this.camera.position.z = THREE.MathUtils.lerp(
      this.camera.position.z,
      this.player.mesh.position.z + 20,
      5 * dt
    );

    // Shooting (allow while PLAYING or during WAVE_CLEAR so player can still attack)
    if (this.input.isMouseDown && (this.state === 'PLAYING' || this.state === 'WAVE_CLEAR')) {
      this.player.shoot(this.scene, this.projectiles);
    }

    // Melee
    if (
    this.input.isRightMouseDown &&
    (this.state === 'PLAYING' || this.state === 'WAVE_CLEAR') &&
    this.player.canUseMelee())
    {
      this.performMeleeAttack();
    }

    // 2. Wave & Enemies
    if (this.state === 'PLAYING') {
      const newEnemy = this.waveManager.update(dt, this.scene);
      if (newEnemy) this.enemies.push(newEnemy);
    }

    // Boss Tracking & Buffs
    let activeBoss: Enemy | null = null;
    for (const enemy of this.enemies) {
      if (enemy.active && enemy.type.startsWith('Boss_')) {
        activeBoss = enemy;
        break;
      }
    }

    if (activeBoss) {
      this.callbacks.onBossUpdate({
        name: activeBoss.type.replace('Boss_', 'The '),
        hp: activeBoss.hp,
        maxHp: activeBoss.maxHp
      });

      // Boss Golem Phase 3: Spawn golems
      if (activeBoss.type === 'Boss_Golem' && (activeBoss as any).shouldSpawnPhase3Golem) {
        (activeBoss as any).shouldSpawnPhase3Golem = false;
        const angle = Math.random() * Math.PI * 2;
        const spawnPos = activeBoss.mesh.position.clone().add(new THREE.Vector3(Math.cos(angle) * 8, 0, Math.sin(angle) * 8));
        const golem = new Enemy(
          this.scene,
          'Golem',
          spawnPos,
          1 // Use waveMultiplier = 1 for boss-spawned golems (no scaling)
        );
        this.enemies.push(golem);
      }

      // Boss Golem Phase 3: Spawn block enemies
      if (activeBoss.type === 'Boss_Golem' && (activeBoss as any).shouldSpawnPhase3Blocks) {
        (activeBoss as any).shouldSpawnPhase3Blocks = false;
        for (let i = 0; i < 4; i++) {
          const angle = i * Math.PI * 2 / 4;
          const distance = 8;
          const spawnPos = activeBoss.mesh.position.clone().add(new THREE.Vector3(Math.cos(angle) * distance, 0, Math.sin(angle) * distance));
          const block = new Enemy(
            this.scene,
            'Boss_Golem_Block',
            spawnPos,
            this.waveManager.currentWave
          );
          (block as any).isBossBlock = true;
          (block as any).bossRef = activeBoss;
          (block as any).blockIndex = i;
          this.scene.add(block.mesh);
          this.enemies.push(block);
        }
      }

    } else {
      this.callbacks.onBossUpdate(null);
    }

    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      enemy.update(dt, this.player.mesh.position, this.scene, this.projectiles);
      enemy.updateHPBar(this.camera);

      // Healer logic: heal nearby allies
      if (enemy.type === 'Healer' && enemy.active) {
        const healRadius = 8;
        const healAmount = 5 * dt;

        for (const ally of this.enemies) {
          if (ally !== enemy && ally.active && !ally.type.startsWith('Boss_')) {
            const dist = ally.mesh.position.distanceTo(enemy.mesh.position);
            if (dist < healRadius) {
              // Heal ally
              if (ally.hp < ally.maxHp) {
                ally.hp = Math.min(ally.maxHp, ally.hp + healAmount);
              }
            }
          }
        }
      }

      // Bard logic: speed buff nearby allies
      if (enemy.type === 'Bard' && enemy.active) {
        const speedRadius = enemy.speedAuraRadius;
        const speedBuff = 1.4; // 40% speed increase

        for (const ally of this.enemies) {
          if (ally !== enemy && ally.active && !ally.type.startsWith('Boss_')) {
            const dist = ally.mesh.position.distanceTo(enemy.mesh.position);
            if (dist < speedRadius) {
              // Speed buff ally
              ally.speed = ally.type === 'Slime' ? 4 * speedBuff :
                          ally.type === 'Golem' ? 3 * speedBuff :
                          ally.type === 'Bomber' ? 6 * speedBuff :
                          ally.type === 'Mage' ? 3.5 * speedBuff :
                          ally.type === 'Healer' ? 3 * speedBuff :
                          ally.type === 'Bard' ? 4 * speedBuff : 3.5 * speedBuff;
            }
          }
        }
      }

      // Horizontal distance (ignore Y) for collision checks
      const dx = enemy.mesh.position.x - this.player.mesh.position.x;
      const dz = enemy.mesh.position.z - this.player.mesh.position.z;
      const horizDist = Math.sqrt(dx * dx + dz * dz);

      // Bomber: explode at a slightly larger radius and remove itself
      if (enemy.type === 'Bomber') {
        const explodeRange = 2.0;
        if (horizDist < explodeRange) {
          if (!this.godMode && this.player.takeDamage(enemy.damage)) {
            this.handleGameOver();
          }
          this.callbacks.onPlayerUpdate(this.player.stats);
          enemy.active = false; // consumes itself
          continue;
        }
      }

      // Regular melee enemies (Slime, Golem, Bomber handled above)
      if (!enemy.type.startsWith('Boss_') && enemy.type !== 'Mage') {
        if (horizDist < 1.5) {
          if (!this.godMode && this.player.takeDamage(enemy.damage)) {
            this.handleGameOver();
          }
          this.callbacks.onPlayerUpdate(this.player.stats);
        }
      } else if (enemy.type.startsWith('Boss_')) {
        // Bosses have larger hitboxes
        if (horizDist < 3.0) {
          if (!this.godMode && this.player.takeDamage(enemy.damage)) {
            this.handleGameOver();
          }
          this.callbacks.onPlayerUpdate(this.player.stats);
        }
      }
    }

    // 3. Projectiles
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const proj = this.projectiles[i];
      proj.update(dt);

      // Gravity Pull effect
      if (proj.specialAttribute === 'gravity_pull' && proj.active) {
        for (const enemy of this.enemies) {
          if (!enemy.active) continue;
          const dist = proj.mesh.position.distanceTo(enemy.mesh.position);
          if (dist < 8.0) {
            const pullDir = new THREE.Vector3().
            subVectors(proj.mesh.position, enemy.mesh.position).
            normalize();
            const pullStrength = 10 * (1 - dist / 8.0);
            enemy.mesh.position.addScaledVector(pullDir, pullStrength * dt);
          }
        }
      }

      if (!proj.active) {
        proj.destroy(this.scene);
        this.projectiles.splice(i, 1);
        continue;
      }

      // Collisions
      if (proj.isEnemy) {
        // horizontal collision check with player
        const pdx = proj.mesh.position.x - this.player.mesh.position.x;
        const pdz = proj.mesh.position.z - this.player.mesh.position.z;
        const pDist = Math.sqrt(pdx * pdx + pdz * pdz);
        if (pDist < 1.2) {
          if (!this.godMode && this.player.takeDamage(proj.damage)) {
            this.handleGameOver();
          }
          // Apply slow effect if projectile has slow_aura attribute (only if not in god mode)
          if (!this.godMode && (proj as any).specialAttribute === 'slow_aura') {
            this.player.setSlowEffect(0.5); // 50% slow for 3 seconds
            setTimeout(() => {
              this.player.setSlowEffect(0);
            }, 3000);
          }
          this.callbacks.onPlayerUpdate(this.player.stats);
          proj.active = false;
        }
      } else {
        for (const enemy of this.enemies) {
          const edx = proj.mesh.position.x - enemy.mesh.position.x;
          const edz = proj.mesh.position.z - enemy.mesh.position.z;
          const eDist = Math.sqrt(edx * edx + edz * edz);
          if (eDist < 1.5) {
              // Mages have a magical barrier: absorb player projectiles and glow
              if (enemy.type === 'Mage' && !proj.reflected) {
                // Trigger magic circle glow
                (enemy as any).triggerMagicCircleGlow();
                // Absorb projectile
                proj.active = false;
                continue;
              }


            // Apply special effects on hit
            if (
            proj.specialAttribute === 'spread_knockback' &&
            proj.knockback > 0)
            {
              enemy.applyKnockback(proj.knockback, this.player.mesh.position);
            }
            if (proj.specialAttribute === 'freeze_stack') {
              enemy.applyChill();
            }
            if (proj.specialAttribute === 'life_siphon') {
              const healAmount = proj.damage * 0.15;
              this.player.stats.hp = Math.min(
                this.player.stats.maxHp,
                this.player.stats.hp + healAmount
              );
              this.callbacks.onPlayerUpdate(this.player.stats);
            }

            if (enemy.takeDamage(proj.damage)) {
              this.spawnLoot(enemy.mesh.position, enemy.type);
              if (this.player.hasVampirism) {
                this.player.stats.hp = Math.min(
                  this.player.stats.maxHp,
                  this.player.stats.hp + 1
                );
                this.callbacks.onPlayerUpdate(this.player.stats);
              }
            }

            // Boss Golem Block damage reflection (50%)
            if (enemy.type === 'Boss_Golem_Block' && enemy.active) {
              const reflectMultiplier = 0.5;
              if (reflectMultiplier > 0) {
                const reflectDamage = proj.damage * reflectMultiplier;
                this.player.stats.hp -= reflectDamage;
                this.callbacks.onPlayerUpdate(this.player.stats);
              }
            }

            // Golem damage reflection
            if (enemy.type === 'Golem' && enemy.active) {
              const reflectDamage = proj.damage * 0.3; // 30% reflection
              this.player.stats.hp -= reflectDamage;
              this.callbacks.onPlayerUpdate(this.player.stats);
            }

            // Boss Golem damage reflection (50%)
            if (enemy.type === 'Boss_Golem' && enemy.active) {
              const reflectMultiplier = (enemy as any).getReflectDamageMultiplier ? (enemy as any).getReflectDamageMultiplier() : 0;
              if (reflectMultiplier > 0) {
                const reflectDamage = proj.damage * reflectMultiplier;
                this.player.stats.hp -= reflectDamage;
                this.callbacks.onPlayerUpdate(this.player.stats);
              }
            }

            // Chain Reaction
            if (
            proj.specialAttribute === 'chain_reaction' &&
            proj.chainCount > 0)
            {
              // Find nearest other enemy
              let nearestEnemy: Enemy | null = null;
              let minSqDist = Infinity;
              for (const other of this.enemies) {
                if (other !== enemy && other.active) {
                  const sqDist = enemy.mesh.position.distanceToSquared(
                    other.mesh.position
                  );
                  if (sqDist < 225 && sqDist < minSqDist) {
                    // 15 units radius (increased from 8)
                    minSqDist = sqDist;
                    nearestEnemy = other;
                  }
                }
              }
              if (nearestEnemy) {
                const chainDir = new THREE.Vector3().
                subVectors(nearestEnemy.mesh.position, enemy.mesh.position).
                normalize();
                this.projectiles.push(
                  new Projectile(
                    this.scene,
                    enemy.mesh.position.
                    clone().
                    add(new THREE.Vector3(0, 0.5, 0)).
                    add(chainDir.clone().multiplyScalar(0.5)), // Offset to avoid immediate self-hit
                    chainDir,
                    25, // Faster chain projectile
                    proj.damage * 0.8, // Slightly reduced damage on chain
                    false,
                    parseInt(this.player.weapon.color.replace('#', '0x')),
                    'chain_reaction',
                    0,
                    proj.chainCount - 1
                  )
                );
              }
            }

            proj.active = false;
            break;
          }
        }
      }
    }

    // 4. Loot
    for (let i = this.loot.length - 1; i >= 0; i--) {
      const item = this.loot[i];
      item.update(dt, this.clock.getElapsedTime(), this.player.mesh.position);

      if (item.mesh.position.distanceTo(this.player.mesh.position) < 1.0) {
        if (item.type === 'EXP') {
          if (this.player.addExp(item.value)) {
            this.handleLevelUp();
          }
        } else {
          this.player.stats.gold += item.value;
        }
        this.callbacks.onPlayerUpdate(this.player.stats);
        item.destroy(this.scene);
        this.loot.splice(i, 1);
      }
    }

    // Cleanup dead enemies
    this.enemies = this.enemies.filter((e) => {
      if (!e.active) {
        // Check if this is a Boss Golem Block
        if (e.type === 'Boss_Golem_Block' && (e as any).bossRef) {
          const boss = (e as any).bossRef;
          // Notify boss that a block was destroyed
          if (boss.destroyBlock) {
            boss.destroyBlock((e as any).blockIndex);
          }
        }
        e.destroy(this.scene);
        this.waveManager.activeEnemies = this.waveManager.activeEnemies.filter(
          (ae) => ae !== e
        );
        return false;
      }
      return true;
    });

    // Check Wave Clear
    // Require that there are no pending spawns AND no active enemies in the engine's list.
    // This prevents boss waves or dynamically spawned minions from marking the wave cleared early.
    if (
      this.state === 'PLAYING' &&
      this.waveManager.enemiesRemainingToSpawn.length === 0 &&
      this.enemies.length === 0
    ) {
      this.setState('WAVE_CLEAR');
    }
  }

  private performMeleeAttack() {
    this.player.useMeleeEnergy();
    this.player.triggerMeleeVisual();
    this.player.meleeCombo++;

    let dmg = this.player.meleeWeapon.damage * (1 + this.player.stats.atk / 100);
    if (Math.random() * 100 < this.player.stats.crit) {
      dmg *= 2;
    }

    // Plasma Rapier Lunge
    if (
    this.player.meleeWeapon.specialAttribute === 'static_charge' &&
    this.player.meleeCombo % 3 === 0)
    {
      const dir = new THREE.Vector3(0, 0, 1).
      applyQuaternion(this.player.mesh.quaternion).
      normalize();
      this.player.mesh.position.addScaledVector(dir, 3);
    }

    const playerForward = new THREE.Vector3(0, 0, 1).
    applyQuaternion(this.player.mesh.quaternion).
    normalize();

    // Bounce enemy projectiles that are within melee arc/range: redirect them to nearest enemy
    for (const proj of this.projectiles) {
      if (!proj.active || !proj.isEnemy) continue;
      const toProj = new THREE.Vector3().subVectors(proj.mesh.position, this.player.mesh.position);
      const distProj = toProj.length();
      if (distProj <= this.player.meleeWeapon.range) {
        const dirToProj = toProj.clone().normalize();
        const angleToProj = playerForward.angleTo(dirToProj);
        if (angleToProj <= this.player.meleeWeapon.arcAngle / 2) {
          // Find nearest enemy to redirect to
          let nearest: Enemy | null = null;
          let minD = Infinity;
          for (const e of this.enemies) {
            if (!e.active) continue;
            const d = proj.mesh.position.distanceTo(e.mesh.position);
            if (d < minD) {
              minD = d;
              nearest = e;
            }
          }

          const newDir = new THREE.Vector3();
          if (nearest) {
            newDir.subVectors(nearest.mesh.position, proj.mesh.position).normalize();
          } else {
            newDir.copy(playerForward);
          }

          const speed = proj.velocity.length() || 20;
          proj.velocity.copy(newDir.multiplyScalar(speed));
          proj.isEnemy = false; // now belongs to player
          proj.reflected = true;
          proj.lifetime = Math.max(proj.lifetime, 1.0);
          try {
            const mat: any = proj.mesh.material;
            const colorHex = parseInt(this.player.weapon.color.replace('#', '0x'));
            if (mat.color) mat.color.setHex(colorHex);
            if (mat.emissive) mat.emissive.setHex(colorHex);
          } catch (e) {
            // ignore
          }
        }
      }
    }

    for (const enemy of this.enemies) {
      if (!enemy.active) continue;

      const dirToEnemy = new THREE.Vector3().subVectors(
        enemy.mesh.position,
        this.player.mesh.position
      );
      const dist = dirToEnemy.length();

      if (dist <= this.player.meleeWeapon.range) {
        dirToEnemy.normalize();
        const angle = playerForward.angleTo(dirToEnemy);

        // Check if enemy is within the swing arc (left to right: -90° to +90°)
        // Convert angle to signed value relative to player's right direction
        const playerRight = new THREE.Vector3(1, 0, 0).applyQuaternion(this.player.mesh.quaternion).normalize();
        const signedAngle = Math.atan2(dirToEnemy.dot(playerRight), dirToEnemy.dot(playerForward));

        // Swing covers -90° to +90° (left to right)
        if (signedAngle >= -Math.PI / 2 && signedAngle <= Math.PI / 2) {
          // Hit!
          let finalDmg = dmg;

          // Apply damageckstab logic
          if (this.player.meleeWeapon.specialAttribute === 'backstab') {
            const enemyForward = new THREE.Vector3(0, 0, 1).
            applyQuaternion(enemy.mesh.quaternion).
            normalize();
            if (playerForward.dot(enemyForward) > 0.5) {
              finalDmg *= 2.5;
            }
          }

          // Boss Golem damage reflection (50%)
          if ((enemy.type === 'Boss_Golem' || enemy.type === 'Boss_Golem_Block') && enemy.active) {
            const reflectMultiplier = 0.5;
            if (reflectMultiplier > 0) {
              const reflectDamage = finalDmg * reflectMultiplier;
              this.player.stats.hp -= reflectDamage;
              this.callbacks.onPlayerUpdate(this.player.stats);
            }
          }

          if (enemy.takeDamage(finalDmg)) {
            this.spawnLoot(enemy.mesh.position, enemy.type);
            this.player.meleeKills++;

            // Vampiric Scythe
            if (
            this.player.meleeWeapon.specialAttribute === 'blood_harvest' &&
            this.player.meleeKills % 5 === 0)
            {
              this.player.stats.hp = Math.min(
                this.player.stats.maxHp,
                this.player.stats.hp + 10
              );
            }

            if (this.player.hasVampirism) {
              this.player.stats.hp = Math.min(
                this.player.stats.maxHp,
                this.player.stats.hp + 1
              );
            }
          }

          // Golem damage reflection (applies even if enemy survives)
          if (enemy.type === 'Golem' && enemy.active) {
            const reflectDamage = finalDmg * 0.3; // 30% reflection
            this.player.stats.hp -= reflectDamage;
            this.callbacks.onPlayerUpdate(this.player.stats);
          }

          // Apply knockback
          if (this.player.meleeWeapon.knockback) {
            enemy.applyKnockback(
              this.player.meleeWeapon.knockback,
              this.player.mesh.position
            );
          }
          // Apply stun
          if (
          this.player.meleeWeapon.stunChance &&
          Math.random() < this.player.meleeWeapon.stunChance)
          {
            enemy.freezeTimer = 1.0; // Reuse freeze timer for stun
          }
        }
      }
    }
  }

  private spawnLoot(pos: THREE.Vector3, type: string) {
    // Skip loot for Boss Golem Blocks
    if (type === 'Boss_Golem_Block') {
      return;
    }

    let expValue = 10;
    let goldValue = 5;

    if (type.startsWith('Boss_')) {
      expValue = 500;
      goldValue = 300;
      // Spawn multiple loot items for bosses
      for (let i = 0; i < 5; i++) {
        this.loot.push(new LootItem(this.scene, pos, 'EXP', expValue / 5));
        this.loot.push(new LootItem(this.scene, pos, 'GOLD', goldValue / 5));
      }
    } else {
      this.loot.push(new LootItem(this.scene, pos, 'EXP', expValue));
      this.loot.push(new LootItem(this.scene, pos, 'GOLD', goldValue));
    }
  }

  private handleLevelUp() {
    this.setState('LEVEL_UP');
  }

  private handleGameOver() {
    this.setState('GAME_OVER');
  }

  public cleanup() {
    cancelAnimationFrame(this.animationFrameId);
    window.removeEventListener('resize', this.onWindowResize);
    this.input.cleanup();
    this.renderer.dispose();
  }
}