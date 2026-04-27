import * as THREE from 'three';
import { ENEMY_RANGED_DAMAGE_MULT, ENEMY_RANGED_SPEED_MULT, ENEMY_RANGED_RANGE_MULT } from './Balance';

export class Projectile {
  public mesh: THREE.Mesh;
  public velocity: THREE.Vector3;
  public damage: number;
  public isEnemy: boolean;
  public reflected: boolean = false;
  public lifetime: number = 2.0; // seconds
  public active: boolean = true;

  public specialAttribute?: string;
  public chainCount: number = 0;
  public knockback: number = 0;

  constructor(
  scene: THREE.Scene,
  position: THREE.Vector3,
  direction: THREE.Vector3,
  speed: number,
  damage: number,
  isEnemy: boolean,
  color: number,
  specialAttribute?: string,
  knockback: number = 0,
  chainCount: number = 0)
  {
    // Use elongated capsule geometry for projectiles instead of sphere
    const geometry = new THREE.CapsuleGeometry(0.15, 0.6, 4, 8);
    const material = new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: 2
    });
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.copy(position);

    // Orient projectile to face direction of travel
    this.mesh.lookAt(position.clone().add(direction));

    this.velocity = direction.normalize().multiplyScalar(speed);
    this.damage = damage;
    this.isEnemy = isEnemy;
    this.specialAttribute = specialAttribute;
    this.knockback = knockback;
    this.chainCount = chainCount;

    // Apply global enemy projectile buffs
    if (this.isEnemy) {
      this.damage = this.damage * ENEMY_RANGED_DAMAGE_MULT;
      this.velocity.multiplyScalar(ENEMY_RANGED_SPEED_MULT);
      this.lifetime = this.lifetime * ENEMY_RANGED_RANGE_MULT;
    }

    scene.add(this.mesh);
  }

  public update(dt: number) {
    if (!this.active) return;

    this.mesh.position.addScaledVector(this.velocity, dt);
    this.lifetime -= dt;

    if (this.lifetime <= 0) {
      this.active = false;
    }
  }

  public destroy(scene: THREE.Scene) {
    scene.remove(this.mesh);
    this.mesh.geometry.dispose();
    (this.mesh.material as THREE.Material).dispose();
  }
}