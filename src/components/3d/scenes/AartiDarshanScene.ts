import * as THREE from 'three';

export interface AartiDarshanController {
  showerFlowers: (count?: number) => void;
  ringBell: () => void;
  toggleAartiMotion: () => boolean;
  toggleDhoop: () => boolean;
  dispose: () => void;
}

export function createAartiDarshanScene(
  container: HTMLElement,
  onBellRung?: () => void
): AartiDarshanController {
  const width = container.clientWidth || window.innerWidth;
  const height = container.clientHeight || 500;

  // 1. Scene, Camera, Renderer
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0c0714);
  scene.fog = new THREE.FogExp2(0x0c0714, 0.025);

  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
  camera.position.set(0, 1.2, 7.2);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.appendChild(renderer.domElement);

  // 2. Lighting
  const ambientLight = new THREE.AmbientLight(0xffecd2, 0.9);
  scene.add(ambientLight);

  const divineSpot = new THREE.SpotLight(0xffbe5b, 3.5, 20, Math.PI / 4, 0.4, 1.2);
  divineSpot.position.set(0, 7, 5);
  divineSpot.castShadow = true;
  scene.add(divineSpot);

  const auraLight = new THREE.PointLight(0xff7700, 2.2, 10);
  auraLight.position.set(0, 2.0, 0);
  scene.add(auraLight);

  const diyaPointLight = new THREE.PointLight(0xffaa22, 2.0, 5);
  diyaPointLight.position.set(0, -0.4, 3.2);
  scene.add(diyaPointLight);

  // 3. Materials
  const goldMaterial = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    metalness: 0.9,
    roughness: 0.25,
    emissive: 0x78350f,
    emissiveIntensity: 0.2,
  });

  const crownGoldMat = new THREE.MeshStandardMaterial({
    color: 0xfbbf24,
    metalness: 0.95,
    roughness: 0.15,
    emissive: 0xd97706,
    emissiveIntensity: 0.35,
  });

  const redVelvetMat = new THREE.MeshStandardMaterial({
    color: 0x991b1b,
    metalness: 0.1,
    roughness: 0.8,
  });

  const skinMat = new THREE.MeshStandardMaterial({
    color: 0xfde047,
    metalness: 0.3,
    roughness: 0.4,
  });

  // 4. Temple Architecture / Sanctum Background
  const templeGroup = new THREE.Group();

  // Floor / Altar Base
  const floorGeo = new THREE.CylinderGeometry(4.5, 4.8, 0.4, 32);
  const floorMat = new THREE.MeshStandardMaterial({ color: 0x1e152a, roughness: 0.4, metalness: 0.6 });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.position.y = -1.8;
  floor.receiveShadow = true;
  templeGroup.add(floor);

  // Ornate Altar Carpet
  const carpetGeo = new THREE.CylinderGeometry(3.6, 3.6, 0.05, 32);
  const carpet = new THREE.Mesh(carpetGeo, redVelvetMat);
  carpet.position.y = -1.58;
  templeGroup.add(carpet);

  // Sanctum Pillars
  const pillarGeo = new THREE.CylinderGeometry(0.25, 0.3, 5.0, 16);
  const leftPillar = new THREE.Mesh(pillarGeo, goldMaterial);
  leftPillar.position.set(-2.6, 1.0, -0.8);
  const rightPillar = new THREE.Mesh(pillarGeo, goldMaterial);
  rightPillar.position.set(2.6, 1.0, -0.8);
  templeGroup.add(leftPillar, rightPillar);

  // Arch / Makhar
  const archCurve = new THREE.TorusGeometry(2.6, 0.18, 16, 32, Math.PI);
  const archMesh = new THREE.Mesh(archCurve, goldMaterial);
  archMesh.position.set(0, 2.8, -0.8);
  templeGroup.add(archMesh);

  // Glowing Divine Halo / Prabhavali
  const haloGeo = new THREE.RingGeometry(1.2, 1.8, 32);
  const haloMat = new THREE.MeshBasicMaterial({
    color: 0xf59e0b,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.85,
  });
  const halo = new THREE.Mesh(haloGeo, haloMat);
  halo.position.set(0, 2.1, -0.4);
  templeGroup.add(halo);

  // Lotus Pedestal
  const lotusGroup = new THREE.Group();
  lotusGroup.position.set(0, -1.0, 0);
  const lotusBase = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.8, 0.4, 24), goldMaterial);
  lotusGroup.add(lotusBase);

  // Lotus Petals around base
  const petalGeo = new THREE.ConeGeometry(0.3, 0.7, 4);
  const lotusPetalMat = new THREE.MeshStandardMaterial({ color: 0xf43f5e, roughness: 0.5 });
  for (let i = 0; i < 16; i++) {
    const angle = (i / 16) * Math.PI * 2;
    const petal = new THREE.Mesh(petalGeo, lotusPetalMat);
    petal.position.set(Math.cos(angle) * 1.55, 0.2, Math.sin(angle) * 1.55);
    petal.rotation.x = Math.PI / 4;
    petal.rotation.y = -angle;
    lotusGroup.add(petal);
  }
  templeGroup.add(lotusGroup);
  scene.add(templeGroup);

  // 5. 3D Lord Ganesha Murti Model
  const ganeshGroup = new THREE.Group();
  ganeshGroup.position.set(0, -0.6, 0);

  // Torso / Belly (Lambodara)
  const bellyGeo = new THREE.SphereGeometry(0.85, 24, 24);
  bellyGeo.scale(1.05, 1.15, 0.95);
  const belly = new THREE.Mesh(bellyGeo, skinMat);
  belly.position.set(0, 0.65, 0);
  belly.castShadow = true;
  ganeshGroup.add(belly);

  // Dhoti / Yellow-Gold Silk
  const dhotiGeo = new THREE.CylinderGeometry(0.9, 1.2, 0.7, 24);
  const dhoti = new THREE.Mesh(dhotiGeo, redVelvetMat);
  dhoti.position.set(0, 0.1, 0);
  ganeshGroup.add(dhoti);

  // Head (Gajanana)
  const headGeo = new THREE.SphereGeometry(0.65, 24, 24);
  const head = new THREE.Mesh(headGeo, skinMat);
  head.position.set(0, 1.8, 0.1);
  head.castShadow = true;
  ganeshGroup.add(head);

  // Majestic Ears (Supakarna)
  const earGeo = new THREE.CylinderGeometry(0.48, 0.48, 0.06, 16);
  const leftEar = new THREE.Mesh(earGeo, skinMat);
  leftEar.position.set(-0.75, 1.85, 0);
  leftEar.rotation.set(0.2, 0.3, 0.5);
  const rightEar = new THREE.Mesh(earGeo, skinMat);
  rightEar.position.set(0.75, 1.85, 0);
  rightEar.rotation.set(0.2, -0.3, -0.5);
  ganeshGroup.add(leftEar, rightEar);

  // Curving Trunk (Vakratunda)
  const trunkCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 1.7, 0.6),
    new THREE.Vector3(0, 1.3, 0.8),
    new THREE.Vector3(-0.15, 0.95, 0.75),
    new THREE.Vector3(-0.35, 0.9, 0.65),
    new THREE.Vector3(-0.3, 1.05, 0.55),
  ]);
  const trunkGeo = new THREE.TubeGeometry(trunkCurve, 20, 0.16, 12, false);
  const trunk = new THREE.Mesh(trunkGeo, skinMat);
  ganeshGroup.add(trunk);

  // Modak in trunk tip
  const modakGeo = new THREE.ConeGeometry(0.12, 0.18, 12);
  const modakMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.3 });
  const modak = new THREE.Mesh(modakGeo, modakMat);
  modak.position.set(-0.3, 1.15, 0.55);
  ganeshGroup.add(modak);

  // Golden Crown / Mukut
  const crownGroup = new THREE.Group();
  crownGroup.position.set(0, 2.3, 0.05);
  const crownBase = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.55, 0.35, 16), crownGoldMat);
  const crownSpire = new THREE.Mesh(new THREE.ConeGeometry(0.42, 0.9, 16), crownGoldMat);
  crownSpire.position.y = 0.55;
  crownGroup.add(crownBase, crownSpire);
  ganeshGroup.add(crownGroup);

  // Four Divine Arms
  // Right Blessing Arm (Abhaya Mudra)
  const rightArmGeo = new THREE.CylinderGeometry(0.12, 0.14, 0.65, 12);
  const rightArm = new THREE.Mesh(rightArmGeo, skinMat);
  rightArm.position.set(0.85, 0.9, 0.3);
  rightArm.rotation.set(-0.4, 0, -0.6);
  ganeshGroup.add(rightArm);

  // Left Modak Arm
  const leftArm = new THREE.Mesh(rightArmGeo, skinMat);
  leftArm.position.set(-0.85, 0.9, 0.3);
  leftArm.rotation.set(-0.4, 0, 0.6);
  ganeshGroup.add(leftArm);

  scene.add(ganeshGroup);

  // 6. Interactive 3D Aarti Thali
  const thaliGroup = new THREE.Group();
  thaliGroup.position.set(0, -0.5, 3.2);

  // Brass Pooja Plate
  const plateGeo = new THREE.CylinderGeometry(0.9, 0.75, 0.08, 32);
  const thaliPlate = new THREE.Mesh(plateGeo, goldMaterial);
  thaliPlate.castShadow = true;
  thaliGroup.add(thaliPlate);

  // Central Diya / Deepam
  const diyaGeo = new THREE.CylinderGeometry(0.24, 0.14, 0.15, 16);
  const diyaMesh = new THREE.Mesh(diyaGeo, crownGoldMat);
  diyaMesh.position.set(0, 0.1, 0);
  thaliGroup.add(diyaMesh);

  // Flickering Flame
  const flameGeo = new THREE.ConeGeometry(0.1, 0.35, 12);
  const flameMat = new THREE.MeshBasicMaterial({ color: 0xfff7ed });
  const flameMesh = new THREE.Mesh(flameGeo, flameMat);
  flameMesh.position.set(0, 0.28, 0);
  thaliGroup.add(flameMesh);

  // Decorative offerings in thali (Kumkum, Rice, Modak, Flower)
  const kumkumBowl = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.08, 0.06, 12), redVelvetMat);
  kumkumBowl.position.set(0.4, 0.06, 0.2);
  const prasadModak = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.14, 8), modakMat);
  prasadModak.position.set(-0.35, 0.1, 0.25);
  const flowerOffering = new THREE.Mesh(new THREE.DodecahedronGeometry(0.1), new THREE.MeshStandardMaterial({ color: 0xf97316 }));
  flowerOffering.position.set(0.1, 0.08, -0.4);
  thaliGroup.add(kumkumBowl, prasadModak, flowerOffering);

  scene.add(thaliGroup);

  // 7. Hanging Brass Temple Bell
  const bellGroup = new THREE.Group();
  bellGroup.position.set(2.0, 3.2, 1.8);
  const bellRope = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.2, 8), goldMaterial);
  bellRope.position.y = 0.6;
  const bellMesh = new THREE.Mesh(new THREE.ConeGeometry(0.35, 0.6, 16), crownGoldMat);
  const clapper = new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 12), goldMaterial);
  clapper.position.y = -0.3;
  bellGroup.add(bellRope, bellMesh, clapper);
  scene.add(bellGroup);

  // 8. Particle System: Pushpanjali (Flower Shower)
  const MAX_PETALS = 250;
  const petalPositions = new Float32Array(MAX_PETALS * 3);
  const petalVelocities = new Float32Array(MAX_PETALS * 3);
  const petalRotations = new Float32Array(MAX_PETALS * 3);
  const petalColors = new Float32Array(MAX_PETALS * 3);

  const marigoldColor = new THREE.Color(0xf59e0b);
  const roseColor = new THREE.Color(0xe11d48);
  const yellowColor = new THREE.Color(0xfacc15);

  for (let i = 0; i < MAX_PETALS; i++) {
    petalPositions[i * 3 + 0] = (Math.random() - 0.5) * 6;
    petalPositions[i * 3 + 1] = 6 + Math.random() * 8; // start high above
    petalPositions[i * 3 + 2] = (Math.random() - 0.5) * 4;

    petalVelocities[i * 3 + 0] = (Math.random() - 0.5) * 0.02;
    petalVelocities[i * 3 + 1] = -0.03 - Math.random() * 0.04;
    petalVelocities[i * 3 + 2] = (Math.random() - 0.5) * 0.02;

    petalRotations[i * 3 + 0] = Math.random() * Math.PI;
    petalRotations[i * 3 + 1] = (Math.random() - 0.5) * 0.05;
    petalRotations[i * 3 + 2] = (Math.random() - 0.5) * 0.05;

    const chosen = i % 3 === 0 ? roseColor : i % 3 === 1 ? marigoldColor : yellowColor;
    petalColors[i * 3 + 0] = chosen.r;
    petalColors[i * 3 + 1] = chosen.g;
    petalColors[i * 3 + 2] = chosen.b;
  }

  const flowerParticleGeo = new THREE.BufferGeometry();
  flowerParticleGeo.setAttribute('position', new THREE.BufferAttribute(petalPositions, 3));
  flowerParticleGeo.setAttribute('color', new THREE.BufferAttribute(petalColors, 3));

  // Canvas-generated petal sprite
  const petalCanvas = document.createElement('canvas');
  petalCanvas.width = 64;
  petalCanvas.height = 64;
  const pCtx = petalCanvas.getContext('2d')!;
  pCtx.beginPath();
  pCtx.ellipse(32, 32, 24, 14, Math.PI / 4, 0, Math.PI * 2);
  pCtx.fillStyle = '#ffffff';
  pCtx.fill();
  const petalTexture = new THREE.CanvasTexture(petalCanvas);

  const flowerMat = new THREE.PointsMaterial({
    size: 0.28,
    map: petalTexture,
    vertexColors: true,
    transparent: true,
    opacity: 0.9,
    depthWrite: false,
    blending: THREE.NormalBlending,
  });

  const flowerParticles = new THREE.Points(flowerParticleGeo, flowerMat);
  scene.add(flowerParticles);

  // 9. Dhoop Smoke Particles
  const DHOOP_COUNT = 80;
  const smokePositions = new Float32Array(DHOOP_COUNT * 3);
  const smokeLifes = new Float32Array(DHOOP_COUNT);
  for (let i = 0; i < DHOOP_COUNT; i++) {
    smokePositions[i * 3 + 0] = 0;
    smokePositions[i * 3 + 1] = -100;
    smokePositions[i * 3 + 2] = 0;
    smokeLifes[i] = Math.random();
  }
  const smokeGeo = new THREE.BufferGeometry();
  smokeGeo.setAttribute('position', new THREE.BufferAttribute(smokePositions, 3));
  const smokePointsMat = new THREE.PointsMaterial({
    size: 0.35,
    color: 0xd4d4d8,
    transparent: true,
    opacity: 0.3,
    depthWrite: false,
  });
  const smokeParticles = new THREE.Points(smokeGeo, smokePointsMat);
  scene.add(smokeParticles);

  // 10. Web Audio API Temple Bell Synthesizer
  function playTempleBellSound() {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === 'suspended') ctx.resume();

      const freqs = [587.33, 880, 1174.66, 1760]; // Divine D5, A5, D6 bell harmonics
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = idx === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        const decay = 2.5 - idx * 0.4;
        gain.gain.setValueAtTime(0.3 / (idx + 1), ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + decay);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + decay);
      });
    } catch {
      // Audio autoplay restriction fallback
    }
  }

  // Animation State
  let isAartiMoving = true;
  let isDhoopActive = true;
  let bellSwingTime = 0;
  let isBellSwinging = false;
  let aartiAngle = 0;
  let animationFrameId: number;

  // Touch / Mouse Camera interaction
  let isDragging = false;
  let prevMouseX = 0;
  let prevMouseY = 0;

  const onPointerDown = (e: MouseEvent | TouchEvent) => {
    isDragging = true;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    prevMouseX = clientX;
    prevMouseY = clientY;
  };

  const onPointerMove = (e: MouseEvent | TouchEvent) => {
    if (!isDragging) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const deltaX = clientX - prevMouseX;
    const deltaY = clientY - prevMouseY;
    prevMouseX = clientX;
    prevMouseY = clientY;

    scene.rotation.y += deltaX * 0.005;
    camera.position.y = Math.max(0.2, Math.min(3.5, camera.position.y - deltaY * 0.008));
    camera.lookAt(0, 0.8, 0);
  };

  const onPointerUp = () => {
    isDragging = false;
  };

  const domEl = renderer.domElement;
  domEl.addEventListener('mousedown', onPointerDown);
  window.addEventListener('mousemove', onPointerMove);
  window.addEventListener('mouseup', onPointerUp);
  domEl.addEventListener('touchstart', onPointerDown, { passive: true });
  window.addEventListener('touchmove', onPointerMove, { passive: true });
  window.addEventListener('touchend', onPointerUp);

  // Resize handler
  const handleResize = () => {
    if (!container) return;
    const w = container.clientWidth;
    const h = container.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  };
  window.addEventListener('resize', handleResize);

  // Render Loop
  let clock = new THREE.Clock();

  const animate = () => {
    animationFrameId = requestAnimationFrame(animate);
    const delta = clock.getDelta();
    const elapsedTime = clock.getElapsedTime();

    // 1. Aarti Thali Motion (Clockwise Divine Circular Orbit)
    if (isAartiMoving) {
      aartiAngle += delta * 1.5;
      const radiusX = 0.95;
      const radiusY = 0.55;
      thaliGroup.position.x = Math.sin(aartiAngle) * radiusX;
      thaliGroup.position.y = -0.4 + Math.cos(aartiAngle) * radiusY;
      thaliGroup.position.z = 2.9 + Math.sin(aartiAngle * 0.5) * 0.3;
      thaliGroup.rotation.z = Math.sin(aartiAngle) * 0.12;
      thaliGroup.rotation.x = 0.15 + Math.cos(aartiAngle) * 0.08;

      diyaPointLight.position.copy(thaliGroup.position);
      diyaPointLight.position.y += 0.3;
    }

    // Flame flicker
    const flicker = 0.85 + Math.sin(elapsedTime * 24) * 0.15 + Math.cos(elapsedTime * 17) * 0.1;
    flameMesh.scale.set(flicker, flicker * 1.2, flicker);
    diyaPointLight.intensity = 1.8 * flicker;

    // Halo pulse & rotation
    halo.rotation.z += delta * 0.2;
    haloMat.opacity = 0.75 + Math.sin(elapsedTime * 3) * 0.2;

    // Bell Swing Animation
    if (isBellSwinging) {
      bellSwingTime += delta * 6;
      bellGroup.rotation.z = Math.sin(bellSwingTime) * Math.exp(-bellSwingTime * 0.3) * 0.45;
      if (bellSwingTime > 5) {
        isBellSwinging = false;
        bellGroup.rotation.z = 0;
      }
    }

    // 2. Flower Petals Falling Physics
    const pPos = flowerParticleGeo.attributes.position.array as Float32Array;
    for (let i = 0; i < MAX_PETALS; i++) {
      pPos[i * 3 + 0] += petalVelocities[i * 3 + 0] + Math.sin(elapsedTime * 2 + i) * 0.008;
      pPos[i * 3 + 1] += petalVelocities[i * 3 + 1];
      pPos[i * 3 + 2] += petalVelocities[i * 3 + 2] + Math.cos(elapsedTime * 2 + i) * 0.008;

      // Loop back to top
      if (pPos[i * 3 + 1] < -1.8) {
        pPos[i * 3 + 1] = 6 + Math.random() * 4;
        pPos[i * 3 + 0] = (Math.random() - 0.5) * 5;
        pPos[i * 3 + 2] = (Math.random() - 0.5) * 4;
      }
    }
    flowerParticleGeo.attributes.position.needsUpdate = true;

    // 3. Dhoop Smoke Physics
    if (isDhoopActive) {
      const sPos = smokeGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < DHOOP_COUNT; i++) {
        smokeLifes[i] += delta * 0.6;
        if (smokeLifes[i] > 1.0) {
          smokeLifes[i] = 0;
          sPos[i * 3 + 0] = -1.2 + (Math.random() - 0.5) * 0.2;
          sPos[i * 3 + 1] = -1.2;
          sPos[i * 3 + 2] = 1.0 + (Math.random() - 0.5) * 0.2;
        } else {
          sPos[i * 3 + 0] += Math.sin(elapsedTime * 3 + i) * 0.005;
          sPos[i * 3 + 1] += delta * 0.8;
          sPos[i * 3 + 2] += Math.cos(elapsedTime * 2 + i) * 0.003;
        }
      }
      smokeGeo.attributes.position.needsUpdate = true;
    }

    renderer.render(scene, camera);
  };

  animate();

  return {
    showerFlowers: (count: number = 80) => {
      const pPos = flowerParticleGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < Math.min(count, MAX_PETALS); i++) {
        pPos[i * 3 + 0] = (Math.random() - 0.5) * 3.5;
        pPos[i * 3 + 1] = 3.5 + Math.random() * 3.0;
        pPos[i * 3 + 2] = (Math.random() - 0.5) * 2.5;
      }
      flowerParticleGeo.attributes.position.needsUpdate = true;
    },
    ringBell: () => {
      isBellSwinging = true;
      bellSwingTime = 0;
      playTempleBellSound();
      if (onBellRung) onBellRung();
    },
    toggleAartiMotion: () => {
      isAartiMoving = !isAartiMoving;
      return isAartiMoving;
    },
    toggleDhoop: () => {
      isDhoopActive = !isDhoopActive;
      smokeParticles.visible = isDhoopActive;
      return isDhoopActive;
    },
    dispose: () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      domEl.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('mouseup', onPointerUp);
      domEl.removeEventListener('touchstart', onPointerDown);
      window.removeEventListener('touchmove', onPointerMove);
      window.removeEventListener('touchend', onPointerUp);
      if (renderer.domElement && renderer.domElement.parentElement) {
        renderer.domElement.parentElement.removeChild(renderer.domElement);
      }
      renderer.dispose();
    },
  };
}
