import * as THREE from 'three';
import { EnemyType } from './types';
import { Projectile } from './Projectile';
import { ENEMY_RANGED_FIRE_RATE_MULT } from './Balance';

export class Enemy {
  public mesh: any;
  public type: EnemyType;
  public hp: number;
  public maxHp: number;
  public damage: number;
  public speed: number;
  public active: boolean = true;

  public chillStacks: number = 0;
  public freezeTimer: number = 0;

  private attackCooldown: number = 0;
  private knockbackVelocity: any = new THREE.Vector3();
  private time: number = 0;

  private hpBarGroup: any;
  private hpBarForeground: any;

  constructor(
  scene: any,
  type: EnemyType,
  position: any,
  waveMultiplier: number)
  {
    this.type = type;
    this.mesh = new THREE.Group();
    this.mesh.position.copy(position);

    // HP Bar setup
    this.hpBarGroup = new THREE.Group();
    this.hpBarGroup.position.y = 2.5;

    const bgGeo = new THREE.PlaneGeometry(1.2, 0.15);
    const bgMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      depthTest: false
    });
    const bgMesh = new THREE.Mesh(bgGeo, bgMat);
    bgMesh.position.z = -0.01;

    const fgGeo = new THREE.PlaneGeometry(1.16, 0.11);
    const fgMat = new THREE.MeshBasicMaterial({
      color: 0xff0000,
      depthTest: false
    });
    this.hpBarForeground = new THREE.Mesh(fgGeo, fgMat);
    // Align left for scaling
    // translate exists on BufferGeometry in three; call defensively
    try {
      (fgGeo as any).translate(0.58, 0, 0);
    } catch (e) {
      // ignore if not present in the runtime geometry
    }
    this.hpBarForeground.position.x = -0.58;

    // Use dynamic calls to avoid strict type mismatches in local three.d.ts
    (this.hpBarGroup as any).add(bgMesh, this.hpBarForeground);
    (this.hpBarGroup as any).renderOrder = 999;
    (this.mesh as any).add(this.hpBarGroup);

    switch (type) {
      case 'Slime':
        this.hp = 30 * waveMultiplier;
        this.speed = 4;
        this.damage = 3 * waveMultiplier;

        const crystalGeo = new THREE.OctahedronGeometry(0.6);
        const crystalMat = new THREE.MeshStandardMaterial({
          color: 0x8b5cf6,
          emissive: 0xa855f7,
          emissiveIntensity: 0.5,
          roughness: 0.2,
          metalness: 0.8
        });
        const crystal = new THREE.Mesh(crystalGeo, crystalMat);
        crystal.position.y = 0.6;
        (this.mesh as any).add(crystal);
        break;

      case 'Mage':
        this.hp = 30 * waveMultiplier;
        this.speed = 3.5;
        this.damage = 10 * waveMultiplier;

        const cloakGeo = new THREE.ConeGeometry(0.6, 1.5, 8);
        const cloakMat = new THREE.MeshStandardMaterial({ color: 0x3b0764 });
        const cloak = new THREE.Mesh(cloakGeo, cloakMat);
        cloak.position.y = 1.5;

        const eyeGeo = new THREE.SphereGeometry(0.08, 8, 8);
        const eyeMat = new THREE.MeshStandardMaterial({
          color: 0xd946ef,
          emissive: 0xd946ef,
          emissiveIntensity: 2
        });
        const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
        leftEye.position.set(-0.15, 2.0, 0.4);
        const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
        rightEye.position.set(0.15, 2.0, 0.4);

        (this.mesh as any).add(cloak, leftEye, rightEye);
        break;

      case 'Golem':
        this.hp = 100 * waveMultiplier;
        this.speed = 3;
        this.damage = 10 * waveMultiplier;

        const bodyGeo = new THREE.BoxGeometry(1.5, 2, 1.5);
        const bodyMat = new THREE.MeshStandardMaterial({
          color: 0x64748b,
          roughness: 0.9
        });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.position.y = 1.0;

        // Energy cracks
        const crackMat = new THREE.MeshStandardMaterial({
          color: 0x06b6d4,
          emissive: 0x06b6d4,
          emissiveIntensity: 1.5
        });

        const crack1 = new THREE.Mesh(
          new THREE.BoxGeometry(1.6, 0.1, 0.1),
          crackMat
        );
        crack1.position.set(0, 1.2, 0.75);
        (crack1 as any).rotation.z = 0.2;

        const crack2 = new THREE.Mesh(
          new THREE.BoxGeometry(0.1, 0.8, 1.6),
          crackMat
        );
        crack2.position.set(0.75, 0.8, 0);
        (crack2 as any).rotation.x = -0.3;

        (this.mesh as any).add(body, crack1, crack2);
        break;
      case 'Bomber':
        this.hp = 20 * waveMultiplier;
        this.speed = 6;
        this.damage = 20 * waveMultiplier;

        const bombGeo = new THREE.SphereGeometry(0.5, 12, 12);
        const bombMat = new THREE.MeshStandardMaterial({
          color: 0xef4444,
          emissive: 0xff6b6b,
          emissiveIntensity: 1.5
        });
        const bomb = new THREE.Mesh(bombGeo, bombMat);
        bomb.position.y = 0.5;
        (this.mesh as any).add(bomb);
        break;
      default:
        // Fallback for bosses if instantiated via Enemy directly
        this.hp = 100;
        this.speed = 2;
        this.damage = 10;
        break;
    }

    this.maxHp = this.hp;
    (scene as any).add(this.mesh);
  }

  public updateHPBar(camera: any) {
    if (!this.active) return;

    // Scale foreground based on HP
    const hpRatio = Math.max(0, this.hp / this.maxHp);
    (this.hpBarForeground as any).scale.x = hpRatio;

    // Change color based on HP
    const mat = this.hpBarForeground.material as any;
    if (hpRatio > 0.5)
    mat.color.setHex(0x22c55e); // Green
    else if (hpRatio > 0.2)
    mat.color.setHex(0xeab308); // Yellow
    else mat.color.setHex(0xef4444); // Red

    // Billboard effect
    (this.hpBarGroup as any).quaternion.copy(camera.quaternion);
  }

  public update(
  dt: number,
  playerPos: THREE.Vector3,
  scene: THREE.Scene,
  projectiles: Projectile[])
  {
    if (!this.active) return;
    this.time += dt;

    // Animations
    if (this.type === 'Slime') {
      const crystal: any = (this.mesh as any).children[0];
      (crystal as any).rotation.y += dt * 2;
      (crystal as any).rotation.z += dt;
      crystal.position.y = 0.6 + Math.sin(this.time * 5) * 0.2;
    } else if (this.type === 'Mage') {
      this.mesh.position.y = Math.sin(this.time * 2) * 0.3;
    }

    // Apply knockback
    if ((this.knockbackVelocity as any).lengthSq && (this.knockbackVelocity as any).lengthSq() > 0.1) {
      (this.mesh as any).position.addScaledVector(this.knockbackVelocity, dt);
      try {
        (this.knockbackVelocity as any).lerp(new THREE.Vector3(0, 0, 0), 10 * dt);
      } catch (e) {
        // if lerp not available, fallback to damping
        (this.knockbackVelocity as any).multiplyScalar && (this.knockbackVelocity as any).multiplyScalar(0.9);
      }
    }

    if (this.freezeTimer > 0) {
      this.freezeTimer -= dt;
      if (this.freezeTimer <= 0) {
        this.chillStacks = 0;
        this.resetColors();
      }
      return; // Frozen, cannot move or attack
    }

    if (this.attackCooldown > 0) this.attackCooldown -= dt;

    const dir = new THREE.Vector3().subVectors(playerPos, this.mesh.position);
    const dist = dir.length();
    dir.normalize();

    this.mesh.lookAt(playerPos.x, this.mesh.position.y, playerPos.z);

    if (this.type === 'Mage') {
      if (dist > 10) {
        this.mesh.position.addScaledVector(dir, this.speed * dt);
      } else if (this.attackCooldown <= 0) {
        // Mage barrier: only melee damages them (projectiles from player should not hurt Mage)
        // Mage fires multiple projectiles in a spread; projectile scaling for enemies is applied in Projectile.ts
        this.attackCooldown = 1.2 / ENEMY_RANGED_FIRE_RATE_MULT; // faster firing (scaled)
        const spawnPos = this.mesh.position.clone();
        spawnPos.y = 1.5;
        // fire 3 bolts in a cone
        const spreads = [-0.18, 0, 0.18];
        for (const s of spreads) {
          const projDir = dir.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), s);
          projectiles.push(
            new Projectile(scene, spawnPos.clone(), projDir, 14, this.damage, true, 0xd946ef)
          );
        }
      }
    } else {
      // Melee
      this.mesh.position.addScaledVector(dir, this.speed * dt);
    }
  }

  public applyKnockback(force: number, sourcePos: THREE.Vector3) {
    const dir = new THREE.Vector3().
    subVectors(this.mesh.position, sourcePos).
    normalize();
    dir.y = 0;
    this.knockbackVelocity.add(dir.multiplyScalar(force));
  }

  public applyChill() {
    this.chillStacks++;
    if (this.chillStacks >= 3) {
      this.freezeTimer = 1.5;
      this.setColors(0x00ffff); // Cyan when frozen
    } else {
      // Slightly blue tint for chill
      this.mesh.traverse((child: any) => {
        if (child instanceof THREE.Mesh) {
          const mat = child.material as any;
          if (!mat.emissive || (mat.emissive as any).getHex && (mat.emissive as any).getHex() === 0x000000) {
            mat.color.lerp(new THREE.Color(0x00ffff), 0.3);
          }
        }
      });
    }
  }

  private setColors(hex: number) {
    this.mesh.traverse((child: any) => {
      if (child instanceof THREE.Mesh) {
        const mat = child.material as any;
        if (!mat.emissive || (mat.emissive as any).getHex && (mat.emissive as any).getHex() === 0x000000) {
          mat.color.setHex(hex);
        }
      }
    });
  }

  private resetColors() {
    let mainColor = 0xffffff;
    switch (this.type) {
      case 'Slime':
        mainColor = 0x8b5cf6;
        break;
      case 'Mage':
        mainColor = 0x3b0764;
        break;
      case 'Golem':
        mainColor = 0x64748b;
        break;
    }

    this.mesh.traverse((child: any) => {
      if (child instanceof THREE.Mesh) {
        const mat = child.material as any;
        if (!mat.emissive || (mat.emissive as any).getHex && (mat.emissive as any).getHex() === 0x000000) {
          mat.color.setHex(mainColor);
        }
      }
    });
  }

  public takeDamage(amount: number): boolean {
    this.hp -= amount;
    if (this.hp <= 0) {
      this.active = false;
      return true;
    }

    // Flash white on hit
    this.setColors(0xffffff);
    setTimeout(() => {
      if (this.active) this.resetColors();
    }, 100);

    return false;
  }

  public destroy(scene: THREE.Scene) {
    scene.remove(this.mesh);
    this.mesh.traverse((child: any) => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
        (child.material as THREE.Material).dispose();
      }
    });
  }
}