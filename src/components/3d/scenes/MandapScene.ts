import * as THREE from 'three';

export interface MandapController {
  dispose: () => void;
}

export function createMandapScene(container: HTMLElement): MandapController {
  const width = container.clientWidth || window.innerWidth;
  const height = container.clientHeight || 500;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0f0718);
  scene.fog = new THREE.FogExp2(0x0f0718, 0.02);

  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
  camera.position.set(0, 2.0, 9.5);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  container.appendChild(renderer.domElement);

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffeedd, 1.0);
  scene.add(ambientLight);

  const mainLight = new THREE.DirectionalLight(0xfbbf24, 2.0);
  mainLight.position.set(4, 10, 8);
  scene.add(mainLight);

  // Materials
  const goldMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9, roughness: 0.2 });
  const redMat = new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.6 });
  const floorMat = new THREE.MeshStandardMaterial({ color: 0x1e1b4b, roughness: 0.5, metalness: 0.5 });
  const marigoldMat = new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.8 });

  // Mandap Stage Floor
  const stage = new THREE.Mesh(new THREE.CylinderGeometry(5.5, 6.0, 0.5, 32), floorMat);
  stage.position.y = -1.2;
  scene.add(stage);

  // Red Carpet Pathway
  const carpet = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.04, 10), redMat);
  carpet.position.set(0, -0.93, 2.5);
  scene.add(carpet);

  // Four Grand Golden Pillars
  const pillarGeo = new THREE.CylinderGeometry(0.3, 0.35, 5.5, 20);
  const pillarCoords = [
    [-3.2, 1.5, -2],
    [3.2, 1.5, -2],
    [-3.2, 1.5, 2],
    [3.2, 1.5, 2],
  ];

  pillarCoords.forEach(([x, y, z]) => {
    const pillar = new THREE.Mesh(pillarGeo, goldMat);
    pillar.position.set(x, y, z);
    scene.add(pillar);

    // Pillar Capital / Base
    const cap = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.3, 0.9), goldMat);
    cap.position.set(x, 4.3, z);
    scene.add(cap);
  });

  // Grand Mandap Roof Arch
  const roofBeam1 = new THREE.Mesh(new THREE.BoxGeometry(7.2, 0.4, 0.4), goldMat);
  roofBeam1.position.set(0, 4.3, 2);
  const roofBeam2 = new THREE.Mesh(new THREE.BoxGeometry(7.2, 0.4, 0.4), goldMat);
  roofBeam2.position.set(0, 4.3, -2);
  scene.add(roofBeam1, roofBeam2);

  // Decorative Toran Arch (Marigold flower garland)
  const toranCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-3.2, 3.8, 2.05),
    new THREE.Vector3(-1.6, 3.2, 2.05),
    new THREE.Vector3(0, 3.5, 2.05),
    new THREE.Vector3(1.6, 3.2, 2.05),
    new THREE.Vector3(3.2, 3.8, 2.05),
  ]);
  const toranGeo = new THREE.TubeGeometry(toranCurve, 32, 0.12, 8, false);
  const toran = new THREE.Mesh(toranGeo, marigoldMat);
  scene.add(toran);

  // Fairy String Lights on Roof
  const FAIRY_COUNT = 60;
  const fairyGeo = new THREE.BufferGeometry();
  const fairyPos = new Float32Array(FAIRY_COUNT * 3);
  for (let i = 0; i < FAIRY_COUNT; i++) {
    const t = i / FAIRY_COUNT;
    fairyPos[i * 3 + 0] = -3.2 + t * 6.4;
    fairyPos[i * 3 + 1] = 4.3 + (Math.random() - 0.5) * 0.4;
    fairyPos[i * 3 + 2] = (i % 2 === 0 ? 2 : -2) + (Math.random() - 0.5) * 0.2;
  }
  fairyGeo.setAttribute('position', new THREE.BufferAttribute(fairyPos, 3));
  const fairyMat = new THREE.PointsMaterial({ color: 0xfef08a, size: 0.18, transparent: true, opacity: 0.9 });
  const fairyLights = new THREE.Points(fairyGeo, fairyMat);
  scene.add(fairyLights);

  // Floating Decorative Sparkles
  const SPARKLE_COUNT = 150;
  const sparklePositions = new Float32Array(SPARKLE_COUNT * 3);
  for (let i = 0; i < SPARKLE_COUNT; i++) {
    sparklePositions[i * 3 + 0] = (Math.random() - 0.5) * 12;
    sparklePositions[i * 3 + 1] = Math.random() * 6;
    sparklePositions[i * 3 + 2] = (Math.random() - 0.5) * 10;
  }
  const sparkleGeo = new THREE.BufferGeometry();
  sparkleGeo.setAttribute('position', new THREE.BufferAttribute(sparklePositions, 3));
  const sparkleMat = new THREE.PointsMaterial({ color: 0xfbbf24, size: 0.12, transparent: true, opacity: 0.7 });
  const sparkles = new THREE.Points(sparkleGeo, sparkleMat);
  scene.add(sparkles);

  // Touch / Mouse Orbit
  let isDragging = false;
  let prevX = 0;
  let prevY = 0;
  let camRotY = 0;
  let camRotX = 0;

  const onPointerDown = (e: MouseEvent | TouchEvent) => {
    isDragging = true;
    prevX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    prevY = 'touches' in e ? e.touches[0].clientY : e.clientY;
  };

  const onPointerMove = (e: MouseEvent | TouchEvent) => {
    if (!isDragging) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const deltaX = clientX - prevX;
    const deltaY = clientY - prevY;
    prevX = clientX;
    prevY = clientY;

    camRotY += deltaX * 0.005;
    camRotX = Math.max(-0.2, Math.min(0.5, camRotX + deltaY * 0.003));

    const radius = 9.5;
    camera.position.x = Math.sin(camRotY) * radius;
    camera.position.z = Math.cos(camRotY) * radius;
    camera.position.y = 2.0 + camRotX * 4.0;
    camera.lookAt(0, 1.5, 0);
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
    camera.updateProjectionMatrix;
    renderer.setSize(w, h);
  };
  window.addEventListener('resize', handleResize);

  let animationFrameId: number;
  const clock = new THREE.Clock();

  const animate = () => {
    animationFrameId = requestAnimationFrame(animate);
    const elapsedTime = clock.getElapsedTime();

    // Auto rotate slowly if not dragging
    if (!isDragging) {
      camRotY += 0.0015;
      const radius = 9.5;
      camera.position.x = Math.sin(camRotY) * radius;
      camera.position.z = Math.cos(camRotY) * radius;
      camera.position.y = 2.0 + camRotX * 4.0;
      camera.lookAt(0, 1.5, 0);
    }

    // Fairy light twinkle
    fairyMat.opacity = 0.65 + Math.sin(elapsedTime * 6) * 0.35;

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
