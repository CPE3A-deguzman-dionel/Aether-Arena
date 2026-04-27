import * as THREE from 'three';
import { Enemy } from './Enemy';
import { EnemyType } from './types';
import { Projectile } from './Projectile';
import { ENEMY_RANGED_FIRE_RATE_MULT } from './Balance';

export class Boss extends Enemy {
  public phase: number = 1;
  private specialTimer: number = 0;
  private heads: any[] = [];
  private wings: any[] = [];
  private aura: any | null = null;
  private blocks: any[] = [];
  private blockEnemies: any[] = []; // Store actual Enemy entities for blocks
  private isImmune: boolean = false;
  private aoeAttackTimer: number = 0;
  private blockProjectileTimer: number = 0;
  private hitFlashTimer: number = 0;
  private originalBodyColor: number = 0x475569;
  private bodyMesh: any = null;
  private waveMultiplier: number = 1;
  private phase3GolemSpawnTimer: number = 0;
  private phase3GolemsSpawned: number = 0;

  constructor(
  scene: THREE.Scene,
  type: EnemyType,
  position: THREE.Vector3,
  waveMultiplier: number)
  {
    super(scene, type, position, waveMultiplier);
    this.waveMultiplier = waveMultiplier;

    // Override HP and damage for bosses
    this.hp = 1000 * waveMultiplier;
    this.maxHp = this.hp;
    this.damage = 20 * waveMultiplier;
    this.speed = 2.5;

    // Build specific boss visuals
    this.buildVisuals();
    this.buildAura();
  }

