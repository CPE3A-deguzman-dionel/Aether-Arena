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

  constructor(
  scene: THREE.Scene,
  type: EnemyType,
  position: THREE.Vector3,
  waveMultiplier: number)
  {
    super(scene, type, position, waveMultiplier);

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
    const auraGeo = new THREE.RingGeometry(14.5, 15, 64);
    const auraMat = new THREE.MeshBasicMaterial({
      color: 0xff3300,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.5,
      depthWrite: false
    });
    this.aura = new THREE.Mesh(auraGeo, auraMat);
    this.aura.rotation.x = -Math.PI / 2;
    this.aura.position.y = 0.1; // Slightly above ground
    this.mesh.add(this.aura);
  }

  private buildVisuals() {
    // Remove default mesh children (except HP bar which is at index 0)
    const hpBar = this.mesh.children[0];
    this.mesh.clear();
    this.mesh.add(hpBar);

    if (this.type === 'Boss_Golem') {
      hpBar.position.y = 4.5;

      // Body
      const bodyGeo = new THREE.BoxGeometry(2.5, 3.5, 2.5);
      const bodyMat = new THREE.MeshStandardMaterial({
        color: 0x475569,
        roughness: 0.9
      });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      body.position.y = 1.75;

      // Glowing core
      const coreGeo = new THREE.SphereGeometry(0.8, 16, 16);
      const coreMat = new THREE.MeshStandardMaterial({
        color: 0x06b6d4,
        emissive: 0x06b6d4,
        emissiveIntensity: 2
      });
      const core = new THREE.Mesh(coreGeo, coreMat);
      core.position.set(0, 2, 1);

      this.mesh.add(body, core);

      // 3 Floating Heads
      const headGeo = new THREE.BoxGeometry(1, 1, 1);
      const headMat = new THREE.MeshStandardMaterial({ color: 0x334155 });
      for (let i = 0; i < 3; i++) {
        const head = new THREE.Mesh(headGeo, headMat);
        this.heads.push(head);
        this.mesh.add(head);
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
      // Animate heads
      const radius = this.phase === 1 ? 2.5 : 4.5;
      const speed = this.phase === 1 ? 1 : 3;
      this.heads.forEach((head: any, i: number) => {
        const angle = time * speed + i * Math.PI * 2 / 3;
        head.position.set(
          Math.cos(angle) * radius,
          2.5 + Math.sin(time * 2 + i) * 0.5,
          Math.sin(angle) * radius
        );
        // use explicit coordinates to satisfy different lookAt signatures
        head.lookAt(playerPos.x, playerPos.y, playerPos.z);
      });

      // Phase 1: Shockwaves (simulated with fast wide projectiles)
      if (this.phase === 1 && this.specialTimer > 3.0 / ENEMY_RANGED_FIRE_RATE_MULT) {
        this.specialTimer = 0;
        // Fire 12 projectiles in a circle
        for (let i = 0; i < 12; i++) {
          const angle = i * Math.PI * 2 / 12;
          const dir = new THREE.Vector3(Math.cos(angle), 0, Math.sin(angle));
          const spawnPos = this.mesh.position.clone();
          spawnPos.y = 0.5;
          projectiles.push(
            new Projectile(
              scene,
              spawnPos,
              dir,
              15,
              this.damage,
              true,
              0x06b6d4,
              'spread_knockback',
              10
            )
          );
        }
      }

      // Phase 2: Beams from heads
      if (
      this.phase >= 2 &&
      this.specialTimer > ((this.phase === 3 ? 1.0 : 1.5) / ENEMY_RANGED_FIRE_RATE_MULT))
      {
        this.specialTimer = 0;
        this.heads.forEach((head) => {
          const spawnPos = new THREE.Vector3();
          head.getWorldPosition(spawnPos);
          const dir = new THREE.Vector3().
          subVectors(playerPos, spawnPos).
          normalize();
          projectiles.push(
            new Projectile(
              scene,
              spawnPos,
              dir,
              20,
              this.damage * 0.8,
              true,
              0x06b6d4
            )
          );
        });
      }

      // Phase 3: Constant shockwaves
      if (this.phase === 3 && Math.random() < 0.05 * ENEMY_RANGED_FIRE_RATE_MULT) {
        const angle = Math.random() * Math.PI * 2;
        const dir = new THREE.Vector3(Math.cos(angle), 0, Math.sin(angle));
        const spawnPos = this.mesh.position.clone();
        spawnPos.y = 0.5;
        projectiles.push(
          new Projectile(
            scene,
            spawnPos,
            dir,
            18,
            this.damage,
            true,
            0xff0000,
            'spread_knockback',
            15
          )
        );
      }
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
}