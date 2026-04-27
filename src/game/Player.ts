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
  public weaponInventory: Weapon[] = [];
  public meleeWeaponInventory: MeleeWeapon[] = [];

  public isDashing: boolean = false;
  public isInvulnerable: boolean = false;
  public hasVampirism: boolean = false;
  public activeSkills: string[] = [];

  private dashDuration: number = 0;
  private iFrameDuration: number = 0;
  private shootCooldown: number = 0;
  private meleeCooldown: number = 0;
  private dashEnergyCost: number = 25;
  private meleeEnergyCost: number = 15;
  private shootEnergyCost: number = 2;

  public meleeKills: number = 0;
  public meleeCombo: number = 0;

  private baseSpeed = 8;
  private dashSpeed = 25;
  private time: number = 0;
  private armorPlates: THREE.Mesh[] = [];
  private currentLevelAllocations: StatType[] = [];
  public unlimitedEnergy: boolean = false;
  private slowEffect: number = 0; // 0 = no slow, 0.5 = 50% slow
  private speedBoostTimer: number = 0; // Duration of speed boost
  private speedBoostMultiplier: number = 1; // Speed boost multiplier

  // Weapon meshes for left (ranged) and right (melee) hands
  private leftWeaponMesh: THREE.Mesh;
  private rightWeaponMesh: THREE.Mesh;
  private swingTimer: number = 0;
  private readonly SWING_DURATION = 0.3;
  private slashMesh: THREE.Mesh;
  private slashTimer: number = 0;
  private readonly SLASH_DURATION = 0.2;

  constructor(scene: THREE.Scene) {
    this.mesh = new THREE.Group();
    this.mesh.position.y = 0.75;

    // Human body - torso
    const torsoGeo = new THREE.CylinderGeometry(0.25, 0.3, 0.8, 8);
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xffdbac });
    const torso = new THREE.Mesh(torsoGeo, skinMat);
    torso.position.y = 0.9;
    this.mesh.add(torso);

    // Head
    const headGeo = new THREE.SphereGeometry(0.25, 16, 16);
    const head = new THREE.Mesh(headGeo, skinMat);
    head.position.y = 1.5;
    this.mesh.add(head);

    // Hair
    const hairGeo = new THREE.SphereGeometry(0.26, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const hairMat = new THREE.MeshStandardMaterial({ color: 0x4a3728 });
    const hair = new THREE.Mesh(hairGeo, hairMat);
    hair.position.y = 1.55;
    this.mesh.add(hair);

    // Eyes
    const eyeGeo = new THREE.SphereGeometry(0.04, 8, 8);
    const eyeMat = new THREE.MeshStandardMaterial({ color: 0x3d2314 });
    const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
    leftEye.position.set(-0.08, 1.52, 0.22);
    const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
    rightEye.position.set(0.08, 1.52, 0.22);
    this.mesh.add(leftEye, rightEye);

    // Arms
    const armGeo = new THREE.CylinderGeometry(0.08, 0.07, 0.6, 8);
    const leftArm = new THREE.Mesh(armGeo, skinMat);
    leftArm.position.set(-0.35, 0.85, 0);
    leftArm.rotation.z = 0.2;
    this.mesh.add(leftArm);

    const rightArm = new THREE.Mesh(armGeo, skinMat);
    rightArm.position.set(0.35, 0.85, 0);
    rightArm.rotation.z = -0.2;
    this.mesh.add(rightArm);

    // Legs
    const legGeo = new THREE.CylinderGeometry(0.1, 0.08, 0.7, 8);
    const pantsMat = new THREE.MeshStandardMaterial({ color: 0x2c3e50 });
    const leftLeg = new THREE.Mesh(legGeo, pantsMat);
    leftLeg.position.set(-0.12, 0.35, 0);
    this.mesh.add(leftLeg);

    const rightLeg = new THREE.Mesh(legGeo, pantsMat);
    rightLeg.position.set(0.12, 0.35, 0);
    this.mesh.add(rightLeg);

    // Cloak
    const cloakGeo = new THREE.ConeGeometry(0.45, 1.5, 8);
    const cloakMat = new THREE.MeshStandardMaterial({
      color: 0x1a1a2e,
      transparent: true,
      opacity: 0.9
    });
    const cloak = new THREE.Mesh(cloakGeo, cloakMat);
    cloak.position.set(0, 0.7, -0.2);
    cloak.rotation.x = -0.2;
    this.mesh.add(cloak);

    // Initialize weapons before creating melee arc mesh so arcAngle exists
    this.weapon = { ...WEAPONS.find(w => w.id === 'w_daggers') || WEAPONS[0] };
    this.meleeWeapon = { ...MELEE_WEAPONS.find(w => w.id === 'm_greatsword') || MELEE_WEAPONS[0] };
    // Initialize weapon inventories with all weapons
    this.weaponInventory = [this.weapon];
    this.meleeWeaponInventory = [this.meleeWeapon];

    // Create left hand weapon (ranged - dagger style)
    const leftWeaponGeo = new THREE.BoxGeometry(0.05, 0.05, 0.4);
    const leftWeaponMat = new THREE.MeshStandardMaterial({ color: 0xc0c0c0 });
    this.leftWeaponMesh = new THREE.Mesh(leftWeaponGeo, leftWeaponMat);
    this.leftWeaponMesh.position.set(-0.4, 0.8, 0.3);
    this.leftWeaponMesh.rotation.x = Math.PI / 6;
    this.mesh.add(this.leftWeaponMesh);

    // Create right hand weapon (melee - sword style)
    const rightWeaponGeo = new THREE.BoxGeometry(0.08, 0.08, 1.0);
    const rightWeaponMat = new THREE.MeshStandardMaterial({ color: 0xd4af37 });
    this.rightWeaponMesh = new THREE.Mesh(rightWeaponGeo, rightWeaponMat);
    this.rightWeaponMesh.position.set(0.4, 0.8, 0.3);
    this.rightWeaponMesh.rotation.x = Math.PI / 4;
    this.mesh.add(this.rightWeaponMesh);

    // Create slash effect mesh (add to player mesh to inherit rotation)
    this.slashMesh = this.createSlashMesh();
    this.mesh.add(this.slashMesh);

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
      maxEnergy: 100,
      energyRegen: 10,
      healthRegen: 1,
      consumableSlots: [
        { consumable: null, lastUsed: 0 },
        { consumable: null, lastUsed: 0 },
        { consumable: null, lastUsed: 0 }
      ]
    };

    // weapons were initialized earlier before creating the melee arc
  }

  private createSlashMesh(): THREE.Mesh {
    // Create a narrow fan (30° wide) that will sweep across the full 180° arc
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    // Create narrow fan from -15° to +15°
    for (let i = 0; i <= 10; i++) {
      const t = i / 10;
      const angle = -Math.PI / 12 + t * Math.PI / 6;
      const x = Math.sin(angle) * this.meleeWeapon.range;
      const z = Math.cos(angle) * this.meleeWeapon.range;
      shape.lineTo(x, z);
    }
    shape.lineTo(0, 0);

    const geometry = new THREE.ShapeGeometry(shape);
    geometry.rotateX(Math.PI / 2);

    const material = new THREE.MeshBasicMaterial({
      color: 0x00ff00, // Green slash
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      depthTest: false,
      blending: THREE.AdditiveBlending
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.y = 0.5;
    mesh.position.z = 0.5;
    mesh.scale.setScalar(0); // Start with zero scale to hide it
    (mesh as any).renderOrder = 10000;
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
    if (this.meleeCooldown > 0) this.meleeCooldown -= dt;

    // Energy regeneration
    if (this.stats.energy < this.stats.maxEnergy) {
      this.stats.energy = Math.min(this.stats.maxEnergy, this.stats.energy + this.stats.energyRegen * dt);
    }
    this.stats.hp = Math.min(this.stats.maxHp, this.stats.hp + this.stats.healthRegen * dt);

    // Weapon swing animation (right hand melee weapon) - left to right
    if (this.swingTimer > 0) {
      this.swingTimer -= dt;
      const swingProgress = 1 - this.swingTimer / this.SWING_DURATION;
      // Swing arc: start left (-90°), swing right to +90°
      const swingAngle = -Math.PI / 2 + swingProgress * Math.PI;
      this.rightWeaponMesh.rotation.y = swingAngle;
      this.rightWeaponMesh.rotation.x = Math.PI / 4 + Math.sin(swingProgress * Math.PI) * 0.3;
      if (this.swingTimer <= 0) {
        this.rightWeaponMesh.rotation.y = 0;
        this.rightWeaponMesh.rotation.x = Math.PI / 4;
      }
    }

    // Slash animation
    if (this.slashTimer > 0) {
      this.slashTimer -= dt;
      const slashProgress = 1 - this.slashTimer / this.SLASH_DURATION;
      const mat = this.slashMesh.material as THREE.MeshBasicMaterial;

      // Scale up the slash as it sweeps
      this.slashMesh.scale.x = slashProgress;
      this.slashMesh.scale.y = slashProgress;
      this.slashMesh.scale.z = slashProgress;

      // Animate sweep from left to right (local rotation since mesh is child of player)
      // The narrow fan (30°) sweeps from -90° to +90° to cover the full arc
      // Start at -90° - 15° = -105°, end at +90° + 15° = +105°
      this.slashMesh.rotation.y = -Math.PI * 7 / 12 + slashProgress * Math.PI * 7 / 6;

      mat.opacity = (1 - slashProgress) * 0.8;
      if (this.slashTimer <= 0) {
        mat.opacity = 0;
        this.slashMesh.scale.x = 0;
        this.slashMesh.scale.y = 0;
        this.slashMesh.scale.z = 0;
        this.slashMesh.rotation.y = 0;
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

    // Speed boost timer
    if (this.speedBoostTimer > 0) {
      this.speedBoostTimer -= dt;
      if (this.speedBoostTimer <= 0) {
        this.speedBoostMultiplier = 1;
      }
    }

    // Movement
    const speed = this.isDashing ?
    this.dashSpeed :
    this.baseSpeed * (1 + this.stats.spd / 100) * (1 - this.slowEffect) * this.speedBoostMultiplier;
    if (moveDir.lengthSq() > 0) {
      this.mesh.position.addScaledVector(moveDir.normalize(), speed * dt);
    }

    // Keep within square arena bounds (50 units from center)
    const arenaHalfSize = 50;
    this.mesh.position.x = Math.max(-arenaHalfSize, Math.min(arenaHalfSize, this.mesh.position.x));
    this.mesh.position.z = Math.max(-arenaHalfSize, Math.min(arenaHalfSize, this.mesh.position.z));

    // Rotation
    this.mesh.lookAt(lookTarget.x, this.mesh.position.y, lookTarget.z);
  }

  public setSlowEffect(amount: number) {
    this.slowEffect = amount;
  }

  public triggerMeleeVisual() {
    // Start swing animation
    this.swingTimer = this.SWING_DURATION;

    // Start slash animation
    const slashMat = this.slashMesh.material as THREE.MeshBasicMaterial;
    slashMat.color.setHex(0x00ff00); // Green
    slashMat.opacity = 0.8;
    (this.slashMesh.scale as any).setScalar(0.1);
    this.slashTimer = this.SLASH_DURATION;
  }

  public dash(moveDir: THREE.Vector3) {
    if (this.unlimitedEnergy || this.stats.energy >= this.dashEnergyCost) {
      if (!this.unlimitedEnergy) {
        this.stats.energy -= this.dashEnergyCost;
      }
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
      if (!this.unlimitedEnergy && this.stats.energy < this.shootEnergyCost) {
        return; // Not enough energy to shoot
      }
      this.shootCooldown = 1 / this.weapon.fireRate;

      if (!this.unlimitedEnergy) {
        this.stats.energy -= this.shootEnergyCost;
      }

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
      this.stats.maxExp = 100; // Fixed at 100 exp per level
      this.stats.statPoints += 1;
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
      this.currentLevelAllocations.push(stat);
      switch (stat) {
        case 'ATK':
          this.stats.atk += 2;
          break;
        case 'DEF':
          this.stats.def += 5;
          break;
        case 'SPD':
          this.stats.spd += 3;
          break;
        case 'HP':
          this.stats.maxHp += 20;
          this.stats.hp += 20;
          break;
        case 'CRIT':
          this.stats.crit += 2;
          break;
        case 'MAX_ENERGY':
          this.stats.maxEnergy += 10;
          this.stats.energy += 10;
          break;
        case 'ENERGY_REGEN':
          this.stats.energyRegen += 2;
          break;
        case 'HEALTH_REGEN':
          this.stats.healthRegen += 1;
          break;
      }
    }
  }

  public resetAllocations() {
    // Revert all allocations made during this level up session
    for (const stat of this.currentLevelAllocations) {
      this.stats.statPoints++;
      switch (stat) {
        case 'ATK':
          this.stats.atk -= 2;
          break;
        case 'DEF':
          this.stats.def -= 5;
          break;
        case 'SPD':
          this.stats.spd -= 3;
          break;
        case 'HP':
          this.stats.maxHp -= 20;
          this.stats.hp = Math.min(this.stats.hp, this.stats.maxHp);
          break;
        case 'CRIT':
          this.stats.crit -= 2;
          break;
        case 'MAX_ENERGY':
          this.stats.maxEnergy -= 10;
          this.stats.energy = Math.min(this.stats.energy, this.stats.maxEnergy);
          break;
        case 'ENERGY_REGEN':
          this.stats.energyRegen -= 2;
          break;
        case 'HEALTH_REGEN':
          this.stats.healthRegen -= 1;
          break;
      }
    }
    this.currentLevelAllocations = [];
  }

  public confirmAllocations() {
    this.currentLevelAllocations = [];
  }

  public getEnergyRatio(): number {
    return this.stats.energy / this.stats.maxEnergy;
  }

  public canUseMelee(): boolean {
    if (this.meleeCooldown > 0) return false;
    return this.unlimitedEnergy || this.stats.energy >= this.meleeEnergyCost;
  }

  public useMeleeEnergy(): void {
    if (!this.unlimitedEnergy) {
      const energyBefore = this.stats.energy;
      this.stats.energy -= this.meleeEnergyCost;
      console.log(`Melee: ${energyBefore} -> ${this.stats.energy} (cost: ${this.meleeEnergyCost})`);
    }
    this.meleeCooldown = 1 / this.meleeWeapon.attackSpeed;
  }

  public setUnlimitedEnergy(enabled: boolean): void {
    this.unlimitedEnergy = enabled;
  }

  public useConsumable(slotIndex: number): boolean {
    if (slotIndex < 0 || slotIndex >= this.stats.consumableSlots.length) return false;
    const slot = this.stats.consumableSlots[slotIndex];
    if (!slot.consumable) return false;

    const now = Date.now();
    const cooldownMs = slot.consumable.cooldown * 1000;
    if (now - slot.lastUsed < cooldownMs) return false; // On cooldown

    // Apply effect
    switch (slot.consumable.effect) {
      case 'heal':
        this.stats.hp = Math.min(this.stats.maxHp, this.stats.hp + slot.consumable.value);
        break;
      case 'energy':
        this.stats.energy = Math.min(this.stats.maxEnergy, this.stats.energy + slot.consumable.value);
        break;
      case 'speed':
        this.speedBoostTimer = 5; // 5 seconds duration
        this.speedBoostMultiplier = 1 + (slot.consumable.value / 100); // 50% boost = 1.5x
        break;
    }

    slot.lastUsed = now;
    return true;
  }

  public getConsumableCooldown(slotIndex: number): number {
    if (slotIndex < 0 || slotIndex >= this.stats.consumableSlots.length) return 0;
    const slot = this.stats.consumableSlots[slotIndex];
    if (!slot.consumable) return 0;

    const now = Date.now();
    const cooldownMs = slot.consumable.cooldown * 1000;
    const elapsed = now - slot.lastUsed;
    const remaining = Math.max(0, cooldownMs - elapsed);
    return remaining / 1000; // Return in seconds
  }

  public equipConsumable(slotIndex: number, consumable: any): void {
    if (slotIndex < 0 || slotIndex >= this.stats.consumableSlots.length) return;
    this.stats.consumableSlots[slotIndex] = {
      consumable: consumable,
      lastUsed: 0
    };
  }
}