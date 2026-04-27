import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface EnemyPreviewProps {
  enemyType: string;
  className?: string;
}

export const EnemyPreview: React.FC<EnemyPreviewProps> = ({ enemyType, className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);
  const rendererRef = useRef<any>(null);
  const meshRef = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new (THREE as any).Scene();
    scene.background = new (THREE as any).Color(0x1a120b);
    sceneRef.current = scene;

    // Camera setup - zoomed out for more padding around models
    const camera = new (THREE as any).PerspectiveCamera(65, 1, 0.1, 100);
    camera.position.set(0, 2, 8);
    camera.lookAt(0, 1.2, 0);
    cameraRef.current = camera;

    // Renderer setup - responsive
    const renderer = new (THREE as any).WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Handle resize
    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(width, height);
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    // Lighting
    const ambientLight = new (THREE as any).AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new (THREE as any).DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 5);
    scene.add(directionalLight);

    // Create enemy mesh - centered at origin, no CSS scaling needed
    const enemyMesh = createEnemyMesh(enemyType);
    if (enemyMesh) {
      enemyMesh.scale.set(1, 1, 1);
      scene.add(enemyMesh);
      meshRef.current = enemyMesh;
    }

    // Animation loop
    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      if (meshRef.current) {
        meshRef.current.rotation.y += 0.01;
      }
      renderer.render(scene, camera);
    };
    animate();

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
      if (rendererRef.current && containerRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
        rendererRef.current.dispose();
      }
      if (meshRef.current) {
        scene.remove(meshRef.current);
        meshRef.current.traverse((child: any) => {
          if (child instanceof (THREE as any).Mesh) {
            child.geometry.dispose();
            if (child.material instanceof (THREE as any).Material) {
              child.material.dispose();
            }
          }
        });
      }
    };
  }, [enemyType]);

  const createEnemyMesh = (type: string): any => {
    const mesh = new (THREE as any).Group();

    switch (type) {
      case 'Slime':
        const slimeGeo = new (THREE as any).SphereGeometry(0.5, 16, 16);
        const slimeMat = new (THREE as any).MeshStandardMaterial({
          color: 0x4ade80,
          transparent: true,
          opacity: 0.8,
          roughness: 0.3
        });
        const slime = new (THREE as any).Mesh(slimeGeo, slimeMat);
        slime.scale.set(1, 0.6, 1);
        slime.position.y = 0.3;
        mesh.add(slime);
        break;

      case 'Mage':
        const mageBodyGeo = new (THREE as any).CylinderGeometry(0.2, 0.25, 0.7, 8);
        const skinMat = new (THREE as any).MeshStandardMaterial({ color: 0xffdbac });
        const mageBody = new (THREE as any).Mesh(mageBodyGeo, skinMat);
        mageBody.position.y = 0.85;
        mesh.add(mageBody);

        const mageHeadGeo = new (THREE as any).SphereGeometry(0.2, 16, 16);
        const mageHead = new (THREE as any).Mesh(mageHeadGeo, skinMat);
        mageHead.position.y = 1.4;
        mesh.add(mageHead);

        const hatGeo = new (THREE as any).ConeGeometry(0.25, 0.6, 8);
        const hatMat = new (THREE as any).MeshStandardMaterial({ color: 0x3b0764 });
        const hat = new (THREE as any).Mesh(hatGeo, hatMat);
        hat.position.y = 1.9;
        mesh.add(hat);

        const mageRobeGeo = new (THREE as any).ConeGeometry(0.4, 1.2, 8);
        const mageRobeMat = new (THREE as any).MeshStandardMaterial({ color: 0x4c1d95 });
        const mageRobe = new (THREE as any).Mesh(mageRobeGeo, mageRobeMat);
        mageRobe.position.y = 0.6;
        mesh.add(mageRobe);

        const wandGeo = new (THREE as any).CylinderGeometry(0.02, 0.02, 0.5, 8);
        const wandMat = new (THREE as any).MeshStandardMaterial({ color: 0x8b4513 });
        const wand = new (THREE as any).Mesh(wandGeo, wandMat);
        wand.position.set(0.3, 0.9, 0.2);
        wand.rotation.z = -0.3;
        mesh.add(wand);

        const tipGeo = new (THREE as any).SphereGeometry(0.05, 8, 8);
        const tipMat = new (THREE as any).MeshStandardMaterial({
          color: 0xd946ef,
          emissive: 0xd946ef,
          emissiveIntensity: 2
        });
        const tip = new (THREE as any).Mesh(tipGeo, tipMat);
        tip.position.set(0.3, 1.15, 0.2);
        mesh.add(tip);

        const circleGeo = new (THREE as any).RingGeometry(0.8, 1.0, 32);
        const circleMat = new (THREE as any).MeshBasicMaterial({
          color: 0xd946ef,
          transparent: true,
          opacity: 0.5,
          side: (THREE as any).DoubleSide
        });
        const magicCircle = new (THREE as any).Mesh(circleGeo, circleMat);
        magicCircle.rotation.x = -Math.PI / 2;
        magicCircle.position.y = 0.1;
        mesh.add(magicCircle);
        break;

      case 'Golem':
        const torsoGeo = new (THREE as any).BoxGeometry(1.2, 1.5, 0.8);
        const stoneMat = new (THREE as any).MeshStandardMaterial({
          color: 0x6b7280,
          roughness: 0.95
        });
        const torso = new (THREE as any).Mesh(torsoGeo, stoneMat);
        torso.position.y = 1.5;
        mesh.add(torso);

        const golemHeadGeo = new (THREE as any).BoxGeometry(0.6, 0.7, 0.6);
        const golemHead = new (THREE as any).Mesh(golemHeadGeo, stoneMat);
        golemHead.position.y = 2.6;
        mesh.add(golemHead);

        const armGeo = new (THREE as any).BoxGeometry(0.3, 1.2, 0.3);
        const leftArm = new (THREE as any).Mesh(armGeo, stoneMat);
        leftArm.position.set(-0.8, 1.5, 0);
        leftArm.rotation.z = 0.3;
        mesh.add(leftArm);

        const rightArm = new (THREE as any).Mesh(armGeo, stoneMat);
        rightArm.position.set(0.8, 1.5, 0);
        rightArm.rotation.z = -0.3;
        mesh.add(rightArm);

        const legGeo = new (THREE as any).BoxGeometry(0.4, 1.0, 0.4);
        const leftLeg = new (THREE as any).Mesh(legGeo, stoneMat);
        leftLeg.position.set(-0.3, 0.5, 0);
        mesh.add(leftLeg);

        const rightLeg = new (THREE as any).Mesh(legGeo, stoneMat);
        rightLeg.position.set(0.3, 0.5, 0);
        mesh.add(rightLeg);

        const runeGeo = new (THREE as any).BoxGeometry(0.3, 0.3, 0.1);
        const runeMat = new (THREE as any).MeshStandardMaterial({
          color: 0x06b6d4,
          emissive: 0x06b6d4,
          emissiveIntensity: 2
        });
        const rune = new (THREE as any).Mesh(runeGeo, runeMat);
        rune.position.set(0, 1.6, 0.45);
        mesh.add(rune);

        const auraGeo = new (THREE as any).RingGeometry(0.5, 12, 32);
        const auraMat = new (THREE as any).MeshBasicMaterial({
          color: 0x06b6d4,
          transparent: true,
          opacity: 0.3,
          side: (THREE as any).DoubleSide
        });
        const slowAura = new (THREE as any).Mesh(auraGeo, auraMat);
        slowAura.rotation.x = -Math.PI / 2;
        slowAura.position.y = 0.05;
        mesh.add(slowAura);
        break;

      case 'Bomber':
        const boneMat = new (THREE as any).MeshStandardMaterial({ color: 0xf5f5dc });

        const ribGeo = new (THREE as any).BoxGeometry(0.4, 0.6, 0.2);
        const ribcage = new (THREE as any).Mesh(ribGeo, boneMat);
        ribcage.position.y = 1.0;
        mesh.add(ribcage);

        const skullGeo = new (THREE as any).SphereGeometry(0.25, 8, 8);
        const skull = new (THREE as any).Mesh(skullGeo, boneMat);
        skull.position.y = 1.5;
        mesh.add(skull);

        const eyeSocketGeo = new (THREE as any).SphereGeometry(0.08, 8, 8);
        const eyeSocketMat = new (THREE as any).MeshStandardMaterial({ color: 0x1a1a1a });
        const leftSocket = new (THREE as any).Mesh(eyeSocketGeo, eyeSocketMat);
        leftSocket.position.set(-0.08, 1.55, 0.2);
        const rightSocket = new (THREE as any).Mesh(eyeSocketGeo, eyeSocketMat);
        rightSocket.position.set(0.08, 1.55, 0.2);
        mesh.add(leftSocket, rightSocket);

        const armBoneGeo = new (THREE as any).CylinderGeometry(0.05, 0.05, 0.5, 8);
        const leftArmBone = new (THREE as any).Mesh(armBoneGeo, boneMat);
        leftArmBone.position.set(-0.35, 0.9, 0);
        leftArmBone.rotation.z = 0.5;
        mesh.add(leftArmBone);

        const rightArmBone = new (THREE as any).Mesh(armBoneGeo, boneMat);
        rightArmBone.position.set(0.35, 0.9, 0);
        rightArmBone.rotation.z = -0.5;
        mesh.add(rightArmBone);

        const bombGeo = new (THREE as any).SphereGeometry(0.2, 12, 12);
        const bombMat = new (THREE as any).MeshStandardMaterial({
          color: 0xef4444,
          emissive: 0xff6b6b,
          emissiveIntensity: 1.5
        });
        const bomb = new (THREE as any).Mesh(bombGeo, bombMat);
        bomb.position.set(0.5, 1.1, 0.2);
        mesh.add(bomb);

        const fuseGeo = new (THREE as any).CylinderGeometry(0.02, 0.02, 0.15, 8);
        const fuseMat = new (THREE as any).MeshStandardMaterial({ color: 0xd4a574 });
        const fuse = new (THREE as any).Mesh(fuseGeo, fuseMat);
        fuse.position.set(0.5, 1.3, 0.2);
        fuse.rotation.z = -0.3;
        mesh.add(fuse);
        break;

      case 'Healer':
        const priestBodyGeo = new (THREE as any).CylinderGeometry(0.2, 0.25, 0.7, 8);
        const priestSkinMat = new (THREE as any).MeshStandardMaterial({ color: 0xffdbac });
        const priestBody = new (THREE as any).Mesh(priestBodyGeo, priestSkinMat);
        priestBody.position.y = 0.85;
        mesh.add(priestBody);

        const priestHeadGeo = new (THREE as any).SphereGeometry(0.2, 16, 16);
        const priestHead = new (THREE as any).Mesh(priestHeadGeo, priestSkinMat);
        priestHead.position.y = 1.4;
        mesh.add(priestHead);

        const priestRobeGeo = new (THREE as any).ConeGeometry(0.45, 1.3, 8);
        const priestRobeMat = new (THREE as any).MeshStandardMaterial({ color: 0xffffff });
        const priestRobe = new (THREE as any).Mesh(priestRobeGeo, priestRobeMat);
        priestRobe.position.y = 0.6;
        mesh.add(priestRobe);

        const staffGeo = new (THREE as any).CylinderGeometry(0.03, 0.03, 1.2, 8);
        const staffMat = new (THREE as any).MeshStandardMaterial({ color: 0xd4af37 });
        const staff = new (THREE as any).Mesh(staffGeo, staffMat);
        staff.position.set(0.3, 1.0, 0);
        mesh.add(staff);

        const orbGeo = new (THREE as any).SphereGeometry(0.1, 16, 16);
        const orbMat = new (THREE as any).MeshStandardMaterial({
          color: 0xffd700,
          emissive: 0xffd700,
          emissiveIntensity: 2
        });
        const orb = new (THREE as any).Mesh(orbGeo, orbMat);
        orb.position.set(0.3, 1.65, 0);
        mesh.add(orb);

        const healAuraGeo = new (THREE as any).RingGeometry(0.5, 8, 32);
        const healAuraMat = new (THREE as any).MeshBasicMaterial({
          color: 0xffd700,
          transparent: true,
          opacity: 0.3,
          side: (THREE as any).DoubleSide
        });
        const speedAura = new (THREE as any).Mesh(healAuraGeo, healAuraMat);
        speedAura.rotation.x = -Math.PI / 2;
        speedAura.position.y = 0.05;
        mesh.add(speedAura);
        break;

      case 'Bard':
        const bardBodyGeo = new (THREE as any).CylinderGeometry(0.25, 0.3, 0.8, 8);
        const bardSkinMat = new (THREE as any).MeshStandardMaterial({ color: 0xffdbac });
        const bardBody = new (THREE as any).Mesh(bardBodyGeo, bardSkinMat);
        bardBody.position.y = 0.9;
        mesh.add(bardBody);

        const bardHeadGeo = new (THREE as any).SphereGeometry(0.22, 16, 16);
        const bardHead = new (THREE as any).Mesh(bardHeadGeo, bardSkinMat);
        bardHead.position.y = 1.5;
        mesh.add(bardHead);

        const tunicGeo = new (THREE as any).ConeGeometry(0.5, 1.4, 8);
        const tunicMat = new (THREE as any).MeshStandardMaterial({ color: 0x9333ea });
        const tunic = new (THREE as any).Mesh(tunicGeo, tunicMat);
        tunic.position.y = 0.5;
        mesh.add(tunic);

        const luteGeo = new (THREE as any).BoxGeometry(0.15, 0.4, 0.1);
        const luteMat = new (THREE as any).MeshStandardMaterial({ color: 0xd4a574 });
        const lute = new (THREE as any).Mesh(luteGeo, luteMat);
        lute.position.set(0.4, 1.2, 0);
        lute.rotation.z = 0.5;
        mesh.add(lute);

        const speedAuraGeo = new (THREE as any).RingGeometry(0.5, 8, 32);
        const speedAuraMat = new (THREE as any).MeshBasicMaterial({
          color: 0x9333ea,
          transparent: true,
          opacity: 0.3,
          side: (THREE as any).DoubleSide
        });
        const bardSpeedAura = new (THREE as any).Mesh(speedAuraGeo, speedAuraMat);
        bardSpeedAura.rotation.x = -Math.PI / 2;
        bardSpeedAura.position.y = 0.05;
        mesh.add(bardSpeedAura);
        break;

      case 'Boss_Golem':
        const bossBodyGeo = new (THREE as any).BoxGeometry(1.5, 2.0, 1.5);
        const bossStoneMat = new (THREE as any).MeshStandardMaterial({
          color: 0x475569,
          roughness: 0.9
        });
        const bossBody = new (THREE as any).Mesh(bossBodyGeo, bossStoneMat);
        bossBody.position.y = 1.0;
        mesh.add(bossBody);

        const bossCoreGeo = new (THREE as any).SphereGeometry(0.5, 16, 16);
        const bossCoreMat = new (THREE as any).MeshStandardMaterial({
          color: 0x06b6d4,
          emissive: 0x06b6d4,
          emissiveIntensity: 2
        });
        const bossCore = new (THREE as any).Mesh(bossCoreGeo, bossCoreMat);
        bossCore.position.set(0, 1.25, 0.75);
        mesh.add(bossCore);

        // 4 Spinning blocks
        const bossBlockGeo = new (THREE as any).BoxGeometry(0.5, 0.5, 0.5);
        const bossBlockMat = new (THREE as any).MeshStandardMaterial({
          color: 0x64748b,
          emissive: 0x06b6d4,
          emissiveIntensity: 0.5
        });
        for (let i = 0; i < 4; i++) {
          const block = new (THREE as any).Mesh(bossBlockGeo, bossBlockMat);
          const angle = i * Math.PI * 2 / 4;
          block.position.set(
            Math.cos(angle) * 1.2,
            1.25,
            Math.sin(angle) * 1.2
          );
          mesh.add(block);
        }
        break;

      case 'Boss_Void':
        const voidBodyGeo = new (THREE as any).SphereGeometry(1.0, 32, 32);
        const voidMat = new (THREE as any).MeshStandardMaterial({
          color: 0x1a1a2e,
          emissive: 0x1a1a2e,
          emissiveIntensity: 0.5,
          transparent: true,
          opacity: 0.8
        });
        const voidBody = new (THREE as any).Mesh(voidBodyGeo, voidMat);
        voidBody.position.y = 1.5;
        mesh.add(voidBody);

        const voidEyeGeo = new (THREE as any).SphereGeometry(0.2, 16, 16);
        const voidEyeMat = new (THREE as any).MeshStandardMaterial({
          color: 0xff0000,
          emissive: 0xff0000,
          emissiveIntensity: 2
        });
        const voidEye1 = new (THREE as any).Mesh(voidEyeGeo, voidEyeMat);
        voidEye1.position.set(-0.3, 1.7, 0.8);
        mesh.add(voidEye1);

        const voidEye2 = new (THREE as any).Mesh(voidEyeGeo, voidEyeMat);
        voidEye2.position.set(0.3, 1.7, 0.8);
        mesh.add(voidEye2);
        break;

      case 'Boss_Chimera':
        const chimeraBodyGeo = new (THREE as any).BoxGeometry(1.5, 1.5, 2.0);
        const chimeraMat = new (THREE as any).MeshStandardMaterial({
          color: 0x8b0000,
          roughness: 0.7
        });
        const chimeraBody = new (THREE as any).Mesh(chimeraBodyGeo, chimeraMat);
        chimeraBody.position.y = 1.5;
        mesh.add(chimeraBody);

        const chimeraHeadGeo = new (THREE as any).BoxGeometry(0.6, 0.8, 0.8);
        const chimeraHead = new (THREE as any).Mesh(chimeraHeadGeo, chimeraMat);
        chimeraHead.position.set(0, 2.5, 1.0);
        mesh.add(chimeraHead);

        const chimeraWingGeo = new (THREE as any).BoxGeometry(1.5, 0.1, 0.8);
        const chimeraWing = new (THREE as any).Mesh(chimeraWingGeo, chimeraMat);
        chimeraWing.position.set(0, 2.0, -0.5);
        mesh.add(chimeraWing);
        break;

      default:
        return null;
    }

    return mesh;
  };

  return <div ref={containerRef} className={className} />;
};
