import * as THREE from 'three';
import { PlayerStats, Weapon, MeleeWeapon, StatType } from './types';
import { WEAPONS } from './WeaponSystem';
import { MELEE_WEAPONS } from './MeleeWeaponSystem';
import { Projectile } from './Projectile';

export class Player {
  public mesh: THREE.Group;
  public stats: PlayerStats;
  public weapon: Weapon;
  public meleeWeapon: MeleeWeapon;

  public isDashing: boolean = false;
  public isInvulnerable: boolean = false;
  public hasVampirism: boolean = false;
  public activeSkills: string[] = [];

  private dashDuration: number = 0;
  private iFrameDuration: number = 0;
  private shootCooldown: number = 0;
  private dashEnergyCost: number = 25;
  private meleeEnergyCost: number = 15;
  private energyRegenRate: number = 20; // energy per second

  public meleeKills: number = 0;
  public meleeCombo: number = 0;

  private baseSpeed = 8;
  private dashSpeed = 25;
  private time: number = 0;
  private armorPlates: THREE.Mesh[] = [];

  // Melee flash effect
  private meleeFlashMesh: THREE.Mesh;
  private meleeFlashTimer: number = 0;
  private readonly MELEE_FLASH_DURATION = 0.25;

  constructor(scene: THREE.Scene) {
    this.mesh = new THREE.Group();
    this.mesh.position.y = 0.75;

    // Body (Dark tunic)
    const bodyGeo = new THREE.CylinderGeometry(0.3, 0.4, 1.2, 8);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x1e293b });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.6;
    this.mesh.add(body);

    // Hood
    const hoodGeo = new THREE.SphereGeometry(0.35, 16, 16);
    const hoodMat = new THREE.MeshStandardMaterial({ color: 0x0f172a });
    const hood = new THREE.Mesh(hoodGeo, hoodMat);
    hood.position.y = 1.4;
    this.mesh.add(hood);

    // Glowing Eyes
    const eyeGeo = new THREE.SphereGeometry(0.05, 8, 8);
    const eyeMat = new THREE.MeshStandardMaterial({
      color: 0x00ffff,
      emissive: 0x00ffff,
      emissiveIntensity: 2
    });
    const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
    leftEye.position.set(-0.12, 1.4, 0.3);
    const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
    rightEye.position.set(0.12, 1.4, 0.3);
    this.mesh.add(leftEye, rightEye);

    // Cloak
    const cloakGeo = new THREE.ConeGeometry(0.4, 1.4, 8);
    const cloakMat = new THREE.MeshStandardMaterial({
      color: 0x020617,
      transparent: true,
      opacity: 0.9
    });
    const cloak = new THREE.Mesh(cloakGeo, cloakMat);
    cloak.position.set(0, 0.7, -0.2);
    cloak.rotation.x = -0.2;
    this.mesh.add(cloak);

    // Floating Armor Plates
    const plateGeo = new THREE.BoxGeometry(0.2, 0.4, 0.1);
    const plateMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.8,
      roughness: 0.2
    });

    for (let i = 0; i < 3; i++) {
      const plate = new THREE.Mesh(plateGeo, plateMat);
      this.armorPlates.push(plate);
      this.mesh.add(plate);
    }

    // Initialize weapons before creating melee arc mesh so arcAngle exists
    this.weapon = { ...WEAPONS[0] };
    this.meleeWeapon = { ...MELEE_WEAPONS[0] };

    // Melee Flash Effect (arc sector facing forward)
    this.meleeFlashMesh = this.createMeleeArcMesh();
    this.mesh.add(this.meleeFlashMesh);

    scene.add(this.mesh);

    this.stats = {
      hp: 150,
      maxHp: 150,
      atk: 10,
      def: 5,
      spd: 10,
      crit: 5,
      level: 1,
      exp: 0,
      maxExp: 100,
      gold: 0,
      statPoints: 0,
      energy: 100,
      maxEnergy: 100
    };

    // weapons were initialized earlier before creating the melee arc
  }

  private rebuildMeleeArcMesh() {
    // Remove old mesh
    this.mesh.remove(this.meleeFlashMesh);
    this.meleeFlashMesh.geometry.dispose();
    (this.meleeFlashMesh.material as THREE.Material).dispose();

    // Create new one with updated arc angle
    this.meleeFlashMesh = this.createMeleeArcMesh();
    this.mesh.add(this.meleeFlashMesh);
  }

  private createMeleeArcMesh(): THREE.Mesh {
    const segments = 24;
    const arcAngle = this.meleeWeapon.arcAngle;
    const halfArc = arcAngle / 2;

    // Create a pie/sector shape in the XZ plane
    // Forward is +Z in local space (where the character faces)
    const shape = new THREE.Shape();
    shape.moveTo(0, 0); // center

    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      // Angle goes from -halfArc to +halfArc, centered on +Z (which is angle 0 in our XZ mapping)
      const angle = -halfArc + t * arcAngle;
      // Map to XZ: x = sin(angle), z = cos(angle) so angle=0 points forward (+Z)
      const x = Math.sin(angle);
      const z = Math.cos(angle);
      shape.lineTo(x, z);
    }
    shape.lineTo(0, 0); // close back to center

    const geometry = new THREE.ShapeGeometry(shape);
    // Rotate so the shape lies flat on the ground (XZ plane)
    geometry.rotateX(Math.PI / 2);

    const material = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0,
      depthWrite: false
    });

    // Render on top of the player model so the visual isn't occluded
    material.depthTest = false;
    material.blending = THREE.AdditiveBlending;

    const mesh = new THREE.Mesh(geometry, material);
    // Place the visual a bit forward based on weapon range to align with damage area
    mesh.position.y = 0.3;
    mesh.position.z = Math.max(0.6, (this.meleeWeapon?.range ?? 1) * 0.5);
    mesh.scale.setScalar(0);
    mesh.renderOrder = 9999;
    return mesh;
  }

  public update(dt: number, moveDir: THREE.Vector3, lookTarget: THREE.Vector3) {
    this.time += dt;

    // Hover animation
    this.mesh.position.y = 0.75 + Math.sin(this.time * 3) * 0.1;

    // Armor plates orbit
    this.armorPlates.forEach((plate, i) => {
      const angle = this.time * 2 + i * Math.PI * 2 / 3;
      plate.position.set(
        Math.cos(angle) * 0.6,
        0.8 + Math.sin(this.time * 4 + i) * 0.1,
        Math.sin(angle) * 0.6
      );
      plate.lookAt(this.mesh.position.x, plate.position.y, this.mesh.position.z);
    });

    // Timers
    if (this.shootCooldown > 0) this.shootCooldown -= dt;
    
    // Energy regeneration
    if (this.stats.energy < this.stats.maxEnergy) {
      this.stats.energy = Math.min(this.stats.maxEnergy, this.stats.energy + this.energyRegenRate * dt);
    }

    // Melee flash animation
    if (this.meleeFlashTimer > 0) {
      this.meleeFlashTimer -= dt;
      const progress = 1 - this.meleeFlashTimer / this.MELEE_FLASH_DURATION;
      const mat = this.meleeFlashMesh.material as THREE.MeshBasicMaterial;
      // Expand outward and fade
      const targetScale = this.meleeWeapon.range;
      this.meleeFlashMesh.scale.setScalar(progress * targetScale);
      mat.opacity = (1 - progress) * 0.7;
      if (this.meleeFlashTimer <= 0) {
        mat.opacity = 0;
        this.meleeFlashMesh.scale.setScalar(0);
      }
    }

    if (this.isDashing) {
      this.dashDuration -= dt;
      if (this.dashDuration <= 0) this.isDashing = false;
    }

    if (this.isInvulnerable) {
      this.iFrameDuration -= dt;
      if (this.iFrameDuration <= 0) {
        this.isInvulnerable = false;
        this.setTransparency(false, 1);
      }
    }

    // Movement
    const speed = this.isDashing ?
    this.dashSpeed :
    this.baseSpeed * (1 + this.stats.spd / 100);
    if (moveDir.lengthSq() > 0) {
      this.mesh.position.addScaledVector(moveDir.normalize(), speed * dt);
    }

    // Keep on platform (radius 45)
    const distFromCenter = Math.sqrt(
      this.mesh.position.x ** 2 + this.mesh.position.z ** 2
    );
    if (distFromCenter > 45) {
      const angle = Math.atan2(this.mesh.position.z, this.mesh.position.x);
      this.mesh.position.x = Math.cos(angle) * 45;
      this.mesh.position.z = Math.sin(angle) * 45;
    }

    // Rotation
    this.mesh.lookAt(lookTarget.x, this.mesh.position.y, lookTarget.z);
  }

  public triggerMeleeVisual() {
    // Rebuild arc if weapon changed
    this.rebuildMeleeArcMesh();

    // Debug: log mesh properties to verify render settings
    // (will appear in browser console when melee is triggered)
    // eslint-disable-next-line no-console
    console.log('meleeFlashMesh properties', {
      position: this.meleeFlashMesh.position.clone(),
      renderOrder: this.meleeFlashMesh.renderOrder,
      depthTest: (this.meleeFlashMesh.material as any).depthTest,
      depthWrite: (this.meleeFlashMesh.material as any).depthWrite,
      blending: (this.meleeFlashMesh.material as any).blending
    });

    const mat = this.meleeFlashMesh.material as THREE.MeshBasicMaterial;
    const weaponColor = parseInt(this.meleeWeapon.color.replace('#', '0x'));
    mat.color.setHex(weaponColor);
    mat.opacity = 0.7;
    this.meleeFlashMesh.scale.setScalar(0.1);
    this.meleeFlashTimer = this.MELEE_FLASH_DURATION;
  }

  public dash(moveDir: THREE.Vector3) {
    if (this.stats.energy >= this.dashEnergyCost) {
      this.stats.energy -= this.dashEnergyCost;
      this.isDashing = true;
      this.isInvulnerable = true;
      this.dashDuration = 0.2;
      this.iFrameDuration = 0.3;
      this.setTransparency(true, 0.3);
    }
  }

  private setTransparency(transparent: boolean, opacity: number) {
    this.mesh.traverse((child: any) => {
      if (child instanceof THREE.Mesh) {
        const mat = child.material as THREE.MeshStandardMaterial;
        if (mat.emissive && mat.emissive.getHex() === 0x00ffff) {
          // Boost emissive for eyes during dash
          mat.emissiveIntensity = transparent ? 5 : 2;
        } else {
          mat.transparent = transparent;
          mat.opacity = opacity;
        }
      }
    });
  }

  public shoot(scene: THREE.Scene, projectiles: Projectile[]) {
    if (this.shootCooldown <= 0) {
      this.shootCooldown = 1 / this.weapon.fireRate;

      const dir = new THREE.Vector3(0, 0, 1).
      applyQuaternion(this.mesh.quaternion).
      normalize();
      const spawnPos = this.mesh.position.
      clone().
      add(dir.clone().multiplyScalar(1));
      spawnPos.y = 1;

      // Calculate damage with ATK multiplier and Crit
      let dmg = this.weapon.damage * (1 + this.stats.atk / 100);

      let critChance = this.stats.crit;
      if (this.weapon.specialAttribute === 'high_accuracy') {
        critChance += 15;
      }

      if (Math.random() * 100 < critChance) {
        dmg *= 2; // Crit
      }

      const spreadAngle = this.weapon.spread ?? 0.1;

      for (let i = 0; i < this.weapon.projectileCount; i++) {
        const spread =
        this.weapon.projectileCount > 1 ?
        (i - (this.weapon.projectileCount - 1) / 2) * spreadAngle :
        (Math.random() - 0.5) * spreadAngle;

        const projDir = dir.
        clone().
        applyAxisAngle(new THREE.Vector3(0, 1, 0), spread);

        projectiles.push(
          new Projectile(
            scene,
            spawnPos,
            projDir,
            this.weapon.projectileSpeed,
            dmg,
            false,
            parseInt(this.weapon.color.replace('#', '0x')),
            this.weapon.specialAttribute,
            this.weapon.knockback || 0,
            this.weapon.specialAttribute === 'chain_reaction' ? 1 : 0
          )
        );
      }
    }
  }

  public takeDamage(amount: number): boolean {
    if (this.isInvulnerable) return false;

    const actualDamage = Math.max(1, amount * (1 - this.stats.def / 100));
    this.stats.hp -= actualDamage;
    return this.stats.hp <= 0;
  }

  public addExp(amount: number): boolean {
    this.stats.exp += amount;
    let leveledUp = false;
    while (this.stats.exp >= this.stats.maxExp) {
      this.stats.exp -= this.stats.maxExp;
      this.stats.level++;
      this.stats.maxExp = 100 * this.stats.level;
      this.stats.statPoints += 2;
      this.stats.hp = this.stats.maxHp; // Heal on level up
      leveledUp = true;
    }
    return leveledUp;
  }

  public applySkill(skillId: string) {
    if (this.activeSkills.includes(skillId)) return;
    this.activeSkills.push(skillId);

    switch (skillId) {
      case 's1': // Multishot
        this.weapon.projectileCount += 1;
        break;
      case 's2': // Vampirism
        this.hasVampirism = true;
        break;
      case 's3': // Swiftness
        this.baseSpeed *= 1.2;
        break;
      case 's4': // Juggernaut
        this.stats.maxHp += 50;
        this.stats.hp += 50;
        break;
      case 's5': // Critical Surge
        this.stats.crit += 10;
        break;
    }
  }

  public allocateStat(stat: StatType) {
    if (this.stats.statPoints > 0) {
      this.stats.statPoints--;
      switch (stat) {
        case 'ATK':
          this.stats.atk += 5;
          break;
        case 'DEF':
          this.stats.def += 5;
          break;
        case 'SPD':
          this.stats.spd += 5;
          break;
        case 'HP':
          this.stats.maxHp += 20;
          this.stats.hp += 20;
          break;
        case 'CRIT':
          this.stats.crit += 2;
          break;
      }
    }
  }

  public getEnergyRatio(): number {
    return this.stats.energy / this.stats.maxEnergy;
  }

  public canUseMelee(): boolean {
    return this.stats.energy >= this.meleeEnergyCost;
  }

  public useMeleeEnergy(): void {
    this.stats.energy -= this.meleeEnergyCost;
  }
}