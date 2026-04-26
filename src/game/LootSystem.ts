import * as THREE from 'three';

export type LootType = 'EXP' | 'GOLD';

export class LootItem {
  public mesh: THREE.Mesh;
  public type: LootType;
  public value: number;
  public active: boolean = true;
  private floatOffset: number;

  constructor(
  scene: THREE.Scene,
  position: THREE.Vector3,
  type: LootType,
  value: number)
  {
    this.type = type;
    this.value = value;
    this.floatOffset = Math.random() * Math.PI * 2;

    let geometry: THREE.BufferGeometry;
    let material: THREE.Material;

    if (type === 'EXP') {
      geometry = new THREE.OctahedronGeometry(0.3);
      material = new THREE.MeshStandardMaterial({
        color: 0x00ffff,
        emissive: 0x0088ff,
        emissiveIntensity: 1
      });
    } else {
      geometry = new THREE.CylinderGeometry(0.3, 0.3, 0.1, 16);
      material = new THREE.MeshStandardMaterial({
        color: 0xffd700,
        emissive: 0xaa8800,
        emissiveIntensity: 0.5
      });
      geometry.rotateX(Math.PI / 2);
    }

    this.mesh = new THREE.Mesh(geometry, material);
    // Add slight random scatter
    this.mesh.position.
    copy(position).
    add(
      new THREE.Vector3(
        (Math.random() - 0.5) * 2,
        0.5,
        (Math.random() - 0.5) * 2
      )
    );

    scene.add(this.mesh);
  }

  public update(dt: number, time: number, playerPos: THREE.Vector3) {
    if (!this.active) return;

    // Bobbing animation
    this.mesh.position.y = 0.5 + Math.sin(time * 3 + this.floatOffset) * 0.2;
    this.mesh.rotation.y += dt * 2;

    // Magnetic pull
    const dist = this.mesh.position.distanceTo(playerPos);
    if (dist < 5.0) {
      const dir = new THREE.Vector3().
      subVectors(playerPos, this.mesh.position).
      normalize();
      const pullSpeed = 10 * (1 - dist / 5.0); // Faster as it gets closer
      this.mesh.position.addScaledVector(dir, pullSpeed * dt);
    }
  }

  public destroy(scene: THREE.Scene) {
    scene.remove(this.mesh);
    this.mesh.geometry.dispose();
    (this.mesh.material as THREE.Material).dispose();
  }
}