  private buildAura() {
    // Arena-wide aura (only visible in Phase 2+) - covers entire map
    const auraGeo = new THREE.RingGeometry(0.5, 100, 64);
    const auraMat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0, // Hidden in Phase 1
      depthWrite: false,
      depthTest: false
    });
    this.aura = new THREE.Mesh(auraGeo, auraMat);
    this.aura.rotation.x = -Math.PI / 2;
    this.aura.position.y = 0.1;
    (this.aura as any).renderOrder = -1;
    this.mesh.add(this.aura);
  }

  private buildVisuals() {
    // Remove default mesh children (except HP bar which is at index 0)
    const hpBar = this.mesh.children[0];
    this.mesh.clear();
    this.mesh.add(hpBar);

    if (this.type === 'Boss_Golem') {
      hpBar.position.y = 4.5;
      this.speed = 3; // Normal speed for Phase 1

      // Body - large golem
      const bodyGeo = new THREE.BoxGeometry(3, 4, 3);
      const bodyMat = new THREE.MeshStandardMaterial({
        color: 0x475569,
        roughness: 0.9
      });
      this.bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
      this.bodyMesh.position.y = 2;

      // Glowing core
      const coreGeo = new THREE.SphereGeometry(1, 16, 16);
      const coreMat = new THREE.MeshStandardMaterial({
        color: 0x06b6d4,
        emissive: 0x06b6d4,
        emissiveIntensity: 2
      });
      const core = new THREE.Mesh(coreGeo, coreMat);
      core.position.set(0, 2.5, 1.5);

      this.mesh.add(this.bodyMesh, core);

      // 4 Spinning Blocks (attached in Phase 1 & 2, detached in Phase 3)
      const blockGeo = new THREE.BoxGeometry(1.5, 1.5, 1.5);
      const blockMat = new THREE.MeshStandardMaterial({
        color: 0x64748b,
        emissive: 0x06b6d4,
        emissiveIntensity: 0.5
      });
      for (let i = 0; i < 4; i++) {
        const block = new THREE.Mesh(blockGeo, blockMat);
        (block as any).userData = { health: 100 * this.waveMultiplier, maxHealth: 100 * this.waveMultiplier, isBlock: true, index: i };
        this.blocks.push(block);
        this.mesh.add(block);
      }
    } else if (this.type === 'Boss_Void') {
      hpBar.position.y = 5.0;
      this.speed = 3.5;

      // Body
      const bodyGeo = new THREE.CylinderGeometry(0.5, 0.2, 3, 16);
      const bodyMat = new THREE.MeshStandardMaterial({ color: 0x1e1b4b });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      body.position.y = 2.5;
      body.rotation.x = Math.PI / 4;

      // Wings (Pages)
      const wingGeo = new THREE.PlaneGeometry(4, 3);
      const wingMat = new THREE.MeshStandardMaterial({
        color: 0x581c87,
        emissive: 0x3b0764,
        emissiveIntensity: 0.5,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.8
      });

      const leftWing = new THREE.Mesh(wingGeo, wingMat);
      leftWing.position.set(-2, 3, -1);
      leftWing.rotation.y = Math.PI / 6;

      const rightWing = new THREE.Mesh(wingGeo, wingMat);
      rightWing.position.set(2, 3, -1);
      rightWing.rotation.y = -Math.PI / 6;

      this.wings.push(leftWing, rightWing);
      this.mesh.add(body, leftWing, rightWing);
    } else if (this.type === 'Boss_Chimera') {
      hpBar.position.y = 4.0;
      this.speed = 3.0;

      // Main Body
      const bodyGeo = new THREE.SphereGeometry(1.5, 32, 32);
      const bodyMat = new THREE.MeshStandardMaterial({
        color: 0x0f766e,
        transparent: true,
        opacity: 0.8
      });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      body.position.y = 1.5;

      // 3 Heads (Red, Blue, Green)
      const headGeo = new THREE.SphereGeometry(0.8, 16, 16);

      const redMat = new THREE.MeshStandardMaterial({
        color: 0xef4444,
        emissive: 0x991b1b
      });
      const redHead = new THREE.Mesh(headGeo, redMat);
      redHead.position.set(-1.2, 2.5, 0.8);

      const blueMat = new THREE.MeshStandardMaterial({
        color: 0x3b82f6,
        emissive: 0x1e40af
      });
      const blueHead = new THREE.Mesh(headGeo, blueMat);
      blueHead.position.set(1.2, 2.5, 0.8);

      const greenMat = new THREE.MeshStandardMaterial({
        color: 0x22c55e,
        emissive: 0x166534
      });
      const greenHead = new THREE.Mesh(headGeo, greenMat);
      greenHead.position.set(0, 3.0, -0.5);

      this.heads.push(redHead, blueHead, greenHead);
      this.mesh.add(body, redHead, blueHead, greenHead);
    }
  }

  public update(
  dt: number,
  playerPos: THREE.Vector3,
  scene: THREE.Scene,
  projectiles: Projectile[])
  {
    if (!this.active) return;
    super.update(dt, playerPos, scene, projectiles);

    this.specialTimer += dt;
    const hpRatio = this.hp / this.maxHp;

    if (hpRatio <= 0.5 && this.phase === 1) {
      this.phase = 2;
    } else if (hpRatio <= 0.2 && this.phase === 2) {
      this.phase = 3;
      this.speed *= 1.5; // Enrage speed
      if (this.aura) {
        ;(this.aura.material as THREE.MeshBasicMaterial).color.setHex(0xff0000);
        (this.aura.material as THREE.MeshBasicMaterial).opacity = 0.8;
      }
    }

    const time = Date.now() * 0.001;

    if (this.aura) {
      this.aura.rotation.z += dt * 0.5;
      const scale = 1 + Math.sin(time * 5) * 0.05;
      this.aura.scale.set(scale, scale, 1);
    }

    if (this.type === 'Boss_Golem') {
      this.updateGolemBoss(dt, playerPos, scene, projectiles, hpRatio);
    } else if (this.type === 'Boss_Void') {
      // Animate wings
      this.wings[0].rotation.z = Math.sin(time * 5) * 0.5;
      this.wings[1].rotation.z = -Math.sin(time * 5) * 0.5;
      this.mesh.position.y = 1 + Math.sin(time * 2) * 0.5;

      if (this.phase === 1 && this.specialTimer > 4.0 / ENEMY_RANGED_FIRE_RATE_MULT) {
        this.specialTimer = 0;
        // Gravity Well
        const dir = new THREE.Vector3().
        subVectors(playerPos, this.mesh.position).
        normalize();
        const spawnPos = this.mesh.position.clone();
        spawnPos.y = 2.5;
        projectiles.push(
          new Projectile(
            scene,
            spawnPos,
            dir,
            8,
            this.damage,
            true,
            0x581c87,
            'gravity_pull'
          )
        );
      }

      if (
      this.phase >= 2 &&
      this.specialTimer > ((this.phase === 3 ? 0.2 : 0.5) / ENEMY_RANGED_FIRE_RATE_MULT))
      {
        this.specialTimer = 0;
        // Bullet hell
        const count = this.phase === 3 ? 5 : 3;
        for (let i = 0; i < count; i++) {
          const spread = (Math.random() - 0.5) * (this.phase === 3 ? 1.0 : 0.5);
          const dir = new THREE.Vector3().
          subVectors(playerPos, this.mesh.position).
          normalize();
          dir.applyAxisAngle(new THREE.Vector3(0, 1, 0), spread);
          const spawnPos = this.mesh.position.clone();
          spawnPos.y = 2.5;
          projectiles.push(
            new Projectile(
              scene,
              spawnPos,
              dir,
              12,
              this.damage * 0.5,
              true,
              0xd946ef
            )
          );
        }
      }
    } else if (this.type === 'Boss_Chimera') {
      // Bobbing
      this.mesh.position.y = Math.sin(time * 3) * 0.2;

      if (this.phase === 1 && this.specialTimer > 2.0 / ENEMY_RANGED_FIRE_RATE_MULT) {
        this.specialTimer = 0;
        // Red Head (Fire spread)
        const redPos = new THREE.Vector3();
        this.heads[0].getWorldPosition(redPos);
        const dir = new THREE.Vector3().
        subVectors(playerPos, redPos).
        normalize();

        for (let i = -1; i <= 1; i++) {
          const projDir = dir.
          clone().
          applyAxisAngle(new THREE.Vector3(0, 1, 0), i * 0.2);
          projectiles.push(
            new Projectile(
              scene,
              redPos,
              projDir,
              18,
              this.damage,
              true,
              0xef4444
            )
          );
        }

        // Blue Head (Ice shard)
        setTimeout(() => {
          if (!this.active) return;
          const bluePos = new THREE.Vector3();
          this.heads[1].getWorldPosition(bluePos);
          const bDir = new THREE.Vector3().
          subVectors(playerPos, bluePos).
          normalize();
          projectiles.push(
            new Projectile(
              scene,
              bluePos,
              bDir,
              25,
              this.damage,
              true,
              0x3b82f6,
              'freeze_stack'
            )
          );
        }, 500);
      }

      if (
      this.phase >= 2 &&
      this.specialTimer > ((this.phase === 3 ? 0.5 : 1.0) / ENEMY_RANGED_FIRE_RATE_MULT))
      {
        this.specialTimer = 0;
        // Green Head (Toxic spray)
        const greenPos = new THREE.Vector3();
        this.heads[2].getWorldPosition(greenPos);

        for (let i = 0; i < (this.phase === 3 ? 8 : 5); i++) {
          const spread = (Math.random() - 0.5) * 1.5;
          const dir = new THREE.Vector3().
          subVectors(playerPos, greenPos).
          normalize();
          dir.applyAxisAngle(new THREE.Vector3(0, 1, 0), spread);
          projectiles.push(
            new Projectile(
              scene,
              greenPos,
              dir,
              10,
              this.damage * 0.6,
              true,
              0x22c55e
            )
          );
        }
      }
    }
  }

  private updateGolemBoss(
    dt: number,
    playerPos: THREE.Vector3,
    scene: THREE.Scene,
    projectiles: Projectile[],
    hpRatio: number
  ) {
    const time = Date.now() * 0.001;

    // Update hit flash timer
    if (this.hitFlashTimer > 0) {
      this.hitFlashTimer -= dt;
      if (this.hitFlashTimer <= 0 && this.bodyMesh) {
        (this.bodyMesh.material as THREE.MeshStandardMaterial).color.setHex(
          this.phase === 2 ? 0xffff00 : (this.phase === 3 ? 0xff0000 : this.originalBodyColor)
        );
      }
    }

    // Phase transitions
    if (hpRatio <= 0.66 && this.phase === 1) {
      this.transitionToPhase2();
    } else if (hpRatio <= 0.33 && this.phase === 2) {
      this.transitionToPhase3();
    }

    // Phase-specific logic
    switch (this.phase) {
      case 1:
        this.updatePhase1(dt, playerPos, scene, projectiles);
        break;
      case 2:
        this.updatePhase2(dt, playerPos, scene, projectiles, time);
        break;
      case 3:
        this.updatePhase3(dt, playerPos, scene, projectiles, time);
        break;
    }
  }

  private transitionToPhase2() {
    this.phase = 2;

    // Change body color to yellow
    if (this.bodyMesh) {
      (this.bodyMesh.material as THREE.MeshStandardMaterial).color.setHex(0xffff00);
    }

    // Show arena-wide aura (whitish for slow effect)
    if (this.aura) {
      (this.aura.material as THREE.MeshBasicMaterial).color.setHex(0xffffff);
      (this.aura.material as THREE.MeshBasicMaterial).opacity = 0.3;
    }

    // Apply slow effect to boss
    this.speed = 1.5; // Slower movement in Phase 2
  }

  private transitionToPhase3() {
    this.phase = 3;
    this.isImmune = true;
    this.speed = 0; // Stop moving
    this.phase3GolemsSpawned = 0;
    this.phase3GolemSpawnTimer = 0;

    // Change body color to red
    if (this.bodyMesh) {
      (this.bodyMesh.material as THREE.MeshStandardMaterial).color.setHex(0xff0000);
    }

    // Change health bar to red
    if (this.hpBarForeground) {
      (this.hpBarForeground.material as THREE.MeshBasicMaterial).color.setHex(0xff0000);
    }

    // Change aura to red
    if (this.aura) {
      (this.aura.material as THREE.MeshBasicMaterial).color.setHex(0xff0000);
      (this.aura.material as THREE.MeshBasicMaterial).opacity = 0.5;
    }

    // Remove old decorative blocks
    this.blocks.forEach((block: any) => {
      this.mesh.remove(block);
    });
    this.blocks = [];

    // Signal GameEngine to spawn block enemies
    (this as any).shouldSpawnPhase3Blocks = true;
  }

  private updatePhase1(
    dt: number,
    playerPos: THREE.Vector3,
    scene: THREE.Scene,
    projectiles: Projectile[]
  ) {
    // Animate spinning blocks around boss
    const time = Date.now() * 0.001;
    const radius = 5;
    this.blocks.forEach((block: any, i: number) => {
      const angle = time + i * Math.PI * 2 / 4;
      block.position.set(
        Math.cos(angle) * radius,
        2.5 + Math.sin(time * 3 + i) * 0.3,
        Math.sin(angle) * radius
      );
      block.rotation.x += dt;
      block.rotation.y += dt;
    });

    // Random localized AoE attack
    this.aoeAttackTimer += dt;
    if (this.aoeAttackTimer > 4) {
      this.aoeAttackTimer = 0;
      this.performAoEAttack(scene, projectiles);
    }
  }

  private updatePhase2(
    dt: number,
    playerPos: THREE.Vector3,
    scene: THREE.Scene,
    projectiles: Projectile[],
    time: number
  ) {
    // Animate spinning blocks around boss
    const radius = 5;
    this.blocks.forEach((block: any, i: number) => {
      const angle = time * 1.5 + i * Math.PI * 2 / 4;
      block.position.set(
        Math.cos(angle) * radius,
        2.5 + Math.sin(time * 3 + i) * 0.3,
        Math.sin(angle) * radius
      );
      block.rotation.x += dt;
      block.rotation.y += dt;
    });

    // Big AoE attack that slows player
    this.aoeAttackTimer += dt;
    if (this.aoeAttackTimer > 5) {
      this.aoeAttackTimer = 0;
      this.performBigAoEAttack(scene, projectiles);
    }

    // Blocks fire projectiles at player
    this.blockProjectileTimer += dt;
    if (this.blockProjectileTimer > 2) {
      this.blockProjectileTimer = 0;
      this.blocks.forEach((block: any) => {
        const spawnPos = new THREE.Vector3();
        block.getWorldPosition(spawnPos);
        const dir = new THREE.Vector3().subVectors(playerPos, spawnPos).normalize();
        projectiles.push(
          new Projectile(
            scene,
            spawnPos,
            dir,
            15,
            this.damage,
            true,
            0xffff00
          )
        );
      });
    }
  }

  private updatePhase3(
    dt: number,
    playerPos: THREE.Vector3,
    scene: THREE.Scene,
    projectiles: Projectile[],
    time: number
  ) {
    // Spawn 3 golems in Phase 3
    this.phase3GolemSpawnTimer += dt;
    if (this.phase3GolemsSpawned < 3 && this.phase3GolemSpawnTimer > 2) {
      this.phase3GolemSpawnTimer = 0;
      this.phase3GolemsSpawned++;
      // GameEngine will handle actual spawning via callback
      (this as any).shouldSpawnPhase3Golem = true;
    }

    // Boss fires AoE attacks like in Phase 1
    this.aoeAttackTimer += dt;
    if (this.aoeAttackTimer > 4) {
      this.aoeAttackTimer = 0;
      this.performAoEAttack(scene, projectiles);
    }

    // Blocks are now Enemy entities and handle their own projectile firing
  }

  private performAoEAttack(scene: THREE.Scene, projectiles: Projectile[]) {
    // Create localized AoE damage around boss
    const spawnPos = this.mesh.position.clone();
    spawnPos.y = 0.5;

    // Fire projectiles in all directions (localized)
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const dir = new THREE.Vector3(Math.cos(angle), 0, Math.sin(angle));
      projectiles.push(
        new Projectile(
          scene,
          spawnPos,
          dir,
          10,
          this.damage * 0.8,
          true,
          0x06b6d4
        )
      );
    }
  }

  private performBigAoEAttack(scene: THREE.Scene, projectiles: Projectile[]) {
    // Big AoE attack in Phase 2 - creates a large slow field
    const spawnPos = this.mesh.position.clone();
    spawnPos.y = 0.5;

    // Fire projectiles in all directions with wider spread
    for (let i = 0; i < 24; i++) {
      const angle = (i / 24) * Math.PI * 2;
      const dir = new THREE.Vector3(Math.cos(angle), 0, Math.sin(angle));
      const proj = new Projectile(
        scene,
        spawnPos,
        dir,
        8,
        this.damage * 0.5,
        true,
        0xffff00
      );
      // Mark as slow projectile
      (proj as any).specialAttribute = 'slow_aura';
      projectiles.push(proj);
    }
  }

  public takeDamage(amount: number): boolean {
    if (!this.active) return false;
    if (this.isImmune) return false; // Cannot damage when immune

    const died = super.takeDamage(amount);

    // Hit feedback for Golem boss
    if (this.type === 'Boss_Golem' && !died) {
      this.onHit();
    }

    return died;
  }

  private onHit() {
    // Flash body white, then restore to phase color
    if (this.bodyMesh) {
      const originalColor = this.phase === 1 ? 0x475569 : (this.phase === 2 ? 0xffff00 : 0xff0000);
      (this.bodyMesh.material as THREE.MeshStandardMaterial).color.setHex(0xffffff);
      setTimeout(() => {
        if (this.active && this.bodyMesh) {
          (this.bodyMesh.material as THREE.MeshStandardMaterial).color.setHex(originalColor);
        }
      }, 100);
    }

    // Flash aura white in Phase 2
    if (this.phase === 2 && this.aura) {
      (this.aura.material as THREE.MeshBasicMaterial).color.setHex(0xffffff);
      setTimeout(() => {
        if (this.active && this.phase === 2 && this.aura) {
          (this.aura.material as THREE.MeshBasicMaterial).color.setHex(0xffffff); // Back to white
        }
      }, 100);
    }
  }

  private blocksDestroyed: number = 0;

  public destroyBlock(blockIndex: number) {
    if (this.phase !== 3) return;
    this.blocksDestroyed++;
    // Check if all 4 blocks destroyed - make boss vulnerable and restore movement
    if (this.blocksDestroyed >= 4) {
      this.isImmune = false;
      this.speed = 3; // Restore normal movement speed
    }
  }

  public damageBlock(blockIndex: number, amount: number): boolean {
    if (this.phase !== 3) return false;
    if (blockIndex >= 0 && blockIndex < this.blocks.length) {
      const block = this.blocks[blockIndex];
      const userData = (block as any).userData;
      userData.health -= amount;

      // Update block HP bar
      if (userData.hpBarForeground) {
        const hpRatio = userData.health / userData.maxHealth;
        (userData.hpBarForeground as any).scale.x = hpRatio;
      }

      // Check if block destroyed
      if (userData.health <= 0) {
        this.destroyBlock(blockIndex);
        return true;
      }
    }
    return false;
  }

  public getBlocks(): any[] {
    return this.blocks;
  }


  public getReflectDamageMultiplier(): number {
    if (this.type === 'Boss_Golem') {
      return 0.5; // 50% damage reflection
    }
    return 0;
  }

  public updateHPBar(camera: any) {
    if (!this.active) return;

    // Scale foreground based on HP
    const hpRatio = Math.max(0, this.hp / this.maxHp);
    (this.hpBarForeground as any).scale.x = hpRatio;

    // For Golem boss, color based on phase instead of HP ratio
    if (this.type === 'Boss_Golem') {
      const mat = this.hpBarForeground.material as any;
      if (this.phase === 1) {
        mat.color.setHex(0x22c55e); // Green in Phase 1
      } else if (this.phase === 2) {
        mat.color.setHex(0xffff00); // Yellow in Phase 2
      } else if (this.phase === 3) {
        mat.color.setHex(0xff0000); // Red in Phase 3
      }
    } else {
      // Default HP color logic for other bosses
      const mat = this.hpBarForeground.material as any;
      if (hpRatio > 0.5)
        mat.color.setHex(0x22c55e); // Green
      else if (hpRatio > 0.2)
        mat.color.setHex(0xeab308); // Yellow
      else mat.color.setHex(0xef4444); // Red
    }

    // Make HP bar face camera
    (this.hpBarGroup as any).quaternion.copy(camera.quaternion);
  }
}