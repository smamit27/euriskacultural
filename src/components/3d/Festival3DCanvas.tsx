import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Sparkles, Eye, EyeOff } from 'lucide-react';

interface Festival3DCanvasProps {
  festivalColor?: string;
  enablePetals?: boolean;
  enableDiyas?: boolean;
  enableSparks?: boolean;
  interactive?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const Festival3DCanvas: React.FC<Festival3DCanvasProps> = ({
  festivalColor = '#f97316',
  enablePetals = true,
  enableDiyas = true,
  enableSparks = true,
  interactive = true,
  className = '',
  style = {},
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [is3DActive, setIs3DActive] = useState<boolean>(true);
  const [isHovered, setIsHovered] = useState<boolean>(false);

  useEffect(() => {
    if (!is3DActive || !containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || 360;

    // 1. Scene & Camera Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 24;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = false;
    container.appendChild(renderer.domElement);

    // 2. Lighting
    const ambientLight = new THREE.AmbientLight(0xffeedd, 1.2);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffd700, 1.5);
    mainLight.position.set(5, 12, 10);
    scene.add(mainLight);

    // 3. Floating 3D Brass Diyas with Flickering Flames
    const diyas: {
      group: THREE.Group;
      initialY: number;
      speed: number;
      flameLight: THREE.PointLight;
      flameMesh: THREE.Mesh;
      phase: number;
    }[] = [];

    if (enableDiyas) {
      const diyaGeometry = new THREE.CylinderGeometry(0.8, 0.4, 0.45, 18);
      const diyaMaterial = new THREE.MeshStandardMaterial({
        color: 0xd97706,
        metalness: 0.85,
        roughness: 0.25,
      });

      const flameGeo = new THREE.ConeGeometry(0.22, 0.65, 12);
      const flameMat = new THREE.MeshBasicMaterial({
        color: 0xffedd5,
      });

      const diyaPositions = [
        { x: -9.5, y: -4.5, z: 2 },
        { x: 9.5, y: -4.0, z: 1.5 },
        { x: -5.0, y: 5.5, z: -2 },
        { x: 5.5, y: 5.0, z: -1.5 },
      ];

      diyaPositions.forEach((pos, idx) => {
        const group = new THREE.Group();
        const base = new THREE.Mesh(diyaGeometry, diyaMaterial);
        base.rotation.x = 0.15;
        group.add(base);

        // Flame mesh
        const flame = new THREE.Mesh(flameGeo, flameMat);
        flame.position.set(0, 0.45, 0);
        group.add(flame);

        // Flame light
        const flameLight = new THREE.PointLight(0xff7700, 1.8, 8);
        flameLight.position.set(0, 0.5, 0);
        group.add(flameLight);

        group.position.set(pos.x, pos.y, pos.z);
        scene.add(group);

        diyas.push({
          group,
          initialY: pos.y,
          speed: 0.6 + idx * 0.2,
          flameLight,
          flameMesh: flame,
          phase: idx * 1.5,
        });
      });
    }

    // 4. Falling Marigold & Rose Petals (Pushpanjali)
    const petals: {
      mesh: THREE.Mesh;
      vy: number;
      vx: number;
      vz: number;
      rotX: number;
      rotY: number;
      rotZ: number;
    }[] = [];

    if (enablePetals) {
      const petalGeo = new THREE.SphereGeometry(0.32, 7, 7);
      petalGeo.scale(1.4, 0.2, 0.8);

      const marigoldMat = new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        roughness: 0.5,
        side: THREE.DoubleSide,
      });

      const roseMat = new THREE.MeshStandardMaterial({
        color: 0xe11d48,
        roughness: 0.5,
        side: THREE.DoubleSide,
      });

      const petalCount = 42;
      for (let i = 0; i < petalCount; i++) {
        const mat = i % 3 === 0 ? roseMat : marigoldMat;
        const mesh = new THREE.Mesh(petalGeo, mat);
        mesh.position.set(
          (Math.random() - 0.5) * 26,
          Math.random() * 20 - 8,
          (Math.random() - 0.5) * 14
        );
        mesh.rotation.set(
          Math.random() * Math.PI,
          Math.random() * Math.PI,
          Math.random() * Math.PI
        );
        scene.add(mesh);

        petals.push({
          mesh,
          vy: 0.015 + Math.random() * 0.025,
          vx: (Math.random() - 0.5) * 0.008,
          vz: (Math.random() - 0.5) * 0.008,
          rotX: 0.01 + Math.random() * 0.02,
          rotY: 0.01 + Math.random() * 0.02,
          rotZ: 0.008 + Math.random() * 0.015,
        });
      }
    }

    // 5. Golden Stardust & Divine Aura Particle Vortex
    let particlesMesh: THREE.Points | null = null;
    let particlePositions: Float32Array;
    const particleCount = 120;

    if (enableSparks) {
      const particlesGeo = new THREE.BufferGeometry();
      particlePositions = new Float32Array(particleCount * 3);

      for (let i = 0; i < particleCount; i++) {
        particlePositions[i * 3] = (Math.random() - 0.5) * 28;
        particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 18;
        particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 14;
      }

      particlesGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

      // Canvas circular particle texture
      const canvas = document.createElement('canvas');
      canvas.width = 32;
      canvas.height = 32;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
        grad.addColorStop(0, 'rgba(255, 240, 200, 1)');
        grad.addColorStop(0.4, 'rgba(251, 191, 36, 0.8)');
        grad.addColorStop(1, 'rgba(245, 158, 11, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 32, 32);
      }
      const pTexture = new THREE.CanvasTexture(canvas);

      const particlesMat = new THREE.PointsMaterial({
        size: 0.45,
        map: pTexture,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });

      particlesMesh = new THREE.Points(particlesGeo, particlesMat);
      scene.add(particlesMesh);
    }

    // 6. Mouse / Touch Tilt Parallax
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handlePointerMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      targetX = nx * 1.5;
      targetY = ny * 1.2;
    };

    if (interactive) {
      window.addEventListener('mousemove', handlePointerMove);
    }

    // 7. Click to Trigger Divine Sparkle Burst
    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      const rect = container.getBoundingClientRect();
      const x = ((clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((clientY - rect.top) / rect.height) * 2 - 1);

      // Perturb nearby petals with a gentle wave
      petals.forEach((p) => {
        const dx = p.mesh.position.x - x * 10;
        const dy = p.mesh.position.y - y * 8;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 8) {
          p.vy -= 0.05;
          p.vx += (dx / (dist + 0.1)) * 0.04;
        }
      });
    };

