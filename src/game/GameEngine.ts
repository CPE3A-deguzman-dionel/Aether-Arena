import * as THREE from 'three';
import { Player } from './Player';
import { Enemy } from './Enemy';
import { Projectile } from './Projectile';
import { LootItem } from './LootSystem';
import { WaveManager } from './WaveManager';
import { InputManager } from './InputManager';
import { GameCallbacks, GameState, EnemyType } from './types';
import { DIFFICULTY_ENEMY_COUNT_MULT, WAVE_HEALTH_MULT } from './Balance';

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

  constructor(canvas: HTMLCanvasElement, callbacks: GameCallbacks) {
    this.callbacks = callbacks;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0f172a); // Dark slate
    this.scene.fog = new THREE.FogExp2(0x0f172a, 0.015);

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

    // Setup Arena
    this.setupArena();

    this.player = new Player(this.scene);
    this.waveManager = new WaveManager();

    window.addEventListener('resize', this.onWindowResize);

    this.callbacks.onPlayerUpdate(this.player.stats);
    this.callbacks.onWeaponUpdate(this.player.weapon);
    this.callbacks.onMeleeWeaponUpdate(this.player.meleeWeapon);
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

    // Glowing Edge with magical circle pattern
    const edgeGeo = new THREE.TorusGeometry(45, 2.5, 16, 64);
    
    const edgeMat = new THREE.MeshStandardMaterial({
      map: groundTexture,
      side: THREE.DoubleSide,
      roughness: 0.9,
      metalness: 0.1
    });
    const edge = new THREE.Mesh(edgeGeo, edgeMat);
    edge.rotation.x = Math.PI / 2;
    edge.scale.set(1.1, 1, 1.1); // Scale to fit square arena
    this.scene.add(edge);
  }

  public startGame() {
    this.state = 'PLAYING';
    this.callbacks.onStateChange('PLAYING');
    this.waveManager.startWave(1);
    this.callbacks.onWaveUpdate(1);
    this.clock.start();
    this.loop();
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
    const waveMultiplier = Math.pow(WAVE_HEALTH_MULT, this.waveManager.currentWave - 1);
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

    // Mouse Look
    this.raycaster.setFromCamera(this.input.mousePos, this.camera);
    const target = new THREE.Vector3();
    this.raycaster.ray.intersectPlane(this.groundPlane, target);

    this.player.update(dt, moveDir, target);
    this.callbacks.onDashCooldown(this.player.getDashCooldownRatio());
    this.callbacks.onMeleeCooldown(this.player.getMeleeCooldownRatio());

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
    this.player.meleeCooldown <= 0)
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

      // Boss Aura Buffs (15 units radius)
      for (const enemy of this.enemies) {
        if (enemy !== activeBoss && enemy.active) {
          const dist = enemy.mesh.position.distanceTo(activeBoss.mesh.position);
          if (dist <= 15) {
            // Apply buff (visualized by red tint, actual stat boost handled here)
            enemy.speed = 6; // Boosted speed
            enemy.damage = 15; // Boosted damage
            enemy.mesh.traverse((child: any) => {
              if (child instanceof THREE.Mesh) {
                const mat = child.material as THREE.MeshStandardMaterial;
                if (!mat.emissive || mat.emissive.getHex() === 0x000000) {
                  mat.color.lerp(new THREE.Color(0xff5555), 0.1);
                }
              }
            });
          }
        }
      }

      // Phase 3 Minion Spawning
      const bossObj = activeBoss as any;
      if (
      bossObj.phase === 3 &&
      Math.random() < 0.02 * dt * 60 &&
      this.state === 'PLAYING')
      {
        const angle = Math.random() * Math.PI * 2;
        const spawnPos = activeBoss.mesh.position.
        clone().
        add(new THREE.Vector3(Math.cos(angle) * 5, 0, Math.sin(angle) * 5));
        const minion = new Enemy(
          this.scene,
          'Slime',
          spawnPos,
          this.waveManager.currentWave
        );
        this.enemies.push(minion);
      }
    } else {
      this.callbacks.onBossUpdate(null);
    }

    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      enemy.update(dt, this.player.mesh.position, this.scene, this.projectiles);
      enemy.updateHPBar(this.camera);

      // Horizontal distance (ignore Y) for collision checks
      const dx = enemy.mesh.position.x - this.player.mesh.position.x;
      const dz = enemy.mesh.position.z - this.player.mesh.position.z;
      const horizDist = Math.sqrt(dx * dx + dz * dz);

      // Bomber: explode at a slightly larger radius and remove itself
      if (enemy.type === 'Bomber') {
        const explodeRange = 2.0;
        if (horizDist < explodeRange) {
          if (this.player.takeDamage(enemy.damage)) {
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
          if (this.player.takeDamage(enemy.damage)) {
            this.handleGameOver();
          }
          this.callbacks.onPlayerUpdate(this.player.stats);
        }
      } else if (enemy.type.startsWith('Boss_')) {
        // Bosses have larger hitboxes
        if (horizDist < 3.0) {
          if (this.player.takeDamage(enemy.damage)) {
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
          if (this.player.takeDamage(proj.damage)) {
            this.handleGameOver();
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
              // Mages have a magical barrier: ignore player projectiles (only melee damages them)
              if (enemy.type === 'Mage' && !proj.reflected) {
                // let normal player projectiles pass through mage barrier
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
    this.player.meleeCooldown = 1 / this.player.meleeWeapon.attackSpeed;
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

        if (angle <= this.player.meleeWeapon.arcAngle / 2) {
          // Hit!
          let finalDmg = dmg;

          // Backstab logic
          if (this.player.meleeWeapon.specialAttribute === 'backstab') {
            const enemyForward = new THREE.Vector3(0, 0, 1).
            applyQuaternion(enemy.mesh.quaternion).
            normalize();
            if (playerForward.dot(enemyForward) > 0.5) {
              // Attacking from behind roughly
              finalDmg *= 2.5;
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
            this.callbacks.onPlayerUpdate(this.player.stats);
          } else {
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
  }

  private spawnLoot(pos: THREE.Vector3, type: string) {
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
      return;
    }

    if (type === 'Golem') {
      expValue = 50;
      goldValue = 30;
    } else if (type === 'Mage') {
      expValue = 20;
      goldValue = 15;
    }

    this.loot.push(new LootItem(this.scene, pos, 'EXP', expValue));
    if (Math.random() > 0.3) {
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