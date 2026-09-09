import * as THREE from 'three';

export interface TrophyController {
  dispose: () => void;
}

export function createTrophyScene(container: HTMLElement): TrophyController {
  const width = container.clientWidth || window.innerWidth;
  const height = container.clientHeight || 500;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a0515);
  scene.fog = new THREE.FogExp2(0x0a0515, 0.025);

  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
  camera.position.set(0, 1.2, 5.5);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffeedd, 0.8);
  scene.add(ambientLight);

  const spot1 = new THREE.SpotLight(0xf59e0b, 3.5, 15, Math.PI / 4, 0.5);
  spot1.position.set(3, 6, 4);
  scene.add(spot1);

  const spot2 = new THREE.SpotLight(0x818cf8, 2.5, 15, Math.PI / 4, 0.5);
  spot2.position.set(-3, 6, 4);
  scene.add(spot2);

  // Materials
  const goldMat = new THREE.MeshStandardMaterial({
    color: 0xfbbf24,
    metalness: 0.95,
    roughness: 0.15,
    emissive: 0x78350f,
    emissiveIntensity: 0.25,
  });

  const crystalMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    metalness: 0.1,
    roughness: 0.1,
    transmission: 0.9,
    thickness: 1.2,
    transparent: true,
    opacity: 0.95,
  });

  const podiumMat = new THREE.MeshStandardMaterial({
    color: 0x1e1b4b,
    metalness: 0.7,
    roughness: 0.3,
  });

  // Podium Base
  const podium = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 2.1, 0.6, 32), podiumMat);
  podium.position.y = -1.2;
  scene.add(podium);

  const goldRim = new THREE.Mesh(new THREE.TorusGeometry(1.82, 0.06, 16, 48), goldMat);
  goldRim.rotation.x = Math.PI / 2;
  goldRim.position.y = -0.9;
  scene.add(goldRim);

  // 3D Trophy Group
  const trophyGroup = new THREE.Group();
  trophyGroup.position.set(0, -0.4, 0);

  // Trophy Base
  const trophyBase = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.35, 0.8), goldMat);
  trophyBase.position.y = 0;
  trophyGroup.add(trophyBase);

  // Trophy Stem (Crystal pillar)
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.28, 1.2, 16), crystalMat);
  stem.position.y = 0.75;
  trophyGroup.add(stem);

  // Trophy Cup / Chalice
  const cupGeo = new THREE.CylinderGeometry(0.65, 0.2, 0.85, 24);
  const cup = new THREE.Mesh(cupGeo, goldMat);
  cup.position.y = 1.6;
  trophyGroup.add(cup);

  // Trophy Handles
  const handleGeo = new THREE.TorusGeometry(0.35, 0.05, 12, 24, Math.PI);
  const leftHandle = new THREE.Mesh(handleGeo, goldMat);
  leftHandle.position.set(-0.65, 1.6, 0);
  leftHandle.rotation.z = -Math.PI / 2;
  const rightHandle = new THREE.Mesh(handleGeo, goldMat);
  rightHandle.position.set(0.65, 1.6, 0);
  rightHandle.rotation.z = Math.PI / 2;
  trophyGroup.add(leftHandle, rightHandle);

  // Golden Star on top
  const starGeo = new THREE.OctahedronGeometry(0.3);
  const star = new THREE.Mesh(starGeo, goldMat);
  star.position.y = 2.25;
  trophyGroup.add(star);

  scene.add(trophyGroup);

  // Sparkles
  const SPARKLE_COUNT = 100;
  const sparkleGeo = new THREE.BufferGeometry();
  const sparklePos = new Float32Array(SPARKLE_COUNT * 3);
  for (let i = 0; i < SPARKLE_COUNT; i++) {
    sparklePos[i * 3 + 0] = (Math.random() - 0.5) * 5;
    sparklePos[i * 3 + 1] = (Math.random() - 0.5) * 4 + 0.5;
    sparklePos[i * 3 + 2] = (Math.random() - 0.5) * 5;
  }
  sparkleGeo.setAttribute('position', new THREE.BufferAttribute(sparklePos, 3));
  const sparkleMat = new THREE.PointsMaterial({ color: 0xfef08a, size: 0.15, transparent: true, opacity: 0.8 });
  const sparkles = new THREE.Points(sparkleGeo, sparkleMat);
  scene.add(sparkles);

  // Drag interaction
  let isDragging = false;
  let prevX = 0;

  const onPointerDown = (e: MouseEvent | TouchEvent) => {
    isDragging = true;
    prevX = 'touches' in e ? e.touches[0].clientX : e.clientX;
  };

  const onPointerMove = (e: MouseEvent | TouchEvent) => {
    if (!isDragging) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const deltaX = clientX - prevX;
    prevX = clientX;
    trophyGroup.rotation.y += deltaX * 0.01;
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

  const handleResize = () => {
    if (!container) return;
    const w = container.clientWidth;
    const h = container.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  };
  window.addEventListener('resize', handleResize);

  let animationFrameId: number;
  const clock = new THREE.Clock();

  const animate = () => {
    animationFrameId = requestAnimationFrame(animate);
    const delta = clock.getDelta();
    const elapsedTime = clock.getElapsedTime();

    if (!isDragging) {
      trophyGroup.rotation.y += delta * 0.8;
    }
    star.rotation.y += delta * 1.5;
    star.rotation.x += delta * 0.8;

    sparkleMat.opacity = 0.5 + Math.sin(elapsedTime * 4) * 0.4;

    renderer.render(scene, camera);
  };

  animate();

  return {
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