    if (interactive) {
      container.addEventListener('pointerdown', handlePointerDown);
    }

    // 8. Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth Camera Parallax
      mouseX += (targetX - mouseX) * 0.05;
      mouseY += (targetY - mouseY) * 0.05;
      camera.position.x = mouseX;
      camera.position.y = mouseY;
      camera.lookAt(0, 0, 0);

      // Animate Diyas (gentle floating bob + flame flicker)
      diyas.forEach((d) => {
        d.group.position.y = d.initialY + Math.sin(elapsedTime * d.speed + d.phase) * 0.25;
        d.group.rotation.y = Math.sin(elapsedTime * 0.5 + d.phase) * 0.15;

        // Flicker flame light & scale
        const flicker = 1.6 + Math.sin(elapsedTime * 12 + d.phase) * 0.4 + (Math.random() - 0.5) * 0.2;
        d.flameLight.intensity = flicker;
        const scaleFlicker = 0.9 + Math.sin(elapsedTime * 15) * 0.15;
        d.flameMesh.scale.set(scaleFlicker, scaleFlicker, scaleFlicker);
      });

      // Animate Falling Petals
      petals.forEach((p) => {
        p.mesh.position.y -= p.vy;
        p.mesh.position.x += Math.sin(elapsedTime * 1.5 + p.mesh.position.y) * 0.01 + p.vx;
        p.mesh.position.z += p.vz;

        p.mesh.rotation.x += p.rotX;
        p.mesh.rotation.y += p.rotY;
        p.mesh.rotation.z += p.rotZ;

        // Wrap around bottom to top
        if (p.mesh.position.y < -10) {
          p.mesh.position.y = 11;
          p.mesh.position.x = (Math.random() - 0.5) * 26;
        }
      });

      // Animate Particle Vortex
      if (particlesMesh && particlePositions) {
        particlesMesh.rotation.y = elapsedTime * 0.05;
        particlesMesh.rotation.x = Math.sin(elapsedTime * 0.03) * 0.1;
      }

      renderer.render(scene, camera);
    };

    animate();

    // 9. Resize handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || 360;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // 10. Clean-up
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      if (interactive) {
        window.removeEventListener('mousemove', handlePointerMove);
        container.removeEventListener('pointerdown', handlePointerDown);
      }
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      scene.clear();
    };
  }, [is3DActive, festivalColor, enablePetals, enableDiyas, enableSparks, interactive]);

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: interactive ? 'auto' : 'none',
        zIndex: 1,
        ...style,
      }}
      className={`festival-3d-canvas-wrapper ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        ref={containerRef}
        style={{
          width: '100%',
          height: '100%',
          opacity: is3DActive ? 0.95 : 0,
          transition: 'opacity 0.4s ease',
        }}
      />

      {/* Subtle 3D Badge & Toggle */}
      <div
        style={{
          position: 'absolute',
          top: 10,
          right: 12,
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          background: 'rgba(0, 0, 0, 0.45)',
          backdropFilter: 'blur(8px)',
          borderRadius: 20,
          padding: '4px 10px',
          border: '1px solid rgba(251, 191, 36, 0.35)',
          opacity: isHovered ? 1 : 0.6,
          transition: 'all 0.25s ease',
          userSelect: 'none',
        }}
      >
        <Sparkles size={11} color="#f59e0b" />
        <span style={{ fontSize: 10, fontWeight: 800, color: '#fef3c7', letterSpacing: 0.5 }}>
          3D AURA
        </span>
        <button
          type="button"
          onClick={() => setIs3DActive(!is3DActive)}
          title={is3DActive ? 'Pause 3D Atmosphere' : 'Enable 3D Atmosphere'}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '2px',
            display: 'flex',
            alignItems: 'center',
            color: is3DActive ? '#fef08a' : '#94a3b8',
          }}
        >
          {is3DActive ? <Eye size={12} /> : <EyeOff size={12} />}
        </button>
      </div>
    </div>
  );
};
