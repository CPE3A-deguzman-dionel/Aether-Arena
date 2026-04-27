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
  private jumpTimer: number = 0;
  private isJumping: boolean = false;

  protected hpBarGroup: any;
  protected hpBarForeground: any;
  private magicCircle: any;
  private magicCircleGlowTimer: number = 0;
  private slowAura: any;
  public readonly slowAuraRadius: number = 12;
  private speedAura: any;
  public readonly speedAuraRadius: number = 8;
  private slimeBody: any;
  private attackAnimationTimer: number = 0;
  private golemLeftArm: any;
  private golemRightArm: any;

  constructor(
    scene: any,
    type: EnemyType,
    position: any,
    waveMultiplier: number
  ) {
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
      case 'Boss_Golem_Block':
        this.hp = 50; // Fixed HP, no wave multiplier
        this.maxHp = this.hp;
        this.speed = 0; // Stationary
        this.damage = 10;

        // Block body - cube
        const blockGeo = new THREE.BoxGeometry(1.5, 1.5, 1.5);
        const blockMat = new THREE.MeshStandardMaterial({
          color: 0x64748b,
          emissive: 0xff0000,
          emissiveIntensity: 0.5
        });
        const blockMesh = new THREE.Mesh(blockGeo, blockMat);
        blockMesh.position.y = 1.25;
        (this.mesh as any).add(blockMesh);
        break;

      case 'Slime':
        this.hp = 30 * waveMultiplier;
        this.speed = 4;
        this.damage = 1.5 * waveMultiplier;

        // Slime body - flattened sphere
        const slimeGeo = new THREE.SphereGeometry(0.5, 16, 16);
        const slimeMat = new THREE.MeshStandardMaterial({
          color: 0x4ade80,
          transparent: true,
          opacity: 0.8,
          roughness: 0.3
        });
        this.slimeBody = new THREE.Mesh(slimeGeo, slimeMat);
        this.slimeBody.scale.set(1, 0.6, 1);
        this.slimeBody.position.y = 0.3;
        (this.mesh as any).add(this.slimeBody);
        break;

      case 'Mage':
        this.hp = 30 * waveMultiplier;
        this.speed = 3.5;
        this.damage = 10 * waveMultiplier;

        // Human body
        const mageBodyGeo = new THREE.CylinderGeometry(0.2, 0.25, 0.7, 8);
        const skinMat = new THREE.MeshStandardMaterial({ color: 0xffdbac });
        const mageBody = new THREE.Mesh(mageBodyGeo, skinMat);
        mageBody.position.y = 0.85;
        (this.mesh as any).add(mageBody);

        // Head
        const mageHeadGeo = new THREE.SphereGeometry(0.2, 16, 16);
        const mageHead = new THREE.Mesh(mageHeadGeo, skinMat);
        mageHead.position.y = 1.4;
        (this.mesh as any).add(mageHead);

        // Pointy hat
        const hatGeo = new THREE.ConeGeometry(0.25, 0.6, 8);
        const hatMat = new THREE.MeshStandardMaterial({ color: 0x3b0764 });
        const hat = new THREE.Mesh(hatGeo, hatMat);
        hat.position.y = 1.9;
        (this.mesh as any).add(hat);

        // Robe
        const mageRobeGeo = new THREE.ConeGeometry(0.4, 1.2, 8);
        const mageRobeMat = new THREE.MeshStandardMaterial({ color: 0x4c1d95 });
        const mageRobe = new THREE.Mesh(mageRobeGeo, mageRobeMat);
        mageRobe.position.y = 0.6;
        (this.mesh as any).add(mageRobe);

        // Wand
        const wandGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.5, 8);
        const wandMat = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
        const wand = new THREE.Mesh(wandGeo, wandMat);
        wand.position.set(0.3, 0.9, 0.2);
        wand.rotation.z = -0.3;
        (this.mesh as any).add(wand);

        // Wand tip glow
        const tipGeo = new THREE.SphereGeometry(0.05, 8, 8);
        const tipMat = new THREE.MeshStandardMaterial({
          color: 0xd946ef,
          emissive: 0xd946ef,
          emissiveIntensity: 2
        });
        const tip = new THREE.Mesh(tipGeo, tipMat);
        tip.position.set(0.3, 1.15, 0.2);
        (this.mesh as any).add(tip);

        // Magic circle for deflecting projectiles
        const circleGeo = new THREE.RingGeometry(0.8, 1.0, 32);
        const circleMat = new THREE.MeshBasicMaterial({
          color: 0xd946ef,
          transparent: true,
          opacity: 0.5,
          side: THREE.DoubleSide
        });
        this.magicCircle = new THREE.Mesh(circleGeo, circleMat);
        this.magicCircle.rotation.x = -Math.PI / 2;
        this.magicCircle.position.y = 0.1;
        (this.mesh as any).add(this.magicCircle);
        break;

      case 'Golem':
        this.hp = 100 * waveMultiplier;
        this.speed = 3;
        this.damage = 4 * waveMultiplier;

        // Stone body - large humanoid
        const torsoGeo = new THREE.BoxGeometry(1.2, 1.5, 0.8);
        const stoneMat = new THREE.MeshStandardMaterial({
          color: 0x6b7280,
          roughness: 0.95
        });
        const torso = new THREE.Mesh(torsoGeo, stoneMat);
        torso.position.y = 1.5;
        (this.mesh as any).add(torso);

        // Head
        const golemHeadGeo = new THREE.BoxGeometry(0.6, 0.7, 0.6);
        const golemHead = new THREE.Mesh(golemHeadGeo, stoneMat);
        golemHead.position.y = 2.6;
        (this.mesh as any).add(golemHead);

        // Arms
        const armGeo = new THREE.BoxGeometry(0.3, 1.2, 0.3);
        this.golemLeftArm = new THREE.Mesh(armGeo, stoneMat);
        this.golemLeftArm.position.set(-0.8, 1.5, 0);
        this.golemLeftArm.rotation.z = 0.3;
        (this.mesh as any).add(this.golemLeftArm);

        this.golemRightArm = new THREE.Mesh(armGeo, stoneMat);
        this.golemRightArm.position.set(0.8, 1.5, 0);
        this.golemRightArm.rotation.z = -0.3;
        (this.mesh as any).add(this.golemRightArm);

        // Legs
        const legGeo = new THREE.BoxGeometry(0.4, 1.0, 0.4);
        const leftLeg = new THREE.Mesh(legGeo, stoneMat);
        leftLeg.position.set(-0.3, 0.5, 0);
        (this.mesh as any).add(leftLeg);

        const rightLeg = new THREE.Mesh(legGeo, stoneMat);
        rightLeg.position.set(0.3, 0.5, 0);
        (this.mesh as any).add(rightLeg);

        // Glowing rune on chest
        const runeGeo = new THREE.BoxGeometry(0.3, 0.3, 0.1);
        const runeMat = new THREE.MeshStandardMaterial({
          color: 0x06b6d4,
          emissive: 0x06b6d4,
          emissiveIntensity: 2
        });
        const rune = new THREE.Mesh(runeGeo, runeMat);
        rune.position.set(0, 1.6, 0.45);
        (this.mesh as any).add(rune);

        // Slow aura visual (cyan ring on ground)
        const auraGeo = new THREE.RingGeometry(0.5, this.slowAuraRadius, 32);
        const auraMat = new THREE.MeshBasicMaterial({
          color: 0x06b6d4,
          transparent: true,
          opacity: 0.3,
          side: THREE.DoubleSide,
          depthTest: false,
          depthWrite: false
        });
        this.slowAura = new THREE.Mesh(auraGeo, auraMat);
        this.slowAura.rotation.x = -Math.PI / 2;
        this.slowAura.position.y = 0.05;
        (this.slowAura as any).renderOrder = -1;
        (this.mesh as any).add(this.slowAura);
        break;
      case 'Bomber':
        this.hp = 20 * waveMultiplier;
        this.speed = 6;
        this.damage = 20 * waveMultiplier;

        // Skeleton body
        const boneMat = new THREE.MeshStandardMaterial({ color: 0xf5f5dc });

        // Ribcage
        const ribGeo = new THREE.BoxGeometry(0.4, 0.6, 0.2);
        const ribcage = new THREE.Mesh(ribGeo, boneMat);
        ribcage.position.y = 1.0;
        (this.mesh as any).add(ribcage);

        // Skull
        const skullGeo = new THREE.SphereGeometry(0.25, 8, 8);
        const skull = new THREE.Mesh(skullGeo, boneMat);
        skull.position.y = 1.5;
        (this.mesh as any).add(skull);

        // Eye sockets (dark)
 const eyeSocketGeo = new THREE.SphereGeometry(0.08, 8, 8);
        const eyeSocketMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a });
        const leftSocket = new THREE.Mesh(eyeSocketGeo, eyeSocketMat);
        leftSocket.position.set(-0.08, 1.55, 0.2);
        const rightSocket = new THREE.Mesh(eyeSocketGeo, eyeSocketMat);
        rightSocket.position.set(0.08, 1.55, 0.2);
        (this.mesh as any).add(leftSocket, rightSocket);

        // Arms (bone)
        const armBoneGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.5, 8);
        const leftArmBone = new THREE.Mesh(armBoneGeo, boneMat);
        leftArmBone.position.set(-0.35, 0.9, 0);
        leftArmBone.rotation.z = 0.5;
        (this.mesh as any).add(leftArmBone);

        const rightArmBone = new THREE.Mesh(armBoneGeo, boneMat);
        rightArmBone.position.set(0.35, 0.9, 0);
        rightArmBone.rotation.z = -0.5;
        (this.mesh as any).add(rightArmBone);

        // Bomb in hand
        const bombGeo = new THREE.SphereGeometry(0.2, 12, 12);
        const bombMat = new THREE.MeshStandardMaterial({
          color: 0xef4444,
          emissive: 0xff6b6b,
          emissiveIntensity: 1.5
        });
        const bomb = new THREE.Mesh(bombGeo, bombMat);
        bomb.position.set(0.5, 1.1, 0.2);
        (this.mesh as any).add(bomb);

        // Fuse
        const fuseGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.15, 8);
        const fuseMat = new THREE.MeshStandardMaterial({ color: 0xd4a574 });
        const fuse = new THREE.Mesh(fuseGeo, fuseMat);
        fuse.position.set(0.5, 1.3, 0.2);
        fuse.rotation.z = -0.3;
        (this.mesh as any).add(fuse);
        break;
      case 'Healer':
        this.hp = 40 * waveMultiplier;
        this.speed = 3;
        this.damage = 0;

        // Priest body
        const priestBodyGeo = new THREE.CylinderGeometry(0.2, 0.25, 0.7, 8);
        const priestSkinMat = new THREE.MeshStandardMaterial({ color: 0xffdbac });
        const priestBody = new THREE.Mesh(priestBodyGeo, priestSkinMat);
        priestBody.position.y = 0.85;
        (this.mesh as any).add(priestBody);

        // Head
        const priestHeadGeo = new THREE.SphereGeometry(0.2, 16, 16);
        const priestHead = new THREE.Mesh(priestHeadGeo, priestSkinMat);
        priestHead.position.y = 1.4;
        (this.mesh as any).add(priestHead);

        // White holy robe
        const priestRobeGeo = new THREE.ConeGeometry(0.45, 1.3, 8);
        const priestRobeMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
        const priestRobe = new THREE.Mesh(priestRobeGeo, priestRobeMat);
        priestRobe.position.y = 0.6;
        (this.mesh as any).add(priestRobe);

        // Holy staff
        const staffGeo = new THREE.CylinderGeometry(0.03, 0.03, 1.2, 8);
        const staffMat = new THREE.MeshStandardMaterial({ color: 0xd4af37 });
        const staff = new THREE.Mesh(staffGeo, staffMat);
        staff.position.set(0.3, 1.0, 0);
        (this.mesh as any).add(staff);

        // Holy orb on top
        const orbGeo = new THREE.SphereGeometry(0.1, 16, 16);
        const orbMat = new THREE.MeshStandardMaterial({
          color: 0xffd700,
          emissive: 0xffd700,
          emissiveIntensity: 2
        });
        const orb = new THREE.Mesh(orbGeo, orbMat);
        orb.position.set(0.3, 1.65, 0);
        (this.mesh as any).add(orb);

        // Heal aura visual (gold ring on ground)
        const healAuraGeo = new THREE.RingGeometry(0.5, 8, 32);
        const healAuraMat = new THREE.MeshBasicMaterial({
          color: 0xffd700,
          transparent: true,
          opacity: 0.3,
          side: THREE.DoubleSide,
          depthTest: false,
          depthWrite: false
        });
        this.speedAura = new THREE.Mesh(healAuraGeo, healAuraMat);
        this.speedAura.rotation.x = -Math.PI / 2;
        this.speedAura.position.y = 0.05;
        (this.speedAura as any).renderOrder = -1;
        (this.mesh as any).add(this.speedAura);
        break;

      case 'Bard':
        this.hp = 50 * waveMultiplier;
        this.speed = 4;
        this.damage = 8 * waveMultiplier;

        // Bard body - colorful outfit
        const bardBodyGeo = new THREE.CylinderGeometry(0.25, 0.3, 0.8, 8);
        const bardSkinMat = new THREE.MeshStandardMaterial({ color: 0xffdbac });
        const bardBody = new THREE.Mesh(bardBodyGeo, bardSkinMat);
        bardBody.position.y = 0.9;
        (this.mesh as any).add(bardBody);

        // Head
        const bardHeadGeo = new THREE.SphereGeometry(0.22, 16, 16);
        const bardHead = new THREE.Mesh(bardHeadGeo, bardSkinMat);
        bardHead.position.y = 1.5;
        (this.mesh as any).add(bardHead);

        // Colorful tunic
        const tunicGeo = new THREE.ConeGeometry(0.5, 1.4, 8);
        const tunicMat = new THREE.MeshStandardMaterial({ color: 0x9333ea });
        const tunic = new THREE.Mesh(tunicGeo, tunicMat);
        tunic.position.y = 0.5;
        (this.mesh as any).add(tunic);

        // Lute/instrument
        const luteGeo = new THREE.BoxGeometry(0.15, 0.4, 0.1);
        const luteMat = new THREE.MeshStandardMaterial({ color: 0xd4a574 });
        const lute = new THREE.Mesh(luteGeo, luteMat);
        lute.position.set(0.4, 1.2, 0);
        lute.rotation.z = 0.5;
        (this.mesh as any).add(lute);

        // Speed aura visual (purple ring on ground)
        const speedAuraGeo = new THREE.RingGeometry(0.5, this.speedAuraRadius, 32);
        const speedAuraMat = new THREE.MeshBasicMaterial({
          color: 0x9333ea,
          transparent: true,
          opacity: 0.3,
          side: THREE.DoubleSide,
          depthTest: false,
          depthWrite: false
        });
        this.speedAura = new THREE.Mesh(speedAuraGeo, speedAuraMat);
        this.speedAura.rotation.x = -Math.PI / 2;
        this.speedAura.position.y = 0.05;
        (this.speedAura as any).renderOrder = -1;
        (this.mesh as any).add(this.speedAura);
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
  projectiles: Projectile[]
  ) {
    if (!this.active) return;

    // Boss Golem Block: stationary but fires projectiles
    if (this.type === 'Boss_Golem_Block') {
      this.attackCooldown += dt;
      if (this.attackCooldown > 1) {
        this.attackCooldown = 0;
        const dir = new THREE.Vector3().subVectors(playerPos, this.mesh.position);
        dir.y = 0;
        if (dir.length() > 0) dir.normalize();
        projectiles.push(
          new Projectile(
            scene,
            this.mesh.position.clone().add(new THREE.Vector3(0, 1.5, 0)),
            dir,
            18,
            this.damage,
            true,
            0xff0000
          )
        );
      }
      return;
    }

    // Freeze effect
    if (this.freezeTimer > 0) {
      this.freezeTimer -= dt;
      return;
    }

    // Chill stacks decay
    if (this.chillStacks > 0) {
      this.chillStacks -= dt * 0.5;
      if (this.chillStacks < 0) this.chillStacks = 0;
    }

    // Update slow aura visual
    if (this.type === 'Golem' && this.slowAura) {
      (this.slowAura as any).material.opacity = 0.2 + Math.sin(Date.now() * 0.003) * 0.1;
    }

    // Update speed aura visual
    if (this.type === 'Bard' && this.speedAura) {
      (this.speedAura as any).material.opacity = 0.2 + Math.sin(Date.now() * 0.003) * 0.1;
    }

    // Knockback decay
    if (this.knockbackVelocity.length() > 0) {
      this.knockbackVelocity.multiplyScalar(0.9);
      this.mesh.position.add(this.knockbackVelocity.clone().multiplyScalar(dt));
      if (this.knockbackVelocity.length() < 0.01) {
        this.knockbackVelocity.set(0, 0, 0);
      }
    }

    // Movement
    if (this.speed > 0) {
      const dir = new THREE.Vector3().subVectors(playerPos, this.mesh.position);
      dir.y = 0;
      const dist = dir.length();
      if (dist > 0) dir.normalize();

      // Chill slows movement
      const speedMod = 1 - (this.chillStacks * 0.1);
      const finalSpeed = Math.max(0.1, this.speed * speedMod);

      this.mesh.position.add(dir.multiplyScalar(finalSpeed * dt));
      this.mesh.lookAt(playerPos.x, this.mesh.position.y, playerPos.z);
    }

    // Jumping animation for Slime
    if (this.type === 'Slime') {
      this.jumpTimer += dt;
      if (this.jumpTimer > 2) {
        this.jumpTimer = 0;
        this.isJumping = true;
      }
      if (this.isJumping) {
        this.slimeBody.position.y = 0.3 + Math.sin(this.jumpTimer * Math.PI) * 0.5;
        if (this.jumpTimer > 1) {
          this.isJumping = false;
          this.slimeBody.position.y = 0.3;
        }
      }
    }

    // Golem arm animation
    if (this.type === 'Golem') {
      this.time += dt;
      if (this.golemLeftArm && this.golemRightArm) {
        this.golemLeftArm.rotation.z = Math.sin(this.time * 2) * 0.3;
        this.golemRightArm.rotation.z = -Math.sin(this.time * 2) * 0.3;
      }
    }

    // Attack cooldown
    if (this.attackCooldown > 0) {
      this.attackCooldown -= dt;
    }

    // Ranged attacks
    if (this.type === 'Mage' || this.type === 'Bard') {
      if (this.attackCooldown <= 0) {
        const dir = new THREE.Vector3().subVectors(playerPos, this.mesh.position);
        dir.y = 0;
        const dist = dir.length();
        if (dist > 0) dir.normalize();

        projectiles.push(
          new Projectile(
            scene,
            this.mesh.position.clone().add(new THREE.Vector3(0, 1, 0)),
            dir,
            15,
            this.damage,
            true,
            this.type === 'Mage' ? 0x9333ea : 0x9333ea
          )
        );
        this.attackCooldown = 2 / ENEMY_RANGED_FIRE_RATE_MULT;
      }
    }

    // Mage magic circle animation
    if (this.type === 'Mage' && this.magicCircle) {
      this.magicCircleGlowTimer += dt;
      (this.magicCircle.material as THREE.MeshBasicMaterial).opacity =
        0.3 + Math.sin(this.magicCircleGlowTimer * 3) * 0.2;
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

  public setColors(color: number) {
    this.mesh.traverse((child: any) => {
      if (child instanceof THREE.Mesh) {
        // Skip aura meshes to prevent color change on hit
        if (child === this.slowAura || child === this.speedAura) {
          return;
        }
        child.material.color.setHex(color);
      }
    });
  }

  private resetColors() {
    let mainColor = 0xffffff;
    switch (this.type) {
      case 'Slime':
        mainColor = 0x4ade80; // Green slime
        break;
      case 'Mage':
        mainColor = 0xffdbac; // Skin color
        break;
      case 'Golem':
        mainColor = 0x6b7280; // Stone gray
        break;
      case 'Bomber':
        mainColor = 0xf5f5dc; // Bone color
        break;
      case 'Healer':
        mainColor = 0xffffff; // White robe
        break;
      case 'Bard':
        mainColor = 0x9333ea; // Purple tunic
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

    // Flash white on hit (skip for Mages and Golems)
    if (this.type !== 'Mage' && this.type !== 'Golem') {
      this.setColors(0xffffff);
      setTimeout(() => {
        if (this.active) this.resetColors();
      }, 100);
    }

    return false;
  }

  public triggerMagicCircleGlow() {
    this.magicCircleGlowTimer = 0.3;
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