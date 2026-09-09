import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { X, Flame, Bell, Flower, Volume2, VolumeX, RotateCw } from 'lucide-react';
import ganeshBhagwanImg from '/ganesh_bhagwan.jpg';

interface VirtualAarti3DModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VirtualAarti3DModal: React.FC<VirtualAarti3DModalProps> = ({ isOpen, onClose }) => {
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const [aartiCount, setAartiCount] = useState<number>(0);
  const [isAartiRotating, setIsAartiRotating] = useState<boolean>(true);
  const [flowerCount, setFlowerCount] = useState<number>(0);
  const [isBellRinging, setIsBellRinging] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const devoteeCount = 142;

  const audioCtxRef = useRef<AudioContext | null>(null);

  // Play synthetic devotional bell sound via Web Audio API (no external asset needed)
  const playBellChime = () => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const now = ctx.currentTime;
      // Fundamental bell frequency
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now); // A5 note
      osc.frequency.exponentialRampToValueAtTime(1760, now + 0.08);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.3);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 1.2);

      // Harmonics
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(1320, now); // E6 harmonic
      gain2.gain.setValueAtTime(0.15, now);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now);
      osc2.stop(now + 0.9);
    } catch {
      // Audio not permitted or not supported
    }
  };

  // Three.js 3D Virtual Mandap & Aarti Scene
  useEffect(() => {
    if (!isOpen || !canvasContainerRef.current) return;

    const container = canvasContainerRef.current;
    const width = container.clientWidth || 400;
    const height = container.clientHeight || 450;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 1.8, 8.5);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 2. Lighting
    const ambient = new THREE.AmbientLight(0xffeedd, 1.5);
    scene.add(ambient);

    const mainLight = new THREE.DirectionalLight(0xffdf78, 2.0);
    mainLight.position.set(2, 6, 4);
    scene.add(mainLight);

    // 3. Central Divine Deity Altar (Textured Ganesh Idol Backdrop)
    const textureLoader = new THREE.TextureLoader();
    const ganeshTexture = textureLoader.load(ganeshBhagwanImg);

    const idolFrameGeo = new THREE.PlaneGeometry(3.6, 4.8);
    const idolMat = new THREE.MeshBasicMaterial({
      map: ganeshTexture,
      transparent: true,
      side: THREE.DoubleSide,
    });
    const idolMesh = new THREE.Mesh(idolFrameGeo, idolMat);
    idolMesh.position.set(0, 1.4, -0.5);
    scene.add(idolMesh);

    // Glowing Aureole Ring behind Bappa
    const haloGeo = new THREE.RingGeometry(2.1, 2.35, 36);
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
    });
    const haloMesh = new THREE.Mesh(haloGeo, haloMat);
    haloMesh.position.set(0, 1.4, -0.6);
    scene.add(haloMesh);

    // 4. 3D Golden Aarti Thali
    const thaliGroup = new THREE.Group();

    // Thali Tray
    const thaliPlateGeo = new THREE.CylinderGeometry(1.6, 1.4, 0.12, 32);
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      metalness: 0.9,
      roughness: 0.2,
    });
    const thaliPlate = new THREE.Mesh(thaliPlateGeo, goldMat);
    thaliPlate.rotation.x = 0.35;
    thaliGroup.add(thaliPlate);

    // Center Camphor Diya Lamp
    const diyaGeo = new THREE.CylinderGeometry(0.35, 0.2, 0.2, 16);
    const diya = new THREE.Mesh(diyaGeo, goldMat);
    diya.position.set(0, 0.15, 0);
    diya.rotation.x = 0.35;
    thaliGroup.add(diya);

    // Dynamic Flame
    const flameGeo = new THREE.ConeGeometry(0.16, 0.45, 12);
    const flameMat = new THREE.MeshBasicMaterial({ color: 0xffedd5 });
    const flame = new THREE.Mesh(flameGeo, flameMat);
    flame.position.set(0, 0.4, 0);
    thaliGroup.add(flame);

    const flameLight = new THREE.PointLight(0xff7700, 2.5, 6);
    flameLight.position.set(0, 0.45, 0);
    thaliGroup.add(flameLight);

    // 4 Modaks on the Thali
    const modakGeo = new THREE.ConeGeometry(0.14, 0.24, 10);
    const modakMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.6 });
    for (let i = 0; i < 4; i++) {
      const m = new THREE.Mesh(modakGeo, modakMat);
      const angle = (i * Math.PI) / 2;
      m.position.set(Math.cos(angle) * 0.9, 0.18, Math.sin(angle) * 0.9 * 0.9);
      thaliGroup.add(m);
    }

    thaliGroup.position.set(0, -1.2, 3.2);
    scene.add(thaliGroup);

    // 5. Hanging 3D Golden Temple Bell
    const bellGroup = new THREE.Group();
    const bellBodyGeo = new THREE.CylinderGeometry(0.18, 0.5, 0.7, 18);
    const bellMesh = new THREE.Mesh(bellBodyGeo, goldMat);
    bellGroup.add(bellMesh);

    const bellRopeGeo = new THREE.CylinderGeometry(0.04, 0.04, 2.0, 8);
    const ropeMat = new THREE.MeshStandardMaterial({ color: 0xb45309 });
    const bellRope = new THREE.Mesh(bellRopeGeo, ropeMat);
    bellRope.position.set(0, 1.3, 0);
    bellGroup.add(bellRope);

    bellGroup.position.set(-2.2, 2.6, 2.0);
    scene.add(bellGroup);

    // 6. Pushpanjali Flower Shower System
    const activePetals: { mesh: THREE.Mesh; vy: number; vx: number; vz: number; rotX: number; rotY: number }[] = [];
    const petalGeo = new THREE.SphereGeometry(0.18, 6, 6);
    petalGeo.scale(1.4, 0.2, 0.8);

    const marigoldMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.4 });
    const roseMat = new THREE.MeshStandardMaterial({ color: 0xe11d48, roughness: 0.4 });

    const spawnPetalBurst = (count: number = 25) => {
      for (let i = 0; i < count; i++) {
        const mat = i % 3 === 0 ? roseMat : marigoldMat;
        const mesh = new THREE.Mesh(petalGeo, mat);
        mesh.position.set(
          (Math.random() - 0.5) * 4,
          3.8 + Math.random() * 1.5,
          -0.2 + (Math.random() - 0.5) * 2.5
        );
        mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
        scene.add(mesh);

        activePetals.push({
          mesh,
          vy: 0.035 + Math.random() * 0.03,
          vx: (Math.random() - 0.5) * 0.02,
          vz: (Math.random() - 0.5) * 0.015,
          rotX: 0.03 + Math.random() * 0.04,
          rotY: 0.02 + Math.random() * 0.03,
        });
      }
    };

    // Store trigger globally in ref for external button triggers
    (container as any).__triggerPetals = spawnPetalBurst;
    (container as any).__triggerBell = () => {
      bellGroup.rotation.z = 0.45;
      playBellChime();
    };

    // 7. Animation Loop
    let animId: number;
    const clock = new THREE.Clock();
    let aartiAngle = 0;
    let totalRotations = 0;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Halo Pulsing Glow
      haloMesh.rotation.z = elapsed * 0.25;
      const haloScale = 1 + Math.sin(elapsed * 2) * 0.03;
      haloMesh.scale.set(haloScale, haloScale, 1);

      // Aarti Circular Motion (Ghirni Aarti)
      if (isAartiRotating) {
        aartiAngle += 0.035;
        const radiusX = 1.1;
        const radiusY = 0.4;
        thaliGroup.position.x = Math.sin(aartiAngle) * radiusX;
        thaliGroup.position.y = -1.2 + Math.cos(aartiAngle) * radiusY;
        thaliGroup.rotation.z = Math.sin(aartiAngle) * 0.12;

        if (aartiAngle >= Math.PI * 2) {
          aartiAngle -= Math.PI * 2;
          totalRotations++;
          setAartiCount(totalRotations);
        }
      }

      // Flame Flicker
      const flameFlicker = 1.8 + Math.sin(elapsed * 16) * 0.4 + (Math.random() - 0.5) * 0.2;
      flameLight.intensity = flameFlicker;
      flame.scale.set(1 + Math.sin(elapsed * 18) * 0.12, 1 + Math.sin(elapsed * 14) * 0.2, 1);

      // Bell Pendulum Swing Damping
      if (Math.abs(bellGroup.rotation.z) > 0.01) {
        bellGroup.rotation.z = Math.sin(elapsed * 14) * (bellGroup.rotation.z * 0.94);
      } else {
        bellGroup.rotation.z = 0;
      }

      // Animate Falling Flowers
      for (let i = activePetals.length - 1; i >= 0; i--) {
        const p = activePetals[i];
        p.mesh.position.y -= p.vy;
        p.mesh.position.x += p.vx;
        p.mesh.position.z += p.vz;
        p.mesh.rotation.x += p.rotX;
        p.mesh.rotation.y += p.rotY;

        if (p.mesh.position.y < -2.2) {
          scene.remove(p.mesh);
          activePetals.splice(i, 1);
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      scene.clear();
    };
  }, [isOpen, isAartiRotating, soundEnabled]);

  if (!isOpen) return null;

  const handleOfferFlowers = () => {
    setFlowerCount((c) => c + 1);
    if (canvasContainerRef.current && (canvasContainerRef.current as any).__triggerPetals) {
      (canvasContainerRef.current as any).__triggerPetals(30);
    }
  };

  const handleRingBell = () => {
    setIsBellRinging(true);
    setTimeout(() => setIsBellRinging(false), 800);
    if (canvasContainerRef.current && (canvasContainerRef.current as any).__triggerBell) {
      (canvasContainerRef.current as any).__triggerBell();
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(8px)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'linear-gradient(180deg, #1e1b4b 0%, #0f172a 100%)',
          width: '100%',
          maxWidth: 480,
          borderRadius: 24,
          border: '2px solid rgba(251, 191, 36, 0.4)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6), 0 0 30px rgba(245, 158, 11, 0.25)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div
          style={{
            padding: '14px 18px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(255, 255, 255, 0.05)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: 'linear-gradient(135deg, #f59e0b, #ea580c)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: 18,
              }}
            >
              🪔
            </div>
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 900, color: '#fef3c7', margin: 0 }}>
                3D Virtual Aarti &amp; Darshan
              </h2>
              <p style={{ fontSize: 11, color: '#fed7aa', margin: 0, fontWeight: 600 }}>
                Euriska Devotional Mandap • {devoteeCount} Devotees Live
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? 'Mute Aarti Sounds' : 'Unmute Aarti Sounds'}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                borderRadius: '50%',
                width: 32,
                height: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: soundEnabled ? '#fef08a' : '#94a3b8',
                cursor: 'pointer',
              }}
            >
              {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>

            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                borderRadius: '50%',
                width: 32,
                height: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#e2e8f0',
                cursor: 'pointer',
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* 3D WebGL Canvas Area */}
        <div
          ref={canvasContainerRef}
          style={{
            width: '100%',
            height: 360,
            position: 'relative',
            cursor: 'grab',
          }}
        >
          {/* Top Live Stats Overlay */}
          <div
            style={{
              position: 'absolute',
              top: 12,
              left: 14,
              display: 'flex',
              gap: 8,
              zIndex: 10,
              pointerEvents: 'none',
            }}
          >
            <div
              style={{
                background: 'rgba(0,0,0,0.55)',
                backdropFilter: 'blur(6px)',
                borderRadius: 14,
                padding: '4px 10px',
                border: '1px solid rgba(251, 191, 36, 0.3)',
                fontSize: 11,
                fontWeight: 800,
                color: '#fef08a',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
              }}
            >
              <Flame size={12} color="#f97316" />
              <span>Aarti Rotations: {aartiCount}</span>
            </div>

            {flowerCount > 0 && (
              <div
                style={{
                  background: 'rgba(0,0,0,0.55)',
                  backdropFilter: 'blur(6px)',
                  borderRadius: 14,
                  padding: '4px 10px',
                  border: '1px solid rgba(244, 63, 94, 0.3)',
                  fontSize: 11,
                  fontWeight: 800,
                  color: '#fecdd3',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                }}
              >
                <Flower size={12} color="#f43f5e" />
                <span>Offerings: {flowerCount}</span>
              </div>
            )}
          </div>
        </div>

        {/* Interactive 3D Action Controls */}
        <div
          style={{
            padding: '16px 18px',
            background: 'rgba(15, 23, 42, 0.8)',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 10,
          }}
        >
          {/* Toggle Rotating Aarti */}
          <button
            type="button"
            onClick={() => setIsAartiRotating(!isAartiRotating)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
              padding: '10px 6px',
              borderRadius: 14,
              border: isAartiRotating ? '2px solid #f59e0b' : '1.5px solid rgba(255,255,255,0.15)',
              background: isAartiRotating
                ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.25), rgba(234, 88, 12, 0.25))'
                : 'rgba(255,255,255,0.05)',
              color: isAartiRotating ? '#fef08a' : '#cbd5e1',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <RotateCw size={18} className={isAartiRotating ? 'spin-slow' : ''} />
            <span style={{ fontSize: 11, fontWeight: 800 }}>
              {isAartiRotating ? 'Aarti Revolving' : 'Rotate Aarti'}
            </span>
          </button>

          {/* Shower Pushpanjali Flowers */}
          <button
            type="button"
            onClick={handleOfferFlowers}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
              padding: '10px 6px',
              borderRadius: 14,
              border: '1.5px solid rgba(244, 63, 94, 0.4)',
              background: 'linear-gradient(135deg, rgba(244, 63, 94, 0.2), rgba(225, 29, 72, 0.2))',
              color: '#fecdd3',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <Flower size={18} />
            <span style={{ fontSize: 11, fontWeight: 800 }}>Pushpanjali 🌸</span>
          </button>

          {/* Ring Temple Bell */}
          <button
            type="button"
            onClick={handleRingBell}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
              padding: '10px 6px',
              borderRadius: 14,
              border: isBellRinging ? '2px solid #fbbf24' : '1.5px solid rgba(251, 191, 36, 0.4)',
              background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.2), rgba(217, 119, 6, 0.2))',
              color: '#fef3c7',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <Bell size={18} className={isBellRinging ? 'animate-bounce' : ''} />
            <span style={{ fontSize: 11, fontWeight: 800 }}>Ring Bell 🔔</span>
          </button>
        </div>
      </div>
    </div>
  );
};
